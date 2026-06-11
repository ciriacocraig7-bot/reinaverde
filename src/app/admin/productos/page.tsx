"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  DashHeader,
  Panel,
  StatusPill,
} from "@/components/dashboard/primitives";
import { BulkActionBar } from "@/components/admin/bulk-action-bar";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  businessLine: "PHARMA" | "LIOFILIZADOS" | "CATERING";
  categoryId: string;
  categoryName: string;
  name: string;
  slug: string;
  image: string | null;
  images: string[];
  sku: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
  lowStock: number;
  tags: string[];
  badge: string | null;
  isFeatured: boolean;
  isActive: boolean;
  updatedAt: string;
}

interface Category {
  id: string;
  businessLine: string;
  name: string;
  slug: string;
}

const LINES = ["", "PHARMA", "LIOFILIZADOS"] as const;
const STATUSES = ["", "active", "paused"] as const;

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLine, setFilterLine] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterLine) params.set("businessLine", filterLine);
    if (filterCategory) params.set("category", filterCategory);
    if (filterStatus) params.set("status", filterStatus);
    if (search.trim()) params.set("q", search.trim());
    try {
      const res = await fetch(`/api/admin/products?${params}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setProducts(d.products ?? []);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/admin/product-categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []));
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterLine, filterCategory, filterStatus]);

  const filteredCategories = useMemo(
    () =>
      filterLine
        ? categories.filter((c) => c.businessLine === filterLine)
        : categories,
    [categories, filterLine],
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (selected.size === products.length) setSelected(new Set());
    else setSelected(new Set(products.map((p) => p.id)));
  };
  const clearSelection = () => setSelected(new Set());

  const runBulk = async (
    action: "pause" | "resume" | "feature" | "unfeature" | "delete",
  ) => {
    const ids = [...selected];
    const res = await fetch("/api/admin/products/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ids }),
    });
    const d = await res.json();
    if (!res.ok) {
      toast.error(d.error ?? "Error en bulk");
      return;
    }
    toast.success(`${d.affected} producto(s) actualizado(s)`);
    clearSelection();
    load();
  };

  const runTagBulk = async (kind: "tag" | "untag") => {
    const tag = prompt(kind === "tag" ? "Agregar tag:" : "Quitar tag:");
    if (!tag) return;
    const ids = [...selected];
    const res = await fetch("/api/admin/products/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: kind, ids, payload: { tag } }),
    });
    const d = await res.json();
    if (!res.ok) {
      toast.error(d.error ?? "Error");
      return;
    }
    toast.success(`${d.affected} producto(s) actualizado(s)`);
    clearSelection();
    load();
  };

  const restoreOne = async (id: string) => {
    const res = await fetch("/api/admin/products/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resume", ids: [id] }),
    });
    const d = await res.json();
    if (!res.ok) {
      toast.error(d.error ?? "Error al restaurar");
      return;
    }
    toast.success("Producto restaurado");
    load();
  };

  const runMoveCategory = async (categoryId: string) => {
    const ids = [...selected];
    const res = await fetch("/api/admin/products/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "moveCategory", ids, payload: { categoryId } }),
    });
    const d = await res.json();
    if (!res.ok) {
      toast.error(d.error ?? "Error al mover");
      return;
    }
    toast.success(`${d.affected} producto(s) movido(s) de categoría`);
    clearSelection();
    load();
  };

  return (
    <>
      <DashHeader
        eyebrow="§ Catálogo · Editor"
        title={
          <>
            <span className="italic">Productos</span>
            <span className="text-marigold">.</span>
          </>
        }
      >
        <Link
          href="/admin/productos/importar"
          className="inline-flex items-center h-10 px-5 border border-ink/30 hover:border-ink hover:bg-ink hover:text-cream font-sans text-[13px] tracking-tight transition-colors"
        >
          ↑ Importar CSV
        </Link>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex items-center h-10 px-5 bg-marigold text-ink font-sans text-[13px] tracking-tight rv-press hover:bg-marigold-deep hover:text-cream transition-colors"
        >
          + Nuevo producto
        </Link>
      </DashHeader>

      <Panel index="01" title="Filtros">
        <div className="px-6 py-5 grid grid-cols-1 lg:grid-cols-4 gap-3">
          <select
            value={filterLine}
            onChange={(e) => setFilterLine(e.target.value)}
            className="h-11 px-3 border border-ink/25 bg-cream font-sans text-[14px] text-ink focus:outline-none focus:border-ink"
          >
            {LINES.map((l) => (
              <option key={l} value={l}>
                {l === "" ? "Todas las líneas" : l}
              </option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-11 px-3 border border-ink/25 bg-cream font-sans text-[14px] text-ink focus:outline-none focus:border-ink"
          >
            <option value="">Todas las categorías</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.businessLine} · {c.name}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-11 px-3 border border-ink/25 bg-cream font-sans text-[14px] text-ink focus:outline-none focus:border-ink"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "" ? "Cualquier estado" : s === "active" ? "Activos" : "Pausados"}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              placeholder="Buscar por nombre, SKU o slug…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
              className="flex-1 h-11 px-3 border border-ink/25 bg-cream font-sans text-[14px] text-ink focus:outline-none focus:border-ink"
            />
            <button
              onClick={load}
              className="h-11 px-4 bg-ink text-cream font-sans text-[13px] tracking-tight rv-press hover:bg-ink-soft transition-colors"
            >
              Buscar
            </button>
          </div>
        </div>
      </Panel>

      <Panel
        index="02"
        title="Catálogo"
        meta={loading ? "Cargando…" : `${products.length} productos`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink/15">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={
                      products.length > 0 && selected.size === products.length
                    }
                    onChange={toggleAll}
                  />
                </th>
                <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55">
                  Producto
                </th>
                <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55">
                  Línea / Categoría
                </th>
                <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55">
                  Stock
                </th>
                <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55">
                  Precio
                </th>
                <th className="px-4 py-3 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-ink/55">
                  Estado
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {products.map((p) => (
                <tr key={p.id} className={selected.has(p.id) ? "bg-cream-warm" : ""}>
                  <td className="px-4 py-3 align-top">
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggle(p.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-12 w-12 object-cover border border-ink/15"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-cream-warm border border-ink/15 flex items-center justify-center font-mono text-[10px] text-ink/55">
                          —
                        </div>
                      )}
                      <div>
                        <p className="font-display text-base text-ink leading-tight">
                          {p.name}
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
                          {p.sku ?? "sin SKU"} · {p.slug}
                        </p>
                        {p.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {p.tags.slice(0, 4).map((t) => (
                              <span
                                key={t}
                                className="font-mono text-[9px] uppercase tracking-[0.18em] border border-ink/15 px-1.5 py-0.5"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ink/65">
                    {p.businessLine} · {p.categoryName}
                  </td>
                  <td className="px-4 py-3 text-right font-display text-base tabular text-ink">
                    {p.stock}
                    <span
                      className={
                        "font-mono text-[9.5px] uppercase tracking-[0.18em] ml-2 " +
                        (p.stock <= p.lowStock
                          ? "text-persimmon"
                          : "text-ink/45")
                      }
                    >
                      {p.stock <= p.lowStock ? "BAJO" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-display text-base tabular text-ink">
                    {formatCurrency(p.price)}
                    {p.comparePrice && p.comparePrice > p.price && (
                      <span className="block font-mono text-[10px] line-through text-ink/45">
                        {formatCurrency(p.comparePrice)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <StatusPill
                        tone={p.isActive ? "success" : "muted"}
                        label={p.isActive ? "Activo" : "Pausado"}
                      />
                      {p.isFeatured && (
                        <StatusPill tone="warn" label="Destacado" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-col items-end gap-1.5">
                      {!p.isActive && (
                        <button
                          onClick={() => restoreOne(p.id)}
                          className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-iris hover:text-ink transition-colors"
                        >
                          ↺ Restaurar
                        </button>
                      )}
                      <Link
                        href={`/admin/productos/${p.id}/editar`}
                        className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-marigold-deep hover:text-ink transition-colors"
                      >
                        Editar →
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && products.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/45"
                  >
                    Sin productos con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <BulkActionBar
        count={selected.size}
        onClear={clearSelection}
        actions={[
          { key: "pause",      label: "Pausar",     variant: "outline",   onRun: () => runBulk("pause") },
          { key: "resume",     label: "Activar",    variant: "ink",       onRun: () => runBulk("resume") },
          { key: "feature",    label: "Destacar",   variant: "marigold",  onRun: () => runBulk("feature") },
          { key: "unfeature",  label: "Quitar destacado", variant: "outline", onRun: () => runBulk("unfeature") },
          { key: "tag",        label: "+ Tag",      variant: "iris",      onRun: () => runTagBulk("tag") },
          { key: "untag",      label: "− Tag",      variant: "outline",   onRun: () => runTagBulk("untag") },
          { key: "delete",     label: "Eliminar",   variant: "danger",
            confirm: `¿Eliminar ${selected.size} producto(s)? Se ocultan del catálogo. No se borran de la base — puedes restaurarlos filtrando por "Pausados".`,
            onRun: () => runBulk("delete") },
        ]}
        selects={
          filteredCategories.length > 0
            ? [
                {
                  key: "moveCategory",
                  label: "Mover a categoría…",
                  options: filteredCategories.map((c) => ({
                    value: c.id,
                    label: `${c.businessLine} · ${c.name}`,
                  })),
                  onSelect: runMoveCategory,
                },
              ]
            : undefined
        }
      />
    </>
  );
}
