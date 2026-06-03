/**
 * POST /api/catering/pricing-preview
 *
 * Pricing en vivo para el wizard: recibe los inputs del cliente y devuelve
 * el desglose completo SIN persistir nada. Útil para que el usuario explore
 * "qué pasa si" mientras ajusta variables.
 *
 * No requiere autenticación — pública. Whitelisted en src/proxy.ts.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculatePricing } from "@/lib/pricing/calculator";
import { TaxRegime, MomentType, EventType } from "@/generated/prisma/enums";

export const maxDuration = 15;

const itemSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.number().int().positive().max(5000),
  customizations: z
    .object({
      portionMultiplier: z.number().positive().max(3).optional(),
      extraIngredients: z
        .array(
          z.object({
            ingredientId: z.string().min(1),
            quantity: z.number().positive(),
          }),
        )
        .optional(),
      removedIngredientIds: z.array(z.string().min(1)).optional(),
      notes: z.string().max(500).optional(),
    })
    .optional(),
});

const bodySchema = z.object({
  items: z.array(itemSchema).min(1).max(20),
  city: z.string().min(1).max(60),
  guestCount: z.number().int().positive().max(5000),
  momentTypes: z.array(z.enum(MomentType)).optional(),
  eventDate: z.string().min(1), // ISO
  overrideTaxRegime: z.enum(TaxRegime).optional(),
  overrideMarginPercent: z.number().min(0).max(0.85).optional(),
  clientIsDeclarante: z.boolean().optional(),
  eventType: z.enum(EventType).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const data = parsed.data;

    const eventDate = new Date(data.eventDate);
    if (Number.isNaN(eventDate.getTime())) {
      return NextResponse.json({ error: "eventDate inválido" }, { status: 400 });
    }

    const breakdown = await calculatePricing({
      items: data.items,
      city: data.city,
      guestCount: data.guestCount,
      momentTypes: data.momentTypes,
      eventDate,
      overrideTaxRegime: data.overrideTaxRegime,
      overrideMarginPercent: data.overrideMarginPercent,
      clientIsDeclarante: data.clientIsDeclarante,
      eventType: data.eventType,
    });

    return NextResponse.json({ breakdown });
  } catch (error) {
    console.error("pricing-preview error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error calculando preview de pricing",
      },
      { status: 500 },
    );
  }
}
