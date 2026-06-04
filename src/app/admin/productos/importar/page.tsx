"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  DashHeader,
  Panel,
  ActionBtn,
  StatusPill,
} from "@/components/dashboard/primitives";

interface PreviewRow {
  line: number;
  raw: Record<string, string>;
  errors: string[];
  ready: null | { name: string; price: number; businessLine: string; categorySlug: string };
}

interface PreviewResult {
  dryRun: boolean;
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    created?: number;
    updated?: number;
  };
  valid?: PreviewRow[];
  invalid?: PreviewRow[];
}

const TEMPLATE_CSV =
  "businessLine,categorySlug,name,slug,shortDesc,description,price,comparePrice,sku,weight,unit,stock,lowStock,tags,badge,isFeatured,isActive,image,images\n" +
  "PHARMA,aceites,Producto demo,producto-demo,Descripción corta,Descripción larga,180000,200000,RV-DEMO-001,30 ml,botella,20,5,bestseller|cbd,Bestseller,true,true,,\n";

export default function ImportarProductosPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runImport = async (dryRun: boolean) => {
    if (!file) {
      toast.error("Selecciona un CSV primero");
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("dryRun", dryRun ? "true" : "false");
      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        body: form,
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setPreview(d);
      if (!dryRun) {
        toast.success(
          `Importación completada · ${d.summary.created ?? 0} creados, ${d.summary.updated ?? 0} actualizados`,
        );
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla-productos-reinaverde.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <DashHeader
        eyebrow="§ Catálogo · Bulk"
        title={
          <>
            Importar <span className="italic">CSV</span>
            <span className="text-marigold">.</span>
          </>
        }
      />

      <Panel index="01" title="1 · Plantilla">
        <div className="px-6 py-5 space-y-3">
          <p className="font-serif italic text-base text-ink/70 leading-snug max-w-2xl">
            Descarga la plantilla, llénala con tus productos y súbela. Tags e
            imágenes van separadas por <code className="font-mono text-[12px] bg-cream-warm px-1">|</code>.
            La línea de negocio acepta <span className="font-mono">PHARMA</span>,{" "}
            <span className="font-mono">LIOFILIZADOS</span> o{" "}
            <span className="font-mono">CATERING</span>; <code className="font-mono text-[12px] bg-cream-warm px-1">categorySlug</code>{" "}
            debe coincidir con un slug existente en{" "}
            <Link href="/admin/categorias" className="underline">
              /admin/categorias
            </Link>
            .
          </p>
          <ActionBtn variant="outline" onClick={downloadTemplate}>
            ↓ Descargar plantilla CSV
          </ActionBtn>
        </div>
      </Panel>

      <Panel index="02" title="2 · Subir y previsualizar">
        <div className="px-6 py-5 space-y-4">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setPreview(null);
            }}
            className="block font-mono text-[12px] text-ink/70"
          />
          {file && (
            <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/55">
              Archivo: {file.name} · {(file.size / 1024).toFixed(1)} KB
            </p>
          )}
          <div className="flex gap-2">
            <ActionBtn
              variant="outline"
              onClick={() => runImport(true)}
              disabled={!file || loading}
            >
              {loading ? "Procesando…" : "Previsualizar (dry-run)"}
            </ActionBtn>
            <ActionBtn
              variant="ink"
              onClick={() => runImport(false)}
              disabled={!file || loading || !preview}
            >
              Importar definitivamente
            </ActionBtn>
          </div>
        </div>
      </Panel>

      {preview && (
        <Panel
          index="03"
          title="3 · Resultado"
          meta={`${preview.summary.totalRows} filas · ${preview.summary.validRows} válidas · ${preview.summary.invalidRows} inválidas`}
        >
          <div className="px-6 py-5 space-y-5">
            {preview.summary.created !== undefined && (
              <div className="flex gap-3 flex-wrap">
                <StatusPill tone="success" label={`${preview.summary.created} creados`} />
                <StatusPill tone="info" label={`${preview.summary.updated} actualizados`} />
                {preview.summary.invalidRows > 0 && (
                  <StatusPill
                    tone="danger"
                    label={`${preview.summary.invalidRows} con errores`}
                  />
                )}
              </div>
            )}

            {(preview.invalid?.length ?? 0) > 0 && (
              <div>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-persimmon mb-2">
                  § Filas con errores
                </p>
                <div className="border border-persimmon/40 bg-persimmon/10">
                  {preview.invalid!.map((r) => (
                    <div
                      key={r.line}
                      className="px-4 py-2 border-b border-persimmon/15 last:border-b-0"
                    >
                      <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/65">
                        Línea {r.line} · {r.raw.name ?? "(sin nombre)"}
                      </p>
                      <ul className="mt-1 list-disc list-inside font-sans text-[12px] text-persimmon">
                        {r.errors.map((e, i) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(preview.valid?.length ?? 0) > 0 && (
              <div>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-marigold-deep mb-2">
                  § Filas válidas (preview)
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-ink/15">
                        <th className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55">
                          Línea
                        </th>
                        <th className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55">
                          Producto
                        </th>
                        <th className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55">
                          Categoría
                        </th>
                        <th className="px-3 py-2 text-right font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55">
                          Precio
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/10">
                      {preview.valid!.slice(0, 50).map((r) => (
                        <tr key={r.line}>
                          <td className="px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink/65">
                            {r.ready!.businessLine}
                          </td>
                          <td className="px-3 py-2 font-display text-base text-ink">
                            {r.ready!.name}
                          </td>
                          <td className="px-3 py-2 font-mono text-[11px] text-ink/65">
                            {r.ready!.categorySlug}
                          </td>
                          <td className="px-3 py-2 text-right font-display tabular text-ink">
                            {new Intl.NumberFormat("es-CO", {
                              style: "currency",
                              currency: "COP",
                              minimumFractionDigits: 0,
                            }).format(r.ready!.price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {preview.valid!.length > 50 && (
                    <p className="px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/45">
                      … y {preview.valid!.length - 50} más
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Panel>
      )}
    </>
  );
}
