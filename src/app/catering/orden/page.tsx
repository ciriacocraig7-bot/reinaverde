"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { formatCurrency } from "@/lib/utils";

const STEPS = ["Resumen", "Detalles", "Pago"];

const EVENT_TYPE_OPTIONS = [
  { value: "CORPORATIVO", label: "Corporativo" },
  { value: "BODA", label: "Boda" },
  { value: "SOCIAL", label: "Social" },
  { value: "SUSCRIPCION", label: "Suscripción" },
  { value: "PRIVADO", label: "Privado" },
];

export default function OrderPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const {
    items,
    guestCount,
    eventType,
    deliveryDate,
    deliveryTime,
    deliveryAddress,
    deliveryCity,
    notes,
    dietaryNotes,
    removeItem,
    updateQuantity,
    setGuestCount,
    setEventType,
    setDeliveryInfo,
    setNotes,
    setDietaryNotes,
    subtotal,
    tax,
    total,
    clearCart,
  } = useCartStore();

  const handlePay = async () => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para realizar un pedido");
      return;
    }

    if (!deliveryDate || !deliveryTime || !deliveryAddress) {
      toast.error("Completa todos los datos de entrega");
      setStep(1);
      return;
    }

    setLoading(true);

    try {
      const WOMPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;
      const reference = `RV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const amountInCents = total() * 100;

      if (WOMPI_PUBLIC_KEY) {
        const checkoutUrl = new URL("https://checkout.wompi.co/p/");
        checkoutUrl.searchParams.set("public-key", WOMPI_PUBLIC_KEY);
        checkoutUrl.searchParams.set("currency", "COP");
        checkoutUrl.searchParams.set("amount-in-cents", amountInCents.toString());
        checkoutUrl.searchParams.set("reference", reference);
        checkoutUrl.searchParams.set("redirect-url", `${window.location.origin}/orden/confirmacion`);

        window.location.href = checkoutUrl.toString();
      } else {
        toast.success("Pedido creado exitosamente. Referencia: " + reference);
        clearCart();
      }
    } catch {
      toast.error("Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-surface">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="text-center">
            <span className="material-symbols-outlined text-on-surface-variant/30 mb-4" style={{ fontSize: "64px" }}>shopping_cart</span>
            <h2 className="text-xl font-semibold text-on-surface mb-2">Tu carrito está vacío</h2>
            <p className="text-on-surface-variant mb-6">Agrega platos desde nuestro menú</p>
            <Link href="/catering/menu" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-primary-container to-primary text-on-primary rounded-xl font-semibold shadow-lg shadow-primary/10 hover:brightness-110 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Ir al Menú
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const STEP_ICONS = ["shopping_cart", "edit_note", "credit_card"];

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Navbar />

      <div className="max-w-5xl mx-auto px-8 py-8 w-full pt-24">
        {/* Header */}
        <div className="mb-8">
          <Link href="/catering/menu" className="inline-flex items-center text-sm text-on-surface-variant hover:text-on-surface mb-4 gap-1">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Volver al menú
          </Link>
          <h1 className="text-4xl font-semibold tracking-tight text-on-surface">Tu Pedido</h1>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <button
                onClick={() => setStep(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                  step === i
                    ? "bg-gradient-to-br from-primary-container to-primary text-on-primary shadow-sm"
                    : step > i
                    ? "bg-primary-fixed text-primary"
                    : "bg-surface-container-low text-on-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined text-lg">{STEP_ICONS[i]}</span>
                <span className="hidden sm:inline">{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-1 ${step > i ? "bg-primary" : "bg-outline-variant/20"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {step === 0 && (
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-outline-variant/5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant">shopping_cart</span>
                  <h4 className="text-lg font-semibold tracking-tight">Items del Pedido</h4>
                </div>
                <div className="p-6 space-y-4">
                  {items.map((item) => (
                    <div key={item.menuItemId} className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl">
                      <div className="h-14 w-14 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary text-2xl">restaurant</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-on-surface truncate">{item.name}</h4>
                        <p className="text-sm text-on-surface-variant">{formatCurrency(item.unitPrice)} c/u</p>
                      </div>
                      <div className="flex items-center border border-outline-variant/20 rounded-xl overflow-hidden bg-surface-container-lowest">
                        <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} className="p-1.5 hover:bg-surface-container-low transition-colors">
                          <span className="material-symbols-outlined text-lg">remove</span>
                        </button>
                        <span className="px-3 text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} className="p-1.5 hover:bg-surface-container-low transition-colors">
                          <span className="material-symbols-outlined text-lg">add</span>
                        </button>
                      </div>
                      <span className="font-semibold text-on-surface w-24 text-right">{formatCurrency(item.unitPrice * item.quantity)}</span>
                      <button onClick={() => removeItem(item.menuItemId)} className="p-1.5 text-error/60 hover:text-error hover:bg-red-50 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  ))}
                  <div className="pt-4">
                    <button onClick={() => setStep(1)} className="w-full py-3 px-6 bg-gradient-to-br from-primary-container to-primary text-on-primary rounded-xl font-semibold shadow-sm hover:brightness-110 active:scale-[0.98] transition-all">
                      Continuar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-outline-variant/5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant">edit_note</span>
                  <h4 className="text-lg font-semibold tracking-tight">Detalles del Evento</h4>
                </div>
                <div className="p-6 space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Select
                      id="eventType"
                      label="Tipo de Evento"
                      options={EVENT_TYPE_OPTIONS}
                      placeholder="Seleccionar..."
                      value={eventType || ""}
                      onChange={(e) => setEventType(e.target.value || null)}
                    />
                    <Input
                      id="guests"
                      label="Número de Invitados"
                      type="number"
                      min={1}
                      value={guestCount}
                      onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      id="date"
                      label="Fecha de Entrega"
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryInfo({ date: e.target.value })}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                    <Input
                      id="time"
                      label="Hora de Entrega"
                      type="time"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryInfo({ time: e.target.value })}
                      required
                    />
                  </div>
                  <Input
                    id="address"
                    label="Dirección de Entrega"
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
                    label="Notas adicionales (opcional)"
                    placeholder="Instrucciones especiales, acceso al edificio, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <Textarea
                    id="dietary"
                    label="Restricciones alimenticias (opcional)"
                    placeholder="Alergias, intolerancias, preferencias..."
                    value={dietaryNotes}
                    onChange={(e) => setDietaryNotes(e.target.value)}
                  />
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setStep(0)} className="flex-1 py-3 px-6 bg-surface-container-lowest border border-outline-variant/20 text-on-surface rounded-xl font-semibold hover:bg-surface-container-high transition-colors active:scale-[0.98]">Atrás</button>
                    <button onClick={() => setStep(2)} className="flex-1 py-3 px-6 bg-gradient-to-br from-primary-container to-primary text-on-primary rounded-xl font-semibold shadow-sm hover:brightness-110 active:scale-[0.98] transition-all">Continuar al Pago</button>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-outline-variant/5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant">credit_card</span>
                  <h4 className="text-lg font-semibold tracking-tight">Método de Pago</h4>
                </div>
                <div className="p-6 space-y-6">
                  <div className="bg-primary-fixed/30 border border-outline-variant/10 rounded-xl p-4 flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-0.5">verified_user</span>
                    <div>
                      <h4 className="font-bold text-on-surface mb-1">Pago seguro con Wompi</h4>
                      <p className="text-sm text-on-surface-variant">Aceptamos tarjetas de crédito/débito, PSE, Nequi y otros medios de pago. Serás redirigido al checkout seguro de Wompi.</p>
                    </div>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-5 space-y-2">
                    <h4 className="font-bold text-on-surface mb-3 text-sm uppercase tracking-widest">Resumen del Evento</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-on-surface-variant">Tipo:</span>
                      <span className="font-medium">{eventType || "No especificado"}</span>
                      <span className="text-on-surface-variant">Invitados:</span>
                      <span className="font-medium">{guestCount}</span>
                      <span className="text-on-surface-variant">Fecha:</span>
                      <span className="font-medium">{deliveryDate || "No especificada"}</span>
                      <span className="text-on-surface-variant">Hora:</span>
                      <span className="font-medium">{deliveryTime || "No especificada"}</span>
                      <span className="text-on-surface-variant">Dirección:</span>
                      <span className="font-medium">{deliveryAddress || "No especificada"}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="flex-1 py-3 px-6 bg-surface-container-lowest border border-outline-variant/20 text-on-surface rounded-xl font-semibold hover:bg-surface-container-high transition-colors active:scale-[0.98]">Atrás</button>
                    <button onClick={handlePay} disabled={loading} className="flex-1 py-3 px-6 bg-gradient-to-br from-primary-container to-primary text-on-primary rounded-xl font-semibold shadow-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {loading ? (
                        <><span className="material-symbols-outlined text-lg animate-spin">progress_activity</span> Procesando...</>
                      ) : (
                        <><span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span> Pagar {formatCurrency(total())}</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-outline-variant/5">
                <h4 className="font-semibold tracking-tight">Resumen</h4>
              </div>
              <div className="p-5 space-y-4">
                {items.map((item) => (
                  <div key={item.menuItemId} className="flex justify-between text-sm">
                    <span className="text-on-surface-variant truncate mr-2">{item.quantity}x {item.name}</span>
                    <span className="font-medium whitespace-nowrap">{formatCurrency(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
                <hr className="border-outline-variant/10" />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Subtotal</span>
                    <span>{formatCurrency(subtotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">IVA (19%)</span>
                    <span>{formatCurrency(tax())}</span>
                  </div>
                  <hr className="border-outline-variant/10" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary-container">{formatCurrency(total())}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
