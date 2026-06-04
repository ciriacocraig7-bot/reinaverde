"use client";

/**
 * /admin/pedidos/[id]
 *
 * Detalle de pedido para el admin. Misma información que /cliente/pedidos/[id]
 * pero con la capacidad de cambiar el estado del pedido.
 * Reutiliza el mismo endpoint /api/cliente/pedidos/[id] para leer (el admin
 * tiene acceso) y /api/admin/pedidos/[id] PATCH para escribir.
 */
import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { formatCurrency, cn } from "@/lib/utils";
import {
  DashHeader,
  StatusPill,
  ActionBtn,
} from "@/components/dashboard/primitives";

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
  client: { name: string; email: string };
  event?: Record<string, unknown>;
  shippingInfo?: Record<string, unknown>;
  items: Array<{
    name: string;
    image: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string | null;
  }>;
  timeline: TimelineStep[];
  businessLine: "CATERING" | "PHARMA" | "LIOFILIZADOS";
  pdfUrl: string | null;
  shoppingListUrl: string | null;
  notes?: string | null;
  dietaryNotes?: string | null;
}

const STATUS_MAP: Record<string, { label: string; tone: "neutral" | "info" | "warn" | "success" | "danger" | "muted" }> = {
  DRAFT: { label: "Borrador", tone: "muted" },
  SENT: { label: "Cotizado", tone: "info" },
  PAYMENT_PENDING: { label: "Pend. pago", tone: "warn" },
  PAID: { label: "Pagado", tone: "success" },
  IN_PRODUCTION: { label: "En cocina", tone: "info" },
  READY: { label: "Listo", tone: "success" },
  IN_TRANSIT: { label: "En camino", tone: "warn" },
  DELIVERED: { label: "Entregado", tone: "success" },
  COMPLETED: { label: "Completado", tone: "success" },
  CANCELLED: { label: "Cancelado", tone: "danger" },
  PENDING: { label: "Pendiente", tone: "warn" },
  CONFIRMED: { label: "Confirmado", tone: "info" },
  PROCESSING: { label: "Preparando", tone: "info" },
  SHIPPED: { label: "Despachado", tone: "warn" },
  REFUNDED: { label: "Reembolsado", tone: "muted" },
};

const CATERING_TRANSITIONS: Record<string, string[]> = {
  PAYMENT_PENDING: ["PAID", "CANCELLED"],
  PAID: ["IN_PRODUCTION", "CANCELLED"],
  IN_PRODUCTION: ["READY"],
  READY: ["IN_TRANSIT"],
  IN_TRANSIT: ["DELIVERED"],
  DELIVERED: ["COMPLETED"],
};

const SHOP_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PAID", "CANCELLED"],
  PAID: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["COMPLETED"],
};

export default function AdminPedidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState(false);

  const load = () =>
    fetch(`/api/cliente/pedidos/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setOrder(d);
      })
      .catch((e) => toast.error(e.message));

  useEffect(() => {
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const changeStatus = async (newStatus: string) => {
    if (!confirm(`¿Cambiar estado a "${STATUS_MAP[newStatus]?.label ?? newStatus}"?`)) return;
    setChanging(true);
    try {
      const res = await fetch(`/api/admin/pedidos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Estado actualizado a ${STATUS_MAP[newStatus]?.label ?? newStatus}`);
      await load(); // Refresh
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setChanging(false);
    }
  };

  if (loading || !order) {
    return (
      <>
        <DashHeader eyebrow="§ Pedido" title={<>{loading ? "Cargando…" : "No encontrado"}</>} />
        {!loading && (
          <Link href="/admin" className="font-mono text-[11px] uppercase tracking-[0.22em] text-marigold-deep underline px-2">
            ← Volver al tablero
          </Link>
        )}
      </>
    );
  }

  const statusInfo = STATUS_MAP[order.status] ?? { label: order.status, tone: "muted" as const };
  const transitions =
    order.kind === "catering-order"
      ? CATERING_TRANSITIONS[order.status] ?? []
      : order.kind === "shop-order"
        ? SHOP_TRANSITIONS[order.status] ?? []
        : [];

  const accent =
    order.businessLine === "PHARMA"
      ? "iris"
      : order.businessLine === "LIOFILIZADOS"
        ? "persimmon"
        : "marigold";

  const accentText =
    accent === "iris"
      ? "text-iris-deep"
      : accent === "persimmon"
        ? "text-persimmon"
        : "text-marigold-deep";

  const accentBg =
    accent === "iris"
      ? "bg-iris/15"
      : accent === "persimmon"
        ? "bg-persimmon/15"
        : "bg-marigold/15";

  const accentDot =
    accent === "iris"
      ? "bg-iris"
      : accent === "persimmon"
        ? "bg-persimmon"
        : "bg-marigold";

  return (
    <>
      <DashHeader
        eyebrow="§ Admin · Detalle"
        title={
          <>
            {order.reference}
            <span className={accent === "marigold" ? "text-marigold" : accent === "iris" ? "text-iris" : "text-persimmon"}>
              .
            </span>
          </>
        }
      >
        <Link href="/admin">
          <ActionBtn variant="outline">← Tablero</ActionBtn>
        </Link>
      </DashHeader>

      {/* Status + Transition buttons */}
      <div className={cn("border border-ink/15 p-6 sm:p-8", accentBg)}>
        <div className="flex flex-wrap items-baseline gap-4 mb-6">
          <StatusPill tone={statusInfo.tone} label={statusInfo.label} />
          <span className={cn("font-mono text-[10.5px] uppercase tracking-[0.22em]", accentText)}>
            {order.businessLine}
          </span>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
            {order.client.name} · {order.client.email}
          </span>
          <span className="font-display text-2xl tabular text-ink ml-auto">
            {formatCurrency(order.total)}
          </span>
        </div>

        {/* Timeline */}
        <div className="flex items-start gap-0 overflow-x-auto pb-2 mb-6">
          {order.timeline.map((step, i) => (
            <div key={i} className="flex items-start flex-1 min-w-[110px]">
              <div className="flex flex-col items-center mr-3">
                <div
                  className={cn(
                    "h-4 w-4 rounded-full border-2 shrink-0",
                    step.status === "done"
                      ? `${accentDot} border-transparent`
                      : step.status === "current"
                        ? `bg-cream ${accentDot.replace("bg-", "border-")} ring-4 ${accentBg}`
                        : "bg-cream border-ink/25",
                  )}
                />
                {i < order.timeline.length - 1 && (
                  <div className={cn("w-0.5 h-6", step.status === "done" ? accentDot : "bg-ink/15")} />
                )}
              </div>
              <div className="pt-0.5">
                <p className={cn("font-mono text-[10.5px] uppercase tracking-[0.18em]", step.status === "current" ? "text-ink font-semibold" : step.status === "done" ? "text-ink/75" : "text-ink/40")}>
                  {step.label}
                </p>
                {step.date && (
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink/45">
                    {new Date(step.date).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Transition buttons */}
        {transitions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-ink/15">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55 self-center mr-2">
              Mover a →
            </span>
            {transitions.map((t) => {
              const info = STATUS_MAP[t] ?? { label: t, tone: "muted" as const };
              const variant =
                t === "CANCELLED"
                  ? "danger"
                  : info.tone === "success"
                    ? "ink"
                    : info.tone === "info"
                      ? "iris"
                      : info.tone === "warn"
                        ? "marigold"
                        : ("outline" as "ink" | "outline" | "marigold" | "iris" | "persimmon" | "danger");
              return (
                <ActionBtn
                  key={t}
                  variant={variant}
                  onClick={() => changeStatus(t)}
                  disabled={changing}
                  className="h-9 px-4"
                >
                  {info.label}
                </ActionBtn>
              );
            })}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="border border-ink/15 bg-cream">
        <div className="px-6 py-4 border-b border-ink/15">
          <p className={cn("font-mono text-[10.5px] uppercase tracking-[0.28em]", accentText)}>
            § Items · {order.items.length}
          </p>
        </div>
        <ul className="divide-y divide-ink/10">
          {order.items.map((it, i) => (
            <li key={i} className="grid grid-cols-[auto_1fr_auto] gap-4 px-6 py-4 items-center">
              {it.image ? (
                <div className="relative h-12 w-12 border border-ink/15 overflow-hidden shrink-0">
                  <Image src={it.image} alt={it.name} fill sizes="48px" className="object-cover" />
                </div>
              ) : (
                <div className="h-12 w-12 bg-cream-warm border border-ink/15 flex items-center justify-center font-mono text-[10px] text-ink/45 shrink-0">
                  —
                </div>
              )}
              <div>
                <p className="font-display text-base text-ink">{it.name}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
                  {it.quantity}× · {formatCurrency(it.unitPrice)} c/u
                  {it.notes ? ` · ${it.notes}` : ""}
                </p>
              </div>
              <span className="font-display text-base tabular text-ink shrink-0">
                {formatCurrency(it.totalPrice)}
              </span>
            </li>
          ))}
        </ul>
        <div className="border-t border-ink/15 px-6 py-4 flex justify-between items-baseline">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink font-semibold">Total</span>
          <span className="font-display text-2xl tabular text-ink">{formatCurrency(order.total)}</span>
        </div>
      </div>

      {/* Documents */}
      {(order.pdfUrl || order.shoppingListUrl) && (
        <div className="flex flex-wrap gap-3">
          {order.pdfUrl && (
            <Link
              href={order.pdfUrl}
              target="_blank"
              className="inline-flex items-center h-10 px-5 border border-ink/30 hover:border-ink font-sans text-[13px] tracking-tight transition-colors hover:bg-cream-warm"
            >
              Cotización PDF →
            </Link>
          )}
          {order.shoppingListUrl && (
            <Link
              href={order.shoppingListUrl}
              target="_blank"
              className="inline-flex items-center h-10 px-5 border border-ink/30 hover:border-ink font-sans text-[13px] tracking-tight transition-colors hover:bg-cream-warm"
            >
              Lista de compras PDF →
            </Link>
          )}
        </div>
      )}
    </>
  );
}
