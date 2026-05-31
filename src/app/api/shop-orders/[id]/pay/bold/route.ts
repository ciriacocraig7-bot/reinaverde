import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { readSession } from "@/lib/auth/cookies";
import { generateIntegritySignature } from "@/lib/bold/button";

const BOLD_API_KEY = process.env.NEXT_PUBLIC_BOLD_API_KEY || "";

export const maxDuration = 15;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const order = await prisma.shopOrder.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            passwordHash: true,
          },
        },
        items: { include: { product: { select: { name: true } } } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    // ─── Authorización: 3 casos ─────────────────────────────────
    //  (1) ADMIN — todo OK
    //  (2) Dueño de la orden (sesión) — todo OK
    //  (3) Guest pendiente — la orden pertenece a un user con passwordHash
    //      vacío. No hay sesión real porque no han creado contraseña aún.
    //      Permitimos pagarla.
    const session = readSession(request);
    const isOwner = session && session.userId === order.userId;
    const isAdmin = session?.role === "ADMIN";
    const isGuestPending =
      !session && (!order.user.passwordHash || order.user.passwordHash.length === 0);

    if (!isOwner && !isAdmin && !isGuestPending) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    if (order.status !== "PENDING" && order.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Este pedido no se puede pagar en su estado actual" },
        { status: 400 },
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const businessSlug = order.businessLine === "PHARMA" ? "pharma" : "liofilizados";

    const amount = Math.round(Number(order.total));
    const boldOrderId = `BOLD-${order.orderNumber}`;
    const integritySignature = generateIntegritySignature(boldOrderId, amount, "COP");

    await prisma.shopOrder.update({
      where: { id },
      data: {
        paymentProvider: "BOLD",
        boldReference: boldOrderId,
      },
    });

    const description = order.items.length === 1
      ? order.items[0].product.name
      : `${order.items.length} productos - Reina Verde`;

    return NextResponse.json({
      apiKey: BOLD_API_KEY,
      amount,
      currency: "COP",
      orderId: boldOrderId,
      integritySignature,
      description: description.slice(0, 100),
      tax: "vat-19",
      redirectionUrl: `${baseUrl}/${businessSlug}/confirmacion?order=${order.id}&provider=bold`,
      customerData: {
        email: order.user.email,
        fullName: order.shippingName || `${order.user.firstName} ${order.user.lastName}`,
        phone: order.shippingPhone || order.user.phone || "",
        dialCode: "+57",
      },
      billingAddress: {
        address: order.shippingAddress,
        city: order.shippingCity,
        country: "CO",
      },
    });
  } catch (error) {
    console.error("Bold button config error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al configurar pago Bold" },
      { status: 500 },
    );
  }
}
