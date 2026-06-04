"use client";

/**
 * <GuestCheckoutInline/> — bloque compacto de datos del comprador para
 * checkout sin registro.
 *
 * Diseñado para aparecer JUSTO antes del botón de pago, no en mitad del
 * flujo. Reduce fricción: el usuario diseña/elige libremente y solo deja
 * sus datos cuando ya decidió comprar.
 *
 * Reusado por: catering/cotizar (Cap IV), pharma/carrito, liofilizados/carrito.
 */
import { cn } from "@/lib/utils";

export interface GuestData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface Props {
  value: GuestData;
  onChange: (next: GuestData) => void;
  /** Si true, hace al campo phone obligatorio en la UI (sin asterisco visual extra; el handler valida). */
  requirePhone?: boolean;
  /** "stack" para sidebar angosto, "row" para área principal ancha. */
  layout?: "stack" | "row";
  /** Texto editorial sobre el bloque. */
  caption?: string;
}

export function GuestCheckoutInline({
  value,
  onChange,
  requirePhone = false,
  layout = "row",
  caption = "Sin crear cuenta. Tras el pago te enviamos un link para activarla.",
}: Props) {
  const set = (patch: Partial<GuestData>) => onChange({ ...value, ...patch });
  const cols =
    layout === "stack" ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2";

  return (
    <div className="border border-ink/15 bg-cream-warm p-5 sm:p-6">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-marigold-deep mb-2">
        § Datos del comprador
      </p>
      <p className="font-serif italic text-[13px] text-ink/65 leading-snug mb-4">
        {caption}
      </p>
      <div className={cn("grid gap-3", cols)}>
        <Input
          type="email"
          autoComplete="email"
          placeholder="Email"
          value={value.email}
          onChange={(v) => set({ email: v })}
        />
        <Input
          type="tel"
          autoComplete="tel"
          placeholder={requirePhone ? "Teléfono" : "Teléfono (opcional)"}
          value={value.phone}
          onChange={(v) => set({ phone: v })}
        />
        <Input
          autoComplete="given-name"
          placeholder="Nombres"
          value={value.firstName}
          onChange={(v) => set({ firstName: v })}
        />
        <Input
          autoComplete="family-name"
          placeholder="Apellidos"
          value={value.lastName}
          onChange={(v) => set({ lastName: v })}
        />
      </div>
    </div>
  );
}

function Input({
  type = "text",
  autoComplete,
  placeholder,
  value,
  onChange,
}: {
  type?: string;
  autoComplete?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type={type}
      autoComplete={autoComplete}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-12 px-3 border border-ink/25 bg-cream font-sans text-base text-ink focus:outline-none focus:border-ink"
    />
  );
}

/** Validación local liviana: el handler del servidor valida también con Zod. */
export function guestIsValid(g: GuestData, requirePhone = false): boolean {
  if (!g.email || !g.firstName || !g.lastName) return false;
  if (!/.+@.+\..+/.test(g.email)) return false;
  if (requirePhone && (!g.phone || g.phone.length < 7)) return false;
  return true;
}
