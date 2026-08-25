'use client';

import { locales, type Locale } from '@/lib/i18n';
import { useLocale } from '@/lib/i18n/locale-context';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      className="inline-flex items-center gap-1"
      role="group"
      aria-label={t('language.label')}
    >
      {locales.map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code as Locale)}
            className={cn(
              buttonVariants({
                variant: active ? 'secondary' : 'ghost',
                size: 'sm',
              }),
              'min-w-9 px-2',
            )}
            aria-pressed={active}
          >
            {t(`language.${code}`)}
          </button>
        );
      })}
    </div>
  );
}
