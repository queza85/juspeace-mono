'use client';

import { SiteResourcePage } from '@/components/site/site-resource-page';
import { newsletterResource } from '@/lib/site/resources';

export default function NewsletterAdminPage() {
  return <SiteResourcePage config={newsletterResource} />;
}
