import { z } from 'zod';
import type { Locale } from '@/lib/i18n/config';
import { translate } from '@/lib/i18n/translate';

export const PAYMENT_METHODS = [
  'card',
  'apple_pay',
  'google_pay',
  'paypal',
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

function isValidCardNumber(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 13 && digits.length <= 19;
}

function isValidExpiryDate(value: string): boolean {
  const trimmed = value.trim();
  if (/^(0[1-9]|1[0-2])\/(\d{2})$/.test(trimmed)) {
    return true;
  }

  return /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed);
}

function isValidCvv(value: string): boolean {
  return /^\d{3,4}$/.test(value.trim());
}

export function createPaymentFormSchema(locale: Locale) {
  const t = (key: string) => translate(locale, key);

  return z
    .object({
      paymentMethod: z.enum(PAYMENT_METHODS),
      nameOnCard: z.string(),
      cardNumber: z.string(),
      expiryDate: z.string(),
      cvv: z.string(),
      saveCard: z.boolean(),
      billingSameAsShipping: z.boolean(),
      billingLine1: z.string(),
      billingLine2: z.string(),
      billingCountry: z.string(),
      billingState: z.string(),
      billingZipCode: z.string(),
    })
    .superRefine((values, ctx) => {
      if (values.paymentMethod !== 'card') {
        return;
      }

      if (!values.nameOnCard.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: t('payment.validation.nameOnCardRequired'),
          path: ['nameOnCard'],
        });
      }

      if (!isValidCardNumber(values.cardNumber)) {
        ctx.addIssue({
          code: 'custom',
          message: t('payment.validation.cardNumberInvalid'),
          path: ['cardNumber'],
        });
      }

      if (!isValidExpiryDate(values.expiryDate)) {
        ctx.addIssue({
          code: 'custom',
          message: t('payment.validation.expiryDateInvalid'),
          path: ['expiryDate'],
        });
      }

      if (!isValidCvv(values.cvv)) {
        ctx.addIssue({
          code: 'custom',
          message: t('payment.validation.cvvInvalid'),
          path: ['cvv'],
        });
      }
    })
    .superRefine((values, ctx) => {
      if (values.billingSameAsShipping) {
        return;
      }

      if (!values.billingLine1.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: t('payment.validation.billingLine1Required'),
          path: ['billingLine1'],
        });
      }

      if (!values.billingCountry.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: t('payment.validation.billingCountryRequired'),
          path: ['billingCountry'],
        });
      }

      if (!values.billingState.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: t('payment.validation.billingStateRequired'),
          path: ['billingState'],
        });
      }

      if (!values.billingZipCode.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: t('payment.validation.billingZipCodeRequired'),
          path: ['billingZipCode'],
        });
      }
    });
}

export type PaymentFormValues = z.infer<
  ReturnType<typeof createPaymentFormSchema>
>;
