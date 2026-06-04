/**
 * /api/admin/product-categories/[id]
 *  PATCH → actualiza
 *  DELETE → soft (isActive=false)
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRoles } from "@/lib/auth/require-role";

export const maxDuration = 15;

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  slug: z.string().min(1).max(80).optional(),
  description: z.string().max(800).nullable().optional(),
  icon: z.string().max(60).nullable().optional(),
  image: z.string().max(800).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

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
    await prisma.productCategory.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if ((err as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
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
    await prisma.productCategory.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if ((err as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
    }
    throw err;
  }
}
