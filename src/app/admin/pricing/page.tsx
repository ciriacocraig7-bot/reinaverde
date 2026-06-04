"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  DashHeader,
  Panel,
  ActionBtn,
  StatusPill,
} from "@/components/dashboard/primitives";
import { formatCurrency } from "@/lib/utils";

interface PricingConfig {
  taxRegime: "COMMON" | "SIMPLE";
  vatRate: number;
  simpleRate: number;
  incRate: number;
  laborCostPerHour: number;
  laborBenefitFactor: number;
  cifPercent: number;
  transportBase: number;
  transportPerKm: number;
  defaultMarginPercent: number;
  defaultPackagingMarkupPercent: number;
  reteFuenteRateDeclarante: number;
  reteFuenteRateNoDeclarante: number;
  reteIvaRate: number;
}

interface CityRate {
  id: string;
  city: string;
  icaRate: number;
  reteIcaRate: number;
  transportSurcharge: number;
  isActive: boolean;
}

interface Tier {
  id?: string;
  minGuests: number;
  discountPercent: number;
  isActive: boolean;
}

interface Season {
  id?: string;
  name: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  rateModifier: number;
  isActive: boolean;
}

export default function AdminPricingPage() {
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [cities, setCities] = useState<CityRate[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/pricing-config").then((r) => r.json()),
      fetch("/api/admin/city-tax-rates").then((r) => r.json()),
      fetch("/api/admin/volume-discounts").then((r) => r.json()),
      fetch("/api/admin/seasonal-rates").then((r) => r.json()),
    ])
      .then(([c, ct, vd, sr]) => {
        setConfig(c.config);
        setCities(ct.rates ?? []);
        setTiers(vd.tiers ?? []);
        setSeasons(sr.seasons ?? []);
      })
      .catch((e) => toast.error(`Error cargando: ${e.message}`));
  }, []);

  const saveConfig = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/pricing-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Error");
      toast.success("Configuración guardada");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const saveCities = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/city-tax-rates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rates: cities }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Error");
      toast.success("Ciudades actualizadas");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const saveTiers = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/volume-discounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tiers }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Error");
      toast.success("Descuentos por volumen guardados");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const saveSeasons = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/seasonal-rates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seasons }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Error");
      toast.success("Temporadas guardadas");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!config) {
    return (
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55 py-12">
        Cargando configuración…
      </p>
    );
  }

  return (
    <>
      <DashHeader
        eyebrow="§ Configuración · Precios"
        title={
          <>
            Precios y <span className="italic">tarifas</span>
            <span className="text-marigold">.</span>
          </>
        }
      />

      <div className="grid xl:grid-cols-2 gap-6">
        {/* Régimen tributario */}
        <Panel index="01" title="Régimen tributario" meta={config.taxRegime}>
          <div className="px-6 py-5 space-y-4">
            <div className="flex gap-3">
              <button
                onClick={() => setConfig({ ...config, taxRegime: "COMMON" })}
                className={
                  "flex-1 p-4 border text-left transition-colors " +
                  (config.taxRegime === "COMMON"
                    ? "bg-ink text-cream border-ink"
                    : "bg-cream border-ink/20 hover:border-ink")
                }
              >
                <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] block mb-1 opacity-70">
                  Régimen común
                </span>
                <span className="font-display text-lg">IVA 19% + ICA</span>
              </button>
              <button
                onClick={() => setConfig({ ...config, taxRegime: "SIMPLE" })}
                className={
                  "flex-1 p-4 border text-left transition-colors " +
                  (config.taxRegime === "SIMPLE"
                    ? "bg-ink text-cream border-ink"
                    : "bg-cream border-ink/20 hover:border-ink")
                }
              >
                <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] block mb-1 opacity-70">
                  Régimen simple (RST)
                </span>
                <span className="font-display text-lg">Tarifa única ~5.4%</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <PercentField
                label="IVA"
                value={config.vatRate}
                onChange={(v) => setConfig({ ...config, vatRate: v })}
              />
              <PercentField
                label="RST"
                value={config.simpleRate}
                onChange={(v) => setConfig({ ...config, simpleRate: v })}
              />
              <PercentField
                label="ReteFuente declarante"
                value={config.reteFuenteRateDeclarante}
                onChange={(v) =>
                  setConfig({ ...config, reteFuenteRateDeclarante: v })
                }
              />
              <PercentField
                label="ReteIVA"
                value={config.reteIvaRate}
                onChange={(v) => setConfig({ ...config, reteIvaRate: v })}
              />
            </div>
          </div>
        </Panel>

        {/* Mano de obra + CIF */}
        <Panel index="02" title="Operación · costos">
          <div className="grid grid-cols-2 gap-4 px-6 py-5">
            <NumberField
              label="Salario COP / hora (chef)"
              value={config.laborCostPerHour}
              onChange={(v) => setConfig({ ...config, laborCostPerHour: v })}
            />
            <NumberField
              label="Factor prestacional"
              step={0.05}
              value={config.laborBenefitFactor}
              onChange={(v) => setConfig({ ...config, laborBenefitFactor: v })}
            />
            <PercentField
              label="CIF (% sobre CMP)"
              value={config.cifPercent}
              onChange={(v) => setConfig({ ...config, cifPercent: v })}
            />
            <PercentField
              label="Margen por defecto"
              value={config.defaultMarginPercent}
              onChange={(v) => setConfig({ ...config, defaultMarginPercent: v })}
            />
            <PercentField
              label="Empaque por defecto (% sobre CMP)"
              value={config.defaultPackagingMarkupPercent}
              onChange={(v) =>
                setConfig({ ...config, defaultPackagingMarkupPercent: v })
              }
            />
            <NumberField
              label="Transporte base (COP)"
              value={config.transportBase}
              onChange={(v) => setConfig({ ...config, transportBase: v })}
            />
            <NumberField
              label="Transporte / km"
              value={config.transportPerKm}
              onChange={(v) => setConfig({ ...config, transportPerKm: v })}
            />
          </div>
          <div className="px-6 py-4 border-t border-ink/15 flex justify-end">
            <ActionBtn variant="ink" onClick={saveConfig} disabled={saving}>
              Guardar configuración
            </ActionBtn>
          </div>
        </Panel>

        {/* ICA por ciudad */}
        <Panel index="03" title="ICA por ciudad" meta={`${cities.length} ciudades`}>
          <div className="divide-y divide-ink/10">
            {cities.map((c, idx) => (
              <div key={c.id} className="grid grid-cols-12 items-center gap-3 px-6 py-3">
                <div className="col-span-3 font-display text-base text-ink">
                  {c.city}
                </div>
                <div className="col-span-3">
                  <RowLabel>ICA</RowLabel>
                  <input
                    type="number"
                    step="0.00001"
                    value={c.icaRate}
                    onChange={(e) => {
                      const next = [...cities];
                      next[idx] = { ...c, icaRate: Number(e.target.value), reteIcaRate: Number(e.target.value) };
                      setCities(next);
                    }}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="col-span-3">
                  <RowLabel>Recargo transporte</RowLabel>
                  <input
                    type="number"
                    step={1000}
                    value={c.transportSurcharge}
                    onChange={(e) => {
                      const next = [...cities];
                      next[idx] = { ...c, transportSurcharge: Number(e.target.value) };
                      setCities(next);
                    }}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="col-span-3 text-right">
                  <StatusPill
                    tone={c.isActive ? "success" : "muted"}
                    label={c.isActive ? "Activa" : "Inactiva"}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-ink/15 flex justify-end">
            <ActionBtn variant="ink" onClick={saveCities} disabled={saving}>
              Guardar ciudades
            </ActionBtn>
          </div>
        </Panel>

        {/* Descuentos por volumen */}
        <Panel index="04" title="Descuentos por volumen">
          <div className="divide-y divide-ink/10">
            {tiers.map((t, idx) => (
              <div key={idx} className="grid grid-cols-12 items-center gap-3 px-6 py-3">
                <div className="col-span-5">
                  <RowLabel>Desde comensales</RowLabel>
                  <input
                    type="number"
                    value={t.minGuests}
                    onChange={(e) => {
                      const next = [...tiers];
                      next[idx] = { ...t, minGuests: Number(e.target.value) };
                      setTiers(next);
                    }}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="col-span-5">
                  <RowLabel>Descuento %</RowLabel>
                  <input
                    type="number"
                    step="0.01"
                    value={t.discountPercent}
                    onChange={(e) => {
                      const next = [...tiers];
                      next[idx] = { ...t, discountPercent: Number(e.target.value) };
                      setTiers(next);
                    }}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="col-span-2 text-right">
                  <button
                    onClick={() => setTiers(tiers.filter((_, i) => i !== idx))}
                    className="font-mono text-[11px] uppercase tracking-[0.18em] text-persimmon hover:text-ink"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
            <div className="px-6 py-3">
              <button
                onClick={() =>
                  setTiers([...tiers, { minGuests: 1000, discountPercent: 0.15, isActive: true }])
                }
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-marigold-deep hover:text-ink"
              >
                + Agregar nivel
              </button>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-ink/15 flex justify-end">
            <ActionBtn variant="ink" onClick={saveTiers} disabled={saving}>
              Guardar descuentos
            </ActionBtn>
          </div>
        </Panel>

        {/* Temporadas */}
        <div className="xl:col-span-2">
        <Panel index="05" title="Temporadas">
          <div className="divide-y divide-ink/10">
            {seasons.map((s, idx) => (
              <div key={idx} className="grid grid-cols-12 items-center gap-3 px-6 py-3">
                <div className="col-span-3">
                  <RowLabel>Nombre</RowLabel>
                  <input
                    value={s.name}
                    onChange={(e) => {
                      const next = [...seasons];
                      next[idx] = { ...s, name: e.target.value };
                      setSeasons(next);
                    }}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="col-span-2">
                  <RowLabel>Inicio mes/día</RowLabel>
                  <input
                    value={`${s.startMonth}-${s.startDay}`}
                    onChange={(e) => {
                      const [m, d] = e.target.value.split("-").map(Number);
                      const next = [...seasons];
                      next[idx] = { ...s, startMonth: m || 1, startDay: d || 1 };
                      setSeasons(next);
                    }}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="col-span-2">
                  <RowLabel>Fin mes/día</RowLabel>
                  <input
                    value={`${s.endMonth}-${s.endDay}`}
                    onChange={(e) => {
                      const [m, d] = e.target.value.split("-").map(Number);
                      const next = [...seasons];
                      next[idx] = { ...s, endMonth: m || 12, endDay: d || 31 };
                      setSeasons(next);
                    }}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="col-span-2">
                  <RowLabel>Multiplicador</RowLabel>
                  <input
                    type="number"
                    step="0.01"
                    value={s.rateModifier}
                    onChange={(e) => {
                      const next = [...seasons];
                      next[idx] = { ...s, rateModifier: Number(e.target.value) };
                      setSeasons(next);
                    }}
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="col-span-3 text-right">
                  <button
                    onClick={() => setSeasons(seasons.filter((_, i) => i !== idx))}
                    className="font-mono text-[11px] uppercase tracking-[0.18em] text-persimmon hover:text-ink"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
            <div className="px-6 py-3">
              <button
                onClick={() =>
                  setSeasons([
                    ...seasons,
                    {
                      name: "Nueva temporada",
                      startMonth: 6,
                      startDay: 1,
                      endMonth: 6,
                      endDay: 30,
                      rateModifier: 1.0,
                      isActive: true,
                    },
                  ])
                }
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-marigold-deep hover:text-ink"
              >
                + Agregar temporada
              </button>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-ink/15 flex justify-end">
            <ActionBtn variant="ink" onClick={saveSeasons} disabled={saving}>
              Guardar temporadas
            </ActionBtn>
          </div>
        </Panel>
        </div>
      </div>
    </>
  );
}

const INPUT_CLASS =
  "w-full h-10 px-3 border border-ink/20 bg-cream font-sans text-[14px] text-ink focus:outline-none focus:border-ink tabular";

function RowLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55 mb-1">
      {children}
    </span>
  );
}

function PercentField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55 mb-1.5">
        {label} ({(value * 100).toFixed(2)}%)
      </span>
      <input
        type="number"
        min={0}
        max={1}
        step="0.0001"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={INPUT_CLASS}
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55 mb-1.5">
        {label}
      </span>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={INPUT_CLASS}
      />
      {label.includes("COP") && (
        <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-ink/45 mt-1">
          {formatCurrency(value)}
        </span>
      )}
    </label>
  );
}
