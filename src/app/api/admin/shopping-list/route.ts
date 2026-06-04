/**
 * GET /api/admin/shopping-list
 *
 * Query params (uno requerido):
 *   ?date=YYYY-MM-DD          → todas las orders con deliveryDate = ese día
 *   ?from=YYYY-MM-DD&to=YYYY-MM-DD → rango (to exclusive)
 *   ?orderIds=a,b,c           → lista explícita
 *
 * Acceso: ADMIN | CHEF.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireRoles } from "@/lib/auth/require-role";
import {
  shoppingListForDate,
  shoppingListForDateRange,
  shoppingListForOrders,
} from "@/lib/pricing/shopping-list";

export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const auth = requireRoles(request, ["ADMIN", "CHEF"]);
  if (auth instanceof NextResponse) return auth;

  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const orderIdsParam = url.searchParams.get("orderIds");

  try {
    if (orderIdsParam) {
      const ids = orderIdsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const result = await shoppingListForOrders(ids);
      return NextResponse.json(result);
    }
    if (from && to) {
      const result = await shoppingListForDateRange(new Date(from), new Date(to));
      return NextResponse.json(result);
    }
    if (date) {
      const result = await shoppingListForDate(new Date(date));
      return NextResponse.json(result);
    }
    return NextResponse.json(
      { error: "Debe enviar ?date= , ?from=&to= o ?orderIds=" },
      { status: 400 },
    );
  } catch (err) {
    console.error("shopping-list error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 500 },
    );
  }
}
