"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { cn, getInitials } from "@/lib/utils";
import type { Role } from "@/lib/auth/permissions";

interface NavItem {
  href: string;
  label: string;
  code: string;     // 3-letter editorial code shown next to label
  comingSoon?: boolean;
}

const ROLE_META: Record<Role, { title: string; section: string; accent: string }> = {
  ADMIN:     { title: "Operations",  section: "Casa · Control",       accent: "bg-ink" },
  CLIENTE:   { title: "Mi cuenta",   section: "Portal del cliente",   accent: "bg-marigold" },
  CHEF:      { title: "Cocina",      section: "Producción",           accent: "bg-marigold" },
  STAFF:     { title: "Logística",   section: "Entregas y eventos",   accent: "bg-iris" },
  PROVEEDOR: { title: "Proveedor",   section: "Cadena de insumos",    accent: "bg-persimmon" },
  FINANZAS:  { title: "Finanzas",    section: "Facturación y caja",   accent: "bg-ink" },
};

const NAV_ITEMS: Record<Role, NavItem[]> = {
  ADMIN: [
    { href: "/admin",                label: "Tablero",      code: "TBL" },
    { href: "/admin/ordenes",        label: "Órdenes",      code: "ORD", comingSoon: true },
    { href: "/admin/eventos",        label: "Eventos",      code: "EVT", comingSoon: true },
    { href: "/admin/produccion",     label: "Producción",   code: "PRD", comingSoon: true },
    { href: "/admin/logistica",      label: "Logística",    code: "LOG", comingSoon: true },
    { href: "/admin/finanzas",       label: "Finanzas",     code: "FIN" },
    { href: "/admin/pricing",        label: "Precios y tarifas", code: "PRC" },
    { href: "/chef/recetas",         label: "Recetas",      code: "REC" },
    { href: "/chef/ingredientes",    label: "Ingredientes", code: "ING" },
    { href: "/admin/proveedores",    label: "Proveedores",  code: "PRV", comingSoon: true },
    { href: "/admin/feedback",       label: "Feedback",     code: "FBK", comingSoon: true },
    { href: "/admin/usuarios",       label: "Usuarios",     code: "USR", comingSoon: true },
    { href: "/admin/reportes",       label: "Reportes",     code: "RPT", comingSoon: true },
    { href: "/admin/configuracion",  label: "Configuración", code: "CFG", comingSoon: true },
  ],
  CLIENTE: [
    { href: "/cliente",            label: "Mi panel",       code: "PNL" },
    { href: "/cliente/pedidos",    label: "Mis pedidos",    code: "PED", comingSoon: true },
    { href: "/catering/eventos",   label: "Mis eventos",    code: "EVT" },
    { href: "/cliente/facturas",   label: "Facturas",       code: "FAC", comingSoon: true },
    { href: "/cliente/feedback",   label: "Calificaciones", code: "FBK", comingSoon: true },
  ],
  CHEF: [
    { href: "/chef",                label: "Cocina",        code: "COC" },
    { href: "/chef/recetas",        label: "Recetas",       code: "REC" },
    { href: "/chef/ingredientes",   label: "Ingredientes",  code: "ING" },
    { href: "/chef/produccion",     label: "Producción",    code: "PRD", comingSoon: true },
  ],
  STAFF: [
    { href: "/staff",               label: "Mi panel",      code: "PNL" },
    { href: "/staff/asignaciones",  label: "Asignaciones",  code: "ASG", comingSoon: true },
    { href: "/staff/entregas",      label: "Entregas",      code: "ENT", comingSoon: true },
  ],
  PROVEEDOR: [
    { href: "/proveedor",           label: "Mi panel",      code: "PNL" },
    { href: "/proveedor/pedidos",   label: "Pedidos",       code: "PED", comingSoon: true },
    { href: "/proveedor/catalogo",  label: "Catálogo",      code: "CTL", comingSoon: true },
  ],
  FINANZAS: [
    { href: "/finanzas",             label: "Tablero",      code: "TBL" },
    { href: "/finanzas/facturacion", label: "Facturación",  code: "FAC", comingSoon: true },
    { href: "/finanzas/pagos",       label: "Pagos",        code: "PAG", comingSoon: true },
    { href: "/finanzas/reportes",    label: "Reportes",     code: "RPT", comingSoon: true },
  ],
};

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const items = NAV_ITEMS[user.role] || [];
  const meta = ROLE_META[user.role] || { title: "Panel", section: "Navegación", accent: "bg-ink" };

  const isRoot = (href: string) =>
    href === "/admin" || href === "/cliente" || href === "/chef" ||
    href === "/staff" || href === "/proveedor" || href === "/finanzas";

  const sidebarContent = (
    <div className="flex flex-col h-full bg-cream-warm border-r border-ink/15">
      {/* Brand row */}
      <div className="px-6 pt-7 pb-6 border-b border-ink/15">
        <Link href="/" className="block">
          <span className="font-display italic text-[28px] tracking-[-0.04em] leading-none text-ink">
            Reina<span className="text-ink/55">·</span>Verde
          </span>
        </Link>
        <div className="mt-4 flex items-center gap-2">
          <span className={cn("h-1.5 w-1.5 rounded-full", meta.accent)} aria-hidden />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55">
            {meta.section}
          </span>
        </div>
        <h2 className="mt-2 font-display text-[28px] tracking-[-0.025em] leading-none text-ink">
          {meta.title}
        </h2>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-5 px-3 overflow-y-auto">
        <p className="px-4 mb-3 font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink/45">
          Secciones
        </p>
        <ul className="space-y-0.5">
          {items.map((item) => {
            const active =
              pathname === item.href ||
              (!isRoot(item.href) && pathname.startsWith(item.href + "/"));

            const handleClick = (e: React.MouseEvent) => {
              if (item.comingSoon) {
                e.preventDefault();
                toast.info(`${item.label} · próximamente`);
                return;
              }
              setMobileOpen(false);
            };

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={handleClick}
                  className={cn(
                    "group flex items-center gap-3 px-4 py-2.5 transition-colors relative",
                    active
                      ? "bg-ink text-cream"
                      : "text-ink/70 hover:text-ink hover:bg-cream",
                    item.comingSoon && "opacity-55",
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-[9.5px] tracking-[0.18em] w-9 shrink-0",
                      active ? "text-cream/70" : "text-ink/40",
                    )}
                  >
                    {item.code}
                  </span>
                  <span className="font-sans text-[14px] tracking-tight flex-1">
                    {item.label}
                  </span>
                  {item.comingSoon && (
                    <span
                      className={cn(
                        "font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 border",
                        active
                          ? "border-cream/40 text-cream/70"
                          : "border-ink/25 text-ink/55",
                      )}
                    >
                      Pronto
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-ink/15 px-3 py-4">
        <button
          onClick={() => router.push("/catering/cotizar")}
          className="block w-full text-center px-4 py-3 bg-ink text-cream font-sans text-[13px] tracking-tight rv-press hover:bg-ink-soft mb-4"
        >
          + Nueva cotización
        </button>

        {/* User block */}
        <div className="flex items-center gap-3 px-2 py-2">
          <span className="h-9 w-9 flex items-center justify-center bg-ink text-cream font-display text-sm tracking-tight shrink-0">
            {getInitials(user.firstName, user.lastName)}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-[13px] text-ink truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-ink/55 truncate">
              {user.role}
            </p>
          </div>
        </div>

        <div className="mt-2 flex gap-1">
          <Link
            href="/"
            className="flex-1 py-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-ink/65 hover:bg-cream hover:text-ink transition-colors"
          >
            Hub
          </Link>
          <button
            onClick={logout}
            className="flex-1 py-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-ink/65 hover:bg-cream hover:text-ink transition-colors"
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 h-10 w-10 flex items-center justify-center bg-ink text-cream"
        aria-label="Abrir menú"
      >
        <span className="material-symbols-outlined text-xl">menu</span>
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 z-10 h-9 w-9 flex items-center justify-center text-ink"
              aria-label="Cerrar"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      <aside className="hidden lg:flex h-screen w-64 fixed left-0 top-0 z-40">
        {sidebarContent}
      </aside>
    </>
  );
}
