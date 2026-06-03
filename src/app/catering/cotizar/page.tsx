"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useRef } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { EditorialRule } from "@/components/marketing/editorial";
import { BoldPaymentButton } from "@/components/payment/bold-button";
import { CostBreakdownPanel } from "@/components/catering/cost-breakdown-panel";
import { useQuoteBuilder, type QuoteBuilderState } from "@/stores/quote-builder-store";
import { useAuthStore } from "@/stores/auth-store";
import { formatCurrency } from "@/lib/utils";
import type { PricingBreakdown } from "@/lib/pricing/types";

const STEPS = [
  { num: 1, label: "Evento" },
  { num: 2, label: "Platos" },
  { num: 3, label: "Detalles" },
  { num: 4, label: "Cotización" },
  { num: 5, label: "Pago" },
];

const CITIES = ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Armenia"];

const MOMENTS = [
  { code: "DBR", name: "Desayunos y brunchs" },
  { code: "RFG", name: "Refrigerios y snacks" },
  { code: "ALM", name: "Almuerzos premium" },
  { code: "GAL", name: "Cenas de gala" },
  { code: "MEX", name: "Mesas de experiencia" },
  { code: "COC", name: "Coctelería saludable" },
];

interface MenuItemPublic {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  basePrice: number;
  momentType: string | null;
  categoryName: string;
  servingSize: string | null;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
}

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

export default function CotizarPage() {
  const {
    currentStep,
    city,
    guestCount,
    eventDate,
    eventTime,
    eventAddress,
    momentTypes,
    items,
    notes,
    dietaryNotes,
    clientIsDeclarante,
    quoteId,
    quoteNumber,
    goToStep,
    setEventVars,
    addItem,
    removeItem,
    updateItem,
    setNotes,
    setDietaryNotes,
    setClientIsDeclarante,
    setQuoteCreated,
    reset,
  } = useQuoteBuilder();

  const { isAuthenticated, user } = useAuthStore();
  const [menuItems, setMenuItems] = useState<MenuItemPublic[]>([]);
  const [breakdown, setBreakdown] = useState<PricingBreakdown | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [creatingQuote, setCreatingQuote] = useState(false);
  const [bold, setBold] = useState<BoldConfig | null>(null);
  const [guestData, setGuestData] = useState({ email: "", firstName: "", lastName: "", phone: "" });
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cargar catálogo cuando entren a paso 2
  useEffect(() => {
    if (currentStep < 1 || menuItems.length > 0) return;
    const q = momentTypes.length > 0 ? `?moment=${momentTypes.join(",")}` : "";
    fetch(`/api/menu/items${q}`)
      .then((r) => r.json())
      .then((d) => setMenuItems(d.items ?? []))
      .catch((e) => toast.error(`No pude cargar catálogo: ${e.message}`));
  }, [currentStep, momentTypes, menuItems.length]);

  // Recargar catálogo al cambiar momento
  useEffect(() => {
    if (currentStep < 1) return;
    const q = momentTypes.length > 0 ? `?moment=${momentTypes.join(",")}` : "";
    fetch(`/api/menu/items${q}`)
      .then((r) => r.json())
      .then((d) => setMenuItems(d.items ?? []))
      .catch(() => {});
  }, [momentTypes, currentStep]);

  // Preview live en paso 3+ con debounce
  const itemsHash = useMemo(() =>
    items.map((i) => `${i.menuItemId}:${i.quantity}:${i.portionMultiplier ?? 1}`).join("|"),
    [items],
  );
  useEffect(() => {
    if (currentStep < 3 || items.length === 0 || !eventDate) {
      setBreakdown(null);
      return;
    }
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(async () => {
      setPreviewing(true);
      try {
        const res = await fetch("/api/catering/pricing-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((i) => ({
              menuItemId: i.menuItemId,
              quantity: i.quantity,
              customizations: {
                portionMultiplier: i.portionMultiplier,
                notes: i.notes,
              },
            })),
            city,
            guestCount,
            momentTypes,
            eventDate: new Date(eventDate).toISOString(),
            clientIsDeclarante,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setBreakdown(data.breakdown);
      } catch (e) {
        toast.error(`Error en preview: ${(e as Error).message}`);
      } finally {
        setPreviewing(false);
      }
    }, 350);
    return () => {
      if (previewTimer.current) clearTimeout(previewTimer.current);
    };
  }, [currentStep, itemsHash, city, guestCount, eventDate, clientIsDeclarante, items, momentTypes]);

  const canAdvance = () => {
    switch (currentStep) {
      case 0:
        return guestCount > 0 && eventDate && eventTime && eventAddress && city;
      case 1:
        return items.length > 0;
      case 2:
        return items.length > 0;
      case 3:
        return breakdown !== null && breakdown.total > 0;
      default:
        return false;
    }
  };

  const onConfirmQuote = async () => {
    if (!isAuthenticated && (!guestData.email || !guestData.firstName)) {
      toast.error("Completa email y nombre para continuar como invitado");
      return;
    }
    setCreatingQuote(true);
    try {
      const res = await fetch("/api/catering/quotes", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
            customizations: {
              portionMultiplier: i.portionMultiplier,
              notes: i.notes,
            },
          })),
          city,
          guestCount,
          momentTypes,
          eventDate: new Date(eventDate).toISOString(),
          eventTime,
          eventAddress,
          notes: notes || undefined,
          dietaryNotes: dietaryNotes || undefined,
          clientIsDeclarante,
          guest: isAuthenticated ? undefined : guestData,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuoteCreated(data.quoteId, data.quoteNumber);
      // Iniciar pago Bold
      const payRes = await fetch(`/api/catering/quotes/${data.quoteId}/pay-bold`, {
        method: "POST",
        credentials: "include",
      });
      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.error);
      setBold(payData);
      goToStep(4);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCreatingQuote(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  return (
    <>
      <SiteHeader line="catering" />

      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 pt-12">
        <EditorialRule index="00" label="Diseñador · Cotizar" className="mb-8" />

        {/* Step indicator */}
        <div className="flex items-baseline gap-4 sm:gap-8 flex-wrap mb-12">
          {STEPS.map((s, i) => (
            <button
              key={s.num}
              onClick={() => i <= currentStep && goToStep(i)}
              disabled={i > currentStep}
              className={
                "flex items-baseline gap-2 transition-opacity " +
                (i === currentStep
                  ? "opacity-100"
                  : i < currentStep
                    ? "opacity-100 hover:opacity-70 cursor-pointer"
                    : "opacity-30 cursor-not-allowed")
              }
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-marigold-deep">
                {String(s.num).padStart(2, "0")}
              </span>
              <span
                className={
                  "font-display text-2xl tracking-tight " +
                  (i === currentStep ? "text-ink" : "text-ink/55")
                }
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <span className="text-ink/30 ml-2 hidden sm:inline">→</span>
              )}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_420px] gap-10">
          {/* Main content */}
          <div className="min-h-[60vh]">
            {currentStep === 0 && (
              <Step1Event
                city={city}
                guestCount={guestCount}
                eventDate={eventDate}
                eventTime={eventTime}
                eventAddress={eventAddress}
                momentTypes={momentTypes}
                onChange={setEventVars}
              />
            )}
            {currentStep === 1 && (
              <Step2Catalog
                menuItems={menuItems}
                items={items}
                addItem={addItem}
                removeItem={removeItem}
                updateItem={updateItem}
                guestCount={guestCount}
              />
            )}
            {currentStep === 2 && (
              <Step3Customize
                items={items}
                updateItem={updateItem}
              />
            )}
            {currentStep === 3 && (
              <Step4Review
                notes={notes}
                dietaryNotes={dietaryNotes}
                setNotes={setNotes}
                setDietaryNotes={setDietaryNotes}
                clientIsDeclarante={clientIsDeclarante}
                setClientIsDeclarante={setClientIsDeclarante}
                isAuthenticated={isAuthenticated}
                user={user}
                guestData={guestData}
                setGuestData={setGuestData}
              />
            )}
            {currentStep === 4 && bold && (
              <Step5Pay
                bold={bold}
                quoteNumber={quoteNumber}
                quoteId={quoteId}
              />
            )}
          </div>

          {/* Sticky sidebar */}
          <aside className="space-y-4">
            <div className="sticky top-6">
              {currentStep >= 3 && breakdown ? (
                <CostBreakdownPanel breakdown={breakdown} />
              ) : (
                <SimpleSummary
                  city={city}
                  guestCount={guestCount}
                  eventDate={eventDate}
                  items={items}
                  menuItems={menuItems}
                />
              )}

              {previewing && currentStep >= 3 && (
                <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/55 mt-2 text-center">
                  Recalculando…
                </p>
              )}

              {/* Navigation */}
              {currentStep < 4 && (
                <div className="mt-6 flex flex-col gap-3">
                  {currentStep === 3 ? (
                    <button
                      disabled={!canAdvance() || creatingQuote}
                      onClick={onConfirmQuote}
                      className="w-full h-12 bg-ink text-cream font-sans text-[14px] tracking-tight rv-press disabled:opacity-50 hover:bg-ink-soft"
                    >
                      {creatingQuote ? "Creando cotización…" : "Confirmar y pagar →"}
                    </button>
                  ) : (
                    <button
                      disabled={!canAdvance()}
                      onClick={() => goToStep(currentStep + 1)}
                      className="w-full h-12 bg-ink text-cream font-sans text-[14px] tracking-tight rv-press disabled:opacity-50 hover:bg-ink-soft"
                    >
                      Continuar →
                    </button>
                  )}
                  {currentStep > 0 && (
                    <button
                      onClick={() => goToStep(currentStep - 1)}
                      className="w-full h-10 border border-ink/40 font-sans text-[13px] tracking-tight rv-press hover:border-ink"
                    >
                      ← Volver
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm("¿Empezar una nueva cotización?")) reset();
                    }}
                    className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55 hover:text-ink py-2"
                  >
                    Empezar de nuevo
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 1 — Variables del evento
// ═══════════════════════════════════════════════════════════════

function Step1Event({
  city,
  guestCount,
  eventDate,
  eventTime,
  eventAddress,
  momentTypes,
  onChange,
}: {
  city: string;
  guestCount: number;
  eventDate: string;
  eventTime: string;
  eventAddress: string;
  momentTypes: string[];
  onChange: QuoteBuilderState["setEventVars"];
}) {
  const toggleMoment = (code: string) => {
    onChange({
      momentTypes: momentTypes.includes(code)
        ? momentTypes.filter((m) => m !== code)
        : [...momentTypes, code],
    });
  };

  return (
    <div>
      <h2 className="font-display font-light text-4xl sm:text-5xl tracking-[-0.025em] leading-[0.95] text-ink mb-3">
        Variables del <span className="italic">evento</span>
        <span className="text-marigold">.</span>
      </h2>
      <p className="font-serif italic text-lg text-ink/70 leading-snug mb-10 max-w-xl">
        Tres datos definen la mitad del precio: ciudad, # comensales y momento.
      </p>

      <div className="grid sm:grid-cols-2 gap-5 max-w-2xl">
        <Field label="Ciudad">
          <select
            value={city}
            onChange={(e) => onChange({ city: e.target.value })}
            className={INPUT}
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="# Comensales">
          <input
            type="number"
            min={1}
            max={5000}
            value={guestCount}
            onChange={(e) =>
              onChange({ guestCount: Math.max(1, Number(e.target.value)) })
            }
            className={INPUT}
          />
        </Field>
        <Field label="Fecha del evento">
          <input
            type="date"
            value={eventDate}
            onChange={(e) => onChange({ eventDate: e.target.value })}
            className={INPUT}
          />
        </Field>
        <Field label="Horario">
          <input
            type="time"
            value={eventTime}
            onChange={(e) => onChange({ eventTime: e.target.value })}
            className={INPUT}
          />
        </Field>
        <Field label="Dirección" className="sm:col-span-2">
          <input
            value={eventAddress}
            onChange={(e) => onChange({ eventAddress: e.target.value })}
            placeholder="Ej. Cra 11 #100-20 · Edif. Corporativo · Piso 8"
            className={INPUT}
          />
        </Field>
      </div>

      <div className="mt-10">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55 mb-3">
          Momentos del evento (elige uno o varios)
        </p>
        <div className="flex flex-wrap gap-2">
          {MOMENTS.map((m) => {
            const active = momentTypes.includes(m.code);
            return (
              <button
                key={m.code}
                onClick={() => toggleMoment(m.code)}
                className={
                  "px-4 py-2 border font-sans text-[13px] tracking-tight transition-colors " +
                  (active
                    ? "bg-ink text-cream border-ink"
                    : "bg-cream text-ink/75 border-ink/25 hover:border-ink")
                }
              >
                <span className="font-mono text-[10px] text-marigold-deep mr-2">
                  § {m.code}
                </span>
                {m.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 2 — Catálogo de platos
// ═══════════════════════════════════════════════════════════════

function Step2Catalog({
  menuItems,
  items,
  addItem,
  removeItem,
  updateItem,
  guestCount,
}: {
  menuItems: MenuItemPublic[];
  items: QuoteBuilderState["items"];
  addItem: QuoteBuilderState["addItem"];
  removeItem: QuoteBuilderState["removeItem"];
  updateItem: QuoteBuilderState["updateItem"];
  guestCount: number;
}) {
  return (
    <div>
      <h2 className="font-display font-light text-4xl sm:text-5xl tracking-[-0.025em] leading-[0.95] text-ink mb-3">
        Selecciona <span className="italic">platos</span>
        <span className="text-marigold">.</span>
      </h2>
      <p className="font-serif italic text-lg text-ink/70 leading-snug mb-8 max-w-xl">
        Filtramos por los momentos que elegiste. Cada plato tiene precio
        sugerido por persona — el total se calcula con tus comensales.
      </p>

      {menuItems.length === 0 ? (
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55 py-12">
          No hay platos disponibles para esos momentos.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {menuItems.map((m) => {
            const inCart = items.find((i) => i.menuItemId === m.id);
            return (
              <article key={m.id} className="border border-ink/15 bg-cream overflow-hidden">
                {m.image && (
                  <div className="relative w-full aspect-[4/3] border-b border-ink/10">
                    <Image
                      src={m.image}
                      alt={m.name}
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-marigold-deep">
                    {m.momentType ?? m.categoryName}
                  </span>
                  <h3 className="mt-2 font-display text-xl tracking-tight text-ink leading-tight">
                    {m.name}
                  </h3>
                  {m.description && (
                    <p className="mt-2 font-sans text-[13px] text-ink/65 leading-snug line-clamp-2">
                      {m.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="font-display text-xl tabular text-ink">
                      {formatCurrency(m.basePrice)}
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55 ml-1">
                        / pax
                      </span>
                    </span>
                    {inCart ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateItem(m.id, { quantity: Math.max(1, inCart.quantity - 1) })
                          }
                          className="h-8 w-8 border border-ink/20 hover:border-ink"
                        >
                          −
                        </button>
                        <span className="font-display text-lg tabular w-10 text-center">
                          {inCart.quantity}
                        </span>
                        <button
                          onClick={() => updateItem(m.id, { quantity: inCart.quantity + 1 })}
                          className="h-8 w-8 border border-ink/20 hover:border-ink"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(m.id)}
                          className="font-mono text-[10px] uppercase tracking-[0.18em] text-persimmon hover:text-ink ml-2"
                        >
                          Quitar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          addItem({
                            menuItemId: m.id,
                            name: m.name,
                            image: m.image,
                            basePrice: m.basePrice,
                            momentType: m.momentType,
                            quantity: guestCount,
                          })
                        }
                        className="h-9 px-4 bg-marigold text-ink font-sans text-[12.5px] tracking-tight rv-press hover:bg-cream"
                      >
                        + Agregar
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 3 — Customización por plato
// ═══════════════════════════════════════════════════════════════

function Step3Customize({
  items,
  updateItem,
}: {
  items: QuoteBuilderState["items"];
  updateItem: QuoteBuilderState["updateItem"];
}) {
  return (
    <div>
      <h2 className="font-display font-light text-4xl sm:text-5xl tracking-[-0.025em] leading-[0.95] text-ink mb-3">
        Customiza <span className="italic">cada plato</span>
        <span className="text-marigold">.</span>
      </h2>
      <p className="font-serif italic text-lg text-ink/70 leading-snug mb-8 max-w-xl">
        Ajusta el tamaño de porción y agrega notas (alergias, gustos del cliente
        VIP, etc).
      </p>
      <div className="space-y-4">
        {items.map((it) => (
          <div key={it.menuItemId} className="border border-ink/15 bg-cream p-5">
            <div className="flex items-baseline justify-between mb-3 flex-wrap gap-3">
              <div>
                <h3 className="font-display text-xl text-ink leading-tight">
                  {it.name}
                </h3>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/55 mt-1">
                  {it.quantity} unidades × {formatCurrency(it.basePrice)} ={" "}
                  {formatCurrency(it.basePrice * it.quantity)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/55">
                  Porción
                </span>
                {[0.5, 1, 1.5].map((p) => (
                  <button
                    key={p}
                    onClick={() => updateItem(it.menuItemId, { portionMultiplier: p })}
                    className={
                      "px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] border " +
                      ((it.portionMultiplier ?? 1) === p
                        ? "bg-ink text-cream border-ink"
                        : "bg-cream text-ink/70 border-ink/25 hover:border-ink")
                    }
                  >
                    {p === 0.5 ? "Mini" : p === 1 ? "Estándar" : "XL"}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={it.notes ?? ""}
              onChange={(e) => updateItem(it.menuItemId, { notes: e.target.value })}
              placeholder="Notas para este plato (alergias, preparación especial…)"
              rows={2}
              className={INPUT + " min-h-[64px]"}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 4 — Revisión + datos cliente + retenciones
// ═══════════════════════════════════════════════════════════════

function Step4Review({
  notes,
  dietaryNotes,
  setNotes,
  setDietaryNotes,
  clientIsDeclarante,
  setClientIsDeclarante,
  isAuthenticated,
  user,
  guestData,
  setGuestData,
}: {
  notes: string;
  dietaryNotes: string;
  setNotes: (s: string) => void;
  setDietaryNotes: (s: string) => void;
  clientIsDeclarante: boolean;
  setClientIsDeclarante: (v: boolean) => void;
  isAuthenticated: boolean;
  user: { email?: string; firstName?: string; lastName?: string } | null;
  guestData: { email: string; firstName: string; lastName: string; phone: string };
  setGuestData: (d: { email: string; firstName: string; lastName: string; phone: string }) => void;
}) {
  return (
    <div>
      <h2 className="font-display font-light text-4xl sm:text-5xl tracking-[-0.025em] leading-[0.95] text-ink mb-3">
        Revisa la <span className="italic">cotización</span>
        <span className="text-marigold">.</span>
      </h2>
      <p className="font-serif italic text-lg text-ink/70 leading-snug mb-8 max-w-xl">
        El sidebar tiene el desglose completo. Aquí confirmamos contacto,
        notas y régimen de retenciones.
      </p>

      {!isAuthenticated && (
        <div className="border border-ink/15 bg-cream-warm p-5 mb-6">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-marigold-deep mb-3">
            § Datos de contacto
          </p>
          <p className="font-sans text-[13px] text-ink/75 mb-4">
            No necesitas crear cuenta. Después del pago te enviamos un email
            con link para activar tu acceso.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              placeholder="Email"
              type="email"
              value={guestData.email}
              onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
              className={INPUT}
            />
            <input
              placeholder="Teléfono"
              value={guestData.phone}
              onChange={(e) => setGuestData({ ...guestData, phone: e.target.value })}
              className={INPUT}
            />
            <input
              placeholder="Nombres"
              value={guestData.firstName}
              onChange={(e) => setGuestData({ ...guestData, firstName: e.target.value })}
              className={INPUT}
            />
            <input
              placeholder="Apellidos"
              value={guestData.lastName}
              onChange={(e) => setGuestData({ ...guestData, lastName: e.target.value })}
              className={INPUT}
            />
          </div>
        </div>
      )}

      {isAuthenticated && user && (
        <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55 mb-6">
          Cotizando como: {user.firstName} {user.lastName} · {user.email}
        </p>
      )}

      <Field label="Régimen de retención">
        <select
          value={clientIsDeclarante ? "yes" : "no"}
          onChange={(e) => setClientIsDeclarante(e.target.value === "yes")}
          className={INPUT}
        >
          <option value="yes">Mi empresa SÍ es agente retenedor declarante</option>
          <option value="no">Mi empresa NO es agente retenedor</option>
        </select>
      </Field>

      <div className="mt-4 grid sm:grid-cols-2 gap-4">
        <Field label="Notas del evento">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Detalles logísticos, hora de montaje…"
            className={INPUT + " min-h-[88px]"}
          />
        </Field>
        <Field label="Restricciones dietéticas">
          <textarea
            value={dietaryNotes}
            onChange={(e) => setDietaryNotes(e.target.value)}
            rows={3}
            placeholder="Alergias generales, comensales vegetarianos…"
            className={INPUT + " min-h-[88px]"}
          />
        </Field>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STEP 5 — Pago Bold
// ═══════════════════════════════════════════════════════════════

function Step5Pay({
  bold,
  quoteNumber,
  quoteId,
}: {
  bold: BoldConfig;
  quoteNumber: string | null;
  quoteId: string | null;
}) {
  return (
    <div>
      <h2 className="font-display font-light text-4xl sm:text-5xl tracking-[-0.025em] leading-[0.95] text-ink mb-3">
        Pago <span className="italic">100% adelantado</span>
        <span className="text-marigold">.</span>
      </h2>
      <p className="font-serif italic text-lg text-ink/70 leading-snug mb-6">
        Cotización {quoteNumber}. El monto incluye impuestos y logística.
      </p>

      <div className="border border-ink/15 bg-cream p-8">
        <BoldPaymentButton
          apiKey={bold.apiKey}
          amount={bold.amount}
          currency={bold.currency}
          orderId={bold.orderId}
          integritySignature={bold.integritySignature}
          description={bold.description}
          tax={bold.tax}
          redirectionUrl={bold.redirectionUrl}
          customerData={bold.customerData}
          billingAddress={bold.billingAddress}
          buttonStyle="dark-L"
        />
      </div>

      <p className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/55 leading-relaxed">
        Si necesitas descargar el PDF antes de pagar:{" "}
        <Link
          href={`/api/catering/quotes/${quoteId}/pdf`}
          className="text-marigold-deep underline"
        >
          descargar cotización (PDF)
        </Link>
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

const INPUT =
  "w-full h-11 px-3 border border-ink/20 bg-cream font-sans text-[14px] text-ink focus:outline-none focus:border-ink";

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="block font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

function SimpleSummary({
  city,
  guestCount,
  eventDate,
  items,
  menuItems,
}: {
  city: string;
  guestCount: number;
  eventDate: string;
  items: QuoteBuilderState["items"];
  menuItems: MenuItemPublic[];
}) {
  const subtotal = items.reduce((s, i) => s + i.basePrice * i.quantity, 0);
  return (
    <div className="border border-ink/15 bg-cream">
      <div className="p-6 border-b border-ink/15">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-marigold-deep mb-2">
          § Resumen
        </p>
        <h3 className="font-display text-2xl text-ink leading-tight">
          {city}
        </h3>
        <p className="font-serif italic text-base text-ink/65 mt-1">
          {guestCount} comensales · {eventDate || "fecha pendiente"}
        </p>
      </div>
      <div className="px-6 py-4">
        {items.length === 0 ? (
          <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/55 py-3">
            Aún no hay platos seleccionados.
          </p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {items.map((it) => (
              <li key={it.menuItemId} className="py-2 flex items-baseline justify-between">
                <div>
                  <p className="font-display text-base text-ink">{it.name}</p>
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/55">
                    {it.quantity}× {formatCurrency(it.basePrice)}
                  </p>
                </div>
                <span className="font-display text-base tabular text-ink">
                  {formatCurrency(it.basePrice * it.quantity)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {items.length > 0 && (
        <div className="px-6 py-4 border-t border-ink/15 flex items-baseline justify-between">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/65">
            Subtotal sin impuestos
          </span>
          <span className="font-display text-xl tabular text-ink">
            {formatCurrency(subtotal)}
          </span>
        </div>
      )}
    </div>
  );
}
