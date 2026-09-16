import Image from 'next/image';

import { SectionLabel } from '@/components/landing/section-label';
import { SectionShell } from '@/components/landing/section-shell';
import { getTranslator } from '@/lib/i18n/server';
import { cn } from '@/lib/utils';

const COLLECTION_LOGO = '/header/juspeace_header.png';
const PHONE_COLLAGE = '/product-verification/product-verification-one.png';
const TORN_PAPER = '/product-verification/product-verification-two.png';
const DAISY_ICON = '/brand/gd-flower.png';
const PAPERCLIP = '/brand/papper_click.png';

const PHONE_WIDTH = 1080;
const PHONE_COLLAGE_HEIGHT = 1197;
const TORN_PAPER_HEIGHT = 1350;

function StickyNote({
  lead,
  quote,
  side,
}: {
  lead: string;
  quote: string;
  side: 'left' | 'right';
}) {
  return (
    <div
      className={cn(
        'jp-product-verification-note',
        side === 'left'
          ? 'jp-product-verification-note--left'
          : 'jp-product-verification-note--right',
      )}
    >
      <Image
        src={PAPERCLIP}
        alt=""
        width={828}
        height={1158}
        aria-hidden
        className="jp-product-verification-note-clip"
      />
      <div className="jp-product-verification-note-card">
        <p className="jp-product-verification-note-lead">{lead}</p>
        <p className="jp-product-verification-note-quote">&ldquo;{quote}&rdquo;</p>
      </div>
    </div>
  );
}

export async function ProductVerificationSection() {
  const { t } = await getTranslator();

  return (
    <>
      <SectionShell
        id="product-verification"
        className="bg-white pt-10 pb-0 lg:pt-14"
      >
        <div
          data-scroll-reveal
          className="jp-product-verification-intro mx-auto flex max-w-[900px] flex-col items-center text-center"
        >
          <p className="font-display text-[clamp(1.75rem,4.5vw,3.75rem)] font-bold leading-[1.12] tracking-[-0.02em] text-black">
            {t('landing.productVerification.introLine1')}
          </p>
          <p className="font-display text-[clamp(1.75rem,4.5vw,3.75rem)] font-normal italic leading-[1.12] tracking-[-0.02em] text-black">
            {t('landing.productVerification.introBrand')}
          </p>
          <Image
            src={COLLECTION_LOGO}
            alt="JUSPEACE"
            width={48}
            height={48}
            className="jp-product-verification-intro-logo h-10 w-10 object-contain sm:h-12 sm:w-12"
          />
        </div>
      </SectionShell>

      <SectionShell fullWidth className="overflow-visible bg-white pt-0">
        <div data-scroll-reveal className="jp-product-verification-collage">
          <div className="jp-product-verification-intro-headlines mx-auto flex max-w-[900px] flex-col items-center px-4 text-center sm:px-6">
            <SectionLabel className="jp-product-verification-intro-label text-base sm:text-lg lg:text-xl">
              {t('landing.productVerification.label')}
            </SectionLabel>
            <p className="jp-product-verification-intro-headline font-display text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-[1.12] tracking-[-0.02em] text-black">
              {t('landing.productVerification.headlineLine1')}
            </p>
            <p className="mt-2 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-[1.12] tracking-[-0.02em] text-black">
              {t('landing.productVerification.headlineLine2')}
            </p>
          </div>
          <div className="jp-product-verification-stage">
            <div className="jp-product-verification-phone-layer">
              <div className="jp-product-verification-phone-crop">
                <Image
                  src={PHONE_COLLAGE}
                  alt={t('landing.productVerification.phoneAlt')}
                  width={PHONE_WIDTH}
                  height={PHONE_COLLAGE_HEIGHT}
                  sizes="100vw"
                  className="jp-product-verification-phone-img"
                  priority={false}
                />
              </div>
              <StickyNote
                lead={t('landing.productVerification.noteLeftLead')}
                quote={t('landing.productVerification.noteLeftQuote')}
                side="left"
              />
              <StickyNote
                lead={t('landing.productVerification.noteRightLead')}
                quote={t('landing.productVerification.noteRightQuote')}
                side="right"
              />
            </div>

            <div className="jp-product-verification-daisy-layer">
              <Image
                src={DAISY_ICON}
                alt={t('landing.productVerification.daisyAlt')}
                width={512}
                height={512}
                className="jp-product-verification-daisy"
              />
            </div>

            <div className="jp-product-verification-paper-layer">
              <div className="jp-product-verification-paper-frame">
                <Image
                  src={TORN_PAPER}
                  alt=""
                  width={PHONE_WIDTH}
                  height={TORN_PAPER_HEIGHT}
                  sizes="100vw"
                  className="jp-product-verification-paper-img"
                  aria-hidden
                />
                <div
                  role="group"
                  aria-label={t('landing.productVerification.paperAlt')}
                  className="jp-product-verification-paper-copy"
                >
                  <div className="jp-product-verification-paper-text">
                    <h3 className="jp-product-verification-paper-heading">
                      <span>{t('landing.productVerification.journeyHeadingLine1')}</span>
                      <span>{t('landing.productVerification.journeyHeadingLine2')}</span>
                    </h3>
                    <div className="jp-product-verification-paper-passage">
                      <p>{t('landing.productVerification.journeyBody1Line1')}</p>
                      <p>{t('landing.productVerification.journeyBody1Line2')}</p>
                    </div>
                    <div className="jp-product-verification-paper-passage">
                      <p>{t('landing.productVerification.journeyBody2Line1')}</p>
                      <p>{t('landing.productVerification.journeyBody2Line2')}</p>
                      <p>{t('landing.productVerification.journeyBody2Line3')}</p>
                    </div>
                  </div>
                  <button type="button" className="jp-product-verification-paper-cta">
                    {t('landing.productVerification.cta')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div data-scroll-reveal className="jp-product-verification-closing">
          <p className="jp-product-verification-closing-line jp-product-verification-closing-line--bold">
            {t('landing.productVerification.closingLine1')}
          </p>
          <p className="jp-product-verification-closing-line jp-product-verification-closing-line--italic">
            {t('landing.productVerification.closingLine2')}
          </p>
        </div>
      </SectionShell>
    </>
  );
}
