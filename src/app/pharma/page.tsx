"use client";

import Link from "next/link";

const CATEGORIES = [
  { icon: "spa", name: "Aceites CBD", description: "Aceites sublinguales de espectro completo para bienestar diario.", tag: "Bestseller" },
  { icon: "local_florist", name: "Flores Secas", description: "Flores de cáñamo industrial con perfiles aromáticos únicos.", tag: "Premium" },
  { icon: "science", name: "Tinturas", description: "Extractos concentrados con dosificación precisa para uso terapéutico.", tag: "Lab Tested" },
  { icon: "self_improvement", name: "Tópicos", description: "Cremas, bálsamos y ungüentos para alivio localizado.", tag: "Natural" },
  { icon: "inventory_2", name: "Kits de Bienestar", description: "Paquetes curados con productos complementarios para rutinas de bienestar.", tag: "Nuevo" },
  { icon: "pets", name: "Línea Pet", description: "Productos formulados especialmente para el bienestar de mascotas.", tag: "Vet Approved" },
];

const TRUST_POINTS = [
  { icon: "verified", title: "100% Legal", desc: "Todos nuestros productos cumplen con la regulación colombiana vigente." },
  { icon: "biotech", title: "Lab Certificado", desc: "Certificados de análisis de laboratorios independientes en cada producto." },
  { icon: "local_shipping", title: "Envío Discreto", desc: "Empaque neutro y envío seguro a todo Colombia." },
  { icon: "support_agent", title: "Asesoría Experta", desc: "Equipo de profesionales para guiar tu experiencia de bienestar." },
];

export default function PharmaHomePage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Nav */}
      <nav className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-lg shadow-violet-900/20">
            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
          </div>
          <span className="text-xl font-bold tracking-tighter text-on-surface">Reina Verde <span className="text-violet-600">Pharma</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-lg">home</span> Hub
          </Link>
          <Link href="/login" className="px-5 py-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors">Iniciar Sesión</Link>
          <Link href="/registro" className="px-5 py-2.5 text-sm font-semibold bg-violet-700 text-white rounded-xl hover:bg-violet-600 transition-colors">Crear Cuenta</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-200/30 blur-3xl" />
          <div className="absolute bottom-[-30%] right-[-10%] w-[400px] h-[400px] rounded-full bg-purple-200/20 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-8 py-20 md:py-28">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-violet-500 mb-4 block">Bienestar Natural & Legal</span>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Tu Bienestar,<br />
                <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Nuestra Ciencia</span>
              </h1>
              <p className="text-lg text-on-surface-variant mb-10 max-w-lg leading-relaxed">
                Productos de bienestar de grado premium, respaldados por ciencia, certificados por laboratorios independientes y 100% legales en Colombia.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/pharma/catalogo" className="px-8 py-4 bg-gradient-to-br from-violet-600 to-purple-800 text-white rounded-xl font-semibold shadow-lg shadow-violet-900/20 hover:scale-[1.02] transition-transform active:scale-95 flex items-center gap-2">
                  Ver Catálogo <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </Link>
                <a href="#categorias" className="px-8 py-4 bg-surface-container-lowest border border-outline-variant/20 text-on-surface rounded-xl font-semibold hover:bg-surface-container-high transition-colors active:scale-95">
                  Explorar Categorías
                </a>
              </div>
            </div>
            <div className="w-full md:w-1/2 relative flex justify-center">
              <div className="aspect-square w-full max-w-md rounded-[3rem] bg-gradient-to-br from-violet-600/80 to-purple-800 flex items-center justify-center editorial-shadow">
                <span className="material-symbols-outlined text-white/20" style={{ fontSize: "160px", fontVariationSettings: "'FILL' 1" }}>spa</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Points */}
      <section className="bg-gradient-to-br from-violet-700 to-purple-900 py-12">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {TRUST_POINTS.map((tp) => (
            <div key={tp.title} className="text-center">
              <span className="material-symbols-outlined text-white/80 text-3xl mb-2">{tp.icon}</span>
              <p className="text-white font-bold text-sm">{tp.title}</p>
              <p className="text-violet-200 text-xs mt-1">{tp.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section id="categorias" className="py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-violet-500 mb-2 block">Catálogo</span>
            <h2 className="text-3xl font-semibold tracking-tight text-on-surface">Nuestras Categorías</h2>
            <p className="mt-3 text-on-surface-variant">Productos premium para cada necesidad de bienestar</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((cat) => (
              <Link href="/pharma/catalogo" key={cat.name}>
                <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm hover:translate-y-[-4px] transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <span className="bg-violet-50 text-violet-700 text-[10px] font-bold px-2.5 py-1 rounded-full">{cat.tag}</span>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-violet-600 text-2xl">{cat.icon}</span>
                  </div>
                  <h3 className="font-bold text-on-surface mb-2">{cat.name}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{cat.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-violet-600 font-bold text-xs uppercase tracking-widest">
                    Ver productos <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-20 bg-surface">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-violet-700 to-purple-900 text-white rounded-3xl p-12 shadow-xl shadow-violet-900/20 relative overflow-hidden">
          <div className="relative z-10 text-center">
            <span className="bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">Bienestar Certificado</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-6 tracking-tight">¿Listo para tu experiencia de bienestar?</h2>
            <p className="text-violet-200 text-lg mt-4 max-w-2xl mx-auto">Productos certificados, envío discreto a toda Colombia y asesoría personalizada.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link href="/pharma/catalogo" className="bg-white text-violet-700 font-bold px-8 py-4 rounded-xl hover:bg-violet-50 transition-colors active:scale-95 duration-150">
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
            </div>
            <span className="text-lg font-bold text-white">Reina Verde Pharma</span>
          </div>
          <p className="text-sm opacity-50">&copy; {new Date().getFullYear()} Reina Verde</p>
        </div>
      </footer>
    </div>
  );
}
