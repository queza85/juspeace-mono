import { t } from '@/lib/i18n';

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:px-6">
        <p className="font-medium text-foreground">{t('common.brand')}</p>
        <p>{t('common.tagline')}</p>
      </div>
    </footer>
  );
}
