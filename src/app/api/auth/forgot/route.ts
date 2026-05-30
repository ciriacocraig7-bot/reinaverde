import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { sendEmail } from "@/lib/email/send";

const TOKEN_TTL_MIN = 30;
const schema = z.object({ email: z.string().email("Email inválido") });

/**
 * POST /api/auth/forgot
 *
 * Always returns 200 — we don't want to leak whether an email is registered.
 * On a valid hit we create a single-use token (SHA-256 hashed at rest) and
 * email a reset link.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: true, message: "Si el correo está registrado, recibirás instrucciones." },
        { status: 200 },
      );
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return NextResponse.json(
        { ok: true, message: "Si el correo está registrado, recibirás instrucciones." },
        { status: 200 },
      );
    }

    // Generate a 32-byte token and store only the hash.
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MIN * 60_000);

    // Invalidate previous outstanding tokens for this user.
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const resetUrl = `${base}/restablecer?token=${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "Recuperación de contraseña · Reina Verde",
      text:
        `Hola ${user.firstName},\n\n` +
        `Recibimos una solicitud para restablecer tu contraseña.\n\n` +
        `Abre este enlace en los próximos ${TOKEN_TTL_MIN} minutos:\n${resetUrl}\n\n` +
        `Si no fuiste tú, ignora este correo — tu contraseña actual sigue vigente.\n\n` +
        `— Reina Verde`,
    });

    return NextResponse.json(
      { ok: true, message: "Si el correo está registrado, recibirás instrucciones." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { ok: true, message: "Si el correo está registrado, recibirás instrucciones." },
      { status: 200 },
    );
  }
}
