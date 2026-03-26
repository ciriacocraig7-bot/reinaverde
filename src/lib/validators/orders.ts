import { z } from "zod";

export const orderItemSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().int().min(1),
  customNotes: z.string().optional(),
});

export const createOrderSchema = z.object({
  companyId: z.string().uuid().optional(),
  eventId: z.string().uuid().optional(),
  items: z.array(orderItemSchema).min(1, "Debe agregar al menos un item"),
  guestCount: z.number().int().min(1, "Mínimo 1 invitado"),
  deliveryDate: z.string().min(1, "Fecha de entrega requerida"),
  deliveryTime: z.string().min(1, "Hora de entrega requerida"),
  deliveryAddress: z.string().min(5, "Dirección de entrega requerida"),
  deliveryCity: z.string().optional(),
  notes: z.string().optional(),
  dietaryNotes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "DRAFT", "QUOTED", "PAYMENT_PENDING", "PAID", "IN_PRODUCTION",
    "READY", "IN_TRANSIT", "DELIVERED", "COMPLETED", "CANCELLED", "REVIEWED",
  ]),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
