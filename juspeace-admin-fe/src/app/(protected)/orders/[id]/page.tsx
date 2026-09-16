'use client';

import { memo, use } from 'react';
import { OrderDetailPage } from '@/components/orders/order-detail-page';

interface OrderDetailRouteProps {
  params: Promise<{ id: string }>;
}

function OrderDetailRoute({ params }: OrderDetailRouteProps) {
  const { id } = use(params);

  return <OrderDetailPage id={id} />;
}

export default memo(OrderDetailRoute);
