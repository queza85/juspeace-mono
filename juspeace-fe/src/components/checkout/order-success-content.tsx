'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Truck } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { useT } from '@/lib/i18n/locale-context';
import { useCartStore } from '@/stores/cart-store';
import { useCheckoutStore } from '@/stores/checkout-store';

const SUCCESS_ILLUSTRATION = '/checkout/success_order.png';

export function OrderSuccessContent() {
  const t = useT();
  const router = useRouter();
  const { user } = useAuth();
  const clearCart = useCartStore((state) => state.clearCart);
  const orderConfirmation = useCheckoutStore((state) => state.orderConfirmation);

  useEffect(() => {
    if (!orderConfirmation) {
      router.replace('/#collection');
      return;
    }

    clearCart();
  }, [clearCart, orderConfirmation, router]);

  if (!orderConfirmation) {
    return null;
  }

  const displayEmail = user?.email ?? t('orderSuccess.guestEmail');

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col items-center px-2 py-6 text-center sm:py-10">
      <Image
        src={SUCCESS_ILLUSTRATION}
        alt=""
        width={640}
        height={480}
        priority
        className="mx-auto h-auto w-full max-w-[360px] object-contain sm:max-w-[420px]"
      />

      <h1 className="mt-6 font-display text-[clamp(1.5rem,3vw,2rem)] font-semibold leading-tight text-black">
        {t('orderSuccess.title')}
      </h1>
      <p className="mt-2 font-mono text-xs text-black sm:text-sm">
        {t('orderSuccess.subtitle')}
      </p>

      <div className="mt-8 w-full max-w-[420px] rounded-full border border-black/10 bg-jp-light-gray px-6 py-4">
        <p className="font-mono text-[11px] text-jp-muted sm:text-xs">
          {t('orderSuccess.orderNumberLabel')}
        </p>
        <p className="mt-1 font-display text-lg font-semibold text-black sm:text-xl">
          {orderConfirmation.orderNumber}
        </p>
      </div>

      <p className="mt-6 max-w-md font-mono text-[11px] leading-relaxed text-black sm:text-xs">
        {t('orderSuccess.confirmationEmailPrefix')}{' '}
        <span className="font-semibold">{displayEmail}</span>
      </p>

      <div className="mt-8 flex max-w-md flex-col items-center">
        <Truck className="size-5 text-black" aria-hidden />
        <p className="mt-2 font-mono text-[11px] text-jp-muted sm:text-xs">
          {t('orderSuccess.estimatedDelivery')}
        </p>
        <p className="mt-1 font-display text-sm font-semibold text-black sm:text-base">
          {orderConfirmation.estimatedDelivery}
        </p>
        <p className="mt-2 font-mono text-[11px] text-jp-muted sm:text-xs">
          {t('orderSuccess.deliveryNotify')}
        </p>
      </div>

      <div className="mt-10 flex w-full max-w-[520px] flex-col gap-3 sm:flex-row sm:gap-4">
        <Link
          href="/account"
          className="inline-flex h-11 flex-1 items-center justify-center bg-black px-6 font-mono text-xs text-white transition-opacity hover:opacity-90 sm:h-12 sm:text-sm"
        >
          {t('orderSuccess.trackOrder')}
        </Link>
        <Link
          href="/#collection"
          className="inline-flex h-11 flex-1 items-center justify-center border border-black bg-white px-6 font-mono text-xs text-black transition-opacity hover:opacity-80 sm:h-12 sm:text-sm"
        >
          {t('orderSuccess.continueShopping')}
        </Link>
      </div>
    </div>
  );
}
