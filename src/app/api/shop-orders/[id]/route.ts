import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { updateShopOrderStatusSchema } from "@/lib/validators/shop";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

    const { id } = await params;
    const order = await prisma.shopOrder.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
      },
    });

    if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });

    if (payload.role !== "ADMIN" && order.userId !== payload.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Shop order fetch error:", error);
    return NextResponse.json({ error: "Error al obtener pedido" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Solo administradores pueden actualizar pedidos" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateShopOrderStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;
    const updateData: Record<string, unknown> = { status: data.status };

    if (data.trackingNumber) updateData.trackingNumber = data.trackingNumber;
    if (data.status === "SHIPPED") updateData.shippedAt = new Date();
    if (data.status === "DELIVERED") updateData.deliveredAt = new Date();

    const order = await prisma.shopOrder.update({
      where: { id },
      data: updateData,
      include: {
        items: { include: { product: { select: { name: true, image: true, icon: true } } } },
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Shop order update error:", error);
    return NextResponse.json({ error: "Error al actualizar pedido" }, { status: 500 });
  }
}
