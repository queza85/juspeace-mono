'use client';

import { memo, useMemo } from 'react';
import { ProductStarRating } from '@/components/products/product-star-rating';
import type { Product } from '@/lib/api/types';
import { useFormatPrice, useLocale, useT } from '@/lib/i18n/locale-context';
import {
  formatProductPublishedAt,
  formatProductSku,
  inferCategoryLabel,
} from '@/lib/products/product-display';
import {
  getProductDetailBullets,
  getProductReviewSummary,
} from '@/lib/products/mock-data';
import { cn } from '@/lib/utils';

function MetaField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-normal uppercase tracking-wide text-[#9ca3af]">
        {label}
      </p>
      <p className="mt-1 text-[13px] font-semibold leading-snug text-[#1f2937]">
        {value}
      </p>
    </div>
  );
}

function ProductDetailInfoComponent({ product }: { product: Product }) {
  const t = useT();
  const { locale } = useLocale();
  const formatPrice = useFormatPrice();

  const sku = formatProductSku(product.slug);
  const category = inferCategoryLabel(product.slug);
  const publishedAt = formatProductPublishedAt(product.slug, locale);
  const reviewSummary = useMemo(
    () => getProductReviewSummary(product.slug),
    [product.slug],
  );
  const bullets = useMemo(() => getProductDetailBullets(), []);

  const paragraphOne =
    product.description?.trim() || t('admin.products.detail.sampleDescriptionParagraph1');
  const paragraphTwo = t('admin.products.detail.sampleDescriptionParagraph2');
  const inStock = product.stock > 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            'inline-flex rounded-full px-3 py-1 text-[11px] font-medium',
            inStock
              ? 'bg-[#ede9fe] text-[#6d28d9]'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {inStock
            ? t('admin.products.detail.inStock')
            : t('admin.products.detail.outOfStock')}
        </span>

        <div className="flex items-center gap-1.5">
          <ProductStarRating rating={5} starClassName="size-4" />
          <span className="text-[12px] text-[#6b7280]">
            {t('admin.products.detail.reviewCount', {
              count: reviewSummary.totalReviews.toLocaleString(
                locale === 'ko' ? 'ko-KR' : 'en-US',
              ),
            })}
          </span>
        </div>
      </div>

      <h2 className="text-[1.4rem] font-bold leading-tight text-[#111827]">
        {product.name}
      </h2>

      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        <MetaField label={t('admin.products.detail.fields.sku')} value={sku} />
        <MetaField
          label={t('admin.products.detail.fields.category')}
          value={category}
        />
        <MetaField
          label={t('admin.products.detail.fields.stock')}
          value={product.stock.toLocaleString(locale === 'ko' ? 'ko-KR' : 'en-US')}
        />
        <MetaField
          label={t('admin.products.detail.fields.published')}
          value={publishedAt}
        />
      </div>

      <p className="text-[1.75rem] font-bold leading-none text-[#5d3e9e]">
        {formatPrice(product.priceCents, product.currency)}
      </p>

      <div className="space-y-3">
        <h3 className="text-[11px] font-normal uppercase tracking-wide text-[#9ca3af]">
          {t('admin.products.detail.productInfoTitle')}
        </h3>
        <p className="text-[13px] leading-[1.7] text-[#4b5563]">{paragraphOne}</p>
        <p className="text-[13px] leading-[1.7] text-[#4b5563]">{paragraphTwo}</p>

        <div className="space-y-2 pt-1">
          <p className="text-[13px] font-bold text-[#111827]">
            {t('admin.products.detail.detailsTitle')}
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-[13px] leading-relaxed text-[#4b5563]">
            {bullets.map((bulletKey) => (
              <li key={bulletKey}>{t(bulletKey)}</li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          className="pt-1 text-[13px] font-bold text-[#5d3e9e] transition-colors hover:text-[#5d3e9e]/80"
        >
          {t('admin.products.detail.readMore')}
        </button>
      </div>
    </div>
  );
}

export const ProductDetailInfo = memo(ProductDetailInfoComponent);
