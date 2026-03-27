import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { mapBoldWebhookStatus } from "@/lib/bold/button";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Bold Botón de Pagos webhook payload structure
    // event: "payment.approved", "payment.declined", "payment.error", etc.
    const { event, data } = body;

    // Extract order reference from the order_id (format: BOLD-{orderNumber})
    const boldOrderId = data?.order_id;
    const reference = data?.reference || boldOrderId;

    if (!reference) {
      console.error("No reference found in Bold webhook");
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
    }

    // Find order by Bold reference
    const order = await prisma.shopOrder.findFirst({
      where: { boldReference: reference },
    });

    if (!order) {
      console.error("Shop order not found for Bold reference:", reference);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const mappedStatus = mapBoldWebhookStatus(event);

    if (mappedStatus === "APPROVED") {
      await prisma.shopOrder.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          boldTransactionId: data.transaction_id || data.id,
          paymentMethod: mapPaymentMethod(data.payment_method),
          paidAt: new Date(),
        },
      });
    } else if (mappedStatus === "DECLINED" || mappedStatus === "ERROR" || mappedStatus === "EXPIRED") {
      await prisma.shopOrder.update({
        where: { id: order.id },
        data: {
          status: "PENDING",
          boldTransactionId: data.transaction_id || data.id,
        },
      });
    }

    return NextResponse.json({ received: true, status: mappedStatus });
  } catch (error) {
    console.error("Bold webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

function mapPaymentMethod(method: string): "CREDIT_CARD" | "DEBIT_CARD" | "PSE" | "NEQUI" | "CASH_ON_DELIVERY" | null {
  const methodMap: Record<string, "CREDIT_CARD" | "DEBIT_CARD" | "PSE" | "NEQUI"> = {
    credit_card: "CREDIT_CARD",
    debit_card: "DEBIT_CARD",
    pse: "PSE",
    nequi: "NEQUI",
    bancolombia: "NEQUI",
    daviplata: "NEQUI",
    card: "CREDIT_CARD",
    "credit-card": "CREDIT_CARD",
    "debit-card": "DEBIT_CARD",
  };
  return methodMap[method?.toLowerCase()] || null;
}
