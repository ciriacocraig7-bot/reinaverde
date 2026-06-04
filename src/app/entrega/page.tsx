/**
 * /entrega — Informe de entrega + factura + contrato
 *
 * Página interna (no indexada) con la documentación formal del proyecto.
 * Estilo editorial consistente con el resto de la plataforma.
 */
import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";

const TRM_APPROX = 4200; // TRM aproximada jun 2026
const TOTAL_USD = 5000;
const TOTAL_COP = TOTAL_USD * TRM_APPROX;
const CUOTA_COP = 2_000_000;
const NUM_CUOTAS = Math.ceil(TOTAL_COP / CUOTA_COP);

const COP = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);

const USD = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(n);

// ═══════════════════════════════════════════════════════════════
// ENTREGABLES — inventario real de lo construido
// ═══════════════════════════════════════════════════════════════
const ENTREGABLES = [
  {
    code: "01",
    title: "Plataforma web Next.js 16 + React 19",
    items: [
      "Hub de 3 líneas de negocio (Catering · Pharma · Liofilizados)",
      "Diseño editorial premium con sistema de tipografía Fraunces + Geist",
      "PWA con iconos y manifest",
      "50+ páginas renderizadas (SSR + estáticas)",
      "Responsive mobile-first en todo el sitio",
    ],
  },
  {
    code: "02",
    title: "Motor de pricing colombiano",
    items: [
      "CMP (materia prima con merma) + CMO (factor prestacional 1.6×) + CIF + empaque + transporte",
      "Régimen tributario configurable (Común vs RST vs sin IVA)",
      "ICA municipal por ciudad (6 ciudades), retenciones estimadas (ReteFuente/ReteIVA/ReteICA)",
      "Descuentos por volumen (100/200/500 pax) + ajustes estacionales",
      "25 aserciones de calculator pasando contra 4 escenarios reales",
    ],
  },
  {
    code: "03",
    title: "Cotizador editorial interactivo",
    items: [
      "Wizard 5 capítulos (El evento → La mesa → Los acentos → La cuenta → El cierre)",
      "Slider gigante de comensales con dots visualizer + tier badges",
      "City cards con personalidad por ciudad + moment chips editoriales",
      "Date picker con badge de temporada en vivo",
      "Narrativa editorial en sidebar que se reescribe con cross-fade",
      "Total dramático con counter animado (typography display 56-140px)",
      "Choreography entre capítulos (fade + slide + stagger)",
    ],
  },
  {
    code: "04",
    title: "Integración Bold (pasarela de pagos)",
    items: [
      "Checkout embebido con firma SHA-256 server-side",
      "Guest checkout sin registro (user con passwordHash vacío, se activa post-pago)",
      "Webhook HMAC idempotente (no re-procesa PAID duplicados)",
      "Soporte tarjeta, PSE, Nequi, Daviplata",
      "Email de activación post-pago con link para set password",
    ],
  },
  {
    code: "05",
    title: "CMS de productos admin",
    items: [
      "CRUD completo de productos Pharma + Liofilizados",
      "Galería de imágenes con multi-upload Vercel Blob + drag-reorder",
      "Bulk actions (pausar, activar, destacar, tag/untag, mover categoría)",
      "Import CSV con dry-run + validación por fila + commit",
      "Gestión de categorías por línea de negocio",
      "Panel de precios Jumbo Colombia (referencia de margen real)",
    ],
  },
  {
    code: "06",
    title: "Backoffice chef",
    items: [
      "Editor de recetas con panel live de CMP + CMO + CIF + empaque",
      "CRUD de ingredientes con yield, categoría, costo COP",
      "Shopping list interno agrupado por categoría + comparativa Jumbo",
      "Listado de compras por fecha / rango / pedidos específicos",
    ],
  },
  {
    code: "07",
    title: "Sistema de órdenes y cotizaciones",
    items: [
      "Quote persistente con snapshot de pricing (auditable)",
      "Conversión Quote → Order → Payment en transacción",
      "PDF de cotización con desglose tributario completo",
      "Lista de compras del cliente (PDF + impresión directa)",
      "Timeline visual de estado del pedido (done/current/pending)",
      "Cambio de estado por admin (PAID → IN_PRODUCTION → READY → DELIVERED → COMPLETED)",
    ],
  },
  {
    code: "08",
    title: "Paneles conectados a datos reales",
    items: [
      "Panel /admin con KPIs reales por línea (ingresos, activos, trend % vs mes anterior)",
      "Panel /cliente con historial unificado (Orders + ShopOrders + Quotes)",
      "Detalle de pedido /cliente/pedidos/[id] con timeline + items + documentos",
      "Detalle admin /admin/pedidos/[id] con botones de transición de estado",
    ],
  },
  {
    code: "09",
    title: "Confirmaciones premium post-pago",
    items: [
      "Catering: hero cinematográfico + countdown + carta del equipo + timeline T-72h/T-24h/T-2h/T-0 + 3 pilares",
      "Pharma: 'Su bienestar, en camino' + Discreción/Certificación/Trazabilidad",
      "Liofilizados: 'El campo, en su mejor momento' + Cosecha/Liofilizado/Hermético",
    ],
  },
  {
    code: "10",
    title: "Comunicación transaccional",
    items: [
      "Emails HTML editoriales (4 plantillas por línea con buildEditorialEmail())",
      "WhatsApp Business Cloud API (notificación al chef + cliente post-pago)",
      "Sistema de feedback post-evento (API + formulario público + email 48h post-entrega)",
    ],
  },
  {
    code: "11",
    title: "Seguridad y autenticación",
    items: [
      "JWT en httpOnly cookies + Bearer fallback",
      "Rate limiting por IP (auth 30/min, webhook 600/min, API 240/min)",
      "HMAC webhook verification (Bold)",
      "Roles y permisos (ADMIN, CHEF, STAFF, CLIENTE, PROVEEDOR, FINANZAS)",
      "Recuperación de contraseña con token hash + expiración 24h",
    ],
  },
  {
    code: "12",
    title: "Infraestructura y deploy",
    items: [
      "Supabase PostgreSQL con Prisma 7.5 + @prisma/adapter-pg",
      "Vercel auto-deploy vía GitHub (master → producción)",
      "11 migraciones SQL aditivas aplicadas en producción",
      "Seed completo: 6 usuarios demo, 8 recetas, 33 ingredientes, 6 ciudades, 17 productos",
      "48 imágenes 4K generadas con fal.ai FLUX Pro Ultra",
    ],
  },
];

export default function EntregaPage() {
  return (
    <>
      {/* Header propio (no SiteHeader — este es un documento formal) */}
      <header className="bg-ink text-cream">
        <div className="max-w-[1200px] mx-auto px-8 sm:px-12 py-12 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-marigold mb-3">
                § Informe de entrega
              </p>
              <h1 className="font-display font-light text-5xl sm:text-7xl tracking-[-0.04em] leading-[0.86]">
                Reina Verde
                <span className="text-marigold">.</span>
              </h1>
              <p className="mt-4 font-serif italic text-xl text-cream/75 leading-snug max-w-xl">
                Plataforma integral de catering corporativo, pharma y
                liofilizados. Diseño, desarrollo, deploy y puesta en
                producción.
              </p>
            </div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cream/55 text-right space-y-1">
              <p>Junio 2026</p>
              <p>Bogotá, Colombia</p>
              <p>Versión 1.0 · Entrega final</p>
            </div>
          </div>
          <div className="border-t border-cream/20 pt-6 grid sm:grid-cols-2 gap-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cream/50 mb-1">
                Desarrollado por
              </p>
              <p className="font-display text-2xl text-cream">
                Invent Agency
              </p>
              <p className="font-serif italic text-base text-cream/70 mt-1">
                Juan Sebastián Garzón Martínez
              </p>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cream/50 mt-1">
                C.C. 1.022.397.078
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cream/50 mb-1">
                Cliente
              </p>
              <p className="font-display text-2xl text-cream">
                Reina Verde Catering
              </p>
              <p className="font-serif italic text-base text-cream/70 mt-1">
                Bogotá · 6 ciudades de cobertura
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ════════════════ INVENTARIO DE ENTREGABLES ════════════════ */}
      <section className="max-w-[1200px] mx-auto px-8 sm:px-12 py-20 sm:py-28">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-marigold-deep mb-4">
          § 01 · Inventario de entregables
        </p>
        <h2 className="font-display font-light text-4xl sm:text-5xl tracking-[-0.025em] leading-[0.95] text-ink mb-4">
          12 módulos,
          <br />
          <span className="italic">una plataforma</span>
          <span className="text-marigold">.</span>
        </h2>
        <p className="font-serif italic text-lg text-ink/70 leading-snug max-w-2xl mb-16">
          Cada módulo fue diseñado, desarrollado, probado y desplegado en
          producción. Cero placeholders. Todo funcional.
        </p>

        <div className="space-y-12">
          {ENTREGABLES.map((e) => (
            <article key={e.code} className="border-t border-ink/15 pt-8">
              <div className="flex items-baseline gap-4 mb-4">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-marigold-deep">
                  § {e.code}
                </span>
                <h3 className="font-display text-2xl sm:text-3xl tracking-tight text-ink leading-tight">
                  {e.title}
                </h3>
              </div>
              <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                {e.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 font-serif text-[15px] text-ink/80 leading-snug"
                  >
                    <span className="text-marigold-deep mt-0.5 shrink-0">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* ════════════════ STACK TÉCNICO ════════════════ */}
      <section className="bg-cream-warm border-y border-ink/15">
        <div className="max-w-[1200px] mx-auto px-8 sm:px-12 py-20 sm:py-28">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-marigold-deep mb-4">
            § 02 · Stack técnico
          </p>
          <h2 className="font-display font-light text-4xl sm:text-5xl tracking-[-0.025em] leading-[0.95] text-ink mb-12">
            Tecnología
            <span className="text-marigold">.</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: "Framework", value: "Next.js 16.2.1 (App Router)" },
              { label: "UI", value: "React 19 + React Compiler" },
              { label: "Estilos", value: "Tailwind CSS v4" },
              { label: "Base de datos", value: "Supabase PostgreSQL" },
              { label: "ORM", value: "Prisma 7.5 + @prisma/adapter-pg" },
              { label: "Estado", value: "Zustand + persist middleware" },
              { label: "Pagos", value: "Bold (SHA-256 server-side)" },
              { label: "Storage", value: "Vercel Blob" },
              { label: "Deploy", value: "Vercel (auto-deploy vía GitHub)" },
              { label: "Imágenes", value: "fal.ai FLUX Pro Ultra (48 imgs 4K)" },
              { label: "Email", value: "Resend-ready (HTML editorial)" },
              { label: "WhatsApp", value: "Meta Cloud API v21" },
              { label: "Tipografía", value: "Fraunces + Geist + Geist Mono" },
              { label: "Auth", value: "JWT httpOnly cookies + rate limit" },
              { label: "PDF", value: "@react-pdf/renderer" },
            ].map((t) => (
              <div key={t.label} className="border border-ink/15 bg-cream p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55 mb-1">
                  {t.label}
                </p>
                <p className="font-display text-lg text-ink">{t.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FACTURA ════════════════ */}
      <section className="max-w-[1200px] mx-auto px-8 sm:px-12 py-20 sm:py-28">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-marigold-deep mb-4">
          § 03 · Factura de servicios
        </p>
        <h2 className="font-display font-light text-4xl sm:text-5xl tracking-[-0.025em] leading-[0.95] text-ink mb-12">
          Factura
          <span className="text-marigold">.</span>
        </h2>

        <div className="border border-ink/15 bg-cream max-w-3xl">
          <div className="p-8 border-b border-ink/15">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55 mb-1">
                  Proveedor
                </p>
                <p className="font-display text-xl text-ink">Invent Agency</p>
                <p className="font-serif text-[14px] text-ink/70 mt-1">
                  Juan Sebastián Garzón Martínez
                </p>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/55 mt-1">
                  C.C. 1.022.397.078
                </p>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/55">
                  Bogotá, Colombia
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55 mb-1">
                  Cliente
                </p>
                <p className="font-display text-xl text-ink">Reina Verde Catering</p>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/55 mt-1">
                  Bogotá, Colombia
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink/20">
                  <th className="text-left py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55">
                    Concepto
                  </th>
                  <th className="text-right py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55">
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-ink/10">
                  <td className="py-4">
                    <p className="font-display text-base text-ink">
                      Diseño, desarrollo y deploy de plataforma web
                    </p>
                    <p className="font-serif italic text-[13px] text-ink/65 mt-1">
                      12 módulos · Next.js 16 · Supabase · Bold · Vercel
                    </p>
                  </td>
                  <td className="py-4 text-right font-display text-xl tabular text-ink">
                    {USD(TOTAL_USD)}
                  </td>
                </tr>
                <tr className="border-b border-ink/10">
                  <td className="py-4">
                    <p className="font-display text-base text-ink">
                      Generación de imágenes 4K (fal.ai)
                    </p>
                    <p className="font-serif italic text-[13px] text-ink/65 mt-1">
                      48 imágenes · FLUX Pro Ultra · integradas en la plataforma
                    </p>
                  </td>
                  <td className="py-4 text-right font-mono text-[11px] uppercase tracking-[0.18em] text-ink/55">
                    Incluido
                  </td>
                </tr>
                <tr className="border-b border-ink/10">
                  <td className="py-4">
                    <p className="font-display text-base text-ink">
                      Deploy y configuración en producción
                    </p>
                    <p className="font-serif italic text-[13px] text-ink/65 mt-1">
                      Vercel + Supabase + Bold + migraciones SQL
                    </p>
                  </td>
                  <td className="py-4 text-right font-mono text-[11px] uppercase tracking-[0.18em] text-ink/55">
                    Incluido
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-ink text-cream p-8">
            <div className="flex items-baseline justify-between mb-2">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cream/65">
                Total del proyecto
              </p>
              <p className="font-display text-4xl tabular">
                {USD(TOTAL_USD)}
              </p>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cream/55">
                Equivalente COP (TRM ≈ {COP(TRM_APPROX)}/USD)
              </p>
              <p className="font-display text-2xl tabular text-cream/85">
                {COP(TOTAL_COP)}
              </p>
            </div>
          </div>

          <div className="p-8 bg-cream-warm">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-marigold-deep mb-3">
              § Plan de pago
            </p>
            <p className="font-serif italic text-base text-ink/75 leading-snug mb-4">
              El total se paga en cuotas mensuales de {COP(CUOTA_COP)} hasta
              completar el monto total de {USD(TOTAL_USD)} ({COP(TOTAL_COP)}).
            </p>
            <div className="border border-ink/15 bg-cream">
              <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-3 border-b border-ink/15 font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55">
                <span>#</span>
                <span>Descripción</span>
                <span className="text-right">Monto</span>
              </div>
              {Array.from({ length: NUM_CUOTAS }, (_, i) => {
                const isLast = i === NUM_CUOTAS - 1;
                const cuotaAmount = isLast
                  ? TOTAL_COP - CUOTA_COP * (NUM_CUOTAS - 1)
                  : CUOTA_COP;
                return (
                  <div
                    key={i}
                    className="grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-3 border-b border-ink/10 last:border-b-0"
                  >
                    <span className="font-mono text-[11px] tabular text-ink/55">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-serif text-[14px] text-ink/80">
                      Cuota {i + 1} de {NUM_CUOTAS}
                      {isLast ? " (última)" : ""}
                    </span>
                    <span className="font-display text-base tabular text-ink text-right">
                      {COP(cuotaAmount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ CONTRATO ════════════════ */}
      <section className="bg-cream-warm border-y border-ink/15">
        <div className="max-w-[1200px] mx-auto px-8 sm:px-12 py-20 sm:py-28">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-marigold-deep mb-4">
            § 04 · Contrato de prestación de servicios
          </p>
          <h2 className="font-display font-light text-4xl sm:text-5xl tracking-[-0.025em] leading-[0.95] text-ink mb-12">
            Contrato
            <span className="text-marigold">.</span>
          </h2>

          <div className="max-w-3xl space-y-6 font-serif text-[15.5px] text-ink/85 leading-relaxed">
            <p>
              Entre <strong>Juan Sebastián Garzón Martínez</strong>, identificado con
              cédula de ciudadanía No. 1.022.397.078 de Bogotá, actuando como
              representante de <strong>Invent Agency</strong> (en adelante "El Desarrollador"),
              y <strong>Reina Verde Catering</strong> (en adelante "El Cliente"), se
              celebra el presente contrato de prestación de servicios profesionales
              de desarrollo de software bajo los siguientes términos:
            </p>

            <div className="border-l-2 border-marigold pl-6 space-y-4">
              <p>
                <strong>PRIMERA · Objeto.</strong> El Desarrollador se compromete a
                diseñar, desarrollar, probar y desplegar una plataforma web integral
                para las tres líneas de negocio del Cliente (Catering, Pharma,
                Liofilizados), incluyendo los 12 módulos detallados en la sección
                "Inventario de entregables" de este documento.
              </p>
              <p>
                <strong>SEGUNDA · Valor y forma de pago.</strong> El valor total del
                proyecto es de <strong>{USD(TOTAL_USD)} (dólares americanos)</strong>,
                equivalentes a aproximadamente <strong>{COP(TOTAL_COP)} (pesos colombianos)</strong> según
                TRM vigente. El pago se realizará en cuotas mensuales de{" "}
                <strong>{COP(CUOTA_COP)}</strong> hasta completar el monto total
                ({NUM_CUOTAS} cuotas).
              </p>
              <p>
                <strong>TERCERA · Propiedad intelectual.</strong> Una vez completado
                el pago total, el código fuente, los diseños, las imágenes generadas
                por IA y toda la propiedad intelectual del proyecto serán transferidos
                en su totalidad al Cliente. Mientras no se complete el pago, el
                Desarrollador retiene los derechos patrimoniales del código.
              </p>
              <p>
                <strong>CUARTA · Garantía.</strong> El Desarrollador garantiza el
                funcionamiento correcto de todos los módulos entregados por un período
                de 30 días hábiles después de la entrega final. Los bugs reportados
                dentro de ese período serán corregidos sin costo adicional.
              </p>
              <p>
                <strong>QUINTA · Mantenimiento.</strong> El mantenimiento posterior al
                período de garantía (actualizaciones de dependencias, nuevas features,
                ajustes de contenido, soporte técnico) se cotizará y facturará por
                separado, previo acuerdo entre las partes.
              </p>
              <p>
                <strong>SEXTA · Confidencialidad.</strong> Ambas partes se comprometen
                a mantener la confidencialidad de la información sensible compartida
                durante el desarrollo del proyecto, incluyendo pero no limitándose a:
                credenciales de API, datos de clientes, estrategias de pricing y
                recetas operativas.
              </p>
              <p>
                <strong>SÉPTIMA · Portafolio.</strong> El Desarrollador se reserva el
                derecho de incluir este proyecto en su portafolio profesional y
                material de marketing de Invent Agency, sin revelar información
                confidencial del Cliente.
              </p>
            </div>

            <div className="pt-12 grid sm:grid-cols-2 gap-12">
              <div className="border-t border-ink/20 pt-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55 mb-4">
                  El Desarrollador
                </p>
                <div className="h-20 border-b border-ink/30 mb-3" />
                <p className="font-display text-lg text-ink">
                  Juan Sebastián Garzón Martínez
                </p>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/55">
                  C.C. 1.022.397.078 · Invent Agency
                </p>
              </div>
              <div className="border-t border-ink/20 pt-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55 mb-4">
                  El Cliente
                </p>
                <div className="h-20 border-b border-ink/30 mb-3" />
                <p className="font-display text-lg text-ink">
                  Reina Verde Catering
                </p>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/55">
                  Representante legal
                </p>
              </div>
            </div>

            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55 pt-8">
              Firmado en Bogotá, Colombia · Junio de 2026
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════ CREDITOS ════════════════ */}
      <section className="max-w-[1200px] mx-auto px-8 sm:px-12 py-20 sm:py-28 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-ink/55 mb-6">
          § Créditos
        </p>
        <p className="font-display font-light text-3xl sm:text-4xl tracking-[-0.025em] text-ink mb-2">
          Diseñado y desarrollado por
        </p>
        <p className="font-display italic text-5xl sm:text-6xl text-ink mb-4">
          Invent Agency
        </p>
        <p className="font-serif italic text-xl text-ink/65 mb-8">
          Juan Sebastián Garzón Martínez · Bogotá, Colombia · 2026
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center h-12 px-7 bg-ink text-cream font-sans text-[14px] tracking-tight rv-press hover:bg-ink-soft transition-colors"
          >
            Ver la plataforma →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
