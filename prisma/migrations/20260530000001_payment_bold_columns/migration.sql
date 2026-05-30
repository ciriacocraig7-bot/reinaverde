-- Add Bold columns + provider enum to payments
ALTER TABLE "payments" ADD COLUMN "provider" "PaymentProvider" NOT NULL DEFAULT 'BOLD';
ALTER TABLE "payments" ADD COLUMN "boldTransactionId" TEXT;
ALTER TABLE "payments" ADD COLUMN "boldReference" TEXT;

CREATE UNIQUE INDEX "payments_boldTransactionId_key" ON "payments"("boldTransactionId");
CREATE UNIQUE INDEX "payments_boldReference_key" ON "payments"("boldReference");
