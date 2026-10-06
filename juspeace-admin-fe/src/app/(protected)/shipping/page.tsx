'use client';

import { SiteResourcePage } from '@/components/site/site-resource-page';
import { shippingResource } from '@/lib/site/resources';

export default function ShippingAdminPage() {
  return <SiteResourcePage config={shippingResource} />;
}
