/**
 * POST /api/admin/products/bulk
 *
 * Body: { ids: string[], action: "pause"|"resume"|"tag"|"untag"|"delete"|"moveCategory"|"feature"|"unfeature", payload?: any }
 *
 * Acceso: ADMIN. Transaccional. Devuelve el count afectado.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRoles } from "@/lib/auth/require-role";

export const maxDuration = 30;

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("pause"),     ids: z.array(z.string()).min(1).max(500) }),
  z.object({ action: z.literal("resume"),    ids: z.array(z.string()).min(1).max(500) }),
  z.object({ action: z.literal("delete"),    ids: z.array(z.string()).min(1).max(500) }),
  z.object({ action: z.literal("feature"),   ids: z.array(z.string()).min(1).max(500) }),
  z.object({ action: z.literal("unfeature"), ids: z.array(z.string()).min(1).max(500) }),
  z.object({
    action: z.literal("tag"),
    ids: z.array(z.string()).min(1).max(500),
    payload: z.object({ tag: z.string().min(1).max(40) }),
  }),
  z.object({
    action: z.literal("untag"),
    ids: z.array(z.string()).min(1).max(500),
    payload: z.object({ tag: z.string().min(1).max(40) }),
  }),
  z.object({
    action: z.literal("moveCategory"),
    ids: z.array(z.string()).min(1).max(500),
    payload: z.object({ categoryId: z.string().min(1) }),
  }),
]);

export async function POST(request: NextRequest) {
  const auth = requireRoles(request, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;

  const raw = await request.json().catch(() => null);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  switch (data.action) {
    case "pause": {
      const r = await prisma.product.updateMany({
        where: { id: { in: data.ids } },
        data: { isActive: false },
      });
      return NextResponse.json({ affected: r.count });
    }
    case "resume": {
      const r = await prisma.product.updateMany({
        where: { id: { in: data.ids } },
        data: { isActive: true },
      });
      return NextResponse.json({ affected: r.count });
    }
    case "delete": {
      // Soft delete por defecto (mantiene historial). Hard delete sería destructivo.
      const r = await prisma.product.updateMany({
        where: { id: { in: data.ids } },
        data: { isActive: false },
      });
      return NextResponse.json({ affected: r.count, mode: "soft" });
    }
    case "feature": {
      const r = await prisma.product.updateMany({
        where: { id: { in: data.ids } },
        data: { isFeatured: true },
      });
      return NextResponse.json({ affected: r.count });
    }
    case "unfeature": {
      const r = await prisma.product.updateMany({
        where: { id: { in: data.ids } },
        data: { isFeatured: false },
      });
      return NextResponse.json({ affected: r.count });
    }
    case "moveCategory": {
      const r = await prisma.product.updateMany({
        where: { id: { in: data.ids } },
        data: { categoryId: data.payload.categoryId },
      });
      return NextResponse.json({ affected: r.count });
    }
    case "tag":
    case "untag": {
      // updateMany no permite manipular arrays — toca uno por uno en transacción.
      const tag = data.payload.tag;
      const adding = data.action === "tag";
      const products = await prisma.product.findMany({
        where: { id: { in: data.ids } },
        select: { id: true, tags: true },
      });
      const ops = products.map((p) => {
        const current = new Set(p.tags ?? []);
        if (adding) current.add(tag);
        else current.delete(tag);
        return prisma.product.update({
          where: { id: p.id },
          data: { tags: [...current] },
        });
      });
      await prisma.$transaction(ops);
      return NextResponse.json({ affected: products.length });
    }
  }
}
