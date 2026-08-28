'use client';

import { memo, use } from 'react';
import { ProductEditPage } from '@/components/products/product-edit-page';

interface ProductEditRouteProps {
  params: Promise<{ slug: string }>;
}

function ProductEditRoute({ params }: ProductEditRouteProps) {
  const { slug } = use(params);

  return <ProductEditPage slug={slug} />;
}

export default memo(ProductEditRoute);
