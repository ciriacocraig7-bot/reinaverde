"use client";

import Link from "next/link";
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

const MOCK_ORDERS = [
  { id: "RV-ABC123", event: "Almuerzo equipo",      total: 850000,  status: "IN_PRODUCTION", date: "28 mar 2026" },
  { id: "RV-DEF456", event: "Desayuno directivos",  total: 420000,  status: "DELIVERED",     date: "20 mar 2026" },
  { id: "RV-GHI789", event: "Team building",        total: 1200000, status: "COMPLETED",     date: "15 mar 2026" },
];

const STATUS_MAP: Record<string, { label: string; tone: "neutral" | "info" | "warn" | "success" | "danger" | "muted" }> = {
  DRAFT:           { label: "Borrador",      tone: "muted" },
  QUOTED:          { label: "Cotizado",      tone: "info" },
  PAYMENT_PENDING: { label: "Pend. pago",    tone: "warn" },
  PAID:            { label: "Pagado",        tone: "success" },
  IN_PRODUCTION:   { label: "Preparación",   tone: "info" },
  READY:           { label: "Listo",         tone: "success" },
  IN_TRANSIT:      { label: "En camino",     tone: "warn" },
  DELIVERED:       { label: "Entregado",     tone: "success" },
  COMPLETED:       { label: "Completado",    tone: "success" },
};

const QUICK_LINKS = [
  { href: "/catering/menu",      code: "CRP", label: "Carta de catering",  desc: "Cotizar un evento o pedir un almuerzo." },
  { href: "/pharma/catalogo",    code: "PHM", label: "Catálogo Pharma",    desc: "Aceites, tinturas, tópicos certificados." },
  { href: "/liofilizados/catalogo", code: "LIO", label: "Frutas liofilizadas", desc: "Snacks y mayorista de fruta colombiana." },
] as const;

export default function ClienteDashboard() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.firstName || "Cliente";

  const today = new Intl.DateTimeFormat("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(new Date()).toLowerCase();

  return (
    <>
      <DashHeader
        eyebrow="§ Portal del cliente"
        title={<>Hola, <span className="italic">{firstName}</span><span className="text-marigold">.</span></>}
        date={today}
      >
        <Link href="/catering/menu">
          <ActionBtn variant="marigold">+ Cotizar pedido</ActionBtn>
        </Link>
      </DashHeader>

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-ink/15">
        <div className="border-r border-b border-ink/15">
          <StatBlock label="Pedidos activos"  value="2"                       meta="1 en cocina" trend="up" accent="marigold" />
        </div>
        <div className="border-r border-b border-ink/15">
          <StatBlock label="Eventos próximos" value="1"                       meta="28 mar"      trend="flat" />
        </div>
        <div className="border-r border-b border-ink/15">
          <StatBlock label="Inversión total"  value={formatCurrency(2470000)} meta="últimos 12m" trend="up" />
        </div>
        <div className="border-r border-b border-ink/15">
          <StatBlock label="Calificación"     value="4.9"                     meta="3 reseñas"   trend="up" />
        </div>
      </div>

      {/* Recent orders */}
      <Panel
        index="01"
        title="Mis pedidos recientes"
        meta={`${MOCK_ORDERS.length} totales`}
        actions={
          <button
            onClick={() => toast.info("Historial completo · próximamente")}
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/65 hover:text-ink rv-link"
          >
            Ver todo
          </button>
        }
      >
        <div className="divide-y divide-ink/10">
          {MOCK_ORDERS.map((o, i) => {
            const status = STATUS_MAP[o.status] || { label: o.status, tone: "muted" as const };
            return (
              <button
                key={o.id}
                onClick={() => toast.info(`Detalles del pedido ${o.id}`)}
                className="w-full flex items-baseline justify-between px-6 py-5 hover:bg-cream-warm transition-colors text-left group"
              >
                <div className="flex items-baseline gap-5">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink/45 w-8 tabular">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-display text-xl tracking-tight text-ink leading-tight">
                      {o.event}
                    </p>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-ink/55 mt-1">
                      {o.id} · {o.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-baseline gap-6">
                  <StatusPill tone={status.tone} label={status.label} />
                  <span className="font-display text-xl tabular text-ink hidden sm:inline">
                    {formatCurrency(o.total)}
                  </span>
                  <span className="font-display text-xl text-ink/40 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
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
              <span className={cn(
                "font-mono text-[10.5px] uppercase tracking-[0.22em]",
                q.code === "CRP" && "text-marigold",
                q.code === "PHM" && "text-iris",
                q.code === "LIO" && "text-persimmon",
              )}>
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
