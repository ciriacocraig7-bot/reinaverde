"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useLiofilizadosCart } from "@/stores/shop-cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { BoldPaymentButton } from "@/components/payment/bold-button";

const STEPS = ["Carrito", "Envío", "Pago"];

interface BoldConfig {
  apiKey: string;
  amount: number;
  currency: "COP" | "USD";
  orderId: string;
  integritySignature: string;
  description?: string;
  tax?: string;
  redirectionUrl?: string;
  customerData?: {
    email?: string;
    fullName?: string;
    phone?: string;
    dialCode?: string;
    documentNumber?: string;
    documentType?: "CC" | "CE" | "NIT" | "PP" | "TI";
  };
  billingAddress?: {
    address?: string;
    zipCode?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

export default function LiofilizadosCarritoPage() {
  const { items, removeItem, updateQuantity, subtotal, tax, shippingCost, total, itemCount, shipping, setShipping, clearCart } = useLiofilizadosCart();
  const { isAuthenticated } = useAuthStore();
  const [step, setStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [boldConfig, setBoldConfig] = useState<BoldConfig | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  if (items.length === 0) {
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
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-on-surface-variant/30 mb-4" style={{ fontSize: "64px" }}>shopping_cart</span>
            <h2 className="text-xl font-semibold text-on-surface mb-2">Tu carrito está vacío</h2>
            <p className="text-on-surface-variant mb-6">Explora nuestras frutas liofilizadas colombianas</p>
            <Link href="/liofilizados/catalogo" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg shadow-amber-900/10 hover:brightness-110 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-lg">arrow_back</span> Ir al Catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error("Debes iniciar sesión para continuar");
      return;
    }
    setProcessing(true);
    try {
      const token = localStorage.getItem("rv-token");
      // 1. Create shop order via API
      const orderRes = await fetch("/api/shop-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          businessLine: "LIOFILIZADOS",
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          shippingName: shipping.name,
          shippingAddress: shipping.address,
          shippingCity: shipping.city,
          shippingPhone: shipping.phone,
          shippingNotes: shipping.notes || undefined,
          paymentProvider: "BOLD",
        }),
      });
      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error || "Error al crear pedido");
      }
      const { order } = await orderRes.json();
      setOrderId(order.id);

      // 2. Get Bold button config
      const boldRes = await fetch(`/api/shop-orders/${order.id}/pay/bold`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!boldRes.ok) {
        throw new Error("Error al configurar pago con Bold");
      }
      const boldData = await boldRes.json();
      setBoldConfig(boldData);
      setStep(2);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al procesar el pedido");
    } finally {
      setProcessing(false);
    }
  };

  const canProceed = step === 0 || (step === 1 && shipping.name && shipping.address && shipping.city && shipping.phone);

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <nav className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
        <Link href="/liofilizados" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-900/20">
            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>nutrition</span>
          </div>
          <span className="text-xl font-bold tracking-tighter">Reina Verde <span className="text-amber-600">Liofilizados</span></span>
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-8">
        <Link href="/liofilizados/catalogo" className="inline-flex items-center text-sm text-on-surface-variant hover:text-on-surface mb-4 gap-1">
          <span className="material-symbols-outlined text-lg">arrow_back</span> Volver al catálogo
        </Link>
        <h1 className="text-4xl font-semibold tracking-tight mb-6">Tu Carrito</h1>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <button onClick={() => i < step && setStep(i)} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i <= step ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm" : "bg-surface-container-low text-on-surface-variant"}`}>
                {i + 1}
              </button>
              <span className={`ml-2 text-sm font-semibold ${i <= step ? "text-amber-700" : "text-on-surface-variant"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`w-12 h-0.5 mx-3 ${i < step ? "bg-amber-500" : "bg-outline-variant/20"}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {step === 0 && items.map((item) => (
              <div key={item.productId} className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/10 shadow-sm flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-amber-400 text-2xl">{item.icon || "nutrition"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-on-surface text-sm truncate">{item.name}</h3>
                  <p className="text-sm text-amber-700 font-semibold">{formatCurrency(item.unitPrice)}</p>
                  {item.weight && <span className="text-[10px] text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-full">{item.weight}</span>}
                </div>
                <div className="flex items-center border border-outline-variant/20 rounded-xl overflow-hidden">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-2 hover:bg-surface-container-low transition-colors">
                    <span className="material-symbols-outlined text-lg">remove</span>
                  </button>
                  <span className="px-3 text-sm font-bold min-w-[2rem] text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-2 hover:bg-surface-container-low transition-colors">
                    <span className="material-symbols-outlined text-lg">add</span>
                  </button>
                </div>
                <span className="font-bold text-on-surface w-24 text-right">{formatCurrency(item.unitPrice * item.quantity)}</span>
                <button onClick={() => removeItem(item.productId)} className="p-1.5 text-on-surface-variant hover:text-red-500 transition-colors">
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            ))}

            {step === 1 && (
              <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600">local_shipping</span> Información de Envío
                </h2>
                <Input id="name" label="Nombre completo" value={shipping.name} onChange={(e) => setShipping({ name: e.target.value })} required />
                <Input id="address" label="Dirección de envío" value={shipping.address} onChange={(e) => setShipping({ address: e.target.value })} required />
                <div className="grid grid-cols-2 gap-4">
                  <Input id="city" label="Ciudad" value={shipping.city} onChange={(e) => setShipping({ city: e.target.value })} required />
                  <Input id="phone" label="Teléfono" value={shipping.phone} onChange={(e) => setShipping({ phone: e.target.value })} required />
                </div>
                <Input id="notes" label="Notas (opcional)" value={shipping.notes} onChange={(e) => setShipping({ notes: e.target.value })} />
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-sm text-amber-800 flex items-start gap-2">
                  <span className="material-symbols-outlined text-lg mt-0.5">info</span>
                  <p>Envío a toda Colombia. Empaque hermético para conservar frescura. Tiempo estimado: 2-5 días hábiles.</p>
                </div>
              </div>
            )}

            {step === 2 && boldConfig && (
              <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm space-y-6">
                <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600">lock</span> Pago Seguro con Bold
                </h2>
                
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center">
                  <p className="text-sm text-amber-800 mb-2">Total a pagar</p>
                  <p className="text-3xl font-bold text-amber-900">{formatCurrency(total())}</p>
                </div>

                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                  <p className="text-sm text-on-surface-variant mb-4">Haz clic en el botón de abajo para completar tu pago de forma segura:</p>
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
                    onPaymentStarted={() => {
                      clearCart();
                      toast.success("Procesando pago...");
                    }}
                  />
                </div>

                <div className="flex items-center gap-2 p-3 bg-amber-50/50 rounded-lg">
                  <span className="material-symbols-outlined text-amber-500 text-lg">verified</span>
                  <p className="text-xs text-amber-700">Pago procesado de forma segura por Bold.co — Tarjeta, PSE, Nequi, Daviplata</p>
                </div>

                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10 space-y-2">
                  <h3 className="font-bold text-sm">Resumen de envío</h3>
                  <p className="text-sm text-on-surface-variant"><strong>Enviar a:</strong> {shipping.name}</p>
                  <p className="text-sm text-on-surface-variant"><strong>Dirección:</strong> {shipping.address}, {shipping.city}</p>
                  <p className="text-sm text-on-surface-variant"><strong>Teléfono:</strong> {shipping.phone}</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm h-fit sticky top-8">
            <h2 className="text-lg font-bold text-on-surface mb-4">Resumen</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-on-surface-variant">Productos ({itemCount()})</span><span>{formatCurrency(subtotal())}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">IVA (19%)</span><span>{formatCurrency(tax())}</span></div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Envío</span>
                <span>{shippingCost() === 0 ? <span className="text-green-600 font-bold">Gratis</span> : formatCurrency(shippingCost())}</span>
              </div>
              {shippingCost() > 0 && <p className="text-[10px] text-on-surface-variant">Envío gratis en compras mayores a $150.000</p>}
              <hr className="border-outline-variant/10 my-2" />
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-amber-700">{formatCurrency(total())}</span></div>
            </div>
            <div className="mt-6 space-y-3">
              {step === 0 ? (
                <button onClick={() => setStep(1)} className="w-full py-3 px-6 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl font-semibold shadow-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  Continuar <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              ) : step === 1 ? (
                <button onClick={handleCheckout} disabled={!canProceed || processing} className="w-full py-3 px-6 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl font-semibold shadow-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {processing ? <><span className="material-symbols-outlined text-lg animate-spin">progress_activity</span> Preparando pago...</> : <><span className="material-symbols-outlined text-lg">lock</span> Pagar con Bold {formatCurrency(total())}</>}
                </button>
              ) : null}
              {step === 1 && (
                <button onClick={() => setStep(0)} className="w-full py-3 px-6 bg-surface-container-lowest border border-outline-variant/20 text-on-surface rounded-xl font-semibold hover:bg-surface-container-high transition-colors">
                  Volver
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
