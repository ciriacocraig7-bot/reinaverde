"use client";

import { DashHeader } from "@/components/dashboard/primitives";
import { RecipeForm } from "@/components/catering/recipe-form";

export default function NuevaRecetaPage() {
  return (
    <>
      <DashHeader
        eyebrow="§ Catálogo · Diseñador"
        title={
          <>
            Nueva <span className="italic">receta</span>
            <span className="text-marigold">.</span>
          </>
        }
      />
      <RecipeForm mode="create" />
    </>
  );
}
