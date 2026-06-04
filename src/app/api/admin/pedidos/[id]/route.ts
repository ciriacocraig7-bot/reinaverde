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
import { sendFeedbackRequestEmail } from "@/lib/email/templates";
import { notifyChefOrderDelivered } from "@/lib/whatsapp/send";

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
        select: {
          id: true,
          orderNumber: true,
          status: true,
          userId: true,
          deliveryCity: true,
        },
      });

      // Si se marca como DELIVERED:
      //  1. Enviar email de feedback al cliente
      //  2. Notificar al chef por WhatsApp
      if (status === "DELIVERED") {
        const user = await prisma.user.findUnique({
          where: { id: updated.userId },
          select: { email: true, firstName: true, lastName: true },
        });
        if (user) {
          sendFeedbackRequestEmail({
            email: user.email,
            firstName: user.firstName,
            orderNumber: updated.orderNumber,
            orderId: updated.id,
            eventCity: updated.deliveryCity ?? undefined,
          }).catch((err) => {
            console.error("feedback email failed:", err);
          });

          const CHEF_PHONE = process.env.WHATSAPP_CHEF_PHONE || "573147905135";
          notifyChefOrderDelivered({
            chefPhone: CHEF_PHONE,
            orderNumber: updated.orderNumber,
            clientName: `${user.firstName} ${user.lastName}`.trim(),
          }).catch(() => {});
        }
      }

      return NextResponse.json({ ok: true, kind: "catering-order", id: updated.id, orderNumber: updated.orderNumber, status: updated.status });
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
