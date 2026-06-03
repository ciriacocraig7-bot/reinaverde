"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { EditorialRule } from "@/components/marketing/editorial";
import { useQuoteBuilder } from "@/stores/quote-builder-store";

function ConfirmacionInner() {
  const params = useSearchParams();
  const quoteId = params.get("quote");
  const reset = useQuoteBuilder((s) => s.reset);
  const [quoteNumber, setQuoteNumber] = useState<string | null>(null);

  useEffect(() => {
    // Cargar info de la quote para mostrar número + link de PDF.
    if (!quoteId) return;
    fetch(`/api/catering/quotes/${quoteId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.quote?.quoteNumber) setQuoteNumber(d.quote.quoteNumber);
      })
      .catch(() => {});
    // Limpiar el builder solo después de que el pago volvió OK.
    reset();
  }, [quoteId, reset]);

  return (
    <section className="max-w-[1400px] mx-auto px-6 sm:px-10 py-20 sm:py-32">
      <div className="grid grid-cols-12 gap-x-6">
        <div className="col-span-12 lg:col-span-3 mb-10 lg:mb-0">
          <EditorialRule index="05" label="Confirmación" />
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-marigold">
            Pago recibido
          </p>
          {quoteNumber && (
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55">
              {quoteNumber}
            </p>
          )}
        </div>

        <div className="col-span-12 lg:col-span-9">
          <h1 className="font-display font-light tracking-[-0.035em] leading-[0.92] text-ink text-6xl sm:text-7xl lg:text-[120px]">
            Gracias.
            <br />
            <span className="italic">Recibimos su pedido</span>
            <span className="text-marigold">.</span>
          </h1>

          <p className="mt-10 font-serif italic text-xl sm:text-2xl leading-snug text-ink/75 max-w-2xl">
            La transacción quedó confirmada por Bold. En las próximas horas le
            enviaremos un correo con el comprobante y el desglose completo.
          </p>

          <div className="mt-16 max-w-3xl">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55 mb-6">
              Qué sigue
            </p>
            <ol className="border-t border-ink/15">
              {[
                "El equipo de producción recibe la orden y empieza el calendario de compras.",
                "Confirmación de menú final y horarios en 24h.",
                "Factura electrónica DIAN al evento.",
                "Coordinación de logística 72h antes del evento.",
              ].map((s, i) => (
                <li
                  key={s}
                  className="grid grid-cols-[60px_1fr] sm:grid-cols-[100px_1fr] gap-x-6 py-5 border-b border-ink/15"
                >
                  <span className="font-display text-3xl text-ink/40 tabular leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-serif text-lg leading-snug text-ink/85">{s}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-12 flex flex-wrap gap-4">
            {quoteId && (
              <Link
                href={`/api/catering/quotes/${quoteId}/pdf`}
                className="inline-flex items-center h-12 px-7 bg-marigold text-ink font-sans text-[14px] tracking-tight rv-press hover:bg-cream"
              >
                Descargar cotización (PDF) →
              </Link>
            )}
            <Link
              href="/catering"
              className="inline-flex items-center h-12 px-7 border border-ink/40 text-ink font-sans text-[14px] tracking-tight hover:border-ink hover:bg-ink hover:text-cream transition-colors"
            >
              Volver a catering
            </Link>
            <Link
              href="/cliente"
              className="inline-flex items-center h-12 px-7 border border-ink/40 text-ink font-sans text-[14px] tracking-tight hover:border-ink hover:bg-ink hover:text-cream transition-colors"
            >
              Ir a mi panel
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function CotizarConfirmacionPage() {
  return (
    <>
      <SiteHeader line="catering" />
      <Suspense
        fallback={
          <div className="max-w-[1400px] mx-auto px-6 py-20 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55">
            Cargando confirmación…
          </div>
        }
      >
        <ConfirmacionInner />
      </Suspense>
      <SiteFooter />
    </>
  );
}
