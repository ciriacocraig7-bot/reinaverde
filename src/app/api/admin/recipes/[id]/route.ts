/**
 * /api/admin/recipes/:id
 * GET    — recupera detalle completo (ingredientes con costos) para el editor.
 * PATCH  — actualiza receta + reemplaza ingredientes en transacción.
 *          Recalcula basePrice sugerido tras el update.
 * DELETE — soft delete (isActive=false).
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

const patchSchema = z.object({
  categoryId: z.string().min(1).optional(),
  name: z.string().min(1).max(160).optional(),
  description: z.string().max(800).nullable().optional(),
  image: z.string().max(500).nullable().optional(),
  momentType: z.enum(MomentType).nullable().optional(),
  servingSize: z.string().max(80).nullable().optional(),
  laborMinutes: z.number().int().min(0).max(360).optional(),
  difficultyFactor: z.number().min(1).max(3).optional(),
  targetMarginPercent: z.number().min(0).max(0.85).optional(),
  packagingCostPerPortion: z.number().min(0).max(100000).optional(),
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  isGlutenFree: z.boolean().optional(),
  allergens: z.array(z.string()).optional(),
  ingredients: z.array(ingSchema).optional(),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = requireRoles(request, ["ADMIN", "CHEF"]);
  if (auth instanceof NextResponse) return auth;

  const { id } = await context.params;
  const recipe = await prisma.menuItem.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      ingredients: { include: { ingredient: true } },
    },
  });
  if (!recipe) {
    return NextResponse.json({ error: "Receta no encontrada" }, { status: 404 });
  }
  return NextResponse.json({
    recipe: {
      id: recipe.id,
      categoryId: recipe.categoryId,
      categoryName: recipe.category.name,
      name: recipe.name,
      description: recipe.description,
      image: recipe.image,
      momentType: recipe.momentType,
      servingSize: recipe.servingSize,
      basePrice: Number(recipe.basePrice),
      laborMinutes: recipe.laborMinutes,
      difficultyFactor: Number(recipe.difficultyFactor),
      targetMarginPercent: Number(recipe.targetMarginPercent),
      packagingCostPerPortion: Number(recipe.packagingCostPerPortion),
      isVegetarian: recipe.isVegetarian,
      isVegan: recipe.isVegan,
      isGlutenFree: recipe.isGlutenFree,
      allergens: recipe.allergens,
      isActive: recipe.isActive,
      ingredients: recipe.ingredients.map((mi) => ({
        ingredientId: mi.ingredientId,
        ingredientName: mi.ingredient.name,
        unit: mi.ingredient.unit,
        costPerUnit: Number(mi.ingredient.costPerUnit),
        yieldPercent: Number(mi.ingredient.yieldPercent),
        category: mi.ingredient.category,
        quantity: Number(mi.quantity),
      })),
    },
  });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = requireRoles(request, ["ADMIN", "CHEF"]);
  if (auth instanceof NextResponse) return auth;

  const { id } = await context.params;
  const raw = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      // Actualizar campos del MenuItem
      const { ingredients, ...fields } = data;
      await tx.menuItem.update({
        where: { id },
        data: fields,
      });
      // Si vienen ingredientes, reemplazar todos
      if (ingredients) {
        await tx.menuItemIngredient.deleteMany({ where: { menuItemId: id } });
        if (ingredients.length > 0) {
          await tx.menuItemIngredient.createMany({
            data: ingredients.map((i) => ({
              menuItemId: id,
              ingredientId: i.ingredientId,
              quantity: i.quantity,
            })),
          });
        }
      }
    });

    // Recalcular basePrice si cambió algo que afecte costo o margen
    const recipe = await prisma.menuItem.findUnique({ where: { id } });
    if (recipe) {
      const suggested = await calculateMenuItemSuggestedPrice(
        id,
        Number(recipe.targetMarginPercent),
      );
      await prisma.menuItem.update({
        where: { id },
        data: { basePrice: suggested.pricePerPerson },
      });
      return NextResponse.json({
        ok: true,
        basePrice: suggested.pricePerPerson,
        cmpPerPerson: suggested.cmpPerPerson,
      });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    if ((err as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Receta no encontrada" }, { status: 404 });
    }
    throw err;
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = requireRoles(request, ["ADMIN", "CHEF"]);
  if (auth instanceof NextResponse) return auth;

  const { id } = await context.params;
  try {
    await prisma.menuItem.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if ((err as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Receta no encontrada" }, { status: 404 });
    }
    throw err;
  }
}
