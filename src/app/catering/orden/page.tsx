"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { EditorialRule, PriceTag } from "@/components/marketing/editorial";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { formatCurrency } from "@/lib/utils";
import { BoldPaymentButton } from "@/components/payment/bold-button";
import { cn } from "@/lib/utils";

interface BoldConfig {
  apiKey: string;
  amount: number;
  currency: "COP" | "USD";
  orderId: string;
  integritySignature: string;
  description?: string;
  tax?: string;
  redirectionUrl?: string;
  customerData?: { email?: string; fullName?: string; phone?: string; dialCode?: string };
  billingAddress?: { address?: string; city?: string; country?: string };
}

const STEPS = ["Items", "Evento", "Pago"] as const;

const EVENT_TYPE_OPTIONS = [
  { value: "CORPORATIVO", label: "Corporativo" },
  { value: "BODA", label: "Boda" },
  { value: "SOCIAL", label: "Social" },
  { value: "SUSCRIPCION", label: "Suscripción" },
  { value: "PRIVADO", label: "Privado" },
];

export default function CateringOrdenPage() {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [loading, setLoading] = useState(false);
  const [boldConfig, setBoldConfig] = useState<BoldConfig | null>(null);
  const { isAuthenticated } = useAuthStore();
  const {
    items, guestCount, eventType, deliveryDate, deliveryTime, deliveryAddress,
    deliveryCity, notes, dietaryNotes, removeItem, updateQuantity, setGuestCount,
    setEventType, setDeliveryInfo, setNotes, setDietaryNotes, subtotal, tax, total,
  } = useCartStore();

  if (items.length === 0) {
    return (
      <>
        <SiteHeader line="catering" />
        <section className="max-w-[1400px] mx-auto px-6 sm:px-10 py-24 sm:py-32 grid place-items-center min-h-[60vh]">
          <div className="max-w-md text-center">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/50">
              Sin items
            </span>
            <h2 className="mt-4 font-display font-light text-5xl sm:text-6xl tracking-[-0.025em] leading-[0.95] text-ink">
              Su orden
              <br />
              <span className="italic">está vacía</span>.
            </h2>
            <Link
              href="/catering/menu"
              className="inline-flex items-center h-12 px-7 mt-10 bg-ink text-cream font-sans text-[14px] rv-press hover:bg-ink-soft"
            >
              Ir a la carta →
            </Link>
          </div>
        </section>
        <SiteFooter />
      </>
    );
  }

  const handlePay = async () => {
    if (!isAuthenticated) {
      toast.error("Inicia sesión para realizar el pedido");
      return;
    }
    if (!deliveryDate || !deliveryTime || !deliveryAddress) {
      toast.error("Completa fecha, hora y dirección");
      setStep(1);
      return;
    }
    setLoading(true);
    try {
      const itemsSummary = items.map((i) => `${i.quantity}x ${i.name}`).join(", ");
      const token = typeof window !== "undefined" ? localStorage.getItem("rv-token") : null;
      const res = await fetch("/api/catering/pay/bold", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
          guestCount,
          eventType,
          deliveryDate,
          deliveryTime,
          deliveryAddress,
          deliveryCity,
          notes,
          dietaryNotes,
          description: `Catering: ${itemsSummary}`.slice(0, 100),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error al configurar pago");
      }
      const data = await res.json();
      setBoldConfig(data);
      setStep(3);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SiteHeader line="catering" />

      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 pt-12">
        <div className="grid grid-cols-12 gap-x-6 mb-10">
          <div className="col-span-12 lg:col-span-3 mb-4 lg:mb-0">
            <EditorialRule index="04" label="Cotización" />
          </div>
          <div className="col-span-12 lg:col-span-9">
            <h1 className="font-display font-light tracking-[-0.03em] leading-[0.92] text-ink text-5xl sm:text-6xl lg:text-7xl">
              Su orden,
              <br />
              <span className="italic">en tres pasos</span>
              <span className="text-marigold">.</span>
            </h1>
          </div>
        </div>

        <ol className="flex items-center gap-6 sm:gap-12 border-y border-ink/15 py-5 mb-12 overflow-x-auto no-scrollbar">
          {STEPS.map((s, i) => {
            const idx = i; // 0..2 maps to logical step (3 is Bold widget displayed under "Pago")
            const active = step >= 3 ? idx === 2 : idx === step;
            const past = step >= 3 ? idx < 2 : idx < step;
            return (
              <li key={s} className="flex items-center gap-3 whitespace-nowrap">
                <button
                  onClick={() => past && setStep(idx as 0 | 1 | 2)}
                  disabled={!past}
                  className={cn(
                    "font-display tabular text-3xl leading-none transition-colors",
                    past ? "text-ink cursor-pointer" : "",
                    active ? "text-marigold" : "",
                    !active && !past ? "text-ink/30" : "",
                  )}
                >
                  {String(idx + 1).padStart(2, "0")}
                </button>
                <span
                  className={cn(
                    "font-mono text-[11px] uppercase tracking-[0.22em]",
                    active ? "text-ink" : "text-ink/50",
                  )}
                >
                  {s}
                </span>
                {i < STEPS.length - 1 && <span className="text-ink/30">/</span>}
              </li>
            );
          })}
        </ol>

        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-10 lg:gap-16">
          <div>
            {/* STEP 0 — Items */}
            {step === 0 && (
              <div className="border-t border-ink/15">
                {items.map((item, i) => (
                  <div key={item.menuItemId} className="flex items-center gap-5 py-6 border-b border-ink/15">
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink/50 w-10">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="h-16 w-16 bg-cream-warm border border-ink/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-ink/40 text-2xl">restaurant</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-xl text-ink leading-tight truncate">{item.name}</h3>
                      <p className="font-mono text-[11px] uppercase tracking-wider text-ink/55 mt-1">
                        {formatCurrency(item.unitPrice)} c/u
                      </p>
                    </div>
                    <div className="flex items-center border border-ink/30">
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                        className="h-9 w-9 hover:bg-ink hover:text-cream transition-colors"
                      >
                        −
                      </button>
                      <span className="w-9 text-center font-mono text-sm tabular">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                        className="h-9 w-9 hover:bg-ink hover:text-cream transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="hidden sm:inline w-28 text-right">
                      <PriceTag amount={item.unitPrice * item.quantity} className="text-xl" />
                    </span>
                    <button
                      onClick={() => removeItem(item.menuItemId)}
                      aria-label="Quitar"
                      className="text-ink/40 hover:text-error transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* STEP 1 — Event details */}
            {step === 1 && (
              <div className="space-y-6 max-w-2xl">
                <p className="font-serif italic text-lg text-ink/70 leading-snug">
                  La precisión del evento determina la precisión de la cocina. Estos campos viajan
                  directo a la ficha de producción y a la coordinación logística.
                </p>
                <div className="grid sm:grid-cols-2 gap-6">
                  <Select
                    id="eventType"
                    label="Tipo de evento"
                    options={EVENT_TYPE_OPTIONS}
                    placeholder="Seleccionar..."
                    value={eventType || ""}
                    onChange={(e) => setEventType(e.target.value || null)}
                  />
                  <Input
                    id="guests"
                    label="Comensales"
                    type="number"
                    min={1}
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <Input
                    id="date"
                    label="Fecha de entrega"
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryInfo({ date: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                  <Input
                    id="time"
                    label="Hora de entrega"
                    type="time"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryInfo({ time: e.target.value })}
                    required
                  />
                </div>
                <Input
                  id="address"
                  label="Dirección de entrega"
                  placeholder="Calle 100 #15-20, Oficina 501"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryInfo({ address: e.target.value })}
                  required
                />
                <Input
                  id="city"
                  label="Ciudad"
                  placeholder="Bogotá"
                  value={deliveryCity}
                  onChange={(e) => setDeliveryInfo({ city: e.target.value })}
                />
                <Textarea
                  id="notes"
                  label="Notas operativas (opcional)"
                  placeholder="Acceso al edificio, parqueadero, contacto en sitio..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <Textarea
                  id="dietary"
                  label="Restricciones alimenticias (opcional)"
                  placeholder="Alergias, intolerancias, preferencias por comensal..."
                  value={dietaryNotes}
                  onChange={(e) => setDietaryNotes(e.target.value)}
                />
              </div>
            )}

            {/* STEP 2 — Review before Bold */}
            {step === 2 && (
              <div className="space-y-8 max-w-2xl">
                <div className="border border-ink/15 p-7">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-marigold">
                    Resumen del evento
                  </span>
                  <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-[15px]">
                    <dt className="font-mono text-[10.5px] uppercase tracking-wider text-ink/55">Tipo</dt>
                    <dd className="font-serif text-ink">{eventType || "—"}</dd>
                    <dt className="font-mono text-[10.5px] uppercase tracking-wider text-ink/55">Comensales</dt>
                    <dd className="font-serif text-ink tabular">{guestCount}</dd>
                    <dt className="font-mono text-[10.5px] uppercase tracking-wider text-ink/55">Fecha</dt>
                    <dd className="font-serif text-ink">{deliveryDate || "—"}</dd>
                    <dt className="font-mono text-[10.5px] uppercase tracking-wider text-ink/55">Hora</dt>
                    <dd className="font-serif text-ink">{deliveryTime || "—"}</dd>
                    <dt className="font-mono text-[10.5px] uppercase tracking-wider text-ink/55">Dirección</dt>
                    <dd className="font-serif text-ink">{deliveryAddress || "—"}, {deliveryCity}</dd>
                  </dl>
                </div>
                <p className="font-serif italic text-[15px] text-ink/65 leading-snug">
                  Al confirmar pasamos al ambiente seguro de Bold. La transacción incluye
                  firma de integridad y un webhook actualiza el estado de la orden sin demora.
                </p>
              </div>
            )}

            {/* STEP 3 — Bold widget */}
            {step === 3 && boldConfig && (
              <div className="space-y-8 max-w-2xl">
                <div className="border border-ink/15 p-8 bg-cream-warm">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-marigold">
                    Bold · Procesador autorizado
                  </span>
                  <h3 className="mt-3 font-display text-3xl tracking-tight text-ink leading-tight">
                    Pagar <PriceTag amount={total()} className="text-3xl" />
                  </h3>
                  <p className="mt-3 font-serif italic text-[15px] text-ink/65 leading-snug">
                    Tarjeta crédito/débito, PSE, Nequi, Daviplata. Firma SHA-256 y
                    redirección automática al confirmar el pago.
                  </p>
                  <div className="mt-6">
                    <BoldPaymentButton
                      apiKey={boldConfig.apiKey}
                      amount={boldConfig.amount}
                      currency={boldConfig.currency}
                      orderId={boldConfig.orderId}
                      integritySignature={boldConfig.integritySignature}
                      description={boldConfig.description}
                      tax={boldConfig.tax}
                      redirectionUrl={boldConfig.redirectionUrl}
                      customerData={boldConfig.customerData}
                      billingAddress={boldConfig.billingAddress}
                      buttonStyle="dark-L"
                      onReady={() => toast.success("Bold listo · da click para pagar")}
                      onError={(m) => toast.error(m)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 self-start border border-ink/15 bg-cream-warm">
            <div className="px-7 py-6 border-b border-ink/15 flex items-baseline justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55">
                Cotización
              </span>
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink/50">
                {items.length} item{items.length === 1 ? "" : "s"}
              </span>
            </div>
            <ul className="px-7 py-5 space-y-3 text-[14px] max-h-64 overflow-y-auto">
              {items.map((i) => (
                <li key={i.menuItemId} className="flex justify-between gap-3">
                  <span className="text-ink/75 truncate">
                    <span className="text-ink/45">{i.quantity}×</span> {i.name}
                  </span>
                  <span className="tabular text-ink">
                    {formatCurrency(i.unitPrice * i.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="px-7 py-5 border-t border-ink/15 space-y-3 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-ink/70">Sub-total</dt>
                <dd className="tabular text-ink">{formatCurrency(subtotal())}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/70">IVA 19%</dt>
                <dd className="tabular text-ink">{formatCurrency(tax())}</dd>
              </div>
            </dl>
            <div className="px-7 py-5 border-t border-ink/15 flex items-end justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55">
                Total
              </span>
              <PriceTag amount={total()} className="text-3xl sm:text-4xl" />
            </div>
            <div className="px-7 py-5 border-t border-ink/15 space-y-3">
              {step === 0 && (
                <button
                  onClick={() => setStep(1)}
                  className="block w-full h-12 bg-ink text-cream font-sans text-[14px] tracking-tight rv-press hover:bg-ink-soft"
                >
                  Detalles del evento →
                </button>
              )}
              {step === 1 && (
                <>
                  <button
                    onClick={() => setStep(2)}
                    className="block w-full h-12 bg-ink text-cream font-sans text-[14px] tracking-tight rv-press hover:bg-ink-soft"
                  >
                    Revisar →
                  </button>
                  <button
                    onClick={() => setStep(0)}
                    className="block w-full h-12 border border-ink/30 font-sans text-[13px] text-ink hover:border-ink hover:bg-ink hover:text-cream transition-colors"
                  >
                    ← Volver
                  </button>
                </>
              )}
              {step === 2 && (
                <>
                  <button
                    onClick={handlePay}
                    disabled={loading}
                    className="block w-full h-12 bg-marigold text-ink font-sans text-[14px] tracking-tight rv-press hover:bg-marigold-deep hover:text-cream disabled:opacity-50"
                  >
                    {loading ? "Preparando pago…" : "Pagar con Bold →"}
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="block w-full h-12 border border-ink/30 font-sans text-[13px] text-ink hover:border-ink hover:bg-ink hover:text-cream transition-colors"
                  >
                    ← Editar detalles
                  </button>
                </>
              )}
              {step === 3 && (
                <button
                  onClick={() => setStep(2)}
                  className="block w-full h-12 border border-ink/30 font-sans text-[13px] text-ink hover:border-ink hover:bg-ink hover:text-cream transition-colors"
                >
                  ← Editar resumen
                </button>
              )}
            </div>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
