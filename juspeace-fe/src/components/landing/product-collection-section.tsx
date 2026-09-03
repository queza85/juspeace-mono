import Image from 'next/image';
import Link from 'next/link';

import { ProductPurchasePanel } from '@/components/landing/product-purchase-panel';
import { SectionHeading } from '@/components/landing/section-heading';
import { SectionLabel } from '@/components/landing/section-label';
import { SectionShell } from '@/components/landing/section-shell';
import type { Product } from '@/lib/api/types';
import { getTranslator } from '@/lib/i18n/server';
import {
  COLLECTION_VARIANTS,
  getFallbackI18nPrefix,
  getProductDetailHref,
  VARIANT_MAIN_IMAGES,
  type VariantKey,
} from '@/lib/products/variant-images';

const COLLECTION_ROW_MIN_HEIGHT: Record<VariantKey, string> = {
  black: 'min-h-[calc(360px*930/744)] xl:min-h-[calc(420px*930/744)]',
  white: 'min-h-[calc(360px*920/726)] xl:min-h-[calc(420px*920/726)]',
  stripe: 'min-h-[calc(360px*926/746)] xl:min-h-[calc(420px*926/746)]',
};

interface CollectionRow {
  key: VariantKey;
  product: Product | null;
  category: string;
  title: string;
  panelName: string;
  variant: string;
  description: string;
  stock: number;
  detailHref: string;
}

function matchVariant(product: Product, key: VariantKey) {
  const haystack = `${product.slug} ${product.name}`.toLowerCase();
  return haystack.includes(key);
}

function buildRows(
  products: Product[],
  t: (key: string, values?: Record<string, string | number>) => string,
): CollectionRow[] {
  const used = new Set<string>();

  return COLLECTION_VARIANTS.map((key) => {
    const fallbackPrefix = getFallbackI18nPrefix(key);
    const matched =
      products.find((product) => {
        if (used.has(product.id)) return false;
        return matchVariant(product, key);
      }) ?? null;

    if (matched) used.add(matched.id);

    return {
      key,
      product: matched,
      category: t(`${fallbackPrefix}.category`),
      title: t(`${fallbackPrefix}.title`),
      panelName: matched?.name ?? t(`${fallbackPrefix}.panelName`),
      variant: t(`${fallbackPrefix}.variant`),
      description:
        matched?.description?.trim() || t(`${fallbackPrefix}.description`),
      stock: matched?.stock ?? 20,
      detailHref: getProductDetailHref(key, matched),
    };
  });
}

function CollectionProductImage({
  variantKey,
  alt,
  href,
}: {
  variantKey: VariantKey;
  alt: string;
  href: string;
}) {
  const image = VARIANT_MAIN_IMAGES[variantKey];

  return (
    <Link
      href={href}
      className="group block transition-opacity hover:opacity-90"
      aria-label={alt}
    >
      <Image
        src={image.src}
        alt={alt}
        width={image.width}
        height={image.height}
        sizes="(max-width: 1280px) 360px, 420px"
        className="block h-auto w-full"
      />
    </Link>
  );
}

function CollectionProductCopy({
  row,
  t,
}: {
  row: CollectionRow;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  return (
    <div className="flex flex-col">
      <p className="font-mono text-xs text-jp-accent-teal sm:text-sm">
        {t('landing.collection.index')}
      </p>
      <h3 className="mt-1 font-serif text-[clamp(1rem,1.8vw,1.375rem)] leading-[1.15] text-black">
        <Link href={row.detailHref} className="transition-opacity hover:opacity-80">
          <span className="block whitespace-pre">{`/    ${row.category}`}</span>
          <span className="block uppercase">{row.title}</span>
        </Link>
      </h3>
      <p className="mt-2 max-w-[380px] font-mono text-xs leading-5 text-jp-muted sm:text-[13px] sm:leading-6">
        {row.description}
      </p>
      <div className="mt-6 lg:mt-8">
        <ProductPurchasePanel
          product={row.product}
          panelName={row.panelName}
          variantLabel={row.variant}
          stock={row.stock}
          detailsHref={row.detailHref}
        />
      </div>
    </div>
  );
}

interface ProductCollectionSectionProps {
  products: Product[];
}

export async function ProductCollectionSection({
  products,
}: ProductCollectionSectionProps) {
  const { t } = await getTranslator();
  const rows = buildRows(products, t);

  const imageAlt = (row: CollectionRow) =>
    row.product?.name ??
    t(
      `landing.collection.fallback${row.key[0].toUpperCase()}${row.key.slice(1)}.panelName`,
    );

  return (
    <SectionShell id="collection" className="bg-white pt-12 pb-28 lg:pt-20 lg:pb-40">
      <div
        data-scroll-reveal
        className="mx-auto mb-10 flex max-w-[1116px] flex-col items-center text-center lg:mb-14"
      >
        <SectionLabel className="text-sm sm:text-base lg:text-lg">
          {t('landing.collection.label')}
        </SectionLabel>
        <SectionHeading className="mt-2 text-[clamp(1.75rem,4vw,3.5rem)] leading-[1.08]">
          <span className="block">{t('landing.collection.headingLine1')}</span>
          <span className="block">{t('landing.collection.headingLine2')}</span>
        </SectionHeading>
      </div>

      <div data-scroll-stagger className="space-y-12 lg:hidden">
        {rows.map((row) => (
          <article
            key={row.key}
            data-scroll-stagger-item
            className="mx-auto flex max-w-[960px] flex-col gap-6"
          >
            <CollectionProductImage
              variantKey={row.key}
              alt={imageAlt(row)}
              href={row.detailHref}
            />
            <CollectionProductCopy row={row} t={t} />
          </article>
        ))}
      </div>

      <div
        data-scroll-stagger
        className="mx-auto hidden max-w-[1080px] lg:grid lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start lg:gap-10 lg:pl-10 xl:grid-cols-[420px_minmax(0,1fr)] xl:gap-12 xl:pl-14"
      >
        <div className="flex flex-col gap-0">
          {rows.map((row) => (
            <div key={row.key} data-scroll-stagger-item>
              <CollectionProductImage
                variantKey={row.key}
                alt={imageAlt(row)}
                href={row.detailHref}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-0 lg:pl-6 xl:pl-10">
          {rows.map((row) => (
            <div
              key={row.key}
              data-scroll-stagger-item
              className={`flex flex-col justify-center ${COLLECTION_ROW_MIN_HEIGHT[row.key]}`}
            >
              <CollectionProductCopy row={row} t={t} />
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
