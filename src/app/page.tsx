import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { EditorialRule, Marquee, NumberedRow } from "@/components/marketing/editorial";

const DIVISIONS = [
  {
    slug: "catering",
    index: "01",
    name: "Catering",
    tagline: "El reverso impecable de una buena mesa",
    description:
      "Comida corporativa con producción, logística y facturación cohabitando en un solo flujo. De la cotización al servicio del último canapé.",
    accent: "text-marigold",
    accentBg: "bg-marigold",
    accentRing: "ring-marigold/30",
    capabilities: ["Menú a la carta", "Eventos y bodas", "Facturación B2B", "Logística propia"],
    proofPoints: [
      { k: "Servicios", v: "500+" },
      { k: "Comensales", v: "32k" },
      { k: "Satisfacción", v: "98%" },
    ],
  },
  {
    slug: "pharma",
    index: "02",
    name: "Pharma",
    tagline: "Fito-bienestar legal, formulado con disciplina",
    description:
      "Aceites, tinturas y tópicos de cannabis medicinal con trazabilidad de lote, sello de calidad y envío discreto. Sin promesas, con evidencia.",
    accent: "text-iris",
    accentBg: "bg-iris",
    accentRing: "ring-iris/30",
    capabilities: ["Full-spectrum", "Broad-spectrum", "Tópicos", "Línea pet"],
    proofPoints: [
      { k: "Lotes únicos", v: "62" },
      { k: "Análisis lab", v: "100%" },
      { k: "Cumplimiento", v: "Invima" },
    ],
  },
  {
    slug: "liofilizados",
    index: "03",
    name: "Liofilizados",
    tagline: "Fruta colombiana, conservada en frío seco",
    description:
      "Mango, piña, uchuva, maracuyá. Liofilización industrial que conserva 95% del valor nutricional. Snack, repostería, mayorista.",
    accent: "text-persimmon",
    accentBg: "bg-persimmon",
    accentRing: "ring-persimmon/30",
    capabilities: ["Tropicales", "Berries", "Mayorista", "Repostería"],
    proofPoints: [
      { k: "Origen", v: "Colombia" },
      { k: "Shelf life", v: "24m" },
      { k: "Nutrición", v: "95%" },
    ],
  },
] as const;

export default function HubPage() {
  return (
    <>
      <SiteHeader line="hub" />

      {/* ════════════════ HERO ════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 pt-12 sm:pt-16">
        <div className="grid grid-cols-12 gap-x-6">
          {/* Left: editorial dateline */}
          <div className="col-span-12 lg:col-span-3 lg:pt-2 mb-8 lg:mb-0">
            <div className="rv-rise rv-delay-0 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55 leading-relaxed">
              <p>Edición 02 — MMXXVI</p>
              <p>Casa Reina Verde</p>
              <p>Bogotá / Sabana</p>
            </div>
          </div>

          {/* Headline */}
          <div className="col-span-12 lg:col-span-9">
            <h1 className="rv-rise rv-delay-1 font-display font-light tracking-[-0.035em] leading-[0.92] text-ink text-[64px] sm:text-[112px] lg:text-[160px]">
              Una sola casa,
              <br />
              <span className="italic font-medium">tres oficios</span>.
            </h1>
            <div className="rv-rise rv-delay-3 mt-12 grid sm:grid-cols-[1fr_auto] items-end gap-6">
              <p className="font-serif text-xl sm:text-2xl leading-snug text-ink/75 max-w-2xl italic">
                Catering corporativo, fito-bienestar legal y frutas liofilizadas — producidos
                bajo el mismo techo y la misma curaduría desde Colombia.
              </p>
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/registro"
                  className="inline-flex items-center h-12 px-7 bg-ink text-cream font-sans text-[14px] tracking-tight rv-press hover:bg-ink-soft"
                >
                  Abrir cuenta →
                </Link>
                <Link
                  href="#divisiones"
                  className="inline-flex items-center h-12 px-7 border border-ink/40 text-ink font-sans text-[14px] tracking-tight hover:border-ink hover:bg-ink hover:text-cream transition-colors"
                >
                  Explorar índice
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div className="rv-fade rv-delay-5 mt-20 border-y border-ink/15 py-4 overflow-hidden">
          <Marquee
            items={[
              "Pagos por Bold",
              "Producción in-house",
              "Trazabilidad por lote",
              "Logística propia",
              "Cumplimiento Invima",
              "Origen Colombia",
            ]}
          />
        </div>
      </section>

      {/* ════════════════ DIVISIONS INDEX ════════════════ */}
      <section id="divisiones" className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-24 sm:mt-32">
        <EditorialRule index="01" label="Las divisiones" className="mb-12" />

        <div className="grid lg:grid-cols-3 gap-10 lg:gap-8">
          {DIVISIONS.map((d, i) => (
            <Link
              key={d.slug}
              href={`/${d.slug}`}
              className={`group block rv-rise rv-delay-${i + 4}`}
            >
              <article className="bg-cream-warm border border-ink/10 p-7 sm:p-8 h-full flex flex-col transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-paper-lg">
                {/* Top row */}
                <div className="flex items-start justify-between mb-8">
                  <span className={`font-mono text-[11px] uppercase tracking-[0.22em] ${d.accent}`}>
                    § {d.index}
                  </span>
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${d.accentBg} ring-4 ${d.accentRing} transition-transform group-hover:scale-110`}
                    aria-hidden
                  />
                </div>

                {/* Display name */}
                <h3 className="font-display font-medium text-[56px] sm:text-[64px] tracking-[-0.03em] leading-[0.9] mb-3 text-ink">
                  {d.name}
                </h3>
                <p className="font-serif italic text-[18px] leading-snug text-ink/70 mb-7">
                  {d.tagline}
                </p>

                {/* Body */}
                <p className="text-[15px] leading-relaxed text-ink/75 mb-7">
                  {d.description}
                </p>

                {/* Capabilities */}
                <ul className="space-y-1 mb-8 text-[13px] text-ink/80">
                  {d.capabilities.map((c) => (
                    <li key={c} className="flex gap-3 items-baseline">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-ink/40">
                        ◇
                      </span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>

                {/* Proof points */}
                <dl className="mt-auto grid grid-cols-3 gap-4 pt-6 border-t border-ink/15">
                  {d.proofPoints.map((p) => (
                    <div key={p.k}>
                      <dt className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-ink/50">
                        {p.k}
                      </dt>
                      <dd className="font-display text-2xl tracking-tight text-ink mt-1 tabular">
                        {p.v}
                      </dd>
                    </div>
                  ))}
                </dl>

                {/* CTA */}
                <div className="mt-8 flex items-center justify-between">
                  <span className="font-sans text-[14px] tracking-tight text-ink">
                    Entrar a {d.name}
                  </span>
                  <span className="font-display text-3xl text-ink transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* ════════════════ MANIFESTO ════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-32 sm:mt-40">
        <EditorialRule index="02" label="Manifiesto de la casa" className="mb-16" />

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <h2 className="font-display font-light tracking-[-0.025em] text-5xl sm:text-6xl lg:text-7xl leading-[0.95] text-ink">
              No vendemos
              <br />
              <span className="italic">categorías</span>.
              <br />
              Vendemos
              <br />
              <span className="italic">criterio</span>.
            </h2>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <div>
              <NumberedRow ordinal={1} title="Producción bajo el mismo techo">
                Cocinamos, formulamos y empacamos en Bogotá. Nada subcontratado en lo que toca
                materia prima — solo en lo que toca distribución. Tres divisiones, una cadena.
              </NumberedRow>
              <NumberedRow ordinal={2} title="Trazabilidad por lote">
                Cada lote — un menú de evento, un frasco de aceite, una bolsa de mango — lleva
                ID propio. Si algo se devuelve, sabemos exactamente qué, cuándo y por qué.
              </NumberedRow>
              <NumberedRow ordinal={3} title="Pagos que cierran el ciclo">
                Bold conecta el checkout con la contabilidad. El cliente paga, la cocina arranca,
                el sistema factura. Sin doble digitación, sin conciliación dolorosa.
              </NumberedRow>
              <NumberedRow ordinal={4} title="Sin promesas que no podamos certificar">
                Si decimos "100% legal" es porque tenemos el papel del Invima. Si decimos "95% de
                nutrientes" es porque hay análisis. El criterio cuesta tiempo, no marketing.
              </NumberedRow>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ CTA STRIP ════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-32 sm:mt-40">
        <div className="bg-ink text-cream p-10 sm:p-16 lg:p-20 relative overflow-hidden">
          <div className="absolute top-4 right-6 font-mono text-[10.5px] uppercase tracking-[0.22em] text-cream/50">
            § 03 — Abrir cuenta
          </div>
          <div className="grid lg:grid-cols-2 gap-10 items-end">
            <h2 className="font-display font-light text-5xl sm:text-7xl lg:text-[96px] tracking-[-0.035em] leading-[0.92]">
              ¿Empezamos
              <br />
              <span className="italic">por algún lado</span>?
            </h2>
            <div className="flex flex-col gap-4 lg:items-end">
              <p className="font-serif italic text-xl leading-snug max-w-md text-cream/80">
                Una cuenta sirve para las tres líneas. Sus pedidos, eventos, facturas y
                seguimientos viven en un solo panel.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/registro"
                  className="inline-flex items-center h-12 px-7 bg-marigold text-ink font-sans text-[14px] tracking-tight rv-press hover:bg-cream"
                >
                  Crear cuenta gratis
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center h-12 px-7 border border-cream/40 text-cream font-sans text-[14px] tracking-tight hover:border-cream hover:bg-cream hover:text-ink transition-colors"
                >
                  Ya tengo cuenta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
