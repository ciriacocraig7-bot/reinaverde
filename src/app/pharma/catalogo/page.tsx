"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { usePharmaCart } from "@/stores/shop-cart-store";
import { useProducts, type ProductData } from "@/hooks/use-products";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { EditorialRule, PriceTag } from "@/components/marketing/editorial";
import { imageForPharma } from "@/lib/product-images";
import { cn } from "@/lib/utils";

const FALLBACK_PRODUCTS: ProductData[] = [
  { id: "cb-1", name: "Aceite CBD Full Spectrum 1000mg", slug: "aceite-cbd-full-spectrum-1000mg", price: 189000, badge: "Bestseller", icon: "spa", shortDesc: "Aceite sublingual de espectro completo. 30ml con gotero dosificador.", tags: [], stock: 50, isFeatured: true, category: { id: "fc-1", name: "Aceites", slug: "aceites" } },
  { id: "cb-2", name: "Aceite CBD Broad Spectrum 500mg", slug: "aceite-cbd-broad-spectrum-500mg", price: 129000, badge: "Suave", icon: "spa", shortDesc: "Sin THC. Ideal para quienes inician su experiencia con CBD.", tags: [], stock: 40, isFeatured: false, category: { id: "fc-1", name: "Aceites", slug: "aceites" } },
  { id: "cb-3", name: "Flores de Cáñamo – Mango Kush", slug: "flores-canamo-mango-kush", price: 85000, badge: "Premium", icon: "local_florist", shortDesc: "3.5g de flores secas con perfil aromático tropical. < 0.3% THC.", tags: [], stock: 30, isFeatured: true, category: { id: "fc-2", name: "Flores", slug: "flores" } },
  { id: "cb-4", name: "Tintura CBD 2000mg", slug: "tintura-cbd-2000mg", price: 249000, badge: "Potente", icon: "science", shortDesc: "Extracto concentrado para uso terapéutico. Gotero de precisión.", tags: [], stock: 20, isFeatured: false, category: { id: "fc-3", name: "Tinturas", slug: "tinturas" } },
  { id: "cb-5", name: "Bálsamo CBD Muscular", slug: "balsamo-cbd-muscular", price: 95000, badge: "Alivio", icon: "self_improvement", shortDesc: "Crema con CBD, árnica y mentol para alivio localizado.", tags: [], stock: 35, isFeatured: false, category: { id: "fc-4", name: "Tópicos", slug: "topicos" } },
  { id: "cb-6", name: "Kit Bienestar Starter", slug: "kit-bienestar-starter", price: 159000, badge: "Nuevo", icon: "inventory_2", shortDesc: "Aceite 500mg + Bálsamo + Guía de inicio. Perfecto para comenzar.", tags: [], stock: 25, isFeatured: true, category: { id: "fc-5", name: "Kits", slug: "kits" } },
  { id: "cb-7", name: "CBD Pet Oil 300mg", slug: "cbd-pet-oil-300mg", price: 79000, badge: "Mascotas", icon: "pets", shortDesc: "Formulado para mascotas. Sabor salmón. Aprobado por veterinarios.", tags: [], stock: 45, isFeatured: false, category: { id: "fc-6", name: "Pet", slug: "pet" } },
  { id: "cb-8", name: "Flores de Cáñamo – OG Kush", slug: "flores-canamo-og-kush", price: 95000, badge: "Clásico", icon: "local_florist", shortDesc: "3.5g. Perfil terroso y relajante. Cultivo indoor.", tags: [], stock: 30, isFeatured: false, category: { id: "fc-2", name: "Flores", slug: "flores" } },
];

const FALLBACK_CATEGORIES = ["Todos", "Aceites", "Flores", "Tinturas", "Tópicos", "Kits", "Pet"];

export default function PharmaCatalogoPage() {
  const [filter, setFilter] = useState("Todos");
  const addItem = usePharmaCart((s) => s.addItem);
  const cartCount = usePharmaCart((s) => s.itemCount());
  const { products, categories } = useProducts({
    businessLine: "PHARMA",
    fallbackProducts: FALLBACK_PRODUCTS,
    fallbackCategories: FALLBACK_CATEGORIES,
  });
  const filtered =
    filter === "Todos" ? products : products.filter((p) => p.category.name === filter);

  const handleAdd = (p: ProductData) => {
    addItem({
      productId: p.id,
      name: p.name,
      image: p.image || p.images?.[0] || imageForPharma(p.slug) || undefined,
      icon: p.icon || "spa",
      unitPrice: p.price,
      quantity: 1,
    });
    toast.success(`${p.name} agregado`);
  };

  return (
    <>
      <SiteHeader line="pharma" />

      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 pt-12">
        <div className="grid grid-cols-12 gap-x-6 mb-12">
          <div className="col-span-12 lg:col-span-3 mb-4 lg:mb-0">
            <EditorialRule index="03" label="Catálogo" />
          </div>
          <div className="col-span-12 lg:col-span-9">
            <h1 className="font-display font-light tracking-[-0.03em] leading-[0.92] text-ink text-6xl sm:text-7xl lg:text-8xl">
              Fórmulas,
              <br />
              <span className="italic">por familia</span>
              <span className="text-iris">.</span>
            </h1>
          </div>
        </div>

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
                    className="absolute -bottom-[18px] left-0 right-0 h-px bg-iris"
                    aria-hidden
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-t border-l border-ink/15">
          {filtered.map((p, i) => {
            const img = p.image || p.images?.[0] || imageForPharma(p.slug);
            return (
            <article
              key={p.id}
              className="group p-7 border-r border-b border-ink/15 flex flex-col bg-cream hover:bg-iris/[0.04] transition-colors"
            >
              <div className="flex items-baseline justify-between mb-5">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-iris">
                  N° {String(i + 1).padStart(3, "0")}
                </span>
                {p.badge && (
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink/50">
                    {p.badge}
                  </span>
                )}
              </div>

              <div className="relative h-44 mb-6 bg-cream-warm border border-ink/10 overflow-hidden">
                {img ? (
                  <Image
                    src={img}
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
                      {p.icon || "spa"}
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
                  className="h-10 w-10 bg-ink text-cream flex items-center justify-center rv-press hover:bg-iris hover:text-cream transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
              </div>
            </article>
            );
          })}
        </div>
      </section>

      {cartCount > 0 && (
        <Link
          href="/pharma/carrito"
          className="fixed bottom-6 right-6 inline-flex items-center gap-3 h-12 px-6 bg-iris text-cream font-sans text-[13px] tracking-tight rv-press z-40"
        >
          <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
          Ver carrito · {cartCount}
        </Link>
      )}

      <SiteFooter />
    </>
  );
}
