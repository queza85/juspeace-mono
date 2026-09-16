'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { useLocale, useT } from '@/lib/i18n/locale-context';
import { cn } from '@/lib/utils';
import { useCartTotalItems } from '@/stores/cart-store';

const HEADER_LOGO = '/header/juspeace_header.png';
const FLAG_EN = '/header/english.png';
const FLAG_KO = '/header/korea.png';

const NAV_LINKS = [
  { href: '/#story', key: 'landing.nav.story' },
  { href: '/#collection', key: 'landing.nav.collection' },
  { href: '/#donation', key: 'landing.nav.donation' },
  { href: '/#faq', key: 'landing.nav.faq' },
  { href: '/account', key: 'landing.nav.trackOrder' },
] as const;

function LocaleFlagButton({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();
  const nextLocale: Locale = locale === 'en' ? 'ko' : 'en';
  const flagSrc = locale === 'en' ? FLAG_EN : FLAG_KO;

  return (
    <button
      type="button"
      onClick={() => setLocale(nextLocale)}
      className={cn(
        'flex items-center justify-center transition-opacity hover:opacity-80',
        className,
      )}
      aria-label={`${t('language.label')}: ${t(`language.${locale}`)}`}
    >
      <Image
        src={flagSrc}
        alt={t(`language.${locale}`)}
        width={24}
        height={16}
        className="h-4 w-6 object-cover"
      />
    </button>
  );
}

/** Shared header row height for logo / nav / bag — one optical line. */
const CONTROL_H = 'h-10';

function HeaderUtilityCard({ light }: { light?: boolean }) {
  const t = useT();
  const totalItems = useCartTotalItems();

  return (
    <div className={cn('flex items-stretch', CONTROL_H)}>
      <Link
        href="/cart"
        className={cn(
          'jp-utility-link box-border flex items-center gap-1.5 border border-r-0 px-3.5 font-serif text-[13px] leading-none tracking-[0.04em]',
          CONTROL_H,
          light
            ? 'border-black/20 text-black/70 hover:border-black hover:bg-black hover:text-white'
            : 'border-jp-border-hero text-white/70',
        )}
      >
        <ShoppingBag className="size-3.5 shrink-0" aria-hidden />
        <span className="whitespace-nowrap">
          {t('landing.nav.bag', { count: totalItems })}
        </span>
      </Link>

      <LocaleFlagButton
        className={cn(
          'box-border w-11 shrink-0 border px-2.5',
          CONTROL_H,
          light ? 'border-black/20' : 'border-jp-border-hero',
        )}
      />
    </div>
  );
}

export interface LandingHeaderProps {
  /** Hero overlay (dark bg) vs inner pages (white bg, dark text). */
  variant?: 'hero' | 'light';
}

export function LandingHeader({ variant = 'hero' }: LandingHeaderProps) {
  const t = useT();
  const totalItems = useCartTotalItems();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isLight = variant === 'light';

  useEffect(() => {
    if (isLight) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isLight]);

  return (
    <header
      className={cn(
        'inset-x-0 top-0 z-50',
        isLight
          ? 'relative bg-white text-black'
          : cn(
              'fixed transition-colors duration-300',
              scrolled
                ? 'border-b border-white/10 bg-black/90 text-white backdrop-blur'
                : 'bg-transparent text-white',
            ),
      )}
    >
      {/* Single grid row — logo | nav | utilities, shared vertical center */}
      <div className="relative mx-auto grid h-20 max-w-[1920px] grid-cols-[auto_1fr_auto] items-center gap-4 px-5 sm:h-[92px] sm:gap-6 sm:px-8 lg:px-12 xl:px-[75px] [@media(max-height:1000px)]:h-[72px]">
        <Link
          href="/"
          className="relative block size-10 shrink-0 overflow-hidden rounded-full transition-transform duration-300 ease-out hover:scale-105 sm:size-11 [@media(max-height:1000px)]:size-10"
          aria-label={t('common.brand')}
        >
          <Image
            src={HEADER_LOGO}
            alt={t('common.brand')}
            width={65}
            height={64}
            className="size-full object-cover"
            priority
          />
        </Link>

        <nav className="col-start-2 hidden items-center justify-center gap-8 font-serif text-[14px] leading-none tracking-[1.6px] lg:flex xl:gap-12 xl:text-[15px] xl:tracking-[1.8px] [@media(max-height:1000px)]:xl:gap-10 [@media(max-height:1000px)]:xl:text-[14px]">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className="jp-nav-link shrink-0"
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="col-start-3 flex items-center justify-end gap-2">
          <div className="hidden sm:block">
            <HeaderUtilityCard light={isLight} />
          </div>

          <div className={cn('flex sm:hidden', CONTROL_H)}>
            <Link
              href="/cart"
              className={cn(
                'jp-utility-link flex items-center gap-1 border border-r-0 px-2.5 font-serif text-[12px]',
                CONTROL_H,
                isLight
                  ? 'border-black/20 text-black/70'
                  : 'border-jp-border-hero text-white/70',
              )}
            >
              <ShoppingBag className="size-3.5" aria-hidden />
              <span>({totalItems})</span>
            </Link>
            <LocaleFlagButton
              className={cn(
                'border px-2.5',
                CONTROL_H,
                isLight ? 'border-black/20' : 'border-jp-border-hero',
              )}
            />
          </div>

          <button
            type="button"
            className={cn(
              'flex items-center justify-center border lg:hidden',
              'size-10',
              isLight ? 'border-black/20' : 'border-jp-border-hero',
            )}
            aria-label={
              menuOpen ? t('landing.nav.closeMenu') : t('landing.nav.openMenu')
            }
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div
          className={cn(
            'border-t px-5 py-4 lg:hidden',
            isLight
              ? 'border-black/10 bg-white text-black'
              : 'border-white/20 bg-black/95 text-white',
          )}
        >
          <nav className="flex flex-col gap-2.5 font-serif text-[14px] tracking-[1.8px]">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className="jp-nav-link w-fit py-1"
                onClick={() => setMenuOpen(false)}
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
