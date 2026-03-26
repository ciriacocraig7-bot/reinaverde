"use client";

import Link from "next/link";

const CATEGORIES = [
  { icon: "nutrition", name: "Frutas Tropicales", description: "Mango, piña, maracuyá y guanábana liofilizados, conservando su sabor intenso.", tag: "Popular" },
  { icon: "energy_savings_leaf", name: "Berries & Exóticos", description: "Arándanos, fresas, uchuvas y gulupa en presentaciones premium.", tag: "Antioxidantes" },
  { icon: "blender", name: "Mix & Snacks", description: "Mezclas curadas de frutas liofilizadas listas para consumir como snack.", tag: "Ready-to-eat" },
  { icon: "bakery_dining", name: "Para Repostería", description: "Polvo y trozos de frutas ideales para decoración y sabor en pastelería.", tag: "Chef Grade" },
  { icon: "local_shipping", name: "Mayorista / Bulk", description: "Presentaciones a granel para negocios, restaurantes y exportación.", tag: "B2B" },
  { icon: "redeem", name: "Regalos Corporativos", description: "Kits personalizados con marca para regalos empresariales.", tag: "Personalizable" },
];

const STATS = [
  { value: "100%", label: "Natural", icon: "eco" },
  { value: "2 años", label: "Shelf life", icon: "calendar_month" },
  { value: "95%", label: "Nutrientes", icon: "vital_signs" },
  { value: "0", label: "Conservantes", icon: "block" },
];

export default function LiofilizadosHomePage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Nav */}
      <nav className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-900/20">
            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>nutrition</span>
          </div>
          <span className="text-xl font-bold tracking-tighter text-on-surface">Reina Verde <span className="text-amber-600">Liofilizados</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-lg">home</span> Hub
          </Link>
          <Link href="/login" className="px-5 py-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors">Iniciar Sesión</Link>
          <Link href="/registro" className="px-5 py-2.5 text-sm font-semibold bg-amber-600 text-white rounded-xl hover:bg-amber-500 transition-colors">Crear Cuenta</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-amber-200/30 blur-3xl" />
          <div className="absolute bottom-[-30%] right-[-10%] w-[400px] h-[400px] rounded-full bg-orange-200/20 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-8 py-20 md:py-28">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600 mb-4 block">Frutas Liofilizadas Premium</span>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Sabor Colombiano,<br />
                <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">Nutrición Intacta</span>
              </h1>
              <p className="text-lg text-on-surface-variant mb-10 max-w-lg leading-relaxed">
                Frutas colombianas liofilizadas que conservan el 95% de sus nutrientes y todo su sabor. Sin conservantes, sin azúcar añadida, sin compromisos.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/liofilizados/catalogo" className="px-8 py-4 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg shadow-amber-900/20 hover:scale-[1.02] transition-transform active:scale-95 flex items-center gap-2">
                  Ver Catálogo <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </Link>
                <a href="#categorias" className="px-8 py-4 bg-surface-container-lowest border border-outline-variant/20 text-on-surface rounded-xl font-semibold hover:bg-surface-container-high transition-colors active:scale-95">
                  Explorar Categorías
                </a>
              </div>
            </div>
            <div className="w-full md:w-1/2 relative flex justify-center">
              <div className="aspect-square w-full max-w-md rounded-[3rem] bg-gradient-to-br from-amber-500/80 to-orange-600 flex items-center justify-center editorial-shadow">
                <span className="material-symbols-outlined text-white/20" style={{ fontSize: "160px", fontVariationSettings: "'FILL' 1" }}>nutrition</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-to-br from-amber-500 to-orange-600 py-12">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <span className="material-symbols-outlined text-white/80 text-3xl mb-2">{stat.icon}</span>
              <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
              <p className="mt-1 text-amber-100 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section id="categorias" className="py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600 mb-2 block">Productos</span>
            <h2 className="text-3xl font-semibold tracking-tight text-on-surface">Nuestras Categorías</h2>
            <p className="mt-3 text-on-surface-variant">Frutas colombianas liofilizadas para cada necesidad</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((cat) => (
              <Link href="/liofilizados/catalogo" key={cat.name}>
                <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm hover:translate-y-[-4px] transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full">{cat.tag}</span>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-amber-600 text-2xl">{cat.icon}</span>
                  </div>
                  <h3 className="font-bold text-on-surface mb-2">{cat.name}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{cat.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-amber-600 font-bold text-xs uppercase tracking-widest">
                    Ver productos <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600 mb-2 block">Proceso</span>
            <h2 className="text-3xl font-semibold tracking-tight text-on-surface">¿Qué es la Liofilización?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Selección", desc: "Frutas colombianas frescas seleccionadas en su punto óptimo de madurez", icon: "search" },
              { step: "2", title: "Congelación", desc: "Congelación rápida a -40°C para preservar la estructura celular", icon: "ac_unit" },
              { step: "3", title: "Sublimación", desc: "El agua se elimina por vacío sin pasar por estado líquido", icon: "science" },
              { step: "4", title: "Empaque", desc: "Sellado al vacío para conservar frescura por hasta 2 años", icon: "package_2" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-amber-900/20">
                  <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                </div>
                <h3 className="font-bold text-on-surface mb-2">{item.title}</h3>
                <p className="text-sm text-on-surface-variant">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-20 bg-surface">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-3xl p-12 shadow-xl shadow-amber-900/20 relative overflow-hidden">
          <div className="relative z-10 text-center">
            <span className="bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">Nutrición Premium</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-6 tracking-tight">¿Listo para probar la diferencia?</h2>
            <p className="text-amber-100 text-lg mt-4 max-w-2xl mx-auto">Frutas colombianas 100% naturales, sin conservantes, con envío a toda Colombia.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link href="/liofilizados/catalogo" className="bg-white text-amber-700 font-bold px-8 py-4 rounded-xl hover:bg-amber-50 transition-colors active:scale-95 duration-150">
                Explorar Catálogo
              </Link>
            </div>
          </div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full pointer-events-none"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-inverse-surface text-inverse-on-surface py-8">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>nutrition</span>
            </div>
            <span className="text-lg font-bold text-white">Reina Verde Liofilizados</span>
          </div>
          <p className="text-sm opacity-50">&copy; {new Date().getFullYear()} Reina Verde</p>
        </div>
      </footer>
    </div>
  );
}
