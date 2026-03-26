"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";

const VALUES = [
  { icon: "eco", title: "Sostenibilidad", description: "Ingredientes locales, empaques eco-friendly y cero desperdicio." },
  { icon: "favorite", title: "Pasión", description: "Cada plato se prepara con dedicación y atención al detalle." },
  { icon: "lightbulb", title: "Innovación", description: "Tecnología al servicio de la gastronomía para una experiencia sin fricciones." },
  { icon: "workspace_premium", title: "Excelencia", description: "Altos estándares de calidad en ingredientes, presentación y servicio." },
];

const TEAM = [
  { name: "Ana García", role: "Chef Ejecutiva", desc: "15 años de experiencia en alta cocina colombiana e internacional.", initials: "AG" },
  { name: "Carlos Rodríguez", role: "Director de Operaciones", desc: "Especialista en logística de eventos a gran escala.", initials: "CR" },
  { name: "Laura Martínez", role: "Directora Comercial", desc: "Experta en relaciones corporativas y desarrollo de negocios B2B.", initials: "LM" },
];

export default function NosotrosPage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/20 via-surface to-surface pointer-events-none" />
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-container mb-4 block">Nuestra Historia</span>
            <h1 className="text-5xl sm:text-6xl font-semibold text-on-surface tracking-tight leading-tight">
              Sabor colombiano con tecnología de clase mundial
            </h1>
            <p className="mt-6 text-lg text-on-surface-variant leading-relaxed max-w-2xl mx-auto">
              Reina Verde nació con la misión de transformar la industria del catering corporativo en Colombia.
              Combinamos la riqueza gastronómica local con automatización inteligente para ofrecer experiencias memorables.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-primary-fixed/30 rounded-2xl border border-outline-variant/10">
              <span className="material-symbols-outlined text-primary text-3xl mb-4">rocket_launch</span>
              <h2 className="text-2xl font-bold text-on-surface mb-4">Misión</h2>
              <p className="text-on-surface-variant leading-relaxed">
                Democratizar el acceso a catering de alta calidad mediante tecnología,
                automatizando cada paso del proceso para que empresas y personas disfruten
                de eventos perfectos sin complicaciones.
              </p>
            </div>
            <div className="p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm">
              <span className="material-symbols-outlined text-primary text-3xl mb-4">visibility</span>
              <h2 className="text-2xl font-bold text-on-surface mb-4">Visión</h2>
              <p className="text-on-surface-variant leading-relaxed">
                Ser la plataforma líder de catering automatizado en Latinoamérica,
                conectando empresas con experiencias gastronómicas excepcionales
                a través de un ecosistema digital innovador.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-container mb-2 block">Principios</span>
            <h2 className="text-3xl font-semibold tracking-tight text-on-surface">Nuestros Valores</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((val) => (
              <div key={val.title} className="bg-surface-container-lowest rounded-2xl p-6 text-center border border-outline-variant/10 shadow-sm hover:translate-y-[-2px] transition-all duration-300">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-primary-fixed flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary text-2xl">{val.icon}</span>
                </div>
                <h3 className="font-bold text-on-surface mb-2">{val.title}</h3>
                <p className="text-sm text-on-surface-variant">{val.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-container mb-2 block">Liderazgo</span>
            <h2 className="text-3xl font-semibold tracking-tight text-on-surface">Nuestro Equipo</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {TEAM.map((member) => (
              <div key={member.name} className="text-center">
                <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-primary-container to-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                  <span className="text-2xl font-bold text-white">{member.initials}</span>
                </div>
                <h3 className="font-bold text-on-surface">{member.name}</h3>
                <p className="text-sm text-primary-container font-semibold">{member.role}</p>
                <p className="text-sm text-on-surface-variant mt-2">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-container relative overflow-hidden">
        <div className="absolute top-0 right-0 h-full w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-16">
          <span className="material-symbols-outlined" style={{ fontSize: "200px", fontVariationSettings: "'FILL' 1" }}>group</span>
        </div>
        <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">¿Quieres trabajar con nosotros?</h2>
          <p className="text-on-primary-container mb-8">Estamos buscando talento apasionado por la gastronomía y la tecnología.</p>
          <Link href="/registro" className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-3.5 rounded-xl shadow-lg hover:bg-emerald-50 transition-colors active:scale-95">
            Contáctanos <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
        </div>
      </section>

      <footer className="bg-inverse-surface text-inverse-on-surface py-8">
        <div className="max-w-7xl mx-auto px-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Reina Verde. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
