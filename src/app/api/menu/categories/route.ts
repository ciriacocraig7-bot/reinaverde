/**
 * GET /api/menu/categories
 *
 * Lista pública de MenuCategory activas. La usa el wizard cliente para
 * mostrar los 6 momentos y el editor del chef para asignar categoría a
 * una nueva receta.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const maxDuration = 15;

export async function GET() {
  const cats = await prisma.menuCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({
    categories: cats.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      sortOrder: c.sortOrder,
    })),
  });
}
