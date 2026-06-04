"use client";

/**
 * <ProductForm/> — formulario de producto pharma / liofilizados.
 *
 * Reusable: mode "create" para POST, mode "edit" para PATCH.
 * Incluye <ImageGallery> con multi-upload Vercel Blob.
 */
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Panel, ActionBtn } from "@/components/dashboard/primitives";
import { ImageGallery } from "@/components/admin/image-gallery";
import { formatCurrency, slugify } from "@/lib/utils";

interface Category {
  id: string;
  businessLine: string;
  name: string;
  slug: string;
}

export interface ProductFormInitial {
  id?: string;
  businessLine?: "PHARMA" | "LIOFILIZADOS" | "CATERING";
  categoryId?: string;
  name?: string;
  slug?: string;
  shortDesc?: string;
  description?: string;
  price?: number;
  comparePrice?: number;
  sku?: string;
  weight?: string;
  unit?: string;
  stock?: number;
  lowStock?: number;
  tags?: string[];
  badge?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  images?: string[];
  metadata?: Record<string, unknown> | null;
}

interface Props {
  mode: "create" | "edit";
  initial?: ProductFormInitial;
}

export function ProductForm({ mode, initial }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);

  const [businessLine, setBusinessLine] = useState<"PHARMA" | "LIOFILIZADOS" | "CATERING">(
    initial?.businessLine ?? "PHARMA",
  );
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);
  const [shortDesc, setShortDesc] = useState(initial?.shortDesc ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState<number>(initial?.price ?? 0);
  const [comparePrice, setComparePrice] = useState<number | "">(
    initial?.comparePrice ?? "",
  );
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [weight, setWeight] = useState(initial?.weight ?? "");
  const [unit, setUnit] = useState(initial?.unit ?? "");
  const [stock, setStock] = useState<number>(initial?.stock ?? 0);
  const [lowStock, setLowStock] = useState<number>(initial?.lowStock ?? 5);
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [badge, setBadge] = useState(initial?.badge ?? "");
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [seoTitle, setSeoTitle] = useState(
    (initial?.metadata?.seo as { title?: string })?.title ?? "",
  );
  const [seoDesc, setSeoDesc] = useState(
    (initial?.metadata?.seo as { description?: string })?.description ?? "",
  );
  const [seoKeywords, setSeoKeywords] = useState(
    (initial?.metadata?.seo as { keywords?: string })?.keywords ?? "",
  );

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/product-categories")
      .then((r) => r.json())
      .then((d) => {
        setCategories(d.categories ?? []);
        if (!initial?.categoryId && d.categories?.length > 0) {
          const first = (d.categories as Category[]).find(
            (c) => c.businessLine === businessLine,
          );
          if (first) setCategoryId(first.id);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categoryOptions = useMemo(
    () => categories.filter((c) => c.businessLine === businessLine),
    [categories, businessLine],
  );

  // Auto-slug si el user no lo tocó
  const onNameChange = (v: string) => {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (tags.includes(t)) return;
    setTags([...tags, t]);
    setTagInput("");
  };
  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const onSave = async () => {
    if (!name || !categoryId || price <= 0) {
      toast.error("Faltan campos obligatorios: nombre, categoría y precio.");
      return;
    }
    setSaving(true);
    try {
      const body = {
        businessLine,
        categoryId,
        name,
        slug: slug || slugify(name),
        shortDesc: shortDesc || undefined,
        description: description || undefined,
        price,
        comparePrice: comparePrice === "" ? undefined : comparePrice,
        sku: sku || undefined,
        weight: weight || undefined,
        unit: unit || undefined,
        stock,
        lowStock,
        tags,
        badge: badge || undefined,
        isFeatured,
        isActive,
        images,
        image: images[0] ?? null,
        metadata: {
          seo: {
            title: seoTitle || undefined,
            description: seoDesc || undefined,
            keywords: seoKeywords || undefined,
          },
        },
      };
      const url =
        mode === "edit"
          ? `/api/admin/products/${initial?.id}`
          : "/api/admin/products";
      const method = mode === "edit" ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error guardando");
      toast.success(mode === "edit" ? "Producto actualizado" : "Producto creado");
      router.push("/admin/productos");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Panel index="01" title="Datos básicos">
        <div className="grid sm:grid-cols-2 gap-4 px-6 py-5">
          <Field label="Línea de negocio">
            <select
              value={businessLine}
              onChange={(e) => {
                setBusinessLine(e.target.value as typeof businessLine);
                setCategoryId("");
              }}
              className={INPUT}
            >
              <option value="PHARMA">PHARMA</option>
              <option value="LIOFILIZADOS">LIOFILIZADOS</option>
              <option value="CATERING">CATERING</option>
            </select>
          </Field>
          <Field label="Categoría">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={INPUT}
            >
              <option value="">— elegir —</option>
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nombre">
            <input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className={INPUT}
              placeholder="Ej. Aceite CBD Full Spectrum 1000mg"
            />
          </Field>
          <Field label="Slug (URL)">
            <input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              className={INPUT}
              placeholder="aceite-cbd-1000mg"
            />
          </Field>
          <Field label="Descripción corta" className="sm:col-span-2">
            <input
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              className={INPUT}
              placeholder="Texto de una línea que aparece en las cards del catálogo."
            />
          </Field>
          <Field label="Descripción completa" className="sm:col-span-2">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className={INPUT + " min-h-[140px]"}
              placeholder="Detalles, beneficios, modo de uso, etc."
            />
          </Field>
        </div>
      </Panel>

      <Panel index="02" title="Imágenes">
        <div className="px-6 py-5">
          <ImageGallery
            value={images}
            onChange={setImages}
            prefix="product"
            hint="La primera imagen es la principal (aparece en el catálogo y como thumb)."
          />
        </div>
      </Panel>

      <Panel index="03" title="Precio · Stock · SKU">
        <div className="grid sm:grid-cols-3 gap-4 px-6 py-5">
          <Field label="Precio (COP)">
            <input
              type="number"
              min={0}
              step={100}
              value={price}
              onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
              className={INPUT}
            />
            <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-ink/45 mt-1">
              {formatCurrency(price)}
            </span>
          </Field>
          <Field label="Precio tachado (opcional)">
            <input
              type="number"
              min={0}
              step={100}
              value={comparePrice}
              onChange={(e) =>
                setComparePrice(
                  e.target.value === "" ? "" : Math.max(0, Number(e.target.value)),
                )
              }
              className={INPUT}
            />
          </Field>
          <Field label="SKU">
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className={INPUT}
              placeholder="Ej. RV-CBD-1000"
            />
          </Field>
          <Field label="Peso visible">
            <input
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className={INPUT}
              placeholder="Ej. 30 ml · 3.5 g · 50 g"
            />
          </Field>
          <Field label="Unidad de venta">
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className={INPUT}
              placeholder="botella · caja · sobre"
            />
          </Field>
          <Field label="Badge editorial">
            <input
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className={INPUT}
              placeholder="Ej. Bestseller · Premium · Edición limitada"
            />
          </Field>
          <Field label="Stock disponible">
            <input
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(Math.max(0, Number(e.target.value)))}
              className={INPUT}
            />
          </Field>
          <Field label="Stock bajo (alerta)">
            <input
              type="number"
              min={0}
              value={lowStock}
              onChange={(e) => setLowStock(Math.max(0, Number(e.target.value)))}
              className={INPUT}
            />
          </Field>
          <div className="flex flex-col gap-3 mt-2 sm:col-span-3">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink">
                Destacado en catálogo
              </span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink">
                Activo (visible en tienda)
              </span>
            </label>
          </div>
        </div>
      </Panel>

      <Panel index="04" title="Tags">
        <div className="px-6 py-5 space-y-3">
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] bg-ink text-cream px-2 py-1"
              >
                {t}
                <button
                  onClick={() => removeTag(t)}
                  className="text-cream/65 hover:text-cream"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              className={INPUT + " flex-1"}
              placeholder="Escribe un tag y Enter…"
            />
            <ActionBtn variant="outline" onClick={addTag}>
              Agregar
            </ActionBtn>
          </div>
        </div>
      </Panel>

      <Panel index="05" title="SEO">
        <div className="grid sm:grid-cols-2 gap-4 px-6 py-5">
          <Field label="Title (SEO)">
            <input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className={INPUT}
              placeholder="Ej. Aceite CBD 1000mg · Reina Verde Pharma"
            />
          </Field>
          <Field label="Keywords (coma-separadas)">
            <input
              value={seoKeywords}
              onChange={(e) => setSeoKeywords(e.target.value)}
              className={INPUT}
              placeholder="aceite cbd, bienestar, full spectrum"
            />
          </Field>
          <Field label="Description (SEO)" className="sm:col-span-2">
            <textarea
              value={seoDesc}
              onChange={(e) => setSeoDesc(e.target.value)}
              rows={3}
              className={INPUT + " min-h-[88px]"}
              placeholder="Texto de 150-160 caracteres que aparece en resultados de Google."
            />
          </Field>
        </div>
      </Panel>

      <div className="flex justify-end gap-3 pt-2">
        <ActionBtn
          variant="outline"
          onClick={() => router.push("/admin/productos")}
          disabled={saving}
        >
          Cancelar
        </ActionBtn>
        <ActionBtn variant="ink" onClick={onSave} disabled={saving}>
          {saving ? "Guardando…" : mode === "edit" ? "Guardar cambios" : "Publicar producto"}
        </ActionBtn>
      </div>
    </div>
  );
}

const INPUT =
  "w-full h-11 px-3 border border-ink/25 bg-cream font-sans text-[14px] text-ink focus:outline-none focus:border-ink";

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
