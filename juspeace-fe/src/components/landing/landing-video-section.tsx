import { Play } from 'lucide-react';

import { MediaPlaceholder } from '@/components/landing/media-placeholder';
import { SectionShell } from '@/components/landing/section-shell';
import { getTranslator } from '@/lib/i18n/server';

function landingVideoUrl(): string {
  return '';
}

export async function LandingVideoSection() {
  if (!landingVideoUrl()) {
    return null;
  }

  const { t } = await getTranslator();

  return (
    <SectionShell fullWidth className="bg-black">
      <div className="relative mx-auto flex min-h-[520px] w-full max-w-[1920px] items-center justify-center lg:min-h-[1044px]">
        <MediaPlaceholder
          className="absolute inset-0 h-full rounded-none bg-neutral-900"
          aspectRatio="auto"
          label={t('landing.video.mediaLabel')}
        />
        <button
          type="button"
          className="relative z-10 flex size-20 items-center justify-center rounded-full border border-white/40 bg-black/30 text-white backdrop-blur-sm"
          aria-label={t('landing.video.playLabel')}
        >
          <Play className="size-8 fill-white" aria-hidden />
        </button>
      </div>
    </SectionShell>
  );
}
