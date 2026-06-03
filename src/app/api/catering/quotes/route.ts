/**
 * POST /api/catering/quotes
 *
 * Crea una Quote persistente desde el wizard. Soporta dos modos:
 *  · Autenticado — usa session.userId.
 *  · Guest — recibe `guest: { email, firstName, lastName, phone? }` y crea
 *    un user pendiente (`isActive=false`, `passwordHash=""`). Después del
 *    pago Bold se activa por el webhook (igual que pharma/liofilizados).
 *
 * Devuelve `{ quoteId, quoteNumber, expiresAt, breakdown }` para que el
 * cliente avance al paso de pago.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculatePricing } from "@/lib/pricing/calculator";
import { buildQuote } from "@/lib/pricing/quote-builder";
import { findOrCreateGuestUser } from "@/lib/auth/guest";
import { readSession } from "@/lib/auth/cookies";
import {
  TaxRegime,
  MomentType,
  EventType,
} from "@/generated/prisma/enums";

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

const guestSchema = z.object({
  email: z.string().email().max(120),
  firstName: z.string().min(1).max(60),
  lastName: z.string().min(1).max(60),
  phone: z.string().min(7).max(20).optional(),
});

const bodySchema = z.object({
  items: z.array(itemSchema).min(1).max(20),
  city: z.string().min(1).max(60),
  guestCount: z.number().int().positive().max(5000),
  momentTypes: z.array(z.enum(MomentType)).optional(),
  eventDate: z.string().min(1),
  eventTime: z.string().min(1).max(40),
  eventAddress: z.string().min(1).max(280),
  eventType: z.enum(EventType).optional(),
  notes: z.string().max(1000).optional(),
  dietaryNotes: z.string().max(1000).optional(),
  overrideTaxRegime: z.enum(TaxRegime).optional(),
  overrideMarginPercent: z.number().min(0).max(0.85).optional(),
  clientIsDeclarante: z.boolean().optional(),
  guest: guestSchema.optional(),
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

    // ─── 1. Resolver userId (session o guest) ──────────────────────
    const session = readSession(request);
    let userId: string;
    if (session) {
      userId = session.userId;
    } else if (data.guest) {
      const g = await findOrCreateGuestUser({
        email: data.guest.email,
        firstName: data.guest.firstName,
        lastName: data.guest.lastName,
        phone: data.guest.phone,
      });
      userId = g.userId;
    } else {
      return NextResponse.json(
        {
          error:
            "Debes iniciar sesión o proveer datos de invitado (guest.email/firstName/lastName)",
        },
        { status: 401 },
      );
    }

    const eventDate = new Date(data.eventDate);
    if (Number.isNaN(eventDate.getTime())) {
      return NextResponse.json({ error: "eventDate inválido" }, { status: 400 });
    }

    // ─── 2. Calcular pricing ───────────────────────────────────────
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

    // Sanidad: monto mínimo para Bold
    if (breakdown.total < 1000) {
      return NextResponse.json(
        { error: "El monto mínimo para cotizar es $1.000 COP" },
        { status: 400 },
      );
    }

    // ─── 3. Persistir Quote ────────────────────────────────────────
    const quote = await buildQuote({
      userId,
      input: {
        items: data.items,
        city: data.city,
        guestCount: data.guestCount,
        momentTypes: data.momentTypes,
        eventDate,
        overrideTaxRegime: data.overrideTaxRegime,
        overrideMarginPercent: data.overrideMarginPercent,
        clientIsDeclarante: data.clientIsDeclarante,
        eventType: data.eventType,
      },
      breakdown,
      eventTime: data.eventTime,
      eventAddress: data.eventAddress,
      notes: data.notes,
      dietaryNotes: data.dietaryNotes,
    });

    return NextResponse.json({
      quoteId: quote.id,
      quoteNumber: quote.quoteNumber,
      expiresAt: quote.expiresAt.toISOString(),
      breakdown,
    });
  } catch (error) {
    console.error("POST /api/catering/quotes error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error creando la cotización",
      },
      { status: 500 },
    );
  }
}
