'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ShippingFormValues } from '@/lib/checkout/shipping-schema';
import type { PaymentFormValues } from '@/lib/checkout/payment-schema';

export interface OrderConfirmation {
  orderNumber: string;
  email: string;
  estimatedDelivery: string;
  placedAt: string;
}

interface CheckoutState {
  shipping: ShippingFormValues | null;
  payment: PaymentFormValues | null;
  orderConfirmation: OrderConfirmation | null;
  setShipping: (shipping: ShippingFormValues) => void;
  setPayment: (payment: PaymentFormValues) => void;
  setOrderConfirmation: (confirmation: OrderConfirmation) => void;
  clearCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      shipping: null,
      payment: null,
      orderConfirmation: null,
      setShipping: (shipping) => set({ shipping }),
      setPayment: (payment) => set({ payment }),
      setOrderConfirmation: (orderConfirmation) => set({ orderConfirmation }),
      clearCheckout: () =>
        set({ shipping: null, payment: null, orderConfirmation: null }),
    }),
    { name: 'juspeace-checkout' },
  ),
);
