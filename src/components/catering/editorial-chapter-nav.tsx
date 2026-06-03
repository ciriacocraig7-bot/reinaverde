"use client";

/**
 * <EditorialChapterNav/> — navegación de capítulos editoriales.
 *
 * En vez de [1 Items][2 Evento][3 Pago], usamos:
 *   § I — El evento     § II — La mesa     § III — Los acentos     § IV — La cuenta
 *
 * Capítulos en romano + título que nombra el OUTCOME del paso.
 * Underline de tinta que crece con animación al cambiar de step.
 */
import { cn } from "@/lib/utils";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

interface Chapter {
  title: string;
  /** Opcional. Short outcome description shown on hover. */
  outcome?: string;
}

interface Props {
  chapters: Chapter[];
  current: number; // 0-indexed
  onJump?: (index: number) => void;
}

export function EditorialChapterNav({ chapters, current, onJump }: Props) {
  return (
    <nav aria-label="Capítulos del cotizador">
      <div className="flex flex-wrap gap-x-6 gap-y-3 sm:gap-x-10 items-baseline">
        {chapters.map((ch, i) => {
          const isActive = i === current;
          const isPast = i < current;
          const clickable = isPast && onJump !== undefined;
          return (
            <button
              key={i}
              onClick={() => clickable && onJump?.(i)}
              disabled={!clickable && !isActive}
              title={ch.outcome}
              className={cn(
                "group inline-flex items-baseline gap-2 sm:gap-3 transition-opacity duration-200",
                isActive
                  ? "opacity-100"
                  : isPast
                    ? "opacity-100 hover:opacity-70 cursor-pointer"
                    : "opacity-25 cursor-not-allowed",
              )}
            >
              <span
                className={cn(
                  "font-mono text-[10.5px] uppercase tracking-[0.28em] tabular",
                  isActive ? "text-marigold-deep" : "text-ink/50",
                )}
              >
                § {ROMAN[i] ?? i + 1}
              </span>
              <span className="relative">
                <span
                  className={cn(
                    "font-display tracking-tight transition-colors duration-200",
                    "text-2xl sm:text-3xl",
                    isActive ? "text-ink" : "text-ink/55",
                  )}
                >
                  {ch.title}
                </span>
                {/* Underline ink that animates on active */}
                <span
                  className={cn(
                    "absolute left-0 right-0 bottom-[-3px] h-px bg-ink",
                    "transform origin-left transition-transform duration-500",
                    isActive ? "scale-x-100" : "scale-x-0",
                  )}
                  style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
                />
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
