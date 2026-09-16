import Image from 'next/image';
import Link from 'next/link';
import { InstagramIcon, XIcon, YoutubeIcon } from '@/components/icons';
import { getTranslator } from '@/lib/i18n/server';

const FOOTER_LOGO = '/brand/footer_logo.png';
const FOUNDATION_LOGO = '/landing/intro.png';

const SOCIAL_LINKS = [
  { key: 'socialX', Icon: XIcon },
  { key: 'socialInstagram', Icon: InstagramIcon },
  { key: 'socialYoutube', Icon: YoutubeIcon },
] as const;

const PAGE_LINK_COLUMNS = [
  ['aboutCompany', 'aboutFoundation', 'customerSupport'],
  ['cancellationPolicy', 'donationNotice'],
  ['privacyPolicy', 'shippingPolicy', 'terms'],
] as const;

function FooterBracketLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs text-white/80 sm:text-sm">[ {children} ]</p>
  );
}

function FooterPageLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block font-sans text-sm leading-6 text-white/90 transition-opacity hover:opacity-70 sm:text-[15px] sm:leading-7"
    >
      {label}
    </Link>
  );
}

export async function LandingFooter() {
  const { t } = await getTranslator();

  return (
    <footer className="bg-black text-white">
      <div className="mx-auto w-full max-w-[1920px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16 xl:px-14">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-20 xl:gap-28">
          {/* Left — newsletter */}
          <div className="flex flex-col">
            <Image
              src={FOOTER_LOGO}
              alt="JUSPEACE"
              width={65}
              height={64}
              className="mb-6 h-[52px] w-[52px] rounded-full object-cover sm:mb-8 sm:h-[64px] sm:w-[64px]"
            />

            <FooterBracketLabel>{t('landing.footer.newsletterLabel')}</FooterBracketLabel>
            <h2 className="mt-2 max-w-[480px] font-display text-[clamp(1.35rem,2.2vw,1.875rem)] font-bold leading-tight tracking-tight">
              {t('landing.footer.newsletterHeadline')}
            </h2>

            <form
              className="mt-6 flex max-w-[540px] items-center gap-1.5 rounded-full bg-neutral-800 p-1.5 sm:mt-7"
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
                className="min-w-0 flex-1 bg-transparent px-4 py-2.5 font-mono text-sm text-white outline-none placeholder:text-white/50"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-black px-5 py-2.5 font-mono text-sm text-white"
              >
                {t('landing.footer.subscribe')}
              </button>
            </form>
            <p className="mt-3 font-mono text-xs text-white/70 sm:text-sm">
              {t('landing.footer.newsletterHint')}
            </p>

            <div className="mt-8 flex items-center gap-5 sm:mt-10">
              {SOCIAL_LINKS.map(({ key, Icon }) => (
                <a
                  key={key}
                  href="#"
                  aria-label={t(`landing.footer.${key}`)}
                  className="text-white transition-opacity hover:opacity-70"
                >
                  <Icon size={20} className="sm:h-[22px] sm:w-[22px]" />
                </a>
              ))}
            </div>
          </div>

          {/* Right — pages, contact, location */}
          <div>
            <FooterBracketLabel>{t('landing.footer.pagesLabel')}</FooterBracketLabel>

            <div className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-3 sm:gap-x-10 lg:gap-x-14 xl:gap-x-20">
              {PAGE_LINK_COLUMNS.map((column, columnIndex) => (
                <div key={columnIndex} className="space-y-2 sm:space-y-2.5">
                  {column.map((key) => (
                    <FooterPageLink
                      key={key}
                      href="#"
                      label={t(`landing.footer.${key}`)}
                    />
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-8 sm:grid-cols-3 sm:gap-x-10 lg:mt-10 lg:gap-x-14 xl:gap-x-20">
              <div className="sm:col-span-2">
                <FooterBracketLabel>{t('landing.footer.contactLabel')}</FooterBracketLabel>
                <p className="mt-2 font-sans text-sm leading-6 text-white/80 sm:text-[15px] sm:leading-7">
                  {t('landing.footer.contactEmail')}
                  <br />
                  {t('landing.footer.businessInfo')}
                </p>
              </div>
              <div>
                <FooterBracketLabel>{t('landing.footer.locationLabel')}</FooterBracketLabel>
                <p className="mt-2 font-sans text-sm leading-6 text-white/80 sm:text-[15px] sm:leading-7">
                  {t('landing.footer.location')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-0 border-t border-white/20" />

      <div className="mx-auto w-full max-w-[1920px] px-4 py-6 sm:px-6 lg:px-10 xl:px-14">
        <div className="grid gap-4 font-mono text-xs text-white/80 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-6 sm:text-sm">
          <p className="sm:justify-self-start">{t('landing.footer.copyright')}</p>
          <p className="text-center sm:px-4">{t('landing.footer.tagline')}</p>
          <div className="sm:justify-self-end">
            <Image
              src={FOUNDATION_LOGO}
              alt={t('landing.footer.foundation')}
              width={320}
              height={80}
              className="h-7 w-auto object-contain sm:h-8"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
