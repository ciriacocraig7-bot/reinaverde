"use client";

import Link from "next/link";

export default function LiofilizadosConfirmacionPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <nav className="max-w-7xl mx-auto px-8 py-6 w-full">
        <Link href="/liofilizados" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-900/20">
            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>nutrition</span>
          </div>
          <span className="text-xl font-bold tracking-tighter">Reina Verde <span className="text-amber-600">Liofilizados</span></span>
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/10 shadow-sm editorial-shadow">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-900/20">
            <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-on-surface mb-2">¡Pedido Confirmado!</h1>
          <p className="text-on-surface-variant mb-8">Tu pedido ha sido procesado. Recibirás un correo con los detalles y el número de seguimiento.</p>
          <div className="bg-amber-50 rounded-xl p-4 mb-6 text-sm text-left border border-amber-200">
            <p className="font-bold mb-2 flex items-center gap-2 text-amber-800">
              <span className="material-symbols-outlined text-amber-600 text-lg">info</span> ¿Qué sigue?
            </p>
            <ol className="space-y-1.5 list-decimal list-inside text-amber-700">
              <li>Empacamos tus frutas con sello hermético</li>
              <li>Envío con cadena de conservación</li>
              <li>Recibirás número de seguimiento por email</li>
              <li>Entrega estimada: 2-5 días hábiles</li>
            </ol>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/liofilizados/catalogo" className="flex-1 py-3 px-6 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl font-semibold shadow-sm hover:brightness-110 active:scale-[0.98] transition-all text-center">
              Seguir Comprando
            </Link>
            <Link href="/" className="flex-1 py-3 px-6 bg-surface-container-lowest border border-outline-variant/20 text-on-surface rounded-xl font-semibold hover:bg-surface-container-high transition-colors active:scale-[0.98] text-center">
              Ir al Hub
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
