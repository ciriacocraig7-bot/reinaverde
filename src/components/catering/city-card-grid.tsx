"use client";

/**
 * <CityCardGrid/> — selector visual de ciudad.
 *
 * Cada ciudad tiene personalidad: paleta sutil + serif italic kicker
 * que la sitúa geográficamente. Reemplaza el <select> estándar.
 */
import { cn } from "@/lib/utils";

interface City {
  name: string;
  /** Frase poética que ubica al usuario. */
  kicker: string;
  /** Acento de color que pinta el card cuando está activo. */
  accent: "marigold" | "iris" | "persimmon";
}

const CITIES: City[] = [
  { name: "Bogotá",       kicker: "Altiplano · 2640 m",       accent: "marigold" },
  { name: "Medellín",     kicker: "Valle de Aburrá",          accent: "iris" },
  { name: "Cali",         kicker: "Valle del Cauca",          accent: "persimmon" },
  { name: "Barranquilla", kicker: "Caribe norte",             accent: "marigold" },
  { name: "Cartagena",    kicker: "Mar Caribe colonial",      accent: "persimmon" },
  { name: "Armenia",      kicker: "Eje cafetero",             accent: "iris" },
];

const ACCENT_STYLES: Record<
  City["accent"],
  { activeBg: string; activeText: string; bar: string; hoverBg: string }
> = {
  marigold: {
    activeBg: "bg-marigold",
    activeText: "text-ink",
    bar: "bg-marigold-deep",
    hoverBg: "hover:bg-marigold/30",
  },
  iris: {
    activeBg: "bg-iris",
    activeText: "text-cream",
    bar: "bg-iris-deep",
    hoverBg: "hover:bg-iris/20",
  },
  persimmon: {
    activeBg: "bg-persimmon",
    activeText: "text-cream",
    bar: "bg-persimmon-deep",
    hoverBg: "hover:bg-persimmon/20",
  },
};

interface Props {
  value: string;
  onChange: (city: string) => void;
}

export function CityCardGrid({ value, onChange }: Props) {
  return (
    <div>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-ink/55 mb-3">
        § Ciudad del evento
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {CITIES.map((c) => {
          const isActive = value === c.name;
          const style = ACCENT_STYLES[c.accent];
          return (
            <button
              key={c.name}
              onClick={() => onChange(c.name)}
              className={cn(
                "relative text-left px-4 py-4 border transition-all duration-200 group",
                isActive
                  ? `${style.activeBg} ${style.activeText} border-ink`
                  : `bg-cream border-ink/15 text-ink ${style.hoverBg} hover:border-ink/40`,
              )}
            >
              {/* Active sidebar accent */}
              <span
                aria-hidden
                className={cn(
                  "absolute left-0 top-0 bottom-0 w-[3px] transform origin-top transition-transform duration-300",
                  style.bar,
                  isActive ? "scale-y-100" : "scale-y-0",
                )}
              />
              <p
                className={cn(
                  "font-display tracking-tight text-xl sm:text-2xl leading-tight",
                  isActive ? "" : "text-ink",
                )}
              >
                {c.name}
              </p>
              <p
                className={cn(
                  "mt-1 font-serif italic text-[12px] sm:text-[13px] leading-snug",
                  isActive ? "opacity-80" : "text-ink/55",
                )}
              >
                {c.kicker}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
