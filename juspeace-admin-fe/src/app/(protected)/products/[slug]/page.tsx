'use client';

import { memo, use } from 'react';
import { ProductDetailPage } from '@/components/products/product-detail-page';

interface ProductDetailRouteProps {
  params: Promise<{ slug: string }>;
}

function ProductDetailRoute({ params }: ProductDetailRouteProps) {
  const { slug } = use(params);

  return <ProductDetailPage slug={slug} />;
}

export default memo(ProductDetailRoute);
