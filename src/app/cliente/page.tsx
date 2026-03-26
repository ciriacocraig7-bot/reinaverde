"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";
import { formatCurrency } from "@/lib/utils";

const MOCK_ORDERS = [
  { id: "RV-ABC123", event: "Almuerzo Equipo", total: 850000, status: "IN_PRODUCTION", date: "2026-03-28" },
  { id: "RV-DEF456", event: "Desayuno Directivos", total: 420000, status: "DELIVERED", date: "2026-03-20" },
  { id: "RV-GHI789", event: "Team Building", total: 1200000, status: "COMPLETED", date: "2026-03-15" },
];

const STATUS_MAP: Record<string, { label: string; variant: "default" | "info" | "warning" | "success"; dot: string }> = {
  DRAFT: { label: "Borrador", variant: "default", dot: "bg-gray-500" },
  QUOTED: { label: "Cotizado", variant: "info", dot: "bg-blue-500" },
  PAYMENT_PENDING: { label: "Pendiente Pago", variant: "warning", dot: "bg-amber-500" },
  PAID: { label: "Pagado", variant: "success", dot: "bg-emerald-500" },
  IN_PRODUCTION: { label: "En Preparación", variant: "info", dot: "bg-blue-500 animate-pulse" },
  READY: { label: "Listo", variant: "success", dot: "bg-emerald-500" },
  IN_TRANSIT: { label: "En Camino", variant: "warning", dot: "bg-indigo-500" },
  DELIVERED: { label: "Entregado", variant: "success", dot: "bg-emerald-500" },
  COMPLETED: { label: "Completado", variant: "success", dot: "bg-emerald-500" },
};

export default function ClienteDashboard() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-on-surface-variant text-xs uppercase tracking-[0.2em] mb-2">Portal de Cliente</p>
          <h1 className="text-4xl font-semibold tracking-tight text-on-surface">
            Hola, {user?.firstName || "Cliente"}
          </h1>
        </div>
        <Link href="/catering/menu">
          <button className="px-6 py-2.5 bg-gradient-to-br from-primary-container to-primary text-on-primary rounded-xl font-semibold text-sm shadow-lg shadow-primary/10 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">add</span>
            Nuevo Pedido
          </button>
        </Link>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Pedidos Activos", value: "2", icon: "receipt_long" },
          { title: "Eventos Próximos", value: "1", icon: "event" },
          { title: "Total Gastado", value: formatCurrency(2470000), icon: "payments" },
          { title: "Calificación Prom.", value: "4.9", icon: "star" },
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

      {/* Recent Orders */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
        <div className="p-6 border-b border-outline-variant/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant">receipt_long</span>
            <h4 className="text-lg font-semibold tracking-tight">Mis Pedidos Recientes</h4>
          </div>
          <Link href="/cliente/pedidos" className="text-primary-container font-semibold text-sm flex items-center gap-1 hover:underline">
            Ver todos <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
        <div className="divide-y divide-outline-variant/5">
          {MOCK_ORDERS.map((order) => {
            const status = STATUS_MAP[order.status] || { label: order.status, variant: "default" as const, dot: "bg-gray-500" };
            return (
              <div key={order.id} className="flex items-center justify-between p-5 hover:bg-surface-container-low/50 transition-colors cursor-pointer">
                <div>
                  <p className="font-medium text-on-surface">{order.event}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{order.id} · {order.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={status.variant}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                    {status.label}
                  </Badge>
                  <span className="font-semibold text-on-surface hidden sm:inline">{formatCurrency(order.total)}</span>
                  <span className="material-symbols-outlined text-on-surface-variant text-lg">chevron_right</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { href: "/menu", icon: "restaurant_menu", title: "Hacer Pedido", desc: "Explora nuestro menú y ordena" },
          { href: "/cliente/eventos", icon: "event", title: "Crear Evento", desc: "Planifica tu próximo evento" },
          { href: "/cliente/feedback", icon: "star", title: "Calificar", desc: "Deja tu opinión sobre el servicio" },
        ].map((action) => (
          <Link key={action.href} href={action.href}>
            <div className="bg-surface-container-lowest rounded-2xl p-6 flex flex-col items-center text-center gap-3 border border-outline-variant/10 shadow-sm hover:translate-y-[-2px] transition-all duration-300 cursor-pointer h-full">
              <div className="p-3 rounded-xl bg-primary-fixed">
                <span className="material-symbols-outlined text-primary text-2xl">{action.icon}</span>
              </div>
              <h3 className="font-bold text-on-surface">{action.title}</h3>
              <p className="text-sm text-on-surface-variant">{action.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
