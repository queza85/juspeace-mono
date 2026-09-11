import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingHeader } from '@/components/landing/landing-header';
import { ProductDetailGallery } from '@/components/products/product-detail-gallery';
import { ProductDetailPurchase } from '@/components/products/product-detail-purchase';
import { ProductDetailTabs } from '@/components/products/product-detail-tabs';
import { ProductRelatedSection } from '@/components/products/product-related-section';
import type { Product } from '@/lib/api/types';
import { getProductBySlug, listProducts } from '@/lib/api/products';
import { getTranslator } from '@/lib/i18n/server';
import {
  buildFallbackCatalog,
  COLLECTION_VARIANTS,
  createFallbackProduct,
  detectVariantKey,
  detectVariantKeyFromSlug,
  getFallbackI18nPrefix,
  isKnownProductSlug,
} from '@/lib/products/variant-images';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

function fallbackLabels(
  t: (key: string) => string,
): Record<
  (typeof COLLECTION_VARIANTS)[number],
  { name: string; description: string }
> {
  return COLLECTION_VARIANTS.reduce(
    (acc, variantKey) => {
      const prefix = getFallbackI18nPrefix(variantKey);
      acc[variantKey] = {
        name: t(`${prefix}.title`),
        description: t(`${prefix}.description`),
      };
      return acc;
    },
    {} as Record<
      (typeof COLLECTION_VARIANTS)[number],
      { name: string; description: string }
    >,
  );
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

  const productsResponse = await listProducts({ limit: 12 }).catch(() => null);
  const relatedProducts =
    productsResponse?.items && productsResponse.items.length > 0
      ? productsResponse.items
      : buildFallbackCatalog(fallbackLabels(t), slug);

  const variantKey = detectVariantKey(product);
  const fallbackPrefix = getFallbackI18nPrefix(variantKey);
  const displayName =
    product.name.trim() || t(`${fallbackPrefix}.title`);
  const tagline =
    product.description?.trim() || t(`${fallbackPrefix}.description`);
  const tabDescription =
    product.description?.trim() || t(`${fallbackPrefix}.description`);

  return (
    <>
      <LandingHeader variant="light" />
      <article className="bg-white">
        <div className="mx-auto w-full max-w-[1920px] px-5 py-8 sm:px-8 lg:px-12 xl:px-[75px] lg:py-10">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 font-mono text-xs text-jp-muted sm:text-sm"
          >
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link
                  href="/#collection"
                  className="transition-colors hover:text-black"
                >
                  {t('products.detail.breadcrumbCollection')}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-black">{displayName}</li>
            </ol>
          </nav>

          <section className="mx-auto grid max-w-[1080px] grid-cols-1 gap-8 lg:grid-cols-[480px_520px] lg:items-stretch lg:gap-x-20">
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

          <ProductDetailTabs
            description={tabDescription}
            variantKey={variantKey}
          />
        </div>

        <div className="mx-auto w-full max-w-[1920px] px-5 sm:px-8 lg:px-12 xl:px-[75px]">
          <ProductRelatedSection
            products={relatedProducts}
            currentSlug={slug}
          />
        </div>
      </article>
      <LandingFooter />
    </>
  );
}
