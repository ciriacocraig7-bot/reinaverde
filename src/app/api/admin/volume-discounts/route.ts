/**
 * /api/admin/volume-discounts
 * GET / PUT (bulk replace).
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRoles } from "@/lib/auth/require-role";

export const maxDuration = 15;

const rowSchema = z.object({
  minGuests: z.number().int().min(1).max(100_000),
  discountPercent: z.number().min(0).max(0.5),
  isActive: z.boolean().default(true),
});

const putSchema = z.object({ tiers: z.array(rowSchema).max(20) });

export async function GET(request: NextRequest) {
  const auth = requireRoles(request, ["ADMIN", "CHEF", "FINANZAS"]);
  if (auth instanceof NextResponse) return auth;
  const rows = await prisma.volumeDiscount.findMany({ orderBy: { minGuests: "asc" } });
  return NextResponse.json({
    tiers: rows.map((r) => ({
      id: r.id,
      minGuests: r.minGuests,
      discountPercent: Number(r.discountPercent),
      isActive: r.isActive,
    })),
  });
}

export async function PUT(request: NextRequest) {
  const auth = requireRoles(request, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;
  const raw = await request.json().catch(() => null);
  const parsed = putSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  // Estrategia: borrar todo y recrear (atómico vía transacción)
  await prisma.$transaction([
    prisma.volumeDiscount.deleteMany({}),
    prisma.volumeDiscount.createMany({ data: parsed.data.tiers }),
  ]);
  return NextResponse.json({ ok: true, count: parsed.data.tiers.length });
}
