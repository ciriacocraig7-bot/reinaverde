"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";

export default function OrderConfirmationPage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-16 pt-24">
        <div className="w-full max-w-md text-center bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/10 shadow-sm editorial-shadow">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-400 to-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface mb-2">
            ¡Pedido Confirmado!
          </h1>
          <p className="text-on-surface-variant mb-8">
            Tu pago ha sido procesado exitosamente. Recibirás un correo con los detalles de tu pedido.
          </p>
          <div className="bg-primary-fixed/30 rounded-xl p-4 mb-6 text-sm text-on-surface text-left border border-outline-variant/10">
            <p className="font-bold mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">info</span>
              ¿Qué sigue?
            </p>
            <ol className="space-y-1.5 list-decimal list-inside text-on-surface-variant">
              <li>Nuestro equipo de cocina comenzará la preparación</li>
              <li>Recibirás actualizaciones del estado</li>
              <li>Coordinamos la entrega en la fecha acordada</li>
              <li>¡Disfruta tu evento!</li>
            </ol>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/cliente/pedidos" className="flex-1 py-3 px-6 bg-gradient-to-br from-primary-container to-primary text-on-primary rounded-xl font-semibold shadow-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              Ver Mis Pedidos <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
            <Link href="/catering/menu" className="flex-1 py-3 px-6 bg-surface-container-lowest border border-outline-variant/20 text-on-surface rounded-xl font-semibold hover:bg-surface-container-high transition-colors active:scale-[0.98] text-center">
              Volver al Menú
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
