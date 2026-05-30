"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { useLiofilizadosCart, usePharmaCart } from "@/stores/shop-cart-store";
import { getRoleDashboardPath } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";

export type LineSlug = "hub" | "catering" | "pharma" | "liofilizados";

const NAV: Record<LineSlug, { href: string; label: string }[]> = {
  hub: [
    { href: "/catering", label: "Catering" },
    { href: "/pharma", label: "Pharma" },
    { href: "/liofilizados", label: "Liofilizados" },
  ],
  catering: [
    { href: "/catering", label: "Inicio" },
    { href: "/catering/menu", label: "Menú" },
    { href: "/catering/eventos", label: "Eventos" },
    { href: "/catering/nosotros", label: "Casa" },
  ],
  pharma: [
    { href: "/pharma", label: "Inicio" },
    { href: "/pharma/catalogo", label: "Catálogo" },
  ],
  liofilizados: [
    { href: "/liofilizados", label: "Inicio" },
    { href: "/liofilizados/catalogo", label: "Catálogo" },
  ],
};

const ACCENT: Record<LineSlug, { dot: string; underline: string; cartHref: string; useCount: () => number }> = {
  hub:          { dot: "bg-ink",        underline: "bg-ink",        cartHref: "/", useCount: () => 0 },
  catering:     { dot: "bg-marigold",   underline: "bg-marigold",   cartHref: "/catering/orden",      useCount: () => useCartStore.getState().itemCount() },
  pharma:       { dot: "bg-iris",       underline: "bg-iris",       cartHref: "/pharma/carrito",       useCount: () => usePharmaCart.getState().itemCount() },
  liofilizados: { dot: "bg-persimmon",  underline: "bg-persimmon",  cartHref: "/liofilizados/carrito", useCount: () => useLiofilizadosCart.getState().itemCount() },
};

/**
 * Unified editorial header. Same structure across the hub and the three
 * business lines — only the accent colour and the link set change.
 *
 * Brand mark: an Æ-style monogram "RV" set in display serif, with a small
 * accent dot indicating which division you're in.
 */
export function SiteHeader({ line = "hub" }: { line?: LineSlug }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const navLinks = NAV[line];
  const accent = ACCENT[line];

  // pull cart count reactively from the correct store
  const cateringCount = useCartStore((s) => s.itemCount());
  const pharmaCount = usePharmaCart((s) => s.itemCount());
  const lioCount = useLiofilizadosCart((s) => s.itemCount());
  const cartCount =
    line === "catering" ? cateringCount :
    line === "pharma" ? pharmaCount :
    line === "liofilizados" ? lioCount :
    0;

  return (
    <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur-md border-b border-ink/10">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
        <div className="h-16 sm:h-[68px] flex items-center justify-between gap-6">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <span className="font-display text-[28px] sm:text-[30px] tracking-[-0.04em] leading-none italic text-ink">
              Reina<span className="text-ink/60">·</span>Verde
            </span>
            <span className={cn("h-1.5 w-1.5 rounded-full", accent.dot)} aria-hidden />
            {line !== "hub" && (
              <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55">
                {line}
              </span>
            )}
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8 ml-4">
            {navLinks.map((link) => {
              const active =
                link.href === pathname ||
                (link.href !== "/" && pathname.startsWith(link.href + "/"));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative font-sans text-[14px] tracking-tight transition-colors py-2",
                    active ? "text-ink" : "text-ink/60 hover:text-ink",
                  )}
                >
                  {link.label}
                  {active && (
                    <span
                      className={cn(
                        "absolute -bottom-[18px] left-0 right-0 h-px",
                        accent.underline,
                      )}
                      aria-hidden
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Cart (only on business lines with carts) */}
            {line !== "hub" && (
              <Link
                href={accent.cartHref}
                className="relative flex items-center gap-2 p-2 -mr-1 group"
                aria-label="Carrito"
              >
                <span className="material-symbols-outlined text-ink/70 group-hover:text-ink text-[22px]">
                  shopping_bag
                </span>
                {cartCount > 0 && (
                  <span
                    className={cn(
                      "absolute -top-0.5 -right-1 h-[18px] min-w-[18px] px-1 flex items-center justify-center font-mono text-[10px] text-cream",
                      accent.dot,
                    )}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Auth */}
            {isAuthenticated && user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href={getRoleDashboardPath(user.role)}
                  className="font-sans text-[13px] text-ink/70 hover:text-ink rv-link"
                >
                  Panel
                </Link>
                <span className="text-ink/30 mx-1">/</span>
                <button
                  onClick={logout}
                  className="font-sans text-[13px] text-ink/70 hover:text-ink rv-link"
                >
                  Salir
                </button>
                <span
                  className="ml-2 h-9 w-9 flex items-center justify-center bg-ink text-cream font-display text-sm tracking-tight"
                  title={`${user.firstName} ${user.lastName}`}
                >
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </span>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href="/login"
                  className="font-sans text-[13px] text-ink/70 hover:text-ink rv-link"
                >
                  Ingresar
                </Link>
                <Link
                  href="/registro"
                  className="inline-flex items-center h-9 px-4 bg-ink text-cream font-sans text-[13px] tracking-tight rv-press hover:bg-ink-soft"
                >
                  Abrir cuenta →
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 -mr-2 text-ink"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              <span className="material-symbols-outlined text-[24px]">
                {mobileOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-cream border-t border-ink/10">
          <div className="px-6 py-5 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block py-2 font-sans text-base",
                  pathname === link.href ? "text-ink" : "text-ink/65",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-ink/10 my-3" />
            {isAuthenticated && user ? (
              <>
                <Link
                  href={getRoleDashboardPath(user.role)}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-ink"
                >
                  Panel
                </Link>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="block py-2 text-error text-left w-full"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 text-center border border-ink/30 text-ink"
                >
                  Ingresar
                </Link>
                <Link
                  href="/registro"
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 text-center bg-ink text-cream"
                >
                  Abrir cuenta
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
