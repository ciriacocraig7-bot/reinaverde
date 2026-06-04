/**
 * Shopping list — qué comprar para un evento (interno, vista del chef).
 *
 * Expandimos OrderItem[] → MenuItem.ingredients[] → cantidades totales por
 * ingrediente, con merma aplicada. Comparamos contra `jumboReferencePrice`
 * para que el chef vea de un vistazo si compra Reina Verde más barato/caro
 * que en Jumbo (proveedor referencia).
 */

import { prisma } from "@/lib/db/prisma";

export interface ShoppingListItem {
  ingredientId: string;
  name: string;
  category: string | null;
  unit: string;
  /** Cantidad total a comprar (suma de todas las recetas, con merma). */
  totalQuantity: number;
  /** Costo unitario de Reina Verde. */
  costPerUnit: number;
  /** Costo total con nuestro precio. */
  totalCost: number;
  /** Precio Jumbo por la misma unidad, si está registrado. */
  jumboPrice: number | null;
  /** Costo total al precio Jumbo (referencia). */
  jumboTotalCost: number | null;
  /**
   * Diferencia por unidad = jumboPrice − costPerUnit.
   * Positivo: Jumbo es MÁS CARO (vamos bien). Negativo: Jumbo es MÁS BARATO.
   */
  jumboUnitDelta: number | null;
  supplierName: string | null;
  /** orderIds que contribuyen a este item. Sirve para auditoría. */
  fromOrders: string[];
}

export interface OrderInShoppingList {
  id: string;
  orderNumber: string;
  eventDate: string;
  guestCount: number;
  deliveryCity: string | null;
  quoteNumber: string | null;
}

export interface ShoppingListResult {
  items: ShoppingListItem[];
  /** Items agrupados por categoría para la UI ("Proteína", "Empaque", etc). */
  groupedByCategory: Record<string, ShoppingListItem[]>;
  /** Total comprando con nuestro proveedor habitual. */
  totalCost: number;
  /** Total si compráramos TODO en Jumbo (solo cuenta ítems con referencia). */
  totalJumboCost: number;
  /** Items sin referencia Jumbo registrada. */
  itemsWithoutJumboReference: number;
  ordersIncluded: OrderInShoppingList[];
}

const ROUND = (n: number) => Math.round(n * 100) / 100;

function num(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  return parseFloat(String(v)) || 0;
}

/**
 * Internal. Agrega cantidades por ingrediente desde una lista de OrderIds.
 */
async function aggregateFromOrderIds(orderIds: string[]): Promise<ShoppingListResult> {
  if (orderIds.length === 0) {
    return {
      items: [],
      groupedByCategory: {},
      totalCost: 0,
      totalJumboCost: 0,
      itemsWithoutJumboReference: 0,
      ordersIncluded: [],
    };
  }

  // Cargar Orders con sus items + MenuItem.ingredients
  const orders = await prisma.order.findMany({
    where: { id: { in: orderIds } },
    include: {
      items: {
        include: {
          menuItem: {
            include: {
              ingredients: {
                include: {
                  ingredient: { include: { supplier: true } },
                },
              },
            },
          },
        },
      },
      quote: { select: { quoteNumber: true } },
    },
  });

  // Acumular por ingredientId
  const byIngredient = new Map<string, ShoppingListItem & { _seenOrders: Set<string> }>();

  for (const order of orders) {
    for (const orderItem of order.items) {
      const portionQty = orderItem.quantity; // cantidad de porciones del plato
      for (const mi of orderItem.menuItem.ingredients) {
        const ing = mi.ingredient;
        const yieldPct = num(ing.yieldPercent) || 1;
        // Cantidad bruta necesaria (con merma) para servir 1 porción × cantidad
        const grossPerPortion = num(mi.quantity) / yieldPct;
        const totalForThisItem = grossPerPortion * portionQty;

        const existing = byIngredient.get(ing.id);
        if (existing) {
          existing.totalQuantity += totalForThisItem;
          existing._seenOrders.add(order.id);
        } else {
          byIngredient.set(ing.id, {
            ingredientId: ing.id,
            name: ing.name,
            category: ing.category,
            unit: ing.unit,
            totalQuantity: totalForThisItem,
            costPerUnit: num(ing.costPerUnit),
            totalCost: 0, // se recalcula al final
            jumboPrice: ing.jumboReferencePrice != null ? num(ing.jumboReferencePrice) : null,
            jumboTotalCost: null,
            jumboUnitDelta: null,
            supplierName: ing.supplier?.name ?? null,
            fromOrders: [],
            _seenOrders: new Set([order.id]),
          });
        }
      }
    }
  }

  // Calcular costos finales
  let totalCost = 0;
  let totalJumboCost = 0;
  let itemsWithoutJumboReference = 0;
  const items: ShoppingListItem[] = [];
  for (const it of byIngredient.values()) {
    it.totalQuantity = ROUND(it.totalQuantity);
    it.totalCost = ROUND(it.totalQuantity * it.costPerUnit);
    if (it.jumboPrice != null) {
      it.jumboTotalCost = ROUND(it.totalQuantity * it.jumboPrice);
      it.jumboUnitDelta = ROUND(it.jumboPrice - it.costPerUnit);
      totalJumboCost += it.jumboTotalCost;
    } else {
      itemsWithoutJumboReference++;
    }
    totalCost += it.totalCost;
    it.fromOrders = [...it._seenOrders];
    const { _seenOrders, ...clean } = it;
    void _seenOrders;
    items.push(clean);
  }

  // Ordenar por categoría → nombre
  items.sort((a, b) => {
    const ca = a.category ?? "Otro";
    const cb = b.category ?? "Otro";
    if (ca === cb) return a.name.localeCompare(b.name, "es");
    return ca.localeCompare(cb, "es");
  });

  // Agrupar
  const groupedByCategory: Record<string, ShoppingListItem[]> = {};
  for (const it of items) {
    const cat = it.category ?? "Otro";
    if (!groupedByCategory[cat]) groupedByCategory[cat] = [];
    groupedByCategory[cat].push(it);
  }

  const ordersIncluded: OrderInShoppingList[] = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    eventDate: o.deliveryDate.toISOString(),
    guestCount: o.guestCount,
    deliveryCity: o.deliveryCity,
    quoteNumber: o.quote?.quoteNumber ?? null,
  }));

  return {
    items,
    groupedByCategory,
    totalCost: ROUND(totalCost),
    totalJumboCost: ROUND(totalJumboCost),
    itemsWithoutJumboReference,
    ordersIncluded,
  };
}

/** Shopping list para una lista explícita de orderIds. */
export async function shoppingListForOrders(orderIds: string[]) {
  return aggregateFromOrderIds(orderIds);
}

/**
 * Shopping list para todos los eventos con `deliveryDate` en el rango.
 * Solo Orders pagadas (status = PAID) o en producción.
 *
 * @param from inclusive (00:00 UTC del día)
 * @param to   exclusive (00:00 UTC del día siguiente)
 */
export async function shoppingListForDateRange(from: Date, to: Date) {
  const orders = await prisma.order.findMany({
    where: {
      deliveryDate: { gte: from, lt: to },
      status: { in: ["PAID", "IN_PRODUCTION", "READY", "IN_TRANSIT", "DELIVERED"] },
    },
    select: { id: true },
  });
  return aggregateFromOrderIds(orders.map((o) => o.id));
}

/** Shopping list para un solo día (UTC). */
export async function shoppingListForDate(date: Date) {
  const from = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const to = new Date(from);
  to.setUTCDate(to.getUTCDate() + 1);
  return shoppingListForDateRange(from, to);
}

// ═══════════════════════════════════════════════════════════════
// VERSIÓN CLIENT-SAFE — para que el cliente vea qué se compra para su evento.
// SIN costos unitarios, SIN precios Jumbo, SIN proveedor, SIN deltas de margen.
// Solo: nombre del insumo, cantidad total, unidad y categoría.
// ═══════════════════════════════════════════════════════════════

export interface PublicShoppingListItem {
  name: string;
  category: string;
  unit: string;
  totalQuantity: number;
}

export interface PublicShoppingListResult {
  /** Items planos ordenados por categoría → nombre. */
  items: PublicShoppingListItem[];
  /** Agrupados por categoría para render directo. */
  groupedByCategory: Record<string, PublicShoppingListItem[]>;
  /** Metadata del evento. */
  event: {
    quoteNumber: string;
    eventDate: string;
    eventCity: string;
    guestCount: number;
  };
}

/**
 * Genera el shopping list para una Quote del cliente (sin Order todavía).
 * Lee Quote.itemsJson para expandir las recetas y agrupar ingredientes.
 *
 * Es la versión que se le entrega al cliente: NO contiene precios, NO contiene
 * datos del proveedor, NO contiene comparativas con Jumbo. Solo "esto es lo
 * que se va a comprar para tu evento".
 */
export async function shoppingListForQuote(
  quoteId: string,
): Promise<PublicShoppingListResult | null> {
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    select: {
      quoteNumber: true,
      eventDate: true,
      eventCity: true,
      guestCount: true,
      itemsJson: true,
    },
  });
  if (!quote) return null;

  // Quote.itemsJson tiene shape: [{ menuItemId, quantity, customizations? }, ...]
  const items = quote.itemsJson as Array<{
    menuItemId: string;
    quantity: number;
    customizations?: {
      portionMultiplier?: number;
      removedIngredientIds?: string[];
    };
  }>;
  if (!Array.isArray(items) || items.length === 0) {
    return {
      items: [],
      groupedByCategory: {},
      event: {
        quoteNumber: quote.quoteNumber,
        eventDate: quote.eventDate.toISOString(),
        eventCity: quote.eventCity,
        guestCount: quote.guestCount,
      },
    };
  }

  // Cargar menu items con sus ingredientes
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: items.map((i) => i.menuItemId) } },
    include: { ingredients: { include: { ingredient: true } } },
  });
  const byId = new Map(menuItems.map((m) => [m.id, m]));

  // Agregar por ingredientId (sin keeping costos)
  const aggregated = new Map<string, PublicShoppingListItem>();
  for (const it of items) {
    const menu = byId.get(it.menuItemId);
    if (!menu) continue;
    const portion = it.customizations?.portionMultiplier ?? 1;
    const removed = new Set(it.customizations?.removedIngredientIds ?? []);
    for (const mi of menu.ingredients) {
      const ing = mi.ingredient;
      if (removed.has(ing.id)) continue;
      const yieldPct = num(ing.yieldPercent) || 1;
      const perPortion = (num(mi.quantity) * portion) / yieldPct;
      const total = perPortion * it.quantity;
      const existing = aggregated.get(ing.id);
      if (existing) {
        existing.totalQuantity += total;
      } else {
        aggregated.set(ing.id, {
          name: ing.name,
          category: ing.category ?? "Otro",
          unit: ing.unit,
          totalQuantity: total,
        });
      }
    }
  }

  const list = [...aggregated.values()].map((x) => ({
    ...x,
    // Redondeo a 1 decimal para que el cliente no vea ruido tipo 47.853214 g.
    totalQuantity: Math.round(x.totalQuantity * 10) / 10,
  }));
  list.sort((a, b) => {
    if (a.category === b.category) return a.name.localeCompare(b.name, "es");
    return a.category.localeCompare(b.category, "es");
  });

  const groupedByCategory: Record<string, PublicShoppingListItem[]> = {};
  for (const it of list) {
    if (!groupedByCategory[it.category]) groupedByCategory[it.category] = [];
    groupedByCategory[it.category].push(it);
  }

  return {
    items: list,
    groupedByCategory,
    event: {
      quoteNumber: quote.quoteNumber,
      eventDate: quote.eventDate.toISOString(),
      eventCity: quote.eventCity,
      guestCount: quote.guestCount,
    },
  };
}
