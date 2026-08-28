import { z } from 'zod';
import { translate } from '@/lib/i18n/translate';
import type { Locale } from '@/lib/i18n/config';
import type { ProductStatus } from '@/lib/api/types';

export const PRODUCT_ADD_CATEGORIES = [
  'essentials',
  'bracelet',
  'home',
  'general',
] as const;

export type ProductAddCategory = (typeof PRODUCT_ADD_CATEGORIES)[number];

export const PRODUCT_ADD_DISCOUNT_TYPES = ['PERCENTAGE', 'FIXED'] as const;

export type ProductAddDiscountType = (typeof PRODUCT_ADD_DISCOUNT_TYPES)[number];

export function createProductAddFormSchema(locale: Locale) {
  const t = (key: string) => translate(locale, key);

  return z.object({
    name: z.string().trim().min(1, t('admin.products.add.validation.nameRequired')),
    sku: z.string().trim().min(1, t('admin.products.add.validation.skuRequired')),
    stock: z
      .string()
      .trim()
      .min(1, t('admin.products.add.validation.stockRequired'))
      .refine((value) => /^\d+$/.test(value), t('admin.products.add.validation.stockInvalid'))
      .refine((value) => Number(value) >= 0, t('admin.products.add.validation.stockInvalid')),
    description: z.string(),
    basePrice: z
      .string()
      .trim()
      .min(1, t('admin.products.add.validation.basePriceRequired'))
      .refine(
        (value) => /^\d+(\.\d{1,2})?$/.test(value) && Number(value) > 0,
        t('admin.products.add.validation.basePriceInvalid'),
      ),
    discountType: z.string(),
    discountValue: z.string(),
    brand: z.string().trim().min(1, t('admin.products.add.validation.brandRequired')),
    category: z
      .string()
      .trim()
      .min(1, t('admin.products.add.validation.categoryRequired'))
      .refine(
        (value): value is ProductAddCategory =>
          (PRODUCT_ADD_CATEGORIES as readonly string[]).includes(value),
        t('admin.products.add.validation.categoryRequired'),
      ),
    status: z
      .string()
      .trim()
      .min(1, t('admin.products.add.validation.statusRequired'))
      .refine(
        (value): value is ProductStatus =>
          value === 'DRAFT' || value === 'ACTIVE' || value === 'ARCHIVED',
        t('admin.products.add.validation.statusRequired'),
      ),
    tags: z.string(),
  });
}

export type ProductAddFormValues = {
  name: string;
  sku: string;
  stock: string;
  description: string;
  basePrice: string;
  discountType: string;
  discountValue: string;
  brand: string;
  category: string;
  status: string;
  tags: string;
};

export const productAddDefaultValues: ProductAddFormValues = {
  name: '',
  sku: '',
  stock: '',
  description: '',
  basePrice: '',
  discountType: '',
  discountValue: '',
  brand: '',
  category: '',
  status: '',
  tags: '',
};
