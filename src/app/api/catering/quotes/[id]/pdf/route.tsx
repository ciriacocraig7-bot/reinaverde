/**
 * GET /api/catering/quotes/:id/pdf
 *
 * Genera y descarga un PDF de la cotización. Acceso por id directo (link
 * compartible). El PDF reproduce el desglose tributario completo.
 */
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { renderToStream } from "@react-pdf/renderer";
import { QuotePDFDocument, type QuotePDFProps } from "@/components/catering/quote-pdf-document";
import { TaxRegime } from "@/generated/prisma/enums";

// Node runtime requerido por @react-pdf/renderer (usa Node streams).
export const runtime = "nodejs";
export const maxDuration = 30;

interface QuoteItemJson {
  menuItemId: string;
  quantity: number;
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
    },
  });
  if (!quote) {
    return new Response("Cotización no encontrada", { status: 404 });
  }

  // Cargar nombres de los items
  const itemsJson = quote.itemsJson as unknown as QuoteItemJson[];
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: itemsJson.map((i) => i.menuItemId) } },
    select: { id: true, name: true, basePrice: true },
  });
  const byId = new Map(menuItems.map((m) => [m.id, m]));

  const pdfProps: QuotePDFProps = {
    quoteNumber: quote.quoteNumber,
    createdAt: formatDate(quote.createdAt),
    expiresAt: formatDate(quote.expiresAt),
    status: quote.status,
    client: {
      firstName: quote.user.firstName,
      lastName: quote.user.lastName,
      email: quote.user.email,
    },
    event: {
      date: formatDate(quote.eventDate),
      time: quote.eventTime,
      city: quote.eventCity,
      address: quote.eventAddress,
      guestCount: quote.guestCount,
    },
    items: itemsJson.map((i) => ({
      name: byId.get(i.menuItemId)?.name ?? "—",
      quantity: i.quantity,
      unitPrice: Number(byId.get(i.menuItemId)?.basePrice ?? 0),
    })),
    breakdown: {
      cmpTotal: Number(quote.cmpTotal),
      cmoTotal: Number(quote.cmoTotal),
      cifTotal: Number(quote.cifTotal),
      transportTotal: Number(quote.transportTotal),
      costTotal: Number(quote.costTotal),
      marginAmount: Number(quote.marginAmount),
      subtotal: Number(quote.subtotal),
      volumeDiscountAmount: Number(quote.volumeDiscountAmount),
      seasonalAdjustment: Number(quote.seasonalAdjustment),
      taxableBase: Number(quote.taxableBase),
      vatAmount: Number(quote.vatAmount),
      icaAmount: Number(quote.icaAmount),
      simpleAmount: Number(quote.simpleAmount),
      total: Number(quote.total),
      reteFuenteAmount: Number(quote.reteFuenteAmount),
      reteIvaAmount: Number(quote.reteIvaAmount),
      reteIcaAmount: Number(quote.reteIcaAmount),
      netReceivable: Number(quote.netReceivable),
      regime:
        (quote.pricingConfigSnapshot as { taxRegime?: string } | null)
          ?.taxRegime === TaxRegime.SIMPLE
          ? "SIMPLE"
          : "COMMON",
    },
  };

  const stream = await renderToStream(<QuotePDFDocument {...pdfProps} />);

  // Convertir Node Readable a Web ReadableStream
  const reader = stream as unknown as NodeJS.ReadableStream;
  const webStream = new ReadableStream({
    start(controller) {
      reader.on("data", (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)));
      reader.on("end", () => controller.close());
      reader.on("error", (err) => controller.error(err));
    },
  });

  return new Response(webStream, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="cotizacion-${quote.quoteNumber}.pdf"`,
      "Cache-Control": "private, max-age=300",
    },
  });
}
