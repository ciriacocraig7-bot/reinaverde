/**
 * /api/admin/seasonal-rates
 * GET / PUT (bulk replace).
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRoles } from "@/lib/auth/require-role";

export const maxDuration = 15;

const rowSchema = z.object({
  name: z.string().min(1).max(80),
  startMonth: z.number().int().min(1).max(12),
  startDay: z.number().int().min(1).max(31),
  endMonth: z.number().int().min(1).max(12),
  endDay: z.number().int().min(1).max(31),
  rateModifier: z.number().min(0.5).max(2),
  isActive: z.boolean().default(true),
});

const putSchema = z.object({ seasons: z.array(rowSchema).max(20) });

export async function GET(request: NextRequest) {
  const auth = requireRoles(request, ["ADMIN", "CHEF", "FINANZAS"]);
  if (auth instanceof NextResponse) return auth;
  const rows = await prisma.seasonalRate.findMany({ orderBy: { startMonth: "asc" } });
  return NextResponse.json({
    seasons: rows.map((r) => ({
      id: r.id,
      name: r.name,
      startMonth: r.startMonth,
      startDay: r.startDay,
      endMonth: r.endMonth,
      endDay: r.endDay,
      rateModifier: Number(r.rateModifier),
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
  await prisma.$transaction([
    prisma.seasonalRate.deleteMany({}),
    prisma.seasonalRate.createMany({ data: parsed.data.seasons }),
  ]);
  return NextResponse.json({ ok: true, count: parsed.data.seasons.length });
}
