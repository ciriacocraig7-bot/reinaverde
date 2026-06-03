"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  DashHeader,
  Panel,
  ActionBtn,
  DataTable,
  StatusPill,
} from "@/components/dashboard/primitives";
import { formatCurrency } from "@/lib/utils";

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  category: string | null;
  costPerUnit: number;
  yieldPercent: number;
  stock: number;
  minStock: number;
}

const CATEGORIES = [
  "Proteína",
  "Lácteo",
  "Vegetal",
  "Fruta",
  "Grano",
  "Especia",
  "Otro",
];

export default function IngredientesPage() {
  const [items, setItems] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    unit: "g",
    category: "Vegetal",
    costPerUnit: 0,
    yieldPercent: 0.95,
  });

  const refresh = () =>
    fetch("/api/admin/ingredients")
      .then((r) => r.json())
      .then((d) => setItems(d.ingredients ?? []))
      .catch((e) => toast.error(e.message));

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const onCreate = async () => {
    if (!draft.name.trim()) return toast.error("Falta el nombre");
    if (draft.costPerUnit <= 0) return toast.error("Costo debe ser > 0");
    try {
      const res = await fetch("/api/admin/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Ingrediente agregado");
      setShowNew(false);
      setDraft({ name: "", unit: "g", category: "Vegetal", costPerUnit: 0, yieldPercent: 0.95 });
      refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("¿Desactivar este ingrediente? No aparecerá más en el selector.")) return;
    const res = await fetch(`/api/admin/ingredients/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Ingrediente desactivado");
      refresh();
    } else toast.error("Error desactivando");
  };

  return (
    <>
      <DashHeader
        eyebrow="§ Catálogo · Insumos"
        title={
          <>
            <span className="italic">Ingredientes</span>
            <span className="text-marigold">.</span>
          </>
        }
      >
        <ActionBtn variant="marigold" onClick={() => setShowNew(!showNew)}>
          {showNew ? "Cerrar" : "+ Nuevo ingrediente"}
        </ActionBtn>
      </DashHeader>

      {showNew && (
        <Panel index="00" title="Nuevo ingrediente">
          <div className="grid sm:grid-cols-5 gap-4 px-6 py-5">
            <Field label="Nombre">
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className={INPUT_CLASS}
                placeholder="Ej. Salmón ahumado"
              />
            </Field>
            <Field label="Unidad">
              <select
                value={draft.unit}
                onChange={(e) => setDraft({ ...draft, unit: e.target.value })}
                className={INPUT_CLASS}
              >
                {["g", "kg", "ml", "L", "u"].map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Categoría">
              <select
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                className={INPUT_CLASS}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Costo COP / unidad">
              <input
                type="number"
                min={0}
                step="0.01"
                value={draft.costPerUnit}
                onChange={(e) => setDraft({ ...draft, costPerUnit: Number(e.target.value) })}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Rendimiento (1 − merma)">
              <input
                type="number"
                min={0.1}
                max={1}
                step="0.01"
                value={draft.yieldPercent}
                onChange={(e) =>
                  setDraft({ ...draft, yieldPercent: Number(e.target.value) })
                }
                className={INPUT_CLASS}
              />
            </Field>
            <div className="sm:col-span-5 flex justify-end">
              <ActionBtn variant="ink" onClick={onCreate}>
                Guardar
              </ActionBtn>
            </div>
          </div>
        </Panel>
      )}

      <Panel index="01" title="Despensa" meta={`${items.length} activos`}>
        {loading ? (
          <div className="px-6 py-12 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55 text-center">
            Cargando…
          </div>
        ) : (
          <DataTable
            columns={[
              { key: "name", label: "Ingrediente" },
              { key: "cat", label: "Categoría" },
              { key: "cost", label: "Costo unitario", align: "right" },
              { key: "yield", label: "Rendimiento", align: "right" },
              { key: "stock", label: "Stock", align: "right" },
              { key: "acts", label: "" },
            ]}
          >
            {items.map((it) => (
              <tr key={it.id}>
                <td className="px-6 py-4 font-display text-lg text-ink">{it.name}</td>
                <td className="px-6 py-4">
                  <StatusPill tone="muted" label={it.category ?? "—"} />
                </td>
                <td className="px-6 py-4 text-right font-display text-base tabular text-ink">
                  {formatCurrency(it.costPerUnit)} / {it.unit}
                </td>
                <td className="px-6 py-4 text-right font-mono text-[12px] tabular text-ink/70">
                  {Math.round(it.yieldPercent * 100)}%
                </td>
                <td className="px-6 py-4 text-right font-mono text-[12px] tabular text-ink/70">
                  {it.stock} {it.unit}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onDelete(it.id)}
                    className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-persimmon hover:text-ink"
                  >
                    Desactivar
                  </button>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>
    </>
  );
}

const INPUT_CLASS =
  "w-full h-10 px-3 border border-ink/20 bg-cream font-sans text-[14px] text-ink focus:outline-none focus:border-ink";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
