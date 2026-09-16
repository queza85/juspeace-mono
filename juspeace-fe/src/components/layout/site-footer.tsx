import { getTranslator } from '@/lib/i18n/server';

export async function SiteFooter() {
  const { t } = await getTranslator();

  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:px-6">
        <p className="font-medium text-foreground">{t('common.brand')}</p>
        <p>{t('common.tagline')}</p>
      </div>
    </footer>
  );
}
