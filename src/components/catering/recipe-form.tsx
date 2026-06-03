"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Panel, ActionBtn } from "@/components/dashboard/primitives";

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  category: string | null;
  costPerUnit: number;
  yieldPercent: number;
}

interface Category {
  id: string;
  name: string;
}

interface PricingConfig {
  laborCostPerHour: number;
  laborBenefitFactor: number;
  cifPercent: number;
  defaultMarginPercent: number;
}

const MOMENTS = [
  { code: "DBR", label: "Desayuno · brunch" },
  { code: "RFG", label: "Refrigerio · snack" },
  { code: "ALM", label: "Almuerzo premium" },
  { code: "GAL", label: "Cena de gala" },
  { code: "MEX", label: "Mesa de experiencia" },
  { code: "COC", label: "Coctelería" },
] as const;

const DIFFICULTY = [
  { value: 1.0, label: "Estándar (1.0×)" },
  { value: 1.2, label: "Compleja (1.2×)" },
  { value: 1.4, label: "Avanzada (1.4×)" },
  { value: 1.6, label: "Chef execute (1.6×)" },
] as const;

export interface RecipeFormInitial {
  id?: string;
  categoryId?: string;
  name?: string;
  description?: string;
  momentType?: string;
  servingSize?: string;
  laborMinutes?: number;
  difficultyFactor?: number;
  targetMarginPercent?: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  ingredients?: Array<{ ingredientId: string; quantity: number }>;
}

interface Props {
  mode: "create" | "edit";
  initial?: RecipeFormInitial;
}

export function RecipeForm({ mode, initial }: Props) {
  const router = useRouter();

  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [config, setConfig] = useState<PricingConfig | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [momentType, setMomentType] = useState(initial?.momentType ?? "ALM");
  const [servingSize, setServingSize] = useState(initial?.servingSize ?? "");
  const [laborMinutes, setLaborMinutes] = useState(initial?.laborMinutes ?? 15);
  const [difficultyFactor, setDifficultyFactor] = useState(
    initial?.difficultyFactor ?? 1.0,
  );
  const [marginPercent, setMarginPercent] = useState(
    initial?.targetMarginPercent ?? 0.40,
  );
  const [isVegetarian, setIsVegetarian] = useState(initial?.isVegetarian ?? false);
  const [isVegan, setIsVegan] = useState(initial?.isVegan ?? false);
  const [isGlutenFree, setIsGlutenFree] = useState(initial?.isGlutenFree ?? false);

  const [ingredientLines, setIngredientLines] = useState<
    Array<{ ingredientId: string; quantity: number }>
  >(initial?.ingredients ?? []);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/ingredients").then((r) => r.json()),
      fetch("/api/menu/categories").then((r) => r.json()),
      fetch("/api/admin/pricing-config").then((r) => r.json()),
    ])
      .then(([i, c, cfg]) => {
        setAllIngredients(i.ingredients ?? []);
        setCategories(c.categories ?? []);
        if (cfg.config) {
          setConfig({
            laborCostPerHour: cfg.config.laborCostPerHour,
            laborBenefitFactor: cfg.config.laborBenefitFactor,
            cifPercent: cfg.config.cifPercent,
            defaultMarginPercent: cfg.config.defaultMarginPercent,
          });
        }
        if (!initial?.categoryId && c.categories?.[0]) {
          setCategoryId(c.categories[0].id);
        }
      })
      .catch((e) => toast.error(`Error inicializando: ${e.message}`));
  }, [initial?.categoryId]);

  const ingMap = useMemo(
    () => new Map(allIngredients.map((i) => [i.id, i])),
    [allIngredients],
  );

  // ─── Cálculo live de costo + sugerencia de precio ─────────
  const liveCost = useMemo(() => {
    if (!config) return null;
    let cmp = 0;
    for (const line of ingredientLines) {
      const ing = ingMap.get(line.ingredientId);
      if (!ing) continue;
      const y = ing.yieldPercent || 1;
      cmp += (line.quantity / y) * ing.costPerUnit;
    }
    const cmo =
      (laborMinutes / 60) *
      config.laborCostPerHour *
      config.laborBenefitFactor *
      difficultyFactor;
    const cif = cmp * config.cifPercent;
    const cost = cmp + cmo + cif;
    const safeMargin = Math.max(0, Math.min(0.85, marginPercent));
    const price = cost / Math.max(0.01, 1 - safeMargin);
    return {
      cmp,
      cmo,
      cif,
      cost,
      price,
      margin: price - cost,
    };
  }, [ingredientLines, ingMap, config, laborMinutes, difficultyFactor, marginPercent]);

  // ─── Handlers ─────────────────────────────────────────────
  const addIngredient = (ingId: string) => {
    if (!ingId) return;
    if (ingredientLines.some((l) => l.ingredientId === ingId)) {
      toast.info("Ese ingrediente ya está en la receta");
      return;
    }
    setIngredientLines([...ingredientLines, { ingredientId: ingId, quantity: 50 }]);
  };

  const updateQty = (id: string, qty: number) => {
    setIngredientLines((prev) =>
      prev.map((l) => (l.ingredientId === id ? { ...l, quantity: qty } : l)),
    );
  };

  const removeLine = (id: string) => {
    setIngredientLines((prev) => prev.filter((l) => l.ingredientId !== id));
  };

  const onSave = async () => {
    if (!name.trim()) return toast.error("Falta el nombre");
    if (!categoryId) return toast.error("Falta la categoría");
    if (ingredientLines.length === 0)
      return toast.error("Agrega al menos un ingrediente");

    setSaving(true);
    try {
      const body = {
        name,
        description,
        categoryId,
        momentType: momentType || undefined,
        servingSize: servingSize || undefined,
        laborMinutes,
        difficultyFactor,
        targetMarginPercent: marginPercent,
        isVegetarian,
        isVegan,
        isGlutenFree,
        ingredients: ingredientLines,
      };

      const url =
        mode === "edit"
          ? `/api/admin/recipes/${initial?.id}`
          : "/api/admin/recipes";
      const method = mode === "edit" ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error guardando");
      toast.success(mode === "edit" ? "Receta actualizada" : "Receta creada");
      router.push("/chef/recetas");
    } catch (e) {
      toast.error(`Error: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  // ─── UI ───────────────────────────────────────────────────
  return (
    <div className="grid xl:grid-cols-[1fr_380px] gap-6">
      <div className="space-y-6">
        <Panel index="01" title="Datos básicos">
          <div className="grid sm:grid-cols-2 gap-4 px-6 py-5">
            <Field label="Nombre del plato">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={INPUT_CLASS}
                placeholder="Ej. Bowl quinoa premium"
              />
            </Field>
            <Field label="Categoría / momento">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={INPUT_CLASS}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tipo de momento (filtro catálogo)">
              <select
                value={momentType}
                onChange={(e) => setMomentType(e.target.value)}
                className={INPUT_CLASS}
              >
                {MOMENTS.map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Presentación">
              <input
                value={servingSize}
                onChange={(e) => setServingSize(e.target.value)}
                className={INPUT_CLASS}
                placeholder="Ej. Bowl 320g · Plato 380g"
              />
            </Field>
            <Field label="Descripción" className="sm:col-span-2">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={INPUT_CLASS + " min-h-[88px]"}
                placeholder="Texto que el cliente verá en el catálogo."
              />
            </Field>
            <div className="sm:col-span-2 flex flex-wrap gap-3 mt-2">
              <Tag checked={isVegetarian} onChange={setIsVegetarian} label="Vegetariano" />
              <Tag checked={isVegan} onChange={setIsVegan} label="Vegano" />
              <Tag checked={isGlutenFree} onChange={setIsGlutenFree} label="Sin gluten" />
            </div>
          </div>
        </Panel>

        <Panel
          index="02"
          title="Ingredientes y costos"
          meta={`${ingredientLines.length} en la receta`}
        >
          <div className="px-6 py-5 space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <Field label="Agregar ingrediente">
                <select
                  defaultValue=""
                  onChange={(e) => {
                    addIngredient(e.target.value);
                    e.currentTarget.value = "";
                  }}
                  className={INPUT_CLASS + " min-w-[260px]"}
                >
                  <option value="">— elegir un ingrediente —</option>
                  {allIngredients
                    .filter((i) => !ingredientLines.some((l) => l.ingredientId === i.id))
                    .map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} · {formatCurrency(i.costPerUnit)} / {i.unit} (
                        {i.category ?? "—"})
                      </option>
                    ))}
                </select>
              </Field>
            </div>
            {ingredientLines.length === 0 ? (
              <p className="text-sm text-ink/55 font-mono uppercase tracking-[0.18em] py-4">
                Selecciona ingredientes para construir la receta.
              </p>
            ) : (
              <ul className="divide-y divide-ink/10 border-t border-b border-ink/15">
                {ingredientLines.map((line) => {
                  const ing = ingMap.get(line.ingredientId);
                  if (!ing) return null;
                  const lineCost = (line.quantity / (ing.yieldPercent || 1)) * ing.costPerUnit;
                  return (
                    <li
                      key={line.ingredientId}
                      className="grid grid-cols-12 items-center gap-2 py-3"
                    >
                      <div className="col-span-5">
                        <p className="font-display text-base text-ink leading-tight">
                          {ing.name}
                        </p>
                        <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/55">
                          {ing.category ?? "—"} · {formatCurrency(ing.costPerUnit)}/
                          {ing.unit} · rinde {Math.round(ing.yieldPercent * 100)}%
                        </p>
                      </div>
                      <div className="col-span-3 flex items-baseline gap-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={line.quantity}
                          onChange={(e) =>
                            updateQty(line.ingredientId, Number(e.target.value))
                          }
                          className={INPUT_CLASS + " text-right"}
                        />
                        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink/65">
                          {ing.unit}
                        </span>
                      </div>
                      <div className="col-span-3 text-right font-display text-base tabular text-ink">
                        {formatCurrency(Math.round(lineCost))}
                      </div>
                      <div className="col-span-1 text-right">
                        <button
                          onClick={() => removeLine(line.ingredientId)}
                          className="font-mono text-[10px] uppercase tracking-[0.18em] text-persimmon hover:text-ink"
                        >
                          Quitar
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Panel>

        <Panel index="03" title="Mano de obra y margen">
          <div className="grid sm:grid-cols-3 gap-4 px-6 py-5">
            <Field label="Minutos de preparación">
              <input
                type="number"
                min={0}
                max={360}
                value={laborMinutes}
                onChange={(e) => setLaborMinutes(Math.max(0, Number(e.target.value)))}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Dificultad">
              <select
                value={difficultyFactor}
                onChange={(e) => setDifficultyFactor(Number(e.target.value))}
                className={INPUT_CLASS}
              >
                {DIFFICULTY.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={`Margen objetivo · ${(marginPercent * 100).toFixed(0)}%`}>
              <input
                type="range"
                min={0.20}
                max={0.70}
                step={0.01}
                value={marginPercent}
                onChange={(e) => setMarginPercent(Number(e.target.value))}
                className="w-full accent-marigold-deep"
              />
            </Field>
          </div>
        </Panel>

        <div className="flex justify-end gap-3 pt-2">
          <ActionBtn
            variant="outline"
            onClick={() => router.push("/chef/recetas")}
            disabled={saving}
          >
            Cancelar
          </ActionBtn>
          <ActionBtn variant="ink" onClick={onSave} disabled={saving}>
            {saving ? "Guardando…" : mode === "edit" ? "Guardar cambios" : "Publicar receta"}
          </ActionBtn>
        </div>
      </div>

      {/* Sidebar live breakdown */}
      <aside className="space-y-4">
        <div className="sticky top-6">
          <div className="border border-ink/15 bg-cream-warm p-6">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-marigold-deep mb-1">
              § Desglose en vivo
            </p>
            <h3 className="font-display text-2xl text-ink leading-tight mb-4">
              Costeo por porción
            </h3>

            {!liveCost ? (
              <p className="text-sm text-ink/55">Cargando configuración…</p>
            ) : (
              <>
                <Line label="Materia prima (CMP)" value={liveCost.cmp} />
                <Line label="Mano de obra (CMO × 1.6 prestacional)" value={liveCost.cmo} />
                <Line label="Costos indirectos (CIF)" value={liveCost.cif} />
                <div className="border-t border-ink/15 mt-3 pt-3">
                  <Line label="Costo total" value={liveCost.cost} bold />
                  <Line
                    label={`Margen (${(marginPercent * 100).toFixed(0)}%)`}
                    value={liveCost.margin}
                  />
                </div>
                <div className="bg-ink text-cream p-4 mt-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cream/65">
                    Precio sugerido por persona
                  </p>
                  <p className="font-display text-3xl tabular mt-1">
                    {formatCurrency(Math.round(liveCost.price))}
                  </p>
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55 mt-4 leading-relaxed">
                  Este precio NO incluye IVA / ICA / retenciones. El motor de
                  cotización los suma según la ciudad y el régimen del evento.
                </p>
              </>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

// ─── UI helpers ─────────────────────────────────────────────

const INPUT_CLASS =
  "w-full h-10 px-3 border border-ink/20 bg-cream font-sans text-[14px] text-ink focus:outline-none focus:border-ink";

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="block font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

function Tag({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={
        "px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] border transition-colors " +
        (checked
          ? "bg-ink text-cream border-ink"
          : "bg-cream text-ink/70 border-ink/30 hover:border-ink")
      }
    >
      {label}
    </button>
  );
}

function Line({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className="flex items-baseline justify-between py-1">
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink/65">
        {label}
      </span>
      <span
        className={
          "font-display tabular text-ink " + (bold ? "text-xl" : "text-base")
        }
      >
        {formatCurrency(Math.round(value))}
      </span>
    </div>
  );
}
