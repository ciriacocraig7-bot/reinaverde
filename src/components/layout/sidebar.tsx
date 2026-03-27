"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import type { Role } from "@/lib/auth/permissions";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  comingSoon?: boolean;
}

const ROLE_LABELS: Record<Role, { title: string; subtitle: string }> = {
  ADMIN: { title: "Operations", subtitle: "Internal Management" },
  CLIENTE: { title: "Mi Cuenta", subtitle: "Portal de Cliente" },
  CHEF: { title: "Cocina", subtitle: "Gestión de Producción" },
  STAFF: { title: "Logística", subtitle: "Entregas y Eventos" },
  PROVEEDOR: { title: "Proveedor", subtitle: "Gestión de Insumos" },
  FINANZAS: { title: "Finanzas", subtitle: "Facturación y Pagos" },
};

const NAV_ITEMS: Record<Role, NavItem[]> = {
  ADMIN: [
    { href: "/admin", label: "Dashboard", icon: "dashboard" },
    { href: "/admin/ordenes", label: "Órdenes", icon: "receipt_long", comingSoon: true },
    { href: "/admin/eventos", label: "Eventos", icon: "event", comingSoon: true },
    { href: "/admin/produccion", label: "Producción", icon: "restaurant_menu", comingSoon: true },
    { href: "/admin/logistica", label: "Logística", icon: "local_shipping", comingSoon: true },
    { href: "/admin/finanzas", label: "Finanzas", icon: "analytics" },
    { href: "/admin/proveedores", label: "Proveedores", icon: "inventory_2", comingSoon: true },
    { href: "/admin/feedback", label: "Feedback", icon: "star", comingSoon: true },
    { href: "/admin/usuarios", label: "Usuarios", icon: "groups", comingSoon: true },
    { href: "/admin/reportes", label: "Reportes", icon: "bar_chart", comingSoon: true },
    { href: "/admin/configuracion", label: "Configuración", icon: "settings", comingSoon: true },
  ],
  CLIENTE: [
    { href: "/cliente", label: "Mi Panel", icon: "dashboard" },
    { href: "/cliente/pedidos", label: "Mis Pedidos", icon: "receipt_long", comingSoon: true },
    { href: "/catering/eventos", label: "Mis Eventos", icon: "event" },
    { href: "/cliente/facturas", label: "Facturas", icon: "payments", comingSoon: true },
    { href: "/cliente/feedback", label: "Calificaciones", icon: "star", comingSoon: true },
  ],
  CHEF: [
    { href: "/chef", label: "Cocina", icon: "dashboard" },
    { href: "/chef/produccion", label: "Producción", icon: "restaurant_menu", comingSoon: true },
    { href: "/chef/ingredientes", label: "Ingredientes", icon: "inventory_2", comingSoon: true },
  ],
  STAFF: [
    { href: "/staff", label: "Mi Panel", icon: "dashboard" },
    { href: "/staff/asignaciones", label: "Asignaciones", icon: "event", comingSoon: true },
    { href: "/staff/entregas", label: "Entregas", icon: "local_shipping", comingSoon: true },
  ],
  PROVEEDOR: [
    { href: "/proveedor", label: "Mi Panel", icon: "dashboard" },
    { href: "/proveedor/pedidos", label: "Pedidos", icon: "receipt_long", comingSoon: true },
    { href: "/proveedor/catalogo", label: "Catálogo", icon: "inventory_2", comingSoon: true },
  ],
  FINANZAS: [
    { href: "/finanzas", label: "Dashboard", icon: "dashboard" },
    { href: "/finanzas/facturacion", label: "Facturación", icon: "payments", comingSoon: true },
    { href: "/finanzas/pagos", label: "Pagos", icon: "credit_card", comingSoon: true },
    { href: "/finanzas/reportes", label: "Reportes", icon: "bar_chart", comingSoon: true },
  ],
};

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const items = NAV_ITEMS[user.role] || [];
  const roleLabel = ROLE_LABELS[user.role] || { title: "Panel", subtitle: "Navegación" };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-2 mb-8 mt-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-container to-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant_menu</span>
        </div>
        <div>
          <h1 className="text-lg font-black text-emerald-900 leading-none">{roleLabel.title}</h1>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mt-1">{roleLabel.subtitle}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && item.href !== "/cliente" && item.href !== "/chef" && item.href !== "/staff" && item.href !== "/proveedor" && item.href !== "/finanzas" && pathname.startsWith(item.href + "/"));
          const isExactActive = pathname === item.href;
          const active = isActive || isExactActive;
          
          const handleClick = (e: React.MouseEvent) => {
            if (item.comingSoon) {
              e.preventDefault();
              toast.info(`${item.label} - Próximamente disponible`);
            }
            setMobileOpen(false);
          };
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ease-in-out",
                active
                  ? "bg-white text-emerald-900 shadow-sm font-semibold"
                  : "text-emerald-800/70 hover:bg-emerald-100",
                item.comingSoon && "opacity-60"
              )}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
              {item.comingSoon && (
                <span className="ml-auto text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Pronto</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-1 border-t border-outline-variant/10 pt-4">
        {/* New Event Button */}
        <button onClick={() => router.push("/catering/orden")} className="w-full bg-gradient-to-r from-primary-container to-primary text-white rounded-xl py-3 px-4 text-sm font-bold shadow-md hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-2 mb-4">
          <span className="material-symbols-outlined text-sm">add</span>
          Nuevo Pedido
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="h-9 w-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {getInitials(user.firstName, user.lastName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-emerald-900 truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold truncate">{user.role}</p>
          </div>
        </div>

        <Link
          href="/"
          className="text-emerald-800/70 hover:bg-emerald-100 rounded-lg flex items-center gap-3 px-4 py-3 transition-colors duration-200 ease-in-out"
        >
          <span className="material-symbols-outlined">help</span>
          <span className="text-sm font-medium">Ayuda</span>
        </Link>
        <button
          onClick={logout}
          className="text-emerald-800/70 hover:bg-emerald-100 rounded-lg flex items-center gap-3 px-4 py-3 transition-colors duration-200 ease-in-out w-full"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-sm font-medium">Cerrar sesión</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-outline-variant/20"
      >
        <span className="material-symbols-outlined text-emerald-900">menu</span>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-slate-50 p-4 shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-800/70"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex h-screen w-64 fixed left-0 top-0 flex-col p-4 gap-2 bg-slate-50 transition-colors duration-200 ease-in-out z-40">
        {sidebarContent}
      </aside>
    </>
  );
}
