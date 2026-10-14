import type { Metadata } from 'next';
import { getTranslator } from '@/lib/i18n/server';

export async function qaTestPageMetadata(titleKey: string): Promise<Metadata> {
  const { t } = await getTranslator();

  return {
    title: t(titleKey),
    robots: {
      index: false,
      follow: false,
    },
  };
}
