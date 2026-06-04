/**
 * /api/admin/products/[id]
 *  GET    → detalle completo
 *  PATCH  → actualiza
 *  DELETE → soft (isActive=false)
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRoles } from "@/lib/auth/require-role";
import { BusinessLine } from "@/generated/prisma/enums";

export const maxDuration = 30;

const patchSchema = z.object({
  businessLine: z.enum(BusinessLine).optional(),
  categoryId: z.string().min(1).optional(),
  name: z.string().min(1).max(180).optional(),
  slug: z.string().min(1).max(180).optional(),
  description: z.string().max(8000).nullable().optional(),
  shortDesc: z.string().max(400).nullable().optional(),
  image: z.string().max(800).nullable().optional(),
  images: z.array(z.string().max(800)).max(20).optional(),
  icon: z.string().max(60).nullable().optional(),
  price: z.number().positive().optional(),
  comparePrice: z.number().positive().nullable().optional(),
  sku: z.string().max(60).nullable().optional(),
  weight: z.string().max(40).nullable().optional(),
  unit: z.string().max(20).nullable().optional(),
  stock: z.number().int().min(0).optional(),
  lowStock: z.number().int().min(0).optional(),
  tags: z.array(z.string().max(40)).max(20).optional(),
  badge: z.string().max(40).nullable().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = requireRoles(request, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;
  const { id } = await context.params;
  const p = await prisma.product.findUnique({
    where: { id },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
  if (!p) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  return NextResponse.json({
    product: {
      id: p.id,
      businessLine: p.businessLine,
      categoryId: p.categoryId,
      categoryName: p.category.name,
      name: p.name,
      slug: p.slug,
      description: p.description,
      shortDesc: p.shortDesc,
      image: p.image,
      images: p.images,
      icon: p.icon,
      price: Number(p.price),
      comparePrice: p.comparePrice != null ? Number(p.comparePrice) : null,
      sku: p.sku,
      weight: p.weight,
      unit: p.unit,
      stock: p.stock,
      lowStock: p.lowStock,
      tags: p.tags,
      badge: p.badge,
      isFeatured: p.isFeatured,
      isActive: p.isActive,
      metadata: p.metadata,
    },
  });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = requireRoles(request, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;
  const { id } = await context.params;
  const raw = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  try {
    await prisma.product.update({
      where: { id },
      data: parsed.data as object,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if ((err as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
    throw err;
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = requireRoles(request, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;
  const { id } = await context.params;
  try {
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if ((err as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
    throw err;
  }
}
