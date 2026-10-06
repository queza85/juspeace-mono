'use client';

import { SiteResourcePage } from '@/components/site/site-resource-page';
import { settingsResource } from '@/lib/site/resources';

export default function SettingsAdminPage() {
  return <SiteResourcePage config={settingsResource} />;
}
