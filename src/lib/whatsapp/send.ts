/**
 * WhatsApp Business Cloud API helper.
 *
 * Usa la API de Meta (WhatsApp Business Platform → Cloud API) para enviar
 * mensajes de texto al chef y al cliente cuando se recibe un pago.
 *
 * Env vars requeridas:
 *   - WHATSAPP_TOKEN: token de acceso permanente de la app Meta
 *   - WHATSAPP_PHONE_ID: ID del número de teléfono WhatsApp Business
 *
 * Si no están configuradas, los mensajes se loggean a stdout (igual que email).
 *
 * Doc: https://developers.facebook.com/docs/whatsapp/cloud-api/messages/text-messages
 *
 * NOTA sobre templates vs texto libre:
 * WhatsApp Business Cloud requiere que el primer mensaje a un número use
 * un "Message Template" pre-aprobado por Meta. Para MVP usamos texto libre
 * que funciona dentro de la ventana de 24h de conversación iniciada por
 * el usuario (o cuando el número del destinatario ya ha interactuado antes).
 * En producción real, crear templates aprobados por Meta y usar
 * sendWhatsAppTemplate() en vez de sendWhatsAppText().
 */

const WA_API = "https://graph.facebook.com/v21.0";

function log(event: string, fields: Record<string, unknown>) {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ event, ts: new Date().toISOString(), ...fields }));
}

export interface WhatsAppResult {
  ok: boolean;
  provider: "whatsapp-cloud" | "log";
  messageId?: string;
}

/**
 * Envía un mensaje de texto libre por WhatsApp.
 *
 * @param to - Número completo con código de país (ej: "573147905135")
 * @param body - Texto del mensaje (máx 4096 chars)
 */
export async function sendWhatsAppText(
  to: string,
  body: string,
): Promise<WhatsAppResult> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  // Normalizar número: quitar +, espacios, paréntesis
  const cleanTo = to.replace(/[^0-9]/g, "");

  if (!token || !phoneId) {
    log("whatsapp.logged", { to: cleanTo, body: body.slice(0, 200) });
    return { ok: true, provider: "log" };
  }

  try {
    const res = await fetch(`${WA_API}/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanTo,
        type: "text",
        text: { preview_url: false, body },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      log("whatsapp.send-failed", { to: cleanTo, status: res.status, err });
      return { ok: false, provider: "whatsapp-cloud" };
    }

    const data = await res.json();
    const messageId = data?.messages?.[0]?.id;
    log("whatsapp.sent", { to: cleanTo, messageId });
    return { ok: true, provider: "whatsapp-cloud", messageId };
  } catch (err) {
    log("whatsapp.error", {
      to: cleanTo,
      error: err instanceof Error ? err.message : String(err),
    });
    return { ok: false, provider: "whatsapp-cloud" };
  }
}

// ════════════════════════════════════════════════════════════════
// Mensajes prediseñados para cada evento de negocio
// ════════════════════════════════════════════════════════════════

const COP = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(n);

/**
 * Notifica al chef que entró un pedido de catering.
 */
export async function notifyChefNewCateringOrder(args: {
  chefPhone: string;
  orderNumber: string;
  clientName: string;
  eventCity: string;
  eventDate: string;
  guestCount: number;
  total: number;
}): Promise<WhatsAppResult> {
  const body =
    `🍴 *Nuevo pedido catering*\n\n` +
    `Pedido: ${args.orderNumber}\n` +
    `Cliente: ${args.clientName}\n` +
    `Evento: ${args.eventCity} · ${args.eventDate}\n` +
    `Comensales: ${args.guestCount}\n` +
    `Total: ${COP(args.total)}\n\n` +
    `Abrir: ${process.env.NEXT_PUBLIC_BASE_URL || "https://reinaverde.vercel.app"}/admin/pedidos/${args.orderNumber}\n\n` +
    `— Reina Verde · Cocina`;

  return sendWhatsAppText(args.chefPhone, body);
}

/**
 * Confirma al cliente por WhatsApp que su pago fue recibido.
 */
export async function notifyClientPaymentReceived(args: {
  clientPhone: string;
  clientName: string;
  orderNumber: string;
  total: number;
  eventCity?: string;
  eventDate?: string;
}): Promise<WhatsAppResult> {
  const eventLine = args.eventCity && args.eventDate
    ? `\nEvento: ${args.eventCity} · ${args.eventDate}\n`
    : "\n";

  const body =
    `✅ *Pago confirmado*\n\n` +
    `Hola ${args.clientName},\n` +
    `Recibimos su pago para el pedido ${args.orderNumber}.\n` +
    `Total: ${COP(args.total)}\n` +
    eventLine +
    `Su mesa está en marcha. Recibirá confirmación de menú 24h antes del evento.\n\n` +
    `— Reina Verde`;

  return sendWhatsAppText(args.clientPhone, body);
}

/**
 * Notifica al chef que el admin marcó un pedido como DELIVERED.
 */
export async function notifyChefOrderDelivered(args: {
  chefPhone: string;
  orderNumber: string;
  clientName: string;
}): Promise<WhatsAppResult> {
  const body =
    `📦 *Pedido entregado*\n\n` +
    `${args.orderNumber} → ${args.clientName}\n` +
    `Estado: DELIVERED\n\n` +
    `Email de feedback al cliente se envió automáticamente.\n\n` +
    `— Reina Verde · Operaciones`;

  return sendWhatsAppText(args.chefPhone, body);
}
