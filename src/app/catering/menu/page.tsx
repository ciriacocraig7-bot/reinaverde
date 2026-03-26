"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency } from "@/lib/utils";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  image?: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  allergens: string[];
  categoryId: string;
}

interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  icon: string;
  items: MenuItem[];
}

const MOCK_CATEGORIES: MenuCategory[] = [
  {
    id: "cat-1",
    name: "Entradas",
    description: "Deliciosas opciones para comenzar",
    icon: "tapas",
    items: [
      { id: "item-1", name: "Empanadas Colombianas", description: "Empanadas de carne o pollo con ají casero. Servidas en porciones de 3.", basePrice: 15000, isVegetarian: false, isVegan: false, isGlutenFree: false, allergens: ["gluten"], categoryId: "cat-1" },
      { id: "item-2", name: "Ensalada Caesar Corporativa", description: "Lechuga romana, crutones artesanales, parmesano y aderezo caesar.", basePrice: 22000, isVegetarian: true, isVegan: false, isGlutenFree: false, allergens: ["gluten", "lácteos"], categoryId: "cat-1" },
      { id: "item-3", name: "Tabla de Quesos y Frutas", description: "Selección de quesos locales con frutas de temporada y frutos secos.", basePrice: 35000, isVegetarian: true, isVegan: false, isGlutenFree: true, allergens: ["lácteos", "frutos secos"], categoryId: "cat-1" },
    ],
  },
  {
    id: "cat-2",
    name: "Platos Principales",
    description: "Platos fuertes para satisfacer a todos",
    icon: "restaurant",
    items: [
      { id: "item-4", name: "Bandeja Paisa Ejecutiva", description: "Versión gourmet de la tradicional bandeja paisa con ingredientes premium.", basePrice: 38000, isVegetarian: false, isVegan: false, isGlutenFree: false, allergens: [], categoryId: "cat-2" },
      { id: "item-5", name: "Salmón en Salsa de Maracuyá", description: "Filete de salmón con salsa de maracuyá, arroz integral y vegetales al grill.", basePrice: 45000, isVegetarian: false, isVegan: false, isGlutenFree: true, allergens: ["pescado"], categoryId: "cat-2" },
      { id: "item-6", name: "Bowl Vegano Tropical", description: "Quinoa, aguacate, mango, frijoles negros, vegetales rostizados y vinagreta de limón.", basePrice: 28000, isVegetarian: true, isVegan: true, isGlutenFree: true, allergens: [], categoryId: "cat-2" },
      { id: "item-7", name: "Pollo en Salsa de Champiñones", description: "Pechuga de pollo con salsa cremosa de champiñones, puré de papa y ensalada.", basePrice: 32000, isVegetarian: false, isVegan: false, isGlutenFree: true, allergens: ["lácteos"], categoryId: "cat-2" },
    ],
  },
  {
    id: "cat-3",
    name: "Postres",
    description: "El toque dulce perfecto",
    icon: "cake",
    items: [
      { id: "item-8", name: "Tres Leches", description: "Pastel de tres leches con canela y frutas frescas.", basePrice: 12000, isVegetarian: true, isVegan: false, isGlutenFree: false, allergens: ["gluten", "lácteos"], categoryId: "cat-3" },
      { id: "item-9", name: "Mousse de Chocolate", description: "Mousse de chocolate belga 70% cacao con frutos rojos.", basePrice: 14000, isVegetarian: true, isVegan: false, isGlutenFree: true, allergens: ["lácteos"], categoryId: "cat-3" },
      { id: "item-10", name: "Frutas de Temporada", description: "Selección de frutas frescas colombianas con miel de abejas.", basePrice: 10000, isVegetarian: true, isVegan: true, isGlutenFree: true, allergens: [], categoryId: "cat-3" },
    ],
  },
  {
    id: "cat-4",
    name: "Bebidas",
    description: "Para acompañar tu evento",
    icon: "local_cafe",
    items: [
      { id: "item-11", name: "Jugo Natural (Jarra)", description: "Jarra de jugo natural: lulo, maracuyá, mango o guanábana.", basePrice: 18000, isVegetarian: true, isVegan: true, isGlutenFree: true, allergens: [], categoryId: "cat-4" },
      { id: "item-12", name: "Limonada de Coco", description: "Limonada cremosa con coco rallado, hielo y hierbabuena.", basePrice: 15000, isVegetarian: true, isVegan: true, isGlutenFree: true, allergens: [], categoryId: "cat-4" },
      { id: "item-13", name: "Café Colombiano Premium", description: "Estación de café de origen con opciones de preparación.", basePrice: 8000, isVegetarian: true, isVegan: true, isGlutenFree: true, allergens: [], categoryId: "cat-4" },
    ],
  },
];

export default function MenuPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const addItem = useCartStore((s) => s.addItem);
  const itemCount = useCartStore((s) => s.itemCount);

  const filters = [
    { key: "vegetarian", label: "Vegetariano", icon: "eco" },
    { key: "vegan", label: "Vegano", icon: "spa" },
    { key: "glutenFree", label: "Sin Gluten", icon: "grain" },
  ];

  const filteredCategories = MOCK_CATEGORIES.map((cat) => ({
    ...cat,
    items: cat.items.filter((item) => {
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        !activeFilter ||
        (activeFilter === "vegetarian" && item.isVegetarian) ||
        (activeFilter === "vegan" && item.isVegan) ||
        (activeFilter === "glutenFree" && item.isGlutenFree);

      return matchesSearch && matchesFilter;
    }),
  })).filter((cat) => cat.items.length > 0);

  const getQty = (id: string) => quantities[id] || 1;
  const setQty = (id: string, val: number) => {
    if (val < 1) val = 1;
    setQuantities((prev) => ({ ...prev, [id]: val }));
  };

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      image: item.image,
      unitPrice: item.basePrice,
      quantity: getQty(item.id),
    });
    toast.success(`${item.name} agregado al carrito`);
    setQuantities((prev) => ({ ...prev, [item.id]: 1 }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-8 w-full pt-24">
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-container mb-2 block">Curated Selection</span>
          <h1 className="text-4xl font-semibold tracking-tight text-on-surface">Nuestro Menú</h1>
          <p className="mt-2 text-on-surface-variant">
            Selecciona los platos para tu evento. Precios por persona.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 flex items-center bg-surface-container-lowest px-4 py-2.5 rounded-xl border border-outline-variant/20">
            <span className="material-symbols-outlined text-on-surface-variant/50 text-xl mr-3">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm w-full text-on-surface placeholder:text-on-surface-variant/50"
              placeholder="Buscar platos..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant text-lg">filter_list</span>
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(activeFilter === f.key ? null : f.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  activeFilter === f.key
                    ? "bg-primary-fixed text-primary"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <span className="material-symbols-outlined text-sm">{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Categories */}
        <div className="space-y-12">
          {filteredCategories.map((category) => (
            <div key={category.id}>
              <div className="mb-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary-fixed flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">{category.icon}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-on-surface">{category.name}</h2>
                  {category.description && (
                    <p className="text-on-surface-variant text-sm">{category.description}</p>
                  )}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items.map((item) => (
                  <div key={item.id} className="group bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10 shadow-sm shadow-emerald-900/5 hover:translate-y-[-2px] transition-all duration-300">
                    <div className="h-40 bg-gradient-to-br from-primary-fixed/20 to-surface-container-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary/20 group-hover:scale-110 transition-transform duration-700" style={{ fontSize: "64px" }}>{category.icon}</span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-on-surface leading-tight">{item.name}</h3>
                        <span className="text-lg font-bold text-primary-container whitespace-nowrap ml-2">
                          {formatCurrency(item.basePrice)}
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant mb-3 line-clamp-2">{item.description}</p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.isVegetarian && <Badge variant="success">Vegetariano</Badge>}
                        {item.isVegan && <Badge variant="success">Vegano</Badge>}
                        {item.isGlutenFree && <Badge variant="info">Sin Gluten</Badge>}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-outline-variant/20 rounded-xl overflow-hidden">
                          <button
                            onClick={() => setQty(item.id, getQty(item.id) - 1)}
                            className="p-2 hover:bg-surface-container-low transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">remove</span>
                          </button>
                          <span className="px-3 text-sm font-bold min-w-[2rem] text-center">
                            {getQty(item.id)}
                          </span>
                          <button
                            onClick={() => setQty(item.id, getQty(item.id) + 1)}
                            className="p-2 hover:bg-surface-container-low transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">add</span>
                          </button>
                        </div>
                        <button
                          className="flex-1 px-4 py-2 bg-gradient-to-br from-primary-container to-primary text-on-primary rounded-xl font-semibold text-sm shadow-sm hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                          onClick={() => handleAddToCart(item)}
                        >
                          <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                          Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Floating Cart Button */}
        {itemCount() > 0 && (
          <a
            href="/catering/orden"
            className="fixed bottom-6 right-6 bg-gradient-to-br from-primary-container to-primary text-on-primary px-6 py-3.5 rounded-full shadow-xl shadow-primary/30 hover:brightness-110 transition-all flex items-center gap-2 z-40 active:scale-95"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="font-bold">Ver Orden ({itemCount()})</span>
          </a>
        )}
      </div>
    </div>
  );
}
