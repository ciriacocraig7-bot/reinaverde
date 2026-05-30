"use client";

import { formatCurrency, cn } from "@/lib/utils";
import {
  DashHeader,
  StatBlock,
  Panel,
  StatusPill,
  DataTable,
  Avatar,
  ActionBtn,
} from "@/components/dashboard/primitives";
import { toast } from "sonner";

const FINANCIAL_KPIS = [
  { label: "Ingresos · mes",     value: formatCurrency(45800000), meta: "+12.5%",                trend: "up"   as const },
  { label: "Costos operativos",  value: formatCurrency(22100000), meta: "+5.2%",                 trend: "up"   as const, accent: "marigold" as const },
  { label: "Margen neto",        value: "38.2%",                  meta: "+3.1pp",                trend: "up"   as const },
  { label: "Por cobrar",         value: "8",                      meta: formatCurrency(12500000), trend: "warn" as const, accent: "persimmon" as const },
];

const RECENT_PAYMENTS = [
  { id: "PAY-001", client: "TechCorp S.A.S",  initials: "TC", amount: 2850000, method: "PSE",             status: "APPROVED", date: "26 mar" },
  { id: "PAY-002", client: "María López",      initials: "ML", amount: 4250000, method: "Tarjeta crédito", status: "APPROVED", date: "25 mar" },
  { id: "PAY-003", client: "Innovatech",       initials: "IN", amount: 1200000, method: "Nequi",           status: "PENDING",  date: "25 mar" },
  { id: "PAY-004", client: "StartUp Labs",     initials: "SL", amount: 950000,  method: "PSE",             status: "APPROVED", date: "24 mar" },
  { id: "PAY-005", client: "Banco Nacional",   initials: "BN", amount: 3200000, method: "Tarjeta crédito", status: "DECLINED", date: "24 mar" },
];

const PENDING_INVOICES = [
  { number: "FAC-2026-001", client: "TechCorp S.A.S",  amount: 2850000, due: "5 abr",  overdue: false },
  { number: "FAC-2026-002", client: "Innovatech",      amount: 1200000, due: "28 mar", overdue: true  },
  { number: "FAC-2026-003", client: "Banco Nacional",  amount: 3200000, due: "10 abr", overdue: false },
];

const PAYMENT_STATUS: Record<string, { label: string; tone: "neutral" | "info" | "warn" | "success" | "danger" | "muted" }> = {
  APPROVED: { label: "Aprobado",   tone: "success" },
  PENDING:  { label: "Pendiente",  tone: "warn"    },
  DECLINED: { label: "Rechazado",  tone: "danger"  },
};

const REVENUE_BREAKDOWN = [
  { label: "Corporativo",   pct: 65, amount: 29770000, accent: "ink"       as const },
  { label: "Bodas",         pct: 20, amount: 9160000,  accent: "marigold"  as const },
  { label: "Social",        pct: 10, amount: 4580000,  accent: "iris"      as const },
  { label: "Suscripciones", pct: 5,  amount: 2290000,  accent: "persimmon" as const },
];

export default function FinanzasDashboard() {
  const today = new Intl.DateTimeFormat("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(new Date()).toLowerCase();

  return (
    <>
      <DashHeader
        eyebrow="§ Finanzas · Caja"
        title={<>Estado de <span className="italic">caja</span><span className="text-ink/40">.</span></>}
        date={today}
      >
        <ActionBtn variant="outline" onClick={() => toast.info("Exportar reporte mensual")}>
          Exportar reporte
        </ActionBtn>
      </DashHeader>

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-ink/15">
        {FINANCIAL_KPIS.map((k) => (
          <div key={k.label} className="border-r border-b border-ink/15">
            <StatBlock {...k} />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
        {/* Recent payments */}
        <Panel index="01" title="Pagos recientes" meta={`${RECENT_PAYMENTS.length} transacciones`}>
          <DataTable
            columns={[
              { key: "client", label: "Cliente" },
              { key: "method", label: "Método" },
              { key: "amount", label: "Monto",  align: "right" as const },
              { key: "status", label: "Estado" },
            ]}
          >
            {RECENT_PAYMENTS.map((p) => {
              const status = PAYMENT_STATUS[p.status] || { label: p.status, tone: "muted" as const };
              return (
                <tr key={p.id} className="hover:bg-cream-warm transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar initials={p.initials} size="sm" />
                      <div>
                        <p className="font-sans text-[14px] text-ink">{p.client}</p>
                        <p className="font-mono text-[10.5px] uppercase tracking-wider text-ink/55 mt-0.5">
                          {p.id} · {p.date}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-[11px] uppercase tracking-wider text-ink/75">
                    {p.method}
                  </td>
                  <td className="px-6 py-4 font-display text-[16px] text-ink tabular text-right">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill tone={status.tone} label={status.label} />
                  </td>
                </tr>
              );
            })}
          </DataTable>
        </Panel>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pending invoices */}
          <Panel index="02" title="Facturas pendientes" meta={`${PENDING_INVOICES.length}`}>
            <ul className="divide-y divide-ink/10">
              {PENDING_INVOICES.map((inv, i) => (
                <li key={inv.number} className="px-6 py-5">
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <div className="flex items-baseline gap-3 min-w-0">
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink/45 tabular shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="font-display text-base tracking-tight text-ink leading-tight truncate">
                        {inv.client}
                      </p>
                    </div>
                    {inv.overdue && <StatusPill tone="danger" label="Vencida" />}
                  </div>
                  <p className="font-mono text-[10.5px] uppercase tracking-wider text-ink/55 mb-3 pl-7">
                    {inv.number}
                  </p>
                  <div className="flex items-baseline justify-between pl-7">
                    <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink/55">
                      Vence {inv.due}
                    </span>
                    <span className="font-display text-lg tabular text-ink">
                      {formatCurrency(inv.amount)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          {/* Revenue breakdown */}
          <Panel index="03" title="Desglose de ingresos" meta="mes en curso">
            <div className="p-6 space-y-5">
              {REVENUE_BREAKDOWN.map((b) => (
                <div key={b.label}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink/70">
                      {b.label}
                    </span>
                    <span className="font-display text-base tabular text-ink">
                      {b.pct}<span className="text-ink/55 text-xs">%</span>
                    </span>
                  </div>
                  <div className="h-1 bg-ink/10 relative mb-1.5">
                    <div
                      className={cn(
                        "h-full",
                        b.accent === "ink"       && "bg-ink",
                        b.accent === "marigold"  && "bg-marigold",
                        b.accent === "iris"      && "bg-iris",
                        b.accent === "persimmon" && "bg-persimmon",
                      )}
                      style={{ width: `${b.pct}%` }}
                    />
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink/45">
                    {formatCurrency(b.amount)}
                  </p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
