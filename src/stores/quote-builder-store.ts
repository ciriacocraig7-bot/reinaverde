/**
 * Estado del wizard "/catering/cotizar".
 *
 * Persistido en localStorage para que el cliente pueda refrescar la página
 * sin perder progreso. Se limpia al confirmar el pago (en la confirmation
 * page) o al hacer "Empezar de nuevo".
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface QuoteItem {
  menuItemId: string;
  name: string;
  image: string | null;
  basePrice: number;
  momentType: string | null;
  /** Cantidad = casi siempre = guestCount, pero algunos platos para compartir van menos. */
  quantity: number;
  notes?: string;
  portionMultiplier?: number;
}

export interface QuoteBuilderState {
  // Step navigation
  currentStep: number; // 0..4

  // Step 0: variables del evento
  city: string;
  guestCount: number;
  eventDate: string; // ISO yyyy-mm-dd
  eventTime: string; // HH:mm
  eventAddress: string;
  momentTypes: string[]; // ["ALM","COC"] etc

  // Step 1-2: composición
  items: QuoteItem[];

  // Step 3 (revisión)
  notes: string;
  dietaryNotes: string;
  // El cliente puede elegir asumir o no el régimen aplicable
  clientIsDeclarante: boolean;

  // Step 4: pago — ID de la quote persistida
  quoteId: string | null;
  quoteNumber: string | null;

  // Setters
  goToStep: (n: number) => void;
  setEventVars: (input: Partial<{
    city: string;
    guestCount: number;
    eventDate: string;
    eventTime: string;
    eventAddress: string;
    momentTypes: string[];
  }>) => void;
  addItem: (item: QuoteItem) => void;
  removeItem: (menuItemId: string) => void;
  updateItem: (menuItemId: string, patch: Partial<QuoteItem>) => void;
  setNotes: (notes: string) => void;
  setDietaryNotes: (notes: string) => void;
  setClientIsDeclarante: (v: boolean) => void;
  setQuoteCreated: (id: string, number: string) => void;
  reset: () => void;
}

const initial = {
  currentStep: 0,
  city: "Bogotá",
  guestCount: 50,
  eventDate: "",
  eventTime: "12:30",
  eventAddress: "",
  momentTypes: ["ALM"] as string[],
  items: [] as QuoteItem[],
  notes: "",
  dietaryNotes: "",
  clientIsDeclarante: true,
  quoteId: null as string | null,
  quoteNumber: null as string | null,
};

export const useQuoteBuilder = create<QuoteBuilderState>()(
  persist(
    (set) => ({
      ...initial,

      goToStep: (n) => set({ currentStep: Math.max(0, Math.min(4, n)) }),

      setEventVars: (input) =>
        set((state) => ({
          city: input.city ?? state.city,
          guestCount: input.guestCount ?? state.guestCount,
          eventDate: input.eventDate ?? state.eventDate,
          eventTime: input.eventTime ?? state.eventTime,
          eventAddress: input.eventAddress ?? state.eventAddress,
          momentTypes: input.momentTypes ?? state.momentTypes,
        })),

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.menuItemId === item.menuItemId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.menuItemId === item.menuItemId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (menuItemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.menuItemId !== menuItemId),
        })),

      updateItem: (menuItemId, patch) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, ...patch } : i,
          ),
        })),

      setNotes: (notes) => set({ notes }),
      setDietaryNotes: (dietaryNotes) => set({ dietaryNotes }),
      setClientIsDeclarante: (clientIsDeclarante) => set({ clientIsDeclarante }),

      setQuoteCreated: (quoteId, quoteNumber) => set({ quoteId, quoteNumber }),

      reset: () => set({ ...initial }),
    }),
    { name: "rv-quote-builder" },
  ),
);
