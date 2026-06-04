import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { mapBoldWebhookStatus } from "@/lib/bold/button";
import { verifyBoldSignature } from "@/lib/bold/webhook";
import { activateGuestUserAfterPayment } from "@/lib/auth/guest";
import {
  notifyChefNewCateringOrder,
  notifyClientPaymentReceived,
} from "@/lib/whatsapp/send";
import {
  sendGuestActivationEmail,
  sendOrderPaidEmail,
  sendCateringQuotePaidEmail,
  sendShopOrderPaidEmail,
} from "@/lib/email/templates";

// Bold puede tardar; cubrimos cold-start + Supabase wake.
export const maxDuration = 15;

/**
 * Bold webhook receiver.
 *
 * Design notes (System-Design v2):
 * ─ HMAC VERIFICATION: every payload must carry `x-bold-signature` matching
 *   HMAC_SHA256(rawBody, BOLD_WEBHOOK_SECRET). If `BOLD_WEBHOOK_SECRET` is
 *   unset (local dev) the check is skipped with a logged warning.
 * ─ IDEMPOTENT: we never re-process an order that's already PAID with the
 *   same transaction_id. Bold retries on non-2xx, so this prevents paidAt
 *   from being overwritten on retries.
 * ─ NO-REVERT: a late DECLINED/EXPIRED after PAID is ignored (logged).
 * ─ STRUCTURED LOGGING: one JSON line per event.
 * ─ 2xx on known events: 4xx causes Bold to keep retrying. We use 200 +
 *   explanatory body for "order not found" so it stops retrying.
 */
export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  try {
    // ─── 1. Read raw body for signature verification ───────────────
    const rawBody = await request.text();
    const sig = request.headers.get("x-bold-signature");

    const sigCheck = verifyBoldSignature(rawBody, sig);
    if (!sigCheck.valid) {
      log("bold.webhook.signature-rejected", {
        reason: sigCheck.reason,
        hasHeader: Boolean(sig),
      });
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 },
      );
    }
    if (sigCheck.reason === "no-secret-configured") {
      log("bold.webhook.signature-skipped-no-secret", {});
    }

    // ─── 2. Parse JSON ──────────────────────────────────────────────
    let body: { event?: string; data?: Record<string, unknown> };
    try {
      body = JSON.parse(rawBody);
    } catch {
      log("bold.webhook.invalid-json", { rawBodyLen: rawBody.length });
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const { event, data } = body ?? {};

    const boldOrderId = typeof data?.order_id === "string" ? data.order_id : undefined;
    const reference =
      (typeof data?.reference === "string" ? data.reference : undefined) ?? boldOrderId;
    const incomingTxId =
      (typeof data?.transaction_id === "string" ? data.transaction_id : undefined) ??
      (typeof data?.id === "string" ? data.id : undefined);

    if (!reference) {
      log("bold.webhook.invalid", { reason: "missing-reference", body });
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
    }

    // ─── 3. Lookup target ───────────────────────────────────────────
    // Shop orders (Pharma / Liofilizados) carry boldReference directly.
    // Catering pays through a Payment row that holds boldReference.
    const shopOrder = await prisma.shopOrder.findFirst({
      where: { boldReference: reference },
      select: {
        id: true,
        status: true,
        boldTransactionId: true,
        paidAt: true,
        total: true,
      },
    });

    const cateringPayment = !shopOrder
      ? await prisma.payment.findUnique({
          where: { boldReference: reference },
          select: {
            id: true,
            orderId: true,
            status: true,
            boldTransactionId: true,
            paidAt: true,
            amount: true,
          },
        })
      : null;

    if (!shopOrder && !cateringPayment) {
      log("bold.webhook.order-missing", { reference, event });
      // 200 so Bold stops retrying — neither path matched.
      return NextResponse.json(
        { received: true, status: "ORDER_NOT_FOUND" },
        { status: 200 },
      );
    }

    const order = shopOrder ?? {
      id: cateringPayment!.id, // Payment.id used for logging
      status: cateringPayment!.status === "APPROVED" ? "PAID" : "PENDING",
      boldTransactionId: cateringPayment!.boldTransactionId,
      paidAt: cateringPayment!.paidAt,
      total: cateringPayment!.amount,
    };
    const target: "shop" | "catering" = shopOrder ? "shop" : "catering";

    const mapped = mapBoldWebhookStatus(event ?? "");

    // ─── 4. Idempotency guard ──────────────────────────────────────
    if (
      mapped === "APPROVED" &&
      order.status === "PAID" &&
      (!incomingTxId || order.boldTransactionId === incomingTxId)
    ) {
      log("bold.webhook.idempotent-skip", {
        orderId: order.id,
        reference,
        existingTxId: order.boldTransactionId,
        elapsedMs: Date.now() - startedAt,
      });
      return NextResponse.json({ received: true, status: "ALREADY_PAID" });
    }

    // ─── 5. Branch by mapped status ────────────────────────────────
    const method = mapPaymentMethod(
      typeof data?.payment_method === "string" ? data.payment_method : undefined,
    );

    if (mapped === "APPROVED") {
      let userIdForEmail: string | null = null;
      let orderNumberForEmail: string | null = null;
      let totalForEmail = 0;
      // Metadata adicional para elegir la plantilla editorial correcta.
      let shopOrderIdForEmail: string | null = null;
      let shopBusinessLine: "PHARMA" | "LIOFILIZADOS" | "CATERING" | null = null;
      let cateringOrderIdForEmail: string | null = null;
      let quoteForEmail: {
        id: string;
        quoteNumber: string;
        total: number;
        eventDate: Date;
        eventCity: string;
        guestCount: number;
      } | null = null;

      if (target === "shop") {
        const updated = await prisma.shopOrder.update({
          where: { id: shopOrder!.id },
          data: {
            status: "PAID",
            boldTransactionId: incomingTxId,
            paymentMethod: method,
            paidAt: new Date(),
          },
          select: {
            id: true,
            userId: true,
            orderNumber: true,
            total: true,
            businessLine: true,
          },
        });
        userIdForEmail = updated.userId;
        orderNumberForEmail = updated.orderNumber;
        totalForEmail = Number(updated.total);
        shopOrderIdForEmail = updated.id;
        shopBusinessLine = updated.businessLine;
      } else {
        const [, ord] = await prisma.$transaction([
          prisma.payment.update({
            where: { id: cateringPayment!.id },
            data: {
              status: "APPROVED",
              boldTransactionId: incomingTxId,
              method,
              paidAt: new Date(),
            },
          }),
          prisma.order.update({
            where: { id: cateringPayment!.orderId },
            data: { status: "PAID" },
            select: {
              id: true,
              userId: true,
              orderNumber: true,
              total: true,
              quoteId: true,
            },
          }),
        ]);
        userIdForEmail = ord.userId;
        orderNumberForEmail = ord.orderNumber;
        totalForEmail = Number(ord.total);
        cateringOrderIdForEmail = ord.id;

        // Si la Order nació de una Quote (Diseñador de Producto), marcarla PAID.
        if (ord.quoteId) {
          const updatedQuote = await prisma.quote.update({
            where: { id: ord.quoteId },
            data: { status: "PAID" },
            select: {
              id: true,
              quoteNumber: true,
              total: true,
              eventDate: true,
              eventCity: true,
              guestCount: true,
            },
          });
          quoteForEmail = {
            id: updatedQuote.id,
            quoteNumber: updatedQuote.quoteNumber,
            total: Number(updatedQuote.total),
            eventDate: updatedQuote.eventDate,
            eventCity: updatedQuote.eventCity,
            guestCount: updatedQuote.guestCount,
          };
          log("bold.webhook.quote-paid", {
            quoteId: ord.quoteId,
            orderId: cateringPayment!.orderId,
          });
        }
      }

      // ─── Activación de guest + email transaccional ───────────
      // Si el user que pagó era guest (sin contraseña), lo activamos primero
      // y mandamos el email con link de activación. Después o en su lugar,
      // mandamos el email editorial específico según el tipo de orden.
      if (userIdForEmail) {
        try {
          const activation = await activateGuestUserAfterPayment(userIdForEmail);
          // 1. Email de activación (solo si el usuario es guest nuevo)
          if (activation) {
            await sendGuestActivationEmail({
              email: activation.email,
              firstName: activation.firstName,
              rawToken: activation.rawToken,
              orderNumber: orderNumberForEmail ?? undefined,
            });
            log("bold.webhook.guest-activated", {
              userId: userIdForEmail,
              email: activation.email,
              orderNumber: orderNumberForEmail,
            });
          }
          // 2. Email editorial específico de la línea
          const u = await prisma.user.findUnique({
            where: { id: userIdForEmail },
            select: { email: true, firstName: true },
          });
          if (u) {
            if (quoteForEmail) {
              // Catering · Cotización del diseñador
              await sendCateringQuotePaidEmail({
                email: u.email,
                firstName: u.firstName,
                quoteNumber: quoteForEmail.quoteNumber,
                quoteId: quoteForEmail.id,
                total: quoteForEmail.total,
                eventDate: quoteForEmail.eventDate,
                eventCity: quoteForEmail.eventCity,
                guestCount: quoteForEmail.guestCount,
              });
            } else if (target === "shop" && shopOrderIdForEmail && shopBusinessLine) {
              // Pharma / Liofilizados
              await sendShopOrderPaidEmail({
                email: u.email,
                firstName: u.firstName,
                orderNumber: orderNumberForEmail ?? "",
                orderId: shopOrderIdForEmail,
                total: totalForEmail,
                businessLine: shopBusinessLine,
              });
            } else {
              // Catering orden vieja sin Quote — usar plantilla genérica.
              await sendOrderPaidEmail({
                email: u.email,
                firstName: u.firstName,
                orderNumber: orderNumberForEmail ?? "",
                total: totalForEmail,
              });
            }
            log("bold.webhook.editorial-email-sent", {
              userId: userIdForEmail,
              email: u.email,
              kind: quoteForEmail
                ? "catering-quote"
                : target === "shop"
                  ? `shop-${shopBusinessLine}`
                  : "catering-generic",
            });

            // ─── WhatsApp notificaciones ─────────────────────
            // Obtener phone del user (si existe) para notificar cliente.
            // Notificar chef siempre (phone fijo del negocio).
            const CHEF_PHONE = process.env.WHATSAPP_CHEF_PHONE || "573147905135";
            const userFull = await prisma.user.findUnique({
              where: { id: userIdForEmail },
              select: { phone: true, firstName: true, lastName: true },
            });

            if (quoteForEmail) {
              // Catering → notificar chef
              notifyChefNewCateringOrder({
                chefPhone: CHEF_PHONE,
                orderNumber: orderNumberForEmail ?? "",
                clientName: `${userFull?.firstName ?? ""} ${userFull?.lastName ?? ""}`.trim(),
                eventCity: quoteForEmail.eventCity,
                eventDate: quoteForEmail.eventDate.toISOString().slice(0, 10),
                guestCount: quoteForEmail.guestCount,
                total: quoteForEmail.total,
              }).catch(() => {});
            }

            // Notificar cliente si tiene teléfono
            if (userFull?.phone) {
              notifyClientPaymentReceived({
                clientPhone: userFull.phone,
                clientName: userFull.firstName,
                orderNumber: orderNumberForEmail ?? "",
                total: totalForEmail,
                eventCity: quoteForEmail?.eventCity,
                eventDate: quoteForEmail
                  ? quoteForEmail.eventDate.toISOString().slice(0, 10)
                  : undefined,
              }).catch(() => {});
            }
          }
        } catch (emailErr) {
          // No bloqueamos el webhook si el email falla — el pedido está
          // pagado y eso es lo crítico. Solo logueamos.
          log("bold.webhook.email-failed", {
            error: emailErr instanceof Error ? emailErr.message : String(emailErr),
            userId: userIdForEmail,
          });
        }
      }

      log("bold.webhook.approved", {
        target,
        orderId: order.id,
        reference,
        txId: incomingTxId,
        total: order.total.toString(),
        elapsedMs: Date.now() - startedAt,
      });
      return NextResponse.json({ received: true, status: "APPROVED" });
    }

    if (mapped === "DECLINED" || mapped === "ERROR" || mapped === "EXPIRED") {
      if (order.status === "PAID") {
        log("bold.webhook.terminal-after-paid-ignored", {
          target,
          orderId: order.id,
          reference,
          event,
        });
        return NextResponse.json({ received: true, status: "IGNORED_AFTER_PAID" });
      }
      if (target === "shop") {
        await prisma.shopOrder.update({
          where: { id: shopOrder!.id },
          data: {
            status: "PENDING",
            boldTransactionId: incomingTxId ?? shopOrder!.boldTransactionId,
          },
        });
      } else {
        await prisma.payment.update({
          where: { id: cateringPayment!.id },
          data: {
            status: mapped === "DECLINED" ? "DECLINED" : "ERROR",
            boldTransactionId: incomingTxId ?? cateringPayment!.boldTransactionId,
          },
        });
      }
      log("bold.webhook.terminal-fail", {
        target,
        orderId: order.id,
        reference,
        event,
        elapsedMs: Date.now() - startedAt,
      });
      return NextResponse.json({ received: true, status: mapped });
    }

    log("bold.webhook.event-unhandled", { event, reference });
    return NextResponse.json({ received: true, status: "UNHANDLED_EVENT" });
  } catch (error) {
    log("bold.webhook.error", {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

function mapPaymentMethod(
  method: string | undefined,
): "CREDIT_CARD" | "DEBIT_CARD" | "PSE" | "NEQUI" | "CASH_ON_DELIVERY" | null {
  if (!method) return null;
  const m: Record<string, "CREDIT_CARD" | "DEBIT_CARD" | "PSE" | "NEQUI"> = {
    credit_card: "CREDIT_CARD",
    "credit-card": "CREDIT_CARD",
    card: "CREDIT_CARD",
    debit_card: "DEBIT_CARD",
    "debit-card": "DEBIT_CARD",
    pse: "PSE",
    nequi: "NEQUI",
    bancolombia: "NEQUI",
    daviplata: "NEQUI",
  };
  return m[method.toLowerCase()] ?? null;
}

function log(event: string, fields: Record<string, unknown>) {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ event, ts: new Date().toISOString(), ...fields }));
}
