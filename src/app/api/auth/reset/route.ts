import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/passwords";
import { signToken } from "@/lib/auth/jwt";
import { buildSessionCookie } from "@/lib/auth/cookies";

const schema = z.object({
  token: z.string().min(32, "Token inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

/**
 * POST /api/auth/reset
 *
 * Validates the single-use token, sets the new password, marks the token as
 * used, and logs the user in (issues a session cookie). The hash comparison
 * is in code rather than via Prisma `where` to use a constant-time compare.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(parsed.data.token)
      .digest("hex");

    const reset = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (
      !reset ||
      reset.usedAt ||
      reset.expiresAt.getTime() < Date.now() ||
      !reset.user.isActive
    ) {
      return NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: reset.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: reset.id },
        data: { usedAt: new Date() },
      }),
      // Burn any other open tokens for the user so the link can't be reused.
      prisma.passwordResetToken.updateMany({
        where: { userId: reset.userId, usedAt: null, id: { not: reset.id } },
        data: { usedAt: new Date() },
      }),
    ]);

    const token = signToken({
      userId: reset.user.id,
      email: reset.user.email,
      role: reset.user.role,
    });

    const res = NextResponse.json({
      ok: true,
      user: {
        id: reset.user.id,
        email: reset.user.email,
        firstName: reset.user.firstName,
        lastName: reset.user.lastName,
        role: reset.user.role,
      },
      token,
    });
    res.headers.append("Set-Cookie", buildSessionCookie(token));
    return res;
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
