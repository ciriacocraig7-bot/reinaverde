"use client";

/**
 * <QuoteDocumentsPanel/> — bloque editorial con los dos documentos que el
 * cliente puede llevarse de la cotización:
 *
 *  · Cotización (PDF) — desglose tributario completo, base gravable, retenciones.
 *  · Lista de compras (PDF + impresión directa) — qué insumos se compran
 *    específicamente para su evento, sin costos ni proveedores.
 *
 * Reusado por: el Cap V del wizard de cotizar y la página de confirmación
 * post-pago.
 */
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

interface ShoppingItem {
  name: string;
  category: string;
  unit: string;
  totalQuantity: number;
}

interface ShoppingResult {
  items: ShoppingItem[];
  groupedByCategory: Record<string, ShoppingItem[]>;
  event: {
    quoteNumber: string;
    eventDate: string;
    eventCity: string;
    guestCount: number;
  };
}

interface Props {
  quoteId: string;
  quoteNumber: string | null;
  /** "compact" = lado a lado con dos botones; "expanded" = ambos en bloque grande. */
  layout?: "compact" | "expanded";
}

export function QuoteDocumentsPanel({
  quoteId,
  quoteNumber,
  layout = "expanded",
}: Props) {
  const [showList, setShowList] = useState(false);
  const [list, setList] = useState<ShoppingResult | null>(null);
  const [loadingList, setLoadingList] = useState(false);

  const toggleList = async () => {
    if (showList) {
      setShowList(false);
      return;
    }
    setShowList(true);
    if (list) return;
    setLoadingList(true);
    try {
      const res = await fetch(`/api/catering/quotes/${quoteId}/shopping-list`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setList(data);
    } catch (e) {
      toast.error(`No pude cargar la lista: ${(e as Error).message}`);
      setShowList(false);
    } finally {
      setLoadingList(false);
    }
  };

  const printList = () => {
    // Imprime SOLO el bloque marcado print:visible.
    // Usamos window.print() y el CSS @media print esconde todo lo demás.
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* ─── Botones de descarga ─── */}
      <div
        className={
          layout === "compact"
            ? "grid sm:grid-cols-2 gap-3"
            : "grid sm:grid-cols-2 gap-4"
        }
      >
        <Link
          href={`/api/catering/quotes/${quoteId}/pdf`}
          target="_blank"
          className="group block border border-ink/15 bg-cream-warm p-5 hover:border-ink hover:bg-cream transition-colors"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-marigold-deep">
              § Cotización
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/45">
              PDF
            </span>
          </div>
          <p className="font-display text-2xl tracking-tight text-ink leading-tight">
            Descargar cotización
          </p>
          <p className="mt-2 font-serif italic text-[13px] text-ink/65 leading-snug">
            Desglose completo: CMP, mano de obra, empaque, IVA, ICA y
            retenciones estimadas. Listo para llevar a su contador.
          </p>
          <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink group-hover:text-marigold-deep transition-colors">
            Abrir PDF →
          </p>
        </Link>

        <button
          type="button"
          onClick={toggleList}
          className="text-left border border-ink/15 bg-cream-warm p-5 hover:border-ink hover:bg-cream transition-colors group"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-marigold-deep">
              § Insumos del evento
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/45">
              {showList ? "Ocultar" : "Ver / imprimir"}
            </span>
          </div>
          <p className="font-display text-2xl tracking-tight text-ink leading-tight">
            Lista de compras
          </p>
          <p className="mt-2 font-serif italic text-[13px] text-ink/65 leading-snug">
            Cada ingrediente que se compra fresco específicamente para su
            evento, con cantidad calculada y agrupado por tipo.
          </p>
          <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink group-hover:text-marigold-deep transition-colors">
            {showList ? "▴ Cerrar" : "▾ Abrir lista"}
          </p>
        </button>
      </div>

      {/* ─── Vista expandida del shopping list ─── */}
      {showList && (
        <div id="rv-print-zone" className="border border-ink/15 bg-cream">
          <div className="px-6 py-5 border-b border-ink/15 flex items-baseline justify-between flex-wrap gap-3 print:hidden">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-ink/55">
              § Insumos · {quoteNumber ?? "—"}
            </p>
            <div className="flex gap-3">
              <Link
                href={`/api/catering/quotes/${quoteId}/shopping-list/pdf`}
                target="_blank"
                className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-marigold-deep hover:text-ink transition-colors"
              >
                ↓ Descargar PDF
              </Link>
              <button
                onClick={printList}
                className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-marigold-deep hover:text-ink transition-colors"
              >
                🖨︎ Imprimir
              </button>
            </div>
          </div>

          <div className="p-6 print:p-0">
            {/* Header editorial visible al imprimir */}
            <div className="hidden print:block mb-6">
              <p className="font-display text-3xl text-ink">Reina · Verde</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/65 mt-1">
                Insumos del evento · {list?.event.quoteNumber}
              </p>
              <p className="font-serif italic text-[14px] text-ink/65 mt-1">
                {list && new Date(list.event.eventDate).toLocaleDateString("es-CO", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}{" "}
                · {list?.event.eventCity} · {list?.event.guestCount} comensales
              </p>
            </div>

            {loadingList ? (
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55 py-6">
                Cargando…
              </p>
            ) : !list || list.items.length === 0 ? (
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55 py-6">
                Esta cotización no tiene insumos asociados todavía.
              </p>
            ) : (
              <div className="space-y-5">
                {Object.entries(list.groupedByCategory).map(([cat, items]) => (
                  <div key={cat} className="break-inside-avoid">
                    <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-marigold-deep border-b border-marigold-deep/60 pb-1 mb-2">
                      § {cat}
                    </p>
                    <ul className="divide-y divide-ink/10">
                      {items.map((it) => (
                        <li
                          key={it.name}
                          className="flex items-baseline justify-between py-1.5"
                        >
                          <span className="font-serif text-base text-ink">
                            {it.name}
                          </span>
                          <span className="font-display tabular text-base text-ink ml-4 shrink-0">
                            {it.totalQuantity}{" "}
                            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
                              {it.unit}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/45 pt-4 border-t border-ink/15 text-center">
                  {list.items.length} insumos distintos · compra fresca para su evento
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CSS de impresión: oculta todo lo que no esté dentro de #rv-print-zone */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #rv-print-zone,
          #rv-print-zone * {
            visibility: visible;
          }
          #rv-print-zone {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
