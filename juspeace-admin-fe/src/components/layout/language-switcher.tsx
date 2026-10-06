'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ChevronDownIcon } from '@/components/icons';
import { locales, type Locale } from '@/lib/i18n';
import { useLocale } from '@/lib/i18n/locale-context';
import { cn } from '@/lib/utils';

const localeFlagSrc: Record<Locale, string> = {
  en: '/header/english.png',
  ko: '/header/korea.png',
};

const localeLabel: Record<Locale, string> = {
  en: 'EN',
  ko: 'KO',
};

type LanguageSwitcherProps = {
  variant?: 'default' | 'header';
};

export function LanguageSwitcher({ variant = 'default' }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  if (variant === 'header') {
    return (
      <div ref={rootRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1.5 text-admin-header-foreground hover:bg-white/10"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={t('language.label')}
        >
          <Image
            src={localeFlagSrc[locale]}
            alt=""
            width={20}
            height={20}
            className="size-5 rounded-sm object-cover"
          />
          <span className="text-sm font-semibold">{localeLabel[locale]}</span>
          <ChevronDownIcon size={14} className="opacity-90" />
        </button>

        {open ? (
          <ul
            role="listbox"
            aria-label={t('language.label')}
            className="absolute top-full right-0 z-50 mt-2 min-w-36 overflow-hidden rounded-lg border border-border bg-card py-1 text-card-foreground shadow-lg"
          >
            {locales.map((code) => {
              const active = locale === code;
              return (
                <li key={code} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => {
                      setLocale(code);
                      setOpen(false);
                    }}
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-muted',
                      active && 'bg-muted/60 font-medium',
                    )}
                  >
                    <Image
                      src={localeFlagSrc[code]}
                      alt=""
                      width={20}
                      height={20}
                      className="size-5 rounded-sm object-cover"
                    />
                    <span>{localeLabel[code]}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {t(`language.${code}`)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    );
  }

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
            onClick={() => setLocale(code)}
            className={cn(
              'min-w-9 cursor-pointer rounded-md px-2 py-1 text-xs font-medium transition-colors',
              active
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white',
            )}
            aria-pressed={active}
          >
            {localeLabel[code]}
          </button>
        );
      })}
    </div>
  );
}
