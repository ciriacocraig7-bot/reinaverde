-- Ensure PHARMA exists in the BusinessLine enum (replacing legacy CANABICO).
-- ALTER TYPE ... ADD VALUE IF NOT EXISTS is idempotent.
ALTER TYPE "BusinessLine" ADD VALUE IF NOT EXISTS 'PHARMA';

-- Migrate any rows still using the legacy "CANABICO" value to PHARMA.
UPDATE "product_categories" SET "businessLine" = 'PHARMA' WHERE "businessLine"::text = 'CANABICO';
UPDATE "products"            SET "businessLine" = 'PHARMA' WHERE "businessLine"::text = 'CANABICO';
UPDATE "shop_orders"         SET "businessLine" = 'PHARMA' WHERE "businessLine"::text = 'CANABICO';
