import Image from 'next/image';
import Link from 'next/link';

import { CollectionCtaButton } from '@/components/landing/collection-cta-button';
import { SectionHeading } from '@/components/landing/section-heading';
import { SectionLabel } from '@/components/landing/section-label';
import { SectionShell } from '@/components/landing/section-shell';
import type { Product } from '@/lib/api/types';
import { getTranslator } from '@/lib/i18n/server';
import {
  COLLECTION_VARIANTS,
  createFallbackProduct,
  getFallbackI18nPrefix,
  getProductDetailHref,
  VARIANT_DETAIL_SLUGS,
  VARIANT_MAIN_IMAGES,
  VARIANT_PRODUCT_IMAGES,
  type VariantKey,
} from '@/lib/products/variant-images';

const COLLECTION_LOGO = '/header/juspeace_header.png';

/** Envelope PNGs are 1080×1350 with transparent padding around a 753×953 subject. */
const ENVELOPE_CONTENT_WIDTH = 753;
const ENVELOPE_CONTENT_HEIGHT = 953;
const ENVELOPE_CONTENT_LEFT = 169;
const ENVELOPE_CONTENT_TOP = 172;
const ENVELOPE_IMAGE_STYLE = {
  width: `${(1080 / ENVELOPE_CONTENT_WIDTH) * 100}%`,
  height: 'auto',
  left: `${(-ENVELOPE_CONTENT_LEFT / ENVELOPE_CONTENT_WIDTH) * 100}%`,
  top: `${(-ENVELOPE_CONTENT_TOP / ENVELOPE_CONTENT_HEIGHT) * 100}%`,
} as const;

interface CollectionCard {
  key: VariantKey;
  title: string;
  description: string;
  stock: number;
  imageAlt: string;
  product: Product;
}

function matchVariant(product: Product, key: VariantKey) {
  const haystack = `${product.slug} ${product.name}`.toLowerCase();
  return haystack.includes(key);
}

function buildCards(
  products: Product[],
  t: (key: string, values?: Record<string, string | number>) => string,
): CollectionCard[] {
  const used = new Set<string>();

  return COLLECTION_VARIANTS.map((key) => {
    const fallbackPrefix = getFallbackI18nPrefix(key);
    const matched =
      products.find((product) => {
        if (used.has(product.id)) return false;
        return matchVariant(product, key);
      }) ?? null;

    if (matched) used.add(matched.id);

    const product =
      matched ??
      createFallbackProduct(VARIANT_DETAIL_SLUGS[key], key, {
        name: t(`${fallbackPrefix}.title`),
        description: t(`${fallbackPrefix}.description`),
      });

    return {
      key,
      title: product.name,
      description:
        product.description?.trim() || t(`${fallbackPrefix}.description`),
      stock: product.stock,
      imageAlt: product.name,
      product: {
        ...product,
        imageUrl: product.imageUrl ?? VARIANT_PRODUCT_IMAGES[key].src,
      },
    };
  });
}

function CollectionProductCard({
  card,
  ctaLabel,
  stockSuffix,
}: {
  card: CollectionCard;
  ctaLabel: string;
  stockSuffix: string;
}) {
  const image = VARIANT_MAIN_IMAGES[card.key];
  const stockCount = Math.round(card.stock);
  const detailHref = getProductDetailHref(card.key, card.product);

  return (
    <article
      data-scroll-stagger-item
      className="flex flex-col items-center text-center"
    >
      <Link
        href={detailHref}
        className="group flex w-full flex-col items-center"
      >
        <div className="relative aspect-[753/953] w-full overflow-hidden">
          <Image
            src={image.src}
            alt={card.imageAlt}
            width={image.width}
            height={image.height}
            sizes="(max-width: 768px) 90vw, 400px"
            className="absolute max-w-none transition-opacity group-hover:opacity-90"
            style={ENVELOPE_IMAGE_STYLE}
          />
        </div>
        <h3 className="mt-8 font-display text-[clamp(1.125rem,2vw,1.5rem)] font-bold leading-snug text-black">
          {card.title}
        </h3>
      </Link>
      <p className="mt-2 max-w-[340px] font-sans text-sm italic leading-relaxed text-black/80 sm:text-[0.9375rem]">
        {card.description}
      </p>
      <p className="mt-4 font-serif text-sm text-black">
        <span className="font-bold">{stockCount}</span> {stockSuffix}
      </p>
      <CollectionCtaButton product={card.product} label={ctaLabel} />
    </article>
  );
}

interface ProductCollectionSectionProps {
  products: Product[];
}

export async function ProductCollectionSection({
  products,
}: ProductCollectionSectionProps) {
  const { t } = await getTranslator();
  const cards = buildCards(products, t);

  return (
    <SectionShell id="collection" className="bg-white pt-16 pb-28 lg:pt-24 lg:pb-40">
      <div
        data-scroll-reveal
        className="mx-auto flex max-w-[1116px] flex-col items-center text-center"
      >
        <p className="font-display text-[clamp(2.25rem,6.25vw,7.5rem)] font-bold leading-[clamp(2.4rem,6.67vw,8rem)] tracking-[-0.02em] text-black">
          {t('landing.collection.taglineLine1')}
        </p>
        <p className="font-display text-[clamp(1.75rem,4.5vw,3.75rem)] font-normal italic leading-[1.12] tracking-[-0.02em] text-black">
          {t('landing.collection.taglineLine2')}
        </p>
        <div className="relative mt-12 size-20 shrink-0 overflow-hidden rounded-full sm:mt-16 sm:size-24 lg:mt-20 lg:size-28">
          <Image
            src={COLLECTION_LOGO}
            alt="JUSPEACE"
            width={112}
            height={112}
            className="size-full object-cover"
          />
        </div>
      </div>

      <div
        data-scroll-reveal
        className="mx-auto mt-16 flex max-w-[900px] flex-col items-center text-center lg:mt-24"
      >
        <SectionLabel className="text-base sm:text-lg lg:text-xl">
          {t('landing.collection.label')}
        </SectionLabel>
        <SectionHeading className="mt-4 text-[clamp(2.25rem,6vw,5rem)] leading-[1.08]">
          <span className="block">{t('landing.collection.headingLine1')}</span>
          <span className="block">{t('landing.collection.headingLine2')}</span>
        </SectionHeading>
        <p className="mt-6 font-sans text-base leading-relaxed text-black sm:text-lg">
          <span className="block">{t('landing.collection.introLine1')}</span>
          <span className="block">{t('landing.collection.introLine2')}</span>
        </p>
        <p className="mt-10 font-sans text-base leading-relaxed text-black sm:mt-12 sm:text-lg lg:mt-14">
          <span className="block">{t('landing.collection.introKoLine1')}</span>
          <span className="block">{t('landing.collection.introKoLine2')}</span>
        </p>
      </div>

      <div
        data-scroll-stagger
        className="mx-auto mt-16 grid max-w-[1280px] grid-cols-1 gap-12 md:mt-20 md:grid-cols-3 md:gap-10 lg:gap-12"
      >
        {cards.map((card) => (
          <CollectionProductCard
            key={card.key}
            card={card}
            ctaLabel={t('landing.collection.cta')}
            stockSuffix={t('landing.collection.stockSuffix')}
          />
        ))}
      </div>
    </SectionShell>
  );
}
