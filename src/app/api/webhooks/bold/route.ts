import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { mapBoldWebhookStatus } from "@/lib/bold/button";
import { verifyBoldSignature } from "@/lib/bold/webhook";

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
      if (target === "shop") {
        await prisma.shopOrder.update({
          where: { id: shopOrder!.id },
          data: {
            status: "PAID",
            boldTransactionId: incomingTxId,
            paymentMethod: method,
            paidAt: new Date(),
          },
        });
      } else {
        await prisma.$transaction([
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
          }),
        ]);
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
