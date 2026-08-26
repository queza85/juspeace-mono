import { BracketLabel } from '@/components/landing/bracket-label';
import { MediaPlaceholder } from '@/components/landing/media-placeholder';
import { SectionHeading } from '@/components/landing/section-heading';
import { SectionLabel } from '@/components/landing/section-label';
import { SectionShell } from '@/components/landing/section-shell';
import { getTranslator } from '@/lib/i18n/server';

const CATEGORIES = [
  'productOnly',
  'lifestyle',
  'closeUp',
  'packaging',
  'mobileSwipe',
  'desktopThumbnails',
] as const;

function GalleryStack({ label }: { label: string }) {
  return (
    <div className="relative mx-auto h-[260px] w-[200px] sm:h-[291px] sm:w-[226px]">
      <div className="absolute left-0 top-4 w-[202px] -rotate-[16.59deg]">
        <MediaPlaceholder
          className="rounded-[21px] border-2 border-jp-light-gray"
          aspectRatio="202 / 261"
          label={label}
        />
      </div>
      <div className="absolute right-0 top-4 w-[202px] rotate-[16.59deg]">
        <MediaPlaceholder
          className="rounded-[21px] border-2 border-jp-light-gray"
          aspectRatio="202 / 261"
          label={label}
        />
      </div>
      <div className="absolute left-1/2 top-0 z-10 w-[226px] -translate-x-1/2">
        <MediaPlaceholder
          className="rounded-[21px] border-2 border-jp-light-gray"
          aspectRatio="226 / 291"
          label={label}
        />
      </div>
    </div>
  );
}

export async function GallerySection() {
  const { t } = await getTranslator();

  return (
    <SectionShell id="gallery" className="bg-white py-16 lg:py-28">
      <div className="mx-auto mb-16 flex max-w-[1116px] flex-col items-center text-center lg:mb-24">
        <SectionLabel>{t('landing.gallery.label')}</SectionLabel>
        <SectionHeading className="mt-4">
          <span className="block">{t('landing.gallery.headingLine1')}</span>
          <span className="block">{t('landing.gallery.headingLine2')}</span>
        </SectionHeading>
      </div>

      <div className="hidden gap-x-10 gap-y-20 md:grid md:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((key) => (
          <figure key={key} className="flex flex-col items-center gap-6">
            <GalleryStack label={t(`landing.gallery.categories.${key}`)} />
            <div className="flex items-center gap-3">
              <BracketLabel>{t(`landing.gallery.categories.${key}`)}</BracketLabel>
              <span className="inline-flex h-8 min-w-[63px] items-center justify-center rounded-full bg-jp-light-gray px-3 font-mono text-lg">
                {t('landing.gallery.count')}
              </span>
            </div>
          </figure>
        ))}
      </div>

      <div className="flex snap-x snap-mandatory gap-8 overflow-x-auto pb-4 md:hidden">
        {CATEGORIES.map((key) => (
          <figure
            key={key}
            className="flex w-[240px] shrink-0 snap-center flex-col items-center gap-4"
          >
            <GalleryStack label={t(`landing.gallery.categories.${key}`)} />
            <div className="flex items-center gap-2">
              <BracketLabel className="text-sm sm:text-lg">
                {t(`landing.gallery.categories.${key}`)}
              </BracketLabel>
              <span className="inline-flex h-8 min-w-[48px] items-center justify-center rounded-full bg-jp-light-gray px-2 font-mono text-sm">
                {t('landing.gallery.count')}
              </span>
            </div>
          </figure>
        ))}
      </div>
    </SectionShell>
  );
}
