"use client";

/**
 * /catering/cotizar — Diseñador editorial de cotizaciones.
 *
 * Aplicación de "Premium Experience Methodology" (Obsidian):
 *  · Sense of arrival con hero editorial
 *  · Editorial chapter nav (I/II/III/IV) en vez de step numbers
 *  · Direct manipulation: slider gigante, city cards, moment chips
 *  · Live narrative sidebar
 *  · Dramatic total reveal en el capítulo IV
 *  · Choreography entre capítulos (fade+slide con stagger)
 */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { BoldPaymentButton } from "@/components/payment/bold-button";
import { CostBreakdownPanel } from "@/components/catering/cost-breakdown-panel";
import { EditorialChapterNav } from "@/components/catering/editorial-chapter-nav";
import { GuestCountStage } from "@/components/catering/guest-count-stage";
import { CityCardGrid } from "@/components/catering/city-card-grid";
import { MomentChipGrid } from "@/components/catering/moment-chip-grid";
import { DateWithSeason } from "@/components/catering/date-with-season";
import { LiveEventNarrative } from "@/components/catering/live-event-narrative";
import { DramaticTotal } from "@/components/catering/dramatic-total";
import { GuestCheckoutInline, guestIsValid } from "@/components/checkout/guest-checkout-inline";
import { QuoteDocumentsPanel } from "@/components/catering/quote-documents-panel";
import { useQuoteBuilder, type QuoteBuilderState } from "@/stores/quote-builder-store";
import { useAuthStore } from "@/stores/auth-store";
import { formatCurrency } from "@/lib/utils";
import type { PricingBreakdown } from "@/lib/pricing/types";

// ─────────────────────────────────────────────────────────────────
// Capítulos editoriales (NO step numbers).
// Cada título nombra el OUTCOME, no el contenido.
// ─────────────────────────────────────────────────────────────────
const CHAPTERS = [
  { title: "El evento",  outcome: "Define ciudad, fecha, comensales y momento" },
  { title: "La mesa",    outcome: "Compone el catálogo de platos" },
  { title: "Los acentos",outcome: "Ajusta porciones y restricciones" },
  { title: "La cuenta",  outcome: "Revisa el desglose completo" },
  { title: "El cierre",  outcome: "Pago seguro vía Bold" },
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
  const builder = useQuoteBuilder();
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
  } = builder;

  const { isAuthenticated, user } = useAuthStore();
  const [menuItems, setMenuItems] = useState<MenuItemPublic[]>([]);
  const [breakdown, setBreakdown] = useState<PricingBreakdown | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [creatingQuote, setCreatingQuote] = useState(false);
  const [bold, setBold] = useState<BoldConfig | null>(null);
  const [guestData, setGuestData] = useState({ email: "", firstName: "", lastName: "", phone: "" });
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Cargar catálogo según momento(s) ─────────────────
  useEffect(() => {
    if (currentStep < 1) return;
    const q = momentTypes.length > 0 ? `?moment=${momentTypes.join(",")}` : "";
    fetch(`/api/menu/items${q}`)
      .then((r) => r.json())
      .then((d) => setMenuItems(d.items ?? []))
      .catch(() => {});
  }, [currentStep, momentTypes]);

  // ── Preview de pricing en vivo a partir del capítulo III ──
  const itemsHash = useMemo(
    () =>
      items
        .map((i) => `${i.menuItemId}:${i.quantity}:${i.portionMultiplier ?? 1}`)
        .join("|"),
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

  // ── Validación por capítulo ──────────────────────────
  const canAdvance = () => {
    switch (currentStep) {
      case 0:
        return guestCount > 0 && eventDate && eventTime && eventAddress && city && momentTypes.length > 0;
      case 1:
        return items.length > 0;
      case 2:
        return items.length > 0;
      case 3:
        if (breakdown === null || breakdown.total <= 0) return false;
        if (isAuthenticated) return true;
        return guestIsValid(guestData, false);
      default:
        return false;
    }
  };

  // ── Confirmar y arrancar pago ────────────────────────
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
      builder.setQuoteCreated(data.quoteId, data.quoteNumber);

      const payRes = await fetch(`/api/catering/quotes/${data.quoteId}/pay-bold`, {
        method: "POST",
        credentials: "include",
      });
      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.error);
      setBold(payData);
      builder.goToStep(4);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCreatingQuote(false);
    }
  };

  // ── Cost estimate para narrative (CMP sin impuestos) ──
  const cmpEstimate = useMemo(
    () => items.reduce((sum, it) => sum + it.basePrice * it.quantity * 0.4, 0),
    [items],
  );

  return (
    <>
      <SiteHeader line="catering" />

      {/* ════════════════ ESCAPE STRIP — siempre visible ════════════════ */}
      <div className="bg-cream-warm/60 border-b border-ink/10 sticky top-[64px] sm:top-[68px] z-30 backdrop-blur-sm">
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 py-2 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-baseline gap-4 text-[12px] sm:text-[13px]">
            <Link
              href="/"
              className="font-mono uppercase tracking-[0.22em] text-ink/65 hover:text-ink transition-colors"
            >
              ← Inicio
            </Link>
            <span className="text-ink/25">·</span>
            <Link
              href="/catering"
              className="font-mono uppercase tracking-[0.22em] text-ink/65 hover:text-ink transition-colors"
            >
              Catering
            </Link>
            <span className="text-ink/25">·</span>
            <span className="font-mono uppercase tracking-[0.22em] text-marigold-deep">
              Cotizar
            </span>
          </div>
          <button
            onClick={() => {
              if (
                confirm(
                  "¿Salir del cotizador y volver al inicio? Su progreso se guarda automáticamente y puede continuar después.",
                )
              ) {
                window.location.href = "/";
              }
            }}
            className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55 hover:text-persimmon transition-colors"
          >
            Salir del cotizador
          </button>
        </div>
      </div>

      {/* ════════════════ HERO EDITORIAL ════════════════ */}
      <section className="max-w-[1500px] mx-auto px-6 sm:px-10 pt-12 sm:pt-16 pb-10">
        <div className="grid grid-cols-12 gap-x-6 items-end">
          <div className="col-span-12 lg:col-span-3 mb-6 lg:mb-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-marigold-deep">
              § Diseñador editorial
            </p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55">
              Cotización con desglose tributario completo
            </p>
          </div>
          <div className="col-span-12 lg:col-span-9">
            <h1 className="font-display font-light tracking-[-0.04em] leading-[0.86] text-ink text-5xl sm:text-7xl lg:text-[112px]">
              Diseñe su evento,
              <br />
              <span className="italic">plato por plato</span>
              <span className="text-marigold">.</span>
            </h1>
            <p className="mt-8 font-serif italic text-xl sm:text-2xl leading-snug text-ink/70 max-w-3xl">
              Esta no es una calculadora — es un libro contable en vivo.
              Cada decisión modifica el costo, el margen y los impuestos.
              Cuando termine, tendrá una cotización formal, transparente y
              lista para pagar.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════ CHAPTER NAV ════════════════ */}
      <section className="max-w-[1500px] mx-auto px-6 sm:px-10 border-y border-ink/15 py-6">
        <EditorialChapterNav
          chapters={CHAPTERS}
          current={currentStep}
          onJump={(i) => builder.goToStep(i)}
        />
      </section>

      {/* ════════════════ ESCENA + SIDEBAR ════════════════ */}
      <section className="max-w-[1500px] mx-auto px-6 sm:px-10 pt-12 pb-24">
        <div className="grid lg:grid-cols-[1fr_400px] gap-12">
          {/* ── Main stage (left) ── */}
          <div key={currentStep} className="rv-stage min-h-[60vh]">
            {currentStep === 0 && (
              <ChapterEvent
                city={city}
                guestCount={guestCount}
                eventDate={eventDate}
                eventTime={eventTime}
                eventAddress={eventAddress}
                momentTypes={momentTypes}
                onChange={builder.setEventVars}
              />
            )}
            {currentStep === 1 && (
              <ChapterMesa
                menuItems={menuItems}
                items={items}
                addItem={builder.addItem}
                removeItem={builder.removeItem}
                updateItem={builder.updateItem}
                guestCount={guestCount}
              />
            )}
            {currentStep === 2 && (
              <ChapterAcentos
                items={items}
                updateItem={builder.updateItem}
                notes={notes}
                dietaryNotes={dietaryNotes}
                setNotes={builder.setNotes}
                setDietaryNotes={builder.setDietaryNotes}
                clientIsDeclarante={clientIsDeclarante}
                setClientIsDeclarante={builder.setClientIsDeclarante}
              />
            )}
            {currentStep === 3 && (
              <ChapterCuenta
                breakdown={breakdown}
                previewing={previewing}
                isAuthenticated={isAuthenticated}
                user={user}
                guestData={guestData}
                setGuestData={setGuestData}
              />
            )}
            {currentStep === 4 && bold && (
              <ChapterCierre
                bold={bold}
                quoteNumber={quoteNumber}
                quoteId={quoteId}
              />
            )}
          </div>

          {/* ── Sticky sidebar (right) ── */}
          <aside className="space-y-6">
            <div className="sticky top-6 space-y-6">
              <LiveEventNarrative
                city={city}
                guestCount={guestCount}
                eventDate={eventDate}
                eventTime={eventTime}
                momentTypes={momentTypes}
                itemCount={items.length}
                cmpEstimate={cmpEstimate}
              />

              {/* Mini summary de platos seleccionados */}
              {items.length > 0 && currentStep <= 2 && (
                <div className="border border-ink/15 bg-cream-warm">
                  <p className="px-5 pt-4 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
                    En la mesa
                  </p>
                  <ul className="divide-y divide-ink/10 px-5 pb-4">
                    {items.map((it) => (
                      <li
                        key={it.menuItemId}
                        className="py-3 flex items-baseline justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="font-display text-base text-ink truncate">
                            {it.name}
                          </p>
                          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
                            {it.quantity}× ·{" "}
                            {it.portionMultiplier
                              ? it.portionMultiplier < 1
                                ? "Mini"
                                : it.portionMultiplier > 1
                                  ? "XL"
                                  : "Estándar"
                              : "Estándar"}
                          </p>
                        </div>
                        <span className="font-display text-base tabular text-ink shrink-0">
                          {formatCurrency(it.basePrice * it.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Breakdown completo desde capítulo IV */}
              {currentStep >= 3 && breakdown && (
                <CostBreakdownPanel breakdown={breakdown} />
              )}

              {previewing && currentStep >= 3 && (
                <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55 text-center">
                  Recalculando…
                </p>
              )}

              {/* Navigation */}
              {currentStep < 4 && (
                <div className="flex flex-col gap-2.5 pt-2">
                  {currentStep === 3 ? (
                    <button
                      disabled={!canAdvance() || creatingQuote}
                      onClick={onConfirmQuote}
                      className="w-full h-14 bg-ink text-cream font-sans text-[15px] tracking-tight rv-press disabled:opacity-50 hover:bg-ink-soft transition-colors"
                    >
                      {creatingQuote
                        ? "Generando cotización…"
                        : "Confirmar y pagar →"}
                    </button>
                  ) : (
                    <button
                      disabled={!canAdvance()}
                      onClick={() => builder.goToStep(currentStep + 1)}
                      className="w-full h-14 bg-ink text-cream font-sans text-[15px] tracking-tight rv-press disabled:opacity-50 hover:bg-ink-soft transition-colors"
                    >
                      {currentStep === 0 && "Componer la mesa →"}
                      {currentStep === 1 && "Ajustar los acentos →"}
                      {currentStep === 2 && "Ver la cuenta →"}
                    </button>
                  )}
                  {currentStep > 0 && (
                    <button
                      onClick={() => builder.goToStep(currentStep - 1)}
                      className="w-full h-11 border border-ink/30 font-sans text-[13px] tracking-tight hover:border-ink hover:bg-cream-warm transition-colors"
                    >
                      ← Volver al capítulo anterior
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm("¿Empezar una nueva cotización?"))
                        builder.reset();
                    }}
                    className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/45 hover:text-ink py-2 transition-colors"
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

      {/* Choreography: stage enters with fade+slide */}
      <style jsx global>{`
        .rv-stage {
          animation: rv-stage-enter 480ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes rv-stage-enter {
          0% {
            opacity: 0;
            transform: translateY(16px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .rv-press:active {
          transform: translateY(1px);
        }
      `}</style>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// CAPÍTULO I · El evento
// ═══════════════════════════════════════════════════════════════
function ChapterEvent({
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
  onChange: (input: Partial<{
    city: string;
    guestCount: number;
    eventDate: string;
    eventTime: string;
    eventAddress: string;
    momentTypes: string[];
  }>) => void;
}) {
  return (
    <div className="space-y-12">
      <ChapterHeading
        ordinal="I"
        title="El evento"
        kicker="Tres variables definen la mitad del precio: ciudad, comensales y momento. Empezamos por ahí."
      />

      {/* Guest count gigante */}
      <GuestCountStage
        value={guestCount}
        onChange={(n) => onChange({ guestCount: n })}
      />

      {/* Divider editorial */}
      <hr className="border-ink/15" />

      {/* Ciudad + momento side by side en desktop */}
      <div className="grid lg:grid-cols-2 gap-10">
        <CityCardGrid value={city} onChange={(c) => onChange({ city: c })} />
        <MomentChipGrid
          value={momentTypes}
          onChange={(next) => onChange({ momentTypes: next })}
        />
      </div>

      <hr className="border-ink/15" />

      {/* Fecha + hora + dirección */}
      <div className="grid lg:grid-cols-2 gap-10">
        <DateWithSeason
          date={eventDate}
          time={eventTime}
          onChangeDate={(d) => onChange({ eventDate: d })}
          onChangeTime={(t) => onChange({ eventTime: t })}
        />
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-ink/55 mb-3">
            § Dirección del evento
          </p>
          <input
            value={eventAddress}
            onChange={(e) => onChange({ eventAddress: e.target.value })}
            placeholder="Ej. Cra 11 #100-20 · Edif. Corporativo · Piso 8"
            className="w-full h-14 px-4 border border-ink/25 bg-cream font-sans text-base text-ink focus:outline-none focus:border-ink"
          />
          <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/45">
            Esta dirección define el costo de logística.
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CAPÍTULO II · La mesa
// ═══════════════════════════════════════════════════════════════
function ChapterMesa({
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
    <div className="space-y-10">
      <ChapterHeading
        ordinal="II"
        title="La mesa"
        kicker="Cada plato se costó pieza por pieza. Los precios incluyen materia prima, mano de obra con factor prestacional y costos indirectos."
      />

      {menuItems.length === 0 ? (
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55 py-12">
          No hay platos disponibles para los momentos seleccionados.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {menuItems.map((m, idx) => {
            const inCart = items.find((i) => i.menuItemId === m.id);
            return (
              <article
                key={m.id}
                className="group border border-ink/15 bg-cream overflow-hidden transition-all duration-300 hover:border-ink hover:shadow-[0_8px_28px_rgba(31,29,26,0.08)]"
                style={{
                  animation: `rv-card-enter 480ms ${idx * 40}ms cubic-bezier(0.22, 1, 0.36, 1) backwards`,
                }}
              >
                {m.image && (
                  <div className="relative w-full aspect-[5/4] overflow-hidden border-b border-ink/10">
                    <Image
                      src={m.image}
                      alt={m.name}
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {inCart && (
                      <div className="absolute top-3 right-3 bg-ink text-cream font-display tabular text-2xl h-12 w-12 flex items-center justify-center">
                        {inCart.quantity}
                      </div>
                    )}
                  </div>
                )}
                <div className="p-5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-marigold-deep">
                    {m.momentType ?? m.categoryName}
                    {m.servingSize && (
                      <span className="text-ink/45 normal-case font-mono ml-2">
                        · {m.servingSize}
                      </span>
                    )}
                  </span>
                  <h3 className="mt-2 font-display text-2xl tracking-tight text-ink leading-tight">
                    {m.name}
                  </h3>
                  {m.description && (
                    <p className="mt-2 font-serif italic text-[14px] text-ink/65 leading-snug line-clamp-2">
                      {m.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-baseline justify-between flex-wrap gap-3">
                    <span className="font-display text-2xl tabular text-ink">
                      {formatCurrency(m.basePrice)}
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55 ml-1">
                        / persona
                      </span>
                    </span>
                    {inCart ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            updateItem(m.id, {
                              quantity: Math.max(1, inCart.quantity - 1),
                            })
                          }
                          className="h-9 w-9 border border-ink/25 hover:border-ink hover:bg-ink hover:text-cream font-display transition-colors"
                        >
                          −
                        </button>
                        <span className="font-display text-lg tabular w-12 text-center">
                          {inCart.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateItem(m.id, { quantity: inCart.quantity + 1 })
                          }
                          className="h-9 w-9 border border-ink/25 hover:border-ink hover:bg-ink hover:text-cream font-display transition-colors"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(m.id)}
                          className="ml-1 font-mono text-[10px] uppercase tracking-[0.18em] text-persimmon hover:text-ink transition-colors"
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
                        className="h-10 px-5 bg-marigold text-ink font-sans text-[12.5px] tracking-tight rv-press hover:bg-marigold-deep hover:text-cream transition-colors"
                      >
                        + Agregar a la mesa
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <style jsx>{`
        @keyframes rv-card-enter {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CAPÍTULO III · Los acentos (customización + régimen tributario)
// Los datos del comprador NO se piden aquí — se piden en el Cap IV,
// justo antes del botón de pago, para reducir fricción.
// ═══════════════════════════════════════════════════════════════
function ChapterAcentos({
  items,
  updateItem,
  notes,
  dietaryNotes,
  setNotes,
  setDietaryNotes,
  clientIsDeclarante,
  setClientIsDeclarante,
}: {
  items: QuoteBuilderState["items"];
  updateItem: QuoteBuilderState["updateItem"];
  notes: string;
  dietaryNotes: string;
  setNotes: (s: string) => void;
  setDietaryNotes: (s: string) => void;
  clientIsDeclarante: boolean;
  setClientIsDeclarante: (v: boolean) => void;
}) {
  return (
    <div className="space-y-12">
      <ChapterHeading
        ordinal="III"
        title="Los acentos"
        kicker="El menú se siente premium en los detalles: gramaje correcto, restricciones respetadas, comunicación clara con cocina."
      />

      {/* Porciones por plato */}
      <div className="space-y-3">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-ink/55">
          § Tamaño de cada plato
        </p>
        {items.map((it) => (
          <div
            key={it.menuItemId}
            className="border border-ink/15 bg-cream-warm p-5 flex flex-wrap items-baseline justify-between gap-4"
          >
            <div>
              <h3 className="font-display text-xl text-ink leading-tight">
                {it.name}
              </h3>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/55 mt-1">
                {it.quantity} unidades · {formatCurrency(it.basePrice)} c/u
              </p>
            </div>
            <div className="flex gap-1.5">
              {[
                { v: 0.5, label: "Mini" },
                { v: 1, label: "Estándar" },
                { v: 1.5, label: "XL" },
              ].map((p) => {
                const active = (it.portionMultiplier ?? 1) === p.v;
                return (
                  <button
                    key={p.v}
                    onClick={() => updateItem(it.menuItemId, { portionMultiplier: p.v })}
                    className={
                      "px-4 py-2.5 font-sans text-[13px] tracking-tight border transition-colors " +
                      (active
                        ? "bg-ink text-cream border-ink"
                        : "bg-cream text-ink border-ink/25 hover:border-ink")
                    }
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <hr className="border-ink/15" />

      {/* Notas + restricciones */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-ink/55 mb-3">
            § Notas del evento
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Detalles logísticos, hora de montaje, accesos especiales…"
            className="w-full px-4 py-3 border border-ink/25 bg-cream font-sans text-base text-ink focus:outline-none focus:border-ink min-h-[140px]"
          />
        </div>
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-ink/55 mb-3">
            § Restricciones dietéticas
          </p>
          <textarea
            value={dietaryNotes}
            onChange={(e) => setDietaryNotes(e.target.value)}
            rows={4}
            placeholder="Alergias, comensales vegetarianos, kosher, halal…"
            className="w-full px-4 py-3 border border-ink/25 bg-cream font-sans text-base text-ink focus:outline-none focus:border-ink min-h-[140px]"
          />
        </div>
      </div>

      <hr className="border-ink/15" />

      {/* Régimen de retención (sus datos van en el Cap IV, junto al pago) */}
      <div className="max-w-2xl">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-ink/55 mb-3">
          § Régimen de retención
        </p>
        <p className="font-serif italic text-[13px] text-ink/60 leading-snug mb-3">
          Si su empresa retiene en la fuente, el desglose del próximo capítulo
          mostrará el neto que efectivamente recibirá Reina Verde.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setClientIsDeclarante(true)}
            className={
              "text-left px-4 py-3 border transition-colors " +
              (clientIsDeclarante
                ? "bg-ink text-cream border-ink"
                : "bg-cream text-ink border-ink/25 hover:border-ink")
            }
          >
            <span className="font-display text-lg leading-tight block">
              Mi empresa es agente retenedor declarante
            </span>
            <span
              className={
                "font-serif italic text-sm " +
                (clientIsDeclarante ? "text-cream/65" : "text-ink/55")
              }
            >
              Aplica ReteFuente 4 % · ReteIVA 15 % · ReteICA municipal
            </span>
          </button>
          <button
            onClick={() => setClientIsDeclarante(false)}
            className={
              "text-left px-4 py-3 border transition-colors " +
              (!clientIsDeclarante
                ? "bg-ink text-cream border-ink"
                : "bg-cream text-ink border-ink/25 hover:border-ink")
            }
          >
            <span className="font-display text-lg leading-tight block">
              No es agente retenedor
            </span>
            <span
              className={
                "font-serif italic text-sm " +
                (!clientIsDeclarante ? "text-cream/65" : "text-ink/55")
              }
            >
              ReteFuente 6 % aplicable si corresponde
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CAPÍTULO IV · La cuenta — el reveal dramático + datos del comprador
// ═══════════════════════════════════════════════════════════════
function ChapterCuenta({
  breakdown,
  previewing,
  isAuthenticated,
  user,
  guestData,
  setGuestData,
}: {
  breakdown: PricingBreakdown | null;
  previewing: boolean;
  isAuthenticated: boolean;
  user: { email: string; firstName: string; lastName: string } | null;
  guestData: { email: string; firstName: string; lastName: string; phone: string };
  setGuestData: (d: { email: string; firstName: string; lastName: string; phone: string }) => void;
}) {
  return (
    <div className="space-y-10">
      <ChapterHeading
        ordinal="IV"
        title="La cuenta"
        kicker="El precio se compone de materia prima, mano de obra prestacional, costos indirectos, logística y los impuestos colombianos que correspondan."
      />

      {breakdown ? (
        <DramaticTotal
          amount={breakdown.total}
          label="Total a pagar"
          caption={
            breakdown.regime === "COMMON" && breakdown.vat.amount > 0
              ? `Incluye IVA 19 % y ICA municipal de ${breakdown.city}.`
              : breakdown.simple.amount > 0
                ? `Tarifa única de Régimen Simple aplicada.`
                : `Reina Verde no es responsable de IVA. El total incluye costo, mano de obra prestacional, empaque y logística — sin impuestos al consumidor.`
          }
        />
      ) : (
        <div className="bg-cream-warm border border-ink/15 px-8 py-14 text-center">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
            {previewing ? "Calculando el desglose…" : "Falta información del evento"}
          </p>
        </div>
      )}

      {breakdown && (
        <div className="space-y-6">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-ink/55">
            § Desglose por componente
          </p>
          <ul className="border-y border-ink/15 divide-y divide-ink/10">
            {[
              { label: "Materia prima (CMP)", val: breakdown.cmpTotal },
              { label: "Mano de obra (CMO · ×1.6 prestacional)", val: breakdown.cmoTotal },
              { label: "Costos indirectos (CIF)", val: breakdown.cifTotal },
              ...(breakdown.packagingTotal > 0
                ? [{ label: "Empaque", val: breakdown.packagingTotal }]
                : []),
              { label: `Logística · ${breakdown.city}`, val: breakdown.transportTotal },
              { label: `Margen operativo (${(breakdown.marginPercent * 100).toFixed(0)} %)`, val: breakdown.marginAmount },
            ].map((r) => (
              <li
                key={r.label}
                className="grid grid-cols-[1fr_auto] gap-6 py-4 items-baseline"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/65">
                  {r.label}
                </span>
                <span className="font-display text-2xl tabular text-ink">
                  {formatCurrency(r.val)}
                </span>
              </li>
            ))}
            {breakdown.volumeDiscount.applies && (
              <li className="grid grid-cols-[1fr_auto] gap-6 py-4 items-baseline">
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-marigold-deep">
                  Descuento por volumen ({breakdown.volumeDiscount.minGuests}+ pax)
                </span>
                <span className="font-display text-2xl tabular text-marigold-deep">
                  − {formatCurrency(breakdown.volumeDiscount.amount)}
                </span>
              </li>
            )}
            {breakdown.seasonal.applies && (
              <li className="grid grid-cols-[1fr_auto] gap-6 py-4 items-baseline">
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-marigold-deep">
                  Ajuste estacional · {breakdown.seasonal.seasonName}
                </span>
                <span className="font-display text-2xl tabular text-ink">
                  {breakdown.seasonal.amount > 0 ? "+ " : "− "}
                  {formatCurrency(Math.abs(breakdown.seasonal.amount))}
                </span>
              </li>
            )}
          </ul>

          {/* Retenciones — solo si hay impuestos retenibles */}
          {breakdown.retentions.total > 0 && (
            <div className="bg-cream-warm border border-ink/15 p-6">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-marigold-deep mb-3">
                § Retenciones estimadas
              </p>
              <p className="font-serif italic text-base text-ink/70 leading-snug max-w-2xl">
                Si su empresa es agente retenedor, descuenta estos valores al
                pagar la factura. Reina Verde recibe el neto.
              </p>
              <ul className="mt-4 grid sm:grid-cols-2 gap-x-8 gap-y-2">
                {breakdown.regime === "COMMON" && breakdown.retentions.reteFuente.amount > 0 && (
                  <li className="flex justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-ink/65">
                    ReteFuente
                    <span className="font-display tabular text-ink not-italic">
                      − {formatCurrency(breakdown.retentions.reteFuente.amount)}
                    </span>
                  </li>
                )}
                {breakdown.regime === "COMMON" && breakdown.retentions.reteIva.amount > 0 && (
                  <li className="flex justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-ink/65">
                    ReteIVA
                    <span className="font-display tabular text-ink not-italic">
                      − {formatCurrency(breakdown.retentions.reteIva.amount)}
                    </span>
                  </li>
                )}
                {breakdown.retentions.reteIca.amount > 0 && (
                  <li className="flex justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-ink/65">
                    ReteICA
                    <span className="font-display tabular text-ink not-italic">
                      − {formatCurrency(breakdown.retentions.reteIca.amount)}
                    </span>
                  </li>
                )}
                <li className="flex justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-ink font-semibold border-t border-ink/15 pt-2 mt-2 sm:col-span-2">
                  Neto a girar a Reina Verde
                  <span className="font-display tabular text-ink not-italic">
                    {formatCurrency(breakdown.netReceivable)}
                  </span>
                </li>
              </ul>
            </div>
          )}

          {/* Caso "no responsable de IVA" — banda explicativa */}
          {breakdown.retentions.total === 0 && (
            <div className="bg-cream-warm border border-ink/15 p-6">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-marigold-deep mb-2">
                § Sin retenciones
              </p>
              <p className="font-serif italic text-base text-ink/70 leading-snug max-w-2xl">
                Reina Verde no es responsable de IVA. La factura no incluye
                impuestos discriminados, por lo tanto no aplican retenciones.
                El total que ve es el total que Reina Verde recibe.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Datos del comprador — solo si guest, justo antes del botón de pago */}
      {!isAuthenticated && (
        <GuestCheckoutInline
          value={guestData}
          onChange={setGuestData}
          caption="Sin crear cuenta. Tras el pago le enviamos un link para activarla."
        />
      )}
      {isAuthenticated && user && (
        <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
          Cotizando como{" "}
          <span className="text-ink not-italic">
            {user.firstName} {user.lastName}
          </span>{" "}
          · {user.email}
        </p>
      )}

      <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/45 max-w-prose">
        Al confirmar se genera una cotización formal (PDF descargable) y se
        lanza el cobro vía Bold. Pago 100 % adelantado.
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CAPÍTULO V · El cierre
// ═══════════════════════════════════════════════════════════════
function ChapterCierre({
  bold,
  quoteNumber,
  quoteId,
}: {
  bold: BoldConfig;
  quoteNumber: string | null;
  quoteId: string | null;
}) {
  return (
    <div className="space-y-8">
      <ChapterHeading
        ordinal="V"
        title="El cierre"
        kicker={`Cotización ${quoteNumber ?? ""}. Un solo paso: confirmar el pago. El recibo y la factura DIAN llegan a su correo en minutos.`}
      />

      <DramaticTotal
        amount={bold.amount}
        label="Listo para cobrar"
        caption="Pago seguro vía Bold. Acepta tarjetas, PSE, Nequi y Bancolombia."
        size="md"
      />

      <div className="bg-cream-warm border border-ink/15 p-8 sm:p-10">
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

      {/* Documentos descargables del cliente */}
      {quoteId && (
        <div className="pt-6 border-t border-ink/15">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-marigold-deep mb-3">
            § Documentos de su cotización
          </p>
          <p className="font-serif italic text-base text-ink/70 leading-snug mb-5 max-w-2xl">
            Puede descargar la cotización formal o la lista de insumos que se
            comprarán para su evento, incluso antes de confirmar el pago.
          </p>
          <QuoteDocumentsPanel quoteId={quoteId} quoteNumber={quoteNumber} />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Heading editorial reutilizable
// ═══════════════════════════════════════════════════════════════
function ChapterHeading({
  ordinal,
  title,
  kicker,
}: {
  ordinal: string;
  title: string;
  kicker: string;
}) {
  return (
    <header className="space-y-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-marigold-deep">
        § Capítulo {ordinal}
      </p>
      <h2 className="font-display font-light tracking-[-0.03em] leading-[0.92] text-ink text-4xl sm:text-5xl lg:text-[64px]">
        {title}
        <span className="text-marigold">.</span>
      </h2>
      <p className="font-serif italic text-lg sm:text-xl text-ink/70 leading-snug max-w-2xl">
        {kicker}
      </p>
    </header>
  );
}
