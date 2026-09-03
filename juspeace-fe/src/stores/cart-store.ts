import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/lib/api/types';

export interface CartItem {
  product: Pick<
    Product,
    'id' | 'slug' | 'name' | 'priceCents' | 'currency' | 'imageUrl'
  >;
  quantity: number;
}

/** Flat shipping fee (USD cents) — frontend placeholder until checkout API exists. */
export const CART_SHIPPING_CENTS = 500;

interface CartState {
  items: CartItem[];
  addItem: (product: CartItem['product'], quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotalCents: () => number;
  orderTotalCents: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(
            (item) => item.product.id === product.id,
          );

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
      updateItemQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item,
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      totalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),
      subtotalCents: () =>
        get().items.reduce(
          (total, item) => total + item.product.priceCents * item.quantity,
          0,
        ),
      orderTotalCents: () =>
        get().subtotalCents() +
        (get().items.length > 0 ? CART_SHIPPING_CENTS : 0),
    }),
    {
      name: 'juspeace-cart',
    },
  ),
);

/** SSR-safe cart count — server + hydration pass use 0, then persist updates. */
export function useCartTotalItems() {
  return useSyncExternalStore(
    (onStoreChange) => useCartStore.subscribe(onStoreChange),
    () => useCartStore.getState().totalItems(),
    () => 0,
  );
}
