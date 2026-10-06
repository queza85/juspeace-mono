import { notFound } from 'next/navigation';
import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingHeader } from '@/components/landing/landing-header';
import { ProductDetailGallery } from '@/components/products/product-detail-gallery';
import { ProductDetailPageIntro } from '@/components/products/product-detail-page-intro';
import { ProductDetailPurchase } from '@/components/products/product-detail-purchase';
import { ProductDetailTabs } from '@/components/products/product-detail-tabs';
import type { Product } from '@/lib/api/types';
import { getProductBySlug } from '@/lib/api/products';
import { getTranslator } from '@/lib/i18n/server';
import {
  createFallbackProduct,
  detectVariantKey,
  detectVariantKeyFromSlug,
  getFallbackI18nPrefix,
  isKnownProductSlug,
} from '@/lib/products/variant-images';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function resolveProduct(
  slug: string,
  t: (key: string) => string,
): Promise<Product> {
  try {
    return await getProductBySlug(slug);
  } catch {
    if (!isKnownProductSlug(slug)) {
      notFound();
    }

    const variantKey = detectVariantKeyFromSlug(slug);
    const prefix = getFallbackI18nPrefix(variantKey);
    return createFallbackProduct(slug, variantKey, {
      name: t(`${prefix}.title`),
      description: t(`${prefix}.description`),
    });
  }
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const { t } = await getTranslator();

  try {
    const product = await getProductBySlug(slug);
    return {
      title: product.name,
      description: product.description ?? undefined,
    };
  } catch {
    if (!isKnownProductSlug(slug)) {
      return { title: t('products.viewDetails') };
    }

    const variantKey = detectVariantKeyFromSlug(slug);
    const prefix = getFallbackI18nPrefix(variantKey);
    return {
      title: t(`${prefix}.title`),
      description: t(`${prefix}.description`),
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const { t } = await getTranslator();

  const product = await resolveProduct(slug, t);

  const variantKey = detectVariantKey(product);
  const fallbackPrefix = getFallbackI18nPrefix(variantKey);
  const displayName =
    product.name.trim() || t(`${fallbackPrefix}.title`);
  const tagline =
    product.description?.trim() || t(`${fallbackPrefix}.description`);

  return (
    <>
      <LandingHeader variant="light" />
      <article className="bg-white">
        <div className="mx-auto w-full max-w-[1920px] px-5 py-8 sm:px-6 lg:px-8 lg:py-10 xl:px-10">
          <div className="mx-auto w-[80vw] max-w-full">
            <ProductDetailPageIntro
              collectionLabel={t('products.detail.breadcrumbCollection')}
              productName={displayName}
              backAria={t('products.detail.breadcrumbBack')}
              bannerText={t('products.detail.registrationBanner')}
            />

            <section className="grid grid-cols-1 gap-8 lg:grid-cols-[520px_minmax(0,1fr)] lg:items-start lg:gap-x-16 2xl:grid-cols-[minmax(560px,760px)_580px]">
              <div className="lg:self-start">
                <ProductDetailGallery
                  variantKey={variantKey}
                  productName={displayName}
                />
              </div>
              <ProductDetailPurchase
                product={product}
                displayName={displayName}
                tagline={tagline}
                reviewCount={3}
              />
            </section>

            <ProductDetailTabs />
          </div>
        </div>
      </article>
      <LandingFooter />
    </>
  );
}
