import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  sale: number;
  quantity: number;
  variantId?: string;
  color?: string;
  size?: string;
}

interface CartState {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (item) => {
        const existing = get().items.find(
          (i) => i.productId === item.productId && i.variantId === item.variantId
        );

        if (existing) {
          set({
            items: get().items.map((i) =>
              i === existing ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
      },

      removeFromCart: (productId) => {
        set({
          items: get().items.filter(
            (i) => i.productId !== productId && i.productId !== productId
          ),
        });
      },

updateQuantity: (productId, newQuantity) =>
  set((state) => {
    const updatedItems = state.items.map((item) =>
      item.productId === productId
        ? { ...item, quantity: newQuantity }
        : item
    );
    return { items: updatedItems };
  }),




      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
    }
  )
);

