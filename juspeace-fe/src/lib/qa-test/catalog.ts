export const QA_CART_ITEMS = [
  {
    id: 'band',
    nameKey: 'qaTest.cart.items.band',
    priceCents: 4800,
  },
  {
    id: 'cord',
    nameKey: 'qaTest.cart.items.cord',
    priceCents: 3600,
  },
] as const;

export type QaCartItemId = (typeof QA_CART_ITEMS)[number]['id'];

export const QA_SHIPPING_METHODS = [
  {
    id: 'standard',
    feeCents: 800,
    labelKey: 'qaTest.shipping.methods.standard',
  },
  {
    id: 'express',
    feeCents: 1800,
    labelKey: 'qaTest.shipping.methods.express',
  },
] as const;

export type QaShippingMethodId = (typeof QA_SHIPPING_METHODS)[number]['id'];

export function isQaShippingMethodId(value: string): value is QaShippingMethodId {
  return QA_SHIPPING_METHODS.some((method) => method.id === value);
}
