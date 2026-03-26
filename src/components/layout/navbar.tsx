"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { getRoleDashboardPath } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount);

  const navLinks = [
    { href: "/catering", label: "Inicio" },
    { href: "/catering/menu", label: "Menú" },
    { href: "/catering/eventos", label: "Eventos" },
    { href: "/catering/nosotros", label: "Nosotros" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm shadow-emerald-900/5">
      <div className="flex justify-between items-center px-8 h-16">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-container to-primary flex items-center justify-center shadow-sm shadow-primary/20">
              <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant_menu</span>
            </div>
            <span className="text-xl font-bold tracking-tighter text-emerald-900">Reina Verde</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex gap-6 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "font-medium tracking-tight transition-all active:scale-95 duration-150",
                  pathname === link.href
                    ? "text-emerald-900 border-b-2 border-emerald-800 pb-1"
                    : "text-emerald-700/60 hover:text-emerald-900"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden sm:flex items-center bg-emerald-50/50 px-3 py-1.5 rounded-full border border-outline-variant/20">
            <span className="material-symbols-outlined text-emerald-900/40 text-sm mr-2">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm w-32 lg:w-48 text-emerald-900 placeholder:text-emerald-700/40"
              placeholder="Buscar..."
              type="text"
            />
          </div>

          {/* Cart */}
          <Link href="/catering/orden" className="relative">
            <button className="p-2 text-emerald-700/60 hover:text-emerald-900 hover:bg-emerald-50 rounded-full transition-all active:scale-95 duration-150">
              <span className="material-symbols-outlined">shopping_cart</span>
            </button>
            {itemCount() > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                {itemCount()}
              </span>
            )}
          </Link>

          {isAuthenticated && user ? (
            <div className="hidden md:flex items-center gap-2">
              <Link href={getRoleDashboardPath(user.role)}>
                <button className="p-2 text-emerald-700/60 hover:text-emerald-900 hover:bg-emerald-50 rounded-full transition-all active:scale-95 duration-150">
                  <span className="material-symbols-outlined">dashboard</span>
                </button>
              </Link>
              <button
                onClick={logout}
                className="p-2 text-emerald-700/60 hover:text-emerald-900 hover:bg-emerald-50 rounded-full transition-all active:scale-95 duration-150"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
              <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center border-2 border-primary-fixed-dim ml-1">
                <span className="text-xs font-bold text-primary">{user.firstName?.[0]}{user.lastName?.[0]}</span>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="text-emerald-700/60 hover:text-emerald-900 font-medium tracking-tight transition-all active:scale-95 duration-150 text-sm"
              >
                Ingresar
              </Link>
              <Link href="/registro">
                <button className="px-5 py-2 bg-gradient-to-br from-primary-container to-primary text-on-primary rounded-xl font-semibold text-sm shadow-lg shadow-primary/10 hover:brightness-110 active:scale-95 transition-all">
                  Registrarse
                </button>
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-emerald-900 hover:bg-emerald-50 rounded-full transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className="material-symbols-outlined">{mobileOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-outline-variant/10">
          <div className="px-6 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-white text-emerald-900 shadow-sm font-semibold"
                    : "text-emerald-800/70 hover:bg-emerald-100"
                )}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-outline-variant/10 my-3" />
            {isAuthenticated && user ? (
              <>
                <Link
                  href={getRoleDashboardPath(user.role)}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-emerald-800/70 hover:bg-emerald-100 rounded-lg"
                >
                  <span className="material-symbols-outlined text-xl">dashboard</span>
                  Dashboard
                </Link>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-error hover:bg-error-container/30 rounded-lg w-full"
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <div className="pt-2 space-y-2">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <button className="w-full px-4 py-3 bg-surface-container-lowest text-on-surface rounded-xl border border-outline-variant/20 font-medium text-sm">
                    Ingresar
                  </button>
                </Link>
                <Link href="/registro" onClick={() => setMobileOpen(false)}>
                  <button className="w-full px-4 py-3 bg-gradient-to-br from-primary-container to-primary text-on-primary rounded-xl font-semibold text-sm shadow-lg shadow-primary/10">
                    Registrarse
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
