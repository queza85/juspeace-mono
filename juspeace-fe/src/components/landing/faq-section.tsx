'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { SectionHeading } from '@/components/landing/section-heading';
import { SectionLabel } from '@/components/landing/section-label';
import { SectionShell } from '@/components/landing/section-shell';
import { useT } from '@/lib/i18n/locale-context';
import { cn } from '@/lib/utils';

const FAQ_LOGO = '/header/juspeace_header.png';
const FAQ_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export function FaqSection() {
  const t = useT();
  const [openId, setOpenId] = useState<number | null>(null);

  const left = FAQ_IDS.filter((_, index) => index % 2 === 0);
  const right = FAQ_IDS.filter((_, index) => index % 2 === 1);

  return (
    <SectionShell id="faq" className="bg-white pt-28 pb-28 sm:pt-36 sm:pb-36 lg:pt-48 lg:pb-48">
      <div
        data-scroll-reveal
        className="mx-auto mb-20 flex max-w-[1116px] flex-col items-center text-center sm:mb-24 lg:mb-28"
      >
        <div className="relative mb-2 size-20 shrink-0 overflow-hidden rounded-full sm:mb-3 sm:size-24 lg:mb-4 lg:size-28">
          <Image
            src={FAQ_LOGO}
            alt="JUSPEACE"
            width={112}
            height={112}
            className="size-full object-cover"
          />
        </div>
        <SectionLabel className="mt-14 text-base sm:mt-16 sm:text-lg lg:mt-20 lg:text-xl">
          {t('landing.faq.sectionLabel')}
        </SectionLabel>
        <SectionHeading className="mt-1 text-[clamp(2.75rem,6.5vw,5rem)] leading-[1.08] sm:mt-1.5 lg:mt-2">
          <span className="block">{t('landing.faq.headingLine1')}</span>
          <span className="block">{t('landing.faq.headingLine2')}</span>
        </SectionHeading>
      </div>

      <div className="mx-auto grid w-[92%] max-w-[1080px] gap-3 lg:w-[98%] lg:max-w-[1280px] lg:grid-cols-2 lg:gap-5 xl:max-w-[1400px]">
        <div data-scroll-stagger className="space-y-3 lg:space-y-4">
          {left.map((id) => (
            <div key={id} data-scroll-stagger-item>
              <FaqItem
                id={id}
                question={t(`landing.faq.q${id}`)}
                answer={t(`landing.faq.a${id}`)}
                open={openId === id}
                onToggle={() => setOpenId((current) => (current === id ? null : id))}
              />
            </div>
          ))}
        </div>
        <div data-scroll-stagger className="space-y-3 lg:space-y-4">
          {right.map((id) => (
            <div key={id} data-scroll-stagger-item>
              <FaqItem
                id={id}
                question={t(`landing.faq.q${id}`)}
                answer={t(`landing.faq.a${id}`)}
                open={openId === id}
                onToggle={() => setOpenId((current) => (current === id ? null : id))}
              />
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function FaqItem({
  id,
  question,
  answer,
  open,
  onToggle,
}: {
  id: number;
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-black/6 bg-jp-card">
      <button
        type="button"
        className="flex min-h-[80px] w-full items-center justify-between gap-3 px-5 py-3.5 text-left sm:min-h-[96px] sm:gap-4 sm:px-6 sm:py-4 lg:min-h-[104px] lg:px-7 lg:py-5"
        aria-expanded={open}
        aria-controls={`faq-panel-${id}`}
        onClick={onToggle}
      >
        <span className="font-sans text-[0.9375rem] leading-6 text-black sm:text-base sm:leading-6 lg:text-lg lg:leading-7">
          {question}
        </span>
        <Plus
          className={cn(
            'size-3.5 shrink-0 transition-transform duration-200 sm:size-3.5 lg:size-4',
            open && 'rotate-45',
          )}
          aria-hidden
        />
      </button>
      <div
        id={`faq-panel-${id}`}
        className={cn(
          'grid transition-[grid-template-rows] duration-200',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-4 font-sans text-sm leading-6 text-jp-muted sm:px-7 sm:pb-5 sm:text-base sm:leading-7">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}
