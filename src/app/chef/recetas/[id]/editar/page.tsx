"use client";

import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { DashHeader } from "@/components/dashboard/primitives";
import { RecipeForm, type RecipeFormInitial } from "@/components/catering/recipe-form";

export default function EditarRecetaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [initial, setInitial] = useState<RecipeFormInitial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/recipes/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        const r = d.recipe;
        setInitial({
          id: r.id,
          categoryId: r.categoryId,
          name: r.name,
          description: r.description ?? "",
          momentType: r.momentType ?? undefined,
          servingSize: r.servingSize ?? "",
          laborMinutes: r.laborMinutes,
          difficultyFactor: r.difficultyFactor,
          targetMarginPercent: r.targetMarginPercent,
          isVegetarian: r.isVegetarian,
          isVegan: r.isVegan,
          isGlutenFree: r.isGlutenFree,
          ingredients: r.ingredients.map((i: { ingredientId: string; quantity: number }) => ({
            ingredientId: i.ingredientId,
            quantity: i.quantity,
          })),
        });
      })
      .catch((e) => toast.error(`Error: ${e.message}`))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <>
      <DashHeader
        eyebrow="§ Catálogo · Editar"
        title={
          <>
            Editar <span className="italic">receta</span>
            <span className="text-marigold">.</span>
          </>
        }
      />
      {loading || !initial ? (
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55 py-12">
          Cargando receta…
        </p>
      ) : (
        <RecipeForm mode="edit" initial={initial} />
      )}
    </>
  );
}
