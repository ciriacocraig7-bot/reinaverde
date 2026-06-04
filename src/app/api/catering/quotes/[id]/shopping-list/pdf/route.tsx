/**
 * GET /api/catering/quotes/[id]/shopping-list/pdf
 *
 * PDF descargable de la lista de compras del cliente.
 */
import { NextRequest } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { ShoppingListPDFDocument } from "@/components/catering/shopping-list-pdf";
import { shoppingListForQuote } from "@/lib/pricing/shopping-list";

export const runtime = "nodejs";
export const maxDuration = 30;

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const result = await shoppingListForQuote(id);
  if (!result) return new Response("Cotización no encontrada", { status: 404 });

  const stream = await renderToStream(
    <ShoppingListPDFDocument
      quoteNumber={result.event.quoteNumber}
      eventDate={formatDate(new Date(result.event.eventDate))}
      eventCity={result.event.eventCity}
      guestCount={result.event.guestCount}
      groupedByCategory={result.groupedByCategory}
      totalItems={result.items.length}
    />,
  );

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
      "Content-Disposition": `inline; filename="lista-compras-${result.event.quoteNumber}.pdf"`,
      "Cache-Control": "private, max-age=300",
    },
  });
}
