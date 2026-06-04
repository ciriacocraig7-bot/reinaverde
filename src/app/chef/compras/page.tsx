"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  DashHeader,
  Panel,
  StatBlock,
  StatusPill,
  ActionBtn,
} from "@/components/dashboard/primitives";
import { formatCurrency } from "@/lib/utils";

interface ShoppingItem {
  ingredientId: string;
  name: string;
  category: string | null;
  unit: string;
  totalQuantity: number;
  costPerUnit: number;
  totalCost: number;
  jumboPrice: number | null;
  jumboTotalCost: number | null;
  jumboUnitDelta: number | null;
  supplierName: string | null;
  fromOrders: string[];
}

interface OrderInList {
  id: string;
  orderNumber: string;
  eventDate: string;
  guestCount: number;
  deliveryCity: string | null;
  quoteNumber: string | null;
}

interface ShoppingResult {
  items: ShoppingItem[];
  groupedByCategory: Record<string, ShoppingItem[]>;
  totalCost: number;
  totalJumboCost: number;
  itemsWithoutJumboReference: number;
  ordersIncluded: OrderInList[];
}

const QUICK_RANGES = [
  { label: "Hoy",            days: 0 },
  { label: "Mañana",         days: 1 },
  { label: "Próximos 3 días",days: 3 },
  { label: "Esta semana",    days: 7 },
];

function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
function addDays(iso: string, n: number) {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export default function ComprasPage() {
  const [from, setFrom] = useState(todayISO());
  const [to, setTo] = useState(addDays(todayISO(), 3));
  const [data, setData] = useState<ShoppingResult | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const url = `/api/admin/shopping-list?from=${from}&to=${to}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setQuickRange = (days: number) => {
    const t = todayISO();
    setFrom(t);
    setTo(addDays(t, Math.max(1, days)));
  };

  const grouped = data?.groupedByCategory ?? {};
  const groupKeys = Object.keys(grouped);

  const downloadCsv = () => {
    if (!data) return;
    const rows = [
      [
        "Categoría",
        "Ingrediente",
        "Cantidad",
        "Unidad",
        "Costo unitario",
        "Costo total",
        "Precio Jumbo (ref)",
        "Total Jumbo",
        "Δ unitario",
        "Proveedor",
      ],
      ...data.items.map((i) => [
        i.category ?? "Otro",
        i.name,
        i.totalQuantity,
        i.unit,
        i.costPerUnit,
        i.totalCost,
        i.jumboPrice ?? "",
        i.jumboTotalCost ?? "",
        i.jumboUnitDelta ?? "",
        i.supplierName ?? "",
      ]),
    ];
    const csv = rows
      .map((row) =>
        row
          .map((c) => {
            const s = String(c).replace(/"/g, '""');
            return /[",\n]/.test(s) ? `"${s}"` : s;
          })
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compras-${from}-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <DashHeader
        eyebrow="§ Cocina · Compras"
        title={
          <>
            Compras del <span className="italic">día</span>
            <span className="text-marigold">.</span>
          </>
        }
      >
        <ActionBtn variant="outline" onClick={downloadCsv} disabled={!data || data.items.length === 0}>
          Descargar CSV
        </ActionBtn>
      </DashHeader>

      <Panel index="01" title="Rango" meta={`${data?.ordersIncluded.length ?? 0} pedidos en el período`}>
        <div className="px-6 py-5 grid lg:grid-cols-[1fr_1fr_auto] gap-4 items-end">
          <label className="block">
            <span className="block font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55 mb-1.5">
              Desde
            </span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-11 px-3 border border-ink/25 bg-cream font-sans text-base text-ink focus:outline-none focus:border-ink tabular"
            />
          </label>
          <label className="block">
            <span className="block font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55 mb-1.5">
              Hasta (exclusivo)
            </span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-11 px-3 border border-ink/25 bg-cream font-sans text-base text-ink focus:outline-none focus:border-ink tabular"
            />
          </label>
          <ActionBtn variant="ink" onClick={fetchList} disabled={loading}>
            {loading ? "Calculando…" : "Recalcular"}
          </ActionBtn>
        </div>
        <div className="px-6 pb-5 flex flex-wrap gap-2">
          {QUICK_RANGES.map((q) => (
            <button
              key={q.label}
              onClick={() => setQuickRange(q.days)}
              className="px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] border border-ink/25 hover:border-ink hover:bg-ink hover:text-cream transition-colors"
            >
              {q.label}
            </button>
          ))}
        </div>
      </Panel>

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border border-ink/15">
          <div className="border-r border-ink/15">
            <StatBlock label="Costo total Reina Verde" value={formatCurrency(data.totalCost)} />
          </div>
          <div className="border-r border-ink/15">
            <StatBlock
              label="Costo si todo fuera Jumbo"
              value={formatCurrency(data.totalJumboCost)}
              meta={
                data.itemsWithoutJumboReference > 0
                  ? `${data.itemsWithoutJumboReference} sin referencia`
                  : undefined
              }
            />
          </div>
          <div>
            <StatBlock
              label="Diferencia neta"
              value={formatCurrency(data.totalJumboCost - data.totalCost)}
              meta={
                data.totalJumboCost > data.totalCost
                  ? "Vamos más baratos que Jumbo"
                  : data.totalJumboCost < data.totalCost
                    ? "Jumbo es más barato"
                    : "Sin datos"
              }
              accent={
                data.totalJumboCost > data.totalCost ? "ink" : "persimmon"
              }
              trend={
                data.totalJumboCost > data.totalCost ? "up" : "down"
              }
            />
          </div>
        </div>
      )}

      {data && data.ordersIncluded.length === 0 && (
        <div className="border border-ink/15 bg-cream-warm px-8 py-14 text-center">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
            No hay pedidos pagados en el rango seleccionado.
          </p>
        </div>
      )}

      {data && data.ordersIncluded.length > 0 && (
        <Panel index="02" title="Pedidos incluidos">
          <ul className="divide-y divide-ink/10">
            {data.ordersIncluded.map((o) => (
              <li key={o.id} className="px-6 py-3 flex items-baseline justify-between flex-wrap gap-3">
                <div>
                  <span className="font-display text-lg text-ink">{o.orderNumber}</span>
                  {o.quoteNumber && (
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/55 ml-3">
                      ← {o.quoteNumber}
                    </span>
                  )}
                </div>
                <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/65">
                  {new Date(o.eventDate).toLocaleDateString("es-CO", {
                    day: "2-digit",
                    month: "short",
                  })}{" "}
                  · {o.guestCount} pax · {o.deliveryCity ?? "—"}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {groupKeys.length > 0 && (
        <div className="space-y-6">
          {groupKeys.map((cat) => (
            <Panel key={cat} index="" title={cat} meta={`${grouped[cat].length} insumos`}>
              <div className="divide-y divide-ink/10">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55 bg-cream-warm">
                  <span>Ingrediente</span>
                  <span className="text-right">Cantidad</span>
                  <span className="text-right">Reina Verde</span>
                  <span className="text-right">Jumbo (ref)</span>
                  <span></span>
                </div>
                {grouped[cat].map((it) => {
                  const delta = it.jumboUnitDelta;
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
                        ? `+${formatCurrency(delta)} ahorro/${it.unit}`
                        : delta < 0
                          ? `−${formatCurrency(Math.abs(delta))} extra/${it.unit}`
                          : "Igual";
                  return (
                    <div
                      key={it.ingredientId}
                      className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-baseline"
                    >
                      <div>
                        <p className="font-display text-lg text-ink leading-tight">
                          {it.name}
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55 mt-1">
                          {it.supplierName ?? "Sin proveedor"} · de {it.fromOrders.length} pedido(s)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-xl tabular text-ink">
                          {it.totalQuantity}
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
                          {it.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-base tabular text-ink">
                          {formatCurrency(it.totalCost)}
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
                          {formatCurrency(it.costPerUnit)}/{it.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        {it.jumboTotalCost != null ? (
                          <>
                            <p className="font-display text-base tabular text-ink/70">
                              {formatCurrency(it.jumboTotalCost)}
                            </p>
                            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
                              {formatCurrency(it.jumboPrice ?? 0)}/{it.unit}
                            </p>
                          </>
                        ) : (
                          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/45">
                            —
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <StatusPill tone={tone} label={deltaLabel} />
                        <a
                          href={`https://www.jumbocolombia.com/supermercado/search?query=${encodeURIComponent(it.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[10px] uppercase tracking-[0.18em] text-marigold-deep hover:text-ink transition-colors"
                        >
                          Abrir Jumbo →
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
