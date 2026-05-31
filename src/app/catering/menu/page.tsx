"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { EditorialRule, PriceTag } from "@/components/marketing/editorial";
import { useCartStore } from "@/stores/cart-store";
import { Badge } from "@/components/ui/badge";
import { imageForCateringMenu } from "@/lib/product-images";
import { cn } from "@/lib/utils";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  allergens: string[];
  categoryId: string;
}

interface MenuCategory {
  id: string;
  code: string;
  name: string;
  items: MenuItem[];
}

/**
 * Menú reorganizado según los 6 momentos del pitch deck oficial:
 *   DBR · Desayunos y Brunchs
 *   RFG · Refrigerios y Snacks
 *   ALM · Almuerzos Premium
 *   GAL · Cenas de Gala
 *   MEX · Mesas de Experiencia
 *   COC · Coctelería Saludable
 *
 * Precios por persona (catering corporativo se cotiza así).
 */
const MOCK_CATEGORIES: MenuCategory[] = [
  {
    id: "cat-1", code: "DBR", name: "Desayunos y brunchs",
    items: [
      { id: "item-1",  name: "Brunch ejecutivo orgánico",        description: "Huevos pochados sobre pan de masa madre, palta machacada, microgreens, jugo prensado de temporada y café de origen.",                    basePrice: 32000, isVegetarian: true,  isVegan: false, isGlutenFree: false, allergens: ["gluten"], categoryId: "cat-1" },
      { id: "item-2",  name: "Parfait de granola artesanal",     description: "Yogurt natural, granola tostada en miel, berries colombianos y semillas de chía. En frasco individual.",                                  basePrice: 22000, isVegetarian: true,  isVegan: false, isGlutenFree: true,  allergens: ["lácteos", "frutos secos"], categoryId: "cat-1" },
      { id: "item-3",  name: "Estación de café specialty",       description: "Café de origen 100% colombiano. Opciones espresso, filtrado y leches vegetales.",                                                           basePrice: 12000, isVegetarian: true,  isVegan: true,  isGlutenFree: true,  allergens: [], categoryId: "cat-1" },
    ],
  },
  {
    id: "cat-2", code: "RFG", name: "Refrigerios y snacks",
    items: [
      { id: "item-4",  name: "Barra de energía orgánica",        description: "Frutos secos, mix tropical, chocolate oscuro 70%, semillas tostadas y dátiles rellenos.",                                                   basePrice: 18000, isVegetarian: true,  isVegan: true,  isGlutenFree: true,  allergens: ["frutos secos"], categoryId: "cat-2" },
      { id: "item-5",  name: "Tabla de quesos y charcutería",    description: "Quesos colombianos curados, charcutería selecta, frutos secos, frutas de temporada y masa madre.",                                          basePrice: 35000, isVegetarian: false, isVegan: false, isGlutenFree: false, allergens: ["lácteos", "gluten", "frutos secos"], categoryId: "cat-2" },
      { id: "item-6",  name: "Estación de hummus y crudités",    description: "Hummus de la casa, baba ganoush, vegetales orgánicos en crudo, pita integral.",                                                             basePrice: 20000, isVegetarian: true,  isVegan: true,  isGlutenFree: false, allergens: ["gluten"], categoryId: "cat-2" },
    ],
  },
  {
    id: "cat-3", code: "ALM", name: "Almuerzos premium",
    items: [
      { id: "item-7",  name: "Bandeja paisa ejecutiva",          description: "Versión gourmet con frijoles cocinados a fuego lento, chicharrón crocante, plátano maduro, aguacate y huevo de campo.",                    basePrice: 42000, isVegetarian: false, isVegan: false, isGlutenFree: true,  allergens: [], categoryId: "cat-3" },
      { id: "item-8",  name: "Salmón en salsa de maracuyá",      description: "Filete de salmón sellado, reducción de maracuyá, arroz integral con coco y vegetales rostizados.",                                          basePrice: 52000, isVegetarian: false, isVegan: false, isGlutenFree: true,  allergens: ["pescado"], categoryId: "cat-3" },
      { id: "item-9",  name: "Bowl vegano tropical",             description: "Quinoa real, aguacate, mango, frijoles negros, vegetales rostizados, vinagreta de limón y semillas.",                                       basePrice: 36000, isVegetarian: true,  isVegan: true,  isGlutenFree: true,  allergens: [], categoryId: "cat-3" },
      { id: "item-10", name: "Lonchera ejecutiva empacada",      description: "Almuerzo completo en empaque ecofriendly: proteína del día, granos, vegetal, fruta y postre. Cubertería biodegradable.",                    basePrice: 48000, isVegetarian: false, isVegan: false, isGlutenFree: true,  allergens: [], categoryId: "cat-3" },
    ],
  },
  {
    id: "cat-4", code: "GAL", name: "Cenas de gala",
    items: [
      { id: "item-11", name: "Lomo fino sous vide",              description: "Lomo madurado 21 días, puré de raíces andinas, vegetales heritage y reducción de vino tinto. Plato por plato.",                            basePrice: 85000, isVegetarian: false, isVegan: false, isGlutenFree: true,  allergens: [], categoryId: "cat-4" },
      { id: "item-12", name: "Atún sellado al sésamo",           description: "Atún rojo en costra de sésamo, fideos de arroz negro, vegetales encurtidos y emulsión de wasabi.",                                          basePrice: 78000, isVegetarian: false, isVegan: false, isGlutenFree: false, allergens: ["pescado", "sésamo"], categoryId: "cat-4" },
      { id: "item-13", name: "Risotto de hongos silvestres",     description: "Arborio cremoso con hongos porcini, shiitake y portobello, queso parmesano y aceite trufado.",                                              basePrice: 62000, isVegetarian: true,  isVegan: false, isGlutenFree: true,  allergens: ["lácteos"], categoryId: "cat-4" },
    ],
  },
  {
    id: "cat-5", code: "MEX", name: "Mesas de experiencia",
    items: [
      { id: "item-14", name: "Estación de postres artesanales",  description: "Macarons en pastel, mini tartas de limón con merengue, trufas de chocolate 70% y bocados de mousse.",                                       basePrice: 28000, isVegetarian: true,  isVegan: false, isGlutenFree: false, allergens: ["gluten", "lácteos", "frutos secos"], categoryId: "cat-5" },
      { id: "item-15", name: "Estación de canapés salados",      description: "Doce canapés de autor: ceviche en cuchara, foie con higos, atún tartar, queso de cabra con miel.",                                          basePrice: 38000, isVegetarian: false, isVegan: false, isGlutenFree: false, allergens: ["gluten", "lácteos", "pescado"], categoryId: "cat-5" },
      { id: "item-16", name: "Mesa de quesos premium",           description: "Quesos colombianos e importados curados, mermeladas artesanales, miel de abeja, frutos secos y panes.",                                      basePrice: 45000, isVegetarian: true,  isVegan: false, isGlutenFree: false, allergens: ["lácteos", "gluten", "frutos secos"], categoryId: "cat-5" },
    ],
  },
  {
    id: "cat-6", code: "COC", name: "Coctelería saludable",
    items: [
      { id: "item-17", name: "Mixología signature",              description: "Tres cocteles de autor por invitado: spritz de maracuyá, gin tónica con botánicos, mojito de albahaca. Sin azúcar añadida.",                basePrice: 42000, isVegetarian: true,  isVegan: true,  isGlutenFree: true,  allergens: [], categoryId: "cat-6" },
      { id: "item-18", name: "Limonada de coco premium",         description: "Limonada cremosa de coco con hierbabuena y hielo triturado en jarra de cristal.",                                                            basePrice: 15000, isVegetarian: true,  isVegan: true,  isGlutenFree: true,  allergens: [], categoryId: "cat-6" },
      { id: "item-19", name: "Barra de licores selectos",        description: "Estación con whisky single malt, ron añejo, mezcal y aguardiente artesanal. Barman incluido.",                                              basePrice: 65000, isVegetarian: true,  isVegan: true,  isGlutenFree: true,  allergens: [], categoryId: "cat-6" },
    ],
  },
];

const FILTERS = [
  { key: "vegetarian", label: "Vegetariano" },
  { key: "vegan", label: "Vegano" },
  { key: "glutenFree", label: "Sin gluten" },
] as const;

export default function CateringMenuPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const addItem = useCartStore((s) => s.addItem);
  const itemCount = useCartStore((s) => s.itemCount());

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
  })).filter((c) => c.items.length > 0);

  const getQty = (id: string) => quantities[id] || 1;
  const setQty = (id: string, val: number) => {
    if (val < 1) val = 1;
    setQuantities((p) => ({ ...p, [id]: val }));
  };

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      unitPrice: item.basePrice,
      quantity: getQty(item.id),
    });
    toast.success(`${item.name} agregado`);
    setQuantities((p) => ({ ...p, [item.id]: 1 }));
  };

  return (
    <>
      <SiteHeader line="catering" />

      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 pt-12">
        <div className="grid grid-cols-12 gap-x-6 mb-12">
          <div className="col-span-12 lg:col-span-3 mb-4 lg:mb-0">
            <EditorialRule index="03" label="Carta" />
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/55">
              Edición vigente
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-marigold">
              MMXXVI / Q2
            </p>
          </div>
          <div className="col-span-12 lg:col-span-9">
            <h1 className="font-display font-light tracking-[-0.03em] leading-[0.92] text-ink text-5xl sm:text-7xl lg:text-[112px]">
              La carta,
              <br />
              <span className="italic">por capítulos</span>
              <span className="text-marigold">.</span>
            </h1>
            <p className="mt-8 font-serif italic text-lg sm:text-xl leading-snug text-ink/70 max-w-2xl">
              Precios por persona. Mínimo veinte comensales para eventos completos.
              Para almuerzos ejecutivos se puede pedir desde diez.
            </p>
          </div>
        </div>

        {/* Search + filters */}
        <div className="border-y border-ink/15 py-4 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <div className="flex-1 flex items-center gap-3">
            <span className="material-symbols-outlined text-ink/50 text-lg">search</span>
            <input
              className="flex-1 bg-transparent border-0 font-sans text-base text-ink placeholder:text-ink/35 focus:outline-none"
              placeholder="Buscar en la carta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-6">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(activeFilter === f.key ? null : f.key)}
                className={cn(
                  "font-mono text-[11px] uppercase tracking-[0.22em] py-1 border-b",
                  activeFilter === f.key
                    ? "text-ink border-marigold"
                    : "text-ink/50 hover:text-ink border-transparent",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 mt-12 space-y-20">
        {filteredCategories.map((cat) => (
          <div key={cat.id}>
            <header className="grid grid-cols-12 gap-x-6 mb-8 items-end">
              <div className="col-span-12 lg:col-span-3">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-marigold">
                  Capítulo · {cat.code}
                </span>
              </div>
              <div className="col-span-12 lg:col-span-9">
                <h2 className="font-display text-5xl sm:text-6xl tracking-[-0.025em] leading-none text-ink">
                  {cat.name}
                </h2>
              </div>
            </header>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-ink/15">
              {cat.items.map((item, i) => (
                <article
                  key={item.id}
                  className="border-r border-b border-ink/15 flex flex-col bg-cream overflow-hidden"
                >
                  {imageForCateringMenu(item.id) && (
                    <div className="relative w-full aspect-[4/3] border-b border-ink/10">
                      <Image
                        src={imageForCateringMenu(item.id)!}
                        alt={item.name}
                        fill
                        sizes="(max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-7 flex flex-col flex-1">
                  <div className="flex items-baseline justify-between mb-5">
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-ink/50">
                      N° {String(i + 1).padStart(3, "0")}
                    </span>
                    <PriceTag amount={item.basePrice} className="text-xl" />
                  </div>
                  <h3 className="font-display text-2xl tracking-tight text-ink leading-tight mb-3">
                    {item.name}
                  </h3>
                  <p className="font-serif italic text-[14px] leading-snug text-ink/70 mb-5 min-h-[64px]">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {item.isVegetarian && <Badge variant="soft">Vegetariano</Badge>}
                    {item.isVegan && <Badge variant="success">Vegano</Badge>}
                    {item.isGlutenFree && <Badge variant="outline">Sin gluten</Badge>}
                  </div>
                  <div className="mt-auto pt-5 border-t border-ink/10 flex items-center gap-3">
                    <div className="flex items-center border border-ink/30">
                      <button
                        onClick={() => setQty(item.id, getQty(item.id) - 1)}
                        className="h-9 w-9 hover:bg-ink hover:text-cream transition-colors"
                      >
                        −
                      </button>
                      <span className="w-9 text-center font-mono text-sm tabular">
                        {getQty(item.id)}
                      </span>
                      <button
                        onClick={() => setQty(item.id, getQty(item.id) + 1)}
                        className="h-9 w-9 hover:bg-ink hover:text-cream transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex-1 h-9 bg-marigold text-ink font-sans text-[13px] tracking-tight rv-press hover:bg-ink hover:text-cream transition-colors"
                    >
                      Agregar
                    </button>
                  </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>

      {itemCount > 0 && (
        <Link
          href="/catering/orden"
          className="fixed bottom-6 right-6 inline-flex items-center gap-3 h-12 px-6 bg-marigold text-ink font-sans text-[13px] tracking-tight rv-press z-40"
        >
          <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
          Ver orden · {itemCount}
        </Link>
      )}

      <SiteFooter />
    </>
  );
}
