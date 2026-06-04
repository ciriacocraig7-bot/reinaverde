/**
 * /api/admin/pedidos/[id]
 *
 * GET   → detalle unificado (same shape que /api/cliente/pedidos/[id])
 * PATCH → cambiar estado del pedido
 *
 * Acceso: ADMIN.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRoles } from "@/lib/auth/require-role";
import { OrderStatus, ShopOrderStatus } from "@/generated/prisma/enums";

export const maxDuration = 15;

const patchSchema = z.object({
  status: z.string().min(1),
  notes: z.string().max(2000).optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = requireRoles(request, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;
  const { id } = await context.params;

  const raw = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { status, notes } = parsed.data;

  // Intentar como Order (catering)
  if ((Object.values(OrderStatus) as string[]).includes(status)) {
    try {
      const updated = await prisma.order.update({
        where: { id },
        data: {
          status: status as typeof OrderStatus[keyof typeof OrderStatus],
          ...(notes ? { notes } : {}),
        },
        select: { id: true, orderNumber: true, status: true },
      });
      return NextResponse.json({ ok: true, kind: "catering-order", ...updated });
    } catch (err) {
      if ((err as { code?: string }).code === "P2025") {
        // No era Order — intentar ShopOrder
      } else throw err;
    }
  }

  // Intentar como ShopOrder
  if ((Object.values(ShopOrderStatus) as string[]).includes(status)) {
    try {
      const data: Record<string, unknown> = {
        status: status as typeof ShopOrderStatus[keyof typeof ShopOrderStatus],
      };
      if (notes) data.shippingNotes = notes;
      if (status === "SHIPPED") data.shippedAt = new Date();
      if (status === "DELIVERED") data.deliveredAt = new Date();
      const updated = await prisma.shopOrder.update({
        where: { id },
        data,
        select: { id: true, orderNumber: true, status: true },
      });
      return NextResponse.json({ ok: true, kind: "shop-order", ...updated });
    } catch (err) {
      if ((err as { code?: string }).code === "P2025") {
        // No era ShopOrder
      } else throw err;
    }
  }

  return NextResponse.json(
    { error: "Pedido no encontrado o estado inválido para este tipo de pedido." },
    { status: 404 },
  );
}
