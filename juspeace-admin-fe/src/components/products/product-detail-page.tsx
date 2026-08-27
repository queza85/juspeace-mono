'use client';

import { memo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ProductDetailBreadcrumbs } from '@/components/products/product-detail-breadcrumbs';
import { ProductDetailGallery } from '@/components/products/product-detail-gallery';
import { ProductDetailInfo } from '@/components/products/product-detail-info';
import { ProductDetailReviews } from '@/components/products/product-detail-reviews';
import { Skeleton } from '@/components/ui/skeleton';
import { getProductBySlug } from '@/lib/api/products';
import { ApiError } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/auth-context';
import { useT } from '@/lib/i18n/locale-context';
import { productKeys } from '@/lib/query/keys';
import { cn } from '@/lib/utils';

const detailCardClass =
  'overflow-hidden rounded-lg border border-border/60 bg-card shadow-none';

function ProductDetailSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className={cn(detailCardClass, 'h-12 w-full rounded-lg')} />
      <div className={cn(detailCardClass, 'p-4 md:p-6')}>
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <Skeleton className="aspect-square w-full max-w-[280px] rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductDetailPageComponent({ slug }: { slug: string }) {
  const t = useT();
  const { accessToken } = useAuth();

  const { data: product, isLoading, isError, error } = useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => getProductBySlug(slug, accessToken ?? undefined),
    enabled: Boolean(slug),
  });

  const isNotFound = isError && error instanceof ApiError && error.status === 404;

  return (
    <div className="-mx-4 -mt-4 flex min-h-full flex-col md:-mx-6 md:-mt-6">
      <header className="border-b border-border/60 bg-card px-4 py-3 md:px-6">
        <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-3">
          <h1 className="text-sm font-bold tracking-[0.08em] text-[#111827] uppercase">
            {t('admin.products.detail.pageTitle')}
          </h1>
          <ProductDetailBreadcrumbs />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-3 px-4 py-4 md:px-6 md:py-5">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-3">
          {isLoading ? <ProductDetailSkeleton /> : null}

          {!isLoading && isError ? (
            <div
              className={cn(
                detailCardClass,
                'px-4 py-8 text-center text-sm text-muted-foreground',
              )}
            >
              {isNotFound
                ? t('admin.products.detail.notFound')
                : t('admin.products.detail.loadError')}
            </div>
          ) : null}

          {!isLoading && product ? (
            <>
              <div className={cn(detailCardClass, 'px-4 py-3 md:px-5')}>
                <Link
                  href="/products"
                  className="text-sm font-medium text-[#2563eb] underline underline-offset-2 transition-colors hover:text-[#1d4ed8]"
                >
                  {t('admin.products.detail.backToProducts')}
                </Link>
              </div>

              <article className={detailCardClass}>
                <div className="grid gap-6 p-4 md:p-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
                  <ProductDetailGallery product={product} />

                  <div className="min-w-0 space-y-8">
                    <ProductDetailInfo product={product} />
                    <ProductDetailReviews product={product} />
                  </div>
                </div>
              </article>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export const ProductDetailPage = memo(ProductDetailPageComponent);
