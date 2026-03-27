import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { createPaymentLink } from "@/lib/wompi/client";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

    const { id } = await params;
    const order = await prisma.shopOrder.findUnique({
      where: { id },
      include: { user: { select: { email: true, firstName: true, lastName: true } } },
    });

    if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    if (order.userId !== payload.userId && payload.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    if (order.status !== "PENDING" && order.status !== "CONFIRMED") {
      return NextResponse.json({ error: "Este pedido no se puede pagar en su estado actual" }, { status: 400 });
    }

    const amountInCents = Math.round(Number(order.total) * 100);
    const reference = `SHOP-${order.orderNumber}`;
    const businessSlug = order.businessLine === "CANABICO" ? "canabico" : "liofilizados";
    const redirectUrl = `${BASE_URL}/${businessSlug}/confirmacion?order=${order.id}`;

    const paymentUrl = await createPaymentLink({
      amountInCents,
      currency: "COP",
      customerEmail: order.user.email,
      reference,
      redirectUrl,
      customerData: {
        fullName: `${order.user.firstName} ${order.user.lastName}`,
        phoneNumber: order.shippingPhone,
      },
    });

    // Store reference on the order for webhook matching
    await prisma.shopOrder.update({
      where: { id },
      data: { 
        wompiReference: reference,
        paymentProvider: "WOMPI",
      },
    });

    return NextResponse.json({ paymentUrl, reference });
  } catch (error) {
    console.error("Shop payment initiation error:", error);
    return NextResponse.json({ error: "Error al iniciar pago" }, { status: 500 });
  }
}
