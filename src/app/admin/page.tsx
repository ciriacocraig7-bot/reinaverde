"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatCurrency, cn } from "@/lib/utils";
import {
  DashHeader,
  StatBlock,
  Panel,
  DataTable,
  StatusPill,
  ProgressMeter,
  Avatar,
  ActionBtn,
} from "@/components/dashboard/primitives";

/* ─── Mock data (mismo perfil que el original) ──────────────────── */

const BUSINESS_TABS = [
  { id: "overview",     code: "ALL", label: "Todo",         accent: "" },
  { id: "catering",     code: "CRP", label: "Catering",     accent: "text-marigold border-marigold" },
  { id: "pharma",       code: "PHM", label: "Pharma",       accent: "text-iris border-iris" },
  { id: "liofilizados", code: "LIO", label: "Liofilizados", accent: "text-persimmon border-persimmon" },
] as const;

type TabId = (typeof BUSINESS_TABS)[number]["id"];

const KPIS: Record<TabId, { label: string; value: string; meta: string; trend: "up" | "warn"; accent?: "marigold" | "iris" | "persimmon" | "ink" }[]> = {
  overview: [
    { label: "Ingresos · mes", value: "$42,68M", meta: "+12% vs anterior", trend: "up" },
    { label: "Pedidos activos", value: "287",    meta: "32 urgentes",       trend: "warn", accent: "marigold" },
    { label: "Productos activos", value: "17",    meta: "tres líneas",      trend: "up" },
  ],
  catering: [
    { label: "Ingresos Catering",  value: "$24,84M", meta: "+8%",                trend: "up",   accent: "marigold" },
    { label: "Pedidos en cola",    value: "142",    meta: "18 críticos",        trend: "warn", accent: "marigold" },
    { label: "Ocupación staff",    value: "88%",     meta: "cocina al 94%",      trend: "up",   accent: "marigold" },
  ],
  pharma: [
    { label: "Ingresos Pharma",    value: "$11,45M", meta: "+22%",               trend: "up",  accent: "iris" },
    { label: "Pedidos Pharma",     value: "89",      meta: "8 por enviar",       trend: "warn", accent: "iris" },
    { label: "SKU activos",        value: "8",       meta: "3 destacados",       trend: "up",  accent: "iris" },
  ],
  liofilizados: [
    { label: "Ingresos Liofilizados", value: "$6,38M", meta: "+18%",               trend: "up",  accent: "persimmon" },
    { label: "Pedidos por enviar",     value: "56",     meta: "6 retrasados",      trend: "warn", accent: "persimmon" },
    { label: "Frutas en catálogo",     value: "9",      meta: "4 destacadas",      trend: "up",  accent: "persimmon" },
  ],
};

const CATERING_ORDERS = [
  { id: "RV-ABC123", client: "TechCorp S.A.S",  initials: "TC", desc: "Almuerzo ejecutivo",         total: 2850000, status: "IN_PRODUCTION", line: "catering" },
  { id: "RV-DEF456", client: "María López",      initials: "ML", desc: "Boda",                        total: 8500000, status: "PAID",          line: "catering" },
  { id: "RV-GHI789", client: "Innovatech",       initials: "IN", desc: "Corporativo",                 total: 1200000, status: "READY",         line: "catering" },
];

const SHOP_ORDERS = [
  { id: "RV-SH001", client: "Carlos Gómez",  initials: "CG", desc: "Aceite CBD + Bálsamo",    total: 284000, status: "CONFIRMED", line: "pharma" },
  { id: "RV-SH002", client: "Ana Ruiz",      initials: "AR", desc: "Kit Bienestar Starter",   total: 159000, status: "SHIPPED",   line: "pharma" },
  { id: "RV-SH003", client: "Pedro Díaz",    initials: "PD", desc: "Flores Mango Kush x2",    total: 170000, status: "PROCESSING", line: "pharma" },
  { id: "RV-SH004", client: "Laura Martín",  initials: "LM", desc: "Mango + Mix Berries",     total: 63000,  status: "CONFIRMED",  line: "liofilizados" },
  { id: "RV-SH005", client: "Diego Reyes",   initials: "DR", desc: "Bulk Mango 1kg",           total: 320000, status: "SHIPPED",    line: "liofilizados" },
  { id: "RV-SH006", client: "Sofia Torres",  initials: "ST", desc: "Kit Repostería Premium",   total: 65000,  status: "DELIVERED",  line: "liofilizados" },
];

const STATUS_MAP: Record<string, { label: string; tone: "neutral" | "info" | "warn" | "success" | "danger" | "muted" }> = {
  DRAFT:           { label: "Borrador",      tone: "muted" },
  QUOTED:          { label: "Cotizado",      tone: "info" },
  PAYMENT_PENDING: { label: "Pend. pago",    tone: "warn" },
  PAID:            { label: "Pagado",        tone: "success" },
  IN_PRODUCTION:   { label: "Producción",    tone: "info" },
  READY:           { label: "Listo",         tone: "success" },
  IN_TRANSIT:      { label: "En tránsito",   tone: "warn" },
  DELIVERED:       { label: "Entregado",     tone: "success" },
  COMPLETED:       { label: "Completado",    tone: "success" },
  CANCELLED:       { label: "Cancelado",     tone: "danger" },
  PENDING:         { label: "Pendiente",     tone: "warn" },
  CONFIRMED:       { label: "Confirmado",    tone: "info" },
  PROCESSING:      { label: "Procesando",    tone: "info" },
  SHIPPED:         { label: "Enviado",       tone: "warn" },
  REFUNDED:        { label: "Reembolsado",   tone: "danger" },
};

const LINE_TAG: Record<string, { code: string; tone: "warn" | "info" | "danger" }> = {
  catering:     { code: "CRP", tone: "warn" },
  pharma:       { code: "PHM", tone: "info" },
  liofilizados: { code: "LIO", tone: "danger" },
};

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("overview");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;
  const actionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (actionRef.current && !actionRef.current.contains(e.target as Node)) setOpenActionId(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const kpis = KPIS[tab];

  const allOrders = tab === "overview"
    ? [...CATERING_ORDERS, ...SHOP_ORDERS]
    : tab === "catering"
      ? CATERING_ORDERS
      : SHOP_ORDERS.filter((o) => o.line === tab);

  const filtered = statusFilter ? allOrders.filter((o) => o.status === statusFilter) : allOrders;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const slice = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleExportCSV = () => {
    const headers = ["ID", "Cliente", "Línea", "Detalle", "Monto", "Estado"];
    const rows = filtered.map((o) => [
      o.id, o.client, LINE_TAG[o.line]?.code || o.line, o.desc, o.total.toString(),
      STATUS_MAP[o.status]?.label || o.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `pedidos-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("CSV descargado");
  };

  const today = new Intl.DateTimeFormat("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(new Date()).toLowerCase();

  return (
    <>
      <DashHeader
        eyebrow="§ Operations · Tablero"
        title={<>Estado <span className="italic">de la casa</span><span className="text-ink/40">.</span></>}
        date={today}
      >
        <ActionBtn variant="outline" onClick={handleExportCSV}>
          Descargar reportes
        </ActionBtn>
        <ActionBtn variant="ink" onClick={() => router.push("/catering/orden")}>
          + Nuevo pedido
        </ActionBtn>
      </DashHeader>

      {/* Tabs */}
      <div className="border-b border-ink/15 flex items-center gap-8 overflow-x-auto no-scrollbar">
        {BUSINESS_TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setPage(1); }}
              className={cn(
                "relative pb-3 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors flex items-baseline gap-2 whitespace-nowrap",
                active ? "text-ink" : "text-ink/45 hover:text-ink/75",
              )}
            >
              <span className={cn(active ? t.accent.split(" ")[0] || "" : "")}>{t.code}</span>
              <span>{t.label}</span>
              {active && (
                <span
                  className={cn(
                    "absolute -bottom-px left-0 right-0 h-px",
                    t.accent.split(" ")[1] || "bg-ink",
                  )}
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-ink/15">
        {kpis.map((k) => (
          <div key={k.label} className="border-r border-b border-ink/15">
            <StatBlock {...k} />
          </div>
        ))}
      </div>

      {/* Line summary — only on overview */}
      {tab === "overview" && (
        <Panel index="01" title="Por división" meta="3 líneas activas">
          <div className="divide-y divide-ink/15">
            {[
              { code: "CRP", name: "Catering",     metric: "$24,8M", count: "142 pedidos", tab: "catering"     as TabId, accent: "marigold"  as const },
              { code: "PHM", name: "Pharma",       metric: "$11,5M", count: "89 pedidos",  tab: "pharma"       as TabId, accent: "iris"      as const },
              { code: "LIO", name: "Liofilizados", metric: "$6,4M",  count: "56 pedidos",  tab: "liofilizados" as TabId, accent: "persimmon" as const },
            ].map((line) => (
              <button
                key={line.code}
                onClick={() => { setTab(line.tab); setPage(1); }}
                className="w-full flex items-baseline justify-between px-6 py-5 hover:bg-cream-warm transition-colors group text-left"
              >
                <div className="flex items-baseline gap-4">
                  <span className={cn(
                    "font-mono text-[10.5px] uppercase tracking-[0.22em]",
                    line.accent === "marigold"  && "text-marigold",
                    line.accent === "iris"      && "text-iris",
                    line.accent === "persimmon" && "text-persimmon",
                  )}>
                    {line.code}
                  </span>
                  <span className="font-display text-2xl tracking-tight text-ink">{line.name}</span>
                </div>
                <div className="flex items-baseline gap-8">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-ink/55">
                    {line.count}
                  </span>
                  <span className="font-display text-2xl tabular text-ink">{line.metric}</span>
                  <span className="font-display text-2xl text-ink/40 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </Panel>
      )}

      {/* Orders table */}
      <Panel
        index="02"
        title={tab === "overview" ? "Pedidos" : `Pedidos · ${BUSINESS_TABS.find((t) => t.id === tab)?.label}`}
        meta={`${filtered.length} totales`}
        actions={
          <>
            <select
              value={statusFilter || ""}
              onChange={(e) => { setStatusFilter(e.target.value || null); setPage(1); }}
              className="bg-cream border border-ink/30 px-3 h-9 font-mono text-[11px] uppercase tracking-[0.18em] text-ink focus:outline-none focus:border-ink"
            >
              <option value="">Todos los estados</option>
              {Object.entries(STATUS_MAP).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <ActionBtn variant="outline" onClick={handleExportCSV} className="h-9 px-4">
              Exportar CSV
            </ActionBtn>
          </>
        }
      >
        <DataTable
          columns={[
            { key: "id",     label: "ID" },
            { key: "client", label: "Cliente" },
            ...(tab === "overview" ? [{ key: "line", label: "Línea" }] : []),
            { key: "desc",   label: "Detalle" },
            { key: "total",  label: "Monto", align: "right" as const },
            { key: "status", label: "Estado" },
            { key: "act",    label: "", align: "right" as const },
          ]}
        >
          {slice.map((o) => {
            const status = STATUS_MAP[o.status] || { label: o.status, tone: "muted" as const };
            const line = LINE_TAG[o.line];
            return (
              <tr key={o.id} className="hover:bg-cream-warm transition-colors">
                <td className="px-6 py-4 font-mono text-[12px] text-ink tabular">{o.id}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar initials={o.initials} size="sm" />
                    <span className="font-sans text-[14px] text-ink">{o.client}</span>
                  </div>
                </td>
                {tab === "overview" && (
                  <td className="px-6 py-4">
                    <StatusPill tone={line.tone} label={line.code} />
                  </td>
                )}
                <td className="px-6 py-4 font-sans text-[14px] text-ink/85">{o.desc}</td>
                <td className="px-6 py-4 font-display text-[16px] text-ink tabular text-right">
                  {formatCurrency(o.total)}
                </td>
                <td className="px-6 py-4">
                  <StatusPill tone={status.tone} label={status.label} />
                </td>
                <td className="px-6 py-4 text-right relative">
                  <button
                    onClick={() => setOpenActionId(openActionId === o.id ? null : o.id)}
                    className="text-ink/40 hover:text-ink transition-colors"
                    aria-label="Acciones"
                  >
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                  {openActionId === o.id && (
                    <div
                      ref={actionRef}
                      className="absolute right-6 top-12 z-30 w-48 bg-cream border border-ink/30 shadow-paper-md"
                    >
                      <button
                        onClick={() => { toast.info(`Ver ${o.id}`); setOpenActionId(null); }}
                        className="w-full text-left px-4 py-2.5 font-sans text-[13px] text-ink hover:bg-cream-warm"
                      >
                        Ver detalles
                      </button>
                      <button
                        onClick={() => { toast.info(`Cambiar estado ${o.id}`); setOpenActionId(null); }}
                        className="w-full text-left px-4 py-2.5 font-sans text-[13px] text-ink hover:bg-cream-warm border-t border-ink/15"
                      >
                        Cambiar estado
                      </button>
                      <button
                        onClick={() => { toast.warning(`Cancelar ${o.id}`); setOpenActionId(null); }}
                        className="w-full text-left px-4 py-2.5 font-sans text-[13px] text-error hover:bg-error-soft border-t border-ink/15"
                      >
                        Cancelar pedido
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </DataTable>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-ink/15">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink/55">
            Mostrando {slice.length} de {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-9 w-9 flex items-center justify-center font-mono text-sm text-ink/55 hover:bg-ink hover:text-cream disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink/55 transition-colors"
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={cn(
                  "h-9 w-9 flex items-center justify-center font-mono text-sm tabular transition-colors",
                  page === i + 1
                    ? "bg-ink text-cream"
                    : "text-ink/55 hover:bg-ink hover:text-cream",
                )}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-9 w-9 flex items-center justify-center font-mono text-sm text-ink/55 hover:bg-ink hover:text-cream disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink/55 transition-colors"
            >
              →
            </button>
          </div>
        </div>
      </Panel>

      {/* Lower grid: capacity + payment status */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Panel index="03" title="Capacidad operativa" meta="tiempo real">
          <div className="p-6 space-y-6">
            <p className="font-serif italic text-[15px] text-ink/70 leading-snug">
              La cocina opera cerca de su capacidad máxima. Rotación sugerida en las próximas dos horas.
            </p>
            <div className="space-y-5">
              <ProgressMeter label="Cocina principal · Sector A" value={94} accent="ink" />
              <ProgressMeter label="Prep station · Sector B"      value={62} accent="ink" />
              <ProgressMeter label="Empaque e-commerce"           value={45} accent="iris" />
            </div>
          </div>
        </Panel>

        <Panel index="04" title="Pasarela de pagos" meta="Bold · activo">
          <div className="p-6 space-y-5">
            <div className="border border-ink/15 p-5 bg-cream-warm">
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-display text-2xl text-ink tracking-tight leading-none">Bold</span>
                <StatusPill tone="success" label="Activo" />
              </div>
              <p className="font-serif italic text-[14px] text-ink/70 leading-snug">
                Botón embebido con firma de integridad — Tarjeta, PSE, Nequi, Daviplata.
              </p>
            </div>
            <div className="border border-ink/15 p-5 opacity-60">
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-display text-2xl text-ink tracking-tight leading-none">Wompi</span>
                <StatusPill tone="muted" label="Inactivo" />
              </div>
              <p className="font-serif italic text-[14px] text-ink/55 leading-snug">
                Deshabilitado en esta edición.
              </p>
            </div>
            <ul className="space-y-3 pt-3 border-t border-ink/15">
              <li className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em]">
                <span className="text-ink/65">Bold · Webhook</span>
                <StatusPill tone="success" label="Idempotente" />
              </li>
              <li className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em]">
                <span className="text-ink/65">Verificación HMAC</span>
                <StatusPill tone="warn" label="Pendiente" />
              </li>
            </ul>
          </div>
        </Panel>
      </div>
    </>
  );
}
