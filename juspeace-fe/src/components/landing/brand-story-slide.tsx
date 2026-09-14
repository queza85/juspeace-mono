import Image from 'next/image';

import {
  brandStoryPeekCount,
  listBrandStorySlides,
  type BrandStorySlideItem,
} from '@/lib/api/brand-story';
import { getTranslator } from '@/lib/i18n/server';

const SLIDE_ASSETS = {
  paperclip: '/papper_click.png',
  koreanHandwriting: '/brand-story/korean-handwriting.png',
  pinkPoster: '/gd-pick-photo.jpg',
  besidePink: '/gd-image-beside-pink.jpg',
  signature: '/brand-story/signature.png',
  loveTogether: '/brand-story/love-together.png',
  changeTogether: '/story/love_together.png',
  arrowLeft: '/brand-story/arrow-left.svg',
  arrowRight: '/brand-story/arrow-right.svg',
} as const;

const PEEK_X_REM = 1.15;
const PEEK_Y_REM = 1;

type Translate = (key: string) => string;

export async function BrandStorySlide() {
  const { t } = await getTranslator();
  const slides = await listBrandStorySlides();
  const currentSlide = slides[0];
  const peekCount = brandStoryPeekCount(slides.length);
  const peekLayers = Array.from(
    { length: peekCount },
    (_, index) => peekCount - index,
  );

  return (
    <div className="jp-brand-story-slide-stack">
      <div
        className="jp-brand-story-slide-folder"
        style={{ paddingTop: `${peekCount * PEEK_Y_REM}rem` }}
      >
        {peekLayers.map((depth) => (
          <div
            key={`peek-${depth}`}
            aria-hidden
            className="jp-brand-story-slide-layer"
            style={{
              backgroundColor: '#e6e6e6',
              top: `${(peekCount - depth) * PEEK_Y_REM}rem`,
              right: `${depth * PEEK_X_REM}rem`,
              bottom: 0,
              left: `${depth * PEEK_X_REM}rem`,
              zIndex: peekCount - depth,
            }}
          />
        ))}

        <Image
          src={SLIDE_ASSETS.paperclip}
          alt=""
          width={828}
          height={1158}
          aria-hidden
          className="jp-brand-story-slide-paperclip"
        />

        <div className="jp-brand-story-slide-paper">
          <BrandStorySlideVisual slide={currentSlide} t={t} />

          <div className="jp-brand-story-slide-copy-wrap">
            <BrandStorySlideCopy slide={currentSlide} t={t} />

            <div className="jp-brand-story-slide-nav">
              <p className="jp-brand-story-slide-nav-label">
                [ {t('landing.brandStory.nextStory')} ]
              </p>
              <div
                className="jp-brand-story-slide-nav-arrows"
                aria-label={t('landing.brandStory.slideNavLabel')}
              >
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  aria-label={t('landing.brandStory.prevStoryAria')}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={SLIDE_ASSETS.arrowLeft}
                    alt=""
                    width={24}
                    height={24}
                    aria-hidden
                  />
                </button>
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  aria-label={t('landing.brandStory.nextStoryAria')}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={SLIDE_ASSETS.arrowRight}
                    alt=""
                    width={24}
                    height={24}
                    aria-hidden
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandStorySlideVisual({
  slide,
  t,
}: {
  slide: BrandStorySlideItem | undefined;
  t: Translate;
}) {
  if (slide?.id === 'change-together') {
    return (
      <div className="jp-brand-story-slide-visual">
        <div className="jp-brand-story-slide-korean">
          <Image
            src={SLIDE_ASSETS.koreanHandwriting}
            alt={t('landing.brandStory.slideKoreanTextAlt')}
            width={1171}
            height={606}
            className="jp-brand-story-slide-korean-img"
          />
        </div>
        <Image
          src={SLIDE_ASSETS.loveTogether}
          alt={t('landing.brandStory.slideLoveTogetherAlt')}
          width={1238}
          height={1550}
          className="jp-brand-story-slide-photo-left jp-brand-story-slide-love"
        />
        <Image
          src={SLIDE_ASSETS.changeTogether}
          alt={t('landing.brandStory.slideChangeTogetherAlt')}
          width={1240}
          height={1544}
          className="jp-brand-story-slide-photo-right jp-brand-story-slide-change"
        />
        <div className="jp-brand-story-slide-sign">
          <Image
            src={SLIDE_ASSETS.signature}
            alt={t('landing.brandStory.slideSignatureAlt')}
            width={736}
            height={1308}
            className="jp-brand-story-slide-sign-img"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="jp-brand-story-slide-visual jp-brand-story-slide-visual--origin">
      <div className="jp-brand-story-slide-korean">
        <Image
          src={SLIDE_ASSETS.koreanHandwriting}
          alt={t('landing.brandStory.slideKoreanTextAlt')}
          width={1171}
          height={606}
          className="jp-brand-story-slide-korean-img"
        />
      </div>
      <Image
        src={SLIDE_ASSETS.pinkPoster}
        alt={t('landing.brandStory.slidePinkPosterAlt')}
        width={620}
        height={875}
        className="jp-brand-story-slide-photo-left jp-brand-story-slide-pink h-auto"
      />
      <Image
        src={SLIDE_ASSETS.besidePink}
        alt={t('landing.brandStory.slidePortraitAlt')}
        width={1200}
        height={1511}
        className="jp-brand-story-slide-photo-right jp-brand-story-slide-beside h-auto"
      />
      <div className="jp-brand-story-slide-sign">
        <Image
          src={SLIDE_ASSETS.signature}
          alt={t('landing.brandStory.slideSignatureAlt')}
          width={736}
          height={1308}
          className="jp-brand-story-slide-sign-img"
        />
      </div>
    </div>
  );
}

function BrandStorySlideCopy({
  slide,
  t,
}: {
  slide: BrandStorySlideItem | undefined;
  t: Translate;
}) {
  if (slide?.id === 'change-together') {
    return (
      <div className="jp-brand-story-slide-copy">
        <p>
          <span className="jp-brand-story-slide-copy-line">
            {t('landing.brandStory.slideParagraph1Line1')}
          </span>
          <span className="jp-brand-story-slide-copy-line">
            {t('landing.brandStory.slideParagraph1Line2')}
          </span>
          <span className="jp-brand-story-slide-copy-line">
            {t('landing.brandStory.slideParagraph1Lead')}
            <em>{t('landing.brandStory.slideParagraph1Emphasis')}</em>
          </span>
        </p>
        <p>
          <span className="jp-brand-story-slide-copy-line">
            {t('landing.brandStory.slideParagraph2Line1')}
          </span>
          <span className="jp-brand-story-slide-copy-line">
            {t('landing.brandStory.slideParagraph2Lead')}
            <em>{t('landing.brandStory.slideParagraph2Emphasis')}</em>
          </span>
          <span className="jp-brand-story-slide-copy-line">
            {t('landing.brandStory.slideParagraph2Tail')}
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="jp-brand-story-slide-copy">
      <p>
        <span className="jp-brand-story-slide-copy-line">
          {t('landing.brandStory.slide1Paragraph1Line1')}
        </span>
        <span className="jp-brand-story-slide-copy-line">
          {t('landing.brandStory.slide1Paragraph1Line2')}
        </span>
        <span className="jp-brand-story-slide-copy-line">
          {t('landing.brandStory.slide1Paragraph1Line3')}
        </span>
      </p>
      <p>
        <span className="jp-brand-story-slide-copy-line">
          {t('landing.brandStory.slide1Paragraph2Lead')}
          <em>{t('landing.brandStory.slide1Paragraph2Emphasis')}</em>
          {t('landing.brandStory.slide1Paragraph2Tail')}
        </span>
        <span className="jp-brand-story-slide-copy-line">
          {t('landing.brandStory.slide1Paragraph2Line2Lead')}
          <em>{t('landing.brandStory.slide1Paragraph2Line2Emphasis')}</em>
        </span>
      </p>
    </div>
  );
}
