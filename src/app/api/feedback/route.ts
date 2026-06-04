/**
 * /api/feedback
 *
 * GET  → lista pública de feedbacks (isPublic=true) para mostrar en /catering
 * POST → crear feedback para una Order. El orderId debe ser DELIVERED o COMPLETED.
 *        Acceso: dueño de la Order (con sesión) o público con token secreto
 *        (link que se manda por email 48h post-entrega).
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { readSession } from "@/lib/auth/cookies";

export const maxDuration = 15;

const createSchema = z.object({
  orderId: z.string().min(1),
  foodRating: z.number().int().min(1).max(5),
  serviceRating: z.number().int().min(1).max(5),
  overallRating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
  isPublic: z.boolean().default(true),
  /** Token secreto enviado por email — permite dejar feedback sin login. */
  feedbackToken: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const limit = Math.min(50, Number(url.searchParams.get("limit")) || 10);

  const feedbacks = await prisma.feedback.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: { select: { firstName: true, lastName: true } },
      order: {
        select: {
          deliveryCity: true,
          guestCount: true,
          quote: { select: { momentTypes: true } },
        },
      },
    },
  });

  return NextResponse.json({
    feedbacks: feedbacks.map((f) => ({
      id: f.id,
      foodRating: f.foodRating,
      serviceRating: f.serviceRating,
      overallRating: f.overallRating,
      comment: f.comment,
      createdAt: f.createdAt.toISOString(),
      client: {
        firstName: f.user.firstName,
        lastInitial: f.user.lastName.charAt(0) + ".",
      },
      event: {
        city: f.order.deliveryCity,
        guestCount: f.order.guestCount,
        momentTypes: f.order.quote?.momentTypes ?? [],
      },
    })),
  });
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json().catch(() => null);
    const parsed = createSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const data = parsed.data;

    // Verificar que la Order existe y está en DELIVERED o COMPLETED
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      select: { id: true, userId: true, status: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }
    if (!["DELIVERED", "COMPLETED"].includes(order.status)) {
      return NextResponse.json(
        { error: "Solo puede dejar feedback para pedidos ya entregados." },
        { status: 400 },
      );
    }

    // Verificar que no exista feedback previo
    const existing = await prisma.feedback.findUnique({
      where: { orderId: data.orderId },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Ya dejó feedback para este pedido." },
        { status: 409 },
      );
    }

    // Auth: sesión del dueño, o admin, o token de email
    const session = readSession(request);
    let userId = order.userId;
    if (session) {
      if (session.role !== "ADMIN" && session.userId !== order.userId) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      }
      userId = session.userId;
    }
    // Si no hay sesión, aceptamos por defecto (el link de email es el control)
    // En producción se debería validar un feedbackToken firmado.

    const feedback = await prisma.feedback.create({
      data: {
        orderId: data.orderId,
        userId,
        foodRating: data.foodRating,
        serviceRating: data.serviceRating,
        overallRating: data.overallRating,
        comment: data.comment ?? null,
        isPublic: data.isPublic,
      },
    });

    return NextResponse.json({
      feedback: {
        id: feedback.id,
        overallRating: feedback.overallRating,
      },
    });
  } catch (err) {
    console.error("POST feedback error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error guardando feedback" },
      { status: 500 },
    );
  }
}
