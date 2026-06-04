"use client";

/**
 * /liofilizados/confirmacion?order=<id>
 *
 * Pantalla post-pago editorial para línea Liofilizados.
 *
 * Narrativa: técnica de liofilizado preserva el campo en su mejor momento.
 * No es "Gracias por su compra", es "Llevó un trozo del campo".
 *
 * Estructura idéntica al rediseño de catering/pharma pero con copy propio.
 */
import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { useLiofilizadosCart } from "@/stores/shop-cart-store";

function LiofilizadosConfirmacionInner() {
  const params = useSearchParams();
  const orderId = params.get("order");
  const clearCart = useLiofilizadosCart((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <>
      {/* ════════════════ HERO CINEMATOGRÁFICO ════════════════ */}
      <section className="relative w-full bg-ink text-cream overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/img/liofilizados.jpg"
            alt="Liofilizados · El campo en frasco"
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
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-persimmon">
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
              El campo,
              <br />
              <span className="italic">en su mejor momento</span>
              <span className="text-persimmon">.</span>
            </h1>
            <p className="mt-10 font-serif italic text-xl sm:text-2xl leading-snug text-cream/85 max-w-3xl">
              Cosechado en el pico de madurez. Liofilizado al instante.
              Empacado al vacío hermético. Cuando abra el sobre, encontrará
              el sabor exacto del campo del día que se cosechó — no una
              versión envejecida.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════ CARTA DEL EQUIPO ════════════════ */}
      <section className="max-w-[1500px] mx-auto px-6 sm:px-10 py-24 sm:py-32">
        <div className="grid grid-cols-12 gap-x-6">
          <div className="col-span-12 lg:col-span-3 mb-8 lg:mb-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-persimmon">
              § Carta del equipo
            </p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55">
              Bogotá · MMXXVI
            </p>
          </div>
          <div className="col-span-12 lg:col-span-9">
            <p className="rv-dropcap font-serif text-xl sm:text-2xl leading-relaxed text-ink/85 max-w-3xl">
              La fruta que usted compró fue seleccionada en el campo cuando
              alcanzó su pico de maduración. En menos de 24 horas pasó por
              nuestra cámara de liofilización a −40 °C: el agua se sublima
              sin alterar la estructura celular ni los nutrientes.
            </p>
            <p className="mt-6 font-serif text-lg leading-relaxed text-ink/75 max-w-3xl">
              El sobre que llega a su casa conserva el 98 % de los micronutrientes
              originales y el sabor del día de cosecha. Empaque hermético con
              gas inerte — el oxígeno no toca el producto hasta que usted
              lo abre.
            </p>
            <p className="mt-8 font-display italic text-2xl leading-snug text-ink">
              — Equipo Reina Verde Liofilizados
            </p>
            <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/50">
              Cosecha · Liofilización · Hermético
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════ TIMELINE ════════════════ */}
      <section className="bg-cream-warm border-y border-ink/15">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 py-24 sm:py-32">
          <div className="grid grid-cols-12 gap-x-6 mb-16">
            <div className="col-span-12 lg:col-span-4 mb-8 lg:mb-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-persimmon mb-4">
                § Próximas estaciones
              </p>
              <h2 className="font-display font-light text-5xl sm:text-6xl tracking-[-0.03em] leading-[0.92] text-ink">
                Del campo
                <br />
                a su <span className="italic">despensa</span>
                <span className="text-persimmon">.</span>
              </h2>
              <p className="mt-6 font-serif italic text-lg text-ink/65 leading-snug max-w-md">
                Cada etapa con QA. Si el producto pierde un punto de
                hermeticidad o un grado de color, se devuelve al lote
                anterior.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-8">
              <ol className="border-t border-ink/20">
                <TimelineStage
                  marker="HOY"
                  title="Bodega"
                  body="Selección del sobre exacto que sale. Verificación de fecha de cosecha, lote y sellado al vacío. Empaque secundario en kraft."
                  accent="persimmon"
                />
                <TimelineStage
                  marker="24 h"
                  title="Despacho"
                  body="Recolección por la transportadora. Recibe email con guía y horario estimado de llegada por su ciudad."
                  accent="persimmon"
                />
                <TimelineStage
                  marker="2-5 días"
                  title="En ruta"
                  body="Tránsito nacional. El producto liofilizado tolera transporte sin cadena de frío, pero llega como salió de la bodega."
                  accent="persimmon"
                />
                <TimelineStage
                  marker="Entrega"
                  title="A su puerta"
                  body="Reciba la caja. Abra y conserve los sobres herméticos en lugar seco. Cada sobre dura 24 meses sellado."
                  accent="persimmon"
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
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-persimmon mb-4">
            § Nuestro compromiso · Aplicado a su pedido
          </p>
          <h2 className="font-display font-light text-5xl sm:text-6xl tracking-[-0.03em] leading-[0.92] text-ink max-w-2xl">
            Tres principios,
            <br />
            <span className="italic">su sobre</span>
            <span className="text-persimmon">.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <PillarCard
            ordinal="I"
            code="CSH"
            title="Cosecha"
            body="Trabajamos con campesinos certificados del eje cafetero, Cundinamarca y Boyacá. Cosecha en el pico de madurez — nunca antes, nunca después."
            accent="persimmon"
          />
          <PillarCard
            ordinal="II"
            code="LIO"
            title="Liofilizado"
            body="Cámara propia a −40 °C. El agua se sublima sin pasar por estado líquido. Resultado: 98 % de nutrientes conservados y sabor idéntico al campo."
            accent="persimmon"
          />
          <PillarCard
            ordinal="III"
            code="HRM"
            title="Hermético"
            body="Empaque sellado con gas inerte. El oxígeno no toca el producto hasta que usted lo abre. Vida útil 24 meses sin perder propiedades."
            accent="persimmon"
          />
        </div>
      </section>

      {/* ════════════════ COMUNICACIÓN + CTA ════════════════ */}
      <section className="bg-cream-warm border-t border-ink/15">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 py-20 sm:py-28">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-12 items-end">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-persimmon mb-4">
                § Comunicación
              </p>
              <h2 className="font-display font-light text-4xl sm:text-5xl tracking-[-0.025em] leading-[0.95] text-ink mb-6">
                Si necesita
                <br />
                <span className="italic">algo más</span>
                <span className="text-persimmon">.</span>
              </h2>
              <ul className="font-serif text-lg leading-relaxed text-ink/75 space-y-3 max-w-md">
                <li>· El recibo Bold ya está en su email.</li>
                <li>· Número de guía llega en máximo 24 h.</li>
                <li>· Recetas y formas de uso en la caja.</li>
                <li>· Soporte:{" "}
                  <a
                    href="mailto:reinaverdecatering@gmail.com"
                    className="text-persimmon underline underline-offset-4 hover:text-ink transition-colors"
                  >
                    reinaverdecatering@gmail.com
                  </a>
                </li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Link
                href="/liofilizados/catalogo"
                className="inline-flex items-center h-12 px-7 border border-ink/40 text-ink font-sans text-[14px] tracking-tight hover:border-ink hover:bg-ink hover:text-cream transition-colors"
              >
                Seguir explorando
              </Link>
              <Link
                href="/cliente"
                className="inline-flex items-center h-12 px-7 bg-persimmon text-cream font-sans text-[14px] tracking-tight rv-press hover:bg-persimmon-deep transition-colors"
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
  accent = "persimmon",
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
  accent = "persimmon",
}: {
  ordinal: string;
  code: string;
  title: string;
  body: string;
  accent?: "iris" | "marigold" | "persimmon";
}) {
  const dotDeep =
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
      <span className={"font-mono text-[10.5px] uppercase tracking-[0.28em] " + dotDeep}>
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

export default function LiofilizadosConfirmacionPage() {
  return (
    <>
      <SiteHeader line="liofilizados" />
      <Suspense
        fallback={
          <div className="max-w-[1500px] mx-auto px-6 py-20 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55">
            Cargando confirmación…
          </div>
        }
      >
        <LiofilizadosConfirmacionInner />
      </Suspense>
      <SiteFooter />
    </>
  );
}
