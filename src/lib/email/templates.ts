/**
 * Plantillas de email transaccional.
 *
 * Todas devuelven `{ subject, text, html? }` y se mandan via `sendEmail`.
 */
import { sendEmail } from "./send";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

/**
 * Email enviado tras pago confirmado de un usuario guest.
 * Incluye un link "Activa tu cuenta" que pone una contraseña.
 */
export async function sendGuestActivationEmail(args: {
  email: string;
  firstName: string;
  rawToken: string;
  orderNumber?: string;
}) {
  const url = `${BASE_URL}/restablecer?token=${args.rawToken}&activate=1`;

  const subject = "✓ Pago confirmado · Activa tu cuenta Reina Verde";

  const text =
    `Hola ${args.firstName},\n\n` +
    (args.orderNumber
      ? `Recibimos tu pago para el pedido ${args.orderNumber}. ¡Gracias!\n\n`
      : `Recibimos tu pago. ¡Gracias!\n\n`) +
    `Creamos una cuenta para ti con el correo que usaste. Para activarla y ` +
    `consultar el estado de tu pedido, define una contraseña en este enlace ` +
    `(válido por 7 días):\n\n` +
    `${url}\n\n` +
    `Con tu cuenta podrás:\n` +
    `  · Ver el estado de este pedido y los siguientes\n` +
    `  · Repetir pedidos con un clic\n` +
    `  · Recibir notificaciones de entrega\n` +
    `  · Dejar feedback al recibir tu compra\n\n` +
    `Si no fuiste tú quien hizo este pedido, ignora este correo.\n\n` +
    `— Reina Verde\n`;

  return sendEmail({
    to: args.email,
    subject,
    text,
  });
}

/**
 * Email de confirmación cuando un usuario que YA tenía cuenta paga una orden.
 * No incluye link de activación, solo el resumen del pedido.
 */
export async function sendOrderPaidEmail(args: {
  email: string;
  firstName: string;
  orderNumber: string;
  total: number;
}) {
  const subject = `✓ Pago confirmado · Pedido ${args.orderNumber}`;
  const total = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(args.total);

  const text =
    `Hola ${args.firstName},\n\n` +
    `Recibimos tu pago para el pedido ${args.orderNumber}.\n\n` +
    `Total: ${total}\n\n` +
    `Puedes seguir el estado en tu panel: ${BASE_URL}/cliente\n\n` +
    `— Reina Verde\n`;

  return sendEmail({
    to: args.email,
    subject,
    text,
  });
}
