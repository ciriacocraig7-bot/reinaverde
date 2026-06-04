"use client";

/**
 * /pharma/confirmacion?order=<id>
 *
 * Pantalla post-pago editorial para línea Pharma. Reemplaza la versión
 * genérica del componente compartido.
 *
 * Narrativa pharma: discreción + calidad farmacéutica + trazabilidad.
 * No es "Gracias por su compra", es "Su bienestar va en camino".
 *
 * Estructura:
 *  · Hero a pantalla completa con vignette + headline + número de pedido
 *  · Carta del equipo Pharma
 *  · Timeline T-72h / T-48h / T-24h / Entrega
 *  · 3 pilares aplicados: Discreción · Certificación · Tracking
 *  · Comunicación práctica + CTAs
 */
import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { usePharmaCart } from "@/stores/shop-cart-store";

function PharmaConfirmacionInner() {
  const params = useSearchParams();
  const orderId = params.get("order");
  const clearCart = usePharmaCart((s) => s.clearCart);

  // Limpiar carrito al llegar a confirmacion (post-pago aprobado)
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <>
      {/* ════════════════ HERO CINEMATOGRÁFICO ════════════════ */}
      <section className="relative w-full bg-ink text-cream overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/img/pharma.jpg"
            alt="Pharma · Empaque silencioso"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-55"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(31,29,26,0.5) 0%, rgba(31,29,26,0.2) 40%, rgba(31,29,26,0.9) 100%)",
            }}
            aria-hidden
          />
        </div>

        <div className="relative max-w-[1500px] mx-auto px-6 sm:px-10 pt-24 sm:pt-32 pb-20 sm:pb-28 grid grid-cols-12 gap-x-6">
          <div className="col-span-12 lg:col-span-3 mb-8 lg:mb-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-iris">
              § Pedido recibido
            </p>
            {orderId && (
              <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-cream/55 break-all">
                Ref. {orderId.slice(0, 8)}…
              </p>
            )}
          </div>

          <div className="col-span-12 lg:col-span-9">
            <h1 className="font-display font-light tracking-[-0.04em] leading-[0.86] text-cream text-5xl sm:text-7xl lg:text-[120px]">
              Su bienestar,
              <br />
              <span className="italic">en camino</span>
              <span className="text-iris">.</span>
            </h1>
            <p className="mt-10 font-serif italic text-xl sm:text-2xl leading-snug text-cream/85 max-w-3xl">
              Empacamos sin marca exterior. Despachamos con tracking
              transparente. La caja llega a su dirección sin que nadie más
              sepa qué hay adentro — esa es la esencia de nuestra línea
              farmacéutica.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════ CARTA DEL EQUIPO ════════════════ */}
      <section className="max-w-[1500px] mx-auto px-6 sm:px-10 py-24 sm:py-32">
        <div className="grid grid-cols-12 gap-x-6">
          <div className="col-span-12 lg:col-span-3 mb-8 lg:mb-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-iris-deep">
              § Carta del equipo Pharma
            </p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55">
              Bogotá · MMXXVI
            </p>
          </div>
          <div className="col-span-12 lg:col-span-9">
            <p className="rv-dropcap font-serif text-xl sm:text-2xl leading-relaxed text-ink/85 max-w-3xl">
              Recibimos su pedido. Cada producto que sale de nuestra bodega
              tiene certificado de calidad farmacéutica y lote rastreable.
              Su caja se prepara hoy, se empaca en kraft neutro sin sellos
              visibles y se despacha con guía nacional.
            </p>
            <p className="mt-6 font-serif text-lg leading-relaxed text-ink/75 max-w-3xl">
              El número de tracking llegará a su correo en las próximas 24 h.
              Cualquier ajuste en la dirección de envío o duda sobre el
              producto puede resolverse en línea directa con el equipo.
            </p>
            <p className="mt-8 font-display italic text-2xl leading-snug text-ink">
              — Equipo Reina Verde Pharma
            </p>
            <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/50">
              Calidad · Discreción · Trazabilidad
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════ TIMELINE ════════════════ */}
      <section className="bg-cream-warm border-y border-ink/15">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 py-24 sm:py-32">
          <div className="grid grid-cols-12 gap-x-6 mb-16">
            <div className="col-span-12 lg:col-span-4 mb-8 lg:mb-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-iris-deep mb-4">
                § Próximas estaciones
              </p>
              <h2 className="font-display font-light text-5xl sm:text-6xl tracking-[-0.03em] leading-[0.92] text-ink">
                De la bodega
                <br />
                a su <span className="italic">puerta</span>
                <span className="text-iris">.</span>
              </h2>
              <p className="mt-6 font-serif italic text-lg text-ink/65 leading-snug max-w-md">
                Cada etapa con QA propio. Si algo no cumple estándar, vuelve
                a la bodega antes de salir.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-8">
              <ol className="border-t border-ink/20">
                <TimelineStage
                  marker="HOY"
                  title="Preparación"
                  body="El equipo de bodega arma su pedido con doble verificación de lote y vencimiento. Empaque en caja kraft sin marca exterior."
                  accent="iris"
                />
                <TimelineStage
                  marker="24 h"
                  title="Despacho"
                  body="Recolección por la transportadora. Recibe email con el número de guía para tracking 24/7."
                  accent="iris"
                />
                <TimelineStage
                  marker="2-4 días"
                  title="En ruta"
                  body="Tránsito nacional. Para Bogotá metropolitana, normalmente 1 día hábil; ciudades capitales 2-3 días; resto del país 3-4 días."
                  accent="iris"
                />
                <TimelineStage
                  marker="Entrega"
                  title="A su puerta"
                  body="Firma de recibido. Si no está, segunda visita o punto de entrega cercano sin costo adicional."
                  accent="iris"
                  last
                />
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ TRES PILARES ════════════════ */}
      <section className="max-w-[1500px] mx-auto px-6 sm:px-10 py-24 sm:py-32">
        <div className="mb-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-iris-deep mb-4">
            § Nuestro compromiso · Aplicado a su pedido
          </p>
          <h2 className="font-display font-light text-5xl sm:text-6xl tracking-[-0.03em] leading-[0.92] text-ink max-w-2xl">
            Tres principios,
            <br />
            <span className="italic">su caja</span>
            <span className="text-iris">.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <PillarCard
            ordinal="I"
            code="DCR"
            title="Discreción"
            body="Empaque kraft neutro sin logos exteriores ni indicación del contenido. Nadie en el edificio sabe qué llega — esa privacidad es parte del producto."
            accent="iris"
          />
          <PillarCard
            ordinal="II"
            code="CRT"
            title="Certificación"
            body="Cada producto trae su certificado de análisis de laboratorio, lote rastreable y vencimiento legible. Calidad farmacéutica de extremo a extremo."
            accent="iris"
          />
          <PillarCard
            ordinal="III"
            code="TRK"
            title="Trazabilidad"
            body="Número de guía emitido en menos de 24 h. Tracking en tiempo real disponible 24/7. Si el paquete se desvía, lo sabemos antes que usted."
            accent="iris"
          />
        </div>
      </section>

      {/* ════════════════ COMUNICACIÓN + CTA ════════════════ */}
      <section className="bg-cream-warm border-t border-ink/15">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 py-20 sm:py-28">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-12 items-end">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-iris-deep mb-4">
                § Comunicación
              </p>
              <h2 className="font-display font-light text-4xl sm:text-5xl tracking-[-0.025em] leading-[0.95] text-ink mb-6">
                Si necesita
                <br />
                <span className="italic">algo más</span>
                <span className="text-iris">.</span>
              </h2>
              <ul className="font-serif text-lg leading-relaxed text-ink/75 space-y-3 max-w-md">
                <li>· El recibo Bold ya está en su email.</li>
                <li>· Número de guía llega en máximo 24 h.</li>
                <li>· Tracking nacional disponible 24/7.</li>
                <li>· Soporte:{" "}
                  <a
                    href="mailto:reinaverdecatering@gmail.com"
                    className="text-iris-deep underline underline-offset-4 hover:text-ink transition-colors"
                  >
                    reinaverdecatering@gmail.com
                  </a>
                </li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Link
                href="/pharma/catalogo"
                className="inline-flex items-center h-12 px-7 border border-ink/40 text-ink font-sans text-[14px] tracking-tight hover:border-ink hover:bg-ink hover:text-cream transition-colors"
              >
                Seguir explorando
              </Link>
              <Link
                href="/cliente"
                className="inline-flex items-center h-12 px-7 bg-iris text-cream font-sans text-[14px] tracking-tight rv-press hover:bg-iris-deep transition-colors"
              >
                Ir a mi panel →
              </Link>
            </div>
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
  accent = "iris",
  last,
}: {
  marker: string;
  title: string;
  body: string;
  accent?: "iris" | "marigold" | "persimmon";
  last?: boolean;
}) {
  const accentColor =
    accent === "iris"
      ? "text-iris-deep"
      : accent === "persimmon"
        ? "text-persimmon"
        : "text-marigold-deep";
  return (
    <li
      className={
        "grid grid-cols-[110px_1fr] sm:grid-cols-[160px_1fr] gap-x-6 sm:gap-x-10 py-8 " +
        (last ? "" : "border-b border-ink/20")
      }
    >
      <div>
        <p className={"font-mono text-[10.5px] uppercase tracking-[0.28em] " + accentColor}>
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
  accent = "iris",
}: {
  ordinal: string;
  code: string;
  title: string;
  body: string;
  accent?: "iris" | "marigold" | "persimmon";
}) {
  const dot =
    accent === "iris"
      ? "text-iris-deep"
      : accent === "persimmon"
        ? "text-persimmon"
        : "text-marigold-deep";
  const dotChar =
    accent === "iris"
      ? "text-iris"
      : accent === "persimmon"
        ? "text-persimmon"
        : "text-marigold";
  return (
    <article className="bg-cream border border-ink/15 p-7 sm:p-8 flex flex-col gap-4">
      <span className={"font-mono text-[10.5px] uppercase tracking-[0.28em] " + dot}>
        § {ordinal} · {code}
      </span>
      <h3 className="font-display font-light text-4xl sm:text-5xl tracking-[-0.025em] text-ink leading-[0.95]">
        {title}
        <span className={dotChar}>.</span>
      </h3>
      <p className="font-serif text-[15.5px] text-ink/75 leading-relaxed">
        {body}
      </p>
    </article>
  );
}

export default function PharmaConfirmacionPage() {
  return (
    <>
      <SiteHeader line="pharma" />
      <Suspense
        fallback={
          <div className="max-w-[1500px] mx-auto px-6 py-20 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55">
            Cargando confirmación…
          </div>
        }
      >
        <PharmaConfirmacionInner />
      </Suspense>
      <SiteFooter />
    </>
  );
}
