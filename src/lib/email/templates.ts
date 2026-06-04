/**
 * Plantillas de email transaccional.
 *
 * Todas devuelven `{ subject, text, html }` y se mandan via `sendEmail`.
 * Las versiones HTML se construyen con `buildEditorialEmail()` para
 * mantener voz visual coherente con el sitio (serif Georgia fallback,
 * paleta ink/cream con accent por línea de negocio).
 */
import { sendEmail } from "./send";
import { buildEditorialEmail, type EmailAccent } from "./editorial-html";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const COP = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

// ════════════════════════════════════════════════════════════════
// Activación de cuenta guest (después del primer pago)
// ════════════════════════════════════════════════════════════════

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
    `  · Recibir notificaciones de entrega\n\n` +
    `Si no fuiste tú quien hizo este pedido, ignora este correo.\n\n` +
    `— Reina Verde\n`;

  const html = buildEditorialEmail({
    accent: "marigold",
    preheader: "Pago recibido",
    hiddenPreview: `Activa tu cuenta · ${args.orderNumber ?? "Reina Verde"}`,
    headline: `Hola ${args.firstName}, su cuenta ya existe`,
    kicker: args.orderNumber
      ? `Recibimos su pago para el pedido ${args.orderNumber}. Antes de seguir, defina la contraseña que usará para futuros pedidos.`
      : `Recibimos su pago. Antes de seguir, defina la contraseña que usará para futuros pedidos.`,
    sections: [
      {
        eyebrow: "Activación",
        title: "Defina su contraseña",
        body: `Creamos una cuenta para usted con el correo ${args.email}. El enlace de activación es válido por 7 días.`,
        cta: { label: "Activar mi cuenta", href: url },
      },
      {
        eyebrow: "Qué podrá hacer",
        body: [
          "Ver el estado de este pedido y los siguientes.",
          "Repetir pedidos sin volver a llenar el carrito.",
          "Recibir notificaciones de despacho y entrega.",
        ],
      },
    ],
    footerSignature: "— Equipo Reina Verde",
    footerNote: "Si no fue usted quien realizó este pedido, ignore este correo.",
  });

  return sendEmail({ to: args.email, subject, text, html });
}

// ════════════════════════════════════════════════════════════════
// Pago confirmado · genérico (usuario ya con cuenta)
// ════════════════════════════════════════════════════════════════

export async function sendOrderPaidEmail(args: {
  email: string;
  firstName: string;
  orderNumber: string;
  total: number;
}) {
  const subject = `✓ Pago confirmado · Pedido ${args.orderNumber}`;
  const text =
    `Hola ${args.firstName},\n\n` +
    `Recibimos tu pago para el pedido ${args.orderNumber}.\n\n` +
    `Total: ${COP(args.total)}\n\n` +
    `Puedes seguir el estado en tu panel: ${BASE_URL}/cliente\n\n` +
    `— Reina Verde\n`;

  const html = buildEditorialEmail({
    accent: "marigold",
    preheader: "Pago confirmado",
    hiddenPreview: `Pedido ${args.orderNumber} · ${COP(args.total)}`,
    headline: `Hola ${args.firstName}, recibimos su pago`,
    kicker: `Su pedido ${args.orderNumber} quedó confirmado por Bold. Total ${COP(args.total)}.`,
    sections: [
      {
        eyebrow: "Resumen",
        body: `Pedido ${args.orderNumber} · Total ${COP(args.total)}`,
        cta: { label: "Ver detalle en mi panel", href: `${BASE_URL}/cliente` },
      },
    ],
    footerSignature: "— Equipo Reina Verde",
    footerNote: "El comprobante Bold también llega a su correo por separado.",
  });

  return sendEmail({ to: args.email, subject, text, html });
}

// ════════════════════════════════════════════════════════════════
// Catering · Cotización pagada
// ════════════════════════════════════════════════════════════════

export async function sendCateringQuotePaidEmail(args: {
  email: string;
  firstName: string;
  quoteNumber: string;
  quoteId: string;
  total: number;
  eventDate: Date;
  eventCity: string;
  guestCount: number;
}) {
  const dateLabel = new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(args.eventDate);

  const subject = `Su mesa, en marcha · Cotización ${args.quoteNumber}`;
  const text =
    `Hola ${args.firstName},\n\n` +
    `Reservamos su fecha. La cocina abre.\n\n` +
    `Su evento: ${args.eventCity} · ${dateLabel} · ${args.guestCount} comensales.\n` +
    `Total ${COP(args.total)}.\n\n` +
    `Próximas estaciones operativas:\n` +
    `  · T−72 h · Compras a productores orgánicos certificados\n` +
    `  · T−24 h · Mise en place. El chef ejecutivo asigna brigada\n` +
    `  · T−2 h  · Montaje silencioso en su sede\n` +
    `  · T−0    · Servicio coreografiado\n\n` +
    `Cotización formal (PDF): ${BASE_URL}/api/catering/quotes/${args.quoteId}/pdf\n` +
    `Lista de compras del evento: ${BASE_URL}/api/catering/quotes/${args.quoteId}/shopping-list/pdf\n` +
    `Pantalla de confirmación: ${BASE_URL}/catering/cotizar/confirmacion?quote=${args.quoteId}\n\n` +
    `— Equipo Reina Verde\n` +
    `Cocina · Logística · Servicio\n`;

  const html = buildEditorialEmail({
    accent: "marigold",
    preheader: "Compromiso recibido",
    hiddenPreview: `${args.eventCity} · ${dateLabel} · ${args.guestCount} comensales · ${COP(args.total)}`,
    headline: `Hola ${args.firstName}, su mesa está en marcha`,
    kicker: `Reservamos su fecha. La cocina abre. A partir de ahora, su evento es la prioridad operativa de Reina Verde — no un pedido más en la cola.`,
    sections: [
      {
        eyebrow: "Su evento",
        title: `${args.eventCity} · ${dateLabel}`,
        body: [
          `${args.guestCount} comensales.`,
          `Cotización ${args.quoteNumber} · Total ${COP(args.total)}.`,
        ],
      },
      {
        eyebrow: "Próximas estaciones",
        title: "De aquí al evento",
        body: [
          "T−72 h · Compras. Cierre de proveedores orgánicos certificados.",
          "T−24 h · Mise en place. El chef ejecutivo asigna brigada.",
          "T−2 h · Montaje silencioso en su sede con estética del diseño.",
          "T−0 · Servicio coreografiado. Feedback formal 48 h después.",
        ],
      },
      {
        eyebrow: "Documentos",
        title: "Para sus archivos",
        body: "Tres documentos imprimibles o descargables para que su equipo y su contador tengan visibilidad total.",
        cta: {
          label: "Cotización (PDF)",
          href: `${BASE_URL}/api/catering/quotes/${args.quoteId}/pdf`,
        },
      },
      {
        body: "También puede consultar la lista de insumos que se comprarán específicamente para su evento — útil si tiene comensales con restricciones particulares.",
        cta: {
          label: "Lista de compras (PDF)",
          href: `${BASE_URL}/api/catering/quotes/${args.quoteId}/shopping-list/pdf`,
        },
      },
      {
        eyebrow: "Cambios de último momento",
        body: [
          "Si necesita ajustar el menú, el número de comensales o la dirección de entrega, escríbanos directamente a reinaverdecatering@gmail.com o llame al (+57) 314 790 5135.",
          "Confirmación final del menú y horarios llega 24 h antes del evento.",
        ],
      },
    ],
    footerSignature: "— Equipo Reina Verde · Cocina · Logística · Servicio",
    footerNote: "El comprobante Bold también llega a su correo por separado.",
  });

  return sendEmail({ to: args.email, subject, text, html });
}

// ════════════════════════════════════════════════════════════════
// Shop order pagada (pharma / liofilizados)
// ════════════════════════════════════════════════════════════════

interface ShopOrderEmailArgs {
  email: string;
  firstName: string;
  orderNumber: string;
  orderId: string;
  total: number;
  businessLine: "PHARMA" | "LIOFILIZADOS" | "CATERING";
}

export async function sendShopOrderPaidEmail(args: ShopOrderEmailArgs) {
  const isPharma = args.businessLine === "PHARMA";
  const accent: EmailAccent = isPharma ? "iris" : "persimmon";

  const subject = isPharma
    ? `Su bienestar va en camino · Pedido ${args.orderNumber}`
    : `El campo, en su mejor momento · Pedido ${args.orderNumber}`;

  const lineLabel = isPharma ? "Pharma" : "Liofilizados";
  const confirmationPath = isPharma ? "/pharma/confirmacion" : "/liofilizados/confirmacion";

  const headline = isPharma
    ? `Hola ${args.firstName}, su bienestar va en camino`
    : `Hola ${args.firstName}, el campo va en camino`;

  const kicker = isPharma
    ? "Empacamos sin marca exterior. Despachamos con tracking transparente. La caja llega a su dirección sin que nadie más sepa qué hay adentro."
    : "Cosechado en el pico de madurez. Liofilizado al instante. Sellado al vacío. Cuando abra el sobre encontrará el sabor exacto del campo del día de cosecha.";

  const pillars = isPharma
    ? [
        "Discreción — empaque kraft sin logos exteriores ni indicación del contenido.",
        "Certificación — cada producto trae certificado de análisis, lote rastreable y vencimiento legible.",
        "Trazabilidad — número de guía en menos de 24 h, tracking 24/7.",
      ]
    : [
        "Cosecha — productores certificados del eje cafetero, Cundinamarca y Boyacá.",
        "Liofilizado — cámara propia a −40 °C, 98 % de nutrientes conservados.",
        "Hermético — gas inerte. Vida útil 24 meses sin perder propiedades.",
      ];

  const text =
    `Hola ${args.firstName},\n\n` +
    (isPharma
      ? `Recibimos su pedido ${args.orderNumber}.\n\n`
      : `Recibimos su pedido ${args.orderNumber}.\n\n`) +
    `Total ${COP(args.total)}.\n\n` +
    `Nuestro compromiso para este pedido:\n` +
    pillars.map((p) => `  · ${p}`).join("\n") +
    `\n\nPróximas estaciones:\n` +
    `  · HOY · Preparación en bodega con QA propio\n` +
    `  · 24 h · Despacho con transportadora · recibe guía por email\n` +
    `  · 2–5 días · Tránsito nacional\n` +
    `  · Entrega · Firma de recibido en su puerta\n\n` +
    `Pantalla de seguimiento: ${BASE_URL}${confirmationPath}?order=${args.orderId}\n\n` +
    `— Equipo Reina Verde ${lineLabel}\n`;

  const html = buildEditorialEmail({
    accent,
    preheader: "Pedido recibido",
    hiddenPreview: `${lineLabel} · ${args.orderNumber} · ${COP(args.total)}`,
    headline,
    kicker,
    sections: [
      {
        eyebrow: "Su pedido",
        title: `Ref. ${args.orderNumber}`,
        body: `Total ${COP(args.total)}.`,
      },
      {
        eyebrow: "Próximas estaciones",
        title: "De la bodega a su puerta",
        body: [
          "HOY · Preparación con doble verificación de lote.",
          "24 h · Despacho con transportadora. Recibe guía por correo.",
          "2–5 días · Tránsito nacional según ciudad.",
          "Entrega · Firma de recibido en su puerta.",
        ],
      },
      {
        eyebrow: "Nuestro compromiso",
        title: "Tres principios",
        body: pillars,
        cta: {
          label: "Ver pantalla de seguimiento",
          href: `${BASE_URL}${confirmationPath}?order=${args.orderId}`,
        },
      },
    ],
    footerSignature: `— Equipo Reina Verde ${lineLabel}`,
    footerNote: isPharma
      ? "Calidad · Discreción · Trazabilidad"
      : "Cosecha · Liofilización · Hermético",
  });

  return sendEmail({ to: args.email, subject, text, html });
}
