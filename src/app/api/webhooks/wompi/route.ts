import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { mapWompiStatus } from "@/lib/wompi/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { event, data } = body;

    if (event !== "transaction.updated") {
      return NextResponse.json({ received: true });
    }

    const transaction = data.transaction;
    const reference: string = transaction.reference;
    const wompiStatus = transaction.status;
    const mappedStatus = mapWompiStatus(wompiStatus);

    // ─── Shop Orders (e-commerce) ─────────────────────────────
    if (reference.startsWith("SHOP-")) {
      const shopOrder = await prisma.shopOrder.findFirst({
        where: { wompiReference: reference },
      });

      if (!shopOrder) {
        console.error("Shop order not found for reference:", reference);
        return NextResponse.json({ error: "Shop order not found" }, { status: 404 });
      }

      if (mappedStatus === "APPROVED") {
        await prisma.shopOrder.update({
          where: { id: shopOrder.id },
          data: {
            status: "PAID",
            wompiTransactionId: transaction.id,
            paymentMethod: mapPaymentMethod(transaction.payment_method_type),
            paidAt: new Date(),
          },
        });
      } else if (mappedStatus === "DECLINED" || mappedStatus === "ERROR") {
        await prisma.shopOrder.update({
          where: { id: shopOrder.id },
          data: {
            status: "PENDING",
            wompiTransactionId: transaction.id,
          },
        });
      }

      return NextResponse.json({ received: true });
    }

    // ─── Catering Orders ──────────────────────────────────────
    const payment = await prisma.payment.findFirst({
      where: { wompiReference: reference },
      include: { order: true },
    });

    if (!payment) {
      console.error("Payment not found for reference:", reference);
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: mappedStatus,
        wompiTransactionId: transaction.id,
        method: mapPaymentMethod(transaction.payment_method_type),
        metadata: transaction,
        paidAt: mappedStatus === "APPROVED" ? new Date() : null,
      },
    });

    if (mappedStatus === "APPROVED") {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "PAID" },
      });

      await prisma.production.create({
        data: {
          orderId: payment.orderId,
          status: "PENDING",
        },
      });

      await prisma.delivery.create({
        data: {
          orderId: payment.orderId,
          status: "PENDING",
        },
      });
    } else if (mappedStatus === "DECLINED" || mappedStatus === "ERROR") {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "PAYMENT_PENDING" },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Wompi webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

function mapPaymentMethod(type: string): "CREDIT_CARD" | "DEBIT_CARD" | "PSE" | "NEQUI" | "CASH_ON_DELIVERY" | null {
  const map: Record<string, "CREDIT_CARD" | "DEBIT_CARD" | "PSE" | "NEQUI"> = {
    CARD: "CREDIT_CARD",
    PSE: "PSE",
    NEQUI: "NEQUI",
  };
  return map[type] || null;
}
