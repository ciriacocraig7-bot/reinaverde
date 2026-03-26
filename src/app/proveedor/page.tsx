"use client";

import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const SUPPLIER_ORDERS = [
  { id: "SO-001", items: "Salmón fresco (10kg), Maracuyá (5kg)", total: 450000, status: "SENT", date: "2026-03-26" },
  { id: "SO-002", items: "Chocolate 70% (3kg), Crema de leche (5L)", total: 180000, status: "CONFIRMED", date: "2026-03-25" },
  { id: "SO-003", items: "Pollo pechuga (15kg), Champiñones (3kg)", total: 320000, status: "DELIVERED", date: "2026-03-22" },
  { id: "SO-004", items: "Quinoa (5kg), Frijoles negros (10kg), Aguacate (20u)", total: 210000, status: "DRAFT", date: "2026-03-27" },
];

const STATUS_MAP: Record<string, { label: string; variant: "default" | "info" | "warning" | "success"; dot: string }> = {
  DRAFT: { label: "Borrador", variant: "default", dot: "bg-gray-500" },
  SENT: { label: "Enviado", variant: "info", dot: "bg-blue-500" },
  CONFIRMED: { label: "Confirmado", variant: "warning", dot: "bg-amber-500" },
  DELIVERED: { label: "Entregado", variant: "success", dot: "bg-emerald-500" },
};

export default function ProveedorDashboard() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-on-surface-variant text-xs uppercase tracking-[0.2em] mb-2">Gestión de Insumos</p>
        <h1 className="text-4xl font-semibold tracking-tight text-on-surface">Panel de Proveedor</h1>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Pedidos Activos", value: "3", icon: "receipt_long" },
          { title: "Por Confirmar", value: "1", icon: "schedule" },
          { title: "Entregados (Mes)", value: "12", icon: "check_circle" },
          { title: "Ingresos Mes", value: formatCurrency(2800000), icon: "trending_up" },
        ].map((stat) => (
          <div key={stat.title} className="bg-surface-container-lowest rounded-xl p-5 shadow-sm shadow-emerald-900/5 border border-outline-variant/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3">
              <span className="material-symbols-outlined text-primary-fixed-dim text-3xl opacity-20">{stat.icon}</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{stat.title}</p>
            <p className="text-2xl font-semibold text-on-surface mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
        <div className="p-6 border-b border-outline-variant/5 flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant">inventory_2</span>
          <h4 className="text-lg font-semibold tracking-tight">Pedidos de Insumos</h4>
        </div>
        <div className="divide-y divide-outline-variant/5">
          {SUPPLIER_ORDERS.map((order) => {
            const status = STATUS_MAP[order.status] || { label: order.status, variant: "default" as const, dot: "bg-gray-500" };
            return (
              <div key={order.id} className="flex items-center justify-between p-5 hover:bg-surface-container-low/50 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-on-surface">{order.id}</p>
                    <Badge variant={status.variant}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-on-surface-variant truncate mt-0.5">{order.items}</p>
                  <p className="text-xs text-on-surface-variant/60 mt-0.5">{order.date}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="font-semibold text-on-surface">{formatCurrency(order.total)}</span>
                  {order.status === "SENT" && (
                    <button className="px-4 py-2 bg-gradient-to-br from-primary-container to-primary text-on-primary rounded-xl font-semibold text-xs shadow-sm hover:brightness-110 active:scale-95 transition-all">Confirmar</button>
                  )}
                  {order.status === "CONFIRMED" && (
                    <button className="px-4 py-2 bg-surface-container-lowest border border-outline-variant/20 text-on-surface rounded-xl font-semibold text-xs hover:bg-surface-container-high transition-colors active:scale-95">Marcar Entregado</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant/5 flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-500">trending_up</span>
          <h4 className="font-semibold tracking-tight">Productos con Demanda Alta</h4>
        </div>
        <div className="p-6">
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { name: "Salmón fresco", demand: "Alta", trend: "+25%", freq: "3x/semana" },
              { name: "Pechuga de pollo", demand: "Alta", trend: "+15%", freq: "4x/semana" },
              { name: "Frutas tropicales", demand: "Media", trend: "+10%", freq: "2x/semana" },
              { name: "Chocolate premium", demand: "Media", trend: "+8%", freq: "1x/semana" },
            ].map((product) => (
              <div key={product.name} className="p-3 bg-surface-container-low rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-on-surface">{product.name}</p>
                  <Badge variant={product.demand === "Alta" ? "warning" : "secondary"}>
                    {product.demand}
                  </Badge>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">
                  Tendencia: {product.trend} · Frecuencia: {product.freq}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
