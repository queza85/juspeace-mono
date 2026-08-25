'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatPrice, t } from '@/lib/i18n';
import type { Product } from '@/lib/api/types';
import { useCartStore } from '@/stores/cart-store';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const inStock = product.stock > 0;

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3] bg-muted">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : null}
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg">{product.name}</CardTitle>
          <Badge variant={inStock ? 'secondary' : 'outline'}>
            {inStock ? t('common.inStock') : t('common.outOfStock')}
          </Badge>
        </div>
        {product.description ? (
          <CardDescription className="line-clamp-2">{product.description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        <p className="text-xl font-semibold">
          {formatPrice(product.priceCents, product.currency)}
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Link
          href={`/products/${product.slug}`}
          className={buttonVariants({ variant: 'outline', className: 'flex-1' })}
        >
          {t('products.viewDetails')}
        </Link>
        <Button
          className="flex-1"
          disabled={!inStock}
          onClick={() =>
            addItem({
              id: product.id,
              slug: product.slug,
              name: product.name,
              priceCents: product.priceCents,
              currency: product.currency,
              imageUrl: product.imageUrl,
            })
          }
        >
          {t('common.addToCart')}
        </Button>
      </CardFooter>
    </Card>
  );
}
