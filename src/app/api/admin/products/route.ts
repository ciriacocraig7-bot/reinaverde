/**
 * /api/admin/products
 *  GET  → lista global con filtros businessLine, category, status, q
 *  POST → crea producto
 *
 * Acceso: ADMIN.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRoles } from "@/lib/auth/require-role";
import { BusinessLine } from "@/generated/prisma/enums";
import { slugify } from "@/lib/utils";

export const maxDuration = 30;

const createSchema = z.object({
  businessLine: z.enum(BusinessLine),
  categoryId: z.string().min(1),
  name: z.string().min(1).max(180),
  slug: z.string().min(1).max(180).optional(),
  description: z.string().max(8000).optional(),
  shortDesc: z.string().max(400).optional(),
  image: z.string().max(800).optional(),
  images: z.array(z.string().max(800)).max(20).optional(),
  icon: z.string().max(60).optional(),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  sku: z.string().max(60).optional(),
  weight: z.string().max(40).optional(),
  unit: z.string().max(20).optional(),
  stock: z.number().int().min(0).default(0),
  lowStock: z.number().int().min(0).default(5),
  tags: z.array(z.string().max(40)).max(20).optional(),
  badge: z.string().max(40).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(request: NextRequest) {
  const auth = requireRoles(request, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;

  const url = new URL(request.url);
  const businessLine = url.searchParams.get("businessLine");
  const categoryId = url.searchParams.get("category");
  const status = url.searchParams.get("status"); // "active" | "paused" | "all"
  const q = url.searchParams.get("q")?.trim();

  const where: Record<string, unknown> = {};
  if (businessLine && (Object.values(BusinessLine) as string[]).includes(businessLine)) {
    where.businessLine = businessLine;
  }
  if (categoryId) where.categoryId = categoryId;
  if (status === "active") where.isActive = true;
  if (status === "paused") where.isActive = false;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ];
  }

  const items = await prisma.product.findMany({
    where,
    orderBy: [{ businessLine: "asc" }, { name: "asc" }],
    include: { category: { select: { id: true, name: true, slug: true } } },
    take: 500,
  });

  return NextResponse.json({
    products: items.map((p) => ({
      id: p.id,
      businessLine: p.businessLine,
      categoryId: p.categoryId,
      categoryName: p.category.name,
      name: p.name,
      slug: p.slug,
      shortDesc: p.shortDesc,
      image: p.image,
      images: p.images,
      sku: p.sku,
      price: Number(p.price),
      comparePrice: p.comparePrice != null ? Number(p.comparePrice) : null,
      stock: p.stock,
      lowStock: p.lowStock,
      tags: p.tags,
      badge: p.badge,
      isFeatured: p.isFeatured,
      isActive: p.isActive,
      updatedAt: p.updatedAt.toISOString(),
    })),
  });
}

export async function POST(request: NextRequest) {
  const auth = requireRoles(request, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;

  const raw = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;
  const slug = data.slug ?? slugify(data.name);

  try {
    const created = await prisma.product.create({
      data: {
        businessLine: data.businessLine,
        categoryId: data.categoryId,
        name: data.name,
        slug,
        description: data.description ?? null,
        shortDesc: data.shortDesc ?? null,
        image: data.image ?? null,
        images: data.images ?? [],
        icon: data.icon ?? null,
        price: data.price,
        comparePrice: data.comparePrice ?? null,
        sku: data.sku ?? null,
        weight: data.weight ?? null,
        unit: data.unit ?? null,
        stock: data.stock,
        lowStock: data.lowStock,
        tags: data.tags ?? [],
        badge: data.badge ?? null,
        isFeatured: data.isFeatured ?? false,
        isActive: data.isActive ?? true,
        metadata: (data.metadata as object) ?? undefined,
      },
    });
    return NextResponse.json({ product: { id: created.id, slug: created.slug } });
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un producto con ese slug en esa línea de negocio." },
        { status: 409 },
      );
    }
    console.error("POST product error:", err);
    throw err;
  }
}
