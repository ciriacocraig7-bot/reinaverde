"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useLiofilizadosCart } from "@/stores/shop-cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { BoldPaymentButton } from "@/components/payment/bold-button";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { EditorialRule, PriceTag } from "@/components/marketing/editorial";
import { cn } from "@/lib/utils";

const STEPS = ["Pedido", "Envío", "Pago"] as const;

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
  const {
    items, removeItem, updateQuantity, subtotal, tax, shippingCost, total,
    itemCount, shipping, setShipping, guest, setGuest,
  } = useLiofilizadosCart();
  const { isAuthenticated, user } = useAuthStore();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [processing, setProcessing] = useState(false);
  const [boldConfig, setBoldConfig] = useState<BoldConfig | null>(null);

  if (items.length === 0) {
    return (
      <>
        <SiteHeader line="liofilizados" />
        <section className="max-w-[1400px] mx-auto px-6 sm:px-10 py-24 sm:py-32 grid place-items-center min-h-[60vh]">
          <div className="max-w-md text-center">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/50">
              Carrito vacío
            </span>
            <h2 className="mt-4 font-display font-light text-5xl sm:text-6xl tracking-[-0.025em] leading-[0.95] text-ink">
              Aún no
              <br />
              <span className="italic">has elegido</span>
              <br />
              ninguna fruta.
            </h2>
            <Link
              href="/liofilizados/catalogo"
              className="inline-flex items-center h-12 px-7 mt-10 bg-ink text-cream font-sans text-[14px] rv-press hover:bg-ink-soft"
            >
              Explorar catálogo →
            </Link>
          </div>
        </section>
        <SiteFooter />
      </>
    );
  }

  const handleCheckout = async () => {
    // Si NO está autenticado, validamos los campos guest
    if (!isAuthenticated) {
      if (!guest.email || !guest.firstName || !guest.lastName) {
        toast.error("Completa tu correo y nombre para continuar");
        return;
      }
    }
    setProcessing(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("rv-token") : null;
      const orderRes = await fetch("/api/shop-orders", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          businessLine: "LIOFILIZADOS",
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          shippingName: shipping.name,
          shippingAddress: shipping.address,
          shippingCity: shipping.city,
          shippingPhone: shipping.phone,
          shippingNotes: shipping.notes || undefined,
          paymentProvider: "BOLD",
          // Solo enviamos guest cuando no hay sesión
          ...(isAuthenticated
            ? {}
            : { guest: { email: guest.email, firstName: guest.firstName, lastName: guest.lastName } }),
        }),
      });
      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error || "Error al crear pedido");
      }
      const { order } = await orderRes.json();

      const boldRes = await fetch(`/api/shop-orders/${order.id}/pay/bold`, {
        method: "POST",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!boldRes.ok) throw new Error("Error al configurar pago con Bold");
      const boldData = await boldRes.json();
      setBoldConfig(boldData);
      setStep(2);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al procesar el pedido");
    } finally {
      setProcessing(false);
    }
  };

  const canProceedShipping =
    !!shipping.name && !!shipping.address && !!shipping.city &&
    (isAuthenticated || (!!guest.email && !!guest.firstName && !!guest.lastName));

  return (
    <>
      <SiteHeader line="liofilizados" />

      {/* Escape strip — siempre visible */}
      <div className="bg-cream-warm/60 border-b border-ink/10 sticky top-[64px] sm:top-[68px] z-30 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-2 flex items-baseline justify-between gap-4 flex-wrap text-[12px] sm:text-[13px]">
          <div className="flex items-baseline gap-4">
            <Link href="/" className="font-mono uppercase tracking-[0.22em] text-ink/65 hover:text-ink transition-colors">
              ← Inicio
            </Link>
            <span className="text-ink/25">·</span>
            <Link href="/liofilizados" className="font-mono uppercase tracking-[0.22em] text-ink/65 hover:text-ink transition-colors">
              Liofilizados
            </Link>
            <span className="text-ink/25">·</span>
            <Link href="/liofilizados/catalogo" className="font-mono uppercase tracking-[0.22em] text-ink/65 hover:text-ink transition-colors">
              Catálogo
            </Link>
            <span className="text-ink/25">·</span>
            <span className="font-mono uppercase tracking-[0.22em] text-persimmon">Checkout</span>
          </div>
          <Link
            href="/liofilizados/catalogo"
            className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55 hover:text-ink transition-colors"
          >
            Seguir comprando
          </Link>
        </div>
      </div>

      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 pt-12">
        {/* Header row */}
        <div className="grid grid-cols-12 gap-x-6 mb-10">
          <div className="col-span-12 lg:col-span-3 mb-4 lg:mb-0">
            <EditorialRule index="04" label="Checkout" />
          </div>
          <div className="col-span-12 lg:col-span-9">
            <h1 className="font-display font-light tracking-[-0.03em] leading-[0.92] text-ink text-5xl sm:text-6xl lg:text-7xl">
              Su pedido,
              <br />
              <span className="italic">en tres pasos</span>
              <span className="text-persimmon">.</span>
            </h1>
          </div>
        </div>

        {/* Step indicator — editorial */}
        <ol className="flex items-center gap-6 sm:gap-12 border-y border-ink/15 py-5 mb-12 overflow-x-auto no-scrollbar">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-3 whitespace-nowrap">
              <button
                onClick={() => i < step && setStep(i as 0 | 1 | 2)}
                disabled={i > step}
                className={cn(
                  "font-display tabular text-3xl leading-none transition-colors",
                  i < step ? "text-ink cursor-pointer" : "",
                  i === step ? "text-persimmon" : "",
                  i > step ? "text-ink/30" : "",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </button>
              <span
                className={cn(
                  "font-mono text-[11px] uppercase tracking-[0.22em]",
                  i === step ? "text-ink" : "text-ink/50",
                )}
              >
                {s}
              </span>
              {i < STEPS.length - 1 && <span className="text-ink/30">/</span>}
            </li>
          ))}
        </ol>

        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-10 lg:gap-16">
          {/* Main column */}
          <div>
            {step === 0 && (
              <div className="border-t border-ink/15">
                {items.map((item, i) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-5 py-6 border-b border-ink/15"
                  >
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink/50 w-10">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="h-16 w-16 bg-cream-warm border border-ink/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-ink/40 text-2xl">
                        {item.icon || "nutrition"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-xl text-ink leading-tight truncate">
                        {item.name}
                      </h3>
                      <p className="font-mono text-[11px] uppercase tracking-wider text-ink/55 mt-1">
                        {item.weight && `${item.weight} · `}
                        {formatCurrency(item.unitPrice)} c/u
                      </p>
                    </div>
                    {/* Quantity stepper */}
                    <div className="flex items-center border border-ink/30">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="h-9 w-9 hover:bg-ink hover:text-cream transition-colors"
                      >
                        −
                      </button>
                      <span className="w-9 text-center font-mono text-sm tabular">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="h-9 w-9 hover:bg-ink hover:text-cream transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="hidden sm:inline w-28 text-right">
                      <PriceTag amount={item.unitPrice * item.quantity} className="text-xl" />
                    </span>
                    <button
                      onClick={() => removeItem(item.productId)}
                      aria-label="Quitar"
                      className="text-ink/40 hover:text-error transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6 max-w-2xl">
                <p className="font-serif italic text-lg text-ink/70 leading-snug">
                  Enviamos a toda Colombia. Empaque hermético con barrera de oxígeno
                  para mantener la fruta crujiente hasta su puerta.
                </p>

                {/* Datos de contacto — solo si no hay sesión activa */}
                {!isAuthenticated && (
                  <div className="space-y-6 pb-6 border-b border-ink/15">
                    <div className="flex items-baseline justify-between">
                      <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-persimmon">
                        § Tus datos
                      </span>
                      <Link
                        href="/login"
                        className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-ink/55 hover:text-ink rv-link"
                      >
                        ¿Tienes cuenta? Ingresar
                      </Link>
                    </div>
                    <Input
                      id="guest-email"
                      type="email"
                      label="Correo electrónico"
                      value={guest.email}
                      onChange={(e) => setGuest({ email: e.target.value })}
                      hint="Te enviaremos confirmación de pago y un link para crear tu cuenta."
                      required
                    />
                    <div className="grid sm:grid-cols-2 gap-6">
                      <Input
                        id="guest-firstName"
                        label="Nombre"
                        value={guest.firstName}
                        onChange={(e) => setGuest({ firstName: e.target.value })}
                        required
                      />
                      <Input
                        id="guest-lastName"
                        label="Apellido"
                        value={guest.lastName}
                        onChange={(e) => setGuest({ lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                )}

                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-persimmon block">
                  § Dirección de envío
                </span>
                <Input
                  id="name"
                  label="Nombre del destinatario"
                  value={shipping.name}
                  onChange={(e) => setShipping({ name: e.target.value })}
                  required
                />
                <Input
                  id="address"
                  label="Dirección de envío"
                  value={shipping.address}
                  onChange={(e) => setShipping({ address: e.target.value })}
                  required
                />
                <div className="grid sm:grid-cols-2 gap-6">
                  <Input
                    id="city"
                    label="Ciudad"
                    value={shipping.city}
                    onChange={(e) => setShipping({ city: e.target.value })}
                    required
                  />
                  <Input
                    id="phone"
                    label="Teléfono (opcional)"
                    value={shipping.phone}
                    onChange={(e) => setShipping({ phone: e.target.value })}
                  />
                </div>
                <Input
                  id="notes"
                  label="Notas (opcional)"
                  value={shipping.notes}
                  onChange={(e) => setShipping({ notes: e.target.value })}
                  hint="Ej: dejar con portero, no llamar a domicilio."
                />
              </div>
            )}

            {step === 2 && boldConfig && (
              <div className="space-y-8 max-w-2xl">
                <div className="border border-ink/15 p-8 bg-cream-warm">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-persimmon">
                    Bold · Procesador autorizado
                  </span>
                  <h3 className="mt-3 font-display text-3xl tracking-tight text-ink leading-tight">
                    Pagar <PriceTag amount={total()} className="text-3xl" />
                  </h3>
                  <p className="mt-3 font-serif italic text-[15px] text-ink/65 leading-snug">
                    Al continuar, será redirigido a la pasarela segura de Bold. Pagos con
                    tarjeta crédito/débito, PSE, Nequi y Daviplata. La transacción está
                    protegida con firma de integridad.
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

                <div className="border border-ink/15 p-7">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
                    Envío confirmado a
                  </span>
                  <p className="mt-3 font-serif text-[17px] text-ink leading-snug">
                    {shipping.name}
                    <br />
                    <span className="text-ink/70">{shipping.address}, {shipping.city}</span>
                    <br />
                    <span className="font-mono text-[12px] text-ink/55">{shipping.phone}</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Summary column */}
          <aside className="lg:sticky lg:top-24 self-start border border-ink/15 bg-cream-warm">
            <div className="px-7 py-6 border-b border-ink/15 flex items-baseline justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55">
                Resumen
              </span>
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-ink/50">
                Edición {itemCount()} ítem{itemCount() === 1 ? "" : "s"}
              </span>
            </div>
            <dl className="px-7 py-5 space-y-3 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-ink/70">Sub-total</dt>
                <dd className="tabular text-ink">{formatCurrency(subtotal())}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/70">IVA 19%</dt>
                <dd className="tabular text-ink">{formatCurrency(tax())}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/70">Envío</dt>
                <dd className="tabular text-ink">
                  {shippingCost() === 0 ? (
                    <span className="font-mono text-[11px] uppercase tracking-wider text-success">
                      Gratis
                    </span>
                  ) : (
                    formatCurrency(shippingCost())
                  )}
                </dd>
              </div>
              {shippingCost() > 0 && (
                <p className="font-mono text-[10px] uppercase tracking-wider text-ink/40">
                  Envío gratis desde {formatCurrency(150000)}
                </p>
              )}
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
                  Continuar al envío →
                </button>
              )}
              {step === 1 && (
                <>
                  <button
                    onClick={handleCheckout}
                    disabled={!canProceedShipping || processing}
                    className="block w-full h-12 bg-persimmon text-cream font-sans text-[14px] tracking-tight rv-press hover:bg-persimmon-deep disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? "Preparando pago…" : "Pagar con Bold →"}
                  </button>
                  <button
                    onClick={() => setStep(0)}
                    className="block w-full h-12 border border-ink/30 font-sans text-[13px] text-ink hover:border-ink hover:bg-ink hover:text-cream transition-colors"
                  >
                    ← Volver al carrito
                  </button>
                </>
              )}
              {step === 2 && (
                <button
                  onClick={() => setStep(1)}
                  className="block w-full h-12 border border-ink/30 font-sans text-[13px] text-ink hover:border-ink hover:bg-ink hover:text-cream transition-colors"
                >
                  ← Editar envío
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
