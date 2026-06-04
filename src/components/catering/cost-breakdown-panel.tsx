/**
 * Sidebar editorial con el desglose completo de pricing.
 * Versión "client" — muestra costos resumidos (no detalles de CMP/CMO),
 * impuestos según régimen, total y retenciones estimadas en accordion.
 */
"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import type { PricingBreakdown } from "@/lib/pricing/types";

interface Props {
  breakdown: PricingBreakdown;
  expanded?: boolean;
}

export function CostBreakdownPanel({ breakdown: b, expanded }: Props) {
  const [showRetentions, setShowRetentions] = useState(expanded ?? false);
  const isCommon = b.regime === "COMMON";
  const hasAnyTax =
    b.vat.amount > 0 ||
    b.ica.amount > 0 ||
    b.simple.amount > 0 ||
    b.inc.amount > 0;
  const headerSubtitle = !hasAnyTax
    ? `${b.city} · Reina Verde no responsable de IVA`
    : `${b.city} · Régimen ${isCommon ? "común" : "simple"}`;

  return (
    <div className="border border-ink/15 bg-cream">
      {/* Header */}
      <div className="p-6 border-b border-ink/15">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-marigold-deep mb-2">
          § Desglose
        </p>
        <h3 className="font-display text-2xl text-ink leading-tight">
          {headerSubtitle}
        </h3>
      </div>

      {/* Costos */}
      <div className="px-6 py-4 space-y-1 border-b border-ink/15">
        <Line label="Materia prima (CMP)" value={b.cmpTotal} />
        <Line label="Mano de obra (CMO)" value={b.cmoTotal} />
        <Line label="Costos indirectos (CIF)" value={b.cifTotal} />
        {b.packagingTotal > 0 && (
          <Line label="Empaque" value={b.packagingTotal} />
        )}
        <Line
          label={`Logística · ${b.city}`}
          value={b.transportTotal}
        />
        <div className="pt-2 mt-2 border-t border-ink/10">
          <Line label="Costo total" value={b.costTotal} bold />
          <Line label={`Margen operativo (${(b.marginPercent * 100).toFixed(0)}%)`} value={b.marginAmount} />
        </div>
      </div>

      {/* Ajustes */}
      {(b.volumeDiscount.applies || b.seasonal.applies) && (
        <div className="px-6 py-4 space-y-1 border-b border-ink/15">
          {b.volumeDiscount.applies && (
            <Line
              label={`Descuento por volumen (${b.volumeDiscount.minGuests}+ pax)`}
              value={-b.volumeDiscount.amount}
              accent="discount"
            />
          )}
          {b.seasonal.applies && (
            <Line
              label={`Ajuste estacional · ${b.seasonal.seasonName}`}
              value={b.seasonal.amount}
              accent={b.seasonal.amount > 0 ? "warn" : "discount"}
            />
          )}
          <Line label="Base gravable" value={b.taxableBase} bold />
        </div>
      )}

      {/* Impuestos — sólo si hay alguno aplicado */}
      {hasAnyTax ? (
        <div className="px-6 py-4 space-y-1 border-b border-ink/15">
          {isCommon ? (
            <>
              {b.vat.amount > 0 && <Line label="IVA 19%" value={b.vat.amount} />}
              {b.ica.amount > 0 && (
                <Line
                  label={`ICA municipal (${(b.ica.rate * 1000).toFixed(2)}/1000)`}
                  value={b.ica.amount}
                />
              )}
            </>
          ) : (
            b.simple.amount > 0 && (
              <Line
                label={`Tarifa única RST (${(b.simple.rate * 100).toFixed(1)}%)`}
                value={b.simple.amount}
              />
            )
          )}
        </div>
      ) : (
        <div className="px-6 py-4 border-b border-ink/15">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
            Sin impuestos al consumidor
          </p>
          <p className="font-serif italic text-[13px] text-ink/65 leading-snug mt-1">
            Reina Verde no es responsable de IVA. El total que cobra es el
            costo + margen, sin discriminar impuestos en la factura.
          </p>
        </div>
      )}

      {/* Total */}
      <div className="px-6 py-5 bg-ink text-cream">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-cream/65">
          Total a pagar
        </p>
        <p className="font-display text-4xl tabular mt-1">
          {formatCurrency(b.total)}
        </p>
      </div>

      {/* Retenciones accordion — solo si hay algo retenible */}
      {hasAnyTax && b.retentions.total > 0 && (
        <button
          onClick={() => setShowRetentions(!showRetentions)}
          className="w-full px-6 py-4 flex items-center justify-between border-t border-ink/15 hover:bg-cream-warm transition-colors"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink/65 text-left">
            ¿Tu empresa es agente retenedor?
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-marigold-deep">
            {showRetentions ? "▴ Ocultar" : "▾ Ver retenciones"}
          </span>
        </button>
      )}

      {showRetentions && hasAnyTax && b.retentions.total > 0 && (
        <div className="px-6 py-4 space-y-1 border-t border-ink/15 bg-cream-warm">
          <p className="font-serif italic text-[13px] leading-snug text-ink/70 mb-3">
            Si tu empresa practica retenciones al momento del pago, este es
            el desglose estimado. Validar con tu contador.
          </p>
          {isCommon ? (
            <>
              <Line
                label="ReteFuente servicios (4%)"
                value={-b.retentions.reteFuente.amount}
                accent="discount"
              />
              <Line
                label="ReteIVA (15% del IVA)"
                value={-b.retentions.reteIva.amount}
                accent="discount"
              />
            </>
          ) : (
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/55 leading-relaxed py-1">
              Régimen Simple: normalmente NO sujeto a ReteFuente.
            </p>
          )}
          <Line
            label="ReteICA municipal"
            value={-b.retentions.reteIca.amount}
            accent="discount"
          />
          <div className="pt-2 mt-2 border-t border-ink/15">
            <Line label="Neto a girar a Reina Verde" value={b.netReceivable} bold />
          </div>
        </div>
      )}
    </div>
  );
}

function Line({
  label,
  value,
  bold,
  accent,
}: {
  label: string;
  value: number;
  bold?: boolean;
  accent?: "discount" | "warn";
}) {
  const color =
    accent === "discount"
      ? "text-ink/70"
      : accent === "warn"
        ? "text-marigold-deep"
        : "text-ink";
  return (
    <div className="flex items-baseline justify-between py-0.5">
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink/65">
        {label}
      </span>
      <span
        className={
          `font-display tabular ${color} ` + (bold ? "text-xl" : "text-base")
        }
      >
        {value < 0 ? "− " : ""}
        {formatCurrency(Math.abs(value))}
      </span>
    </div>
  );
}
