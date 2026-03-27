"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const DELIVERIES = [
  { id: "RV-ABC123", client: "TechCorp S.A.S", address: "Calle 100 #15-20, Of. 501, Bogotá", time: "12:00 PM", date: "2026-03-28", status: "EN_ROUTE", phone: "+57 301 234 5678" },
  { id: "RV-GHI789", client: "Innovatech", address: "Cra 7 #72-41, Piso 8, Bogotá", time: "3:00 PM", date: "2026-03-28", status: "ASSIGNED", phone: "+57 302 345 6789" },
  { id: "RV-JKL012", client: "StartUp Labs", address: "Calle 26 #69D-91, Torre 3, Bogotá", time: "6:00 PM", date: "2026-03-28", status: "PENDING", phone: "+57 303 456 7890" },
];

const ASSIGNMENTS = [
  { event: "Almuerzo TechCorp", role: "Mesero Principal", date: "Mar 28", time: "11:00 - 14:00" },
  { event: "Coffee Break Innovatech", role: "Logística", date: "Mar 29", time: "14:00 - 17:00" },
  { event: "Boda López-García", role: "Mesero", date: "Abr 5", time: "17:00 - 23:00" },
];

const STATUS_MAP: Record<string, { label: string; variant: "default" | "info" | "warning" | "success"; dot: string }> = {
  PENDING: { label: "Pendiente", variant: "default", dot: "bg-gray-500" },
  ASSIGNED: { label: "Asignado", variant: "info", dot: "bg-blue-500" },
  EN_ROUTE: { label: "En Ruta", variant: "warning", dot: "bg-amber-500 animate-pulse" },
  ARRIVED: { label: "En Sitio", variant: "info", dot: "bg-indigo-500" },
  COMPLETED: { label: "Completado", variant: "success", dot: "bg-emerald-500" },
};

export default function StaffDashboard() {
  const [deliveries, setDeliveries] = useState(DELIVERIES);

  const handleStartRoute = (id: string) => {
    setDeliveries((prev) => prev.map((d) => d.id === id ? { ...d, status: "EN_ROUTE" } : d));
    toast.success(`Ruta iniciada para ${id}`);
  };

  const handleMarkArrival = (id: string) => {
    setDeliveries((prev) => prev.map((d) => d.id === id ? { ...d, status: "ARRIVED" } : d));
    toast.success(`Llegada marcada para ${id}`);
  };

  const handleCall = (phone: string, client: string) => {
    window.open(`tel:${phone.replace(/\s/g, "")}`, "_self");
    toast.info(`Llamando a ${client}...`);
  };

  const enRouteCount = deliveries.filter((d) => d.status === "EN_ROUTE").length;
  const completedCount = deliveries.filter((d) => d.status === "COMPLETED" || d.status === "ARRIVED").length;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-on-surface-variant text-xs uppercase tracking-[0.2em] mb-2">Entregas y Eventos</p>
        <h1 className="text-4xl font-semibold tracking-tight text-on-surface">Panel de Staff</h1>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Entregas Hoy", value: String(deliveries.length), icon: "local_shipping" },
          { title: "En Ruta", value: String(enRouteCount), icon: "navigation" },
          { title: "Completadas", value: String(completedCount), icon: "check_circle" },
          { title: "Eventos Semana", value: String(ASSIGNMENTS.length), icon: "event" },
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
        {/* Deliveries */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold tracking-tight text-on-surface">Entregas del Día</h2>
          {deliveries.map((delivery) => {
            const status = STATUS_MAP[delivery.status] || { label: delivery.status, variant: "default" as const, dot: "bg-gray-500" };
            return (
              <div key={delivery.id} className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/10 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-on-surface">{delivery.client}</h3>
                      <Badge variant={status.variant}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-on-surface-variant mt-0.5">{delivery.id}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium text-on-surface">{delivery.time}</p>
                    <p className="text-on-surface-variant">{delivery.date}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 mb-3 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">location_on</span>
                  <span>{delivery.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  {delivery.status === "ASSIGNED" && (
                    <button onClick={() => handleStartRoute(delivery.id)} className="flex-1 px-4 py-2 bg-gradient-to-br from-primary-container to-primary text-on-primary rounded-xl font-semibold text-xs shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">navigation</span> Iniciar Ruta
                    </button>
                  )}
                  {delivery.status === "EN_ROUTE" && (
                    <button onClick={() => handleMarkArrival(delivery.id)} className="flex-1 px-4 py-2 bg-gradient-to-br from-primary-container to-primary text-on-primary rounded-xl font-semibold text-xs shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">check_circle</span> Marcar Llegada
                    </button>
                  )}
                  <button onClick={() => handleCall(delivery.phone, delivery.client)} className="px-4 py-2 bg-surface-container-lowest border border-outline-variant/20 text-on-surface rounded-xl font-semibold text-xs hover:bg-surface-container-high transition-colors active:scale-95 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">call</span> Llamar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Assignments Sidebar */}
        <div>
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-outline-variant/5 flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant">event</span>
              <h4 className="font-semibold tracking-tight">Mis Asignaciones</h4>
            </div>
            <div className="p-5 space-y-3">
              {ASSIGNMENTS.map((a) => (
                <div key={a.event} className="p-3 bg-surface-container-low rounded-lg">
                  <p className="text-sm font-medium text-on-surface">{a.event}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {a.role} · {a.date} · {a.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
