"use client";

import { useState } from "react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import {
  DashHeader,
  StatBlock,
  Panel,
  StatusPill,
  ActionBtn,
  DataTable,
} from "@/components/dashboard/primitives";

const SUPPLIER_ORDERS = [
  { id: "SO-001", items: "Salmón fresco (10kg), Maracuyá (5kg)",            total: 450000, status: "SENT",      date: "26 mar 2026" },
  { id: "SO-002", items: "Chocolate 70% (3kg), Crema de leche (5L)",        total: 180000, status: "CONFIRMED", date: "25 mar 2026" },
  { id: "SO-003", items: "Pollo pechuga (15kg), Champiñones (3kg)",         total: 320000, status: "DELIVERED", date: "22 mar 2026" },
  { id: "SO-004", items: "Quinoa (5kg), Frijoles negros (10kg), Aguacate (20u)", total: 210000, status: "DRAFT",     date: "27 mar 2026" },
];

const HIGH_DEMAND = [
  { name: "Salmón fresco",      demand: "high",   trend: "+25%", freq: "3×/sem" },
  { name: "Pechuga de pollo",   demand: "high",   trend: "+15%", freq: "4×/sem" },
  { name: "Frutas tropicales",  demand: "medium", trend: "+10%", freq: "2×/sem" },
  { name: "Chocolate premium",  demand: "medium", trend: "+8%",  freq: "1×/sem" },
];

const STATUS_MAP: Record<string, { label: string; tone: "neutral" | "info" | "warn" | "success" | "muted" }> = {
  DRAFT:     { label: "Borrador",   tone: "muted"   },
  SENT:      { label: "Enviado",    tone: "info"    },
  CONFIRMED: { label: "Confirmado", tone: "warn"    },
  DELIVERED: { label: "Entregado",  tone: "success" },
};

export default function ProveedorDashboard() {
  const [orders, setOrders] = useState(SUPPLIER_ORDERS);

  const confirm = (id: string) => {
    setOrders((p) => p.map((o) => o.id === id ? { ...o, status: "CONFIRMED" } : o));
    toast.success(`Pedido ${id} confirmado`);
  };

  const markDelivered = (id: string) => {
    setOrders((p) => p.map((o) => o.id === id ? { ...o, status: "DELIVERED" } : o));
    toast.success(`Pedido ${id} entregado`);
  };

  const active        = orders.filter((o) => o.status !== "DELIVERED").length;
  const pendingConfm  = orders.filter((o) => o.status === "SENT").length;
  const delivered     = orders.filter((o) => o.status === "DELIVERED").length;
  const monthRevenue  = orders.filter((o) => o.status === "DELIVERED").reduce((s, o) => s + o.total, 0);

  const today = new Intl.DateTimeFormat("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(new Date()).toLowerCase();

  return (
    <>
      <DashHeader
        eyebrow="§ Proveedor · Insumos"
        title={<>Cadena de <span className="italic">insumos</span><span className="text-persimmon">.</span></>}
        date={today}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-ink/15">
        <div className="border-r border-b border-ink/15">
          <StatBlock label="Pedidos activos" value={String(active)}        meta="en curso"     trend="flat" />
        </div>
        <div className="border-r border-b border-ink/15">
          <StatBlock label="Por confirmar"   value={String(pendingConfm)}  meta="acción tuya"  trend="warn" accent="persimmon" />
        </div>
        <div className="border-r border-b border-ink/15">
          <StatBlock label="Entregados"      value={String(delivered)}     meta="este mes"     trend="up" />
        </div>
        <div className="border-r border-b border-ink/15">
          <StatBlock label="Facturado mes"   value={formatCurrency(monthRevenue)} meta="confirmado" trend="up" />
        </div>
      </div>

      <Panel index="01" title="Pedidos de insumos" meta={`${orders.length} totales`}>
        <DataTable
          columns={[
            { key: "id",     label: "ID" },
            { key: "items",  label: "Items" },
            { key: "date",   label: "Fecha" },
            { key: "total",  label: "Total",  align: "right" as const },
            { key: "status", label: "Estado" },
            { key: "act",    label: "Acción", align: "right" as const },
          ]}
        >
          {orders.map((o) => {
            const status = STATUS_MAP[o.status] || { label: o.status, tone: "muted" as const };
            return (
              <tr key={o.id} className="hover:bg-cream-warm transition-colors">
                <td className="px-6 py-4 font-mono text-[12px] text-ink tabular">{o.id}</td>
                <td className="px-6 py-4 font-sans text-[14px] text-ink/85 max-w-md">{o.items}</td>
                <td className="px-6 py-4 font-mono text-[11px] uppercase tracking-wider text-ink/65">
                  {o.date}
                </td>
                <td className="px-6 py-4 font-display text-[16px] text-ink tabular text-right">
                  {formatCurrency(o.total)}
                </td>
                <td className="px-6 py-4">
                  <StatusPill tone={status.tone} label={status.label} />
                </td>
                <td className="px-6 py-4 text-right">
                  {o.status === "SENT" && (
                    <ActionBtn variant="persimmon" onClick={() => confirm(o.id)} className="h-9 px-4">
                      Confirmar
                    </ActionBtn>
                  )}
                  {o.status === "CONFIRMED" && (
                    <ActionBtn variant="outline" onClick={() => markDelivered(o.id)} className="h-9 px-4">
                      Marcar entregado
                    </ActionBtn>
                  )}
                </td>
              </tr>
            );
          })}
        </DataTable>
      </Panel>

      <Panel index="02" title="Productos con demanda alta" meta="tendencia 30d">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-x divide-ink/15">
          {HIGH_DEMAND.map((p, i) => (
            <div key={p.name} className="p-6 border-t border-ink/15 sm:border-t-0">
              <div className="flex items-baseline justify-between mb-3">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-persimmon tabular">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <StatusPill
                  tone={p.demand === "high" ? "warn" : "info"}
                  label={p.demand === "high" ? "Alta" : "Media"}
                />
              </div>
              <p className="font-display text-xl tracking-tight text-ink leading-tight mb-3">
                {p.name}
              </p>
              <div className="flex items-baseline justify-between pt-3 border-t border-ink/10">
                <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink/55">
                  {p.freq}
                </span>
                <span className="font-display text-lg tabular text-ink">{p.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
