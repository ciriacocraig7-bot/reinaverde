/**
 * /api/admin/ingredients
 * GET   — lista (paginable por ahora simple: todos los activos)
 * POST  — crea uno nuevo
 *
 * Acceso: ADMIN | CHEF.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRoles } from "@/lib/auth/require-role";

export const maxDuration = 15;

const createSchema = z.object({
  name: z.string().min(1).max(120),
  unit: z.string().min(1).max(20),
  costPerUnit: z.number().positive(),
  yieldPercent: z.number().min(0.1).max(1).default(0.95),
  category: z.string().max(40).optional(),
  stock: z.number().min(0).default(0),
  minStock: z.number().min(0).default(0),
  supplierId: z.string().min(1).optional(),
});

export async function GET(request: NextRequest) {
  const auth = requireRoles(request, ["ADMIN", "CHEF"]);
  if (auth instanceof NextResponse) return auth;

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim();
  const category = url.searchParams.get("category")?.trim();

  const items = await prisma.ingredient.findMany({
    where: {
      isActive: true,
      ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
      ...(category ? { category } : {}),
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    take: 500,
  });
  return NextResponse.json({
    ingredients: items.map((i) => ({
      id: i.id,
      name: i.name,
      unit: i.unit,
      category: i.category,
      costPerUnit: Number(i.costPerUnit),
      yieldPercent: Number(i.yieldPercent),
      stock: Number(i.stock),
      minStock: Number(i.minStock),
      supplierId: i.supplierId,
    })),
  });
}

export async function POST(request: NextRequest) {
  const auth = requireRoles(request, ["ADMIN", "CHEF"]);
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
  const created = await prisma.ingredient.create({
    data: {
      name: data.name,
      unit: data.unit,
      costPerUnit: data.costPerUnit,
      yieldPercent: data.yieldPercent,
      category: data.category ?? null,
      stock: data.stock,
      minStock: data.minStock,
      supplierId: data.supplierId ?? null,
    },
  });
  return NextResponse.json({
    ingredient: {
      id: created.id,
      name: created.name,
      unit: created.unit,
      category: created.category,
      costPerUnit: Number(created.costPerUnit),
      yieldPercent: Number(created.yieldPercent),
    },
  });
}
