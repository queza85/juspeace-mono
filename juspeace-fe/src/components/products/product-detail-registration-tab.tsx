'use client';

import { useT } from '@/lib/i18n/locale-context';

export function ProductDetailRegistrationTab() {
  const t = useT();

  return (
    <div className="max-w-[720px] text-left">
      <h2 className="font-display text-base font-bold text-black sm:text-lg">
        {t('products.detail.registration.title')}
      </h2>
      <p className="mt-4 font-sans text-sm font-normal leading-[1.75] text-black sm:text-base sm:leading-[1.8]">
        {t('products.detail.registration.body1')}
      </p>
      <p className="mt-5 font-sans text-sm font-normal leading-[1.75] text-black sm:text-base sm:leading-[1.8]">
        {t('products.detail.registration.body2')}
      </p>
    </div>
  );
}
