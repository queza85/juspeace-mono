import Image from 'next/image';
import Link from 'next/link';
import { SectionHeading } from '@/components/landing/section-heading';
import { SectionLabel } from '@/components/landing/section-label';
import type { Product } from '@/lib/api/types';
import {
  detectVariantKey,
  getFallbackI18nPrefix,
  VARIANT_MAIN_IMAGES,
} from '@/lib/products/variant-images';
import { getTranslator } from '@/lib/i18n/server';

interface ProductRelatedSectionProps {
  products: Product[];
  currentSlug: string;
}

export async function ProductRelatedSection({
  products,
  currentSlug,
}: ProductRelatedSectionProps) {
  const { t } = await getTranslator();
  const related = products.filter((product) => product.slug !== currentSlug).slice(0, 2);

  if (related.length === 0) return null;

  return (
    <section className="mt-12 pb-16 lg:mt-16 lg:pb-24">
      <div className="flex flex-col items-center text-center">
        <SectionLabel className="text-sm sm:text-base lg:text-lg">
          {t('products.detail.relatedLabel')}
        </SectionLabel>
        <SectionHeading className="mt-2 text-[clamp(1.75rem,4vw,3.5rem)] leading-[1.08]">
          {t('products.detail.relatedHeading')}
        </SectionHeading>
      </div>

      <div className="mx-auto mt-8 grid max-w-[560px] grid-cols-2 gap-6 sm:max-w-[640px] sm:gap-8 lg:mt-10">
        {related.map((product) => {
          const variantKey = detectVariantKey(product);
          const fallbackPrefix = getFallbackI18nPrefix(variantKey);
          const image = VARIANT_MAIN_IMAGES[variantKey];
          const title = t(`${fallbackPrefix}.category`);
          const subtitle = t(`${fallbackPrefix}.variant`);

          return (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group mx-auto flex w-full max-w-[280px] flex-col text-center"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-jp-light-gray">
                <Image
                  src={product.imageUrl ?? image.src}
                  alt={product.name}
                  width={280}
                  height={280}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 45vw, 280px"
                />
              </div>
              <h3 className="mt-3 font-display text-base font-bold text-black sm:text-lg">
                {title}
              </h3>
              <p className="mt-1 font-mono text-[11px] text-jp-muted sm:text-xs">
                {subtitle}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
