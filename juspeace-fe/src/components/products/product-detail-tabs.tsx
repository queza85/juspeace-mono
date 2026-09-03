'use client';

import Image from 'next/image';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import { ProductDetailReviewsTab } from '@/components/products/product-detail-reviews-tab';
import { CLOSE_UP_IMAGES, type VariantKey } from '@/lib/products/variant-images';
import { cn } from '@/lib/utils';

type TabKey = 'description' | 'closeUp' | 'additionalInfo' | 'reviews';

interface ProductDetailTabsProps {
  description: string;
  variantKey: VariantKey;
}

const TAB_KEYS: TabKey[] = [
  'description',
  'closeUp',
  'additionalInfo',
  'reviews',
];

function descriptionColumnText(description: string) {
  const trimmed = description.trim();
  if (!trimmed) return '';
  return `${trimmed} ${trimmed}`;
}

function TabTwoColumnBody({ text }: { text: string }) {
  return (
    <div className="grid gap-8 md:grid-cols-2 md:gap-12 lg:gap-20">
      <p className="font-mono text-xs leading-[1.85] text-black/80 sm:text-[13px] sm:leading-[1.9]">
        {text}
      </p>
      <p className="font-mono text-xs leading-[1.85] text-black/80 sm:text-[13px] sm:leading-[1.9]">
        {text}
      </p>
    </div>
  );
}

export function ProductDetailTabs({
  description,
  variantKey: _variantKey,
}: ProductDetailTabsProps) {
  const t = useT();
  const [activeTab, setActiveTab] = useState<TabKey>('description');
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const tabListRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<TabKey, HTMLButtonElement | null>>>({});
  const columnText = descriptionColumnText(description);

  const updateIndicator = useCallback(() => {
    const tabList = tabListRef.current;
    const activeButton = tabRefs.current[activeTab];

    if (!tabList || !activeButton) {
      return;
    }

    setIndicator({
      left: activeButton.offsetLeft,
      width: activeButton.offsetWidth,
    });
  }, [activeTab]);

  useLayoutEffect(() => {
    updateIndicator();

    const tabList = tabListRef.current;
    if (!tabList) {
      return;
    }

    const resizeObserver = new ResizeObserver(updateIndicator);
    resizeObserver.observe(tabList);
    window.addEventListener('resize', updateIndicator);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateIndicator);
    };
  }, [updateIndicator]);

  const renderTabPanel = () => {
    switch (activeTab) {
      case 'description':
        return <TabTwoColumnBody text={columnText} />;
      case 'closeUp':
        return (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:gap-5">
            {CLOSE_UP_IMAGES.map((image, index) => (
              <div
                key={image.src}
                className="relative aspect-square w-full overflow-hidden bg-black"
              >
                <Image
                  src={image.src}
                  alt={t('products.detail.galleryThumbnail', {
                    index: index + 1,
                  })}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        );
      case 'additionalInfo':
        return <TabTwoColumnBody text={columnText} />;
      case 'reviews':
        return <ProductDetailReviewsTab />;
      default:
        return null;
    }
  };

  return (
    <section className="mx-auto mb-20 mt-36 max-w-[1080px] lg:mb-28 lg:mt-44 xl:mt-52">
      <div className="relative border-b border-black/15 pb-5">
        <div
          ref={tabListRef}
          role="tablist"
          aria-label={t('products.detail.tabs.description')}
          className="grid w-full grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-4 sm:gap-x-4"
        >
          {TAB_KEYS.map((key) => (
            <button
              key={key}
              ref={(element) => {
                tabRefs.current[key] = element;
              }}
              type="button"
              role="tab"
              aria-selected={activeTab === key}
              onClick={() => setActiveTab(key)}
              className={cn(
                'jp-pdp-tab relative px-1 text-center uppercase',
                activeTab === key
                  ? 'font-semibold text-black'
                  : 'font-medium text-jp-muted hover:text-black/70',
              )}
            >
              {t(`products.detail.tabs.${key}`)}
            </button>
          ))}
        </div>

        <span
          aria-hidden
          className="jp-pdp-tab-indicator pointer-events-none absolute bottom-0 h-px bg-black"
          style={{
            left: indicator.left,
            width: indicator.width,
          }}
        />
      </div>

      <div
        key={activeTab}
        role="tabpanel"
        className="jp-pdp-tab-panel mt-8 lg:mt-10"
      >
        {renderTabPanel()}
      </div>
    </section>
  );
}
