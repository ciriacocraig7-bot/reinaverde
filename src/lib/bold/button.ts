import crypto from "crypto";

const BOLD_SECRET_KEY = process.env.BOLD_SECRET_KEY || "";

export interface BoldButtonConfig {
  apiKey: string;
  amount: number; // Sin decimales, ej: 95000
  currency: "COP" | "USD";
  orderId: string;
  description?: string;
  tax?: string; // "vat-5", "vat-19", "iac-8", o JSON '{"vat":1950}'
  redirectionUrl?: string;
  customerData?: {
    email?: string;
    fullName?: string;
    phone?: string;
    dialCode?: string;
    documentNumber?: string;
    documentType?: "CC" | "CE" | "NIT" | "PP" | "TI";
  };
  billingAddress?: {
    address?: string;
    zipCode?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  buttonStyle?: "dark-S" | "dark-M" | "dark-L" | "light-S" | "light-M" | "light-L";
}

export function generateIntegritySignature(
  orderId: string,
  amount: number,
  currency: string,
  secretKey: string = BOLD_SECRET_KEY
): string {
  // Concatenar: {orderId}{amount}{currency}{secretKey}
  const stringToHash = `${orderId}${amount}${currency}${secretKey}`;
  
  // Generar SHA256
  return crypto.createHash("sha256").update(stringToHash).digest("hex");
}

export function createBoldButtonScript(config: BoldButtonConfig): string {
  const integritySignature = generateIntegritySignature(
    config.orderId,
    config.amount,
    config.currency
  );

  const attributes: Record<string, string> = {
    "data-bold-button": config.buttonStyle || "dark-L",
    "data-api-key": config.apiKey,
    "data-amount": config.amount.toString(),
    "data-currency": config.currency,
    "data-order-id": config.orderId,
    "data-integrity-signature": integritySignature,
    src: "https://checkout.bold.co/library/boldPaymentButton.js",
  };

  if (config.description) {
    attributes["data-description"] = config.description;
  }

  if (config.tax) {
    attributes["data-tax"] = config.tax;
  }

  if (config.redirectionUrl) {
    attributes["data-redirection-url"] = config.redirectionUrl;
  }

  if (config.customerData) {
    attributes["data-customer-data"] = JSON.stringify(config.customerData);
  }

  if (config.billingAddress) {
    attributes["data-billing-address"] = JSON.stringify(config.billingAddress);
  }

  // Construir script tag
  const attrs = Object.entries(attributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");

  return `<script ${attrs}></script>`;
}

// Mapear estado de webhook de Bold a nuestros estados
export function mapBoldWebhookStatus(status: string): "PENDING" | "APPROVED" | "DECLINED" | "ERROR" | "EXPIRED" {
  const statusMap: Record<string, "PENDING" | "APPROVED" | "DECLINED" | "ERROR" | "EXPIRED"> = {
    "payment.pending": "PENDING",
    "payment.approved": "APPROVED",
    "payment.declined": "DECLINED",
    "payment.error": "ERROR",
    "payment.expired": "EXPIRED",
    "payment.canceled": "DECLINED",
    "payment.voided": "DECLINED",
  };
  return statusMap[status] || "ERROR";
}
