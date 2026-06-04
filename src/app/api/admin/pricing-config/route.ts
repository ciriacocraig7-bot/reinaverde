/**
 * /api/admin/pricing-config
 * GET    — devuelve el singleton 'default'.
 * PATCH  — actualiza campos. Sólo ADMIN.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRoles } from "@/lib/auth/require-role";
import { TaxRegime } from "@/generated/prisma/enums";

export const maxDuration = 15;

const patchSchema = z.object({
  taxRegime: z.enum(TaxRegime).optional(),
  vatRate: z.number().min(0).max(0.5).optional(),
  simpleRate: z.number().min(0).max(0.2).optional(),
  incRate: z.number().min(0).max(0.2).optional(),
  laborCostPerHour: z.number().min(0).max(500_000).optional(),
  laborBenefitFactor: z.number().min(1).max(3).optional(),
  cifPercent: z.number().min(0).max(0.5).optional(),
  transportBase: z.number().min(0).max(10_000_000).optional(),
  transportPerKm: z.number().min(0).max(100_000).optional(),
  defaultMarginPercent: z.number().min(0).max(0.85).optional(),
  defaultPackagingMarkupPercent: z.number().min(0).max(0.5).optional(),
  reteFuenteRateDeclarante: z.number().min(0).max(0.2).optional(),
  reteFuenteRateNoDeclarante: z.number().min(0).max(0.2).optional(),
  reteIvaRate: z.number().min(0).max(0.5).optional(),
});

function toJson(c: Awaited<ReturnType<typeof prisma.pricingConfig.findUnique>>) {
  if (!c) return null;
  return {
    id: c.id,
    taxRegime: c.taxRegime,
    vatRate: Number(c.vatRate),
    simpleRate: Number(c.simpleRate),
    incRate: Number(c.incRate),
    laborCostPerHour: Number(c.laborCostPerHour),
    laborBenefitFactor: Number(c.laborBenefitFactor),
    cifPercent: Number(c.cifPercent),
    transportBase: Number(c.transportBase),
    transportPerKm: Number(c.transportPerKm),
    defaultMarginPercent: Number(c.defaultMarginPercent),
    defaultPackagingMarkupPercent: Number(c.defaultPackagingMarkupPercent),
    reteFuenteRateDeclarante: Number(c.reteFuenteRateDeclarante),
    reteFuenteRateNoDeclarante: Number(c.reteFuenteRateNoDeclarante),
    reteIvaRate: Number(c.reteIvaRate),
    updatedAt: c.updatedAt.toISOString(),
    updatedBy: c.updatedBy,
  };
}

export async function GET(request: NextRequest) {
  const auth = requireRoles(request, ["ADMIN", "CHEF", "FINANZAS"]);
  if (auth instanceof NextResponse) return auth;
  const cfg = await prisma.pricingConfig.findUnique({ where: { id: "default" } });
  return NextResponse.json({ config: toJson(cfg) });
}

export async function PATCH(request: NextRequest) {
  const auth = requireRoles(request, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;

  const raw = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const upd = await prisma.pricingConfig.upsert({
    where: { id: "default" },
    create: { id: "default", ...parsed.data, updatedBy: auth.userId },
    update: { ...parsed.data, updatedBy: auth.userId },
  });
  return NextResponse.json({ config: toJson(upd) });
}
