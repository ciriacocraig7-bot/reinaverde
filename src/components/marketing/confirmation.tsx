"use client";

import Link from "next/link";
import { useEffect } from "react";
import { EditorialRule } from "@/components/marketing/editorial";
import { useCartStore } from "@/stores/cart-store";
import { usePharmaCart, useLiofilizadosCart } from "@/stores/shop-cart-store";

type Variant = "pharma" | "liofilizados" | "catering";

const ACCENT: Record<Variant, { color: string; bg: string; catalogo: string; catLabel: string }> = {
  pharma:       { color: "text-iris",      bg: "bg-iris",      catalogo: "/pharma/catalogo",       catLabel: "Pharma" },
  liofilizados: { color: "text-persimmon", bg: "bg-persimmon", catalogo: "/liofilizados/catalogo", catLabel: "Liofilizados" },
  catering:     { color: "text-marigold",  bg: "bg-marigold",  catalogo: "/catering/menu",         catLabel: "Catering" },
};

const NEXT_STEPS: Record<Variant, string[]> = {
  pharma: [
    "Su pedido entra a la cola de despacho.",
    "Empaque neutro sin marca exterior.",
    "Tracking enviado por correo en 24h.",
    "Entrega estimada: 2 a 4 días hábiles.",
  ],
  liofilizados: [
    "Empacamos con sello hermético inerte.",
    "Despacho con cadena de conservación.",
    "Tracking enviado por correo en 24h.",
    "Entrega estimada: 2 a 5 días hábiles.",
  ],
  catering: [
    "El equipo de producción recibe la orden.",
    "Confirmación de menú y horarios en 24h.",
    "Factura electrónica DIAN al evento.",
    "Coordinación de logística 72h antes.",
  ],
};

export function PaymentConfirmation({ variant }: { variant: Variant }) {
  const accent = ACCENT[variant];

  // Limpiar el carrito correspondiente al llegar a la página de confirmación.
  // Esto reemplaza el viejo clearCart() en onPaymentStarted que vaciaba el
  // carrito antes de que el usuario llegara al checkout de Bold.
  const clearCatering = useCartStore((s) => s.clearCart);
  const clearPharma = usePharmaCart((s) => s.clearCart);
  const clearLiofilizados = useLiofilizadosCart((s) => s.clearCart);

  useEffect(() => {
    if (variant === "catering") clearCatering();
    if (variant === "pharma") clearPharma();
    if (variant === "liofilizados") clearLiofilizados();
  }, [variant, clearCatering, clearPharma, clearLiofilizados]);

  return (
    <section className="max-w-[1400px] mx-auto px-6 sm:px-10 py-20 sm:py-32">
      <div className="grid grid-cols-12 gap-x-6">
        {/* Left rail */}
        <div className="col-span-12 lg:col-span-3 mb-10 lg:mb-0">
          <EditorialRule index="05" label="Confirmación" />
          <p className={`mt-6 font-mono text-[11px] uppercase tracking-[0.22em] ${accent.color}`}>
            Pago recibido
          </p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55">
            División {accent.catLabel}
          </p>
        </div>

        {/* Main */}
        <div className="col-span-12 lg:col-span-9">
          <h1 className="font-display font-light tracking-[-0.035em] leading-[0.92] text-ink text-6xl sm:text-7xl lg:text-[120px]">
            Gracias.
            <br />
            <span className="italic">Recibimos su pedido</span>
            <span className={accent.color}>.</span>
          </h1>

          <p className="mt-10 font-serif italic text-xl sm:text-2xl leading-snug text-ink/75 max-w-2xl">
            La transacción quedó confirmada por Bold. En las próximas horas recibirá un correo
            con el comprobante de pago y el resumen de su pedido.
          </p>

          {/* Next steps as numbered editorial list */}
          <div className="mt-16 max-w-3xl">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55 mb-6">
              Qué sigue
            </p>
            <ol className="border-t border-ink/15">
              {NEXT_STEPS[variant].map((s, i) => (
                <li
                  key={s}
                  className="grid grid-cols-[60px_1fr] sm:grid-cols-[100px_1fr] gap-x-6 py-5 border-b border-ink/15"
                >
                  <span className="font-display text-3xl text-ink/40 tabular leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-serif text-lg leading-snug text-ink/85">{s}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              href={accent.catalogo}
              className={`inline-flex items-center h-12 px-7 ${accent.bg} text-cream font-sans text-[14px] tracking-tight rv-press`}
            >
              Seguir explorando →
            </Link>
            <Link
              href="/cliente"
              className="inline-flex items-center h-12 px-7 border border-ink/40 text-ink font-sans text-[14px] tracking-tight hover:border-ink hover:bg-ink hover:text-cream transition-colors"
            >
              Ir a mi panel
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
