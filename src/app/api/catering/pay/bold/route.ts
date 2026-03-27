import { NextRequest, NextResponse } from "next/server";
import { generateIntegritySignature } from "@/lib/bold/button";

const BOLD_API_KEY = process.env.NEXT_PUBLIC_BOLD_API_KEY || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, reference, description, customerEmail, customerName, customerPhone, deliveryAddress, deliveryCity } = body;

    if (!amount || !reference) {
      return NextResponse.json({ error: "Monto y referencia son requeridos" }, { status: 400 });
    }

    // Amount must be integer (no decimals) and at least 1000 COP
    const amountInt = Math.round(Number(amount));
    if (amountInt < 1000) {
      return NextResponse.json({ error: "El monto mínimo es $1.000 COP" }, { status: 400 });
    }

    const boldOrderId = `CAT-${reference}`;

    // Generate integrity signature server-side
    const integritySignature = generateIntegritySignature(
      boldOrderId,
      amountInt,
      "COP"
    );

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    return NextResponse.json({
      apiKey: BOLD_API_KEY,
      amount: amountInt,
      currency: "COP",
      orderId: boldOrderId,
      integritySignature,
      description: (description || "Pedido Catering - Reina Verde").slice(0, 100),
      tax: "vat-19",
      redirectionUrl: `${baseUrl}/catering/orden/confirmacion`,
      customerData: {
        email: customerEmail || "",
        fullName: customerName || "",
        phone: customerPhone || "",
        dialCode: "+57",
      },
      billingAddress: {
        address: deliveryAddress || "",
        city: deliveryCity || "",
        country: "CO",
      },
    });
  } catch (error) {
    console.error("Catering Bold config error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al configurar pago Bold" },
      { status: 500 }
    );
  }
}
