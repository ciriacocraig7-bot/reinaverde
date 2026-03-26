import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ShopCartItem {
  productId: string;
  name: string;
  image?: string;
  icon?: string;
  unitPrice: number;
  quantity: number;
  weight?: string;
}

interface ShippingInfo {
  name: string;
  address: string;
  city: string;
  phone: string;
  notes: string;
}

interface ShopCartState {
  items: ShopCartItem[];
  shipping: ShippingInfo;
  addItem: (item: ShopCartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setShipping: (info: Partial<ShippingInfo>) => void;
  clearCart: () => void;
  subtotal: () => number;
  tax: () => number;
  shippingCost: () => number;
  total: () => number;
  itemCount: () => number;
}

const SHIPPING_THRESHOLD = 150000; // Free shipping over $150,000 COP
const SHIPPING_COST = 12000;
const TAX_RATE = 0.19;

function createShopCartStore(storeName: string) {
  return create<ShopCartState>()(
    persist(
      (set, get) => ({
        items: [],
        shipping: { name: "", address: "", city: "", phone: "", notes: "" },

        addItem: (item) =>
          set((state) => {
            const existing = state.items.find((i) => i.productId === item.productId);
            if (existing) {
              return {
                items: state.items.map((i) =>
                  i.productId === item.productId
                    ? { ...i, quantity: i.quantity + item.quantity }
                    : i
                ),
              };
            }
            return { items: [...state.items, item] };
          }),

        removeItem: (productId) =>
          set((state) => ({
            items: state.items.filter((i) => i.productId !== productId),
          })),

        updateQuantity: (productId, quantity) =>
          set((state) => ({
            items: quantity <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId ? { ...i, quantity } : i
                ),
          })),

        setShipping: (info) =>
          set((state) => ({
            shipping: { ...state.shipping, ...info },
          })),

        clearCart: () =>
          set({
            items: [],
            shipping: { name: "", address: "", city: "", phone: "", notes: "" },
          }),

        subtotal: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
        tax: () => Math.round(get().subtotal() * TAX_RATE),
        shippingCost: () => get().subtotal() >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST,
        total: () => get().subtotal() + get().tax() + get().shippingCost(),
        itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      }),
      { name: storeName }
    )
  );
}

export const useCanabicoCart = createShopCartStore("rv-canabico-cart");
export const useLiofilizadosCart = createShopCartStore("rv-liofilizados-cart");
