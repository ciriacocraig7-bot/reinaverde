"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";

const FEATURES = [
  { icon: "restaurant_menu", title: "Menú Personalizable", description: "Diseña tu menú según las necesidades de tu evento con opciones para restricciones alimenticias." },
  { icon: "event", title: "Gestión de Eventos", description: "Planifica cada detalle de tu evento corporativo, boda o celebración social." },
  { icon: "local_shipping", title: "Logística Automatizada", description: "Tracking en tiempo real y coordinación completa del servicio de entrega." },
  { icon: "corporate_fare", title: "Planes Corporativos", description: "Suscripciones y planes especiales para empresas con facturación automática." },
  { icon: "lock", title: "Pagos Seguros", description: "Integración con Wompi para pagos con tarjeta, PSE, Nequi y más." },
  { icon: "verified", title: "Calidad Garantizada", description: "Sistema de feedback y calificaciones para asegurar la excelencia." },
];

const EVENT_TYPES = [
  { icon: "corporate_fare", label: "Corporativo" },
  { icon: "groups", label: "Social" },
  { icon: "favorite", label: "Bodas" },
  { icon: "sync", label: "Suscripción" },
];

const STATS = [
  { value: "500+", label: "Eventos realizados" },
  { value: "98%", label: "Satisfacción" },
  { value: "50+", label: "Empresas confían" },
  { value: "< 3min", label: "Tiempo de cotización" },
];

export default function CateringHomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 overflow-hidden">
        <div className="px-8 py-16 md:py-24 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2 z-10">
              <Link href="/" className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant hover:text-on-surface transition-colors mb-4 inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Reina Verde
              </Link>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-container mb-4 block mt-4">
                Excellence in Service
              </span>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-on-surface mb-6 leading-[1.1]">
                Premium Catering for Your Business
              </h1>
              <p className="text-lg text-on-surface-variant mb-10 max-w-lg leading-relaxed">
                Elevate your corporate events with curated menus, precision logistics, and a commitment to seasonal freshness.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/catering/menu">
                  <button className="px-8 py-4 bg-gradient-to-br from-primary-container to-primary text-on-primary rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95">
                    <span className="flex items-center gap-2">
                      Ver Menú
                      <span className="material-symbols-outlined text-xl">arrow_forward</span>
                    </span>
                  </button>
                </Link>
                <Link href="/registro">
                  <button className="px-8 py-4 bg-surface-container-lowest border border-outline-variant/20 text-on-surface rounded-xl font-semibold hover:bg-surface-container-high transition-colors active:scale-95">
                    Crear Cuenta Empresa
                  </button>
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2 relative">
              <div className="aspect-[4/5] rounded-[2rem] overflow-hidden editorial-shadow bg-gradient-to-br from-primary-fixed/30 to-surface-container-high flex items-center justify-center">
                <span className="material-symbols-outlined text-primary/20" style={{ fontSize: "200px", fontVariationSettings: "'FILL' 1" }}>restaurant</span>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-fixed p-2 rounded-lg">
                    <span className="material-symbols-outlined text-primary">timer</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Rapid Setup</p>
                    <p className="text-xl font-bold text-on-surface">3 Minute Booking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Stats Strip */}
      <section className="bg-gradient-to-br from-primary-container to-primary py-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-on-primary-container text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Selection Cards */}
      <section className="px-8 py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-medium tracking-tight text-on-surface mb-2">Experiencias Curadas</h2>
              <p className="text-on-surface-variant">Selecciona la experiencia perfecta para tu evento.</p>
            </div>
            <Link href="/catering/menu" className="text-primary-container font-semibold flex items-center gap-2 group hover:underline">
              Ver todas las categorías
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {EVENT_TYPES.map((type) => (
              <Link href="/catering/menu" key={type.label}>
                <div className="group relative overflow-hidden rounded-[2rem] bg-surface-container-lowest editorial-shadow h-[280px] flex flex-col hover:translate-y-[-4px] transition-all duration-300 border border-outline-variant/5">
                  <div className="h-2/3 overflow-hidden bg-gradient-to-br from-primary-fixed/20 to-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary/30 group-hover:scale-110 transition-transform duration-700" style={{ fontSize: "80px" }}>{type.icon}</span>
                  </div>
                  <div className="p-6 flex flex-col justify-between flex-grow">
                    <h3 className="text-lg font-bold text-on-surface">{type.label}</h3>
                    <button className="mt-2 flex items-center gap-2 text-primary-container font-bold text-xs uppercase tracking-widest">
                      Seleccionar <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-medium tracking-tight text-on-surface">Todo Automatizado</h2>
            <p className="mt-3 text-on-surface-variant max-w-xl mx-auto">Una plataforma completa para gestionar tu catering de principio a fin</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="bg-surface-container-lowest rounded-xl p-6 shadow-sm shadow-emerald-900/5 border border-outline-variant/10 relative overflow-hidden group hover:translate-y-[-2px] transition-all duration-300">
                <div className="absolute top-0 right-0 p-4">
                  <span className="material-symbols-outlined text-primary-fixed-dim text-4xl opacity-20">{feature.icon}</span>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary-fixed flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary">{feature.icon}</span>
                </div>
                <h3 className="font-bold text-on-surface mb-2">{feature.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-20 bg-surface">
        <div className="max-w-5xl mx-auto bg-primary-container text-white rounded-3xl p-12 shadow-xl shadow-primary/20 relative overflow-hidden">
          <div className="relative z-10 text-center">
            <span className="bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">Comienza Hoy</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-6 tracking-tight">¿Listo para automatizar tu catering?</h2>
            <p className="text-on-primary-container text-lg mt-4 max-w-2xl mx-auto">Únete a más de 50 empresas que ya confían en Reina Verde para sus eventos corporativos.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link href="/registro"><button className="bg-white text-primary font-bold px-8 py-4 rounded-xl hover:bg-emerald-50 transition-colors active:scale-95 duration-150">Comenzar Ahora</button></Link>
              <Link href="/catering/menu"><button className="border border-white/30 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors active:scale-95 duration-150">Explorar Menú</button></Link>
            </div>
          </div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full pointer-events-none"></div>
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full pointer-events-none"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-inverse-surface text-inverse-on-surface py-12">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant_menu</span>
              </div>
              <span className="text-lg font-bold text-white">Reina Verde Catering</span>
            </div>
            <p className="text-sm opacity-50">&copy; {new Date().getFullYear()} Reina Verde</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
