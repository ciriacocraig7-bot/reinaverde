import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { readSession } from "@/lib/auth/cookies";
import { generateIntegritySignature } from "@/lib/bold/button";

const BOLD_API_KEY = process.env.NEXT_PUBLIC_BOLD_API_KEY || "";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = readSession(request);
    if (!payload) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch order with user details
    const order = await prisma.shopOrder.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, firstName: true, lastName: true, phone: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    // Verify ownership
    if (order.userId !== payload.userId && payload.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Check order can be paid
    if (order.status !== "PENDING" && order.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Este pedido no se puede pagar en su estado actual" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const businessSlug = order.businessLine === "PHARMA" ? "pharma" : "liofilizados";
    
    // Amount in cents (sin decimales para Bold)
    const amount = Math.round(Number(order.total));
    
    // Generate order reference for Bold
    const boldOrderId = `BOLD-${order.orderNumber}`;

    // Generate integrity signature
    const integritySignature = generateIntegritySignature(
      boldOrderId,
      amount,
      "COP"
    );

    // Update order with Bold reference
    await prisma.shopOrder.update({
      where: { id },
      data: {
        paymentProvider: "BOLD",
        boldReference: boldOrderId,
      },
    });

    // Product description
    const description = order.items.length === 1 
      ? order.items[0].product.name 
      : `${order.items.length} productos - Reina Verde`;

    return NextResponse.json({
      apiKey: BOLD_API_KEY,
      amount,
      currency: "COP",
      orderId: boldOrderId,
      integritySignature,
      description: description.slice(0, 100), // Max 100 chars
      tax: "vat-19", // IVA 19%
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
      { status: 500 }
    );
  }
}
