"use client";

/**
 * /catering/cotizar/confirmacion?quote=<id>
 *
 * Pantalla post-pago editorial premium. NO es una notificación de "Gracias
 * por su compra" plana — es la apertura de un compromiso editorial: la
 * cocina arranca, el equipo se mueve, la marca del cliente queda en juego.
 *
 * Estructura narrativa:
 *  · Hero cinematográfico con imagen del momento elegido + headline grande
 *  · Carta editorial del equipo (no slogan, no thanks page)
 *  · Countdown editorial al evento ("Su evento es en N días")
 *  · Timeline T-72h / T-24h / T-2h / Evento — qué hace Reina Verde en cada
 *  · Los 3 pilares aplicados a su evento (orgánico / gourmet / sostenible)
 *  · Documentos descargables (cotización PDF + lista de compras)
 *  · Próximos pasos prácticos (compactados, modo "ya está, descanse")
 */
import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { QuoteDocumentsPanel } from "@/components/catering/quote-documents-panel";
import { useQuoteBuilder } from "@/stores/quote-builder-store";

// Mapeo momento → imagen hero
const MOMENT_HERO: Record<string, { src: string; alt: string; mood: string }> = {
  DBR: { src: "/img/momentos/desayunos.jpg",        alt: "Desayuno editorial",          mood: "amanecer" },
  RFG: { src: "/img/momentos/refrigerios.jpg",       alt: "Refrigerios artesanales",     mood: "pausa" },
  ALM: { src: "/img/momentos/almuerzos.jpg",         alt: "Almuerzo premium",            mood: "mediodía" },
  GAL: { src: "/img/momentos/cenas.jpg",             alt: "Cena de gala",                mood: "ceremonia" },
  MEX: { src: "/img/momentos/mesas-experiencia.jpg", alt: "Mesa de experiencia",         mood: "estación" },
  COC: { src: "/img/momentos/cocteleria.jpg",        alt: "Coctelería de cierre",        mood: "cierre" },
};

interface QuoteSummary {
  quoteNumber: string;
  eventDate: string;
  eventTime: string;
  eventCity: string;
  eventAddress: string;
  guestCount: number;
  momentTypes: string[];
  total: number;
}

function ConfirmacionInner() {
  const params = useSearchParams();
  const quoteId = params.get("quote");
  const reset = useQuoteBuilder((s) => s.reset);
  const [quote, setQuote] = useState<QuoteSummary | null>(null);

  useEffect(() => {
    if (!quoteId) return;
    fetch(`/api/catering/quotes/${quoteId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.quote) {
          setQuote({
            quoteNumber: d.quote.quoteNumber,
            eventDate: d.quote.eventDate,
            eventTime: d.quote.eventTime,
            eventCity: d.quote.eventCity,
            eventAddress: d.quote.eventAddress,
            guestCount: d.quote.guestCount,
            momentTypes: d.quote.momentTypes ?? [],
            total: d.quote.total,
          });
        }
      })
      .catch(() => {});
    reset(); // limpiamos el builder al llegar acá
  }, [quoteId, reset]);

  // Countdown editorial: "Su evento es en N días" + "H horas"
  const countdown = useMemo(() => {
    if (!quote?.eventDate) return null;
    const event = new Date(quote.eventDate).getTime();
    const now = Date.now();
    const diff = event - now;
    if (diff <= 0) return { days: 0, hours: 0, label: "Hoy" };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return {
      days,
      hours,
      label: days >= 1 ? `${days} días` : `${hours} horas`,
    };
  }, [quote?.eventDate]);

  // Hero según el primer momento elegido
  const primaryMoment = quote?.momentTypes?.[0] ?? "ALM";
  const hero = MOMENT_HERO[primaryMoment] ?? MOMENT_HERO.ALM;

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════
          HERO CINEMATOGRÁFICO
          ════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full bg-ink text-cream overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={hero.src}
            alt={hero.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-60"
          />
          {/* Vignette + gradient para legibilidad */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(31,29,26,0.4) 0%, rgba(31,29,26,0.2) 40%, rgba(31,29,26,0.85) 100%)",
            }}
            aria-hidden
          />
        </div>

        <div className="relative max-w-[1500px] mx-auto px-6 sm:px-10 pt-24 sm:pt-32 pb-20 sm:pb-28 grid grid-cols-12 gap-x-6">
          {/* Eyebrow + número de cotización */}
          <div className="col-span-12 lg:col-span-3 mb-8 lg:mb-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-marigold">
              § Compromiso recibido
            </p>
            {quote && (
              <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-cream/55">
                Cotización {quote.quoteNumber}
              </p>
            )}
          </div>

          {/* Headline principal */}
          <div className="col-span-12 lg:col-span-9">
            <h1 className="font-display font-light tracking-[-0.04em] leading-[0.86] text-cream text-5xl sm:text-7xl lg:text-[120px]">
              Su mesa,
              <br />
              <span className="italic">en marcha</span>
              <span className="text-marigold">.</span>
            </h1>
            <p className="mt-10 font-serif italic text-xl sm:text-2xl leading-snug text-cream/85 max-w-3xl">
              Reservamos su fecha. La cocina abre. A partir de ahora, su
              evento es la prioridad operativa de Reina Verde — no un pedido
              más en la cola.
            </p>

            {/* Countdown editorial */}
            {countdown && countdown.days >= 0 && (
              <div className="mt-12 inline-flex items-baseline gap-4 border-t border-cream/30 pt-4">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-cream/60">
                  Su evento es en
                </span>
                <span className="font-display tabular text-5xl sm:text-6xl text-cream tracking-tight">
                  {countdown.days >= 1 ? countdown.days : countdown.hours}
                </span>
                <span className="font-serif italic text-2xl sm:text-3xl text-cream/75">
                  {countdown.days >= 1 ? "días" : "horas"}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          CARTA EDITORIAL DEL EQUIPO
          ════════════════════════════════════════════════════════════════ */}
      <section className="max-w-[1500px] mx-auto px-6 sm:px-10 py-24 sm:py-32">
        <div className="grid grid-cols-12 gap-x-6">
          <div className="col-span-12 lg:col-span-3 mb-8 lg:mb-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-marigold-deep">
              § Carta del equipo
            </p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55">
              Bogotá · MMXXVI
            </p>
          </div>
          <div className="col-span-12 lg:col-span-9">
            <p className="rv-dropcap font-serif text-xl sm:text-2xl leading-relaxed text-ink/85 max-w-3xl">
              Recibimos su confianza. En las próximas horas, nuestro equipo
              de compras llamará a nuestros productores orgánicos certificados
              para reservar las proteínas, vegetales y especias que entran a
              su menú. Ningún ingrediente se comprará dos veces ni a último
              minuto.
            </p>
            <p className="mt-6 font-serif text-lg leading-relaxed text-ink/75 max-w-3xl">
              La cocina abre el calendario de mise en place 24 horas antes
              del montaje. El chef ejecutivo asignará el plato a su brigada
              especialista, y la logística confirmará la dirección y horarios
              de acceso 72 horas antes del evento.
            </p>
            <p className="mt-8 font-display italic text-2xl leading-snug text-ink">
              — Equipo Reina Verde
            </p>
            <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/50">
              Cocina · Logística · Servicio
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          TIMELINE EDITORIAL — qué hace Reina Verde hasta el evento
          ════════════════════════════════════════════════════════════════ */}
      <section className="bg-cream-warm border-y border-ink/15">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 py-24 sm:py-32">
          <div className="grid grid-cols-12 gap-x-6 mb-16">
            <div className="col-span-12 lg:col-span-4 mb-8 lg:mb-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-marigold-deep mb-4">
                § Próximos pasos · Reina Verde
              </p>
              <h2 className="font-display font-light text-5xl sm:text-6xl tracking-[-0.03em] leading-[0.92] text-ink">
                De aquí
                <br />
                al <span className="italic">evento</span>
                <span className="text-marigold">.</span>
              </h2>
              <p className="mt-6 font-serif italic text-lg text-ink/65 leading-snug max-w-md">
                Cuatro estaciones operativas, ejecutadas por equipos
                distintos. Cada una con un check-list firmado.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-8">
              <ol className="border-t border-ink/20">
                <TimelineStage
                  marker="T − 72 h"
                  title="Compras"
                  body="Cierre de proveedores orgánicos. Salmón fresco, vegetales de cadena corta, granos andinos. El listado de compras que recibe en su PDF es exactamente lo que se compra."
                />
                <TimelineStage
                  marker="T − 24 h"
                  title="Mise en place"
                  body="El chef ejecutivo divide gramajes por porción según la receta. Brigada de cocina especialista por momento. Empaque biodegradable preparado."
                />
                <TimelineStage
                  marker="T − 2 h"
                  title="Montaje"
                  body={`Llegada a ${quote?.eventCity ?? "su ciudad"} con tiempo de holgura. Setup silencioso. La estética del montaje es idéntica a la del diseño editorial.`}
                />
                <TimelineStage
                  marker="T − 0"
                  title="Servicio"
                  body={`Coreografía de servicio para ${quote?.guestCount ?? "—"} comensales. Cero improvisación. Feedback formal en su email 48 h después.`}
                  last
                />
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          TRES PILARES APLICADOS AL EVENTO
          ════════════════════════════════════════════════════════════════ */}
      <section className="max-w-[1500px] mx-auto px-6 sm:px-10 py-24 sm:py-32">
        <div className="mb-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-marigold-deep mb-4">
            § Nuestro compromiso · Aplicado a su evento
          </p>
          <h2 className="font-display font-light text-5xl sm:text-6xl tracking-[-0.03em] leading-[0.92] text-ink max-w-2xl">
            Tres principios,
            <br />
            <span className="italic">su mesa</span>
            <span className="text-marigold">.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <PillarCard
            ordinal="I"
            code="ORG"
            title="Orgánico"
            body="Cada proteína, vegetal y especia de su menú proviene de productores certificados orgánicos colombianos. Cadena corta — máximo 48 h del campo al plato."
          />
          <PillarCard
            ordinal="II"
            code="GMT"
            title="Gourmet"
            body="El montaje, la vajilla, los aderezos y las flores de centro se diseñan bajo el mismo criterio editorial. Cada plato sale a la mesa con estándar de revista."
          />
          <PillarCard
            ordinal="III"
            code="ECO"
            title="Sostenible"
            body="Empaque kraft, vajilla de bambú, cubertería biodegradable. Cero plástico de un solo uso. Restos compostables a la planta de compostaje de Cundinamarca."
          />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          DOCUMENTOS DEL CLIENTE
          ════════════════════════════════════════════════════════════════ */}
      <section className="bg-cream-warm border-y border-ink/15">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 py-24 sm:py-32">
          <div className="grid grid-cols-12 gap-x-6 mb-12">
            <div className="col-span-12 lg:col-span-4 mb-8 lg:mb-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-marigold-deep mb-4">
                § Documentos
              </p>
              <h2 className="font-display font-light text-5xl sm:text-6xl tracking-[-0.03em] leading-[0.92] text-ink">
                Para sus
                <br />
                <span className="italic">archivos</span>
                <span className="text-marigold">.</span>
              </h2>
              <p className="mt-6 font-serif italic text-lg text-ink/65 leading-snug max-w-md">
                La cotización formal y la lista de insumos que se comprarán
                para su evento. Imprimibles o descargables.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-8">
              {quoteId && (
                <QuoteDocumentsPanel quoteId={quoteId} quoteNumber={quote?.quoteNumber ?? null} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          DATOS PRÁCTICOS COMPACTOS + CTA FINAL
          ════════════════════════════════════════════════════════════════ */}
      <section className="max-w-[1500px] mx-auto px-6 sm:px-10 py-20 sm:py-28">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-12 items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-marigold-deep mb-4">
              § Comunicación
            </p>
            <h2 className="font-display font-light text-4xl sm:text-5xl tracking-[-0.025em] leading-[0.95] text-ink mb-6">
              Si necesita
              <br />
              <span className="italic">algo más</span>
              <span className="text-marigold">.</span>
            </h2>
            <ul className="font-serif text-lg leading-relaxed text-ink/75 space-y-3 max-w-md">
              <li>· El recibo de Bold ya está en su email.</li>
              <li>· Confirmación final del menú llega 24 h antes.</li>
              <li>· Cambios de último momento al{" "}
                <a
                  href="mailto:reinaverdecatering@gmail.com"
                  className="text-marigold-deep underline underline-offset-4 hover:text-ink transition-colors"
                >
                  reinaverdecatering@gmail.com
                </a>
              </li>
              <li>· Línea directa:{" "}
                <a
                  href="tel:+573147905135"
                  className="text-marigold-deep underline underline-offset-4 hover:text-ink transition-colors"
                >
                  (+57) 314 790 5135
                </a>
              </li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Link
              href="/catering"
              className="inline-flex items-center h-12 px-7 border border-ink/40 text-ink font-sans text-[14px] tracking-tight hover:border-ink hover:bg-ink hover:text-cream transition-colors"
            >
              Volver a Catering
            </Link>
            <Link
              href="/cliente"
              className="inline-flex items-center h-12 px-7 bg-ink text-cream font-sans text-[14px] tracking-tight rv-press hover:bg-ink-soft transition-colors"
            >
              Ir a mi panel →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function TimelineStage({
  marker,
  title,
  body,
  last,
}: {
  marker: string;
  title: string;
  body: string;
  last?: boolean;
}) {
  return (
    <li
      className={
        "grid grid-cols-[110px_1fr] sm:grid-cols-[160px_1fr] gap-x-6 sm:gap-x-10 py-8 " +
        (last ? "" : "border-b border-ink/20")
      }
    >
      <div>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-marigold-deep">
          {marker}
        </p>
      </div>
      <div>
        <h3 className="font-display text-3xl sm:text-4xl text-ink tracking-tight leading-none mb-3">
          {title}
        </h3>
        <p className="font-serif text-[15px] sm:text-base text-ink/75 leading-relaxed max-w-prose">
          {body}
        </p>
      </div>
    </li>
  );
}

function PillarCard({
  ordinal,
  code,
  title,
  body,
}: {
  ordinal: string;
  code: string;
  title: string;
  body: string;
}) {
  return (
    <article className="bg-cream border border-ink/15 p-7 sm:p-8 flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-marigold-deep">
          § {ordinal} · {code}
        </span>
      </div>
      <h3 className="font-display font-light text-4xl sm:text-5xl tracking-[-0.025em] text-ink leading-[0.95]">
        {title}
        <span className="text-marigold">.</span>
      </h3>
      <p className="font-serif text-[15.5px] text-ink/75 leading-relaxed">
        {body}
      </p>
    </article>
  );
}

export default function CotizarConfirmacionPage() {
  return (
    <>
      <SiteHeader line="catering" />
      <Suspense
        fallback={
          <div className="max-w-[1500px] mx-auto px-6 py-20 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55">
            Cargando confirmación…
          </div>
        }
      >
        <ConfirmacionInner />
      </Suspense>
      <SiteFooter />
    </>
  );
}
