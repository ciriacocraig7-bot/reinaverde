"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const BUSINESS_TABS = [
  { id: "overview", label: "Resumen General", icon: "dashboard", color: "from-emerald-600 to-green-700" },
  { id: "catering", label: "Catering", icon: "restaurant", color: "from-emerald-600 to-green-700" },
  { id: "canabico", label: "Canábico", icon: "spa", color: "from-violet-600 to-purple-800" },
  { id: "liofilizados", label: "Liofilizados", icon: "nutrition", color: "from-amber-500 to-orange-600" },
];

const KPI_OVERVIEW = [
  { title: "Ingresos Totales", value: "$42,680,000", change: "+12%", icon: "payments", trend: "up" },
  { title: "Pedidos Activos", value: "287", change: "32 urgentes", icon: "pending_actions", trend: "warning" },
  { title: "Productos Activos", value: "17", icon: "inventory_2", change: "3 líneas", trend: "up" },
];

const KPI_BY_LINE: Record<string, typeof KPI_OVERVIEW> = {
  catering: [
    { title: "Ingresos Catering", value: "$24,842,000", change: "+8%", icon: "payments", trend: "up" },
    { title: "Pedidos Catering", value: "142", change: "18 críticos", icon: "pending_actions", trend: "warning" },
    { title: "Ocupación Staff", value: "88%", icon: "badge", change: "94% cocina", trend: "up" },
  ],
  canabico: [
    { title: "Ingresos Canábico", value: "$11,450,000", change: "+22%", icon: "payments", trend: "up" },
    { title: "Pedidos Canábico", value: "89", change: "8 pendientes envío", icon: "local_shipping", trend: "warning" },
    { title: "Productos CBD", value: "8", icon: "spa", change: "3 destacados", trend: "up" },
  ],
  liofilizados: [
    { title: "Ingresos Liofilizados", value: "$6,388,000", change: "+18%", icon: "payments", trend: "up" },
    { title: "Pedidos Liofilizados", value: "56", change: "6 pendientes envío", icon: "local_shipping", trend: "warning" },
    { title: "Productos Frutas", value: "9", icon: "nutrition", change: "4 destacados", trend: "up" },
  ],
};

const CATERING_ORDERS = [
  { id: "RV-ABC123", client: "TechCorp S.A.S", initials: "TC", desc: "Almuerzo Ejecutivo", total: 2850000, status: "IN_PRODUCTION", line: "catering" },
  { id: "RV-DEF456", client: "María López", initials: "ML", desc: "Boda", total: 8500000, status: "PAID", line: "catering" },
  { id: "RV-GHI789", client: "Innovatech", initials: "IN", desc: "Corporativo", total: 1200000, status: "READY", line: "catering" },
];

const SHOP_ORDERS = [
  { id: "RV-SH001", client: "Carlos Gómez", initials: "CG", desc: "Aceite CBD + Bálsamo", total: 284000, status: "CONFIRMED", line: "canabico" },
  { id: "RV-SH002", client: "Ana Ruiz", initials: "AR", desc: "Kit Bienestar Starter", total: 159000, status: "SHIPPED", line: "canabico" },
  { id: "RV-SH003", client: "Pedro Díaz", initials: "PD", desc: "Flores Mango Kush x2", total: 170000, status: "PROCESSING", line: "canabico" },
  { id: "RV-SH004", client: "Laura Martín", initials: "LM", desc: "Mango + Mix Berries", total: 63000, status: "CONFIRMED", line: "liofilizados" },
  { id: "RV-SH005", client: "Diego Reyes", initials: "DR", desc: "Bulk Mango 1kg", total: 320000, status: "SHIPPED", line: "liofilizados" },
  { id: "RV-SH006", client: "Sofia Torres", initials: "ST", desc: "Kit Repostería Premium", total: 65000, status: "DELIVERED", line: "liofilizados" },
];

const STATUS_MAP: Record<string, { label: string; variant: "default" | "info" | "warning" | "success" | "destructive"; dot: string }> = {
  DRAFT: { label: "Borrador", variant: "default", dot: "bg-gray-500" },
  QUOTED: { label: "Cotizado", variant: "info", dot: "bg-blue-500" },
  PAYMENT_PENDING: { label: "Pendiente Pago", variant: "warning", dot: "bg-amber-500" },
  PAID: { label: "Pagado", variant: "success", dot: "bg-emerald-500" },
  IN_PRODUCTION: { label: "En Producción", variant: "info", dot: "bg-blue-500 animate-pulse" },
  READY: { label: "Listo", variant: "success", dot: "bg-emerald-500" },
  IN_TRANSIT: { label: "En Tránsito", variant: "warning", dot: "bg-indigo-500" },
  DELIVERED: { label: "Entregado", variant: "success", dot: "bg-emerald-500" },
  COMPLETED: { label: "Completado", variant: "success", dot: "bg-emerald-500" },
  CANCELLED: { label: "Cancelado", variant: "destructive", dot: "bg-red-500" },
  PENDING: { label: "Pendiente", variant: "warning", dot: "bg-amber-500" },
  CONFIRMED: { label: "Confirmado", variant: "info", dot: "bg-blue-500" },
  PROCESSING: { label: "Procesando", variant: "info", dot: "bg-blue-500 animate-pulse" },
  SHIPPED: { label: "Enviado", variant: "warning", dot: "bg-indigo-500" },
  REFUNDED: { label: "Reembolsado", variant: "destructive", dot: "bg-red-500" },
};

const LINE_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  catering: { label: "Catering", bg: "bg-emerald-100", text: "text-emerald-800" },
  canabico: { label: "Canábico", bg: "bg-violet-100", text: "text-violet-800" },
  liofilizados: { label: "Liofilizados", bg: "bg-amber-100", text: "text-amber-800" },
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const kpis = activeTab === "overview" ? KPI_OVERVIEW : KPI_BY_LINE[activeTab] || KPI_OVERVIEW;

  const filteredOrders = activeTab === "overview"
    ? [...CATERING_ORDERS, ...SHOP_ORDERS]
    : activeTab === "catering"
      ? CATERING_ORDERS
      : SHOP_ORDERS.filter((o) => o.line === activeTab);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-on-surface-variant text-xs uppercase tracking-[0.2em] mb-2">Bienvenido, Admin</p>
          <h1 className="text-4xl font-semibold tracking-tight text-on-surface">Dashboard</h1>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-2.5 bg-surface-container-lowest text-on-surface rounded-xl border border-outline-variant/20 shadow-sm font-medium text-sm hover:bg-surface-container-high transition-colors active:scale-95">
            Descargar Reportes
          </button>
          <button className="px-6 py-2.5 bg-gradient-to-br from-primary-container to-primary text-on-primary rounded-xl font-semibold text-sm shadow-lg shadow-primary/10 hover:brightness-110 active:scale-95 transition-all">
            Nuevo Evento
          </button>
        </div>
      </header>

      {/* Business Line Tabs */}
      <div className="flex flex-wrap gap-2">
        {BUSINESS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all active:scale-95 ${
              activeTab === tab.id
                ? `bg-gradient-to-br ${tab.color} text-white shadow-md`
                : "bg-surface-container-lowest text-on-surface-variant border border-outline-variant/10 hover:bg-surface-container-high"
            }`}
          >
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.title} className="bg-surface-container-lowest rounded-xl p-6 shadow-sm shadow-emerald-900/5 flex flex-col justify-between border border-outline-variant/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
              <span className="material-symbols-outlined text-primary-fixed-dim text-4xl opacity-20">{kpi.icon}</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{kpi.title}</p>
              <h3 className="text-3xl font-semibold mt-2">{kpi.value}</h3>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${kpi.trend === "up" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>
                <span className="material-symbols-outlined text-[12px]">{kpi.trend === "up" ? "trending_up" : "schedule"}</span> {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Business Line Quick Stats (overview only) */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Catering", icon: "restaurant", revenue: "$24.8M", orders: 142, color: "emerald", gradient: "from-emerald-600 to-green-700" },
            { label: "Canábico", icon: "spa", revenue: "$11.5M", orders: 89, color: "violet", gradient: "from-violet-600 to-purple-800" },
            { label: "Liofilizados", icon: "nutrition", revenue: "$6.4M", orders: 56, color: "amber", gradient: "from-amber-500 to-orange-600" },
          ].map((line) => (
            <button key={line.label} onClick={() => setActiveTab(line.label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))} className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/10 shadow-sm text-left hover:shadow-md transition-all group active:scale-[0.98]">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${line.gradient} flex items-center justify-center shadow-sm`}>
                  <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{line.icon}</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant/30 group-hover:text-on-surface-variant transition-colors">arrow_forward</span>
              </div>
              <h4 className="font-bold text-on-surface">{line.label}</h4>
              <div className="flex items-center gap-3 mt-1 text-sm text-on-surface-variant">
                <span className="font-semibold">{line.revenue}</span>
                <span>•</span>
                <span>{line.orders} pedidos</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
        <div className="p-6 border-b border-outline-variant/5 flex justify-between items-center bg-surface-container-low/30">
          <div>
            <h4 className="text-lg font-semibold tracking-tight">
              {activeTab === "overview" ? "Todos los Pedidos" : `Pedidos ${BUSINESS_TABS.find((t) => t.id === activeTab)?.label}`}
            </h4>
            <p className="text-sm text-on-surface-variant">Feed operacional en tiempo real</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-emerald-900 bg-white border border-outline-variant/20 rounded-lg hover:bg-surface-container-low transition-all">Filtrar</button>
            <button className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-white bg-primary rounded-lg shadow-sm hover:brightness-110 transition-all">Exportar CSV</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/10">
                <th className="px-6 py-4">ID Orden</th>
                <th className="px-6 py-4">Cliente</th>
                {activeTab === "overview" && <th className="px-6 py-4">Línea</th>}
                <th className="px-6 py-4">Detalle</th>
                <th className="px-6 py-4">Monto</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {filteredOrders.map((order) => {
                const status = STATUS_MAP[order.status] || { label: order.status, variant: "default" as const, dot: "bg-gray-500" };
                const lineBadge = LINE_BADGE[order.line];
                return (
                  <tr key={order.id} className="hover:bg-surface-container-low/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-primary-container">#{order.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-900 font-bold text-xs">{order.initials}</div>
                        <span className="text-sm">{order.client}</span>
                      </div>
                    </td>
                    {activeTab === "overview" && (
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${lineBadge.bg} ${lineBadge.text}`}>{lineBadge.label}</span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm">{order.desc}</td>
                    <td className="px-6 py-4 text-sm font-semibold">{formatCurrency(order.total)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={status.variant}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                        {status.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-outline hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-outline-variant/10 flex items-center justify-between bg-surface-container-low/20">
          <p className="text-xs text-on-surface-variant font-medium">Mostrando {filteredOrders.length} pedidos</p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-surface-container-low text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded-lg bg-primary text-white text-xs font-bold">1</button>
            <button className="p-1.5 rounded-lg hover:bg-surface-container-low text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payment Gateway Settings */}
      <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
            <span className="material-symbols-outlined text-white">payment</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-on-surface">Pasarelas de Pago</h3>
            <p className="text-sm text-on-surface-variant">Configura las opciones de pago para e-commerce</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Default Gateway */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-on-surface">Pasarela Activa</label>
            <div className="flex gap-3">
              <div className="flex-1 p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-emerald-900">Bold.co</span>
                  <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">Activo</span>
                </div>
                <p className="text-xs text-emerald-700">Botón de pagos embebido — Tarjeta, PSE, Nequi, Daviplata</p>
              </div>
              <div className="flex-1 p-4 rounded-xl border border-outline-variant/20 bg-surface-container-low text-left opacity-50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-on-surface-variant">Wompi</span>
                  <span className="text-xs bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full">Inactivo</span>
                </div>
                <p className="text-xs text-on-surface-variant">Deshabilitado</p>
              </div>
            </div>
          </div>

          {/* Gateway Status */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-on-surface">Estado de Integraciones</label>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-sm">Bold.co Botón de Pagos</span>
                </div>
                <span className="text-xs text-emerald-600 font-medium">Conectado</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-sm">Bold.co Webhook</span>
                </div>
                <span className="text-xs text-emerald-600 font-medium">Configurado</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-outline-variant/10">
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-base">verified</span>
            <p>Todos los pagos se procesan de forma segura a través de Bold.co con checkout embebido.</p>
          </div>
        </div>
      </div>

      {/* Operational Insight Block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="text-lg font-bold tracking-tight text-emerald-900 mb-2">Capacidad de Producción</h4>
            <p className="text-sm text-on-surface-variant max-w-md mb-6">La cocina opera cerca de su capacidad máxima. Se sugiere rotación de personal en las próximas 2 horas.</p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">
                  <span>Cocina Principal (Sector A)</span>
                  <span>94%</span>
                </div>
                <div className="w-full bg-surface-container-low h-2 rounded-full">
                  <div className="bg-primary h-full rounded-full" style={{ width: "94%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">
                  <span>Prep Station (Sector B)</span>
                  <span>62%</span>
                </div>
                <div className="w-full bg-surface-container-low h-2 rounded-full">
                  <div className="bg-primary-fixed-dim h-full rounded-full" style={{ width: "62%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">
                  <span>Empaque E-commerce</span>
                  <span>45%</span>
                </div>
                <div className="w-full bg-surface-container-low h-2 rounded-full">
                  <div className="bg-violet-500 h-full rounded-full" style={{ width: "45%" }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-[-20%] right-[-10%] w-64 h-64 rounded-full bg-emerald-50/50 -z-0"></div>
        </div>

        <div className="bg-primary-container text-white rounded-2xl p-8 shadow-xl shadow-primary/20 relative overflow-hidden">
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Franquicia Intelligence</span>
              <h4 className="text-2xl font-bold mt-4 tracking-tight leading-tight">Control Tower</h4>
              <p className="text-on-primary-container text-sm mt-2 max-w-xs">3 líneas de negocio activas. 287 pedidos en pipeline. Tasa de conversión e-commerce: 3.8%.</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Catering: 142
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-400"></span> Canábico: 89
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span> Liofilizados: 56
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 h-full w-1/2 opacity-10 pointer-events-none flex items-center justify-center">
            <span className="material-symbols-outlined" style={{ fontSize: "200px", fontVariationSettings: "'FILL' 1" }}>hub</span>
          </div>
        </div>
      </div>
    </div>
  );
}
