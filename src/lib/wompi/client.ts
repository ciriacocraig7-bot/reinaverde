import crypto from "crypto";

const WOMPI_API_URL = process.env.WOMPI_API_URL || "https://sandbox.wompi.co/v1";
const WOMPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || "";
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY || "";
const WOMPI_EVENTS_SECRET = process.env.WOMPI_EVENTS_SECRET || "";
const WOMPI_INTEGRITY_SECRET = process.env.WOMPI_INTEGRITY_SECRET || "";

interface CreateTransactionParams {
  amountInCents: number;
  currency: string;
  customerEmail: string;
  reference: string;
  redirectUrl: string;
  customerData?: {
    fullName: string;
    phoneNumber?: string;
  };
}

interface WompiTransaction {
  id: string;
  status: string;
  reference: string;
  amount_in_cents: number;
  payment_method_type: string;
}

export async function getAcceptanceToken(): Promise<string> {
  const response = await fetch(`${WOMPI_API_URL}/merchants/${WOMPI_PUBLIC_KEY}`);
  const data = await response.json();
  return data.data.presigned_acceptance.acceptance_token;
}

export async function createPaymentLink(params: CreateTransactionParams): Promise<string> {
  const integrityHash = generateIntegritySignature(
    params.reference,
    params.amountInCents,
    params.currency
  );

  const checkoutUrl = new URL("https://checkout.wompi.co/p/");
  checkoutUrl.searchParams.set("public-key", WOMPI_PUBLIC_KEY);
  checkoutUrl.searchParams.set("currency", params.currency);
  checkoutUrl.searchParams.set("amount-in-cents", params.amountInCents.toString());
  checkoutUrl.searchParams.set("reference", params.reference);
  checkoutUrl.searchParams.set("redirect-url", params.redirectUrl);
  checkoutUrl.searchParams.set("signature:integrity", integrityHash);

  return checkoutUrl.toString();
}

export async function createTransaction(params: CreateTransactionParams): Promise<WompiTransaction> {
  const acceptanceToken = await getAcceptanceToken();

  const response = await fetch(`${WOMPI_API_URL}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
    },
    body: JSON.stringify({
      amount_in_cents: params.amountInCents,
      currency: params.currency,
      customer_email: params.customerEmail,
      reference: params.reference,
      acceptance_token: acceptanceToken,
      redirect_url: params.redirectUrl,
    }),
  });

  const data = await response.json();
  return data.data;
}

export async function getTransaction(transactionId: string): Promise<WompiTransaction> {
  const response = await fetch(`${WOMPI_API_URL}/transactions/${transactionId}`, {
    headers: {
      Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
    },
  });

  const data = await response.json();
  return data.data;
}

export function generateIntegritySignature(
  reference: string,
  amountInCents: number,
  currency: string
): string {
  const data = `${reference}${amountInCents}${currency}${WOMPI_INTEGRITY_SECRET}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

export function verifyWebhookSignature(
  body: string,
  signature: string,
  timestamp: string
): boolean {
  const payload = `${timestamp}${body}`;
  const expectedSignature = crypto
    .createHmac("sha256", WOMPI_EVENTS_SECRET)
    .update(payload)
    .digest("hex");
  return signature === expectedSignature;
}

export function mapWompiStatus(status: string): "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR" {
  const statusMap: Record<string, "PENDING" | "APPROVED" | "DECLINED" | "VOIDED" | "ERROR"> = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    DECLINED: "DECLINED",
    VOIDED: "VOIDED",
    ERROR: "ERROR",
  };
  return statusMap[status] || "ERROR";
}
