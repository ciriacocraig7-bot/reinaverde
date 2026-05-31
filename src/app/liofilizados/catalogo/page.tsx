"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useLiofilizadosCart } from "@/stores/shop-cart-store";
import { useProducts, type ProductData } from "@/hooks/use-products";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { EditorialRule, PriceTag } from "@/components/marketing/editorial";
import { imageForLiofilizados } from "@/lib/product-images";
import { cn } from "@/lib/utils";

const FALLBACK_PRODUCTS: ProductData[] = [
  { id: "lf-1", name: "Mango Liofilizado Premium", slug: "mango-liofilizado-premium", price: 28000, badge: "Popular", icon: "nutrition", shortDesc: "Rodajas de mango colombiano. Crujientes y dulces. 50g.", weight: "50g", tags: [], stock: 100, isFeatured: true, category: { id: "fl-1", name: "Tropicales", slug: "tropicales" } },
  { id: "lf-2", name: "Piña Golden Liofilizada", slug: "pina-golden-liofilizada", price: 25000, badge: "Tropical", icon: "nutrition", shortDesc: "Trozos de piña Gold seleccionada. Sabor intenso. 50g.", weight: "50g", tags: [], stock: 80, isFeatured: false, category: { id: "fl-1", name: "Tropicales", slug: "tropicales" } },
  { id: "lf-3", name: "Maracuyá en Polvo", slug: "maracuya-en-polvo", price: 32000, badge: "Versátil", icon: "blender", shortDesc: "Polvo puro de maracuyá para batidos, postres y coctelería. 100g.", weight: "100g", tags: [], stock: 60, isFeatured: false, category: { id: "fl-1", name: "Tropicales", slug: "tropicales" } },
  { id: "lf-4", name: "Mix Berries Colombianas", slug: "mix-berries-colombianas", price: 35000, badge: "Antioxidante", icon: "energy_savings_leaf", shortDesc: "Uchuva, mora, arándano y fresa. Mezcla energizante. 60g.", weight: "60g", tags: [], stock: 70, isFeatured: true, category: { id: "fl-2", name: "Berries", slug: "berries" } },
  { id: "lf-5", name: "Uchuvas Liofilizadas", slug: "uchuvas-liofilizadas", price: 30000, badge: "Superfood", icon: "energy_savings_leaf", shortDesc: "Uchuvas enteras crujientes. Alto contenido de vitamina C. 40g.", weight: "40g", tags: [], stock: 55, isFeatured: false, category: { id: "fl-2", name: "Berries", slug: "berries" } },
  { id: "lf-6", name: "Snack Mix Tropical", slug: "snack-mix-tropical", price: 22000, badge: "Ready-to-eat", icon: "lunch_dining", shortDesc: "Mango, piña y banano. Snack perfecto para cualquier momento. 40g.", weight: "40g", tags: [], stock: 120, isFeatured: false, category: { id: "fl-3", name: "Snacks", slug: "snacks" } },
  { id: "lf-7", name: "Kit Repostería Premium", slug: "kit-reposteria-premium", price: 65000, badge: "Chef Grade", icon: "bakery_dining", shortDesc: "4 variedades en polvo + trozos para decoración. 200g total.", weight: "200g", tags: [], stock: 30, isFeatured: true, category: { id: "fl-4", name: "Repostería", slug: "reposteria" } },
  { id: "lf-8", name: "Bulk Mango 1kg", slug: "bulk-mango-1kg", price: 320000, badge: "B2B", icon: "local_shipping", shortDesc: "Presentación mayorista. Ideal para restaurantes y exportación.", weight: "1kg", tags: [], stock: 15, isFeatured: false, category: { id: "fl-5", name: "Mayorista", slug: "mayorista" } },
  { id: "lf-9", name: "Guanábana Liofilizada", slug: "guanabana-liofilizada", price: 38000, badge: "Exótico", icon: "nutrition", shortDesc: "Trozos de guanábana con sabor cremoso intenso. Edición limitada. 50g.", weight: "50g", tags: [], stock: 40, isFeatured: false, category: { id: "fl-1", name: "Tropicales", slug: "tropicales" } },
];

const FALLBACK_CATEGORIES = ["Todos", "Tropicales", "Berries", "Snacks", "Repostería", "Mayorista"];

export default function LiofilizadosCatalogoPage() {
  const [filter, setFilter] = useState("Todos");
  const addItem = useLiofilizadosCart((s) => s.addItem);
  const cartCount = useLiofilizadosCart((s) => s.itemCount());
  const { products, categories } = useProducts({
    businessLine: "LIOFILIZADOS",
    fallbackProducts: FALLBACK_PRODUCTS,
    fallbackCategories: FALLBACK_CATEGORIES,
  });
  const filtered =
    filter === "Todos" ? products : products.filter((p) => p.category.name === filter);

  const handleAdd = (p: ProductData) => {
    addItem({
      productId: p.id,
      name: p.name,
      icon: p.icon || "nutrition",
      unitPrice: p.price,
      quantity: 1,
      weight: p.weight || undefined,
    });
    toast.success(`${p.name} agregado`);
  };

  return (
    <>
      <SiteHeader line="liofilizados" />

      {/* Catalog header */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 pt-12">
        <div className="grid grid-cols-12 gap-x-6 mb-12">
          <div className="col-span-12 lg:col-span-3 mb-4 lg:mb-0">
            <EditorialRule index="03" label="Catálogo" />
          </div>
          <div className="col-span-12 lg:col-span-9">
            <h1 className="font-display font-light tracking-[-0.03em] leading-[0.92] text-ink text-6xl sm:text-7xl lg:text-8xl">
              Inventario,
              <br />
              <span className="italic">por familia</span>
              <span className="text-persimmon">.</span>
            </h1>
          </div>
        </div>

        {/* Filter row — editorial nav, not pills */}
        <div className="border-y border-ink/15 py-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-8 whitespace-nowrap">
            {categories.map((cat: string) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  "relative font-mono text-[11.5px] uppercase tracking-[0.22em] py-1 transition-colors",
                  filter === cat ? "text-ink" : "text-ink/45 hover:text-ink/75",
                )}
              >
                {cat}
                <span className="ml-2 font-mono text-[10px] text-ink/35">
                  {cat === "Todos"
                    ? products.length
                    : products.filter((p) => p.category.name === cat).length}
                </span>
                {filter === cat && (
                  <span
                    className="absolute -bottom-[18px] left-0 right-0 h-px bg-persimmon"
                    aria-hidden
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product grid — editorial cards */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-t border-l border-ink/15">
          {filtered.map((p, i) => (
            <article
              key={p.id}
              className="group p-7 border-r border-b border-ink/15 flex flex-col bg-cream hover:bg-persimmon/[0.04] transition-colors"
            >
              <div className="flex items-baseline justify-between mb-5">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-persimmon">
                  N° {String(i + 1).padStart(3, "0")}
                </span>
                {p.weight && (
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink/50">
                    {p.weight}
                  </span>
                )}
              </div>

              {/* product photograph */}
              <div className="relative h-44 mb-6 bg-cream-warm border border-ink/10 overflow-hidden">
                {imageForLiofilizados(p.slug) ? (
                  <Image
                    src={imageForLiofilizados(p.slug)!}
                    alt={p.name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-ink/30"
                      style={{ fontSize: "56px", fontVariationSettings: "'FILL' 1" }}
                    >
                      {p.icon || "nutrition"}
                    </span>
                  </div>
                )}
              </div>

              <h3 className="font-display text-2xl tracking-tight text-ink leading-tight mb-2 min-h-[64px]">
                {p.name}
              </h3>
              <p className="font-serif italic text-[14px] leading-snug text-ink/65 mb-6 line-clamp-2">
                {p.shortDesc || p.description}
              </p>

              <div className="mt-auto pt-5 border-t border-ink/10 flex items-end justify-between">
                <PriceTag amount={p.price} className="text-3xl" />
                <button
                  onClick={() => handleAdd(p)}
                  aria-label={`Agregar ${p.name}`}
                  className="h-10 w-10 bg-ink text-cream flex items-center justify-center rv-press hover:bg-persimmon hover:text-cream transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Floating cart pill */}
      {cartCount > 0 && (
        <Link
          href="/liofilizados/carrito"
          className="fixed bottom-6 right-6 inline-flex items-center gap-3 h-12 px-6 bg-persimmon text-cream font-sans text-[13px] tracking-tight rv-press z-40"
        >
          <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
          Ver carrito · {cartCount}
        </Link>
      )}

      <SiteFooter />
    </>
  );
}
