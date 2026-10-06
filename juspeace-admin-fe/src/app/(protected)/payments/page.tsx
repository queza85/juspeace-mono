'use client';

import { SiteResourcePage } from '@/components/site/site-resource-page';
import { paymentsResource } from '@/lib/site/resources';

export default function PaymentsAdminPage() {
  return <SiteResourcePage config={paymentsResource} />;
}
