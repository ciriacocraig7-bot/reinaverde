-- Snapshot de packagingTotal en cada Quote.

ALTER TABLE "quotes"
  ADD COLUMN IF NOT EXISTS "packagingTotal" DECIMAL(12,2) NOT NULL DEFAULT 0;
