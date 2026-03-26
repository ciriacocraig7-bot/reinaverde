import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const categories = await prisma.menuCategory.findMany({
      where: { isActive: true },
      include: {
        items: {
          where: { isActive: true },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Menu fetch error:", error);
    return NextResponse.json(
      { error: "Error al obtener el menú" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, image, categoryId, basePrice, isVegetarian, isVegan, isGlutenFree, allergens } = body;

    const item = await prisma.menuItem.create({
      data: {
        name,
        description,
        image,
        categoryId,
        basePrice,
        isVegetarian: isVegetarian || false,
        isVegan: isVegan || false,
        isGlutenFree: isGlutenFree || false,
        allergens: allergens || [],
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Menu create error:", error);
    return NextResponse.json(
      { error: "Error al crear item del menú" },
      { status: 500 }
    );
  }
}
