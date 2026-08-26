import Link from 'next/link';
import { getTranslator } from '@/lib/i18n/server';

const PAGE_LINKS = [
  { key: 'aboutCompany', href: '#' },
  { key: 'aboutFoundation', href: '#' },
  { key: 'customerSupport', href: '#' },
  { key: 'cancellationPolicy', href: '#' },
  { key: 'donationNotice', href: '#' },
  { key: 'privacyPolicy', href: '#' },
  { key: 'shippingPolicy', href: '#' },
  { key: 'terms', href: '#' },
] as const;

export async function LandingFooter() {
  const { t } = await getTranslator();

  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-[1920px] px-4 py-16 sm:px-6 lg:px-[120px] lg:py-20">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] lg:gap-20">
          <div>
            <div className="mb-10 flex size-[65px] items-center justify-center rounded-full bg-jp-light-gray font-mono text-xs text-black">
              JP
            </div>
            <p className="font-mono text-lg text-white/80">
              [ {t('landing.footer.newsletterLabel')} ]
            </p>
            <h2 className="mt-2 max-w-[534px] font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-tight tracking-tight">
              {t('landing.footer.newsletterHeadline')}
            </h2>

            <form
              className="mt-8 flex max-w-[577px] items-center gap-2 rounded-full bg-neutral-800 p-2"
              action="#"
              method="post"
            >
              <label className="sr-only" htmlFor="landing-newsletter-email">
                {t('landing.footer.emailPlaceholder')}
              </label>
              <input
                id="landing-newsletter-email"
                type="email"
                name="email"
                placeholder={t('landing.footer.emailPlaceholder')}
                className="min-w-0 flex-1 bg-transparent px-4 py-3 font-mono text-base text-white outline-none placeholder:text-white/50"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-black px-6 py-3 font-mono text-base text-white"
              >
                {t('landing.footer.subscribe')}
              </button>
            </form>
            <p className="mt-4 font-mono text-sm text-white/70">
              {t('landing.footer.newsletterHint')}
            </p>

            <div className="mt-10 flex gap-6">
              {[
                t('landing.footer.socialX'),
                t('landing.footer.socialInstagram'),
                t('landing.footer.socialYoutube'),
              ].map((label) => (
                <span
                  key={label}
                  className="flex size-12 items-center justify-center rounded-full border border-white/30 font-mono text-xs"
                  aria-label={label}
                >
                  {label.slice(0, 1)}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-12">
            <div>
              <p className="font-mono text-lg text-white/80">
                [ {t('landing.footer.pagesLabel')} ]
              </p>
              <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                {PAGE_LINKS.map((link) => (
                  <Link
                    key={link.key}
                    href={link.href}
                    className="font-sans text-base text-white/90 transition-opacity hover:opacity-70"
                  >
                    {t(`landing.footer.${link.key}`)}
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid gap-10 sm:grid-cols-2">
              <div>
                <p className="font-mono text-lg text-white/80">
                  [ {t('landing.footer.contactLabel')} ]
                </p>
                <p className="mt-3 font-mono text-sm leading-7 text-white/80">
                  {t('landing.footer.contactEmail')}
                  <br />
                  {t('landing.footer.businessInfo')}
                </p>
              </div>
              <div>
                <p className="font-mono text-lg text-white/80">
                  [ {t('landing.footer.locationLabel')} ]
                </p>
                <p className="mt-3 font-mono text-sm leading-7 text-white/80">
                  {t('landing.footer.location')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/20 pt-8 font-mono text-sm text-white/80 sm:flex-row sm:items-center sm:justify-between">
          <p>{t('landing.footer.copyright')}</p>
          <p className="text-center">{t('landing.footer.tagline')}</p>
          <div className="flex items-center gap-3 sm:justify-end">
            <span className="flex size-10 items-center justify-center rounded-full bg-jp-light-gray font-mono text-[10px] text-black">
              JP
            </span>
            <span>{t('landing.footer.foundation')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
