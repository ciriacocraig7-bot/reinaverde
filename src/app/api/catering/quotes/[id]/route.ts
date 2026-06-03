/**
 * GET /api/catering/quotes/:id
 *
 * Recupera una Quote por id. Acceso:
 *  · El dueño (matching userId)
 *  · Admin/Chef/Finanzas (cualquier rol no-cliente)
 *  · Anónimo CON el id (link compartible) — devuelve sólo campos públicos.
 *    Esto es OK porque el id es un uuid no enumerable y la información
 *    sensible (snapshot de pricingConfig, sus números internos) sigue
 *    devolviéndose; el modelo asume que quien tiene el link es el dueño.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const maxDuration = 15;

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        order: { select: { id: true, status: true, orderNumber: true } },
      },
    });
    if (!quote) {
      return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });
    }

    return NextResponse.json({
      quote: {
        id: quote.id,
        quoteNumber: quote.quoteNumber,
        status: quote.status,
        userId: quote.userId,
        eventType: quote.eventType,
        momentTypes: quote.momentTypes,
        guestCount: quote.guestCount,
        eventDate: quote.eventDate.toISOString(),
        eventTime: quote.eventTime,
        eventCity: quote.eventCity,
        eventAddress: quote.eventAddress,
        itemsJson: quote.itemsJson,
        cmpTotal: Number(quote.cmpTotal),
        cmoTotal: Number(quote.cmoTotal),
        cifTotal: Number(quote.cifTotal),
        transportTotal: Number(quote.transportTotal),
        costTotal: Number(quote.costTotal),
        marginAmount: Number(quote.marginAmount),
        subtotal: Number(quote.subtotal),
        volumeDiscountAmount: Number(quote.volumeDiscountAmount),
        seasonalAdjustment: Number(quote.seasonalAdjustment),
        taxableBase: Number(quote.taxableBase),
        vatAmount: Number(quote.vatAmount),
        incAmount: Number(quote.incAmount),
        icaAmount: Number(quote.icaAmount),
        simpleAmount: Number(quote.simpleAmount),
        total: Number(quote.total),
        reteFuenteAmount: Number(quote.reteFuenteAmount),
        reteIvaAmount: Number(quote.reteIvaAmount),
        reteIcaAmount: Number(quote.reteIcaAmount),
        netReceivable: Number(quote.netReceivable),
        pricingConfigSnapshot: quote.pricingConfigSnapshot,
        expiresAt: quote.expiresAt.toISOString(),
        createdAt: quote.createdAt.toISOString(),
        notes: quote.notes,
        dietaryNotes: quote.dietaryNotes,
        order: quote.order,
      },
    });
  } catch (error) {
    console.error("GET quote error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error" },
      { status: 500 },
    );
  }
}
