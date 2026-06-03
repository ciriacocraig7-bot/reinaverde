/**
 * GET /api/menu/items?moment=ALM,DBR
 *
 * Lista pública de MenuItems activos (lo usa el wizard del cliente para
 * el catálogo). Opcionalmente filtra por momentType.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { MomentType } from "@/generated/prisma/enums";

export const maxDuration = 15;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const momentParam = url.searchParams.get("moment");
  const moments = momentParam
    ? momentParam
        .split(",")
        .map((s) => s.trim())
        .filter((s): s is MomentType =>
          (Object.values(MomentType) as string[]).includes(s),
        )
    : undefined;

  const items = await prisma.menuItem.findMany({
    where: {
      isActive: true,
      ...(moments && moments.length > 0 ? { momentType: { in: moments } } : {}),
    },
    orderBy: [{ momentType: "asc" }, { name: "asc" }],
    include: {
      category: { select: { id: true, name: true } },
    },
    take: 200,
  });

  return NextResponse.json({
    items: items.map((i) => ({
      id: i.id,
      name: i.name,
      description: i.description,
      image: i.image,
      basePrice: Number(i.basePrice),
      momentType: i.momentType,
      categoryId: i.categoryId,
      categoryName: i.category.name,
      servingSize: i.servingSize,
      isVegetarian: i.isVegetarian,
      isVegan: i.isVegan,
      isGlutenFree: i.isGlutenFree,
      allergens: i.allergens,
    })),
  });
}
