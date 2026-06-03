-- Diseñador de Producto · Reina Verde Catering
-- Migración aditiva: agrega enums, columnas y tablas para el motor de costeo,
-- impuestos colombianos (IVA/RST/ICA/retenciones) y cotizaciones (Quote).
-- No elimina ni modifica datos existentes.

-- ════════════════════════════════════════════════════════════════
-- ENUMS NUEVOS
-- ════════════════════════════════════════════════════════════════

DO $$ BEGIN
  CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT','SENT','ACCEPTED','PAYMENT_PENDING','PAID','EXPIRED','REJECTED','CONVERTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "TaxRegime" AS ENUM ('COMMON','SIMPLE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "MomentType" AS ENUM ('DBR','RFG','ALM','GAL','MEX','COC');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ════════════════════════════════════════════════════════════════
-- EXTENSIONES A TABLAS EXISTENTES
-- ════════════════════════════════════════════════════════════════

-- MenuItem: campos de costeo
ALTER TABLE "menu_items"
  ADD COLUMN IF NOT EXISTS "momentType"           "MomentType",
  ADD COLUMN IF NOT EXISTS "servingSize"          TEXT,
  ADD COLUMN IF NOT EXISTS "laborMinutes"         INTEGER       NOT NULL DEFAULT 15,
  ADD COLUMN IF NOT EXISTS "difficultyFactor"     DECIMAL(4,2)  NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS "targetMarginPercent"  DECIMAL(4,3)  NOT NULL DEFAULT 0.40;

-- Ingredient: yield (merma) + categoría
ALTER TABLE "ingredients"
  ADD COLUMN IF NOT EXISTS "yieldPercent"  DECIMAL(4,3)  NOT NULL DEFAULT 0.95,
  ADD COLUMN IF NOT EXISTS "category"      TEXT;

-- Order: trazabilidad de cotización origen
ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "quoteId" TEXT;

-- Constraint UNIQUE en quoteId (válido porque la columna es nueva y todas las filas son NULL)
DO $$ BEGIN
  CREATE UNIQUE INDEX "orders_quoteId_key" ON "orders"("quoteId");
EXCEPTION WHEN duplicate_table THEN null; END $$;

-- ════════════════════════════════════════════════════════════════
-- NUEVAS TABLAS
-- ════════════════════════════════════════════════════════════════

-- Singleton de configuración de pricing
CREATE TABLE IF NOT EXISTS "pricing_config" (
  "id"                           TEXT          PRIMARY KEY DEFAULT 'default',
  "taxRegime"                    "TaxRegime"   NOT NULL DEFAULT 'COMMON',
  "vatRate"                      DECIMAL(5,4)  NOT NULL DEFAULT 0.19,
  "simpleRate"                   DECIMAL(5,4)  NOT NULL DEFAULT 0.054,
  "incRate"                      DECIMAL(5,4)  NOT NULL DEFAULT 0.08,
  "laborCostPerHour"             DECIMAL(10,2) NOT NULL DEFAULT 18000,
  "laborBenefitFactor"           DECIMAL(4,2)  NOT NULL DEFAULT 1.60,
  "cifPercent"                   DECIMAL(5,4)  NOT NULL DEFAULT 0.08,
  "transportBase"                DECIMAL(10,2) NOT NULL DEFAULT 80000,
  "transportPerKm"               DECIMAL(10,2) NOT NULL DEFAULT 2000,
  "defaultMarginPercent"         DECIMAL(4,3)  NOT NULL DEFAULT 0.40,
  "reteFuenteRateDeclarante"     DECIMAL(5,4)  NOT NULL DEFAULT 0.04,
  "reteFuenteRateNoDeclarante"   DECIMAL(5,4)  NOT NULL DEFAULT 0.06,
  "reteIvaRate"                  DECIMAL(5,4)  NOT NULL DEFAULT 0.15,
  "updatedBy"                    TEXT,
  "updatedAt"                    TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt"                    TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tarifas por ciudad (ICA + transporte)
CREATE TABLE IF NOT EXISTS "city_tax_rates" (
  "id"                  TEXT          PRIMARY KEY,
  "city"                TEXT          NOT NULL UNIQUE,
  "icaRate"             DECIMAL(6,5)  NOT NULL DEFAULT 0.00966,
  "reteIcaRate"         DECIMAL(6,5)  NOT NULL DEFAULT 0.00966,
  "transportSurcharge"  DECIMAL(10,2) NOT NULL DEFAULT 0,
  "isActive"            BOOLEAN       NOT NULL DEFAULT true,
  "createdAt"           TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Descuentos por volumen (comensales)
CREATE TABLE IF NOT EXISTS "volume_discounts" (
  "id"              TEXT          PRIMARY KEY,
  "minGuests"       INTEGER       NOT NULL UNIQUE,
  "discountPercent" DECIMAL(4,3)  NOT NULL,
  "isActive"        BOOLEAN       NOT NULL DEFAULT true,
  "createdAt"       TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Temporadas (alta/baja por rango de fechas)
CREATE TABLE IF NOT EXISTS "seasonal_rates" (
  "id"            TEXT          PRIMARY KEY,
  "name"          TEXT          NOT NULL,
  "startMonth"    INTEGER       NOT NULL,
  "startDay"      INTEGER       NOT NULL,
  "endMonth"      INTEGER       NOT NULL,
  "endDay"        INTEGER       NOT NULL,
  "rateModifier"  DECIMAL(4,3)  NOT NULL DEFAULT 1.0,
  "isActive"      BOOLEAN       NOT NULL DEFAULT true,
  "createdAt"     TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Cotizaciones (Quote): snapshot completo con desglose tributario
CREATE TABLE IF NOT EXISTS "quotes" (
  "id"                    TEXT          PRIMARY KEY,
  "quoteNumber"           TEXT          NOT NULL UNIQUE,
  "userId"                TEXT          NOT NULL,
  "status"                "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
  "eventType"             "EventType",
  "momentTypes"           "MomentType"[] NOT NULL DEFAULT ARRAY[]::"MomentType"[],
  "guestCount"            INTEGER       NOT NULL,
  "eventDate"             TIMESTAMP(3)  NOT NULL,
  "eventTime"             TEXT          NOT NULL,
  "eventCity"             TEXT          NOT NULL,
  "eventAddress"          TEXT          NOT NULL,
  "itemsJson"             JSONB         NOT NULL,
  "cmpTotal"              DECIMAL(12,2) NOT NULL,
  "cmoTotal"              DECIMAL(12,2) NOT NULL,
  "cifTotal"              DECIMAL(12,2) NOT NULL,
  "transportTotal"        DECIMAL(12,2) NOT NULL,
  "costTotal"             DECIMAL(12,2) NOT NULL,
  "marginAmount"          DECIMAL(12,2) NOT NULL,
  "subtotal"              DECIMAL(12,2) NOT NULL,
  "volumeDiscountAmount"  DECIMAL(12,2) NOT NULL DEFAULT 0,
  "seasonalAdjustment"    DECIMAL(12,2) NOT NULL DEFAULT 0,
  "taxableBase"           DECIMAL(12,2) NOT NULL,
  "vatAmount"             DECIMAL(12,2) NOT NULL DEFAULT 0,
  "incAmount"             DECIMAL(12,2) NOT NULL DEFAULT 0,
  "icaAmount"             DECIMAL(12,2) NOT NULL DEFAULT 0,
  "simpleAmount"          DECIMAL(12,2) NOT NULL DEFAULT 0,
  "total"                 DECIMAL(12,2) NOT NULL,
  "reteFuenteAmount"      DECIMAL(12,2) NOT NULL DEFAULT 0,
  "reteIvaAmount"         DECIMAL(12,2) NOT NULL DEFAULT 0,
  "reteIcaAmount"         DECIMAL(12,2) NOT NULL DEFAULT 0,
  "netReceivable"         DECIMAL(12,2) NOT NULL,
  "pricingConfigSnapshot" JSONB         NOT NULL,
  "expiresAt"             TIMESTAMP(3)  NOT NULL,
  "notes"                 TEXT,
  "dietaryNotes"          TEXT,
  "createdAt"             TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"             TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "quotes_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "quotes_userId_status_idx" ON "quotes"("userId","status");

-- FK en orders.quoteId → quotes.id
DO $$ BEGIN
  ALTER TABLE "orders"
    ADD CONSTRAINT "orders_quoteId_fkey" FOREIGN KEY ("quoteId")
      REFERENCES "quotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Insertar el singleton si no existe
INSERT INTO "pricing_config" ("id")
VALUES ('default')
ON CONFLICT ("id") DO NOTHING;
