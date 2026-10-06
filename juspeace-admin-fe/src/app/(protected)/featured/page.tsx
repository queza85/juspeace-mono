'use client';

import { SiteResourcePage } from '@/components/site/site-resource-page';
import { featuredResource } from '@/lib/site/resources';

export default function FeaturedAdminPage() {
  return <SiteResourcePage config={featuredResource} />;
}
