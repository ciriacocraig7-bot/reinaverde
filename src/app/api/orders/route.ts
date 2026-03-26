import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { createOrderSchema } from "@/lib/validators/orders";
import { generateOrderNumber, calculateTax } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

    const where = payload.role === "ADMIN" ? {} : { userId: payload.userId };

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { menuItem: true } },
        payments: true,
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json({ error: "Error al obtener pedidos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

    const body = await request.json();
    const validation = createOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    const menuItemIds = data.items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, isActive: true },
    });

    if (menuItems.length !== menuItemIds.length) {
      return NextResponse.json({ error: "Algunos items del menú no son válidos" }, { status: 400 });
    }

    const itemsWithPrices = data.items.map((item) => {
      const menuItem = menuItems.find((m: { id: string; basePrice: unknown }) => m.id === item.menuItemId)!;
      const unitPrice = Number(menuItem.basePrice);
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
        customNotes: item.customNotes,
      };
    });

    const subtotal = itemsWithPrices.reduce((sum, i) => sum + i.totalPrice, 0);
    const tax = calculateTax(subtotal);
    const total = subtotal + tax;

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: payload.userId,
        companyId: data.companyId,
        eventId: data.eventId,
        status: "QUOTED",
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
        items: {
          create: itemsWithPrices,
        },
      },
      include: {
        items: { include: { menuItem: true } },
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Order create error:", error);
    return NextResponse.json({ error: "Error al crear pedido" }, { status: 500 });
  }
}
