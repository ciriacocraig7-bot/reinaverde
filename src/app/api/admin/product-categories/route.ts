/**
 * /api/admin/product-categories
 *  GET  → lista por businessLine
 *  POST → crea
 * Acceso: ADMIN.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRoles } from "@/lib/auth/require-role";
import { BusinessLine } from "@/generated/prisma/enums";
import { slugify } from "@/lib/utils";

export const maxDuration = 20;

const createSchema = z.object({
  businessLine: z.enum(BusinessLine),
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(80).optional(),
  description: z.string().max(800).optional(),
  icon: z.string().max(60).optional(),
  image: z.string().max(800).optional(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  const auth = requireRoles(request, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;

  const url = new URL(request.url);
  const bl = url.searchParams.get("businessLine");
  const where: Record<string, unknown> = {};
  if (bl && (Object.values(BusinessLine) as string[]).includes(bl)) {
    where.businessLine = bl;
  }
  const rows = await prisma.productCategory.findMany({
    where,
    orderBy: [{ businessLine: "asc" }, { sortOrder: "asc" }],
  });
  return NextResponse.json({
    categories: rows.map((c) => ({
      id: c.id,
      businessLine: c.businessLine,
      name: c.name,
      slug: c.slug,
      description: c.description,
      icon: c.icon,
      image: c.image,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
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
    const created = await prisma.productCategory.create({
      data: {
        businessLine: data.businessLine,
        name: data.name,
        slug,
        description: data.description ?? null,
        icon: data.icon ?? null,
        image: data.image ?? null,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
    });
    return NextResponse.json({ category: { id: created.id, slug: created.slug } });
  } catch (err) {
    if ((err as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe una categoría con ese slug en esa línea." },
        { status: 409 },
      );
    }
    throw err;
  }
}
