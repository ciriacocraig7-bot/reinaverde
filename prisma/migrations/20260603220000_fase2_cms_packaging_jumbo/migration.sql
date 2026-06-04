-- Fase 2 · CMS Admin + Packaging + Jumbo reference
-- Migración aditiva. No elimina ni modifica datos existentes.

-- ════════════════════════════════════════════════════════════════
-- MenuItem · packaging cost por porción
-- ════════════════════════════════════════════════════════════════

ALTER TABLE "menu_items"
  ADD COLUMN IF NOT EXISTS "packagingCostPerPortion" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- ════════════════════════════════════════════════════════════════
-- Ingredient · referencia Jumbo
-- ════════════════════════════════════════════════════════════════

ALTER TABLE "ingredients"
  ADD COLUMN IF NOT EXISTS "jumboReferencePrice" DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS "jumboReferenceUrl"   TEXT,
  ADD COLUMN IF NOT EXISTS "lastJumboCheck"      TIMESTAMP(3);

-- ════════════════════════════════════════════════════════════════
-- PricingConfig · markup empaque global
-- ════════════════════════════════════════════════════════════════

ALTER TABLE "pricing_config"
  ADD COLUMN IF NOT EXISTS "defaultPackagingMarkupPercent" DECIMAL(4,3) NOT NULL DEFAULT 0;

-- ════════════════════════════════════════════════════════════════
-- Quote · snapshot empaque
-- ════════════════════════════════════════════════════════════════

ALTER TABLE "quotes"
  ADD COLUMN IF NOT EXISTS "packagingTotal" DECIMAL(12,2) NOT NULL DEFAULT 0;
