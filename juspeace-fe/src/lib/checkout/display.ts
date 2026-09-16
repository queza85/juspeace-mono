import type { PaymentFormValues } from '@/lib/checkout/payment-schema';
import type { ShippingFormValues } from '@/lib/checkout/shipping-schema';

export function formatShippingPhone(
  shipping: Pick<ShippingFormValues, 'phoneCountryCode' | 'phoneNumber'>,
): string {
  const digits = shipping.phoneNumber.replace(/\D/g, '');
  if (shipping.phoneCountryCode === '+82' && digits.length >= 10) {
    return `${shipping.phoneCountryCode} ${digits.slice(0, 2)}-${digits.slice(2, 6)} ${digits.slice(6)}`;
  }

  return `${shipping.phoneCountryCode} ${shipping.phoneNumber.trim()}`;
}

export function formatMaskedCardNumber(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '');
  const lastFour = digits.slice(-4).padStart(4, '0');
  return `Visa **** **** **** ${lastFour}`;
}

export function formatCardExpiry(expiryDate: string): string {
  const trimmed = expiryDate.trim();
  if (!trimmed) {
    return '';
  }

  const parts = trimmed.split('/');
  if (parts.length === 3) {
    const [month, day, year = ''] = parts;
    return `Expires ${month}/${day}/${year.slice(-2)}`;
  }

  if (parts.length === 2) {
    const [month, year = ''] = parts;
    const shortYear = year.length === 4 ? year.slice(-2) : year;
    return `Expires ${month}/${shortYear}`;
  }

  return `Expires ${trimmed}`;
}

export function getPaymentMethodLabelKey(
  payment: Pick<PaymentFormValues, 'paymentMethod'>,
): string {
  switch (payment.paymentMethod) {
    case 'apple_pay':
      return 'review.paymentMethods.applePay';
    case 'google_pay':
      return 'review.paymentMethods.googlePay';
    case 'paypal':
      return 'review.paymentMethods.paypal';
    default:
      return 'review.paymentMethods.card';
  }
}
