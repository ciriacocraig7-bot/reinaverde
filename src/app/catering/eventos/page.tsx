"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";

const EVENT_TYPES = [
  { icon: "apartment", title: "Corporativo", description: "Almuerzos ejecutivos, desayunos de trabajo, coffee breaks, team buildings y conferencias.", features: ["Menús ejecutivos", "Facturación empresarial", "Servicio recurrente", "Personalización por departamento"] },
  { icon: "favorite", title: "Bodas", description: "Banquetes completos para tu día especial con servicio de meseros y coordinación total.", features: ["Menú degustación", "Servicio de meseros", "Decoración coordinada", "Timeline del evento"] },
  { icon: "celebration", title: "Social", description: "Cumpleaños, reuniones familiares, celebraciones y todo tipo de eventos sociales.", features: ["Menús temáticos", "Paquetes flexibles", "Opciones para niños", "Postre personalizado"] },
  { icon: "schedule", title: "Suscripción Empresarial", description: "Planes de alimentación recurrente para empresas con entrega programada.", features: ["Entrega diaria/semanal", "Menú rotativo", "Descuentos por volumen", "Dashboard empresarial"] },
];

const PROCESS_STEPS = [
  { step: "1", title: "Cuéntanos tu evento", desc: "Tipo, fecha, número de invitados y preferencias", icon: "edit_note" },
  { step: "2", title: "Diseñamos tu menú", desc: "Propuesta personalizada con opciones para todos", icon: "restaurant_menu" },
  { step: "3", title: "Cotización inmediata", desc: "Precio transparente sin costos ocultos", icon: "receipt_long" },
  { step: "4", title: "Confirma y paga", desc: "Pago seguro con múltiples opciones", icon: "credit_card" },
  { step: "5", title: "Nosotros nos encargamos", desc: "Producción, logística y servicio completo", icon: "local_shipping" },
  { step: "6", title: "Disfruta tu evento", desc: "Solo preocúpate por pasarla bien", icon: "celebration" },
];

export default function EventosPage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/20 via-surface to-surface pointer-events-none" />
        <div className="max-w-7xl mx-auto px-8 text-center relative z-10">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-container mb-4 block">Experiencias Culinarias</span>
          <h1 className="text-5xl sm:text-6xl font-semibold text-on-surface tracking-tight leading-tight">
            Eventos que<br />dejan huella
          </h1>
          <p className="mt-6 text-lg text-on-surface-variant max-w-2xl mx-auto">
            Desde un desayuno corporativo hasta una boda de ensueño. Nos adaptamos a tu evento con un servicio completo y automatizado.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catering/menu" className="px-8 py-3.5 bg-gradient-to-br from-primary-container to-primary text-on-primary rounded-xl font-semibold shadow-lg shadow-primary/10 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2">
              Comenzar Pedido <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
            <Link href="/registro" className="px-8 py-3.5 bg-surface-container-lowest text-on-surface rounded-xl font-semibold border border-outline-variant/20 shadow-sm hover:bg-surface-container-high transition-colors active:scale-95">
              Solicitar Cotización
            </Link>
          </div>
        </div>
      </section>

      {/* Event Types */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-container mb-2 block">Especialización</span>
            <h2 className="text-3xl font-semibold tracking-tight text-on-surface">Tipos de Eventos</h2>
            <p className="mt-3 text-on-surface-variant">Experiencia especializada para cada ocasión</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {EVENT_TYPES.map((type) => (
              <div key={type.title} className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 shadow-sm hover:translate-y-[-2px] transition-all duration-300 group">
                <div className="inline-flex p-4 rounded-2xl bg-primary-fixed mb-4">
                  <span className="material-symbols-outlined text-primary text-3xl">{type.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-2">{type.title}</h3>
                <p className="text-on-surface-variant mb-4">{type.description}</p>
                <ul className="space-y-2">
                  {type.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-container mb-2 block">Workflow</span>
            <h2 className="text-3xl font-semibold tracking-tight text-on-surface">Nuestro Proceso</h2>
            <p className="mt-3 text-on-surface-variant">Simple, rápido y totalmente automatizado</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {PROCESS_STEPS.map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-container to-primary text-on-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/10">
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-on-surface">{item.title}</h3>
                  <p className="text-sm text-on-surface-variant mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-container relative overflow-hidden">
        <div className="absolute top-0 right-0 h-full w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-16">
          <span className="material-symbols-outlined" style={{ fontSize: "200px", fontVariationSettings: "'FILL' 1" }}>event</span>
        </div>
        <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">¿Tienes un evento próximo?</h2>
          <p className="text-on-primary-container mb-8">Cotiza en menos de 3 minutos y recibe una propuesta personalizada.</p>
          <Link href="/catering/menu" className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-3.5 rounded-xl shadow-lg hover:bg-emerald-50 transition-colors active:scale-95">
            Cotizar Ahora <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-inverse-surface text-inverse-on-surface py-8">
        <div className="max-w-7xl mx-auto px-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Reina Verde. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
