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
      <div className="mx-auto mb-12 flex max-w-[1116px] flex-col items-center text-center lg:mb-16">
        <SectionLabel>{t('landing.faq.sectionLabel')}</SectionLabel>
        <SectionHeading className="mt-4">{t('landing.faq.heading')}</SectionHeading>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
        <div className="space-y-4 lg:space-y-5">
          {left.map((id) => (
            <FaqItem
              key={id}
              id={id}
              question={t(`landing.faq.q${id}`)}
              answer={t(`landing.faq.a${id}`)}
              open={openId === id}
              onToggle={() => setOpenId((current) => (current === id ? null : id))}
            />
          ))}
        </div>
        <div className="space-y-4 lg:space-y-5">
          {right.map((id) => (
            <FaqItem
              key={id}
              id={id}
              question={t(`landing.faq.q${id}`)}
              answer={t(`landing.faq.a${id}`)}
              open={openId === id}
              onToggle={() => setOpenId((current) => (current === id ? null : id))}
            />
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
    <div className="overflow-hidden rounded-[32px] border border-black/6 bg-jp-card">
      <button
        type="button"
        className="flex min-h-[112px] w-full items-center justify-between gap-4 px-6 py-6 text-left sm:min-h-[156px] sm:px-10"
        aria-expanded={open}
        aria-controls={`faq-panel-${id}`}
        onClick={onToggle}
      >
        <span className="font-mono text-lg leading-8 text-black sm:text-2xl">
          {question}
        </span>
        <Plus
          className={cn(
            'size-4 shrink-0 transition-transform duration-200',
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
          <p className="px-6 pb-6 font-mono text-base leading-7 text-jp-muted sm:px-10 sm:pb-8">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}
