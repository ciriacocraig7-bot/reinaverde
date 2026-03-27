import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { createProductSchema } from "@/lib/validators/shop";
import { slugify } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessLine = searchParams.get("businessLine");
    const categorySlug = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("q");

    const where: Record<string, unknown> = { isActive: true };

    if (businessLine === "PHARMA" || businessLine === "LIOFILIZADOS") {
      where.businessLine = businessLine;
    }
    if (categorySlug) {
      where.category = { slug: categorySlug };
    }
    if (featured === "true") {
      where.isFeatured = true;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search.toLowerCase() } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true, icon: true } },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Solo administradores pueden crear productos" }, { status: 403 });
    }

    const body = await request.json();
    const validation = createProductSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const data = validation.data;

    const product = await prisma.product.create({
      data: {
        businessLine: data.businessLine,
        categoryId: data.categoryId,
        name: data.name,
        slug: data.slug || slugify(data.name),
        description: data.description,
        shortDesc: data.shortDesc,
        image: data.image,
        images: data.images || [],
        icon: data.icon,
        price: data.price,
        comparePrice: data.comparePrice,
        sku: data.sku,
        weight: data.weight,
        unit: data.unit,
        stock: data.stock ?? 0,
        lowStock: data.lowStock ?? 5,
        tags: data.tags || [],
        badge: data.badge,
        isFeatured: data.isFeatured ?? false,
      },
      include: { category: true },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Product create error:", error);
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 });
  }
}
