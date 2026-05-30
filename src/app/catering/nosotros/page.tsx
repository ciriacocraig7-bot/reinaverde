import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { EditorialRule, NumberedRow } from "@/components/marketing/editorial";

const VALUES = [
  { ord: 1, title: "Origen local antes que importación", body: "Las frutas, los granos y los herbales que entran a la cocina son colombianos. Importamos lo que la cocina realmente exige — y eso, también, en mínimas cantidades." },
  { ord: 2, title: "Trazabilidad sin ruido", body: "Cada lote tiene su código. No para presumirlo en el menú, sino para que la cocina sepa qué retirar si algo falla. Disciplina invisible para el cliente." },
  { ord: 3, title: "Tecnología como herramienta, no como espectáculo", body: "Bold para pagos, Prisma para datos, dashboards para producción. La tecnología sirve a la cocina — no la cocina a la tecnología." },
  { ord: 4, title: "Servicio que se nota por su ausencia", body: "El servicio impecable es aquel en el que el comensal no se acuerda del mesero. Trabajamos para que el evento sea memorable por las personas, no por el catering." },
];

export default function CateringNosotrosPage() {
  return (
    <>
      <SiteHeader line="catering" />

      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 pt-12 sm:pt-16">
        <div className="grid grid-cols-12 gap-x-6">
          <div className="col-span-12 lg:col-span-3 mb-6 lg:mb-0">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-marigold leading-relaxed">
              <p>Casa</p>
              <p>Bogotá, Sabana</p>
              <p>Fundada MMXXIV</p>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-9">
            <h1 className="font-display font-light tracking-[-0.035em] leading-[0.92] text-ink text-6xl sm:text-8xl lg:text-[128px]">
              La casa
              <br />
              <span className="italic">por dentro</span>
              <span className="text-marigold">.</span>
            </h1>
          </div>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-24">
        <EditorialRule index="01" label="Carta del fundador" className="mb-12" />
        <div className="grid grid-cols-12 gap-x-6 gap-y-10">
          <div className="col-span-12 lg:col-span-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/60">
              Bogotá, MMXXIV
            </p>
          </div>
          <div className="col-span-12 lg:col-span-7">
            <p className="rv-dropcap font-serif text-xl leading-relaxed text-ink/85 [&_p]:mt-6">
              Reina Verde nació de una frustración: en Colombia hay cocina maravillosa y operaciones
              lamentables. Restaurantes que matarían por su comida pero que pierden eventos por su
              logística. Cateterers que cocinan precioso pero facturan mal. Marcas naturistas que
              prometen pureza pero no tienen análisis. La casa que armamos es un intento de hacer
              lo contrario.
            </p>
            <p className="font-serif text-lg leading-relaxed text-ink/75 mt-6">
              Tres divisiones — catering, pharma, liofilizados — operan bajo el mismo techo porque
              comparten un mismo enemigo: la cadena rota que separa el origen del cliente final.
              Si lo cocinamos, lo cocinamos. Si lo formulamos, lo formulamos. Si lo certificamos,
              lo certificamos. Sin tercerizar lo que define la marca.
            </p>
            <p className="font-display italic text-2xl leading-snug text-ink mt-10">
              — María Camila, fundadora
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-32">
        <EditorialRule index="02" label="Disciplinas de la casa" className="mb-12" />
        <div className="grid grid-cols-12 gap-x-6">
          <div className="col-span-12 lg:col-span-4 mb-10 lg:mb-0">
            <h2 className="font-display font-light text-5xl sm:text-6xl leading-[0.95] tracking-[-0.025em] text-ink">
              Cuatro
              <br />
              <span className="italic">disciplinas</span>
              <br />
              que cuidamos.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-7 lg:col-start-6">
            <div className="border-b border-ink/15">
              {VALUES.map((d) => (
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
