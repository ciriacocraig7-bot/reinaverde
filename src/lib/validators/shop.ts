import { z } from "zod";

// ─── Products ───────────────────────────────────────────────
export const createProductSchema = z.object({
  businessLine: z.enum(["CANABICO", "LIOFILIZADOS"]),
  categoryId: z.string().uuid(),
  name: z.string().min(2, "Nombre requerido"),
  slug: z.string().min(2),
  description: z.string().optional(),
  shortDesc: z.string().optional(),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  icon: z.string().optional(),
  price: z.number().positive("Precio debe ser mayor a 0"),
  comparePrice: z.number().positive().optional(),
  sku: z.string().optional(),
  weight: z.string().optional(),
  unit: z.string().optional(),
  stock: z.number().int().min(0).optional(),
  lowStock: z.number().int().min(0).optional(),
  tags: z.array(z.string()).optional(),
  badge: z.string().optional(),
  isFeatured: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial().omit({ businessLine: true });

// ─── Categories ─────────────────────────────────────────────
export const createCategorySchema = z.object({
  businessLine: z.enum(["CANABICO", "LIOFILIZADOS"]),
  name: z.string().min(2, "Nombre requerido"),
  slug: z.string().min(2),
  description: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

// ─── Shop Orders ────────────────────────────────────────────
export const shopOrderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1),
});

export const createShopOrderSchema = z.object({
  businessLine: z.enum(["CANABICO", "LIOFILIZADOS"]),
  items: z.array(shopOrderItemSchema).min(1, "Debe agregar al menos un producto"),
  shippingName: z.string().min(2, "Nombre requerido"),
  shippingAddress: z.string().min(5, "Dirección requerida"),
  shippingCity: z.string().min(2, "Ciudad requerida"),
  shippingPhone: z.string().min(7, "Teléfono requerido"),
  shippingNotes: z.string().optional(),
  paymentProvider: z.enum(["WOMPI", "BOLD"]).optional(),
});

export const updateShopOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING", "CONFIRMED", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED",
  ]),
  trackingNumber: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateShopOrderInput = z.infer<typeof createShopOrderSchema>;
