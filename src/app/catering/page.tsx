import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { EditorialRule, NumberedRow } from "@/components/marketing/editorial";

const EVENT_TYPES = [
  {
    code: "CRP",
    name: "Corporativo",
    description: "Almuerzos, juntas directivas, inauguraciones. Facturación electrónica con NIT.",
    from: 28000,
  },
  {
    code: "BDA",
    name: "Bodas",
    description: "Cocteles, banquetes y mesas dulces para 80-300 invitados, montaje incluido.",
    from: 165000,
  },
  {
    code: "SCL",
    name: "Social",
    description: "Cumpleaños, baby showers, reuniones íntimas. Menú flexible, servicio discreto.",
    from: 42000,
  },
  {
    code: "SUB",
    name: "Suscripción",
    description: "Almuerzos corporativos recurrentes. Menú semanal, precio acordado por porción.",
    from: 22000,
  },
] as const;

const DELIVERABLES = [
  { ord: 1, title: "Cotización en menos de tres minutos", body: "Selecciona menú, ingresa comensales y fecha. La plataforma calcula sub-totales, impuestos y logística sin esperar correos." },
  { ord: 2, title: "Producción visible en cada paso", body: "Una vez confirmas pago, tu pedido entra a la cola de cocina con timestamps. Puedes ver el estado real: preparación, listo, en ruta, entregado." },
  { ord: 3, title: "Pago seguro con Bold", body: "Tarjetas, PSE, Nequi y Daviplata. La firma de integridad protege la transacción y un webhook confirma el pago automáticamente." },
  { ord: 4, title: "Facturación que cierra el ciclo", body: "Factura electrónica DIAN emitida al confirmar el evento. Sin doble digitación contable, sin esperar el final del mes." },
];

export default function CateringHomePage() {
  return (
    <>
      <SiteHeader line="catering" />

      {/* ════════════════ HERO ════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 pt-12 sm:pt-16">
        <div className="grid grid-cols-12 gap-x-6">
          <div className="col-span-12 lg:col-span-3 mb-6 lg:mb-0">
            <div className="rv-rise rv-delay-0 font-mono text-[11px] uppercase tracking-[0.22em] text-marigold leading-relaxed">
              <p>División 01</p>
              <p>Catering corporativo</p>
              <p>Bogotá / Sabana</p>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-9">
            <h1 className="rv-rise rv-delay-1 font-display font-light tracking-[-0.035em] leading-[0.92] text-ink text-6xl sm:text-8xl lg:text-[136px]">
              <span className="italic">Catering</span> sin
              <br />
              fricción
              <span className="text-marigold">.</span>
            </h1>
            <p className="rv-rise rv-delay-3 mt-10 font-serif italic text-xl sm:text-2xl leading-snug text-ink/75 max-w-3xl">
              Una operación que entiende que el evento corporativo perfecto no se nota.
              Lo que se nota es cuando algo falta — y aquí no falta nada.
            </p>

            <div className="rv-rise rv-delay-4 mt-12 flex flex-wrap gap-4">
              <Link
                href="/catering/menu"
                className="inline-flex items-center h-14 px-9 bg-marigold text-ink font-sans text-[14px] tracking-tight rv-press hover:bg-marigold-deep hover:text-cream"
              >
                Explorar el menú →
              </Link>
              <Link
                href="/catering/orden"
                className="inline-flex items-center h-14 px-9 border border-ink/40 text-ink font-sans text-[14px] tracking-tight hover:border-ink hover:bg-ink hover:text-cream transition-colors"
              >
                Cotizar evento
              </Link>
            </div>
          </div>
        </div>

        {/* KPI band */}
        <dl className="rv-fade rv-delay-5 mt-20 grid grid-cols-2 sm:grid-cols-4 border-y border-ink/15 divide-x divide-ink/15">
          {[
            { k: "Eventos servidos", v: "500+" },
            { k: "Comensales", v: "32k" },
            { k: "Satisfacción", v: "98%" },
            { k: "Cotización", v: "< 3m" },
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

      {/* ════════════════ EVENT TYPES ════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-32">
        <div className="grid grid-cols-12 gap-x-6 mb-16">
          <div className="col-span-12 lg:col-span-4">
            <EditorialRule index="01" label="Tipologías de evento" />
            <h2 className="mt-6 font-display font-light text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-[-0.025em] text-ink">
              Cuatro
              <br />
              <span className="italic">naturalezas</span>
              <br />
              distintas.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-7 lg:col-start-6 lg:pt-2">
            <p className="font-serif italic text-xl leading-snug text-ink/75 max-w-2xl">
              No tratamos un almuerzo de directorio igual que una boda de doscientos.
              Cada tipología tiene su propia ficha de producción, su propio flujo logístico,
              y su propia métrica de satisfacción.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-ink/15">
          {EVENT_TYPES.map((e, i) => (
            <article
              key={e.code}
              className={`p-7 border-ink/15 ${i > 0 ? "border-t sm:border-t-0 sm:border-l" : ""} ${i > 1 ? "lg:border-t-0" : ""} ${i === 2 ? "sm:border-t lg:border-t-0 lg:border-l" : ""}`}
            >
              <div className="flex items-baseline justify-between mb-6">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-marigold">
                  {e.code}
                </span>
                <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink/40">
                  desde
                </span>
              </div>
              <h3 className="font-display text-4xl tracking-tight text-ink mb-3 leading-none">
                {e.name}
              </h3>
              <p className="text-[14px] leading-relaxed text-ink/70 mb-7 min-h-[88px]">
                {e.description}
              </p>
              <div className="flex items-baseline justify-between pt-5 border-t border-ink/10">
                <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink/50">
                  /persona
                </span>
                <span className="font-display text-2xl tabular text-ink">
                  ${new Intl.NumberFormat("es-CO").format(e.from)}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ════════════════ DELIVERABLES ════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-32">
        <EditorialRule index="02" label="Cómo opera la casa" className="mb-12" />

        <div className="grid grid-cols-12 gap-x-6">
          <div className="col-span-12 lg:col-span-4 mb-10 lg:mb-0">
            <h2 className="font-display font-light text-5xl sm:text-6xl leading-[0.95] tracking-[-0.025em] text-ink">
              De la
              <br />
              cotización a
              <br />
              la <span className="italic">factura</span>.
            </h2>
            <p className="mt-8 font-serif italic text-lg text-ink/70 leading-snug max-w-md">
              Cuatro pasos, todos automatizados, todos visibles para el cliente.
            </p>
          </div>

          <div className="col-span-12 lg:col-span-7 lg:col-start-6">
            <div className="border-b border-ink/15">
              {DELIVERABLES.map((d) => (
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
        <div className="bg-marigold p-10 sm:p-16 relative overflow-hidden">
          <div className="absolute top-4 right-6 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/60">
            § Reservar fecha
          </div>
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-end">
            <h2 className="font-display font-light text-5xl sm:text-7xl tracking-[-0.03em] leading-[0.92] text-ink">
              ¿Tiene una
              <br />
              fecha en
              <br />
              <span className="italic">mente</span>?
            </h2>
            <div className="flex flex-col gap-5">
              <p className="font-serif italic text-lg text-ink/80 leading-snug">
                Cotice ahora con su menú estimado y reserve antes de que se agote la fecha.
                Las fechas próximas tienden a llenarse con seis semanas de anticipación.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/catering/menu"
                  className="inline-flex items-center h-12 px-7 bg-ink text-cream font-sans text-[14px] tracking-tight rv-press hover:bg-ink-soft"
                >
                  Empezar cotización
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
