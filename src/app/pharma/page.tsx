import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { EditorialRule, NumberedRow } from "@/components/marketing/editorial";

const CATEGORIES = [
  { code: "ACE", name: "Aceites",   description: "Full y broad-spectrum, 500–2000mg.", note: "Sublingual" },
  { code: "FLR", name: "Flores",     description: "Cáñamo industrial, < 0.3% THC.",      note: "Premium" },
  { code: "TIN", name: "Tinturas",   description: "Extractos concentrados, dosificador.", note: "Terapéutico" },
  { code: "TOP", name: "Tópicos",    description: "Bálsamos, cremas, ungüentos.",         note: "Localizado" },
  { code: "KIT", name: "Kits",       description: "Rutinas curadas para nuevos usuarios.", note: "Curado" },
  { code: "PET", name: "Línea pet",  description: "Formulación veterinaria, sabor salmón.", note: "Mascotas" },
] as const;

const PILLARS = [
  { ord: 1, title: "Todo lleva certificado de análisis", body: "Cada lote pasa por laboratorio independiente. El COA es público — busca el código del frasco y lo abrirás. Nada que decir que no podamos probar en papel." },
  { ord: 2, title: "Trazabilidad por código de lote", body: "El frasco tiene un código. Ese código te lleva al cultivo, al método de extracción, a la fecha de envasado, al lote de la prueba. Auditable, repetible." },
  { ord: 3, title: "Envío neutro a todo el país", body: "Empaque sin marca exterior. Recogida por mensajería con tracking. Si quieres factura electrónica con NIT empresarial, también." },
  { ord: 4, title: "Asesoría que no es venta", body: "Si no sabes qué necesitas, pregunta. Nuestro equipo recomienda según el caso — y a veces eso significa que no compres nada todavía." },
];

export default function PharmaHomePage() {
  return (
    <>
      <SiteHeader line="pharma" />

      {/* ════════════════ HERO ════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 pt-12 sm:pt-16">
        <div className="grid grid-cols-12 gap-x-6">
          <div className="col-span-12 lg:col-span-3 mb-6 lg:mb-0">
            <div className="rv-rise rv-delay-0 font-mono text-[11px] uppercase tracking-[0.22em] text-iris leading-relaxed">
              <p>División 02</p>
              <p>Fito-bienestar legal</p>
              <p>Reg. Invima</p>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-9">
            <h1 className="rv-rise rv-delay-1 font-display font-light tracking-[-0.035em] leading-[0.9] text-ink text-6xl sm:text-8xl lg:text-[136px]">
              Fito-bienestar
              <br />
              con <span className="italic">papel</span>
              <span className="text-iris">.</span>
            </h1>
            <p className="rv-rise rv-delay-3 mt-10 font-serif italic text-xl sm:text-2xl leading-snug text-ink/75 max-w-3xl">
              Cannabis medicinal y derivados de cáñamo, formulados bajo regulación colombiana
              y respaldados por análisis de laboratorio público. Sin promesas de marketing.
            </p>

            <div className="rv-rise rv-delay-4 mt-12 flex flex-wrap gap-4">
              <Link
                href="/pharma/catalogo"
                className="inline-flex items-center h-14 px-9 bg-iris text-cream font-sans text-[14px] tracking-tight rv-press hover:bg-iris-deep"
              >
                Ver catálogo →
              </Link>
              <Link
                href="/pharma/catalogo?filter=lab"
                className="inline-flex items-center h-14 px-9 border border-ink/40 text-ink font-sans text-[14px] tracking-tight hover:border-ink hover:bg-ink hover:text-cream transition-colors"
              >
                COA por lote
              </Link>
            </div>
          </div>
        </div>

        {/* KPI band */}
        <dl className="rv-fade rv-delay-5 mt-20 grid grid-cols-2 sm:grid-cols-4 border-y border-ink/15 divide-x divide-ink/15">
          {[
            { k: "Lotes únicos", v: "62" },
            { k: "Análisis lab", v: "100%" },
            { k: "Cumplimiento", v: "Invima" },
            { k: "Cobertura", v: "Nacional" },
          ].map((s) => (
            <div key={s.k} className="px-6 py-7">
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55 mb-2">
                {s.k}
              </dt>
              <dd className="font-display text-4xl sm:text-5xl tracking-[-0.025em] tabular text-ink">
                {s.v}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ════════════════ CATEGORIES ════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-32">
        <div className="grid grid-cols-12 gap-x-6 mb-12">
          <div className="col-span-12 lg:col-span-5">
            <EditorialRule index="01" label="Catálogo por familia" />
            <h2 className="mt-6 font-display font-light text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-[-0.025em] text-ink">
              Seis
              <br />
              familias,
              <br />
              <span className="italic">una</span> ética.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7 lg:pt-2">
            <p className="font-serif italic text-xl leading-snug text-ink/75 max-w-2xl">
              Empezamos por aceites y crecimos a flores, tinturas, tópicos y kits. Cada
              familia se evalúa con la misma disciplina: ¿tenemos el COA? ¿tenemos el caso de uso?
              ¿tenemos la asesoría? Si la respuesta a las tres es sí, entra al catálogo.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-ink/15">
          {CATEGORIES.map((c) => (
            <Link
              key={c.code}
              href={`/pharma/catalogo?cat=${c.name.toLowerCase()}`}
              className="group p-7 border-r border-b border-ink/15 hover:bg-iris/[0.04] transition-colors"
            >
              <div className="flex items-baseline justify-between mb-6">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-iris">
                  {c.code}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink/40">
                  {c.note}
                </span>
              </div>
              <h3 className="font-display text-4xl tracking-tight text-ink leading-none mb-3">
                {c.name}
              </h3>
              <p className="text-[14px] leading-relaxed text-ink/70 mb-6">{c.description}</p>
              <div className="flex items-center justify-between font-sans text-[13px] text-ink">
                <span className="rv-link">Ver familia</span>
                <span className="font-display text-2xl group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ════════════════ PILLARS ════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-32">
        <EditorialRule index="02" label="Cómo se diferencia" className="mb-12" />
        <div className="grid grid-cols-12 gap-x-6">
          <div className="col-span-12 lg:col-span-4 mb-10 lg:mb-0">
            <h2 className="font-display font-light text-5xl sm:text-6xl leading-[0.95] tracking-[-0.025em] text-ink">
              Cuatro
              <br />
              <span className="italic">disciplinas</span>
              <br />
              de la casa.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-7 lg:col-start-6">
            <div className="border-b border-ink/15">
              {PILLARS.map((d) => (
                <NumberedRow key={d.ord} ordinal={d.ord} title={d.title}>{d.body}</NumberedRow>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
