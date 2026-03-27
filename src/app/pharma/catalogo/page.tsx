"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { usePharmaCart } from "@/stores/shop-cart-store";
import { formatCurrency } from "@/lib/utils";
import { useProducts, type ProductData } from "@/hooks/use-products";

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
  const cartCount = usePharmaCart((s) => s.itemCount);
  const { products, categories, loading } = useProducts({
    businessLine: "PHARMA",
    fallbackProducts: FALLBACK_PRODUCTS,
    fallbackCategories: FALLBACK_CATEGORIES,
  });
  const filtered = filter === "Todos" ? products : products.filter((p) => p.category.name === filter);

  const handleAdd = (p: ProductData) => {
    addItem({ productId: p.id, name: p.name, icon: p.icon || "spa", unitPrice: p.price, quantity: 1 });
    toast.success(`${p.name} agregado al carrito`);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Nav */}
      <nav className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
        <Link href="/pharma" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-lg shadow-violet-900/20">
            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
          </div>
          <span className="text-xl font-bold tracking-tighter">Reina Verde <span className="text-violet-600">Pharma</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/" className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-lg">home</span> Hub
          </Link>
          <Link href="/pharma/carrito" className="relative p-2 text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-xl">shopping_cart</span>
            {cartCount() > 0 && <span className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center rounded-full bg-violet-600 text-white text-[10px] font-bold">{cartCount()}</span>}
          </Link>
          <Link href="/login" className="px-5 py-2.5 text-sm font-semibold bg-violet-700 text-white rounded-xl hover:bg-violet-600 transition-colors">
            Iniciar Sesión
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="mb-8">
          <Link href="/pharma" className="inline-flex items-center text-sm text-on-surface-variant hover:text-on-surface mb-4 gap-1">
            <span className="material-symbols-outlined text-lg">arrow_back</span> Volver
          </Link>
          <h1 className="text-4xl font-semibold tracking-tight">Catálogo</h1>
          <p className="text-on-surface-variant mt-2">Productos de bienestar certificados y 100% legales</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat: string) => (
            <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${filter === cat ? "bg-gradient-to-br from-violet-600 to-purple-800 text-white shadow-sm" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <div key={product.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden group hover:translate-y-[-4px] transition-all duration-300">
              <div className="h-40 bg-gradient-to-br from-violet-100 to-purple-50 flex items-center justify-center relative">
                <span className="material-symbols-outlined text-violet-300 group-hover:scale-110 transition-transform duration-500" style={{ fontSize: "64px" }}>{product.icon}</span>
                {product.badge && <span className="absolute top-3 right-3 bg-violet-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{product.badge}</span>}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-on-surface text-sm mb-1 leading-tight">{product.name}</h3>
                <p className="text-xs text-on-surface-variant mb-3 line-clamp-2">{product.shortDesc || product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-violet-700">{formatCurrency(product.price)}</span>
                  <button onClick={() => handleAdd(product)} className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform shadow-sm">
                    <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cartCount() > 0 && (
          <Link href="/pharma/carrito" className="fixed bottom-6 right-6 bg-gradient-to-br from-violet-600 to-purple-800 text-white px-6 py-3.5 rounded-full shadow-xl shadow-violet-900/30 hover:brightness-110 transition-all flex items-center gap-2 z-40 active:scale-95">
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="font-bold">Ver Carrito ({cartCount()})</span>
          </Link>
        )}
      </div>
    </div>
  );
}
