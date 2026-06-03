"use client";

/**
 * <DateWithSeason/> — datepicker editorial con badge de temporada.
 *
 * El usuario ve, mientras elige la fecha, qué temporada activa:
 *  · Temporada alta (Dic 1 – Ene 6) → +15 %
 *  · Temporada baja (Ene 7 – Feb 28) → −8 %
 *  · Regular → sin modificador
 *
 * Anclado al sense of place + drama del número.
 */
import { cn } from "@/lib/utils";

interface Props {
  date: string;
  time: string;
  onChangeDate: (d: string) => void;
  onChangeTime: (t: string) => void;
}

function inferSeason(date: string): {
  name: string;
  modifier: string;
  tone: "warn" | "info" | "muted";
} | null {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const md = (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
  if (md >= 1201 || md <= 106) {
    return { name: "Temporada alta", modifier: "+15 %", tone: "warn" };
  }
  if (md >= 107 && md <= 228) {
    return { name: "Temporada baja", modifier: "−8 %", tone: "info" };
  }
  return { name: "Temporada regular", modifier: "neutral", tone: "muted" };
}

export function DateWithSeason({
  date,
  time,
  onChangeDate,
  onChangeTime,
}: Props) {
  const season = inferSeason(date);
  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-ink/55 mb-3">
        § Fecha y hora del evento
      </p>
      <div className="grid sm:grid-cols-[1.4fr_1fr] gap-3">
        <input
          type="date"
          value={date}
          min={today}
          onChange={(e) => onChangeDate(e.target.value)}
          className="h-14 px-4 border border-ink/25 bg-cream font-display text-xl tracking-tight text-ink focus:outline-none focus:border-ink tabular"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => onChangeTime(e.target.value)}
          className="h-14 px-4 border border-ink/25 bg-cream font-display text-xl tracking-tight text-ink focus:outline-none focus:border-ink tabular"
        />
      </div>

      {season && (
        <div
          className={cn(
            "mt-3 inline-flex items-baseline gap-3 px-3 py-2 border transition-colors duration-200",
            season.tone === "warn"
              ? "border-marigold-deep/40 bg-marigold/20"
              : season.tone === "info"
                ? "border-iris/40 bg-iris/10"
                : "border-ink/20 bg-cream-warm",
          )}
        >
          <span
            className={cn(
              "font-mono text-[10px] uppercase tracking-[0.22em]",
              season.tone === "warn"
                ? "text-marigold-deep"
                : season.tone === "info"
                  ? "text-iris-deep"
                  : "text-ink/55",
            )}
          >
            {season.name}
          </span>
          <span className="font-display text-base tabular text-ink">
            {season.modifier}
          </span>
        </div>
      )}
    </div>
  );
}
