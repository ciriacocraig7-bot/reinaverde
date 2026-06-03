import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { EditorialRule, NumberedRow } from "@/components/marketing/editorial";

const MOMENTOS = [
  {
    code: "DBR",
    name: "Desayunos y brunchs",
    lead: "Inicios de jornada llenos de vitalidad.",
    desc: "Jugos prensados, granolas artesanales, panadería de masa madre, fruta tropical y café de origen. Perfecto para reuniones de directorio, capacitaciones tempranas o desayunos de bienvenida.",
    image: "/img/momentos/desayunos.jpg",
  },
  {
    code: "RFG",
    name: "Refrigerios y snacks",
    lead: "Barras diseñadas para recargar energía.",
    desc: "Frutos secos, chocolates oscuros, snacks proteicos y vegetales con dips artesanales. Estaciones permanentes durante jornadas largas, conferencias y workshops.",
    image: "/img/momentos/refrigerios.jpg",
  },
  {
    code: "ALM",
    name: "Almuerzos premium",
    lead: "Buffet interactivo o empacados de lujo.",
    desc: "Proteínas marinadas, granos andinos, vegetales rostizados y aderezos de la casa. Para conferencias internas, lanzamientos corporativos y almuerzos ejecutivos recurrentes.",
    image: "/img/momentos/almuerzos.jpg",
  },
  {
    code: "GAL",
    name: "Cenas de gala",
    lead: "Experiencias de alta cocina a la mesa.",
    desc: "Plato por plato, con maridaje y servicio coreografiado. Para juntas anuales, cierres de fiscal, eventos de cliente VIP y celebraciones corporativas premium.",
    image: "/img/momentos/cenas.jpg",
  },
  {
    code: "MEX",
    name: "Mesas de experiencia",
    lead: "Estaciones de dulces y salados artesanales.",
    desc: "Quesos, charcutería, repostería de autor, macarons y postres en miniatura. Para cocteles de apertura, networking corporativo y eventos donde el comensal explora.",
    image: "/img/momentos/mesas-experiencia.jpg",
  },
  {
    code: "COC",
    name: "Coctelería saludable",
    lead: "Mixología innovadora y barras de licores selectos.",
    desc: "Destilados premium, botánicos frescos y reducciones bajas en azúcar. Para after-office, lanzamientos de producto, fiestas de fin de año y celebraciones corporativas.",
    image: "/img/momentos/cocteleria.jpg",
  },
];

const PROCESO = [
  {
    ord: 1,
    title: "Cuéntanos el evento",
    body: "Tipo de evento, fecha tentativa, número estimado de comensales, restricciones alimenticias críticas. Quince minutos en formulario o llamada con tu ejecutiva asignada.",
  },
  {
    ord: 2,
    title: "Recibes propuesta a la medida",
    body: "En 24 horas tienes una propuesta de menú con tres niveles de presupuesto. La estética del evento se diseña en paralelo si el evento lo requiere.",
  },
  {
    ord: 3,
    title: "Confirmas y pagas anticipo",
    body: "50% para reservar fecha, 50% el día del evento. Pago seguro vía Bold con factura electrónica DIAN incluida.",
  },
  {
    ord: 4,
    title: "Ejecutamos en tu sede",
    body: "Llegada coordinada con tu equipo, montaje impecable, servicio durante el evento y desmontaje silencioso. Recibes feedback formal en 48h para iterar futuros eventos.",
  },
];

export default function CateringEventosPage() {
  return (
    <>
      <SiteHeader line="catering" />

      {/* ════════════════ HERO ════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 pt-12 sm:pt-16">
        <div className="grid grid-cols-12 gap-x-6">
          <div className="col-span-12 lg:col-span-3 mb-6 lg:mb-0">
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-marigold leading-relaxed">
              <p>Tipos de evento</p>
              <p>Seis momentos · catering corporativo</p>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-9">
            <h1 className="font-display font-light tracking-[-0.035em] leading-[0.92] text-ink text-5xl sm:text-7xl lg:text-[120px]">
              Un menú
              <br />
              para cada
              <br />
              <span className="italic">momento</span>
              <span className="text-marigold">.</span>
            </h1>
            <p className="mt-10 font-serif italic text-xl sm:text-2xl leading-snug text-ink/75 max-w-3xl">
              Seis tipologías diseñadas para acompañar la jornada corporativa
              completa — del desayuno de bienvenida a la coctelería de cierre.
              Cada momento opera bajo los mismos tres pilares: orgánico, gourmet,
              sostenible.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════ SEIS MOMENTOS ════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-24">
        <EditorialRule index="01" label="Los seis momentos" className="mb-12" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOMENTOS.map((m) => (
            <article
              key={m.code}
              className="border border-ink/15 bg-cream overflow-hidden"
            >
              <div className="relative w-full aspect-[4/3] border-b border-ink/10">
                <Image
                  src={m.image}
                  alt={m.name}
                  fill
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-marigold">
                  § {m.code}
                </span>
                <h3 className="mt-3 font-display text-2xl tracking-tight text-ink leading-tight">
                  {m.name}
                </h3>
                <p className="mt-3 font-serif italic text-[15px] leading-snug text-ink/70">
                  {m.lead}
                </p>
                <p className="mt-4 text-[14px] leading-relaxed text-ink/75">
                  {m.desc}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ════════════════ PROCESO ════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-32">
        <EditorialRule index="02" label="Cómo trabajamos" className="mb-12" />
        <div className="grid grid-cols-12 gap-x-6">
          <div className="col-span-12 lg:col-span-4 mb-10 lg:mb-0">
            <h2 className="font-display font-light text-5xl sm:text-6xl leading-[0.95] tracking-[-0.025em] text-ink">
              De la idea
              <br />
              al postre.
              <br />
              <span className="italic">Cuatro</span> etapas.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-7 lg:col-start-6">
            <div className="border-b border-ink/15">
              {PROCESO.map((d) => (
                <NumberedRow key={d.ord} ordinal={d.ord} title={d.title}>
                  {d.body}
                </NumberedRow>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ CTA ════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-32">
        <div className="bg-ink text-cream p-10 sm:p-16 relative overflow-hidden">
          <div className="absolute top-4 right-6 font-mono text-[10.5px] uppercase tracking-[0.22em] text-cream/50">
            § Reservar fecha
          </div>
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-end">
            <h2 className="font-display font-light text-5xl sm:text-7xl tracking-[-0.03em] leading-[0.92]">
              ¿Tiene una
              <br />
              fecha en
              <br />
              <span className="italic">mente</span>?
            </h2>
            <div className="flex flex-col gap-5">
              <p className="font-serif italic text-lg text-cream/85 leading-snug">
                Cotice ahora con su menú estimado y reserve antes de que se
                agote la fecha. Las fechas próximas tienden a llenarse con seis
                semanas de anticipación.
              </p>
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-cream/85 space-y-1">
                <p>(+57) 314 790 5135</p>
                <p>reinaverdecatering@gmail.com</p>
                <p>@reinaverdecatering</p>
              </div>
              <Link
                href="/catering/cotizar"
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
