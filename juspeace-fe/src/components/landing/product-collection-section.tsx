import Image from 'next/image';

import { SectionHeading } from '@/components/landing/section-heading';
import { SectionLabel } from '@/components/landing/section-label';
import { SectionShell } from '@/components/landing/section-shell';
import type { Product } from '@/lib/api/types';
import { getTranslator } from '@/lib/i18n/server';
import {
  COLLECTION_VARIANTS,
  getFallbackI18nPrefix,
  VARIANT_MAIN_IMAGES,
  type VariantKey,
} from '@/lib/products/variant-images';

const COLLECTION_LOGO = '/header/juspeace_header.png';

interface CollectionCard {
  key: VariantKey;
  title: string;
  description: string;
  stock: number;
  imageAlt: string;
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

    return {
      key,
      title: matched?.name ?? t(`${fallbackPrefix}.title`),
      description:
        matched?.description?.trim() || t(`${fallbackPrefix}.description`),
      stock: matched?.stock ?? 20,
      imageAlt: matched?.name ?? t(`${fallbackPrefix}.title`),
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

  return (
    <article
      data-scroll-stagger-item
      className="flex flex-col items-center text-center"
    >
      <Image
        src={image.src}
        alt={card.imageAlt}
        width={image.width}
        height={image.height}
        sizes="(max-width: 768px) 100vw, 33vw"
        className="h-auto w-full max-w-[360px]"
      />
      <h3 className="mt-6 font-display text-[clamp(1.125rem,2vw,1.5rem)] font-bold leading-snug text-black">
        {card.title}
      </h3>
      <p className="mt-2 max-w-[280px] font-sans text-sm italic leading-relaxed text-black/80 sm:text-base">
        {card.description}
      </p>
      <p className="mt-4 font-serif text-sm text-black sm:text-base">
        <span className="font-bold">{stockCount}</span> {stockSuffix}
      </p>
      <button
        type="button"
        className="mt-5 min-w-[180px] bg-black px-6 py-3 font-sans text-sm text-white transition-opacity hover:opacity-90"
      >
        {ctaLabel}
      </button>
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
        <p className="font-display text-[clamp(2.25rem,6vw,5rem)] font-bold leading-[1.08] tracking-[-0.02em] text-black">
          {t('landing.collection.taglineLine1')}
        </p>
        <p className="font-display text-[clamp(1.75rem,4.5vw,3.75rem)] font-normal italic leading-[1.12] tracking-[-0.02em] text-black">
          {t('landing.collection.taglineLine2')}
        </p>
        <Image
          src={COLLECTION_LOGO}
          alt="JUSPEACE"
          width={48}
          height={48}
          className="mt-8 h-10 w-10 object-contain sm:mt-10 sm:h-12 sm:w-12"
        />
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
        <p className="mt-4 font-sans text-base leading-relaxed text-black sm:text-lg">
          <span className="block">{t('landing.collection.introKoLine1')}</span>
          <span className="block">{t('landing.collection.introKoLine2')}</span>
        </p>
      </div>

      <div
        data-scroll-stagger
        className="mx-auto mt-16 grid max-w-[1200px] grid-cols-1 gap-12 md:mt-20 md:grid-cols-3 md:gap-8 lg:gap-10"
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
