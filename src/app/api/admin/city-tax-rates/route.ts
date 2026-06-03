/**
 * /api/admin/city-tax-rates
 * GET   — lista todas.
 * PUT   — bulk upsert: recibe array de { city, icaRate, reteIcaRate, transportSurcharge, isActive }
 *         y reemplaza por city. Solo ADMIN.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRoles } from "@/lib/auth/require-role";

export const maxDuration = 15;

const rowSchema = z.object({
  city: z.string().min(1).max(60),
  icaRate: z.number().min(0).max(0.05),
  reteIcaRate: z.number().min(0).max(0.05),
  transportSurcharge: z.number().min(0).max(2_000_000),
  isActive: z.boolean().default(true),
});

const putSchema = z.object({
  rates: z.array(rowSchema).min(1).max(40),
});

export async function GET(request: NextRequest) {
  const auth = requireRoles(request, ["ADMIN", "CHEF", "FINANZAS"]);
  if (auth instanceof NextResponse) return auth;
  const rows = await prisma.cityTaxRate.findMany({ orderBy: { city: "asc" } });
  return NextResponse.json({
    rates: rows.map((r) => ({
      id: r.id,
      city: r.city,
      icaRate: Number(r.icaRate),
      reteIcaRate: Number(r.reteIcaRate),
      transportSurcharge: Number(r.transportSurcharge),
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
  // Upsert por city
  for (const r of parsed.data.rates) {
    await prisma.cityTaxRate.upsert({
      where: { city: r.city },
      create: r,
      update: r,
    });
  }
  return NextResponse.json({ ok: true, count: parsed.data.rates.length });
}
