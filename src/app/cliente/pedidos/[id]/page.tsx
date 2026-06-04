"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { formatCurrency, cn } from "@/lib/utils";
import { StatusPill, ActionBtn } from "@/components/dashboard/primitives";

interface TimelineStep {
  label: string;
  status: "done" | "current" | "pending";
  date?: string;
}

interface OrderDetail {
  kind: "catering-order" | "shop-order" | "quote";
  id: string;
  reference: string;
  status: string;
  total: number;
  subtotal?: number;
  tax?: number;
  discount?: number;
  shipping?: number;
  createdAt: string;
  expiresAt?: string;
  client: { name: string; email: string };
  event?: {
    quoteNumber?: string;
    quoteId?: string;
    city?: string | null;
    address?: string | null;
    date: string;
    time?: string;
    guestCount?: number;
    momentTypes?: string[];
  };
  shippingInfo?: {
    name: string;
    address: string;
    city: string;
    phone: string;
    notes?: string | null;
    trackingNumber?: string | null;
  };
  items: Array<{
    name: string;
    image: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string | null;
    slug?: string;
  }>;
  timeline: TimelineStep[];
  businessLine: "CATERING" | "PHARMA" | "LIOFILIZADOS";
  pdfUrl: string | null;
  shoppingListUrl: string | null;
  notes?: string | null;
  dietaryNotes?: string | null;
}

const STATUS_MAP: Record<string, { label: string; tone: "neutral" | "info" | "warn" | "success" | "danger" | "muted" }> = {
  DRAFT:            { label: "Borrador",      tone: "muted" },
  SENT:             { label: "Cotizado",      tone: "info" },
  PAYMENT_PENDING:  { label: "Pend. pago",    tone: "warn" },
  PAID:             { label: "Pagado",        tone: "success" },
  IN_PRODUCTION:    { label: "En cocina",     tone: "info" },
  READY:            { label: "Listo",         tone: "success" },
  IN_TRANSIT:       { label: "En camino",     tone: "warn" },
  DELIVERED:        { label: "Entregado",     tone: "success" },
  COMPLETED:        { label: "Completado",    tone: "success" },
  CANCELLED:        { label: "Cancelado",     tone: "danger" },
  PENDING:          { label: "Pendiente",     tone: "warn" },
  CONFIRMED:        { label: "Confirmado",    tone: "info" },
  PROCESSING:       { label: "Preparando",    tone: "info" },
  SHIPPED:          { label: "Despachado",    tone: "warn" },
  REFUNDED:         { label: "Reembolsado",   tone: "muted" },
  EXPIRED:          { label: "Expirado",      tone: "muted" },
};

const ACCENT: Record<string, { dot: string; bg: string; text: string }> = {
  CATERING:     { dot: "bg-marigold",   bg: "bg-marigold/15", text: "text-marigold-deep" },
  PHARMA:       { dot: "bg-iris",       bg: "bg-iris/15",     text: "text-iris-deep" },
  LIOFILIZADOS: { dot: "bg-persimmon",  bg: "bg-persimmon/15",text: "text-persimmon" },
};

export default function PedidoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/cliente/pedidos/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setOrder(d);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const line =
    order?.businessLine === "CATERING"
      ? "catering"
      : order?.businessLine === "PHARMA"
        ? "pharma"
        : "liofilizados";

  const accent = ACCENT[order?.businessLine ?? "CATERING"];
  const statusInfo = STATUS_MAP[order?.status ?? ""] ?? { label: order?.status, tone: "muted" as const };

  if (loading) {
    return (
      <>
        <SiteHeader line={line as "catering"} />
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 py-24 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55">
          Cargando pedido…
        </div>
        <SiteFooter />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <SiteHeader line="hub" />
        <div className="max-w-[1500px] mx-auto px-6 sm:px-10 py-24 text-center">
          <h1 className="font-display text-4xl text-ink mb-4">Pedido no encontrado</h1>
          <Link href="/cliente" className="font-mono text-[11px] uppercase tracking-[0.22em] text-marigold-deep underline">
            ← Volver a mi panel
          </Link>
        </div>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader line={line as "catering"} />

      {/* ════════════════ HERO ════════════════ */}
      <section className="max-w-[1500px] mx-auto px-6 sm:px-10 pt-12 sm:pt-16 pb-8">
        <Link
          href="/cliente"
          className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55 hover:text-ink transition-colors mb-6 inline-block"
        >
          ← Mis pedidos
        </Link>

        <div className="flex flex-wrap items-baseline gap-4 sm:gap-6 mb-4">
          <h1 className="font-display font-light tracking-[-0.03em] leading-[0.92] text-ink text-4xl sm:text-5xl lg:text-6xl">
            {order.reference}
          </h1>
          <StatusPill tone={statusInfo.tone} label={statusInfo.label} />
          <span className={cn("font-mono text-[10.5px] uppercase tracking-[0.22em]", accent.text)}>
            {order.businessLine}
          </span>
        </div>

        <p className="font-serif italic text-lg text-ink/70 leading-snug max-w-2xl">
          {order.kind === "catering-order" && order.event
            ? `Evento en ${order.event.city ?? "—"} · ${order.event.guestCount ?? "—"} comensales · ${formatDate(order.event.date)}`
            : order.kind === "shop-order" && order.shippingInfo
              ? `Envío a ${order.shippingInfo.city} · ${order.shippingInfo.name}`
              : `Cotización ${order.reference}`}
        </p>
      </section>

      {/* ════════════════ TIMELINE VISUAL ════════════════ */}
      <section className="max-w-[1500px] mx-auto px-6 sm:px-10 pb-12">
        <div className={cn("border p-6 sm:p-8", accent.bg, "border-ink/15")}>
          <p className={cn("font-mono text-[10.5px] uppercase tracking-[0.28em] mb-6", accent.text)}>
            § Estado del pedido
          </p>
          <div className="flex items-start gap-0 overflow-x-auto pb-2">
            {order.timeline.map((step, i) => (
              <div key={i} className="flex items-start flex-1 min-w-[120px]">
                {/* Dot + line */}
                <div className="flex flex-col items-center mr-3">
                  <div
                    className={cn(
                      "h-4 w-4 rounded-full border-2 shrink-0",
                      step.status === "done"
                        ? `${accent.dot} border-transparent`
                        : step.status === "current"
                          ? `bg-cream ${accent.dot.replace("bg-", "border-")} ring-4 ${accent.bg}`
                          : "bg-cream border-ink/25",
                    )}
                  />
                  {i < order.timeline.length - 1 && (
                    <div
                      className={cn(
                        "w-0.5 h-8",
                        step.status === "done" ? accent.dot : "bg-ink/15",
                      )}
                    />
                  )}
                </div>
                {/* Label */}
                <div className="pt-0.5">
                  <p
                    className={cn(
                      "font-mono text-[11px] uppercase tracking-[0.18em]",
                      step.status === "current"
                        ? "text-ink font-semibold"
                        : step.status === "done"
                          ? "text-ink/75"
                          : "text-ink/40",
                    )}
                  >
                    {step.label}
                  </p>
                  {step.date && (
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/45 mt-0.5">
                      {formatDate(step.date)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ ITEMS ════════════════ */}
      <section className="max-w-[1500px] mx-auto px-6 sm:px-10 pb-12">
        <div className="border border-ink/15 bg-cream">
          <div className="px-6 py-5 border-b border-ink/15 flex items-baseline justify-between">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-ink/55">
              § Items del pedido
            </p>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
              {order.items.length} {order.items.length === 1 ? "item" : "items"}
            </p>
          </div>
          {order.items.length === 0 ? (
            <p className="px-6 py-8 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55 text-center">
              {order.kind === "quote"
                ? "Los items se reflejan cuando la cotización se convierte en orden."
                : "Sin items detallados."}
            </p>
          ) : (
            <ul className="divide-y divide-ink/10">
              {order.items.map((it, i) => (
                <li key={i} className="grid grid-cols-[auto_1fr_auto] gap-4 px-6 py-4 items-center">
                  {it.image ? (
                    <div className="relative h-14 w-14 border border-ink/15 overflow-hidden shrink-0">
                      <Image
                        src={it.image}
                        alt={it.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-14 w-14 bg-cream-warm border border-ink/15 flex items-center justify-center font-mono text-[10px] text-ink/45 shrink-0">
                      —
                    </div>
                  )}
                  <div>
                    <p className="font-display text-lg text-ink leading-tight">{it.name}</p>
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/55 mt-0.5">
                      {it.quantity}× · {formatCurrency(it.unitPrice)} c/u
                      {it.notes ? ` · ${it.notes}` : ""}
                    </p>
                  </div>
                  <span className="font-display text-lg tabular text-ink shrink-0">
                    {formatCurrency(it.totalPrice)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Totales */}
          <div className="border-t border-ink/15 px-6 py-5 space-y-2">
            {order.subtotal != null && (
              <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-ink/65">
                <span>Subtotal</span>
                <span className="font-display tabular text-ink text-base">
                  {formatCurrency(order.subtotal)}
                </span>
              </div>
            )}
            {(order.tax ?? 0) > 0 && (
              <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-ink/65">
                <span>Impuestos</span>
                <span className="font-display tabular text-ink text-base">
                  {formatCurrency(order.tax!)}
                </span>
              </div>
            )}
            {(order.shipping ?? 0) > 0 && (
              <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-ink/65">
                <span>Envío</span>
                <span className="font-display tabular text-ink text-base">
                  {formatCurrency(order.shipping!)}
                </span>
              </div>
            )}
            {(order.discount ?? 0) > 0 && (
              <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-marigold-deep">
                <span>Descuento</span>
                <span className="font-display tabular text-base">
                  − {formatCurrency(order.discount!)}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-3 mt-3 border-t border-ink/15">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink font-semibold">
                Total
              </span>
              <span className="font-display text-2xl tabular text-ink">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ INFO ADICIONAL ════════════════ */}
      <section className="max-w-[1500px] mx-auto px-6 sm:px-10 pb-12">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Evento o envío */}
          {order.event && (
            <div className="border border-ink/15 bg-cream-warm p-6">
              <p className={cn("font-mono text-[10.5px] uppercase tracking-[0.28em] mb-3", accent.text)}>
                § Detalles del evento
              </p>
              <InfoRow label="Ciudad" value={order.event.city ?? "—"} />
              <InfoRow label="Dirección" value={order.event.address ?? "—"} />
              <InfoRow label="Fecha" value={formatDate(order.event.date)} />
              <InfoRow label="Hora" value={order.event.time ?? "—"} />
              <InfoRow label="Comensales" value={String(order.event.guestCount ?? "—")} />
              {order.event.momentTypes && order.event.momentTypes.length > 0 && (
                <InfoRow label="Momentos" value={order.event.momentTypes.join(", ")} />
              )}
            </div>
          )}
          {order.shippingInfo && (
            <div className="border border-ink/15 bg-cream-warm p-6">
              <p className={cn("font-mono text-[10.5px] uppercase tracking-[0.28em] mb-3", accent.text)}>
                § Datos de envío
              </p>
              <InfoRow label="Destinatario" value={order.shippingInfo.name} />
              <InfoRow label="Dirección" value={order.shippingInfo.address} />
              <InfoRow label="Ciudad" value={order.shippingInfo.city} />
              <InfoRow label="Teléfono" value={order.shippingInfo.phone || "—"} />
              {order.shippingInfo.trackingNumber && (
                <InfoRow label="Guía de envío" value={order.shippingInfo.trackingNumber} />
              )}
              {order.shippingInfo.notes && (
                <InfoRow label="Notas" value={order.shippingInfo.notes} />
              )}
            </div>
          )}

          {/* Documentos + acciones */}
          <div className="border border-ink/15 bg-cream p-6 space-y-4">
            <p className={cn("font-mono text-[10.5px] uppercase tracking-[0.28em] mb-3", accent.text)}>
              § Acciones
            </p>
            {order.pdfUrl && (
              <Link
                href={order.pdfUrl}
                target="_blank"
                className="block w-full text-left px-4 py-3 border border-ink/20 hover:border-ink hover:bg-cream-warm transition-colors"
              >
                <p className="font-display text-base text-ink">Descargar cotización (PDF)</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55 mt-1">
                  Desglose completo para su contador
                </p>
              </Link>
            )}
            {order.shoppingListUrl && (
              <Link
                href={order.shoppingListUrl}
                target="_blank"
                className="block w-full text-left px-4 py-3 border border-ink/20 hover:border-ink hover:bg-cream-warm transition-colors"
              >
                <p className="font-display text-base text-ink">Lista de compras (PDF)</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55 mt-1">
                  Insumos que se compran para su evento
                </p>
              </Link>
            )}
            {(order.notes || order.dietaryNotes) && (
              <div className="pt-3 border-t border-ink/15 space-y-2">
                {order.notes && (
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">Notas</p>
                    <p className="font-serif text-[14px] text-ink/75 leading-snug">{order.notes}</p>
                  </div>
                )}
                {order.dietaryNotes && (
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">Restricciones</p>
                    <p className="font-serif text-[14px] text-ink/75 leading-snug">{order.dietaryNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════ CTA ════════════════ */}
      <section className="max-w-[1500px] mx-auto px-6 sm:px-10 pb-20 flex flex-wrap gap-3 justify-center">
        <Link
          href="/cliente"
          className="inline-flex items-center h-12 px-7 border border-ink/40 text-ink font-sans text-[14px] tracking-tight hover:border-ink hover:bg-ink hover:text-cream transition-colors"
        >
          ← Mis pedidos
        </Link>
        <Link
          href="/catering/cotizar"
          className="inline-flex items-center h-12 px-7 bg-ink text-cream font-sans text-[14px] tracking-tight rv-press hover:bg-ink-soft transition-colors"
        >
          Cotizar nuevo evento →
        </Link>
      </section>

      <SiteFooter />
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between py-1.5 border-b border-ink/10 last:border-b-0">
      <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/55">
        {label}
      </span>
      <span className="font-display text-base text-ink">{value}</span>
    </div>
  );
}

function formatDate(d: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(d));
}
