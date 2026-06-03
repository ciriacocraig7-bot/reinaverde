"use client";

/**
 * <MomentChipGrid/> — selector visual de momento(s) del evento.
 *
 * Reemplaza chips planos por cards con typecode mono + kicker serif.
 */
import { cn } from "@/lib/utils";

const MOMENTS = [
  { code: "DBR", name: "Desayuno · brunch",     icon: "☕", kicker: "Inicios con luz" },
  { code: "RFG", name: "Refrigerios · snacks",   icon: "✦", kicker: "Recarga entre sesiones" },
  { code: "ALM", name: "Almuerzo premium",       icon: "❖", kicker: "Buffet o empacado" },
  { code: "GAL", name: "Cena de gala",           icon: "⊛", kicker: "Plato por plato" },
  { code: "MEX", name: "Mesa de experiencia",    icon: "✤", kicker: "Estaciones autoría" },
  { code: "COC", name: "Coctelería saludable",   icon: "⌬", kicker: "Mixología fresca" },
];

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
}

export function MomentChipGrid({ value, onChange }: Props) {
  const toggle = (code: string) => {
    onChange(
      value.includes(code) ? value.filter((m) => m !== code) : [...value, code],
    );
  };

  return (
    <div>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-ink/55 mb-3">
        § Momentos del evento
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {MOMENTS.map((m) => {
          const active = value.includes(m.code);
          return (
            <button
              key={m.code}
              onClick={() => toggle(m.code)}
              className={cn(
                "relative text-left px-4 py-4 border transition-all duration-200",
                active
                  ? "bg-ink text-cream border-ink"
                  : "bg-cream border-ink/15 text-ink hover:border-ink",
              )}
              aria-pressed={active}
            >
              <div className="flex items-baseline justify-between mb-1">
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-[0.22em]",
                    active ? "text-marigold" : "text-marigold-deep",
                  )}
                >
                  § {m.code}
                </span>
                <span
                  className={cn(
                    "font-display text-xl tabular leading-none",
                    active ? "text-cream/55" : "text-ink/35",
                  )}
                >
                  {m.icon}
                </span>
              </div>
              <p
                className={cn(
                  "font-display tracking-tight text-lg leading-tight",
                  active ? "text-cream" : "text-ink",
                )}
              >
                {m.name}
              </p>
              <p
                className={cn(
                  "mt-1 font-serif italic text-[12px] leading-snug",
                  active ? "text-cream/65" : "text-ink/55",
                )}
              >
                {m.kicker}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
