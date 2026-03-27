const BOLD_API_URL = process.env.BOLD_API_URL || "https://integrations.api.bold.co";
const BOLD_API_KEY = process.env.BOLD_API_KEY || "";

interface CreatePaymentLinkParams {
  amount: number;
  currency?: "COP" | "USD";
  reference: string;
  description: string;
  userEmail: string;
  payerEmail?: string;
  payerPhone?: string;
  payerDocumentType?: "CEDULA" | "NIT" | "CEDULA_EXTRANJERIA" | "PEP" | "PASAPORTE" | "NUIP" | "REGISTRO_CIVIL" | "DOCUMENTO_EXTRANJERIA" | "TARJETA_IDENTIDAD" | "PPT";
  payerDocumentNumber?: string;
  taxes?: {
    type: "VAT" | "CONSUMPTION" | "IVA_19" | "IVA_5" | "IAC_8";
    base?: number;
    value?: number;
  }[];
  tipAmount?: number;
  expirationDate?: number; // nanoseconds since Unix epoch
}

interface BoldPaymentLink {
  integration_id: string;
  payment_link?: string;
}

export async function createPaymentLink(params: CreatePaymentLinkParams): Promise<BoldPaymentLink> {
  const body: Record<string, unknown> = {
    amount_type: "CLOSE",
    amount: {
      currency: params.currency || "COP",
      total_amount: params.amount,
      tip_amount: params.tipAmount || 0,
    },
    reference: params.reference,
    user_email: params.userEmail,
    description: params.description,
  };

  // Add taxes if provided
  if (params.taxes && params.taxes.length > 0) {
    const amountObj = body.amount as Record<string, unknown>;
    amountObj.taxes = params.taxes.map((tax) => ({
      type: tax.type,
      ...(tax.base !== undefined && { base: tax.base }),
      ...(tax.value !== undefined && { value: tax.value }),
    }));
    body.amount = amountObj;
  }

  // Add payer info if provided
  if (params.payerEmail || params.payerPhone || params.payerDocumentType) {
    body.payer = {
      ...(params.payerEmail && { email: params.payerEmail }),
      ...(params.payerPhone && { phone_number: params.payerPhone }),
      ...(params.payerDocumentType && {
        document: {
          document_type: params.payerDocumentType,
          document_number: params.payerDocumentNumber || "",
        },
      }),
    };
  }

  // Add expiration if provided
  if (params.expirationDate) {
    body.expiration_date = params.expirationDate;
  }

  const response = await fetch(`${BOLD_API_URL}/online/link/v1`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": BOLD_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Bold API error: ${response.status}`);
  }

  const data = await response.json();
  return data.payload || data;
}

export async function getPaymentLinkStatus(integrationId: string): Promise<{
  status: string;
  reference?: string;
  amount?: number;
  paid_at?: string;
}> {
  const response = await fetch(`${BOLD_API_URL}/online/link/v1/${integrationId}`, {
    headers: {
      "x-api-key": BOLD_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get payment status: ${response.status}`);
  }

  const data = await response.json();
  return data.payload || data;
}

export function mapBoldStatus(status: string): "PENDING" | "APPROVED" | "DECLINED" | "ERROR" | "EXPIRED" {
  const statusMap: Record<string, "PENDING" | "APPROVED" | "DECLINED" | "ERROR" | "EXPIRED"> = {
    PENDING: "PENDING",
    PAID: "APPROVED",
    APPROVED: "APPROVED",
    DECLINED: "DECLINED",
    REJECTED: "DECLINED",
    ERROR: "ERROR",
    EXPIRED: "EXPIRED",
  };
  return statusMap[status] || "ERROR";
}
