/*
  Warnings:

  - A unique constraint covering the columns `[boldTransactionId]` on the table `shop_orders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[boldReference]` on the table `shop_orders` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('WOMPI', 'BOLD');

-- AlterTable
ALTER TABLE "shop_orders" ADD COLUMN     "boldReference" TEXT,
ADD COLUMN     "boldTransactionId" TEXT,
ADD COLUMN     "paymentProvider" "PaymentProvider" NOT NULL DEFAULT 'WOMPI';

-- CreateIndex
CREATE UNIQUE INDEX "shop_orders_boldTransactionId_key" ON "shop_orders"("boldTransactionId");

-- CreateIndex
CREATE UNIQUE INDEX "shop_orders_boldReference_key" ON "shop_orders"("boldReference");
