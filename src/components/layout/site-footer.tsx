import Link from "next/link";

const YEAR_FOUNDED = 2024;

/**
 * Editorial colophon footer. Ink-on-cream with a single rule, a tabular
 * year/edition, and a four-column index of links. The right-most column
 * states the colophon (typography credit) — pure editorial gesture.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  const edition = year - YEAR_FOUNDED + 1;

  return (
    <footer className="mt-32 bg-cream border-t border-ink/15 text-ink">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-16">
        {/* Masthead row */}
        <div className="flex flex-wrap items-end justify-between gap-y-6 mb-12">
          <Link href="/" className="block">
            <span className="font-display italic text-5xl sm:text-6xl tracking-[-0.04em] leading-none">
              Reina<span className="text-ink/55">·</span>Verde
            </span>
          </Link>
          <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/60 text-right">
            <p>Bogotá, Colombia</p>
            <p>Edición {String(edition).padStart(2, "0")} / MM{year.toString().slice(-2)}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 border-t border-ink/15 pt-10">
          <FooterCol
            title="Casa"
            items={[
              { href: "/catering", label: "Catering" },
              { href: "/catering/menu", label: "Los seis momentos" },
              { href: "/catering/eventos", label: "Tipos de evento" },
              { href: "/catering/nosotros", label: "Quiénes somos" },
            ]}
          />
          <FooterCol
            title="Cuenta"
            items={[
              { href: "/login", label: "Ingresar" },
              { href: "/registro", label: "Crear cuenta" },
              { href: "/cliente", label: "Mi panel" },
              { href: "/catering/cotizar", label: "Diseñar cotización" },
            ]}
          />
          <FooterCol
            title="Legal"
            items={[
              { href: "#", label: "Términos de servicio" },
              { href: "#", label: "Política de privacidad" },
              { href: "#", label: "Tratamiento de datos" },
            ]}
          />
          <div>
            <h4 className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink/55 mb-5">
              Contacto
            </h4>
            <ul className="space-y-3 font-sans text-[14px] text-ink/85">
              <li>
                <a
                  href="tel:+573147905135"
                  className="rv-link block"
                  aria-label="Llamar al +57 314 790 5135"
                >
                  (+57) 314 790 5135
                </a>
              </li>
              <li>
                <a
                  href="mailto:reinaverdecatering@gmail.com"
                  className="rv-link block break-all"
                >
                  reinaverdecatering@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/reinaverdecatering"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rv-link inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                  @reinaverdecatering
                </a>
              </li>
            </ul>

            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/45">
              6 ciudades · cobertura nacional
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/45">
              Medellín · Bogotá · Cali · Barranquilla · Cartagena · Armenia
            </p>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-ink/15 flex flex-wrap items-center justify-between gap-y-2">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink/55">
            © MM{year.toString().slice(-2)} Reina Verde — Todos los derechos reservados
          </p>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink/55">
            Pagos por Bold · Construido con Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: { href: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink/55 mb-5">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {items.map((it) => (
          <li key={it.label}>
            <Link
              href={it.href}
              className="font-sans text-[15px] text-ink/85 hover:text-ink rv-link"
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
