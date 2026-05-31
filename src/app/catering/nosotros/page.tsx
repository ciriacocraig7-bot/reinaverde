import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { EditorialRule, NumberedRow } from "@/components/marketing/editorial";

const PILARES = [
  {
    ord: 1,
    title: "Ingredientes orgánicos en cada plato",
    body:
      "Salud y sabor en armonía. Trabajamos con productores certificados orgánicos y de cadena corta — la carta cambia según la estación porque cambia lo que llega del campo. Nutrir a tu equipo sin sacrificar el placer del plato.",
  },
  {
    ord: 2,
    title: "Percepción gourmet de principio a fin",
    body:
      "Cuidamos cada detalle visual para despertar el \"hambre visual\" de inmediato. El empaque, el plato, el montaje del buffet, la flora de centro de mesa: todo opera bajo el mismo criterio editorial.",
  },
  {
    ord: 3,
    title: "Materiales sostenibles sin compromiso",
    body:
      "Empaques y montajes ecofriendly que suman a la responsabilidad social de tu empresa — sin perder elegancia. Kraft, cerámica, vajilla de bambú, cubertería biodegradable. Cero plástico de un solo uso en eventos premium.",
  },
];

const RAZONES = [
  {
    ord: 4,
    title: "Confianza corporativa probada",
    body:
      "Cumplimiento estricto, puntualidad absoluta y capacidad operativa comprobada para manejar grandes volúmenes sin perder la calidad. Cada montaje sale con check-list firmado.",
  },
  {
    ord: 5,
    title: "Personalización total del menú",
    body:
      "Adaptamos cada propuesta a las necesidades específicas, temática del evento y restricciones dietéticas de tus invitados especiales. Vegano, sin gluten, kosher, halal — lo que pidan.",
  },
  {
    ord: 6,
    title: "Estatus de marca, no comida",
    body:
      "Nuestro servicio premium trasciende la comida para convertirse en una extensión directa del prestigio de tu organización. Lo que el comensal recuerda al día siguiente.",
  },
];

export default function CateringNosotrosPage() {
  return (
    <>
      <SiteHeader line="catering" />

      {/* ════════════════ HERO ════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 pt-12 sm:pt-16">
        <div className="grid grid-cols-12 gap-x-6">
          <div className="col-span-12 lg:col-span-3 mb-6 lg:mb-0">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-marigold leading-relaxed">
              <p>Quiénes somos</p>
              <p>Reina Verde Catering</p>
              <p>Cobertura nacional</p>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-9">
            <h1 className="font-display font-light tracking-[-0.035em] leading-[0.92] text-ink text-5xl sm:text-7xl lg:text-[120px]">
              Más que
              <br />
              comida —
              <br />
              <span className="italic">creamos</span> marca
              <span className="text-marigold">.</span>
            </h1>
          </div>
        </div>
      </section>

      {/* ════════════════ MANIFIESTO ════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-24">
        <EditorialRule index="01" label="Carta del fundador" className="mb-12" />
        <div className="grid grid-cols-12 gap-x-6 gap-y-10">
          <div className="col-span-12 lg:col-span-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/60">
              Reina Verde Catering
            </p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/60">
              Bogotá · MMXXVI
            </p>
          </div>
          <div className="col-span-12 lg:col-span-7">
            <p className="rv-dropcap font-serif text-xl leading-relaxed text-ink/85">
              Somos una empresa especializada en el diseño y ejecución de
              catering para todo tipo de eventos, con un enfoque experto en el
              sector corporativo. Transformamos ingredientes orgánicos y
              saludables en propuestas gourmet con una estética impecable y
              artesanal, diseñadas para proyectar el mejor estatus de tu empresa
              en cada bocado.
            </p>
            <p className="font-serif text-lg leading-relaxed text-ink/75 mt-6">
              Reina Verde nació de una frustración compartida con todos los
              equipos corporativos que han contratado catering en Colombia: el
              estándar promedio es bajo, predecible y descuidado. Nos
              propusimos elevarlo. No solo el sabor — la estética, el empaque,
              la presentación y la conciencia ambiental con la que servimos.
            </p>
            <p className="font-display italic text-2xl leading-snug text-ink mt-10">
              — Reina Verde Catering
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════ TRES PILARES ════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-32">
        <EditorialRule index="02" label="Los tres pilares" className="mb-12" />
        <div className="grid grid-cols-12 gap-x-6">
          <div className="col-span-12 lg:col-span-4 mb-10 lg:mb-0">
            <h2 className="font-display font-light text-5xl sm:text-6xl leading-[0.95] tracking-[-0.025em] text-ink">
              Alta cocina
              <br />
              <span className="italic">saludable</span>
              <br />
              para negocios.
            </h2>
            <p className="mt-8 font-serif italic text-lg text-ink/70 leading-snug max-w-md">
              Cada servicio se sostiene sobre tres principios — innegociables.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-7 lg:col-start-6">
            <div className="border-b border-ink/15">
              {PILARES.map((p) => (
                <NumberedRow key={p.ord} ordinal={p.ord} title={p.title}>
                  {p.body}
                </NumberedRow>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ POR QUÉ ELEGIRNOS ════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-32">
        <EditorialRule index="03" label="Por qué elegirnos" className="mb-12" />
        <div className="grid grid-cols-12 gap-x-6">
          <div className="col-span-12 lg:col-span-4 mb-10 lg:mb-0">
            <h2 className="font-display font-light text-5xl sm:text-6xl leading-[0.95] tracking-[-0.025em] text-ink">
              Tres razones
              <br />
              <span className="italic">probadas</span>
              <br />
              en eventos
              <br />
              corporativos.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-7 lg:col-start-6">
            <div className="border-b border-ink/15">
              {RAZONES.map((r) => (
                <NumberedRow key={r.ord} ordinal={r.ord} title={r.title}>
                  {r.body}
                </NumberedRow>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ COBERTURA ════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-32">
        <EditorialRule index="04" label="Cobertura" className="mb-12" />
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display font-light text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-[-0.025em] text-ink">
              Operamos en
              <br />
              seis <span className="italic">ciudades</span>.
            </h2>
            <p className="mt-8 font-serif italic text-lg text-ink/75 max-w-md leading-snug">
              Capacidad logística experta y estandarización de calidad impecable
              para operar de manera escalable y eficiente donde tu empresa nos
              necesite.
            </p>
            <ul className="mt-10 grid grid-cols-2 gap-y-4">
              {["Medellín", "Bogotá", "Cali", "Barranquilla", "Cartagena", "Armenia"].map(
                (c, i) => (
                  <li key={c} className="flex items-baseline gap-3">
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-marigold tabular">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-2xl text-ink tracking-tight">
                      {c}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </div>
          <div className="relative w-full aspect-[16/10] border border-ink/15 overflow-hidden">
            <Image
              src="/img/cobertura/colombia.jpg"
              alt="Cobertura nacional Reina Verde Catering"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ════════════════ CTA ════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-32">
        <div className="bg-marigold p-10 sm:p-16 relative overflow-hidden">
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-end">
            <h2 className="font-display font-light text-5xl sm:text-7xl tracking-[-0.03em] leading-[0.92] text-ink">
              ¿Listos para
              <br />
              <span className="italic">cotizar</span>?
            </h2>
            <div className="flex flex-col gap-5">
              <p className="font-serif italic text-lg text-ink/85 leading-snug">
                Contáctanos hoy para diseñar una propuesta a la medida de tu
                empresa.
              </p>
              <div className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink/80 space-y-1">
                <p>(+57) 314 790 5135</p>
                <p>reinaverdecatering@gmail.com</p>
                <p>@reinaverdecatering</p>
              </div>
              <Link
                href="/catering/orden"
                className="inline-flex items-center h-12 px-7 bg-ink text-cream font-sans text-[14px] tracking-tight rv-press hover:bg-ink-soft w-fit"
              >
                Cotizar evento →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
