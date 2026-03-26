"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useLiofilizadosCart } from "@/stores/shop-cart-store";
import { formatCurrency } from "@/lib/utils";
import { useProducts, type ProductData } from "@/hooks/use-products";

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
  const cartCount = useLiofilizadosCart((s) => s.itemCount);
  const { products, categories, loading } = useProducts({
    businessLine: "LIOFILIZADOS",
    fallbackProducts: FALLBACK_PRODUCTS,
    fallbackCategories: FALLBACK_CATEGORIES,
  });
  const filtered = filter === "Todos" ? products : products.filter((p) => p.category.name === filter);

  const handleAdd = (p: ProductData) => {
    addItem({ productId: p.id, name: p.name, icon: p.icon || "nutrition", unitPrice: p.price, quantity: 1, weight: p.weight || undefined });
    toast.success(`${p.name} agregado al carrito`);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <nav className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
        <Link href="/liofilizados" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-900/20">
            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>nutrition</span>
          </div>
          <span className="text-xl font-bold tracking-tighter">Reina Verde <span className="text-amber-600">Liofilizados</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/" className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-lg">home</span> Hub
          </Link>
          <Link href="/liofilizados/carrito" className="relative p-2 text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-xl">shopping_cart</span>
            {cartCount() > 0 && <span className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center rounded-full bg-amber-600 text-white text-[10px] font-bold">{cartCount()}</span>}
          </Link>
          <Link href="/login" className="px-5 py-2.5 text-sm font-semibold bg-amber-600 text-white rounded-xl hover:bg-amber-500 transition-colors">
            Iniciar Sesión
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="mb-8">
          <Link href="/liofilizados" className="inline-flex items-center text-sm text-on-surface-variant hover:text-on-surface mb-4 gap-1">
            <span className="material-symbols-outlined text-lg">arrow_back</span> Volver
          </Link>
          <h1 className="text-4xl font-semibold tracking-tight">Catálogo</h1>
          <p className="text-on-surface-variant mt-2">Frutas colombianas liofilizadas — 100% naturales</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat: string) => (
            <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${filter === cat ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <div key={product.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden group hover:translate-y-[-4px] transition-all duration-300">
              <div className="h-40 bg-gradient-to-br from-amber-100 to-orange-50 flex items-center justify-center relative">
                <span className="material-symbols-outlined text-amber-300 group-hover:scale-110 transition-transform duration-500" style={{ fontSize: "64px" }}>{product.icon}</span>
                {product.badge && <span className="absolute top-3 right-3 bg-amber-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{product.badge}</span>}
                {product.weight && <span className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded-full">{product.weight}</span>}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-on-surface text-sm mb-1 leading-tight">{product.name}</h3>
                <p className="text-xs text-on-surface-variant mb-3 line-clamp-2">{product.shortDesc || product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-amber-700">{formatCurrency(product.price)}</span>
                  <button onClick={() => handleAdd(product)} className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform shadow-sm">
                    <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cartCount() > 0 && (
          <Link href="/liofilizados/carrito" className="fixed bottom-6 right-6 bg-gradient-to-br from-amber-500 to-orange-600 text-white px-6 py-3.5 rounded-full shadow-xl shadow-amber-900/30 hover:brightness-110 transition-all flex items-center gap-2 z-40 active:scale-95">
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="font-bold">Ver Carrito ({cartCount()})</span>
          </Link>
        )}
      </div>
    </div>
  );
}
