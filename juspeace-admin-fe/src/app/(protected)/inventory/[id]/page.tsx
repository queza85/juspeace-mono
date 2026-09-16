'use client';

import { memo, use } from 'react';
import { InventoryDetailPage } from '@/components/inventory/inventory-detail-page';

interface InventoryDetailRouteProps {
  params: Promise<{ id: string }>;
}

function InventoryDetailRoute({ params }: InventoryDetailRouteProps) {
  const { id } = use(params);

  return <InventoryDetailPage id={id} />;
}

export default memo(InventoryDetailRoute);
