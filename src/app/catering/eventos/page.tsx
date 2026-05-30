import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { EditorialRule, NumberedRow } from "@/components/marketing/editorial";

const EVENT_TYPES = [
  { code: "CRP", title: "Corporativo",      lead: "Almuerzos ejecutivos, coffee breaks, ferias internas y reuniones de directorio.", desc: "Menús diseñados para el ritmo del día laboral. Factura electrónica, servicio recurrente, dashboard para tu equipo de compras." },
  { code: "BDA", title: "Bodas",            lead: "Banquetes para 80–300 invitados, ceremonia y recepción.",                          desc: "Coordinamos cocina, servicio en sala, montaje y desmontaje. Trabajamos con tu wedding planner o asumimos la coordinación gastronómica completa." },
  { code: "SCL", title: "Social",           lead: "Cumpleaños, baby showers, reuniones íntimas, despedidas.",                          desc: "Tamaños humanos. Servicio discreto, menús flexibles, opciones para niños. Postre personalizado opcional." },
  { code: "SUB", title: "Suscripción B2B",  lead: "Almuerzos corporativos recurrentes, entrega programada.",                          desc: "Menú rotativo semanal, precio acordado por porción, factura mensual consolidada. Ideal para oficinas de 20 a 200 colaboradores." },
];

const PROCESS = [
  { ord: 1, title: "Cuéntanos el evento", body: "Tipo, fecha tentativa, número estimado de comensales, restricciones alimenticias críticas. Quince minutos en formulario." },
  { ord: 2, title: "Te enviamos propuesta",  body: "En 24 horas tienes una propuesta de menú con tres alternativas por nivel de presupuesto. Sin compromiso." },
  { ord: 3, title: "Confirmas y pagas anticipo", body: "50% para reservar fecha, 50% el día del evento. Bold gestiona ambas transacciones con factura electrónica." },
  { ord: 4, title: "Ejecutamos", body: "Cocina, logística, servicio en sitio y desmontaje. Recibes feedback formal en 48h para iterar futuros eventos." },
];

export default function CateringEventosPage() {
  return (
    <>
      <SiteHeader line="catering" />

      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 pt-12 sm:pt-16">
        <div className="grid grid-cols-12 gap-x-6">
          <div className="col-span-12 lg:col-span-3 mb-6 lg:mb-0">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-marigold leading-relaxed">
              <p>Tipologías</p>
              <p>Corp / Boda / Social / B2B</p>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-9">
            <h1 className="font-display font-light tracking-[-0.035em] leading-[0.92] text-ink text-6xl sm:text-8xl lg:text-[128px]">
              Eventos,
              <br />
              <span className="italic">cuatro maneras</span>
              <span className="text-marigold">.</span>
            </h1>
            <p className="mt-10 font-serif italic text-xl sm:text-2xl leading-snug text-ink/75 max-w-3xl">
              Cada tipología tiene su propia ficha de producción, su propio ritmo y su propia
              métrica. La cocina sabe distinguir un almuerzo ejecutivo de un banquete de bodas.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-24">
        <EditorialRule index="01" label="Tipologías" className="mb-10" />
        <div className="grid sm:grid-cols-2 border-t border-l border-ink/15">
          {EVENT_TYPES.map((e) => (
            <article key={e.code} className="p-8 border-r border-b border-ink/15">
              <div className="flex items-baseline justify-between mb-6">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-marigold">
                  {e.code}
                </span>
              </div>
              <h2 className="font-display text-5xl tracking-[-0.02em] leading-none text-ink mb-4">
                {e.title}
              </h2>
              <p className="font-serif italic text-lg leading-snug text-ink/70 mb-4">{e.lead}</p>
              <p className="text-[15px] leading-relaxed text-ink/75">{e.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-32">
        <EditorialRule index="02" label="Proceso" className="mb-12" />
        <div className="grid grid-cols-12 gap-x-6">
          <div className="col-span-12 lg:col-span-4 mb-10 lg:mb-0">
            <h2 className="font-display font-light text-5xl sm:text-6xl leading-[0.95] tracking-[-0.025em] text-ink">
              De la idea
              <br />
              al postre.
              <br />
              <span className="italic">Cuatro</span>
              <br />
              etapas.
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

      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-32">
        <div className="bg-ink text-cream p-10 sm:p-16 relative overflow-hidden">
          <div className="absolute top-4 right-6 font-mono text-[10.5px] uppercase tracking-[0.22em] text-cream/50">
            § Cotizar evento
          </div>
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-end">
            <h2 className="font-display font-light text-5xl sm:text-7xl tracking-[-0.03em] leading-[0.92]">
              ¿Tiene
              <br />
              fecha y
              <br />
              <span className="italic">aforo</span>?
            </h2>
            <div className="flex flex-col gap-5">
              <p className="font-serif italic text-lg text-cream/80 leading-snug">
                Cotice ahora con los detalles que tenga. Le enviamos propuesta en 24 horas.
              </p>
              <Link
                href="/catering/menu"
                className="inline-flex items-center h-12 px-7 bg-marigold text-ink font-sans text-[14px] tracking-tight rv-press hover:bg-cream w-fit"
              >
                Empezar cotización →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
