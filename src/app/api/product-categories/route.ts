import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { createCategorySchema } from "@/lib/validators/shop";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessLine = searchParams.get("businessLine");

    const where: Record<string, unknown> = { isActive: true };
    if (businessLine === "CANABICO" || businessLine === "LIOFILIZADOS") {
      where.businessLine = businessLine;
    }

    const categories = await prisma.productCategory.findMany({
      where,
      include: { products: { where: { isActive: true }, select: { id: true } } },
      orderBy: { sortOrder: "asc" },
    });

    const result = categories.map((c) => ({
      ...c,
      productCount: c.products.length,
      products: undefined,
    }));

    return NextResponse.json({ categories: result });
  } catch (error) {
    console.error("Categories fetch error:", error);
    return NextResponse.json({ error: "Error al obtener categorías" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Solo administradores pueden crear categorías" }, { status: 403 });
    }

    const body = await request.json();
    const validation = createCategorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;
    const category = await prisma.productCategory.create({
      data: {
        businessLine: data.businessLine,
        name: data.name,
        slug: data.slug,
        description: data.description,
        icon: data.icon,
        image: data.image,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Category create error:", error);
    return NextResponse.json({ error: "Error al crear categoría" }, { status: 500 });
  }
}
