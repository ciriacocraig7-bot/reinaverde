"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatCurrency, cn } from "@/lib/utils";
import {
  DashHeader,
  StatBlock,
  Panel,
  DataTable,
  StatusPill,
  Avatar,
  ActionBtn,
} from "@/components/dashboard/primitives";

interface OverviewRow {
  kind: "catering-order" | "shop-order" | "quote";
  id: string;
  reference: string;
  initials: string;
  client: string;
  desc: string;
  status: string;
  total: number;
  date: string;
  line: "catering" | "pharma" | "liofilizados";
}

interface LineKpis {
  ingresoMes: number;
  ingresoMesAnterior: number;
  pedidosActivos: number;
  cotizacionesPendientes?: number;
  productosActivos?: number;
}

interface Overview {
  rows: OverviewRow[];
  kpis: {
    overview: LineKpis;
    catering: LineKpis;
    pharma: LineKpis;
    liofilizados: LineKpis;
  };
  lineCounts: { catering: number; pharma: number; liofilizados: number };
  statusCounts: Record<string, number>;
  paymentConfig: { boldConfigured: boolean; webhookSecretConfigured: boolean };
  generatedAt: string;
}

const BUSINESS_TABS = [
  { id: "overview",     code: "ALL", label: "Todo",         accentLabel: "text-ink",         underline: "bg-ink" },
  { id: "catering",     code: "CRP", label: "Catering",     accentLabel: "text-marigold-deep", underline: "bg-marigold" },
  { id: "pharma",       code: "PHM", label: "Pharma",       accentLabel: "text-iris-deep",     underline: "bg-iris" },
  { id: "liofilizados", code: "LIO", label: "Liofilizados", accentLabel: "text-persimmon",     underline: "bg-persimmon" },
] as const;

type TabId = (typeof BUSINESS_TABS)[number]["id"];

const STATUS_MAP: Record<
  string,
  { label: string; tone: "neutral" | "info" | "warn" | "success" | "danger" | "muted" }
> = {
  // Quote
  DRAFT:            { label: "Borrador",      tone: "muted" },
  SENT:             { label: "Cotizada",      tone: "info" },
  ACCEPTED:         { label: "Aceptada",      tone: "info" },
  PAYMENT_PENDING:  { label: "Pend. pago",    tone: "warn" },
  PAID:             { label: "Pagado",        tone: "success" },
  EXPIRED:          { label: "Expirada",      tone: "muted" },
  REJECTED:         { label: "Rechazada",     tone: "danger" },
  CONVERTED:        { label: "Convertida",    tone: "success" },
  // Order
  QUOTED:           { label: "Cotizado",      tone: "info" },
  IN_PRODUCTION:    { label: "Producción",    tone: "info" },
  READY:            { label: "Listo",         tone: "success" },
  IN_TRANSIT:       { label: "Tránsito",      tone: "warn" },
  DELIVERED:        { label: "Entregado",     tone: "success" },
  COMPLETED:        { label: "Completado",    tone: "success" },
  CANCELLED:        { label: "Cancelado",     tone: "danger" },
  // ShopOrder
  PENDING:          { label: "Pendiente",     tone: "warn" },
  CONFIRMED:        { label: "Confirmado",    tone: "info" },
  PROCESSING:       { label: "Procesando",    tone: "info" },
  SHIPPED:          { label: "Despachado",    tone: "warn" },
  REFUNDED:         { label: "Reembolsado",   tone: "danger" },
};

const LINE_TAG: Record<string, { code: string; tone: "warn" | "info" | "danger" }> = {
  catering:     { code: "CRP", tone: "warn" },
  pharma:       { code: "PHM", tone: "info" },
  liofilizados: { code: "LIO", tone: "danger" },
};

const PER_PAGE = 8;

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>("overview");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/admin/overview", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => toast.error(`Error cargando tablero: ${e.message}`))
      .finally(() => setLoading(false));
  }, []);

  const today = new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(new Date())
    .toLowerCase();

  const kpis = data?.kpis[tab];

  const filteredRows = useMemo(() => {
    if (!data) return [];
    let rows = data.rows;
    if (tab !== "overview") rows = rows.filter((r) => r.line === tab);
    if (statusFilter) rows = rows.filter((r) => r.status === statusFilter);
    return rows;
  }, [data, tab, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PER_PAGE));
  const slice = filteredRows.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const trendVsLastMonth = (k?: LineKpis): { meta: string; trend: "up" | "down" | "flat" } => {
    if (!k) return { meta: "", trend: "flat" };
    if (k.ingresoMesAnterior === 0) {
      return k.ingresoMes > 0
        ? { meta: "nuevo este mes", trend: "up" }
        : { meta: "sin movimiento", trend: "flat" };
    }
    const delta = ((k.ingresoMes - k.ingresoMesAnterior) / k.ingresoMesAnterior) * 100;
    if (Math.abs(delta) < 1) return { meta: "vs mes anterior", trend: "flat" };
    return {
      meta: `${delta > 0 ? "+" : ""}${delta.toFixed(0)}% vs anterior`,
      trend: delta > 0 ? "up" : "down",
    };
  };

  const handleExportCSV = () => {
    if (filteredRows.length === 0) return;
    const headers = ["Referencia", "Cliente", "Tipo", "Línea", "Detalle", "Monto", "Estado", "Fecha"];
    const csvRows = filteredRows.map((r) => [
      r.reference,
      r.client,
      r.kind,
      LINE_TAG[r.line]?.code || r.line,
      r.desc,
      r.total.toString(),
      STATUS_MAP[r.status]?.label || r.status,
      new Date(r.date).toISOString(),
    ]);
    const csv = [headers, ...csvRows]
      .map((row) =>
        row
          .map((c) => {
            const s = String(c).replace(/"/g, '""');
            return /[",\n]/.test(s) ? `"${s}"` : s;
          })
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `pedidos-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("CSV descargado");
  };

  const trend = trendVsLastMonth(kpis);

  return (
    <>
      <DashHeader
        eyebrow="§ Operations · Tablero"
        title={
          <>
            Estado <span className="italic">de la casa</span>
            <span className="text-ink/40">.</span>
          </>
        }
        date={today}
      >
        <ActionBtn variant="outline" onClick={handleExportCSV} disabled={filteredRows.length === 0}>
          Descargar reportes
        </ActionBtn>
        <ActionBtn variant="ink" onClick={() => router.push("/catering/cotizar")}>
          + Cotizar evento
        </ActionBtn>
      </DashHeader>

      {/* Tabs */}
      <div className="border-b border-ink/15 flex items-center gap-8 overflow-x-auto no-scrollbar">
        {BUSINESS_TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setPage(1);
                setStatusFilter(null);
              }}
              className={cn(
                "relative pb-3 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors flex items-baseline gap-2 whitespace-nowrap",
                active ? "text-ink" : "text-ink/45 hover:text-ink/75",
              )}
            >
              <span className={active ? t.accentLabel : ""}>{t.code}</span>
              <span>{t.label}</span>
              {data && t.id !== "overview" && (
                <span className="font-mono text-[10px] tabular text-ink/45">
                  ({data.lineCounts[t.id as "catering" | "pharma" | "liofilizados"]})
                </span>
              )}
              {active && (
                <span
                  className={cn("absolute -bottom-px left-0 right-0 h-px", t.underline)}
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-ink/15">
        <div className="border-r border-b border-ink/15">
          <StatBlock
            label={tab === "overview" ? "Ingresos mes · todos" : `Ingresos mes · ${tab}`}
            value={loading ? "…" : formatCurrency(kpis?.ingresoMes ?? 0)}
            meta={trend.meta}
            trend={trend.trend}
            accent={
              tab === "catering" ? "marigold" : tab === "pharma" ? "iris" : tab === "liofilizados" ? "persimmon" : "ink"
            }
          />
        </div>
        <div className="border-r border-b border-ink/15">
          <StatBlock
            label="Pedidos activos"
            value={loading ? "…" : String(kpis?.pedidosActivos ?? 0)}
            meta="en curso ahora"
            trend="warn"
            accent="marigold"
          />
        </div>
        <div className="border-r border-b border-ink/15">
          <StatBlock
            label={tab === "overview" ? "Productos activos" : "Cotizaciones pendientes"}
            value={
              loading
                ? "…"
                : String(
                    tab === "overview"
                      ? kpis?.productosActivos ?? 0
                      : kpis?.cotizacionesPendientes ?? 0,
                  )
            }
            meta={tab === "overview" ? "tres líneas" : "sin pagar"}
            trend="up"
          />
        </div>
      </div>

      {/* Por división — solo en overview */}
      {tab === "overview" && data && (
        <Panel index="01" title="Por división" meta="3 líneas activas">
          <div className="divide-y divide-ink/15">
            {(["catering", "pharma", "liofilizados"] as const).map((line) => {
              const k = data.kpis[line];
              const accent =
                line === "catering" ? "marigold" : line === "pharma" ? "iris" : "persimmon";
              return (
                <button
                  key={line}
                  onClick={() => {
                    setTab(line);
                    setPage(1);
                  }}
                  className="w-full flex items-baseline justify-between px-6 py-5 hover:bg-cream-warm transition-colors group text-left"
                >
                  <div className="flex items-baseline gap-4">
                    <span
                      className={cn(
                        "font-mono text-[10.5px] uppercase tracking-[0.22em]",
                        accent === "marigold" && "text-marigold-deep",
                        accent === "iris" && "text-iris-deep",
                        accent === "persimmon" && "text-persimmon",
                      )}
                    >
                      {LINE_TAG[line].code}
                    </span>
                    <span className="font-display text-2xl tracking-tight text-ink capitalize">
                      {line}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-8">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-ink/55">
                      {data.lineCounts[line]} pedidos
                    </span>
                    <span className="font-display text-2xl tabular text-ink">
                      {formatCurrency(k.ingresoMes)}
                    </span>
                    <span className="font-display text-2xl text-ink/40 group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </Panel>
      )}

      {/* Tabla de pedidos */}
      <Panel
        index={tab === "overview" ? "02" : "01"}
        title={
          tab === "overview"
            ? "Pedidos"
            : `Pedidos · ${BUSINESS_TABS.find((t) => t.id === tab)?.label}`
        }
        meta={loading ? "Cargando…" : `${filteredRows.length} totales`}
        actions={
          <>
            <select
              value={statusFilter || ""}
              onChange={(e) => {
                setStatusFilter(e.target.value || null);
                setPage(1);
              }}
              className="bg-cream border border-ink/30 px-3 h-9 font-mono text-[11px] uppercase tracking-[0.18em] text-ink focus:outline-none focus:border-ink"
            >
              <option value="">Todos los estados</option>
              {Object.entries(STATUS_MAP)
                .filter(([k]) => (data?.statusCounts[k] ?? 0) > 0)
                .map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label} ({data?.statusCounts[k] ?? 0})
                  </option>
                ))}
            </select>
            <ActionBtn variant="outline" onClick={handleExportCSV} className="h-9 px-4" disabled={filteredRows.length === 0}>
              Exportar CSV
            </ActionBtn>
          </>
        }
      >
        {loading ? (
          <div className="px-6 py-16 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55">
            Cargando pedidos…
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-display text-2xl text-ink mb-2">Sin pedidos.</p>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55">
              No hay pedidos con los filtros actuales.
            </p>
          </div>
        ) : (
          <>
            <DataTable
              columns={[
                { key: "ref", label: "Ref" },
                { key: "client", label: "Cliente" },
                ...(tab === "overview" ? [{ key: "line", label: "Línea" }] : []),
                { key: "desc", label: "Detalle" },
                { key: "total", label: "Monto", align: "right" as const },
                { key: "status", label: "Estado" },
              ]}
            >
              {slice.map((r) => {
                const status = STATUS_MAP[r.status] || { label: r.status, tone: "muted" as const };
                const line = LINE_TAG[r.line];
                return (
                  <tr key={r.id} className="hover:bg-cream-warm transition-colors">
                    <td className="px-6 py-4 font-mono text-[12px] text-ink tabular">
                      {r.reference}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar initials={r.initials} size="sm" />
                        <div>
                          <p className="font-sans text-[14px] text-ink">{r.client}</p>
                          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/45">
                            {new Date(r.date).toLocaleDateString("es-CO", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </p>
                        </div>
                      </div>
                    </td>
                    {tab === "overview" && (
                      <td className="px-6 py-4">
                        <StatusPill tone={line.tone} label={line.code} />
                      </td>
                    )}
                    <td className="px-6 py-4 font-sans text-[14px] text-ink/85">{r.desc}</td>
                    <td className="px-6 py-4 font-display text-[16px] text-ink tabular text-right">
                      {formatCurrency(r.total)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill tone={status.tone} label={status.label} />
                    </td>
                  </tr>
                );
              })}
            </DataTable>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-ink/15">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink/55">
                Mostrando {slice.length} de {filteredRows.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-9 w-9 flex items-center justify-center font-mono text-sm text-ink/55 hover:bg-ink hover:text-cream disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink/55 transition-colors"
                >
                  ←
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  // Mostrar al rededor de la página actual cuando hay muchas
                  let pageNum = i + 1;
                  if (totalPages > 7) {
                    const start = Math.max(1, page - 3);
                    pageNum = start + i;
                    if (pageNum > totalPages) return null;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={cn(
                        "h-9 w-9 flex items-center justify-center font-mono text-sm tabular transition-colors",
                        page === pageNum
                          ? "bg-ink text-cream"
                          : "text-ink/55 hover:bg-ink hover:text-cream",
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-9 w-9 flex items-center justify-center font-mono text-sm text-ink/55 hover:bg-ink hover:text-cream disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink/55 transition-colors"
                >
                  →
                </button>
              </div>
            </div>
          </>
        )}
      </Panel>

      {/* Atajos a las operaciones reales */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Panel index="03" title="Atajos operativos">
          <div className="divide-y divide-ink/10">
            <ShortLink
              href="/admin/productos"
              code="PRD"
              label="Productos"
              desc="CRUD pharma + liofilizados con galería Vercel Blob."
            />
            <ShortLink
              href="/admin/pricing"
              code="PRC"
              label="Precios y tarifas"
              desc="Régimen tributario, mano de obra, ICA, descuentos."
            />
            <ShortLink
              href="/chef/recetas"
              code="REC"
              label="Recetas catering"
              desc="Diseño de menú con CMP+CMO+CIF en vivo."
            />
            <ShortLink
              href="/chef/compras"
              code="CMP"
              label="Compras del día"
              desc="Shopping list agrupada por categoría + Jumbo."
            />
          </div>
        </Panel>

        <Panel index="04" title="Pasarela de pagos" meta="Bold">
          <div className="p-6 space-y-5">
            <div
              className={cn(
                "border p-5",
                data?.paymentConfig.boldConfigured
                  ? "border-success/40 bg-success-soft/30"
                  : "border-error/40 bg-error-soft/30",
              )}
            >
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-display text-2xl text-ink tracking-tight leading-none">
                  Bold
                </span>
                <StatusPill
                  tone={data?.paymentConfig.boldConfigured ? "success" : "danger"}
                  label={data?.paymentConfig.boldConfigured ? "Configurado" : "Falta API key"}
                />
              </div>
              <p className="font-serif italic text-[13px] text-ink/70 leading-snug">
                Tarjeta, PSE, Nequi, Daviplata · firma SHA-256 server-side.
              </p>
            </div>
            <ul className="space-y-3 pt-3 border-t border-ink/15">
              <li className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em]">
                <span className="text-ink/65">Webhook HMAC</span>
                <StatusPill
                  tone={data?.paymentConfig.webhookSecretConfigured ? "success" : "warn"}
                  label={
                    data?.paymentConfig.webhookSecretConfigured ? "Verificado" : "Pendiente"
                  }
                />
              </li>
              <li className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em]">
                <span className="text-ink/65">Idempotencia</span>
                <StatusPill tone="success" label="Activa" />
              </li>
            </ul>
          </div>
        </Panel>

        <Panel index="05" title="Última sincronía" meta="overview">
          <div className="p-6 space-y-4">
            <p className="font-serif italic text-[14px] text-ink/70 leading-snug">
              Datos en vivo desde Supabase. Actualizados con cada refresh.
            </p>
            {data?.generatedAt && (
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/55">
                Última lectura: {new Date(data.generatedAt).toLocaleString("es-CO")}
              </p>
            )}
            <ActionBtn
              variant="outline"
              onClick={() => {
                setLoading(true);
                fetch("/api/admin/overview")
                  .then((r) => r.json())
                  .then((d) => setData(d))
                  .finally(() => setLoading(false));
              }}
              className="w-full"
            >
              Recargar datos
            </ActionBtn>
          </div>
        </Panel>
      </div>
    </>
  );
}

function ShortLink({
  href,
  code,
  label,
  desc,
}: {
  href: string;
  code: string;
  label: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="block px-6 py-4 hover:bg-cream-warm transition-colors group"
    >
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
            § {code}
          </span>
          <p className="mt-1 font-display text-xl text-ink leading-tight">{label}</p>
          <p className="mt-1 font-serif italic text-[13px] text-ink/65 leading-snug">
            {desc}
          </p>
        </div>
        <span className="font-display text-2xl text-ink/40 group-hover:translate-x-1 transition-transform">
          →
        </span>
      </div>
    </Link>
  );
}
