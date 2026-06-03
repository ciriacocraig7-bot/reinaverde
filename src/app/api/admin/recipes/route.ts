/**
 * /api/admin/recipes
 * GET  — lista MenuItems con CMP estimado, precio actual y margen real.
 * POST — crea MenuItem + MenuItemIngredient[] en una transacción.
 *        Recalcula basePrice sugerido a partir del CMP × margen objetivo.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRoles } from "@/lib/auth/require-role";
import { calculateMenuItemSuggestedPrice } from "@/lib/pricing/calculator";
import { MomentType } from "@/generated/prisma/enums";

export const maxDuration = 15;

const ingSchema = z.object({
  ingredientId: z.string().min(1),
  quantity: z.number().positive(),
});

const createSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1).max(160),
  description: z.string().max(800).optional(),
  image: z.string().max(500).optional(),
  momentType: z.enum(MomentType).optional(),
  servingSize: z.string().max(80).optional(),
  laborMinutes: z.number().int().min(0).max(360).default(15),
  difficultyFactor: z.number().min(1).max(3).default(1.0),
  targetMarginPercent: z.number().min(0).max(0.85).default(0.40),
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  isGlutenFree: z.boolean().optional(),
  allergens: z.array(z.string()).optional(),
  ingredients: z.array(ingSchema).min(1).max(40),
});

export async function GET(request: NextRequest) {
  const auth = requireRoles(request, ["ADMIN", "CHEF"]);
  if (auth instanceof NextResponse) return auth;

  const items = await prisma.menuItem.findMany({
    where: { isActive: true },
    orderBy: [{ momentType: "asc" }, { name: "asc" }],
    include: {
      category: { select: { id: true, name: true } },
      ingredients: {
        include: {
          ingredient: { select: { id: true, name: true, unit: true, costPerUnit: true, yieldPercent: true } },
        },
      },
    },
    take: 500,
  });

  // Calcular CMP por receta inline (sin call al calculator para evitar N queries)
  const result = items.map((it) => {
    let cmp = 0;
    for (const mi of it.ingredients) {
      const y = Number(mi.ingredient.yieldPercent) || 1;
      cmp += (Number(mi.quantity) / y) * Number(mi.ingredient.costPerUnit);
    }
    const basePrice = Number(it.basePrice);
    // Margen actual implícito = (precio - costo aproximado) / precio
    // Aquí sólo mostramos cmp por persona; el margen real lo calcula el editor.
    return {
      id: it.id,
      name: it.name,
      description: it.description,
      image: it.image,
      momentType: it.momentType,
      categoryName: it.category.name,
      basePrice,
      cmpEstimated: Math.round(cmp),
      laborMinutes: it.laborMinutes,
      targetMarginPercent: Number(it.targetMarginPercent),
      isActive: it.isActive,
      ingredientCount: it.ingredients.length,
    };
  });

  return NextResponse.json({ recipes: result });
}

export async function POST(request: NextRequest) {
  const auth = requireRoles(request, ["ADMIN", "CHEF"]);
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

  try {
    const created = await prisma.$transaction(async (tx) => {
      const recipe = await tx.menuItem.create({
        data: {
          categoryId: data.categoryId,
          name: data.name,
          description: data.description,
          image: data.image,
          basePrice: 0,
          momentType: data.momentType ?? null,
          servingSize: data.servingSize,
          laborMinutes: data.laborMinutes,
          difficultyFactor: data.difficultyFactor,
          targetMarginPercent: data.targetMarginPercent,
          isVegetarian: data.isVegetarian ?? false,
          isVegan: data.isVegan ?? false,
          isGlutenFree: data.isGlutenFree ?? false,
          allergens: data.allergens ?? [],
        },
      });
      await tx.menuItemIngredient.createMany({
        data: data.ingredients.map((i) => ({
          menuItemId: recipe.id,
          ingredientId: i.ingredientId,
          quantity: i.quantity,
        })),
      });
      return recipe;
    });

    // Recalcular basePrice sugerido
    const suggested = await calculateMenuItemSuggestedPrice(
      created.id,
      data.targetMarginPercent,
    );
    await prisma.menuItem.update({
      where: { id: created.id },
      data: { basePrice: suggested.pricePerPerson },
    });

    return NextResponse.json({
      recipe: {
        id: created.id,
        name: created.name,
        basePrice: suggested.pricePerPerson,
        cmpPerPerson: suggested.cmpPerPerson,
        cmoPerPerson: suggested.cmoPerPerson,
      },
    });
  } catch (err) {
    console.error("POST recipe error:", err);
    if ((err as { code?: string }).code === "P2003") {
      return NextResponse.json(
        { error: "Categoría o ingrediente referenciado no existe" },
        { status: 400 },
      );
    }
    throw err;
  }
}
