"use client";

/**
 * <ImageGallery/> — multi-upload con drag-reorder + delete.
 *
 * Recibe `value: string[]` (URLs públicas Vercel Blob) y onChange.
 * Sube los archivos seleccionados al endpoint POST /api/admin/upload con
 * el prefix indicado y agrega las URLs al array.
 *
 * Reusable por products, menu items, eventos.
 */
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
  prefix?: "product" | "menu" | "ingredient" | "event" | "user";
  /** Mensaje opcional bajo la galería. */
  hint?: string;
  max?: number;
}

export function ImageGallery({
  value,
  onChange,
  prefix = "product",
  hint,
  max = 12,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragSrcIndex = useRef<number | null>(null);

  const upload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      if (value.length + files.length > max) {
        toast.error(`Máximo ${max} imágenes`);
        return;
      }
      setUploading(true);
      const next = [...value];
      try {
        for (const file of files) {
          const form = new FormData();
          form.append("file", file);
          form.append("prefix", prefix);
          const res = await fetch("/api/admin/upload", {
            method: "POST",
            body: form,
            credentials: "include",
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Error subiendo");
          next.push(data.url);
        }
        onChange(next);
        toast.success(`${files.length} imagen${files.length > 1 ? "es" : ""} subida${files.length > 1 ? "s" : ""}`);
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        setUploading(false);
      }
    },
    [value, onChange, prefix, max],
  );

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    upload(Array.from(files));
  };

  const onDropZone = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      upload(Array.from(e.dataTransfer.files));
    }
  };

  const remove = (i: number) => {
    const next = value.filter((_, idx) => idx !== i);
    onChange(next);
  };

  // Drag-reorder entre miniaturas
  const onDragStart = (i: number) => () => {
    dragSrcIndex.current = i;
  };
  const onDragOverThumb = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const onDropThumb = (i: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const src = dragSrcIndex.current;
    dragSrcIndex.current = null;
    if (src == null || src === i) return;
    const next = [...value];
    const [moved] = next.splice(src, 1);
    next.splice(i, 0, moved);
    onChange(next);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDropZone}
        className={cn(
          "border-2 border-dashed bg-cream-warm transition-colors",
          dragOver ? "border-marigold-deep bg-marigold/10" : "border-ink/20",
        )}
      >
        <div className="p-5">
          <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.28em] text-ink/55">
              § Galería · {value.length} de {max}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || value.length >= max}
                className="px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] bg-ink text-cream rv-press hover:bg-ink-soft disabled:opacity-50 transition-colors"
              >
                {uploading ? "Subiendo…" : "+ Subir imágenes"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => onFiles(e.target.files)}
                className="hidden"
              />
            </div>
          </div>

          {value.length === 0 ? (
            <p className="font-serif italic text-[13px] text-ink/55 text-center py-8 leading-snug">
              Arrastra archivos aquí, o usa el botón "Subir imágenes".<br />
              JPG / PNG / WebP · hasta 8 MB cada uno.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {value.map((url, i) => (
                <div
                  key={url + i}
                  draggable
                  onDragStart={onDragStart(i)}
                  onDragOver={onDragOverThumb}
                  onDrop={onDropThumb(i)}
                  className={cn(
                    "group relative aspect-square bg-cream border border-ink/15 overflow-hidden",
                    i === 0 ? "ring-1 ring-marigold-deep" : "",
                  )}
                  title={i === 0 ? "Imagen principal" : "Arrastrar para reordenar"}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Imagen ${i + 1}`}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                  {i === 0 && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-marigold-deep text-cream font-mono text-[9px] uppercase tracking-[0.18em]">
                      principal
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="absolute top-1 right-1 h-6 w-6 bg-ink text-cream font-mono text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Eliminar"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {hint && (
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/45">
          {hint}
        </p>
      )}
    </div>
  );
}
