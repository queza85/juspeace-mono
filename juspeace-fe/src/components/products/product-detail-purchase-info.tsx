'use client';

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import { ChevronDown, Package, Truck } from 'lucide-react';
import { OfficialRecordIcon, VerifiedBadgeIcon } from '@/components/icons';
import { useT } from '@/lib/i18n/locale-context';
import { cn } from '@/lib/utils';

function AccordionCard({
  id,
  title,
  children,
  defaultOpen = true,
}: {
  id: string;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `${id}-panel`;

  return (
    <div className="overflow-hidden rounded-xl border border-black/15">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:px-5"
      >
        <span className="font-display text-sm font-semibold text-black">
          {title}
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-black transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>
      <div
        id={panelId}
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={cn(
              'px-4 pb-4 transition-opacity duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none sm:px-5 sm:pb-5',
              open ? 'opacity-100' : 'opacity-0',
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function FactItem({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-6 shrink-0 items-center justify-center text-black">
        {icon}
      </span>
      <span className="font-sans text-xs leading-snug text-black sm:text-[13px]">
        {label}
      </span>
    </div>
  );
}

export function ProductDetailPurchaseInfo() {
  const t = useT();

  return (
    <div className="mt-8 flex flex-col gap-3">
      <AccordionCard
        id="authenticity"
        title={t('products.detail.authenticity.title')}
      >
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-black px-3 py-1 font-sans text-[11px] font-medium text-white">
          {t('products.detail.authenticity.badge')}
          <VerifiedBadgeIcon size={12} className="shrink-0 text-white" />
        </span>
        <p className="mt-3 font-sans text-xs leading-[1.7] text-black sm:text-[13px] sm:leading-[1.75]">
          {t('products.detail.authenticity.body')}
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FactItem
            icon={
              <Image
                src="/icons/authentic-product.png"
                alt=""
                width={24}
                height={24}
                className="size-6 object-contain"
              />
            }
            label={t('products.detail.authenticity.authentic')}
          />
          <FactItem
            icon={<OfficialRecordIcon size={24} className="size-6" />}
            label={t('products.detail.authenticity.record')}
          />
          <FactItem
            icon={
              <Image
                src="/icons/registry-juespeace.png"
                alt=""
                width={24}
                height={24}
                className="size-6 object-contain"
              />
            }
            label={t('products.detail.authenticity.registry')}
          />
        </div>
      </AccordionCard>

      <AccordionCard
        id="shipping"
        title={t('products.detail.shipping.title')}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex gap-3">
            <Truck className="mt-0.5 size-[18px] shrink-0 text-black" aria-hidden />
            <div className="min-w-0">
              <p className="font-display text-sm font-semibold text-black">
                {t('products.detail.deliveryTitle')}
              </p>
              <p className="mt-1 font-sans text-xs leading-relaxed text-black underline underline-offset-4 sm:text-[13px]">
                {t('products.detail.deliveryBody')}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Package
              className="mt-0.5 size-[18px] shrink-0 text-black"
              aria-hidden
            />
            <div className="min-w-0">
              <p className="font-display text-sm font-semibold text-black">
                {t('products.detail.returnTitle')}
              </p>
              <p className="mt-1 font-sans text-xs leading-relaxed text-black sm:text-[13px]">
                {t('products.detail.returnBody')}
              </p>
            </div>
          </div>
        </div>
      </AccordionCard>
    </div>
  );
}
