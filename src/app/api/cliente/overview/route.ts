/**
 * GET /api/cliente/overview
 *
 * Devuelve el resumen completo del cliente logueado:
 *   - Pedidos catering (Order) — incluyendo los que vinieron de Quote
 *   - Pedidos pharma + liofilizados (ShopOrder)
 *   - Cotizaciones del diseñador (Quote) — todas, paid o no
 *   - KPIs: pedidos activos, eventos próximos, inversión 12m, etc.
 *
 * Requiere sesión activa. Solo devuelve lo del propio user.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { readSession } from "@/lib/auth/cookies";

export const maxDuration = 15;

interface UnifiedRow {
  /** Discriminador del origen para que el UI sepa cómo enrutarlo. */
  kind: "catering-order" | "shop-order" | "quote";
  id: string;
  reference: string;
  /** Etiqueta principal — nombre del evento, "Pedido pharma", "Cotización". */
  title: string;
  /** Subtítulo — fecha, ciudad, líneas. */
  subtitle: string;
  /** Estado normalizado. */
  status: string;
  /** Monto en COP. */
  total: number;
  /** Fecha del evento (catering) o fecha de creación (shop / quote draft). ISO. */
  date: string;
  /** Si la row es accionable (link), aquí está el href. */
  href: string | null;
  /** Línea de negocio cuando aplica (PHARMA / LIOFILIZADOS / CATERING). */
  businessLine: "CATERING" | "PHARMA" | "LIOFILIZADOS" | null;
}

export async function GET(request: NextRequest) {
  const session = readSession(request);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = session.userId;

  // ── Cargar todo en paralelo ─────────────────────────────────
  const [orders, shopOrders, quotes] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        quote: { select: { quoteNumber: true } },
      },
      take: 100,
    }),
    prisma.shopOrder.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          take: 1,
          include: { product: { select: { name: true } } },
        },
      },
      take: 100,
    }),
    prisma.quote.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  // ── Unificar en filas ───────────────────────────────────────
  const rows: UnifiedRow[] = [];

  for (const o of orders) {
    rows.push({
      kind: "catering-order",
      id: o.id,
      reference: o.orderNumber,
      title: o.quote?.quoteNumber
        ? `Evento · ${o.quote.quoteNumber}`
        : `Pedido catering`,
      subtitle: `${o.deliveryCity ?? "—"} · ${formatDate(o.deliveryDate)} · ${o.guestCount} comensales`,
      status: o.status,
      total: Number(o.total),
      date: o.deliveryDate.toISOString(),
      href: null, // futuro: /cliente/pedidos/[id]
      businessLine: "CATERING",
    });
  }

  for (const s of shopOrders) {
    const firstItem = s.items[0];
    const lineLabel = s.businessLine === "PHARMA" ? "Pharma" : "Liofilizados";
    const title =
      firstItem?.product?.name
        ? `${lineLabel} · ${firstItem.product.name}${s.items.length > 1 ? " + más" : ""}`
        : `Pedido ${lineLabel}`;
    rows.push({
      kind: "shop-order",
      id: s.id,
      reference: s.orderNumber,
      title,
      subtitle: `${s.shippingCity} · ${formatDate(s.createdAt)}`,
      status: s.status,
      total: Number(s.total),
      date: s.createdAt.toISOString(),
      href:
        s.businessLine === "PHARMA"
          ? `/pharma/confirmacion?order=${s.id}`
          : `/liofilizados/confirmacion?order=${s.id}`,
      businessLine: s.businessLine,
    });
  }

  for (const q of quotes) {
    // Las quotes ya pagadas tienen Order asociada → no duplicamos.
    // Sólo mostramos las que NO terminaron en orden pagada (DRAFT/SENT/EXPIRED/REJECTED).
    if (q.status === "PAID" || q.status === "CONVERTED" || q.status === "PAYMENT_PENDING") {
      continue;
    }
    rows.push({
      kind: "quote",
      id: q.id,
      reference: q.quoteNumber,
      title: `Cotización · ${q.quoteNumber}`,
      subtitle: `${q.eventCity} · ${formatDate(q.eventDate)} · ${q.guestCount} comensales`,
      status: q.status,
      total: Number(q.total),
      date: q.eventDate.toISOString(),
      href: `/catering/cotizar/confirmacion?quote=${q.id}`,
      businessLine: "CATERING",
    });
  }

  // Ordenar desc por fecha del evento / creación
  rows.sort((a, b) => (a.date < b.date ? 1 : -1));

  // ── KPIs ────────────────────────────────────────────────────
  const now = Date.now();
  const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;

  const activeOrders = rows.filter((r) =>
    ["PAID", "IN_PRODUCTION", "READY", "IN_TRANSIT", "PAYMENT_PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"].includes(
      r.status,
    ),
  ).length;

  const upcomingEvents = rows.filter(
    (r) =>
      r.businessLine === "CATERING" &&
      r.kind !== "quote" &&
      new Date(r.date).getTime() > now,
  ).length;

  const investmentLast12m = rows
    .filter((r) => new Date(r.date).getTime() > oneYearAgo)
    .filter((r) =>
      ["PAID", "IN_PRODUCTION", "READY", "IN_TRANSIT", "DELIVERED", "COMPLETED"].includes(r.status),
    )
    .reduce((sum, r) => sum + r.total, 0);

  const lastPaidEvent = rows.find(
    (r) =>
      r.businessLine === "CATERING" &&
      r.kind === "catering-order" &&
      ["PAID", "IN_PRODUCTION", "READY", "IN_TRANSIT", "DELIVERED", "COMPLETED"].includes(r.status),
  );

  return NextResponse.json({
    rows,
    kpis: {
      activeOrders,
      upcomingEvents,
      investmentLast12m,
      totalPedidos: rows.length,
      lastEventDate: lastPaidEvent?.date ?? null,
    },
  });
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(d)
    .toLowerCase();
}
