import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { EditorialRule } from "@/components/marketing/editorial";

/* ════════════════════════════════════════════════════════════════
   Reina Verde Catering — narrativa alineada al pitch deck oficial.
   Posicionamiento: alta gastronomía orgánica saludable para eventos
   corporativos. Más que comida — experiencias de marca.
   ════════════════════════════════════════════════════════════════ */

const DESAFIOS = [
  {
    code: "DSF",
    title: "Monotonía gastronómica",
    body:
      "Opciones tradicionales predecibles que no sorprenden, no inspiran y no logran motivar a los invitados ni colaboradores durante el evento.",
  },
  {
    code: "NTR",
    title: "Bajo valor nutricional",
    body:
      "Predominio de comida ultra-procesada que genera pesadez, falta de energía y reduce drásticamente la productividad de los equipos.",
  },
  {
    code: "PRS",
    title: "Presentación deficiente",
    body:
      "Empaques y montajes descuidados o de baja calidad que fallan en reflejar el verdadero nivel y el prestigio de la empresa anfitriona.",
  },
];

const PILARES = [
  {
    code: "ORG",
    title: "Ingredientes orgánicos",
    body: "Salud y sabor en perfecta armonía para nutrir a tu equipo, sin sacrificar el placer del plato.",
  },
  {
    code: "GMT",
    title: "Percepción gourmet",
    body: "Cuidamos cada detalle visual para despertar el hambre visual de inmediato y elevar el estatus del evento.",
  },
  {
    code: "ECO",
    title: "Materiales sostenibles",
    body: "Empaques y montajes ecofriendly que suman a la responsabilidad social de tu empresa, sin perder elegancia.",
  },
];

const MOMENTOS = [
  {
    code: "DBR",
    name: "Desayunos y brunchs",
    description:
      "Inicios de jornada llenos de vitalidad: jugos prensados, granolas artesanales, panadería de masa madre, fruta tropical y café de origen.",
    image: "/img/momentos/desayunos.jpg",
  },
  {
    code: "RFG",
    name: "Refrigerios y snacks",
    description:
      "Barras diseñadas para recargar energía entre sesiones: frutos secos, chocolates oscuros, snacks proteicos y vegetales con dips artesanales.",
    image: "/img/momentos/refrigerios.jpg",
  },
  {
    code: "ALM",
    name: "Almuerzos premium",
    description:
      "Estilo buffet interactivo o empacados de lujo. Proteínas marinadas, granos andinos, vegetales rostizados y aderezos de la casa.",
    image: "/img/momentos/almuerzos.jpg",
  },
  {
    code: "GAL",
    name: "Cenas de gala",
    description:
      "Experiencias de alta cocina a la mesa, plato por plato, con maridaje y servicio coreografiado para reuniones de cierre.",
    image: "/img/momentos/cenas.jpg",
  },
  {
    code: "MEX",
    name: "Mesas de experiencia",
    description:
      "Estaciones de dulces y salados artesanales: quesos, charcutería, repostería de autor, macarons y postres en miniatura.",
    image: "/img/momentos/mesas-experiencia.jpg",
  },
  {
    code: "COC",
    name: "Coctelería saludable",
    description:
      "Mixología innovadora con destilados premium, botánicos frescos y reducciones bajas en azúcar. Barras de licores selectos opcionales.",
    image: "/img/momentos/cocteleria.jpg",
  },
];

const CIUDADES = [
  "Medellín",
  "Bogotá",
  "Cali",
  "Barranquilla",
  "Cartagena",
  "Armenia",
];

const RAZONES = [
  {
    code: "01",
    title: "Confianza corporativa",
    body:
      "Cumplimiento estricto, puntualidad absoluta y capacidad operativa comprobada para manejar grandes volúmenes sin perder la calidad.",
  },
  {
    code: "02",
    title: "Personalización total",
    body:
      "Adaptamos los menús a las necesidades específicas, temáticas del evento y restricciones dietéticas de tus invitados especiales.",
  },
  {
    code: "03",
    title: "Estatus de marca",
    body:
      "Nuestro servicio premium trasciende la comida para convertirse en una extensión directa del prestigio de tu organización.",
  },
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
              <p>Reina Verde · Catering</p>
              <p>Alta gastronomía corporativa</p>
              <p>Orgánica · Saludable</p>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-9">
            <h1 className="rv-rise rv-delay-1 font-display font-light tracking-[-0.035em] leading-[0.92] text-ink text-5xl sm:text-7xl lg:text-[120px]">
              Elevamos el
              <br />
              estándar de
              <br />
              tus <span className="italic">eventos</span>
              <span className="text-marigold">.</span>
            </h1>
            <p className="rv-rise rv-delay-3 mt-10 font-serif italic text-xl sm:text-2xl leading-snug text-ink/75 max-w-3xl">
              Más que comida — diseñamos experiencias de marca. Transformamos
              ingredientes orgánicos y saludables en propuestas gourmet con
              estética impecable y artesanal, diseñadas para proyectar el mejor
              estatus de tu empresa en cada bocado.
            </p>

            <div className="rv-rise rv-delay-4 mt-12 flex flex-wrap gap-4">
              <Link
                href="/catering/menu"
                className="inline-flex items-center h-14 px-9 bg-marigold text-ink font-sans text-[14px] tracking-tight rv-press hover:bg-marigold-deep hover:text-cream"
              >
                Ver los seis momentos →
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

        {/* Hero image alineada al pitch */}
        <div className="rv-fade rv-delay-4 mt-16 relative w-full aspect-[16/8] overflow-hidden border-y border-ink/15">
          <Image
            src="/img/hero/hub-pitch.jpg"
            alt="Mesa corporativa de Reina Verde — alta gastronomía orgánica para eventos"
            fill
            sizes="(max-width: 1400px) 100vw, 1400px"
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* ════════════════ QUIÉNES SOMOS ════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-32">
        <EditorialRule index="01" label="Quiénes somos" className="mb-12" />
        <div className="grid grid-cols-12 gap-x-6">
          <div className="col-span-12 lg:col-span-5">
            <h2 className="font-display font-light text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-[-0.025em] text-ink">
              Más que
              <br />
              comida,
              <br />
              <span className="italic">creamos</span>
              <br />
              experiencias
              <br />
              de <span className="text-marigold">marca</span>.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-7 lg:pt-2">
            <p className="font-serif italic text-xl leading-snug text-ink/75 max-w-2xl">
              Somos una empresa especializada en el diseño y ejecución de catering
              para todo tipo de eventos, con un enfoque experto en el sector
              corporativo.
            </p>
            <p className="mt-6 text-[15px] leading-relaxed text-ink/80 max-w-2xl">
              Transformamos ingredientes orgánicos y saludables en propuestas
              gourmet con una estética impecable y artesanal, diseñadas para
              proyectar el mejor estatus de tu empresa en cada bocado.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════ DESAFÍO CORPORATIVO ════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-32">
        <div className="grid grid-cols-12 gap-x-6 mb-16">
          <div className="col-span-12 lg:col-span-5">
            <EditorialRule index="02" label="El problema" />
            <h2 className="mt-6 font-display font-light text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-[-0.025em] text-ink">
              El desafío
              <br />
              <span className="italic">corporativo</span>.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7 lg:pt-2">
            <p className="font-serif italic text-xl leading-snug text-ink/75 max-w-2xl">
              Las áreas de talento humano, marketing y eventos llevan años
              cargando con tres frustraciones que se repiten reunión tras
              reunión. Las reconocemos — y las resolvemos.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-ink/15">
          {DESAFIOS.map((d) => (
            <article
              key={d.code}
              className="p-7 sm:p-8 border-r border-b border-ink/15 bg-cream"
            >
              <div className="flex items-baseline justify-between mb-5">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-marigold">
                  {d.code}
                </span>
                <span className="font-display text-3xl text-ink/30">✕</span>
              </div>
              <h3 className="font-display text-3xl tracking-[-0.02em] leading-tight text-ink mb-4">
                {d.title}
              </h3>
              <p className="text-[15px] leading-relaxed text-ink/70">{d.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ════════════════ LA SOLUCIÓN ════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-32">
        <div className="grid grid-cols-12 gap-x-6 mb-16">
          <div className="col-span-12 lg:col-span-5">
            <EditorialRule index="03" label="Cómo lo resolvemos" />
            <h2 className="mt-6 font-display font-light text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-[-0.025em] text-ink">
              La
              <br />
              <span className="italic">solución</span>.
            </h2>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-marigold">
              Alta cocina saludable para negocios
            </p>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7 lg:pt-2">
            <p className="font-serif italic text-xl leading-snug text-ink/75 max-w-2xl">
              Tres pilares no negociables que sostienen cada servicio. Los
              encuentras en cada pieza del menú — desde el café de bienvenida
              hasta el último postre.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-ink/15">
          {PILARES.map((p) => (
            <article
              key={p.code}
              className="p-7 sm:p-8 border-r border-b border-ink/15 bg-marigold/5"
            >
              <div className="flex items-baseline justify-between mb-5">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-marigold-deep">
                  {p.code}
                </span>
                <span
                  className="h-2 w-2 rounded-full bg-marigold ring-4 ring-marigold/30"
                  aria-hidden
                />
              </div>
              <h3 className="font-display text-3xl tracking-[-0.02em] leading-tight text-ink mb-4">
                {p.title}
              </h3>
              <p className="text-[15px] leading-relaxed text-ink/75">{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ════════════════ SEIS MOMENTOS ════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-32">
        <div className="grid grid-cols-12 gap-x-6 mb-12">
          <div className="col-span-12 lg:col-span-5">
            <EditorialRule index="04" label="El menú" />
            <h2 className="mt-6 font-display font-light text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-[-0.025em] text-ink">
              Un menú
              <br />
              para cada
              <br />
              <span className="italic">momento</span>.
            </h2>
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7 lg:pt-2">
            <p className="font-serif italic text-xl leading-snug text-ink/75 max-w-2xl">
              Seis tipologías diseñadas para acompañar la jornada corporativa
              completa — del desayuno de bienvenida a la coctelería de cierre.
              Cada momento opera bajo los mismos tres pilares.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOMENTOS.map((m) => (
            <Link
              key={m.code}
              href="/catering/menu"
              className="group block border border-ink/15 bg-cream hover:shadow-paper-lg hover:-translate-y-1 transition-[transform,box-shadow] duration-300"
            >
              <div className="relative w-full aspect-[4/3] overflow-hidden border-b border-ink/10">
                <Image
                  src={m.image}
                  alt={m.name}
                  fill
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <div className="flex items-baseline justify-between mb-3">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-marigold">
                    § {m.code}
                  </span>
                  <span className="font-display text-2xl text-ink group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
                <h3 className="font-display text-2xl tracking-tight text-ink mb-3 leading-tight">
                  {m.name}
                </h3>
                <p className="text-[14px] leading-relaxed text-ink/70">
                  {m.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ════════════════ COBERTURA NACIONAL ════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-32">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <EditorialRule index="05" label="Cobertura" className="mb-8" />
            <h2 className="font-display font-light text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-[-0.025em] text-ink">
              Operamos
              <br />
              en seis
              <br />
              <span className="italic">ciudades</span>.
            </h2>
            <p className="mt-8 font-serif italic text-lg leading-snug text-ink/75 max-w-md">
              Capacidad logística experta y estandarización de calidad impecable
              para operar de manera escalable y eficiente donde tu empresa
              nos necesite.
            </p>

            <ul className="mt-10 grid grid-cols-2 gap-y-4">
              {CIUDADES.map((c, i) => (
                <li key={c} className="flex items-baseline gap-3">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-marigold tabular">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-2xl text-ink tracking-tight">
                    {c}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative w-full aspect-[16/10] border border-ink/15 overflow-hidden">
            <Image
              src="/img/cobertura/colombia.jpg"
              alt="Cobertura nacional de Reina Verde Catering en seis ciudades de Colombia"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ════════════════ POR QUÉ REINA VERDE ════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-32">
        <EditorialRule index="06" label="Por qué elegirnos" className="mb-12" />
        <h2 className="font-display font-light text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-[-0.025em] text-ink mb-16 max-w-3xl">
          ¿Por qué <span className="italic">Reina Verde</span>?
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-ink/15">
          {RAZONES.map((r) => (
            <article
              key={r.code}
              className="p-7 sm:p-8 border-r border-b border-ink/15 bg-cream"
            >
              <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-marigold">
                § {r.code}
              </span>
              <h3 className="mt-6 font-display text-3xl tracking-[-0.02em] leading-tight text-ink mb-4">
                {r.title}
              </h3>
              <p className="text-[15px] leading-relaxed text-ink/75">{r.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ════════════════ CTA ════════════════ */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-32">
        <div className="bg-ink text-cream p-10 sm:p-16 lg:p-20 relative overflow-hidden">
          <div className="absolute top-4 right-6 font-mono text-[10.5px] uppercase tracking-[0.22em] text-cream/50">
            § Contacto directo
          </div>
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-end">
            <h2 className="font-display font-light text-5xl sm:text-7xl lg:text-[88px] tracking-[-0.035em] leading-[0.92]">
              Experiencia
              <br />
              <span className="italic">inolvidable</span>
              <span className="text-marigold">.</span>
            </h2>
            <div className="flex flex-col gap-5">
              <p className="font-serif italic text-xl leading-snug text-cream/85">
                Contáctanos hoy para diseñar una propuesta a la medida de
                tu empresa.
              </p>

              <ul className="border-t border-cream/15 pt-5 space-y-3 font-mono text-[12px] uppercase tracking-[0.18em] text-cream/85">
                <li className="flex items-baseline gap-3">
                  <span className="text-marigold">◆</span>
                  <a href="tel:+573147905135" className="rv-link">
                    (+57) 314 790 5135
                  </a>
                </li>
                <li className="flex items-baseline gap-3">
                  <span className="text-marigold">◆</span>
                  <a href="mailto:reinaverdecatering@gmail.com" className="rv-link">
                    reinaverdecatering@gmail.com
                  </a>
                </li>
                <li className="flex items-baseline gap-3">
                  <span className="text-marigold">◆</span>
                  <a
                    href="https://instagram.com/reinaverdecatering"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rv-link"
                  >
                    @reinaverdecatering
                  </a>
                </li>
              </ul>

              <div className="flex flex-wrap gap-3 mt-2">
                <Link
                  href="/catering/orden"
                  className="inline-flex items-center h-12 px-7 bg-marigold text-ink font-sans text-[14px] tracking-tight rv-press hover:bg-cream"
                >
                  Cotizar evento →
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
