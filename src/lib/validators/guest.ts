/**
 * Schema único de Guest checkout — compartido entre catering, pharma y liofilizados.
 *
 * Hoy estaba duplicado en /api/shop-orders/route.ts y /api/catering/quotes/route.ts.
 * Centralizarlo evita drift y permite cambiar reglas (ej. teléfono obligatorio
 * o no) en un solo lugar.
 */
import { z } from "zod";

/** Versión base — phone opcional. La usa catering y la nueva versión de pharma/lio. */
export const guestSchema = z.object({
  email: z.string().email().max(120),
  firstName: z.string().min(1).max(60),
  lastName: z.string().min(1).max(60),
  phone: z.string().min(7).max(20).optional(),
});

export type GuestPayload = z.infer<typeof guestSchema>;

/** Versión estricta — phone obligatorio. Aún no se usa, queda para flujos que lo necesiten. */
export const guestSchemaWithPhone = guestSchema.extend({
  phone: z.string().min(7).max(20),
});
