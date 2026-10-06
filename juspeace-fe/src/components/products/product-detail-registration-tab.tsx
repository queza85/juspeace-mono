'use client';

import { useT } from '@/lib/i18n/locale-context';

export function ProductDetailRegistrationTab() {
  const t = useT();

  return (
    <div className="text-left">
      <h2 className="font-sans text-base font-bold not-italic leading-[65px] tracking-[-0.02em] text-black sm:text-lg">
        {t('products.detail.registration.title')}
      </h2>
      <p className="mt-4 whitespace-pre font-sans text-lg font-normal not-italic leading-[38px] tracking-normal text-black">
        {t('products.detail.registration.body1')}
      </p>
      <p className="mt-5 whitespace-nowrap font-sans text-lg font-normal not-italic leading-[38px] tracking-normal text-black">
        {t('products.detail.registration.body2')}
      </p>
    </div>
  );
}
