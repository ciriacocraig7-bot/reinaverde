import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { readSession } from "@/lib/auth/cookies";
import { generateIntegritySignature } from "@/lib/bold/button";
import { generateOrderNumber, calculateTax } from "@/lib/utils";

const BOLD_API_KEY = process.env.NEXT_PUBLIC_BOLD_API_KEY || "";

const itemSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.number().int().positive(),
});

const bodySchema = z.object({
  // Cart payload (full snapshot — we re-price server-side)
  items: z.array(itemSchema).min(1),
  guestCount: z.number().int().positive().default(1),
  eventType: z
    .enum(["CORPORATIVO", "BODA", "SOCIAL", "SUSCRIPCION", "PRIVADO"])
    .nullable()
    .optional(),
  deliveryDate: z.string().min(1),
  deliveryTime: z.string().min(1),
  deliveryAddress: z.string().min(1),
  deliveryCity: z.string().optional().default(""),
  notes: z.string().optional(),
  dietaryNotes: z.string().optional(),
  // Legacy fields kept for back-compat with older clients — ignored when items are present
  amount: z.number().optional(),
  reference: z.string().optional(),
  description: z.string().optional(),
});

/**
 * Catering payment — Bold.
 *
 * Now persists a real `Order` + `Payment` row before returning the button
 * config, so the webhook can match `boldReference` and update both. The
 * route requires an authenticated session (cookie or Bearer).
 */
export async function POST(request: NextRequest) {
  try {
    const session = readSession(request);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const raw = await request.json().catch(() => null);
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const data = parsed.data;

    // ─── 1. Re-price server-side ───────────────────────────────────
    const menuIds = data.items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuIds }, isActive: true },
    });
    if (menuItems.length !== menuIds.length) {
      return NextResponse.json(
        { error: "Algunos items del menú no son válidos" },
        { status: 400 },
      );
    }

    const itemsWithPrices = data.items.map((i) => {
      const m = menuItems.find((mi) => mi.id === i.menuItemId)!;
      const unitPrice = Number(m.basePrice);
      return {
        menuItemId: m.id,
        quantity: i.quantity,
        unitPrice,
        totalPrice: unitPrice * i.quantity,
      };
    });

    const subtotal = itemsWithPrices.reduce((s, x) => s + x.totalPrice, 0);
    const tax = calculateTax(subtotal);
    const total = subtotal + tax;

    if (total < 1000) {
      return NextResponse.json(
        { error: "El monto mínimo es $1.000 COP" },
        { status: 400 },
      );
    }

    // ─── 2. Create Order + Payment in a transaction ────────────────
    const orderNumber = generateOrderNumber();
    const boldOrderId = `CAT-${orderNumber}`;

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: session.userId,
          status: "PAYMENT_PENDING",
          subtotal,
          tax,
          total,
          guestCount: data.guestCount,
          deliveryDate: new Date(data.deliveryDate),
          deliveryTime: data.deliveryTime,
          deliveryAddress: data.deliveryAddress,
          deliveryCity: data.deliveryCity,
          notes: data.notes,
          dietaryNotes: data.dietaryNotes,
          items: { create: itemsWithPrices },
        },
      });
      await tx.payment.create({
        data: {
          orderId: created.id,
          provider: "BOLD",
          boldReference: boldOrderId,
          amount: total,
          currency: "COP",
          status: "PENDING",
          metadata: { eventType: data.eventType ?? null },
        },
      });
      return created;
    });

    // ─── 3. Build Bold config ──────────────────────────────────────
    const amount = Math.round(total);
    const integritySignature = generateIntegritySignature(boldOrderId, amount, "COP");
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const description = data.description || `Catering #${orderNumber}`;

    return NextResponse.json({
      internalOrderId: order.id,
      apiKey: BOLD_API_KEY,
      amount,
      currency: "COP",
      orderId: boldOrderId, // Bold expects "orderId" as the merchant reference
      integritySignature,
      description: description.slice(0, 100),
      tax: "vat-19",
      redirectionUrl: `${baseUrl}/catering/orden/confirmacion?order=${order.id}`,
      customerData: {
        email: "",
        fullName: "",
        phone: "",
        dialCode: "+57",
      },
      billingAddress: {
        address: data.deliveryAddress,
        city: data.deliveryCity,
        country: "CO",
      },
    });
  } catch (error) {
    console.error("Catering Bold config error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al configurar pago Bold" },
      { status: 500 },
    );
  }
}
