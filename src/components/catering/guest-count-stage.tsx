"use client";

/**
 * <GuestCountStage/> — input editorial GIGANTE para # comensales.
 *
 * Reemplaza `<input type="number">` por:
 *   · Número display de 80-120px tabular animado
 *   · Slider sub-tono (rango 10-500) con steps cargados
 *   · Dots visualizer que llena el espacio (1 dot = 5 personas)
 *   · Badges editoriales que aparecen cuando cruzas thresholds:
 *     - "Quórum íntimo" (1-30)
 *     - "Reunión clave" (31-99)
 *     - "Volumen corporativo · −5%" (100-199)
 *     - "Gran formato · −8%" (200-499)
 *     - "Lanzamiento mayor · −12%" (500+)
 */
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}

const TIERS = [
  { from: 1,   to: 30,  label: "Quórum íntimo",            badge: null },
  { from: 31,  to: 99,  label: "Reunión clave",            badge: null },
  { from: 100, to: 199, label: "Volumen corporativo",      badge: "−5 %" },
  { from: 200, to: 499, label: "Gran formato",             badge: "−8 %" },
  { from: 500, to: 9999,label: "Lanzamiento mayor",        badge: "−12 %" },
];

function tierFor(n: number) {
  return TIERS.find((t) => n >= t.from && n <= t.to) ?? TIERS[0];
}

export function GuestCountStage({ value, onChange, min = 10, max = 500 }: Props) {
  const tier = tierFor(value);
  const safeValue = Math.max(min, Math.min(max, value));
  const pct = ((safeValue - min) / (max - min)) * 100;

  // Visualizer: cada dot = 5 personas, hasta 60 dots máx
  const dotsCount = Math.min(60, Math.max(1, Math.round(value / 5)));
  const dots = useMemo(
    () => Array.from({ length: dotsCount }, (_, i) => i),
    [dotsCount],
  );

  return (
    <div className="space-y-6">
      {/* Big number */}
      <div className="flex items-baseline gap-4 sm:gap-6 flex-wrap">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-ink/55">
          § Comensales
        </p>
        <span
          aria-live="polite"
          className="font-display font-light tabular text-[clamp(72px,12vw,160px)] leading-[0.85] tracking-[-0.04em] text-ink"
        >
          {value}
        </span>
        <span className="font-serif italic text-2xl sm:text-3xl text-ink/55 self-end pb-3">
          personas
        </span>
      </div>

      {/* Tier badge */}
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-marigold-deep">
          {tier.label}
        </span>
        {tier.badge && (
          <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] bg-marigold text-ink px-2 py-0.5">
            {tier.badge}
          </span>
        )}
      </div>

      {/* Slider */}
      <div>
        <input
          type="range"
          min={min}
          max={max}
          step={5}
          value={safeValue}
          onChange={(e) => onChange(Number(e.target.value))}
          className="rv-slider w-full"
          aria-label="Número de comensales"
        />
        <div className="flex justify-between mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/45 tabular">
          <span>{min}</span>
          <span className="opacity-50">·</span>
          <span>{max}+</span>
        </div>
      </div>

      {/* Stepper + manual override */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 10))}
          className="h-10 w-10 border border-ink/30 hover:border-ink hover:bg-ink hover:text-cream font-display text-lg transition-colors"
          aria-label="−10"
        >
          −10
        </button>
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="h-10 w-10 border border-ink/30 hover:border-ink hover:bg-ink hover:text-cream font-display text-lg transition-colors"
          aria-label="−1"
        >
          −
        </button>
        <input
          type="number"
          value={value}
          min={min}
          max={9999}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value)))}
          className="h-10 w-24 px-3 border border-ink/30 bg-cream text-center font-display tabular text-lg focus:outline-none focus:border-ink"
          aria-label="Ingreso manual de comensales"
        />
        <button
          onClick={() => onChange(value + 1)}
          className="h-10 w-10 border border-ink/30 hover:border-ink hover:bg-ink hover:text-cream font-display text-lg transition-colors"
          aria-label="+1"
        >
          +
        </button>
        <button
          onClick={() => onChange(value + 10)}
          className="h-10 w-10 border border-ink/30 hover:border-ink hover:bg-ink hover:text-cream font-display text-lg transition-colors"
          aria-label="+10"
        >
          +10
        </button>
      </div>

      {/* Dots visualizer */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/45 mb-2">
          Cada punto representa ≈5 personas
        </p>
        <div
          className="grid gap-[5px]"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(11px, 1fr))",
          }}
        >
          {dots.map((_, i) => (
            <span
              key={i}
              className={cn(
                "block h-[11px] w-[11px] rounded-full transition-all duration-300",
                i < dotsCount - 5
                  ? "bg-ink/85"
                  : "bg-ink/40 scale-90",
              )}
              style={{
                transitionDelay: `${Math.min(800, i * 6)}ms`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Slider track style */}
      <style jsx>{`
        .rv-slider {
          appearance: none;
          background: transparent;
          height: 28px;
        }
        .rv-slider::-webkit-slider-runnable-track {
          height: 3px;
          background: linear-gradient(
            to right,
            #1f1d1a 0%,
            #1f1d1a ${pct}%,
            rgba(31, 29, 26, 0.18) ${pct}%,
            rgba(31, 29, 26, 0.18) 100%
          );
        }
        .rv-slider::-moz-range-track {
          height: 3px;
          background: rgba(31, 29, 26, 0.18);
        }
        .rv-slider::-moz-range-progress {
          background: #1f1d1a;
          height: 3px;
        }
        .rv-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 28px;
          width: 14px;
          background: #1f1d1a;
          border: 0;
          margin-top: -12.5px;
          cursor: ew-resize;
          transition: transform 120ms ease;
        }
        .rv-slider::-webkit-slider-thumb:hover {
          transform: scaleX(1.4);
          background: #7a3a18;
        }
        .rv-slider::-moz-range-thumb {
          height: 28px;
          width: 14px;
          background: #1f1d1a;
          border: 0;
          border-radius: 0;
          cursor: ew-resize;
        }
        .rv-slider:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}
