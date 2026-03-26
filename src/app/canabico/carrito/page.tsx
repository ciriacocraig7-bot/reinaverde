"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useCanabicoCart } from "@/stores/shop-cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const STEPS = ["Carrito", "Envío", "Pago"];

export default function CanabicoCarritoPage() {
  const { items, removeItem, updateQuantity, subtotal, tax, shippingCost, total, itemCount, shipping, setShipping, clearCart } = useCanabicoCart();
  const { isAuthenticated } = useAuthStore();
  const [step, setStep] = useState(0);
  const [processing, setProcessing] = useState(false);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <nav className="max-w-7xl mx-auto px-8 py-6 w-full">
          <Link href="/canabico" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-lg shadow-violet-900/20">
              <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
            </div>
            <span className="text-xl font-bold tracking-tighter">Reina Verde <span className="text-violet-600">Canábico</span></span>
          </Link>
        </nav>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-on-surface-variant/30 mb-4" style={{ fontSize: "64px" }}>shopping_cart</span>
            <h2 className="text-xl font-semibold text-on-surface mb-2">Tu carrito está vacío</h2>
            <p className="text-on-surface-variant mb-6">Explora nuestro catálogo de productos canábicos</p>
            <Link href="/canabico/catalogo" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-violet-600 to-purple-800 text-white rounded-xl font-semibold shadow-lg shadow-violet-900/10 hover:brightness-110 active:scale-95 transition-all">
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
          businessLine: "CANABICO",
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          shippingName: shipping.name,
          shippingAddress: shipping.address,
          shippingCity: shipping.city,
          shippingPhone: shipping.phone,
          shippingNotes: shipping.notes || undefined,
        }),
      });
      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error || "Error al crear pedido");
      }
      const { order } = await orderRes.json();

      // 2. Initiate Wompi payment
      const payRes = await fetch(`/api/shop-orders/${order.id}/pay`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!payRes.ok) {
        // Payment link failed, but order exists — go to confirmation with pending status
        clearCart();
        toast.success("Pedido creado. Pago pendiente.");
        window.location.href = "/canabico/confirmacion";
        return;
      }
      const { paymentUrl } = await payRes.json();
      clearCart();
      // Redirect to Wompi checkout
      window.location.href = paymentUrl;
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
        <Link href="/canabico" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-lg shadow-violet-900/20">
            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
          </div>
          <span className="text-xl font-bold tracking-tighter">Reina Verde <span className="text-violet-600">Canábico</span></span>
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-8">
        <Link href="/canabico/catalogo" className="inline-flex items-center text-sm text-on-surface-variant hover:text-on-surface mb-4 gap-1">
          <span className="material-symbols-outlined text-lg">arrow_back</span> Volver al catálogo
        </Link>
        <h1 className="text-4xl font-semibold tracking-tight mb-6">Tu Carrito</h1>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <button onClick={() => i < step && setStep(i)} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i <= step ? "bg-gradient-to-br from-violet-600 to-purple-800 text-white shadow-sm" : "bg-surface-container-low text-on-surface-variant"}`}>
                {i + 1}
              </button>
              <span className={`ml-2 text-sm font-semibold ${i <= step ? "text-violet-700" : "text-on-surface-variant"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`w-12 h-0.5 mx-3 ${i < step ? "bg-violet-600" : "bg-outline-variant/20"}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {step === 0 && items.map((item) => (
              <div key={item.productId} className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/10 shadow-sm flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-violet-400 text-2xl">{item.icon || "spa"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-on-surface text-sm truncate">{item.name}</h3>
                  <p className="text-sm text-violet-700 font-semibold">{formatCurrency(item.unitPrice)}</p>
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
                  <span className="material-symbols-outlined text-violet-600">local_shipping</span> Información de Envío
                </h2>
                <Input id="name" label="Nombre completo" value={shipping.name} onChange={(e) => setShipping({ name: e.target.value })} required />
                <Input id="address" label="Dirección de envío" value={shipping.address} onChange={(e) => setShipping({ address: e.target.value })} required />
                <div className="grid grid-cols-2 gap-4">
                  <Input id="city" label="Ciudad" value={shipping.city} onChange={(e) => setShipping({ city: e.target.value })} required />
                  <Input id="phone" label="Teléfono" value={shipping.phone} onChange={(e) => setShipping({ phone: e.target.value })} required />
                </div>
                <Input id="notes" label="Notas (opcional)" value={shipping.notes} onChange={(e) => setShipping({ notes: e.target.value })} />
                <div className="p-4 bg-violet-50 rounded-xl border border-violet-200 text-sm text-violet-800 flex items-start gap-2">
                  <span className="material-symbols-outlined text-lg mt-0.5">info</span>
                  <p>Envío discreto en empaque neutro sin marcas visibles. Tiempo estimado: 2-4 días hábiles.</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm space-y-6">
                <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-violet-600">credit_card</span> Método de Pago
                </h2>
                <div className="p-4 bg-violet-50 rounded-xl border border-violet-200">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-violet-600">account_balance</span>
                    <span className="font-bold text-violet-800">Pago con Wompi</span>
                  </div>
                  <p className="text-sm text-violet-700">Tarjeta de crédito, débito, PSE, Nequi y más.</p>
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

          {/* Order Summary Sidebar */}
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
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-violet-700">{formatCurrency(total())}</span></div>
            </div>
            <div className="mt-6 space-y-3">
              {step < 2 ? (
                <button onClick={() => setStep(step + 1)} disabled={!canProceed} className="w-full py-3 px-6 bg-gradient-to-br from-violet-600 to-purple-800 text-white rounded-xl font-semibold shadow-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  Continuar <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              ) : (
                <button onClick={handleCheckout} disabled={processing} className="w-full py-3 px-6 bg-gradient-to-br from-violet-600 to-purple-800 text-white rounded-xl font-semibold shadow-sm hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {processing ? <><span className="material-symbols-outlined text-lg animate-spin">progress_activity</span> Procesando...</> : <><span className="material-symbols-outlined text-lg">lock</span> Pagar {formatCurrency(total())}</>}
                </button>
              )}
              {step > 0 && (
                <button onClick={() => setStep(step - 1)} className="w-full py-3 px-6 bg-surface-container-lowest border border-outline-variant/20 text-on-surface rounded-xl font-semibold hover:bg-surface-container-high transition-colors">
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
