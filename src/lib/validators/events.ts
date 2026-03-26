import { z } from "zod";

export const createEventSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  type: z.enum(["CORPORATIVO", "BODA", "SOCIAL", "SUSCRIPCION", "PRIVADO"]),
  date: z.string().min(1, "Fecha requerida"),
  startTime: z.string().min(1, "Hora de inicio requerida"),
  endTime: z.string().optional(),
  location: z.string().min(5, "Ubicación requerida"),
  guestCount: z.number().int().min(1, "Mínimo 1 invitado"),
  description: z.string().optional(),
  budget: z.number().optional(),
  companyId: z.string().uuid().optional(),
});

export const eventTimelineSchema = z.object({
  time: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type EventTimelineInput = z.infer<typeof eventTimelineSchema>;
