'use client';

import { SiteResourcePage } from '@/components/site/site-resource-page';
import { reviewsResource } from '@/lib/site/resources';

export default function ReviewsAdminPage() {
  return <SiteResourcePage config={reviewsResource} />;
}
