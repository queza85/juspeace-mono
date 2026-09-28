'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import { ProductDetailRegistrationTab } from '@/components/products/product-detail-registration-tab';
import { ProductDetailReviewsTab } from '@/components/products/product-detail-reviews-tab';
import { ProductDetailStoryTab } from '@/components/products/product-detail-story-tab';
import { CLOSE_UP_IMAGES } from '@/lib/products/variant-images';
import { cn } from '@/lib/utils';

type TabKey = 'story' | 'closeUp' | 'productRegistration' | 'reviews';

const TAB_KEYS: TabKey[] = [
  'story',
  'closeUp',
  'productRegistration',
  'reviews',
];

export function ProductDetailTabs() {
  const t = useT();
  const [activeTab, setActiveTab] = useState<TabKey>('story');

  const renderTabPanel = () => {
    switch (activeTab) {
      case 'story':
        return <ProductDetailStoryTab />;
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
      case 'productRegistration':
        return <ProductDetailRegistrationTab />;
      case 'reviews':
        return <ProductDetailReviewsTab />;
      default:
        return null;
    }
  };

  return (
    <section className="mx-auto mb-48 mt-36 w-full lg:mb-64 lg:mt-44 lg:w-[92%] xl:mt-52">
      <div className="relative border-b border-black/15 pb-5">
        <div
          role="tablist"
          aria-label={t('products.detail.tabsLabel')}
          className="grid w-full grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-4 sm:gap-x-4"
        >
          {TAB_KEYS.map((key) => (
            <button
              key={key}
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
