/**
 * GET /api/cliente/pedidos/[id]
 *
 * Endpoint unificado que busca el ID en tres tablas:
 *   1. Order (catering) — incluye Quote si existe
 *   2. ShopOrder (pharma / liofilizados)
 *   3. Quote (si todavía no se convirtió en Order)
 *
 * Devuelve un shape normalizado con items, timeline, y metadata del evento.
 * Solo el dueño (userId match) o ADMIN puede verlo.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { readSession } from "@/lib/auth/cookies";

export const maxDuration = 15;

const COP = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);

interface TimelineStep {
  label: string;
  status: "done" | "current" | "pending";
  date?: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = readSession(request);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await context.params;
  const isAdmin = session.role === "ADMIN" || session.role === "FINANZAS";

  // ── 1. Intentar como Order (catering) ────────────────────────
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { menuItem: { select: { name: true, image: true } } } },
      quote: {
        select: {
          id: true,
          quoteNumber: true,
          eventCity: true,
          eventAddress: true,
          eventDate: true,
          eventTime: true,
          guestCount: true,
          momentTypes: true,
          total: true,
        },
      },
      user: { select: { firstName: true, lastName: true, email: true } },
      payments: { select: { status: true, paidAt: true, provider: true } },
    },
  });

  if (order) {
    if (!isAdmin && order.userId !== session.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const timeline = buildCateringTimeline(order.status, order.createdAt, order.payments[0]?.paidAt ?? null);

    return NextResponse.json({
      kind: "catering-order",
      id: order.id,
      reference: order.orderNumber,
      status: order.status,
      total: Number(order.total),
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      discount: Number(order.discount),
      createdAt: order.createdAt.toISOString(),
      client: {
        name: `${order.user.firstName} ${order.user.lastName}`,
        email: order.user.email,
      },
      event: order.quote
        ? {
            quoteNumber: order.quote.quoteNumber,
            quoteId: order.quote.id,
            city: order.quote.eventCity,
            address: order.quote.eventAddress,
            date: order.quote.eventDate.toISOString(),
            time: order.quote.eventTime,
            guestCount: order.quote.guestCount,
            momentTypes: order.quote.momentTypes,
          }
        : {
            city: order.deliveryCity,
            address: order.deliveryAddress,
            date: order.deliveryDate.toISOString(),
            time: order.deliveryTime,
            guestCount: order.guestCount,
          },
      items: order.items.map((it) => ({
        name: it.menuItem.name,
        image: it.menuItem.image,
        quantity: it.quantity,
        unitPrice: Number(it.unitPrice),
        totalPrice: Number(it.totalPrice),
        notes: it.customNotes,
      })),
      timeline,
      notes: order.notes,
      dietaryNotes: order.dietaryNotes,
      businessLine: "CATERING" as const,
      pdfUrl: order.quote ? `/api/catering/quotes/${order.quote.id}/pdf` : null,
      shoppingListUrl: order.quote
        ? `/api/catering/quotes/${order.quote.id}/shopping-list/pdf`
        : null,
    });
  }

  // ── 2. Intentar como ShopOrder (pharma / liofilizados) ──────
  const shopOrder = await prisma.shopOrder.findUnique({
    where: { id },
    include: {
      items: { include: { product: { select: { name: true, image: true, slug: true } } } },
      user: { select: { firstName: true, lastName: true, email: true } },
    },
  });

  if (shopOrder) {
    if (!isAdmin && shopOrder.userId !== session.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const timeline = buildShopTimeline(shopOrder.status, shopOrder.createdAt, shopOrder.paidAt, shopOrder.shippedAt, shopOrder.deliveredAt);

    return NextResponse.json({
      kind: "shop-order",
      id: shopOrder.id,
      reference: shopOrder.orderNumber,
      status: shopOrder.status,
      total: Number(shopOrder.total),
      subtotal: Number(shopOrder.subtotal),
      tax: Number(shopOrder.tax),
      shipping: Number(shopOrder.shipping),
      discount: Number(shopOrder.discount),
      createdAt: shopOrder.createdAt.toISOString(),
      client: {
        name: `${shopOrder.user.firstName} ${shopOrder.user.lastName}`,
        email: shopOrder.user.email,
      },
      shippingInfo: {
        name: shopOrder.shippingName,
        address: shopOrder.shippingAddress,
        city: shopOrder.shippingCity,
        phone: shopOrder.shippingPhone,
        notes: shopOrder.shippingNotes,
        trackingNumber: shopOrder.trackingNumber,
      },
      items: shopOrder.items.map((it) => ({
        name: it.product.name,
        image: it.product.image,
        slug: it.product.slug,
        quantity: it.quantity,
        unitPrice: Number(it.unitPrice),
        totalPrice: Number(it.totalPrice),
      })),
      timeline,
      businessLine: shopOrder.businessLine,
      pdfUrl: null,
      shoppingListUrl: null,
    });
  }

  // ── 3. Intentar como Quote (pendiente, no convertida) ───────
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
    },
  });

  if (quote) {
    if (!isAdmin && quote.userId !== session.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    return NextResponse.json({
      kind: "quote",
      id: quote.id,
      reference: quote.quoteNumber,
      status: quote.status,
      total: Number(quote.total),
      createdAt: quote.createdAt.toISOString(),
      expiresAt: quote.expiresAt.toISOString(),
      client: {
        name: `${quote.user.firstName} ${quote.user.lastName}`,
        email: quote.user.email,
      },
      event: {
        quoteNumber: quote.quoteNumber,
        quoteId: quote.id,
        city: quote.eventCity,
        address: quote.eventAddress,
        date: quote.eventDate.toISOString(),
        time: quote.eventTime,
        guestCount: quote.guestCount,
        momentTypes: quote.momentTypes,
      },
      items: [],
      timeline: [
        { label: "Cotización creada", status: "done" as const, date: quote.createdAt.toISOString() },
        { label: "Pendiente de pago", status: quote.status === "PAID" ? "done" as const : "current" as const },
      ],
      businessLine: "CATERING" as const,
      pdfUrl: `/api/catering/quotes/${quote.id}/pdf`,
      shoppingListUrl: `/api/catering/quotes/${quote.id}/shopping-list/pdf`,
    });
  }

  return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
}

// ── Builders de timeline ──────────────────────────────────────

const CATERING_STAGES = [
  "Orden recibida",
  "Pago confirmado",
  "En producción",
  "Listo",
  "En camino",
  "Entregado",
  "Completado",
];

const CATERING_STATUS_STAGE: Record<string, number> = {
  DRAFT: 0,
  QUOTED: 0,
  PAYMENT_PENDING: 0,
  PAID: 1,
  IN_PRODUCTION: 2,
  READY: 3,
  IN_TRANSIT: 4,
  DELIVERED: 5,
  COMPLETED: 6,
  CANCELLED: -1,
};

function buildCateringTimeline(
  status: string,
  createdAt: Date,
  paidAt: Date | null,
): TimelineStep[] {
  const current = CATERING_STATUS_STAGE[status] ?? 0;
  if (current === -1) {
    return [
      { label: "Orden recibida", status: "done", date: createdAt.toISOString() },
      { label: "Cancelado", status: "current" },
    ];
  }
  return CATERING_STAGES.map((label, i) => ({
    label,
    status: i < current ? ("done" as const) : i === current ? ("current" as const) : ("pending" as const),
    ...(i === 0 ? { date: createdAt.toISOString() } : {}),
    ...(i === 1 && paidAt ? { date: paidAt.toISOString() } : {}),
  }));
}

const SHOP_STAGES = [
  "Pedido recibido",
  "Pago confirmado",
  "Preparando",
  "Despachado",
  "Entregado",
];

const SHOP_STATUS_STAGE: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PAID: 1,
  PROCESSING: 2,
  SHIPPED: 3,
  DELIVERED: 4,
  COMPLETED: 4,
  CANCELLED: -1,
  REFUNDED: -1,
};

function buildShopTimeline(
  status: string,
  createdAt: Date,
  paidAt: Date | null,
  shippedAt: Date | null,
  deliveredAt: Date | null,
): TimelineStep[] {
  const current = SHOP_STATUS_STAGE[status] ?? 0;
  if (current === -1) {
    return [
      { label: "Pedido recibido", status: "done", date: createdAt.toISOString() },
      { label: status === "REFUNDED" ? "Reembolsado" : "Cancelado", status: "current" },
    ];
  }
  const dates = [createdAt, paidAt, null, shippedAt, deliveredAt];
  return SHOP_STAGES.map((label, i) => ({
    label,
    status: i < current ? ("done" as const) : i === current ? ("current" as const) : ("pending" as const),
    ...(dates[i] ? { date: dates[i]!.toISOString() } : {}),
  }));
}
