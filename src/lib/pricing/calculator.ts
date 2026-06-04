/**
 * Motor de cálculo de pricing para el Diseñador de Producto · Reina Verde.
 *
 * Modelo de costos (Colombia, sector catering):
 *   1. CMP — Costo Materia Prima
 *      Σ (cantidad ingrediente / yieldPercent × costoUnitario) × cantidad pedida.
 *      Dividir por yieldPercent contabiliza la merma — para servir 100g utilizables
 *      con 95% rendimiento hay que comprar 105g.
 *
 *   2. CMO — Costo Mano de Obra
 *      (laborMinutes / 60) × hourlyRate × benefitFactor × difficultyFactor × cantidad.
 *      El benefitFactor (≈1.60) cubre parafiscales y prestaciones laborales.
 *
 *   3. CIF — Costos Indirectos de Fabricación
 *      cifPercent × CMP.
 *
 *   4. Transporte — base + recargo por ciudad.
 *
 *   costTotal = CMP + CMO + CIF + Transporte.
 *
 *   marginAmount = costTotal × m / (1 − m)   donde m = marginPercent.
 *   (margen SOBRE VENTA, no markup. m=0.40 ⇒ ganancia = 40% del precio final.)
 *
 *   subtotal = costTotal + marginAmount.
 *
 *   Ajuste por volumen — si guestCount ≥ minGuests, se aplica el descuento mayor.
 *   Ajuste estacional — multiplicador 0.92 / 1.00 / 1.15 según fecha.
 *
 *   Impuestos (según taxRegime):
 *     COMMON → IVA 19% + ICA municipal (sobre taxableBase).
 *     SIMPLE → tarifa única RST (~5.4%), integra IVA+ICA+Renta. No discrimina IVA.
 *
 *   Retenciones informativas (asumiendo cliente agente retenedor declarante):
 *     ReteFuente 4% del subtotal (servicios).
 *     ReteIVA 15% del IVA generado (sólo si COMMON).
 *     ReteICA municipal del subtotal.
 *
 *   netReceivable = total − retenciones = lo que efectivamente recibe Reina Verde.
 *
 * NOTA: Toda la matemática usa números JS (no Decimal). Los DECIMAL de Prisma
 * son convertidos a number al leer. Esto es seguro para montos en COP porque
 * el precio total nunca pasa los Number.MAX_SAFE_INTEGER, pero se redondean
 * a entero al final (COP no usa decimales).
 */

import { prisma } from "@/lib/db/prisma";
import { TaxRegime } from "@/generated/prisma/enums";
import type {
  PricingInput,
  PricingBreakdown,
  ItemBreakdown,
  IngredientCostLine,
} from "./types";

const ROUND = (n: number) => Math.round(n);

/** Convierte un Prisma Decimal o number a number plano. */
function num(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number.parseFloat(v) || 0;
  if (typeof v === "object" && v !== null && "toString" in v) {
    return Number.parseFloat((v as { toString(): string }).toString()) || 0;
  }
  return 0;
}

/** Devuelve el SeasonalRate que cubre la fecha dada (o null). */
function seasonForDate(
  date: Date,
  seasons: Array<{
    id: string;
    name: string;
    startMonth: number;
    startDay: number;
    endMonth: number;
    endDay: number;
    rateModifier: number;
    isActive: boolean;
  }>,
) {
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  const md = m * 100 + d;
  for (const s of seasons) {
    if (!s.isActive) continue;
    const start = s.startMonth * 100 + s.startDay;
    const end = s.endMonth * 100 + s.endDay;
    // Si el rango cruza el año (Dec → Jan): start > end ⇒ "fuera del medio del año".
    if (start <= end) {
      if (md >= start && md <= end) return s;
    } else {
      if (md >= start || md <= end) return s;
    }
  }
  return null;
}

/**
 * Calcula el desglose completo de pricing. Lee config + ingredientes desde Prisma.
 * Retorna un breakdown listo para mostrar en UI o persistir como snapshot.
 *
 * Lanza Error si:
 *   - PricingConfig no existe (debe estar seedado).
 *   - La ciudad no está registrada en CityTaxRate.
 *   - Algún menuItemId no existe o está inactivo.
 */
export async function calculatePricing(
  input: PricingInput,
): Promise<PricingBreakdown> {
  // ── 1. Cargar config global ────────────────────────────────────
  const config = await prisma.pricingConfig.findUnique({
    where: { id: "default" },
  });
  if (!config) {
    throw new Error(
      "PricingConfig 'default' no encontrado. Corre `npm run seed`.",
    );
  }

  const regime = input.overrideTaxRegime ?? config.taxRegime;
  const marginPercent =
    input.overrideMarginPercent ?? num(config.defaultMarginPercent);
  const hourlyRate = num(config.laborCostPerHour);
  const benefitFactor = num(config.laborBenefitFactor);
  const cifPercent = num(config.cifPercent);
  const defaultPackagingPercent = num(config.defaultPackagingMarkupPercent);
  const transportBase = num(config.transportBase);
  const vatRate = num(config.vatRate);
  const simpleRate = num(config.simpleRate);
  const incRate = num(config.incRate);
  const reteFuenteRate = input.clientIsDeclarante === false
    ? num(config.reteFuenteRateNoDeclarante)
    : num(config.reteFuenteRateDeclarante);
  const reteIvaRate = num(config.reteIvaRate);

  // ── 2. City tax (ICA + transporte) ─────────────────────────────
  const cityRate = await prisma.cityTaxRate.findUnique({
    where: { city: input.city },
  });
  if (!cityRate) {
    throw new Error(
      `Ciudad "${input.city}" no registrada en city_tax_rates. Crea la tarifa en /admin/pricing.`,
    );
  }
  const icaRate = num(cityRate.icaRate);
  const reteIcaRate = num(cityRate.reteIcaRate);
  const transportSurcharge = num(cityRate.transportSurcharge);

  // ── 3. Cargar menu items con ingredientes ─────────────────────
  const menuItemIds = input.items.map((i) => i.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds } },
    include: {
      ingredients: { include: { ingredient: true } },
    },
  });
  const menuById = new Map(menuItems.map((m) => [m.id, m]));

  // Cargar ingredientes extras posiblemente referidos en customizations.
  const extraIngredientIds = new Set<string>();
  for (const it of input.items) {
    for (const ex of it.customizations?.extraIngredients ?? []) {
      extraIngredientIds.add(ex.ingredientId);
    }
  }
  const extraIngredients =
    extraIngredientIds.size > 0
      ? await prisma.ingredient.findMany({
          where: { id: { in: [...extraIngredientIds] } },
        })
      : [];
  const extraById = new Map(extraIngredients.map((e) => [e.id, e]));

  // ── 4. CMP + CMO + Empaque por item ───────────────────────────
  const itemBreakdowns: ItemBreakdown[] = [];
  let cmpTotal = 0;
  let cmoTotal = 0;
  let packagingTotal = 0;

  for (const inputItem of input.items) {
    const menu = menuById.get(inputItem.menuItemId);
    if (!menu) {
      throw new Error(
        `MenuItem ${inputItem.menuItemId} no existe o fue eliminado.`,
      );
    }
    if (!menu.isActive) {
      throw new Error(`MenuItem "${menu.name}" no está activo.`);
    }

    const qty = inputItem.quantity;
    const portion = inputItem.customizations?.portionMultiplier ?? 1;
    const removed = new Set(
      inputItem.customizations?.removedIngredientIds ?? [],
    );

    // CMP de receta base (sin removidos)
    const lines: IngredientCostLine[] = [];
    let cmpPerPortion = 0;
    for (const mi of menu.ingredients) {
      if (removed.has(mi.ingredient.id)) continue;
      const qtyPerPortion = num(mi.quantity) * portion;
      const yieldPct = num(mi.ingredient.yieldPercent);
      const costUnit = num(mi.ingredient.costPerUnit);
      const cost = qtyPerPortion > 0 && yieldPct > 0
        ? (qtyPerPortion / yieldPct) * costUnit
        : 0;
      const totalCost = cost * qty;
      cmpPerPortion += cost;
      lines.push({
        ingredientId: mi.ingredient.id,
        name: mi.ingredient.name,
        unit: mi.ingredient.unit,
        quantityPerPortion: qtyPerPortion,
        yieldPercent: yieldPct,
        costPerUnit: costUnit,
        totalCost,
      });
    }

    // CMP extras
    for (const ex of inputItem.customizations?.extraIngredients ?? []) {
      const ing = extraById.get(ex.ingredientId);
      if (!ing) continue;
      const yieldPct = num(ing.yieldPercent);
      const costUnit = num(ing.costPerUnit);
      const cost = yieldPct > 0 ? (ex.quantity / yieldPct) * costUnit : 0;
      const totalCost = cost * qty;
      cmpPerPortion += cost;
      lines.push({
        ingredientId: ing.id,
        name: `${ing.name} (extra)`,
        unit: ing.unit,
        quantityPerPortion: ex.quantity,
        yieldPercent: yieldPct,
        costPerUnit: costUnit,
        totalCost,
      });
    }

    const cmpSubtotal = cmpPerPortion * qty;

    // CMO
    const laborMinutes = menu.laborMinutes;
    const difficultyFactor = num(menu.difficultyFactor);
    const cmoSubtotal =
      (laborMinutes / 60) * hourlyRate * benefitFactor * difficultyFactor * qty;

    // Empaque por porción: el valor del MenuItem manda; si es 0, cae al markup
    // global como % del CMP de esa porción. Permite que el chef declare empaque
    // específico (caja kraft + cubiertos = $X COP) o se conforme con la regla
    // global del PricingConfig.
    const declaredPackaging = num(menu.packagingCostPerPortion);
    const packagingPerPortion =
      declaredPackaging > 0
        ? declaredPackaging
        : cmpPerPortion * defaultPackagingPercent;
    const packagingSubtotal = packagingPerPortion * qty;

    cmpTotal += cmpSubtotal;
    cmoTotal += cmoSubtotal;
    packagingTotal += packagingSubtotal;

    itemBreakdowns.push({
      menuItemId: menu.id,
      name: menu.name,
      quantity: qty,
      ingredients: lines,
      cmpSubtotal,
      cmoSubtotal,
      packagingSubtotal,
      packagingPerPortion,
      laborMinutes,
      difficultyFactor,
    });
  }

  // ── 5. CIF + Transporte ───────────────────────────────────────
  const cifTotal = cmpTotal * cifPercent;
  const transportTotal = transportBase + transportSurcharge;
  const costTotal =
    cmpTotal + cmoTotal + cifTotal + packagingTotal + transportTotal;

  // ── 6. Margen sobre venta: m = margenSobreVenta
  //     subtotal × m = ganancia ⇒ ganancia = costo × m/(1-m)
  const safeMargin = Math.max(0, Math.min(0.85, marginPercent));
  const marginAmount = (costTotal * safeMargin) / Math.max(0.01, 1 - safeMargin);
  const subtotalRaw = costTotal + marginAmount;

  // ── 7. Descuento por volumen ──────────────────────────────────
  const discounts = await prisma.volumeDiscount.findMany({
    where: { isActive: true },
    orderBy: { minGuests: "desc" },
  });
  let volumeAmount = 0;
  let volumeApplied: { minGuests: number; discountPercent: number } | null = null;
  for (const d of discounts) {
    if (input.guestCount >= d.minGuests) {
      const pct = num(d.discountPercent);
      volumeAmount = subtotalRaw * pct;
      volumeApplied = { minGuests: d.minGuests, discountPercent: pct };
      break;
    }
  }

  // ── 8. Ajuste estacional (sobre el subtotal post-descuento)
  const seasons = await prisma.seasonalRate.findMany({
    where: { isActive: true },
  });
  const season = seasonForDate(
    input.eventDate,
    seasons.map((s) => ({
      id: s.id,
      name: s.name,
      startMonth: s.startMonth,
      startDay: s.startDay,
      endMonth: s.endMonth,
      endDay: s.endDay,
      rateModifier: num(s.rateModifier),
      isActive: s.isActive,
    })),
  );
  const baseAfterDiscount = subtotalRaw - volumeAmount;
  const seasonalModifier = season ? season.rateModifier : 1.0;
  const seasonalAdjustment = baseAfterDiscount * (seasonalModifier - 1);
  const taxableBase = baseAfterDiscount + seasonalAdjustment;

  // ── 9. Impuestos según régimen ────────────────────────────────
  let vatAmount = 0;
  let icaAmount = 0;
  let simpleAmount = 0;
  let incAmount = 0;

  if (regime === TaxRegime.COMMON) {
    vatAmount = taxableBase * vatRate;
    icaAmount = taxableBase * icaRate;
    // INC opcional (catering en sitio). Por defecto 0 — se activa cambiando incRate
    // o agregando un override futuro. Mantengo el campo para extensibilidad.
    incAmount = 0;
  } else {
    // SIMPLE
    simpleAmount = taxableBase * simpleRate;
  }
  const total = taxableBase + vatAmount + icaAmount + incAmount + simpleAmount;

  // ── 10. Retenciones (cliente agente retenedor) ────────────────
  let reteFuenteAmount = 0;
  let reteIvaAmount = 0;
  let reteIcaAmount = 0;
  let reteFuenteNotes: string | undefined;

  if (regime === TaxRegime.COMMON) {
    reteFuenteAmount = taxableBase * reteFuenteRate;
    reteIvaAmount = vatAmount * reteIvaRate;
    reteIcaAmount = taxableBase * reteIcaRate;
  } else {
    // RST: en general NO está sujeto a retención en fuente para servicios,
    // pero hay casos (e.g. pagos a no responsables). Mostramos disclaimer.
    reteFuenteNotes =
      "Bajo Régimen Simple, normalmente Reina Verde NO está sujeta a ReteFuente. " +
      "Verifica con tu contador la situación específica del contrato.";
    reteIcaAmount = taxableBase * reteIcaRate; // ICA municipal sigue aplicando
  }

  const retentionsTotal = reteFuenteAmount + reteIvaAmount + reteIcaAmount;
  const netReceivable = total - retentionsTotal;

  // ── 11. Construir breakdown final con redondeo a COP entero ───
  const breakdown: PricingBreakdown = {
    items: itemBreakdowns,

    cmpTotal: ROUND(cmpTotal),
    cmoTotal: ROUND(cmoTotal),
    cifTotal: ROUND(cifTotal),
    cifPercent,
    packagingTotal: ROUND(packagingTotal),
    packagingPercent: defaultPackagingPercent,
    transportTotal: ROUND(transportTotal),
    transportBase: ROUND(transportBase),
    transportSurcharge: ROUND(transportSurcharge),
    costTotal: ROUND(costTotal),

    marginPercent: safeMargin,
    marginAmount: ROUND(marginAmount),
    subtotal: ROUND(subtotalRaw),

    volumeDiscount: {
      applies: volumeApplied !== null,
      minGuests: volumeApplied?.minGuests ?? null,
      discountPercent: volumeApplied?.discountPercent ?? 0,
      amount: ROUND(volumeAmount),
    },
    seasonal: {
      applies: season !== null && seasonalModifier !== 1,
      seasonName: season?.name ?? null,
      rateModifier: seasonalModifier,
      amount: ROUND(seasonalAdjustment),
    },
    taxableBase: ROUND(taxableBase),

    regime,
    city: input.city,
    vat: { rate: vatRate, amount: ROUND(vatAmount) },
    inc: { rate: incRate, amount: ROUND(incAmount) },
    ica: { rate: icaRate, amount: ROUND(icaAmount) },
    simple: { rate: simpleRate, amount: ROUND(simpleAmount) },
    total: ROUND(total),

    retentions: {
      reteFuente: {
        rate: reteFuenteRate,
        amount: ROUND(reteFuenteAmount),
        notes: reteFuenteNotes,
      },
      reteIva: { rate: reteIvaRate, amount: ROUND(reteIvaAmount) },
      reteIca: { rate: reteIcaRate, amount: ROUND(reteIcaAmount) },
      total: ROUND(retentionsTotal),
    },
    netReceivable: ROUND(netReceivable),

    pricingConfigSnapshot: {
      taxRegime: regime,
      vatRate,
      simpleRate,
      incRate,
      laborCostPerHour: hourlyRate,
      laborBenefitFactor: benefitFactor,
      cifPercent,
      defaultPackagingMarkupPercent: defaultPackagingPercent,
      defaultMarginPercent: safeMargin,
      reteFuenteRate,
      reteIvaRate,
    },
    cityTaxSnapshot: {
      city: input.city,
      icaRate,
      reteIcaRate,
      transportSurcharge,
    },
  };

  return breakdown;
}

/**
 * Calcula el precio sugerido por persona para un solo MenuItem, usado en
 * el catálogo del wizard cliente. Aplica margen + ajustes, NO impuestos
 * (eso se ve sólo en la cotización final).
 *
 * Esto NO requiere ciudad/fecha porque sirve para mostrar un anclaje.
 */
export async function calculateMenuItemSuggestedPrice(
  menuItemId: string,
  marginOverride?: number,
): Promise<{
  pricePerPerson: number;
  cmpPerPerson: number;
  cmoPerPerson: number;
  packagingPerPerson: number;
}> {
  const config = await prisma.pricingConfig.findUnique({
    where: { id: "default" },
  });
  if (!config) throw new Error("PricingConfig faltante");

  const menu = await prisma.menuItem.findUnique({
    where: { id: menuItemId },
    include: { ingredients: { include: { ingredient: true } } },
  });
  if (!menu) throw new Error(`MenuItem ${menuItemId} no existe`);

  const hourlyRate = num(config.laborCostPerHour);
  const benefitFactor = num(config.laborBenefitFactor);
  const cifPercent = num(config.cifPercent);
  const packagingDefault = num(config.defaultPackagingMarkupPercent);
  const marginPercent =
    marginOverride ?? num(menu.targetMarginPercent) ?? num(config.defaultMarginPercent);

  let cmp = 0;
  for (const mi of menu.ingredients) {
    const yieldPct = num(mi.ingredient.yieldPercent) || 1;
    cmp += (num(mi.quantity) / yieldPct) * num(mi.ingredient.costPerUnit);
  }
  const cmo =
    (menu.laborMinutes / 60) *
    hourlyRate *
    benefitFactor *
    num(menu.difficultyFactor);
  const cif = cmp * cifPercent;
  const declared = num(menu.packagingCostPerPortion);
  const packaging = declared > 0 ? declared : cmp * packagingDefault;
  const cost = cmp + cmo + cif + packaging;
  const safeMargin = Math.max(0, Math.min(0.85, marginPercent));
  const price = cost / Math.max(0.01, 1 - safeMargin);

  return {
    pricePerPerson: ROUND(price),
    cmpPerPerson: ROUND(cmp),
    cmoPerPerson: ROUND(cmo),
    packagingPerPerson: ROUND(packaging),
  };
}
