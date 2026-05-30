import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { EditorialRule, NumberedRow } from "@/components/marketing/editorial";

const FRUITS = [
  { code: "MGO", name: "Mango",        region: "Tolima",          note: "Rodajas premium" },
  { code: "PIA", name: "Piña Golden",  region: "Santander",       note: "Trozos hidratados" },
  { code: "MRC", name: "Maracuyá",     region: "Huila",           note: "Polvo natural" },
  { code: "UCH", name: "Uchuva",       region: "Cundinamarca",    note: "Entera crujiente" },
  { code: "MIX", name: "Mix berries",  region: "Boyacá",          note: "Cuatro frutas" },
  { code: "GNB", name: "Guanábana",    region: "Magdalena",       note: "Edición limitada" },
] as const;

const PROCESS = [
  { ord: 1, title: "Cosecha en punto óptimo", body: "Trabajamos con asociaciones de pequeños productores que cosechan la fruta a su punto exacto de madurez. Sin acelerar, sin retrasar." },
  { ord: 2, title: "Congelación rápida", body: "La fruta entra al congelador a -40°C en menos de cuatro horas desde la cosecha. La célula no se rompe, el sabor queda intacto." },
  { ord: 3, title: "Sublimación al vacío", body: "Liofilización industrial: el agua pasa de hielo a vapor sin pasar por líquido. El resultado conserva 95% de los nutrientes originales." },
  { ord: 4, title: "Empaque hermético + sello inerte", body: "Bolsas con barrera de oxígeno y nitrógeno modificado. Shelf life de 24 meses sin refrigerar, sin conservantes." },
];

export default function LiofilizadosHomePage() {
  return (
    <>
      <SiteHeader line="liofilizados" />

      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 pt-12 sm:pt-16">
        <div className="grid grid-cols-12 gap-x-6">
          <div className="col-span-12 lg:col-span-3 mb-6 lg:mb-0">
            <div className="rv-rise rv-delay-0 font-mono text-[11px] uppercase tracking-[0.22em] text-persimmon leading-relaxed">
              <p>División 03</p>
              <p>Fruta liofilizada</p>
              <p>Origen Colombia</p>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-9">
            <h1 className="rv-rise rv-delay-1 font-display font-light tracking-[-0.035em] leading-[0.9] text-ink text-6xl sm:text-8xl lg:text-[136px]">
              Fruta colombiana,
              <br />
              <span className="italic">frío seco</span>
              <span className="text-persimmon">.</span>
            </h1>
            <p className="rv-rise rv-delay-3 mt-10 font-serif italic text-xl sm:text-2xl leading-snug text-ink/75 max-w-3xl">
              Mango, piña, maracuyá, uchuva. Liofilización industrial que conserva 95% del valor
              nutricional y todo el sabor — sin azúcar añadida, sin conservantes, sin sulfitos.
            </p>

            <div className="rv-rise rv-delay-4 mt-12 flex flex-wrap gap-4">
              <Link
                href="/liofilizados/catalogo"
                className="inline-flex items-center h-14 px-9 bg-persimmon text-cream font-sans text-[14px] tracking-tight rv-press hover:bg-persimmon-deep"
              >
                Ver catálogo →
              </Link>
              <Link
                href="/liofilizados/catalogo?filter=mayorista"
                className="inline-flex items-center h-14 px-9 border border-ink/40 text-ink font-sans text-[14px] tracking-tight hover:border-ink hover:bg-ink hover:text-cream transition-colors"
              >
                Mayorista B2B
              </Link>
            </div>
          </div>
        </div>

        <dl className="rv-fade rv-delay-5 mt-20 grid grid-cols-2 sm:grid-cols-4 border-y border-ink/15 divide-x divide-ink/15">
          {[
            { k: "Origen", v: "Colombia" },
            { k: "Nutrientes", v: "95%" },
            { k: "Shelf life", v: "24m" },
            { k: "Conservantes", v: "0" },
          ].map((s) => (
            <div key={s.k} className="px-6 py-7">
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55 mb-2">
                {s.k}
              </dt>
              <dd className="font-display text-3xl sm:text-5xl tracking-[-0.025em] tabular text-ink">
                {s.v}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-32">
        <div className="grid grid-cols-12 gap-x-6 mb-12">
          <div className="col-span-12 lg:col-span-5">
            <EditorialRule index="01" label="Inventario por origen" />
            <h2 className="mt-6 font-display font-light text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-[-0.025em] text-ink">
              Seis frutas,
              <br />
              <span className="italic">seis</span>
              <br />
              microclimas.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7 lg:pt-2">
            <p className="font-serif italic text-xl leading-snug text-ink/75 max-w-2xl">
              El mango del Tolima es distinto al del Magdalena. La piña del Quindío no sabe
              como la de Santander. Trabajamos con la región que mejor expresa cada fruta —
              no con la más barata.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-ink/15">
          {FRUITS.map((f) => (
            <Link
              key={f.code}
              href={`/liofilizados/catalogo`}
              className="group p-7 border-r border-b border-ink/15 hover:bg-persimmon/[0.05] transition-colors"
            >
              <div className="flex items-baseline justify-between mb-6">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-persimmon">
                  {f.code}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-ink/40">
                  {f.region}
                </span>
              </div>
              <h3 className="font-display text-4xl tracking-tight text-ink leading-none mb-3">
                {f.name}
              </h3>
              <p className="font-serif italic text-[15px] leading-snug text-ink/70 mb-6">
                {f.note}
              </p>
              <div className="flex items-center justify-between font-sans text-[13px] text-ink">
                <span className="rv-link">Ver presentaciones</span>
                <span className="font-display text-2xl group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-32">
        <EditorialRule index="02" label="Proceso · de árbol a paquete" className="mb-12" />
        <div className="grid grid-cols-12 gap-x-6">
          <div className="col-span-12 lg:col-span-4 mb-10 lg:mb-0">
            <h2 className="font-display font-light text-5xl sm:text-6xl leading-[0.95] tracking-[-0.025em] text-ink">
              Cuatro
              <br />
              pasos.
              <br />
              <span className="italic">Ningún</span>
              <br />
              atajo.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-7 lg:col-start-6">
            <div className="border-b border-ink/15">
              {PROCESS.map((d) => (
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
