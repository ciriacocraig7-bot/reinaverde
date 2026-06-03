/**
 * POST /api/catering/quotes/:id/pay-bold
 *
 * Convierte una Quote en Order + Payment(PENDING), genera la firma Bold,
 * y devuelve la BoldConfig consumible por <BoldPaymentButton>.
 *
 * Diseño:
 *  · Idempotente — si la Quote ya tiene Order asociada, reusa la firma
 *    existente (no crea Order duplicada).
 *  · Soporta guest (no requiere sesión). El user dueño de la Quote ya fue
 *    creado al persistirla.
 *  · El webhook Bold (`/api/webhooks/bold`) marca Order.status="PAID" y
 *    Quote.status="PAID" cuando llega APPROVED.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { generateIntegritySignature } from "@/lib/bold/button";
import { QuoteStatus } from "@/generated/prisma/enums";

export const maxDuration = 15;

const BOLD_API_KEY = process.env.NEXT_PUBLIC_BOLD_API_KEY || "";

interface QuoteItemJson {
  menuItemId: string;
  quantity: number;
  customizations?: {
    notes?: string;
  };
}

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id: quoteId } = await context.params;
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        order: { include: { payments: { where: { provider: "BOLD" }, take: 1 } } },
        user: { select: { email: true, firstName: true, lastName: true, phone: true } },
      },
    });
    if (!quote) {
      return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });
    }
    if (quote.status === QuoteStatus.PAID || quote.status === QuoteStatus.CONVERTED) {
      return NextResponse.json(
        { error: "Esta cotización ya fue pagada o convertida." },
        { status: 409 },
      );
    }
    if (quote.expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "Esta cotización expiró. Crea una nueva." },
        { status: 410 },
      );
    }

    const totalCop = Math.round(Number(quote.total));
    const itemsJson = quote.itemsJson as unknown as QuoteItemJson[];
    if (!Array.isArray(itemsJson) || itemsJson.length === 0) {
      return NextResponse.json({ error: "Cotización sin items" }, { status: 400 });
    }

    // Materializar precios unitarios desde MenuItem.basePrice — son los precios
    // base "catálogo". El subtotal de la Order es informativo; la realidad
    // tributaria está en el snapshot de la Quote (Quote.total = lo que paga).
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: itemsJson.map((i) => i.menuItemId) } },
    });
    const menuMap = new Map(menuItems.map((m) => [m.id, m]));
    const orderItems = itemsJson.map((i) => {
      const m = menuMap.get(i.menuItemId);
      if (!m) {
        throw new Error(`MenuItem ${i.menuItemId} ya no existe`);
      }
      const unit = Number(m.basePrice);
      return {
        menuItemId: m.id,
        quantity: i.quantity,
        unitPrice: unit,
        totalPrice: unit * i.quantity,
        customNotes: i.customizations?.notes ?? null,
      };
    });

    // ── Idempotencia: si ya hay Order asociada, devolver la BoldConfig ──
    let orderRow: { id: string; orderNumber: string } | null = quote.order
      ? { id: quote.order.id, orderNumber: quote.order.orderNumber }
      : null;
    let boldReference: string;
    if (orderRow && quote.order?.payments[0]?.boldReference) {
      boldReference = quote.order.payments[0].boldReference;
    } else {
      // Crear Order + Payment en transacción
      const orderNumber = generateOrderNumber();
      boldReference = `CAT-${orderNumber}`;

      const created = await prisma.$transaction(async (tx) => {
        const ord = await tx.order.create({
          data: {
            orderNumber,
            userId: quote.userId,
            quoteId: quote.id,
            status: "PAYMENT_PENDING",
            subtotal: quote.subtotal,
            tax:
              Number(quote.vatAmount) +
              Number(quote.icaAmount) +
              Number(quote.incAmount) +
              Number(quote.simpleAmount),
            discount: quote.volumeDiscountAmount,
            total: quote.total,
            guestCount: quote.guestCount,
            deliveryDate: quote.eventDate,
            deliveryTime: quote.eventTime,
            deliveryAddress: quote.eventAddress,
            deliveryCity: quote.eventCity,
            notes: quote.notes,
            dietaryNotes: quote.dietaryNotes,
            items: { create: orderItems },
          },
        });
        await tx.payment.create({
          data: {
            orderId: ord.id,
            provider: "BOLD",
            boldReference,
            amount: totalCop,
            currency: "COP",
            status: "PENDING",
            metadata: {
              quoteId: quote.id,
              quoteNumber: quote.quoteNumber,
              eventCity: quote.eventCity,
            },
          },
        });
        await tx.quote.update({
          where: { id: quote.id },
          data: { status: QuoteStatus.PAYMENT_PENDING },
        });
        return ord;
      });
      orderRow = { id: created.id, orderNumber: created.orderNumber };
    }

    // ── Bold config ────────────────────────────────────────────────
    const integritySignature = generateIntegritySignature(
      boldReference,
      totalCop,
      "COP",
    );
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    return NextResponse.json({
      quoteId: quote.id,
      quoteNumber: quote.quoteNumber,
      internalOrderId: orderRow!.id,
      apiKey: BOLD_API_KEY,
      amount: totalCop,
      currency: "COP",
      orderId: boldReference,
      integritySignature,
      description: `Catering · Cotización ${quote.quoteNumber}`.slice(0, 100),
      tax:
        Number(quote.vatAmount) > 0
          ? `vat-19`
          : Number(quote.incAmount) > 0
            ? `iac-8`
            : undefined,
      redirectionUrl: `${baseUrl}/catering/cotizar/confirmacion?quote=${quote.id}`,
      customerData: {
        email: quote.user.email,
        fullName: `${quote.user.firstName} ${quote.user.lastName}`.trim(),
        phone: quote.user.phone ?? "",
        dialCode: "+57",
      },
      billingAddress: {
        address: quote.eventAddress,
        city: quote.eventCity,
        country: "CO",
      },
    });
  } catch (error) {
    console.error("pay-bold quote error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error al iniciar pago Bold",
      },
      { status: 500 },
    );
  }
}
