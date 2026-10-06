'use client';

import { SiteResourcePage } from '@/components/site/site-resource-page';
import { contentResource } from '@/lib/site/resources';

export default function ContentAdminPage() {
  return <SiteResourcePage config={contentResource} />;
}
