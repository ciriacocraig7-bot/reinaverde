import Link from "next/link";

const BUSINESS_LINES = [
  {
    slug: "catering",
    name: "Reina Verde Catering",
    tagline: "Premium Catering Corporativo",
    description: "Eventos corporativos, bodas y celebraciones con menús personalizados, logística automatizada y pagos seguros.",
    icon: "restaurant_menu",
    gradient: "from-emerald-600 to-emerald-800",
    accentBg: "bg-emerald-50",
    accentText: "text-emerald-700",
    accentBorder: "border-emerald-200",
    stats: [
      { value: "500+", label: "Eventos" },
      { value: "98%", label: "Satisfacción" },
    ],
    features: ["Menús personalizados", "Logística automatizada", "Pagos con Wompi", "Dashboard empresarial"],
  },
  {
    slug: "canabico",
    name: "Reina Verde Canábico",
    tagline: "Bienestar Natural & Legal",
    description: "Productos derivados del cannabis medicinal y de bienestar, 100% legales, con trazabilidad completa y envío seguro.",
    icon: "spa",
    gradient: "from-violet-600 to-purple-800",
    accentBg: "bg-violet-50",
    accentText: "text-violet-700",
    accentBorder: "border-violet-200",
    stats: [
      { value: "100%", label: "Legal" },
      { value: "Lab", label: "Certificado" },
    ],
    features: ["Productos certificados", "Trazabilidad blockchain", "Envío discreto", "Asesoría personalizada"],
  },
  {
    slug: "liofilizados",
    name: "Reina Verde Liofilizados",
    tagline: "Frutas Liofilizadas Premium",
    description: "Frutas colombianas liofilizadas que conservan nutrientes y sabor. Snacks saludables para retail y mayoristas.",
    icon: "nutrition",
    gradient: "from-amber-500 to-orange-600",
    accentBg: "bg-amber-50",
    accentText: "text-amber-700",
    accentBorder: "border-amber-200",
    stats: [
      { value: "100%", label: "Natural" },
      { value: "2yr", label: "Shelf life" },
    ],
    features: ["Sin conservantes", "Retención nutricional", "Empaque sustentable", "Venta al por mayor"],
  },
];

export default function HubPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-30%] left-[-15%] w-[500px] h-[500px] rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-violet-200/20 blur-3xl" />
          <div className="absolute bottom-[-20%] right-[20%] w-[350px] h-[350px] rounded-full bg-amber-200/20 blur-3xl" />
        </div>

        <nav className="relative z-10 max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shadow-lg shadow-emerald-900/20">
              <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            </div>
            <span className="text-xl font-bold tracking-tighter text-on-surface">Reina Verde</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-5 py-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/registro" className="px-5 py-2.5 text-sm font-semibold bg-on-surface text-surface rounded-xl hover:bg-on-surface/90 transition-colors">
              Crear Cuenta
            </Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-8 pt-16 pb-24 text-center">
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.25em] text-on-surface-variant bg-surface-container-low px-4 py-1.5 rounded-full mb-6">
            Franquicia de Bienestar & Gastronomía
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] max-w-4xl mx-auto">
            Tres Mundos,<br />
            <span className="bg-gradient-to-r from-emerald-600 via-violet-600 to-amber-500 bg-clip-text text-transparent">
              Una Experiencia
            </span>
          </h1>
          <p className="mt-6 text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Catering corporativo premium, productos canábicos legales y frutas liofilizadas colombianas.
            Elige tu línea de negocio y descubre lo que Reina Verde tiene para ti.
          </p>
        </div>
      </header>

      {/* Business Line Cards */}
      <section className="max-w-7xl mx-auto px-8 -mt-8 pb-24 relative z-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {BUSINESS_LINES.map((line) => (
            <Link href={`/${line.slug}`} key={line.slug} className="group">
              <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden hover:translate-y-[-6px] hover:shadow-xl transition-all duration-500">
                {/* Card Hero */}
                <div className={`relative h-48 bg-gradient-to-br ${line.gradient} flex items-center justify-center overflow-hidden`}>
                  <span
                    className="material-symbols-outlined text-white/15 group-hover:scale-110 transition-transform duration-700"
                    style={{ fontSize: "120px", fontVariationSettings: "'FILL' 1" }}
                  >
                    {line.icon}
                  </span>
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                      {line.tagline}
                    </span>
                  </div>
                  {/* Stats overlay */}
                  <div className="absolute bottom-4 right-4 flex gap-3">
                    {line.stats.map((stat) => (
                      <div key={stat.label} className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 text-center">
                        <p className="text-white text-sm font-bold leading-tight">{stat.value}</p>
                        <p className="text-white/70 text-[9px] font-medium uppercase tracking-wider">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <h3 className="text-xl font-bold tracking-tight text-on-surface mb-2">{line.name}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-5">{line.description}</p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {line.features.map((f) => (
                      <span key={f} className={`${line.accentBg} ${line.accentText} text-[10px] font-bold px-2.5 py-1 rounded-full`}>
                        {f}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className={`flex items-center justify-between pt-4 border-t ${line.accentBorder}`}>
                    <span className={`text-sm font-bold ${line.accentText}`}>Explorar</span>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${line.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <span className="material-symbols-outlined text-white text-lg">arrow_forward</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* About Strip */}
      <section className="bg-surface-container-low py-20">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4 block">Sobre Nosotros</span>
          <h2 className="text-3xl font-semibold tracking-tight text-on-surface max-w-3xl mx-auto mb-6">
            Un ecosistema de bienestar, sabor y sostenibilidad nacido en Colombia
          </h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto leading-relaxed mb-10">
            Reina Verde es una franquicia que conecta tres industrias con propósito: gastronomía premium, bienestar natural y nutrición funcional.
            Cada línea opera de forma independiente pero comparte valores de calidad, sostenibilidad e innovación tecnológica.
          </p>
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { icon: "eco", title: "Sostenibilidad", desc: "Cadena de suministro responsable" },
              { icon: "verified", title: "Calidad", desc: "Estándares certificados en cada línea" },
              { icon: "rocket_launch", title: "Innovación", desc: "Tecnología al servicio del cliente" },
            ].map((v) => (
              <div key={v.title} className="text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 flex items-center justify-center mb-3 shadow-sm">
                  <span className="material-symbols-outlined text-on-surface-variant text-2xl">{v.icon}</span>
                </div>
                <h4 className="font-bold text-on-surface text-sm">{v.title}</h4>
                <p className="text-xs text-on-surface-variant mt-1">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-inverse-surface text-inverse-on-surface py-12">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
                </div>
                <span className="text-lg font-bold text-white">Reina Verde</span>
              </div>
              <p className="text-sm leading-relaxed opacity-70">
                Franquicia colombiana de catering, bienestar canábico y nutrición liofilizada.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4">Líneas de Negocio</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/catering" className="hover:text-white transition-colors opacity-70 hover:opacity-100">Catering</Link></li>
                <li><Link href="/canabico" className="hover:text-white transition-colors opacity-70 hover:opacity-100">Canábico</Link></li>
                <li><Link href="/liofilizados" className="hover:text-white transition-colors opacity-70 hover:opacity-100">Liofilizados</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors opacity-70 hover:opacity-100">Términos</a></li>
                <li><a href="#" className="hover:text-white transition-colors opacity-70 hover:opacity-100">Privacidad</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4">Contacto</h4>
              <ul className="space-y-2 text-sm opacity-70">
                <li>info@reinaverde.co</li>
                <li>+57 300 123 4567</li>
                <li>Bogotá, Colombia</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm opacity-50">
            <p>&copy; {new Date().getFullYear()} Reina Verde. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
