"use client";

import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const FINANCIAL_KPIS = [
  { title: "Ingresos Mes", value: formatCurrency(45800000), change: "+12.5%", up: true, icon: "payments" },
  { title: "Costos Operativos", value: formatCurrency(22100000), change: "+5.2%", up: true, icon: "trending_down" },
  { title: "Margen Neto", value: "38.2%", change: "+3.1%", up: true, icon: "trending_up" },
  { title: "Facturas Pendientes", value: "8", change: formatCurrency(12500000), up: false, icon: "receipt" },
];

const RECENT_PAYMENTS = [
  { id: "PAY-001", client: "TechCorp S.A.S", initials: "TC", amount: 2850000, method: "PSE", status: "APPROVED", date: "2026-03-26" },
  { id: "PAY-002", client: "María López", initials: "ML", amount: 4250000, method: "Tarjeta Crédito", status: "APPROVED", date: "2026-03-25" },
  { id: "PAY-003", client: "Innovatech", initials: "IN", amount: 1200000, method: "Nequi", status: "PENDING", date: "2026-03-25" },
  { id: "PAY-004", client: "StartUp Labs", initials: "SL", amount: 950000, method: "PSE", status: "APPROVED", date: "2026-03-24" },
  { id: "PAY-005", client: "Banco Nacional", initials: "BN", amount: 3200000, method: "Tarjeta Crédito", status: "DECLINED", date: "2026-03-24" },
];

const PENDING_INVOICES = [
  { number: "FAC-2026-001", client: "TechCorp S.A.S", amount: 2850000, due: "2026-04-05", overdue: false },
  { number: "FAC-2026-002", client: "Innovatech", amount: 1200000, due: "2026-03-28", overdue: true },
  { number: "FAC-2026-003", client: "Banco Nacional", amount: 3200000, due: "2026-04-10", overdue: false },
];

const PAYMENT_STATUS: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive"; dot: string }> = {
  APPROVED: { label: "Aprobado", variant: "success", dot: "bg-emerald-500" },
  PENDING: { label: "Pendiente", variant: "warning", dot: "bg-amber-500" },
  DECLINED: { label: "Rechazado", variant: "destructive", dot: "bg-red-500" },
};

export default function FinanzasDashboard() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-on-surface-variant text-xs uppercase tracking-[0.2em] mb-2">Facturación y Reportes</p>
        <h1 className="text-4xl font-semibold tracking-tight text-on-surface">Panel de Finanzas</h1>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FINANCIAL_KPIS.map((kpi) => (
          <div key={kpi.title} className="bg-surface-container-lowest rounded-xl p-5 shadow-sm shadow-emerald-900/5 border border-outline-variant/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3">
              <span className="material-symbols-outlined text-primary-fixed-dim text-3xl opacity-20">{kpi.icon}</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{kpi.title}</p>
            <p className="text-2xl font-semibold text-on-surface mt-1">{kpi.value}</p>
            <div className="mt-3 flex items-center gap-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${kpi.up ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                <span className="material-symbols-outlined text-[12px]">{kpi.up ? "trending_up" : "schedule"}</span> {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Payments Table */}
        <div className="lg:col-span-2">
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
            <div className="p-6 border-b border-outline-variant/5 flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant">credit_card</span>
              <h4 className="text-lg font-semibold tracking-tight">Pagos Recientes</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/10">
                    <th className="px-6 py-3">Cliente</th>
                    <th className="px-6 py-3">Método</th>
                    <th className="px-6 py-3">Monto</th>
                    <th className="px-6 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {RECENT_PAYMENTS.map((pay) => {
                    const status = PAYMENT_STATUS[pay.status] || { label: pay.status, variant: "default" as const, dot: "bg-gray-500" };
                    return (
                      <tr key={pay.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-900 font-bold text-xs">{pay.initials}</div>
                            <div>
                              <span className="text-sm font-medium">{pay.client}</span>
                              <p className="text-xs text-on-surface-variant">{pay.id} · {pay.date}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">{pay.method}</td>
                        <td className="px-6 py-4 text-sm font-semibold">{formatCurrency(pay.amount)}</td>
                        <td className="px-6 py-4">
                          <Badge variant={status.variant}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                            {status.label}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pending Invoices */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-outline-variant/5 flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant">receipt_long</span>
              <h4 className="font-semibold tracking-tight">Facturas Pendientes</h4>
            </div>
            <div className="p-5 space-y-3">
              {PENDING_INVOICES.map((inv) => (
                <div key={inv.number} className={`p-3 rounded-lg ${inv.overdue ? "bg-red-50" : "bg-surface-container-low"}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-on-surface">{inv.client}</p>
                    {inv.overdue && <Badge variant="destructive">Vencida</Badge>}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">{inv.number}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-on-surface-variant">Vence: {inv.due}</span>
                    <span className="text-sm font-semibold text-on-surface">{formatCurrency(inv.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-outline-variant/5 flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant">bar_chart</span>
              <h4 className="font-semibold tracking-tight">Desglose de Ingresos</h4>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: "Corporativo", pct: 65, amount: 29770000, color: "bg-primary" },
                { label: "Bodas", pct: 20, amount: 9160000, color: "bg-pink-500" },
                { label: "Social", pct: 10, amount: 4580000, color: "bg-purple-500" },
                { label: "Suscripciones", pct: 5, amount: 2290000, color: "bg-amber-500" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">
                    <span>{item.label}</span>
                    <span>{item.pct}%</span>
                  </div>
                  <div className="w-full bg-surface-container-low rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                  <p className="text-xs text-on-surface-variant/60 mt-0.5">{formatCurrency(item.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
