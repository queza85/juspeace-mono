import { QaTestShell } from '@/components/qa-test/qa-test-shell';
import { getTranslator } from '@/lib/i18n/server';

export async function generateMetadata() {
  const { t } = await getTranslator();

  return {
    title: {
      default: t('qaTest.metaTitle'),
      template: `%s | ${t('common.brand')}`,
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function QaTestLayout({ children }: { children: React.ReactNode }) {
  return <QaTestShell>{children}</QaTestShell>;
}
