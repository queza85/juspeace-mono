import { MediaPlaceholder } from '@/components/landing/media-placeholder';
import { ProductPurchasePanel } from '@/components/landing/product-purchase-panel';
import { SectionHeading } from '@/components/landing/section-heading';
import { SectionLabel } from '@/components/landing/section-label';
import { SectionShell } from '@/components/landing/section-shell';
import type { Product } from '@/lib/api/types';
import { getTranslator } from '@/lib/i18n/server';

type VariantKey = 'black' | 'white' | 'stripe';

interface CollectionRow {
  key: VariantKey;
  product: Product | null;
  category: string;
  title: string;
  panelName: string;
  variant: string;
  description: string;
  stock: number;
}

function matchVariant(product: Product, key: VariantKey) {
  const haystack = `${product.slug} ${product.name}`.toLowerCase();
  return haystack.includes(key);
}

function buildRows(
  products: Product[],
  t: (key: string, values?: Record<string, string | number>) => string,
): CollectionRow[] {
  const keys: VariantKey[] = ['black', 'white', 'stripe'];
  const used = new Set<string>();

  return keys.map((key) => {
    const fallbackPrefix = `landing.collection.fallback${key[0].toUpperCase()}${key.slice(1)}`;
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
    };
  });
}

interface ProductCollectionSectionProps {
  products: Product[];
}

export async function ProductCollectionSection({
  products,
}: ProductCollectionSectionProps) {
  const { t } = await getTranslator();
  const rows = buildRows(products, t);

  return (
    <SectionShell id="collection" className="bg-white py-16 lg:py-24">
      <div className="mx-auto mb-16 flex max-w-[1116px] flex-col items-center text-center lg:mb-24">
        <SectionLabel>{t('landing.collection.label')}</SectionLabel>
        <SectionHeading className="mt-4">
          <span className="block">{t('landing.collection.headingLine1')}</span>
          <span className="block">{t('landing.collection.headingLine2')}</span>
        </SectionHeading>
      </div>

      <div className="space-y-20 lg:space-y-28">
        {rows.map((row) => (
          <article
            key={row.key}
            className="grid items-start gap-10 lg:grid-cols-[minmax(0,777px)_minmax(0,1fr)] lg:gap-12"
          >
            <MediaPlaceholder
              className="w-full rounded-none"
              aspectRatio="777 / 1116"
              label={t('landing.collection.imagePlaceholder')}
            />

            <div className="flex flex-col pt-2 lg:pt-16">
              <p className="font-mono text-lg text-jp-accent-teal">
                {t('landing.collection.index')}
              </p>
              <h3 className="mt-4 font-serif text-[clamp(2rem,4vw,3rem)] leading-tight text-black">
                <span className="block whitespace-pre">{`/    ${row.category}`}</span>
                <span className="block uppercase">{row.title}</span>
              </h3>
              <p className="mt-8 max-w-[508px] font-mono text-lg leading-8 text-jp-muted sm:text-[22px]">
                {row.description}
              </p>
              <div className="mt-10">
                <ProductPurchasePanel
                  product={row.product}
                  panelName={row.panelName}
                  variantLabel={row.variant}
                  stock={row.stock}
                  detailsHref={
                    row.product ? `/products/${row.product.slug}` : undefined
                  }
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
