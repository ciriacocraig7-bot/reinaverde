"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  DashHeader,
  Panel,
  StatusPill,
} from "@/components/dashboard/primitives";
import { formatCurrency } from "@/lib/utils";

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  category: string | null;
  costPerUnit: number;
  jumboReferencePrice: number | null;
  jumboReferenceUrl: string | null;
  lastJumboCheck: string | null;
}

export default function PreciosJumboPage() {
  const [items, setItems] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, { price: string; url: string }>>({});

  const load = () =>
    fetch("/api/admin/ingredients")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.ingredients ?? []);
        const next: Record<string, { price: string; url: string }> = {};
        for (const i of d.ingredients ?? []) {
          next[i.id] = {
            price: i.jumboReferencePrice != null ? String(i.jumboReferencePrice) : "",
            url: i.jumboReferenceUrl ?? "",
          };
        }
        setDrafts(next);
      });

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const save = async (id: string) => {
    const d = drafts[id];
    if (!d) return;
    const body: Record<string, unknown> = {
      jumboReferencePrice: d.price ? Number(d.price) : null,
      jumboReferenceUrl: d.url || null,
    };
    try {
      const res = await fetch(`/api/admin/ingredients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Guardado");
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const groups = items.reduce<Record<string, Ingredient[]>>((acc, it) => {
    const cat = it.category ?? "Otro";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(it);
    return acc;
  }, {});

  return (
    <>
      <DashHeader
        eyebrow="§ Compras · Referencia"
        title={
          <>
            Precios <span className="italic">Jumbo</span>
            <span className="text-marigold">.</span>
          </>
        }
      />
      <p className="font-serif italic text-lg text-ink/70 leading-snug max-w-2xl">
        Para cada insumo de Reina Verde, registra el precio equivalente en
        Jumbo Colombia. El sistema lo compara con tu costo de compra para
        mostrar margen real en cada cotización y shopping list.
      </p>

      {loading ? (
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55 py-12">
          Cargando…
        </p>
      ) : (
        Object.entries(groups).map(([cat, list]) => (
          <Panel key={cat} index="" title={cat} meta={`${list.length} insumos`}>
            <div className="divide-y divide-ink/10">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55 bg-cream-warm">
                <span>Insumo</span>
                <span className="text-right">Nuestro costo</span>
                <span>Precio Jumbo</span>
                <span>URL Jumbo (opc.)</span>
                <span></span>
              </div>
              {list.map((it) => {
                const draft = drafts[it.id] ?? { price: "", url: "" };
                const jumboPrice = draft.price ? Number(draft.price) : null;
                const delta = jumboPrice != null ? jumboPrice - it.costPerUnit : null;
                const tone =
                  delta == null
                    ? "muted"
                    : delta > 0
                      ? "success"
                      : delta < 0
                        ? "danger"
                        : "muted";
                const deltaLabel =
                  delta == null
                    ? "Sin ref"
                    : delta > 0
                      ? `+${formatCurrency(delta)} ahorro`
                      : delta < 0
                        ? `−${formatCurrency(Math.abs(delta))} extra`
                        : "Igual";

                return (
                  <div
                    key={it.id}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 px-6 py-3 items-center"
                  >
                    <div>
                      <p className="font-display text-base text-ink leading-tight">
                        {it.name}
                      </p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
                        por {it.unit}
                        {it.lastJumboCheck && (
                          <span className="ml-2">
                            · actualizado{" "}
                            {new Date(it.lastJumboCheck).toLocaleDateString("es-CO", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right font-display tabular text-base text-ink">
                      {formatCurrency(it.costPerUnit)}
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Precio Jumbo"
                      value={draft.price}
                      onChange={(e) =>
                        setDrafts({
                          ...drafts,
                          [it.id]: { ...draft, price: e.target.value },
                        })
                      }
                      className={INPUT}
                    />
                    <input
                      type="url"
                      placeholder="URL del producto"
                      value={draft.url}
                      onChange={(e) =>
                        setDrafts({
                          ...drafts,
                          [it.id]: { ...draft, url: e.target.value },
                        })
                      }
                      className={INPUT + " text-[12px]"}
                    />
                    <div className="flex flex-col items-end gap-2">
                      <StatusPill tone={tone} label={deltaLabel} />
                      <div className="flex gap-2">
                        <a
                          href={
                            draft.url ||
                            `https://www.jumbocolombia.com/supermercado/search?query=${encodeURIComponent(it.name)}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[10px] uppercase tracking-[0.18em] text-marigold-deep hover:text-ink"
                        >
                          Abrir Jumbo →
                        </a>
                        <button
                          onClick={() => save(it.id)}
                          className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink hover:text-marigold-deep"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        ))
      )}
    </>
  );
}

const INPUT =
  "h-10 px-3 border border-ink/25 bg-cream font-sans text-[13px] text-ink focus:outline-none focus:border-ink tabular";
