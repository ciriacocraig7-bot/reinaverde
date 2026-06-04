/**
 * GET /api/admin/overview
 *
 * Devuelve toda la data operativa para el tablero principal del admin:
 *   · KPIs reales por línea de negocio (overview / catering / pharma / liofilizados)
 *   · Lista unificada de pedidos (Order + ShopOrder + Quote) ordenados por fecha
 *   · Conteos por estado para filtros
 *
 * Acceso: ADMIN | FINANZAS (FINANZAS solo lee).
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRoles } from "@/lib/auth/require-role";

export const maxDuration = 20;

interface OverviewRow {
  kind: "catering-order" | "shop-order" | "quote";
  id: string;
  reference: string;
  /** Iniciales del cliente para Avatar. */
  initials: string;
  client: string;
  /** Detalle corto del pedido para la tabla. */
  desc: string;
  /** Estado del modelo origen (sin mapear). */
  status: string;
  total: number;
  /** ISO. */
  date: string;
  line: "catering" | "pharma" | "liofilizados";
}

export async function GET(request: NextRequest) {
  const auth = requireRoles(request, ["ADMIN", "FINANZAS"]);
  if (auth instanceof NextResponse) return auth;

  // Rango "este mes" para KPIs de ingresos.
  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const prevMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
  );

  const [orders, shopOrders, quotes, products] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { firstName: true, lastName: true } },
        quote: { select: { quoteNumber: true } },
      },
      take: 500,
    }),
    prisma.shopOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { firstName: true, lastName: true } },
        items: { take: 1, include: { product: { select: { name: true } } } },
      },
      take: 500,
    }),
    prisma.quote.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { firstName: true, lastName: true } } },
      take: 200,
    }),
    prisma.product.count({ where: { isActive: true } }),
  ]);

  // ── Construir rows unificadas ───────────────────────────────
  const rows: OverviewRow[] = [];

  for (const o of orders) {
    const fullName = `${o.user.firstName} ${o.user.lastName}`.trim();
    rows.push({
      kind: "catering-order",
      id: o.id,
      reference: o.orderNumber,
      initials: initialsOf(o.user.firstName, o.user.lastName),
      client: fullName,
      desc: o.quote?.quoteNumber
        ? `Evento · ${o.guestCount} pax · ${o.deliveryCity ?? "—"}`
        : `Pedido catering · ${o.guestCount} pax`,
      status: o.status,
      total: Number(o.total),
      date: o.createdAt.toISOString(),
      line: "catering",
    });
  }

  for (const s of shopOrders) {
    const fullName = `${s.user.firstName} ${s.user.lastName}`.trim();
    const firstName = s.items[0]?.product?.name;
    rows.push({
      kind: "shop-order",
      id: s.id,
      reference: s.orderNumber,
      initials: initialsOf(s.user.firstName, s.user.lastName),
      client: fullName,
      desc: firstName
        ? `${firstName}${s.items.length > 1 ? " + más" : ""}`
        : `Pedido ${s.businessLine === "PHARMA" ? "pharma" : "liofilizados"}`,
      status: s.status,
      total: Number(s.total),
      date: s.createdAt.toISOString(),
      line: s.businessLine === "PHARMA" ? "pharma" : "liofilizados",
    });
  }

  for (const q of quotes) {
    if (
      q.status === "PAID" ||
      q.status === "CONVERTED" ||
      q.status === "PAYMENT_PENDING"
    ) {
      continue; // ya está como Order
    }
    const fullName = `${q.user.firstName} ${q.user.lastName}`.trim();
    rows.push({
      kind: "quote",
      id: q.id,
      reference: q.quoteNumber,
      initials: initialsOf(q.user.firstName, q.user.lastName),
      client: fullName,
      desc: `Cotización · ${q.guestCount} pax · ${q.eventCity}`,
      status: q.status,
      total: Number(q.total),
      date: q.createdAt.toISOString(),
      line: "catering",
    });
  }

  rows.sort((a, b) => (a.date < b.date ? 1 : -1));

  // ── KPIs por línea ──────────────────────────────────────────
  const monthSum = (arr: { total: number; date: string }[]) =>
    arr
      .filter((x) => new Date(x.date) >= monthStart)
      .reduce((s, x) => s + x.total, 0);
  const prevMonthSum = (arr: { total: number; date: string }[]) =>
    arr
      .filter(
        (x) =>
          new Date(x.date) >= prevMonthStart && new Date(x.date) < monthStart,
      )
      .reduce((s, x) => s + x.total, 0);

  const isActive = (status: string) =>
    [
      "PAID",
      "PAYMENT_PENDING",
      "IN_PRODUCTION",
      "READY",
      "IN_TRANSIT",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
    ].includes(status);

  const cateringRows = rows.filter((r) => r.line === "catering" && r.kind !== "quote");
  const pharmaRows = rows.filter((r) => r.line === "pharma");
  const lioRows = rows.filter((r) => r.line === "liofilizados");
  const quoteRows = rows.filter((r) => r.kind === "quote");

  const kpis = {
    overview: {
      ingresoMes: monthSum([...cateringRows, ...pharmaRows, ...lioRows]),
      ingresoMesAnterior: prevMonthSum([...cateringRows, ...pharmaRows, ...lioRows]),
      pedidosActivos: rows.filter((r) => isActive(r.status)).length,
      cotizacionesPendientes: quoteRows.length,
      productosActivos: products,
    },
    catering: {
      ingresoMes: monthSum(cateringRows),
      ingresoMesAnterior: prevMonthSum(cateringRows),
      pedidosActivos: cateringRows.filter((r) => isActive(r.status)).length,
      cotizacionesPendientes: quoteRows.length,
    },
    pharma: {
      ingresoMes: monthSum(pharmaRows),
      ingresoMesAnterior: prevMonthSum(pharmaRows),
      pedidosActivos: pharmaRows.filter((r) => isActive(r.status)).length,
    },
    liofilizados: {
      ingresoMes: monthSum(lioRows),
      ingresoMesAnterior: prevMonthSum(lioRows),
      pedidosActivos: lioRows.filter((r) => isActive(r.status)).length,
    },
  };

  // ── Conteos por línea para el card "Por división" ───────────
  const lineCounts = {
    catering: cateringRows.length,
    pharma: pharmaRows.length,
    liofilizados: lioRows.length,
  };

  // ── Conteos por estado para filtros ─────────────────────────
  const statusCounts: Record<string, number> = {};
  for (const r of rows) {
    statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;
  }

  // ── Estado de la pasarela Bold (basado en env presence) ─────
  const paymentConfig = {
    boldConfigured: Boolean(process.env.NEXT_PUBLIC_BOLD_API_KEY),
    webhookSecretConfigured: Boolean(process.env.BOLD_WEBHOOK_SECRET),
  };

  return NextResponse.json({
    rows,
    kpis,
    lineCounts,
    statusCounts,
    paymentConfig,
    generatedAt: now.toISOString(),
  });
}

function initialsOf(firstName: string, lastName: string): string {
  return (
    (firstName.trim().charAt(0) + lastName.trim().charAt(0)).toUpperCase() ||
    "—"
  );
}
