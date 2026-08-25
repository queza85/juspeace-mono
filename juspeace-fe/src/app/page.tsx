import { ApiStatusBanner } from '@/components/system/api-status-banner';
import { ProductGrid } from '@/components/products/product-grid';
import { listProducts } from '@/lib/api/products';
import { t } from '@/lib/i18n';

export default async function HomePage() {
  const productsResponse = await listProducts().catch(() => null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <section className="mb-10 space-y-4">
        <div className="max-w-2xl space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight">{t('home.heroTitle')}</h1>
          <p className="text-lg text-muted-foreground">{t('home.heroDescription')}</p>
        </div>
        <ApiStatusBanner />
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t('home.featuredProducts')}
        </h2>

        {productsResponse && productsResponse.items.length > 0 ? (
          <ProductGrid products={productsResponse.items} />
        ) : (
          <p className="text-muted-foreground">{t('products.empty')}</p>
        )}
      </section>
    </div>
  );
}
