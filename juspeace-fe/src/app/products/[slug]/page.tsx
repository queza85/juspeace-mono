import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from '@/components/products/add-to-cart-button';
import { getProductBySlug } from '@/lib/api/products';
import { formatPrice, t } from '@/lib/i18n';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;

  try {
    const product = await getProductBySlug(slug);
    return {
      title: product.name,
      description: product.description ?? undefined,
    };
  } catch {
    return { title: t('products.viewDetails') };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product;

  try {
    product = await getProductBySlug(slug);
  } catch {
    notFound();
  }

  const inStock = product.stock > 0;

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        ) : null}
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Badge variant={inStock ? 'secondary' : 'outline'}>
            {inStock ? t('common.inStock') : t('common.outOfStock')}
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight">{product.name}</h1>
          {product.description ? (
            <p className="text-lg text-muted-foreground">{product.description}</p>
          ) : null}
        </div>

        <p className="text-3xl font-semibold">
          {formatPrice(product.priceCents, product.currency)}
        </p>

        <AddToCartButton product={product} disabled={!inStock} />
      </div>
    </div>
  );
}
