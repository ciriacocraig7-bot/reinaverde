"use client";

/**
 * <DramaticTotal/> — el número total como hero editorial.
 *
 * Aplicación del principio "drama del número": el total es el momento
 * de máxima emoción del flujo, así que se trata como una portada de
 * revista — typography display, mono caption, contador animado.
 *
 * El número anima cada vez que cambia (rolling counter).
 */
import { useEffect, useRef, useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface Props {
  amount: number;
  /** "Total a pagar" por defecto, override para "Cotización", etc. */
  label?: string;
  caption?: string;
  variant?: "dark" | "light";
  size?: "md" | "lg";
}

export function DramaticTotal({
  amount,
  label = "Total a pagar",
  caption,
  variant = "dark",
  size = "lg",
}: Props) {
  // Counter animado entre el valor anterior y el nuevo
  const [displayed, setDisplayed] = useState(amount);
  const prev = useRef(amount);

  useEffect(() => {
    const from = prev.current;
    const to = amount;
    if (from === to) {
      setDisplayed(to);
      return;
    }
    const duration = 700;
    const start = performance.now();
    let raf: number;
    const step = (t: number) => {
      const elapsed = t - start;
      const progress = Math.min(1, elapsed / duration);
      // ease-out-cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (to - from) * eased);
      setDisplayed(current);
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      } else {
        prev.current = to;
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [amount]);

  const bg = variant === "dark" ? "bg-ink text-cream" : "bg-cream-warm text-ink";
  const mutedColor = variant === "dark" ? "text-cream/55" : "text-ink/55";
  const sizeClass =
    size === "lg"
      ? "text-[clamp(56px,9vw,140px)]"
      : "text-[clamp(36px,5vw,72px)]";

  return (
    <div className={`relative ${bg} px-8 py-10 sm:px-12 sm:py-14 overflow-hidden`}>
      {/* Texture grain inheritance from .rv-grain if present, plus a subtle vignette */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full"
        style={{
          background:
            variant === "dark"
              ? "radial-gradient(closest-side, rgba(232,184,93,0.16), transparent)"
              : "radial-gradient(closest-side, rgba(122,58,24,0.12), transparent)",
        }}
      />
      <p
        className={`font-mono text-[10.5px] sm:text-[11px] uppercase tracking-[0.28em] ${mutedColor} mb-3`}
      >
        § {label}
      </p>
      <p
        className={`font-display font-light tracking-[-0.035em] leading-[0.88] tabular ${sizeClass}`}
        aria-live="polite"
      >
        {formatCurrency(displayed)}
      </p>
      {caption && (
        <p
          className={`mt-4 font-serif italic text-base sm:text-lg ${mutedColor} max-w-prose leading-snug`}
        >
          {caption}
        </p>
      )}
    </div>
  );
}
