import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { readSession } from "@/lib/auth/cookies";
import { updateProductSchema } from "@/lib/validators/shop";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json({ error: "Error al obtener producto" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = readSession(request);
    if (!payload) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Solo administradores pueden editar productos" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateProductSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data: validation.data,
      include: { category: true },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = readSession(request);
    if (!payload) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Solo administradores pueden eliminar productos" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Producto desactivado" });
  } catch (error) {
    console.error("Product delete error:", error);
    return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 });
  }
}
