"use client";

/**
 * <LiveEventNarrative/> — el evento siendo escrito en vivo.
 *
 * En vez de un summary de "Bogotá · 50 pax · ALM", el sidebar narra:
 *   "Un almuerzo premium para 50 personas en Bogotá.
 *    La temporada está en su pico — diciembre suma 15%.
 *    Tres platos en la mesa, dos de proteína y uno vegano."
 *
 * El texto se actualiza con cross-fade cuando cambian las variables.
 */
import { useEffect, useRef, useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface Props {
  city: string;
  guestCount: number;
  eventDate: string;
  eventTime: string;
  momentTypes: string[];
  itemCount: number;
  cmpEstimate: number; // pre-tax cost preview
}

const MOMENT_NARRATIVE: Record<string, { article: string; word: string }> = {
  DBR: { article: "Un", word: "desayuno corporativo" },
  RFG: { article: "Unos", word: "refrigerios" },
  ALM: { article: "Un", word: "almuerzo premium" },
  GAL: { article: "Una", word: "cena de gala" },
  MEX: { article: "Una", word: "mesa de experiencia" },
  COC: { article: "Una", word: "coctelería de cierre" },
};

const CITY_PHRASE: Record<string, string> = {
  "Bogotá": "en el altiplano bogotano",
  "Medellín": "en el verdor de Medellín",
  "Cali": "en la salsa caleña",
  "Barranquilla": "frente al Caribe barranquillero",
  "Cartagena": "en la magia colonial de Cartagena",
  "Armenia": "en el eje cafetero",
};

function seasonFromDate(date: string): { name: string; note: string | null } {
  if (!date) return { name: "", note: null };
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return { name: "", note: null };
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const md = m * 100 + day;
  if (md >= 1201 || md <= 106) {
    return { name: "Temporada alta", note: "diciembre suma 15 % al precio base" };
  }
  if (md >= 107 && md <= 228) {
    return { name: "Temporada baja", note: "enero descuenta 8 %" };
  }
  return { name: "Temporada regular", note: null };
}

export function LiveEventNarrative(props: Props) {
  // Cross-fade key — cualquier cambio dispara fade entre estados.
  const narrativeKey = `${props.city}|${props.guestCount}|${props.eventDate}|${props.momentTypes.join(",")}|${props.itemCount}`;
  const [visibleKey, setVisibleKey] = useState(narrativeKey);
  const [fading, setFading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (narrativeKey === visibleKey) return;
    setFading(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setVisibleKey(narrativeKey);
      setFading(false);
    }, 180);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [narrativeKey, visibleKey]);

  const primaryMoment = props.momentTypes[0];
  const moment = primaryMoment ? MOMENT_NARRATIVE[primaryMoment] : null;
  const cityPhrase = CITY_PHRASE[props.city] ?? `en ${props.city}`;
  const season = seasonFromDate(props.eventDate);

  return (
    <div className="border-l-2 border-marigold pl-6 py-2">
      <p
        className={`font-mono text-[10.5px] uppercase tracking-[0.28em] text-marigold-deep mb-3 transition-opacity duration-300`}
      >
        § La cotización se escribe sola
      </p>

      <div
        className={`transition-opacity duration-200 ${fading ? "opacity-0" : "opacity-100"}`}
        key={visibleKey}
      >
        <p className="font-serif text-xl sm:text-2xl leading-snug text-ink/85">
          {moment ? (
            <>
              {moment.article}{" "}
              <span className="italic">{moment.word}</span>
            </>
          ) : (
            <>Una experiencia</>
          )}{" "}
          para{" "}
          <span className="font-display tabular text-ink">
            {props.guestCount}
          </span>{" "}
          personas{" "}
          <span className="text-ink/65">{cityPhrase}</span>.
        </p>

        {season.note && (
          <p className="mt-3 font-serif italic text-base text-ink/70">
            {season.name} — {season.note}.
          </p>
        )}

        {props.itemCount > 0 && (
          <p className="mt-3 font-serif italic text-base text-ink/70">
            La mesa lleva{" "}
            <span className="font-display tabular not-italic text-ink">
              {props.itemCount}
            </span>{" "}
            {props.itemCount === 1 ? "plato" : "platos"}, costo materia prima
            aprox.{" "}
            <span className="font-display tabular not-italic text-ink">
              {formatCurrency(Math.round(props.cmpEstimate))}
            </span>
            .
          </p>
        )}

        {props.eventDate && (
          <p className="mt-4 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/45">
            {new Date(props.eventDate).toLocaleDateString("es-CO", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}{" "}
            · {props.eventTime || "—"}
          </p>
        )}
      </div>
    </div>
  );
}
