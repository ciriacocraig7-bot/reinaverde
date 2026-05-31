/**
 * Guest checkout: get-or-create un usuario "invitado" para una orden hecha sin
 * sesión activa.
 *
 * Diseño:
 * ─ Si el email ya existe como usuario activo → devolvemos ese user. La orden
 *   queda asociada y aparecerá en su panel cuando inicie sesión.
 * ─ Si el email existe como guest pendiente (passwordHash vacío) → reutilizamos.
 * ─ Si el email no existe → creamos un user nuevo con `passwordHash=""` y
 *   `isActive=false`. Al confirmar el pago (webhook), lo activamos y le
 *   enviamos el email para que set una contraseña.
 *
 * Devolvemos también `wasCreated` y `isPending` para que el webhook sepa si
 * debe disparar el email de activación.
 */
import { prisma } from "@/lib/db/prisma";

export interface GuestData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface GuestUserResult {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  /** true si acabamos de crear el user en esta llamada */
  wasCreated: boolean;
  /** true si el user aún no tiene contraseña (no puede login todavía) */
  isPending: boolean;
}

export async function findOrCreateGuestUser(input: GuestData): Promise<GuestUserResult> {
  const email = input.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const isPending = !existing.passwordHash || existing.passwordHash.length === 0;
    return {
      userId: existing.id,
      email: existing.email,
      firstName: existing.firstName,
      lastName: existing.lastName,
      wasCreated: false,
      isPending,
    };
  }

  const created = await prisma.user.create({
    data: {
      email,
      passwordHash: "", // se llenará cuando active la cuenta
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone?.trim() || null,
      role: "CLIENTE",
      isActive: false, // se activa cuando pague
      emailVerified: false,
    },
  });

  return {
    userId: created.id,
    email: created.email,
    firstName: created.firstName,
    lastName: created.lastName,
    wasCreated: true,
    isPending: true,
  };
}

/**
 * Marca a un guest user como activo después de un pago confirmado y devuelve
 * un token de activación (single-use) que va por email.
 *
 * Si el usuario ya estaba activo (no era guest), no hace nada y devuelve null.
 */
export async function activateGuestUserAfterPayment(userId: string): Promise<{
  email: string;
  firstName: string;
  rawToken: string;
} | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  // Solo activamos si era un guest pendiente.
  const wasPending = !user.passwordHash || user.passwordHash.length === 0;
  if (!wasPending) return null;

  // Mark active.
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: true },
  });

  // Generar token de activación (mismo modelo que reset password).
  const { randomBytes, createHash } = await import("node:crypto");
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60_000); // 7 días para activar

  // Invalidar tokens previos.
  await prisma.passwordResetToken.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });

  await prisma.passwordResetToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return {
    email: user.email,
    firstName: user.firstName,
    rawToken,
  };
}
