import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { getTranslator } from '@/lib/i18n/server';

export default async function NotFound() {
  const { t } = await getTranslator();

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-start justify-center gap-4 px-6">
      <h1 className="text-3xl font-semibold">{t('common.notFound')}</h1>
      <p className="text-muted-foreground">{t('common.error')}</p>
      <Link href="/dashboard" className={buttonVariants()}>
        {t('admin.nav.dashboard')}
      </Link>
    </div>
  );
}
