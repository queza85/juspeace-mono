'use client';

import { SiteResourcePage } from '@/components/site/site-resource-page';
import { customersResource } from '@/lib/site/resources';

export default function CustomersAdminPage() {
  return <SiteResourcePage config={customersResource} />;
}
