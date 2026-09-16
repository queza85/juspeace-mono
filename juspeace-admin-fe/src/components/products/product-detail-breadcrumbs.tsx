'use client';

import { memo } from 'react';
import { ProductPageBreadcrumbs } from '@/components/products/product-page-breadcrumbs';

function ProductDetailBreadcrumbsComponent() {
  return (
    <ProductPageBreadcrumbs currentLabelKey="admin.products.detail.breadcrumbCurrent" />
  );
}

export const ProductDetailBreadcrumbs = memo(ProductDetailBreadcrumbsComponent);
