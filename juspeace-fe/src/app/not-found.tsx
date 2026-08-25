import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { t } from '@/lib/i18n';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-6xl flex-col items-start justify-center gap-4 px-4 sm:px-6">
      <h1 className="text-3xl font-semibold">{t('common.error')}</h1>
      <p className="text-muted-foreground">{t('products.empty')}</p>
      <Link href="/" className={buttonVariants()}>
        {t('common.retry')}
      </Link>
    </div>
  );
}
