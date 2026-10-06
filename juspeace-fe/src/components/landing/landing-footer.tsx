import Image from 'next/image';
import Link from 'next/link';
import { InstagramIcon, YoutubeIcon } from '@/components/icons';
import { getTranslator } from '@/lib/i18n/server';

const FOUNDATION_LOGO = '/landing/intro.png';

const SOCIAL_LINKS = [
  { key: 'socialInstagram', Icon: InstagramIcon },
  { key: 'socialYoutube', Icon: YoutubeIcon },
] as const;

const PAGE_LINK_COLUMNS = [
  ['aboutCompany', 'aboutFoundation', 'customerSupport'],
  ['cancellationPolicy', 'donationNotice', 'contactUs'],
  ['privacyPolicy', 'shippingPolicy', 'terms'],
] as const;

type FooterPageKey = (typeof PAGE_LINK_COLUMNS)[number][number];

const PAGE_HREF: Partial<Record<FooterPageKey, string>> = {
  customerSupport: '/contact',
  contactUs: '/contact',
};

/**
 * Temporary footer trim. Set to `false` to show everything again.
 * When `true`, hides only:
 * - [ Pages ] bracket label (policy link text remains)
 * - About Company / About Foundation / Customer Support column
 * - Contact / business and Location blocks
 * - Copyright line and foundation logo in the bottom bar
 */
const FOOTER_TEMPORARILY_HIDE_EXTENDED_INFO = true;

const VISIBLE_PAGE_LINK_COLUMNS = FOOTER_TEMPORARILY_HIDE_EXTENDED_INFO
  ? PAGE_LINK_COLUMNS.slice(1)
  : PAGE_LINK_COLUMNS;

function FooterBracketLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`font-mono text-xs text-white/80 sm:text-sm ${className ?? ''}`}>
      [ {children} ]
    </p>
  );
}

function FooterPageLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block whitespace-nowrap font-sans text-sm leading-7 text-white transition-opacity hover:opacity-70 sm:text-[15px] sm:leading-8"
    >
      {label}
    </Link>
  );
}

export async function LandingFooter() {
  const { t } = await getTranslator();

  return (
    <footer className="bg-black text-white">
      <div className="mx-auto w-full max-w-[1920px] px-4 pt-24 pb-10 sm:px-6 lg:px-[75px] lg:pt-36 lg:pb-12 xl:px-[120px] xl:pt-40 xl:pb-14">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,18.5rem)_minmax(0,1fr)] lg:gap-x-16 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] xl:gap-x-20 2xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] 2xl:gap-x-28">
          {/* Left — newsletter + social pushed toward column bottom (Figma) */}
          <div className="flex max-w-[18.5rem] flex-col xl:max-w-[22rem] 2xl:max-w-[26rem]">
            <FooterBracketLabel>{t('landing.footer.newsletterLabel')}</FooterBracketLabel>
            <h2 className="mt-2 font-display text-[1.35rem] font-bold leading-[1.15] tracking-[-0.02em] xl:text-2xl 2xl:text-[1.75rem]">
              {t('landing.footer.newsletterHeadline')}
            </h2>

            <form
              className="mt-8 flex h-11 w-full items-stretch overflow-hidden rounded-full bg-[#383838] p-1 sm:mt-10 lg:mt-12 xl:h-[52px]"
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
                className="min-w-0 flex-1 bg-transparent px-5 font-mono text-sm text-white outline-none"
              />
              <button
                type="submit"
                className="flex shrink-0 items-center justify-center rounded-full bg-black px-6 font-mono text-sm text-white transition-opacity hover:opacity-90 sm:px-7"
              >
                {t('landing.footer.subscribe')}
              </button>
            </form>
            <p className="mt-6 font-mono text-xs text-white/70 sm:mt-8 sm:text-sm">
              <span>{t('landing.footer.newsletterHintLead')}</span>
              <span>{t('landing.footer.newsletterHintTail')}</span>
            </p>

            <div className="mt-10 flex items-center sm:mt-12 lg:mt-14">
              <span
                aria-hidden
                className="invisible shrink-0 font-mono text-xs sm:text-sm"
              >
                {t('landing.footer.newsletterHintLead')}
              </span>
              <div className="ml-3 flex items-center gap-8 sm:ml-4">
              {SOCIAL_LINKS.map(({ key, Icon }) => (
                <a
                  key={key}
                  href="#"
                  aria-label={t(`landing.footer.${key}`)}
                  className="text-white transition-opacity hover:opacity-70"
                >
                  <Icon size={32} className="h-7 w-7 sm:h-8 sm:w-8 xl:h-9 xl:w-9" />
                </a>
              ))}
              </div>
            </div>
          </div>

          {/* Right — pages, contact, location */}
          <div className="w-full lg:max-w-[40rem] lg:justify-self-end lg:-mr-16 xl:max-w-[46rem] xl:-mr-20 2xl:max-w-[52rem] 2xl:-mr-24">
            {!FOOTER_TEMPORARILY_HIDE_EXTENDED_INFO ? (
              <FooterBracketLabel>{t('landing.footer.pagesLabel')}</FooterBracketLabel>
            ) : null}

            <div
              className={`grid gap-x-6 gap-y-2 sm:gap-x-8 lg:gap-x-8 xl:gap-x-10 2xl:gap-x-14 ${
                FOOTER_TEMPORARILY_HIDE_EXTENDED_INFO ? 'sm:grid-cols-2' : 'mt-3 sm:grid-cols-3'
              }`}
            >
              {VISIBLE_PAGE_LINK_COLUMNS.map((column, columnIndex) => (
                <div key={columnIndex} className="space-y-2 sm:space-y-2.5">
                  {column.map((key) => (
                    <FooterPageLink
                      key={key}
                      href={PAGE_HREF[key] ?? '#'}
                      label={t(`landing.footer.${key}`)}
                    />
                  ))}
                </div>
              ))}
            </div>

            {!FOOTER_TEMPORARILY_HIDE_EXTENDED_INFO ? (
              <div className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-x-8 lg:mt-12 lg:gap-x-8 xl:gap-x-10 2xl:gap-x-14">
                <div>
                  <FooterBracketLabel className="whitespace-nowrap">
                    {t('landing.footer.contactLabel')}
                  </FooterBracketLabel>
                  <p className="mt-2 whitespace-nowrap font-sans text-sm leading-7 text-white/80 sm:text-[15px] sm:leading-8">
                    <a
                      href="mailto:love@juspeace.ai"
                      className="text-white transition-opacity hover:opacity-70"
                    >
                      {t('landing.footer.contactEmail')}
                    </a>
                    <br />
                    {t('landing.footer.businessInfo')}
                  </p>
                </div>
                <div className="sm:col-span-2 sm:pl-16 lg:pl-24 xl:pl-28">
                  <FooterBracketLabel>{t('landing.footer.locationLabel')}</FooterBracketLabel>
                  <p className="mt-2 max-w-[16rem] whitespace-pre-line font-sans text-sm leading-7 text-white/80 sm:max-w-[18rem] sm:text-[15px] sm:leading-8">
                    {t('landing.footer.location')}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div
          className={
            FOOTER_TEMPORARILY_HIDE_EXTENDED_INFO
              ? 'mt-14 flex justify-center font-mono text-xs text-white/80 sm:mt-16 sm:text-sm lg:mt-20'
              : 'mt-14 grid gap-6 font-mono text-xs text-white/80 sm:mt-16 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-8 sm:text-sm lg:mt-20'
          }
        >
          {!FOOTER_TEMPORARILY_HIDE_EXTENDED_INFO ? (
            <p className="sm:justify-self-start">{t('landing.footer.copyright')}</p>
          ) : null}
          <p
            className={
              FOOTER_TEMPORARILY_HIDE_EXTENDED_INFO
                ? 'text-center uppercase tracking-[0.08em]'
                : 'text-center uppercase tracking-[0.08em] sm:px-4'
            }
          >
            {t('landing.footer.tagline')}
          </p>
          {!FOOTER_TEMPORARILY_HIDE_EXTENDED_INFO ? (
            <div className="sm:justify-self-end">
              <Image
                src={FOUNDATION_LOGO}
                alt={t('landing.footer.foundation')}
                width={320}
                height={80}
                className="h-9 w-auto object-contain sm:h-10 lg:h-11"
              />
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
