/**
 * Persiste una Quote a partir de un PricingInput + el PricingBreakdown ya
 * calculado por calculatePricing. Genera quoteNumber con formato QUO-YYMM-NNNN.
 *
 * Vida útil: 30 días (configurable). El cliente puede compartir el link
 * y pagar más tarde mientras la Quote esté en DRAFT/SENT.
 */
import { prisma } from "@/lib/db/prisma";
import { QuoteStatus, Prisma } from "@/generated/prisma/client";
import type { PricingInput, PricingBreakdown } from "./types";

const QUOTE_TTL_DAYS = 30;

function pad(n: number, width: number) {
  return String(n).padStart(width, "0");
}

/**
 * Genera un quoteNumber tipo "QUO-2606-0001" — único, monotónico por mes.
 * Usa SELECT COUNT + 1; no es transaccional perfecto pero las colisiones son
 * extremadamente raras (sólo si dos requests cuasi-simultáneas). Si pasa,
 * el constraint UNIQUE en quoteNumber producirá un error y el handler reintenta.
 */
export async function generateQuoteNumber(): Promise<string> {
  const now = new Date();
  const yy = pad(now.getUTCFullYear() % 100, 2);
  const mm = pad(now.getUTCMonth() + 1, 2);
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const monthEnd = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  );
  const count = await prisma.quote.count({
    where: { createdAt: { gte: monthStart, lt: monthEnd } },
  });
  return `QUO-${yy}${mm}-${pad(count + 1, 4)}`;
}

export interface BuildQuoteOptions {
  userId: string;
  input: PricingInput;
  breakdown: PricingBreakdown;
  eventTime: string;
  eventAddress: string;
  notes?: string;
  dietaryNotes?: string;
}

export async function buildQuote(opts: BuildQuoteOptions) {
  const { userId, input, breakdown } = opts;
  const expiresAt = new Date(Date.now() + QUOTE_TTL_DAYS * 24 * 60 * 60 * 1000);

  let quoteNumber = await generateQuoteNumber();
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const quote = await prisma.quote.create({
        data: {
          quoteNumber,
          userId,
          status: QuoteStatus.SENT,
          eventType: input.eventType ?? null,
          momentTypes: input.momentTypes ?? [],
          guestCount: input.guestCount,
          eventDate: input.eventDate,
          eventTime: opts.eventTime,
          eventCity: input.city,
          eventAddress: opts.eventAddress,
          itemsJson: input.items as unknown as Prisma.InputJsonValue,
          cmpTotal: breakdown.cmpTotal,
          cmoTotal: breakdown.cmoTotal,
          cifTotal: breakdown.cifTotal,
          transportTotal: breakdown.transportTotal,
          costTotal: breakdown.costTotal,
          marginAmount: breakdown.marginAmount,
          subtotal: breakdown.subtotal,
          volumeDiscountAmount: breakdown.volumeDiscount.amount,
          seasonalAdjustment: breakdown.seasonal.amount,
          taxableBase: breakdown.taxableBase,
          vatAmount: breakdown.vat.amount,
          incAmount: breakdown.inc.amount,
          icaAmount: breakdown.ica.amount,
          simpleAmount: breakdown.simple.amount,
          total: breakdown.total,
          reteFuenteAmount: breakdown.retentions.reteFuente.amount,
          reteIvaAmount: breakdown.retentions.reteIva.amount,
          reteIcaAmount: breakdown.retentions.reteIca.amount,
          netReceivable: breakdown.netReceivable,
          pricingConfigSnapshot:
            breakdown.pricingConfigSnapshot as unknown as Prisma.InputJsonValue,
          expiresAt,
          notes: opts.notes ?? null,
          dietaryNotes: opts.dietaryNotes ?? null,
        },
      });
      return quote;
    } catch (err) {
      // P2002 (unique constraint violation) → reintentar con nuevo número
      const code = (err as { code?: string }).code;
      if (code === "P2002" && attempt < 4) {
        quoteNumber = await generateQuoteNumber();
        continue;
      }
      throw err;
    }
  }
  throw new Error("No se pudo asignar un quoteNumber único tras 5 intentos");
}
