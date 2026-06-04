/**
 * Tipos compartidos del motor de pricing.
 *
 * — Inputs viajan tal cual desde el wizard del cliente o el editor de receta.
 * — Outputs (PricingBreakdown) son lo que se persiste como snapshot en Quote.
 */

import type { MomentType, TaxRegime, EventType } from "@/generated/prisma/client";

/** Customización aplicada por un cliente a un plato base. */
export interface ItemCustomization {
  /** Multiplicador de porción. 1 = porción estándar; 0.5/1.5 son ajustes válidos. */
  portionMultiplier?: number;
  /** Ingredientes adicionales (no incluidos en la receta base). */
  extraIngredients?: Array<{
    ingredientId: string;
    /** Cantidad EXTRA por porción, en la unidad del Ingredient. */
    quantity: number;
  }>;
  /** Ingredientes a remover por persona (alergias, restricciones). */
  removedIngredientIds?: string[];
  /** Notas libres del cliente. */
  notes?: string;
}

export interface PricingItemInput {
  menuItemId: string;
  /** Cantidad pedida = casi siempre igual a guestCount, salvo platos para compartir. */
  quantity: number;
  customizations?: ItemCustomization;
}

export interface PricingInput {
  items: PricingItemInput[];
  city: string;
  guestCount: number;
  momentTypes?: MomentType[];
  /** Fecha del evento (impacta temporada). */
  eventDate: Date;
  /** Override del régimen tributario (para preview en admin). Default: el del PricingConfig. */
  overrideTaxRegime?: TaxRegime;
  /** Override del margen objetivo (sólo se usa cuando el usuario explora "qué pasa si"). */
  overrideMarginPercent?: number;
  /** Asume cliente declarante (true) o no declarante (false). Default true. */
  clientIsDeclarante?: boolean;
  /** Tipo de evento (informativo para el snapshot). */
  eventType?: EventType;
}

export interface IngredientCostLine {
  ingredientId: string;
  name: string;
  unit: string;
  quantityPerPortion: number;
  yieldPercent: number;
  costPerUnit: number;
  /** Costo total para todas las porciones del plato (quantity × por porción). */
  totalCost: number;
}

export interface ItemBreakdown {
  menuItemId: string;
  name: string;
  quantity: number;
  ingredients: IngredientCostLine[];
  cmpSubtotal: number;
  cmoSubtotal: number;
  /** Costo de empaque para todas las porciones del plato. */
  packagingSubtotal: number;
  /** Empaque por porción (lo declarado en MenuItem o el fallback global). */
  packagingPerPortion: number;
  laborMinutes: number;
  difficultyFactor: number;
}

export interface VolumeDiscountApplied {
  applies: boolean;
  minGuests: number | null;
  discountPercent: number;
  amount: number;
}

export interface SeasonalAdjustmentApplied {
  applies: boolean;
  seasonName: string | null;
  rateModifier: number;
  amount: number;
}

export interface RetentionLine {
  rate: number;
  amount: number;
  notes?: string;
}

export interface PricingBreakdown {
  // Composición item-por-item (datos completos para el panel del chef).
  items: ItemBreakdown[];

  // Costos agregados
  cmpTotal: number;
  cmoTotal: number;
  cifTotal: number;
  cifPercent: number;
  packagingTotal: number;
  packagingPercent: number;
  transportTotal: number;
  transportBase: number;
  transportSurcharge: number;
  costTotal: number;

  // Margen
  marginPercent: number;
  marginAmount: number;
  subtotal: number; // costTotal + marginAmount

  // Ajustes
  volumeDiscount: VolumeDiscountApplied;
  seasonal: SeasonalAdjustmentApplied;
  /** Base gravable después de ajustes. Es sobre esto que se calculan impuestos. */
  taxableBase: number;

  // Impuestos según régimen
  regime: TaxRegime;
  city: string;
  vat: RetentionLine; // 0 si SIMPLE
  inc: RetentionLine; // 0 por defecto; se activa con override
  ica: RetentionLine; // sólo si COMMON
  simple: RetentionLine; // sólo si SIMPLE
  total: number; // taxableBase + impuestos = lo que paga el cliente

  // Retenciones que aplicará la empresa cliente (informativas)
  retentions: {
    reteFuente: RetentionLine;
    reteIva: RetentionLine;
    reteIca: RetentionLine;
    total: number;
  };
  netReceivable: number; // total - retenciones

  // Metadata
  pricingConfigSnapshot: {
    taxRegime: TaxRegime;
    vatRate: number;
    simpleRate: number;
    incRate: number;
    laborCostPerHour: number;
    laborBenefitFactor: number;
    cifPercent: number;
    defaultPackagingMarkupPercent: number;
    defaultMarginPercent: number;
    reteFuenteRate: number;
    reteIvaRate: number;
  };
  cityTaxSnapshot: {
    city: string;
    icaRate: number;
    reteIcaRate: number;
    transportSurcharge: number;
  };
}
