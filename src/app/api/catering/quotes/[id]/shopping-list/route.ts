/**
 * GET /api/catering/quotes/[id]/shopping-list
 *
 * Lista pública de compras para una cotización. SIN costos, SIN proveedor.
 * Cliente puede ver exactamente qué insumos se compran para su evento.
 *
 * Acceso por id directo (link compartible) — el id es UUID no enumerable.
 */
import { NextRequest, NextResponse } from "next/server";
import { shoppingListForQuote } from "@/lib/pricing/shopping-list";

export const maxDuration = 15;

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const result = await shoppingListForQuote(id);
    if (!result) {
      return NextResponse.json({ error: "Cotización no encontrada" }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("public shopping-list error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 },
    );
  }
}
