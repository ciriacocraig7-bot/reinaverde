import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  menuItemId: string;
  name: string;
  image?: string;
  unitPrice: number;
  quantity: number;
  customNotes?: string;
}

interface CartState {
  items: CartItem[];
  guestCount: number;
  eventType: string | null;
  deliveryDate: string;
  deliveryTime: string;
  deliveryAddress: string;
  deliveryCity: string;
  notes: string;
  dietaryNotes: string;
  addItem: (item: CartItem) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  updateItemNotes: (menuItemId: string, notes: string) => void;
  setGuestCount: (count: number) => void;
  setEventType: (type: string | null) => void;
  setDeliveryInfo: (info: { date?: string; time?: string; address?: string; city?: string }) => void;
  setNotes: (notes: string) => void;
  setDietaryNotes: (notes: string) => void;
  clearCart: () => void;
  subtotal: () => number;
  tax: () => number;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      guestCount: 1,
      eventType: null,
      deliveryDate: "",
      deliveryTime: "",
      deliveryAddress: "",
      deliveryCity: "",
      notes: "",
      dietaryNotes: "",

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.menuItemId === item.menuItemId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.menuItemId === item.menuItemId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (menuItemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.menuItemId !== menuItemId),
        })),

      updateQuantity: (menuItemId, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((i) => i.menuItemId !== menuItemId)
            : state.items.map((i) =>
                i.menuItemId === menuItemId ? { ...i, quantity } : i
              ),
        })),

      updateItemNotes: (menuItemId, notes) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, customNotes: notes } : i
          ),
        })),

      setGuestCount: (guestCount) => set({ guestCount }),
      setEventType: (eventType) => set({ eventType }),
      setDeliveryInfo: (info) =>
        set((state) => ({
          deliveryDate: info.date ?? state.deliveryDate,
          deliveryTime: info.time ?? state.deliveryTime,
          deliveryAddress: info.address ?? state.deliveryAddress,
          deliveryCity: info.city ?? state.deliveryCity,
        })),
      setNotes: (notes) => set({ notes }),
      setDietaryNotes: (dietaryNotes) => set({ dietaryNotes }),

      clearCart: () =>
        set({
          items: [],
          guestCount: 1,
          eventType: null,
          deliveryDate: "",
          deliveryTime: "",
          deliveryAddress: "",
          deliveryCity: "",
          notes: "",
          dietaryNotes: "",
        }),

      subtotal: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
      tax: () => Math.round(get().subtotal() * 0.19),
      total: () => get().subtotal() + get().tax(),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "reina-verde-cart" }
  )
);
