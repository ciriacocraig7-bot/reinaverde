"use client";

import { Badge } from "@/components/ui/badge";

const PRODUCTION_ORDERS = [
  { id: "RV-ABC123", event: "Almuerzo TechCorp", items: ["15x Bandeja Paisa", "10x Salmón Maracuyá", "5x Bowl Vegano", "25x Tres Leches"], guests: 30, deliveryTime: "12:00 PM", deliveryDate: "2026-03-28", status: "IN_PROGRESS", priority: "high" },
  { id: "RV-DEF456", event: "Desayuno Directivos", items: ["20x Empanadas", "15x Ensalada Caesar", "20x Café Premium"], guests: 20, deliveryTime: "8:00 AM", deliveryDate: "2026-03-29", status: "PENDING", priority: "high" },
  { id: "RV-GHI789", event: "Coffee Break Innovatech", items: ["30x Tabla de Quesos", "30x Jugo Natural", "30x Mousse Chocolate"], guests: 30, deliveryTime: "3:00 PM", deliveryDate: "2026-03-29", status: "PENDING", priority: "medium" },
  { id: "RV-JKL012", event: "Boda López-García", items: ["60x Salmón Maracuyá", "40x Pollo Champiñones", "20x Bowl Vegano", "120x Tres Leches"], guests: 120, deliveryTime: "6:00 PM", deliveryDate: "2026-04-05", status: "PENDING", priority: "low" },
];

const LOW_STOCK = [
  { name: "Salmón fresco", stock: "2 kg", min: "5 kg" },
  { name: "Maracuyá", stock: "1 kg", min: "3 kg" },
  { name: "Chocolate 70%", stock: "500 g", min: "2 kg" },
];

const STATUS_LABELS: Record<string, { label: string; dot: string }> = {
  PENDING: { label: "Pendiente", dot: "bg-amber-500" },
  IN_PROGRESS: { label: "En Preparación", dot: "bg-blue-500 animate-pulse" },
  QUALITY_CHECK: { label: "Control Calidad", dot: "bg-purple-500" },
  COMPLETED: { label: "Completado", dot: "bg-emerald-500" },
};

const PRIORITY_BORDER: Record<string, string> = {
  high: "border-l-red-500",
  medium: "border-l-amber-500",
  low: "border-l-blue-500",
};

export default function ChefDashboard() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-on-surface-variant text-xs uppercase tracking-[0.2em] mb-2">Gestión de Producción</p>
        <h1 className="text-4xl font-semibold tracking-tight text-on-surface">Panel de Cocina</h1>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Pendientes", value: "3", icon: "schedule" },
          { title: "En Preparación", value: "1", icon: "restaurant_menu" },
          { title: "Listos Hoy", value: "2", icon: "check_circle" },
          { title: "Stock Bajo", value: "3", icon: "warning" },
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Production Queue */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold tracking-tight text-on-surface">Cola de Producción</h2>
          {PRODUCTION_ORDERS.map((order) => {
            const st = STATUS_LABELS[order.status] || { label: order.status, dot: "bg-gray-500" };
            return (
              <div key={order.id} className={`bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/10 shadow-sm border-l-4 ${PRIORITY_BORDER[order.priority]}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-on-surface">{order.event}</h3>
                      <Badge variant="secondary">
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                        {st.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-on-surface-variant mt-0.5">
                      {order.id} · {order.guests} personas · {order.deliveryDate} {order.deliveryTime}
                    </p>
                  </div>
                  {order.status === "PENDING" ? (
                    <button className="px-4 py-2 bg-gradient-to-br from-primary-container to-primary text-on-primary rounded-xl font-semibold text-xs shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 shrink-0">
                      <span className="material-symbols-outlined text-sm">play_arrow</span> Iniciar
                    </button>
                  ) : order.status === "IN_PROGRESS" ? (
                    <button className="px-4 py-2 bg-surface-container-lowest border border-outline-variant/20 text-on-surface rounded-xl font-semibold text-xs hover:bg-surface-container-high transition-colors active:scale-95 flex items-center gap-1.5 shrink-0">
                      <span className="material-symbols-outlined text-sm">check</span> Completar
                    </button>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {order.items.map((item) => (
                    <Badge key={item} variant="secondary">{item}</Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-outline-variant/5 flex items-center gap-2">
              <span className="material-symbols-outlined text-error">warning</span>
              <h4 className="font-semibold tracking-tight">Ingredientes Stock Bajo</h4>
            </div>
            <div className="p-5 space-y-3">
              {LOW_STOCK.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-red-900">{item.name}</p>
                    <p className="text-xs text-red-600">Stock: {item.stock} / Mín: {item.min}</p>
                  </div>
                  <span className="material-symbols-outlined text-red-400">inventory_2</span>
                </div>
              ))}
              <button className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/20 text-on-surface rounded-xl font-semibold text-sm hover:bg-surface-container-high transition-colors active:scale-95">
                Solicitar Reabastecimiento
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
