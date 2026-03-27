import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { createShopOrderSchema } from "@/lib/validators/shop";
import { generateOrderNumber, calculateTax } from "@/lib/utils";

const SHIPPING_THRESHOLD = 150000;
const SHIPPING_COST = 12000;

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Token inválido" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const businessLine = searchParams.get("businessLine");

    const where: Record<string, unknown> = payload.role === "ADMIN" ? {} : { userId: payload.userId };
    if (businessLine === "CANABICO" || businessLine === "LIOFILIZADOS") {
      where.businessLine = businessLine;
    }

    const orders = await prisma.shopOrder.findMany({
      where,
      include: {
        items: { include: { product: { select: { name: true, image: true, icon: true } } } },
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Shop orders fetch error:", error);
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
    const validation = createShopOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Fetch products and validate
    const productIds = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true, businessLine: data.businessLine },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "Algunos productos no son válidos o no están disponibles" }, { status: 400 });
    }

    // Check stock
    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId);
      if (product && product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}` },
          { status: 400 }
        );
      }
    }

    // Calculate prices
    const itemsWithPrices = data.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const unitPrice = Number(product.price);
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
      };
    });

    const subtotal = itemsWithPrices.reduce((sum, i) => sum + i.totalPrice, 0);
    const tax = calculateTax(subtotal);
    const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const total = subtotal + tax + shipping;

    // Create order + decrement stock in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Decrement stock
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return tx.shopOrder.create({
        data: {
          orderNumber: generateOrderNumber(),
          businessLine: data.businessLine,
          userId: payload.userId,
          subtotal,
          tax,
          shipping,
          total,
          shippingName: data.shippingName,
          shippingAddress: data.shippingAddress,
          shippingCity: data.shippingCity,
          shippingPhone: data.shippingPhone,
          shippingNotes: data.shippingNotes,
          paymentProvider: data.paymentProvider || "WOMPI",
          items: { create: itemsWithPrices },
        },
        include: {
          items: { include: { product: { select: { name: true, image: true, icon: true } } } },
        },
      });
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Shop order create error:", error);
    return NextResponse.json({ error: "Error al crear pedido" }, { status: 500 });
  }
}
