'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { SectionHeading } from '@/components/landing/section-heading';
import { SectionLabel } from '@/components/landing/section-label';
import { SectionShell } from '@/components/landing/section-shell';
import { useT } from '@/lib/i18n/locale-context';
import { cn } from '@/lib/utils';

const FAQ_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export function FaqSection() {
  const t = useT();
  const [openId, setOpenId] = useState<number | null>(null);

  const left = FAQ_IDS.filter((_, index) => index % 2 === 0);
  const right = FAQ_IDS.filter((_, index) => index % 2 === 1);

  return (
    <SectionShell id="faq" className="bg-white py-16 lg:py-28">
      <div
        data-scroll-reveal
        className="mx-auto mb-12 flex max-w-[1116px] flex-col items-center text-center lg:mb-16"
      >
        <SectionLabel>{t('landing.faq.sectionLabel')}</SectionLabel>
        <SectionHeading className="mt-4">{t('landing.faq.heading')}</SectionHeading>
      </div>

      <div data-scroll-stagger className="grid gap-3 lg:grid-cols-2 lg:gap-4">
        <div className="space-y-3 lg:space-y-4">
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
        <div className="space-y-3 lg:space-y-4">
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
        className="flex min-h-[88px] w-full items-center justify-between gap-3 px-5 py-4 text-left sm:min-h-[112px] sm:gap-4 sm:px-7 sm:py-5"
        aria-expanded={open}
        aria-controls={`faq-panel-${id}`}
        onClick={onToggle}
      >
        <span className="font-mono text-base leading-6 text-black sm:text-lg sm:leading-7">
          {question}
        </span>
        <Plus
          className={cn(
            'size-3.5 shrink-0 transition-transform duration-200 sm:size-4',
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
          <p className="px-5 pb-4 font-mono text-sm leading-6 text-jp-muted sm:px-7 sm:pb-5 sm:text-base sm:leading-7">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}
