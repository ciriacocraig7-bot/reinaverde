"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  DashHeader,
  Panel,
  StatusPill,
  ActionBtn,
  DataTable,
} from "@/components/dashboard/primitives";
import { formatCurrency } from "@/lib/utils";

interface Recipe {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  momentType: string | null;
  categoryName: string;
  basePrice: number;
  cmpEstimated: number;
  laborMinutes: number;
  targetMarginPercent: number;
  isActive: boolean;
  ingredientCount: number;
}

const MOMENT_LABEL: Record<string, string> = {
  DBR: "Desayuno · brunch",
  RFG: "Refrigerio",
  ALM: "Almuerzo",
  GAL: "Gala",
  MEX: "Mesa de experiencia",
  COC: "Coctelería",
};

export default function ChefRecetasPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/recipes")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setRecipes(d.recipes ?? []);
      })
      .catch((e) => toast.error(`Error cargando recetas: ${e.message}`))
      .finally(() => setLoading(false));
  }, []);

  const today = new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(new Date())
    .toLowerCase();

  return (
    <>
      <DashHeader
        eyebrow="§ Catálogo · Diseñador"
        title={
          <>
            <span className="italic">Recetas</span> activas
            <span className="text-marigold">.</span>
          </>
        }
        date={today}
      >
        <Link
          href="/chef/recetas/nueva"
          className="inline-flex items-center h-10 px-5 bg-marigold text-ink font-sans text-[13px] tracking-tight rv-press hover:bg-cream"
        >
          + Nueva receta
        </Link>
      </DashHeader>

      <Panel
        index="01"
        title="Catálogo de platos"
        meta={`${recipes.length} activas`}
      >
        {loading ? (
          <div className="px-6 py-16 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55">
            Cargando…
          </div>
        ) : recipes.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-display text-2xl text-ink mb-2">
              Aún no hay recetas.
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55 mb-6">
              Diseña la primera con ingredientes reales para activar el motor
              de costeo.
            </p>
            <Link
              href="/chef/recetas/nueva"
              className="inline-flex items-center h-10 px-5 bg-ink text-cream font-sans text-[13px] tracking-tight rv-press hover:bg-ink-soft"
            >
              Crear primera receta
            </Link>
          </div>
        ) : (
          <DataTable
            columns={[
              { key: "name", label: "Plato" },
              { key: "moment", label: "Momento" },
              { key: "ing", label: "Insumos", align: "right" },
              { key: "cmp", label: "CMP / pax", align: "right" },
              { key: "margin", label: "Margen objetivo", align: "right" },
              { key: "price", label: "Precio / pax", align: "right" },
              { key: "actions", label: "" },
            ]}
          >
            {recipes.map((r) => (
              <tr key={r.id} className="hover:bg-cream-warm transition-colors">
                <td className="px-6 py-4">
                  <p className="font-display text-lg text-ink leading-tight">
                    {r.name}
                  </p>
                  {r.description && (
                    <p className="font-sans text-[12px] text-ink/65 leading-snug mt-1 line-clamp-1 max-w-[40ch]">
                      {r.description}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <StatusPill
                    tone="info"
                    label={
                      r.momentType
                        ? MOMENT_LABEL[r.momentType] ?? r.momentType
                        : r.categoryName
                    }
                  />
                </td>
                <td className="px-6 py-4 text-right font-mono text-[12px] text-ink/75 tabular">
                  {r.ingredientCount}
                </td>
                <td className="px-6 py-4 text-right font-display text-lg tabular text-ink">
                  {formatCurrency(r.cmpEstimated)}
                </td>
                <td className="px-6 py-4 text-right font-mono text-[12px] text-ink/65 tabular">
                  {(r.targetMarginPercent * 100).toFixed(0)}%
                </td>
                <td className="px-6 py-4 text-right font-display text-xl tabular text-ink">
                  {formatCurrency(r.basePrice)}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/chef/recetas/${r.id}/editar`}
                    className="font-mono text-[11px] uppercase tracking-[0.18em] text-marigold-deep hover:text-ink"
                  >
                    Editar →
                  </Link>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>
    </>
  );
}
