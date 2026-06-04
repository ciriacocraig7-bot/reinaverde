"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { formatCurrency, cn } from "@/lib/utils";
import {
  DashHeader,
  StatBlock,
  Panel,
  StatusPill,
  ActionBtn,
} from "@/components/dashboard/primitives";

interface OverviewRow {
  kind: "catering-order" | "shop-order" | "quote";
  id: string;
  reference: string;
  title: string;
  subtitle: string;
  status: string;
  total: number;
  date: string;
  href: string | null;
  businessLine: "CATERING" | "PHARMA" | "LIOFILIZADOS" | null;
}

interface Overview {
  rows: OverviewRow[];
  kpis: {
    activeOrders: number;
    upcomingEvents: number;
    investmentLast12m: number;
    totalPedidos: number;
    lastEventDate: string | null;
  };
}

const STATUS_MAP: Record<
  string,
  { label: string; tone: "neutral" | "info" | "warn" | "success" | "danger" | "muted" }
> = {
  // Quote
  DRAFT:            { label: "Borrador",         tone: "muted" },
  SENT:             { label: "Cotizado",         tone: "info" },
  ACCEPTED:         { label: "Aceptado",         tone: "info" },
  PAYMENT_PENDING:  { label: "Pend. pago",       tone: "warn" },
  PAID:             { label: "Pagado",           tone: "success" },
  EXPIRED:          { label: "Expirado",         tone: "muted" },
  REJECTED:         { label: "Rechazado",        tone: "danger" },
  CONVERTED:        { label: "Convertida",       tone: "success" },
  // Order catering
  QUOTED:           { label: "Cotizado",         tone: "info" },
  IN_PRODUCTION:    { label: "En cocina",        tone: "info" },
  READY:            { label: "Listo",            tone: "success" },
  IN_TRANSIT:       { label: "En camino",        tone: "warn" },
  DELIVERED:        { label: "Entregado",        tone: "success" },
  COMPLETED:        { label: "Completado",       tone: "success" },
  CANCELLED:        { label: "Cancelado",        tone: "danger" },
  // ShopOrder
  PENDING:          { label: "Pendiente",        tone: "muted" },
  CONFIRMED:        { label: "Confirmado",       tone: "info" },
  PROCESSING:       { label: "Preparando",       tone: "info" },
  SHIPPED:          { label: "Despachado",       tone: "warn" },
  REFUNDED:         { label: "Reembolsado",      tone: "muted" },
};

const KIND_PILL: Record<
  OverviewRow["kind"],
  { label: string; accent: "marigold" | "iris" | "persimmon" | "ink" }
> = {
  "catering-order": { label: "Catering", accent: "marigold" },
  "shop-order":     { label: "Tienda",   accent: "iris" },
  "quote":          { label: "Cotización", accent: "marigold" },
};

const QUICK_LINKS = [
  { href: "/catering/cotizar",      code: "CRP", label: "Cotizar evento",       desc: "Diseñe su próximo evento con desglose completo." },
  { href: "/pharma/catalogo",       code: "PHM", label: "Catálogo Pharma",      desc: "Aceites, tinturas, tópicos certificados." },
  { href: "/liofilizados/catalogo", code: "LIO", label: "Frutas liofilizadas",  desc: "Snacks y mayorista de fruta colombiana." },
] as const;

export default function ClienteDashboard() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.firstName || "Cliente";

  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch("/api/cliente/overview", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setOverview(d);
      })
      .catch((e) => toast.error(`Error cargando panel: ${e.message}`))
      .finally(() => setLoading(false));
  }, []);

  const today = new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(new Date())
    .toLowerCase();

  const visibleRows = showAll ? overview?.rows : overview?.rows.slice(0, 5);
  const lastEventLabel = overview?.kpis.lastEventDate
    ? new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short" })
        .format(new Date(overview.kpis.lastEventDate))
        .toLowerCase()
    : null;

  return (
    <>
      <DashHeader
        eyebrow="§ Portal del cliente"
        title={
          <>
            Hola, <span className="italic">{firstName}</span>
            <span className="text-marigold">.</span>
          </>
        }
        date={today}
      >
        <Link href="/catering/cotizar">
          <ActionBtn variant="marigold">+ Cotizar evento</ActionBtn>
        </Link>
      </DashHeader>

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-ink/15">
        <div className="border-r border-b border-ink/15">
          <StatBlock
            label="Pedidos activos"
            value={loading ? "…" : String(overview?.kpis.activeOrders ?? 0)}
            meta={overview?.kpis.upcomingEvents ? `${overview.kpis.upcomingEvents} próximos` : "en curso"}
            trend="up"
            accent="marigold"
          />
        </div>
        <div className="border-r border-b border-ink/15">
          <StatBlock
            label="Eventos próximos"
            value={loading ? "…" : String(overview?.kpis.upcomingEvents ?? 0)}
            meta={lastEventLabel ? `próx. ${lastEventLabel}` : "—"}
            trend="flat"
          />
        </div>
        <div className="border-r border-b border-ink/15">
          <StatBlock
            label="Inversión 12 meses"
            value={loading ? "…" : formatCurrency(overview?.kpis.investmentLast12m ?? 0)}
            meta="confirmados"
            trend="up"
          />
        </div>
        <div className="border-r border-b border-ink/15">
          <StatBlock
            label="Total de pedidos"
            value={loading ? "…" : String(overview?.kpis.totalPedidos ?? 0)}
            meta="histórico"
            trend="flat"
          />
        </div>
      </div>

      {/* Pedidos recientes */}
      <Panel
        index="01"
        title="Mi historial"
        meta={
          loading
            ? "Cargando…"
            : `${overview?.kpis.totalPedidos ?? 0} totales`
        }
        actions={
          (overview?.rows.length ?? 0) > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/65 hover:text-ink rv-link"
            >
              {showAll ? "▴ Ocultar antiguos" : "▾ Ver todo"}
            </button>
          )
        }
      >
        {loading ? (
          <div className="px-6 py-16 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55">
            Cargando…
          </div>
        ) : !overview || overview.rows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-display text-2xl text-ink mb-2">
              Aún no tiene pedidos.
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55 mb-6">
              Cuando cotice un evento o haga una compra, aparecerá acá.
            </p>
            <Link
              href="/catering/cotizar"
              className="inline-flex items-center h-10 px-5 bg-marigold text-ink font-sans text-[13px] tracking-tight rv-press hover:bg-marigold-deep hover:text-cream"
            >
              Cotizar primer evento →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-ink/10">
            {visibleRows!.map((r, i) => {
              const status = STATUS_MAP[r.status] || {
                label: r.status,
                tone: "muted" as const,
              };
              const kind = KIND_PILL[r.kind];
              const Row = (
                <div className="grid grid-cols-[2.5rem_1fr_auto] sm:grid-cols-[2.5rem_1fr_auto_auto_auto] items-baseline gap-x-5 px-6 py-5">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink/45 tabular pt-1">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-display text-xl tracking-tight text-ink leading-tight">
                      {r.title}
                    </p>
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink/55 mt-1">
                      {r.subtitle} · {r.reference}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "hidden sm:inline font-mono text-[10px] uppercase tracking-[0.22em]",
                      kind.accent === "marigold" && "text-marigold-deep",
                      kind.accent === "iris" && "text-iris-deep",
                      kind.accent === "persimmon" && "text-persimmon",
                      kind.accent === "ink" && "text-ink/65",
                    )}
                  >
                    {kind.label}
                  </span>
                  <StatusPill tone={status.tone} label={status.label} />
                  <span className="font-display text-xl tabular text-ink hidden sm:inline-block w-32 text-right">
                    {formatCurrency(r.total)}
                  </span>
                </div>
              );

              return r.href ? (
                <Link
                  key={r.id}
                  href={r.href}
                  className="block hover:bg-cream-warm transition-colors"
                >
                  {Row}
                </Link>
              ) : (
                <div key={r.id} className="hover:bg-cream-warm transition-colors">
                  {Row}
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      {/* Quick links */}
      <Panel index="02" title="Empezar algo nuevo" meta="3 divisiones">
        <div className="grid sm:grid-cols-3 divide-x divide-ink/15">
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="block p-6 hover:bg-cream-warm transition-colors group"
            >
              <span
                className={cn(
                  "font-mono text-[10.5px] uppercase tracking-[0.22em]",
                  q.code === "CRP" && "text-marigold-deep",
                  q.code === "PHM" && "text-iris-deep",
                  q.code === "LIO" && "text-persimmon",
                )}
              >
                {q.code}
              </span>
              <h3 className="mt-3 font-display text-2xl tracking-tight text-ink leading-tight">
                {q.label}
              </h3>
              <p className="mt-3 font-serif italic text-[14px] leading-snug text-ink/65">
                {q.desc}
              </p>
              <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.22em] text-ink group-hover:translate-x-1 transition-transform">
                Entrar →
              </p>
            </Link>
          ))}
        </div>
      </Panel>
    </>
  );
}
