import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/lib/api/types';

export interface CartItem {
  product: Pick<Product, 'id' | 'slug' | 'name' | 'priceCents' | 'currency' | 'imageUrl'>;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: CartItem['product'], quantity?: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  totalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((item) => item.product.id === product.id);

          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
            };
          }

          return {
            items: [...state.items, { product, quantity }],
          };
        });
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
    }),
    {
      name: 'juspeace-cart',
    },
  ),
);
