'use client';

import { SiteResourcePage } from '@/components/site/site-resource-page';
import { categoriesResource } from '@/lib/site/resources';

export default function CategoriesAdminPage() {
  return <SiteResourcePage config={categoriesResource} />;
}
