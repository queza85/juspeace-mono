import { z } from 'zod';
import type { Locale } from '@/lib/i18n/config';
import { translate } from '@/lib/i18n/translate';

export const SHIPPING_METHODS = ['standard', 'pickup'] as const;
export type ShippingMethod = (typeof SHIPPING_METHODS)[number];

export const PHONE_COUNTRY_CODES = ['+82', '+1'] as const;

function isValidPhoneNumber(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

export function createShippingFormSchema(locale: Locale) {
  const t = (key: string) => translate(locale, key);
  const phoneInvalidMessage = t('checkout.validation.phoneInvalid');

  return z.object({
    name: z.string().trim().min(1, t('checkout.validation.nameRequired')),
    phoneCountryCode: z.enum(PHONE_COUNTRY_CODES),
    phoneNumber: z
      .string()
      .trim()
      .min(1, phoneInvalidMessage)
      .refine(isValidPhoneNumber, phoneInvalidMessage),
    address: z.string().trim().min(1, t('checkout.validation.addressRequired')),
    city: z.string().trim().min(1, t('checkout.validation.cityRequired')),
    postalCode: z
      .string()
      .trim()
      .min(1, t('checkout.validation.postalCodeRequired')),
    deliveryNote: z.string(),
    saveForNextTime: z.boolean(),
    shippingMethod: z.enum(SHIPPING_METHODS),
  });
}

export type ShippingFormValues = z.infer<
  ReturnType<typeof createShippingFormSchema>
>;
