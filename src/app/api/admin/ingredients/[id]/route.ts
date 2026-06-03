/**
 * /api/admin/ingredients/:id
 * PATCH  — actualiza
 * DELETE — soft delete (isActive=false)
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRoles } from "@/lib/auth/require-role";

export const maxDuration = 15;

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  unit: z.string().min(1).max(20).optional(),
  costPerUnit: z.number().positive().optional(),
  yieldPercent: z.number().min(0.1).max(1).optional(),
  category: z.string().max(40).nullable().optional(),
  stock: z.number().min(0).optional(),
  minStock: z.number().min(0).optional(),
  supplierId: z.string().min(1).nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = requireRoles(request, ["ADMIN", "CHEF"]);
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
    const upd = await prisma.ingredient.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ ingredient: { id: upd.id, name: upd.name } });
  } catch (err) {
    if ((err as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Ingrediente no encontrado" }, { status: 404 });
    }
    throw err;
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = requireRoles(request, ["ADMIN", "CHEF"]);
  if (auth instanceof NextResponse) return auth;

  const { id } = await context.params;
  try {
    await prisma.ingredient.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if ((err as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Ingrediente no encontrado" }, { status: 404 });
    }
    throw err;
  }
}
