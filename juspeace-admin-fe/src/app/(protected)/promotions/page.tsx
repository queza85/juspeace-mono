'use client';

import { SiteResourcePage } from '@/components/site/site-resource-page';
import { promotionsResource } from '@/lib/site/resources';

export default function PromotionsAdminPage() {
  return <SiteResourcePage config={promotionsResource} />;
}
