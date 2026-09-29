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
    <div className="mx-auto flex w-full max-w-[840px] flex-col items-center px-4 py-8 text-center sm:py-12">
      <Image
        src={SUCCESS_ILLUSTRATION}
        alt=""
        width={640}
        height={480}
        priority
        className="mx-auto h-auto w-full max-w-[420px] object-contain sm:max-w-[520px] md:max-w-[560px]"
      />

      <h1 className="mt-8 font-display text-[clamp(2rem,4vw,2.75rem)] font-semibold leading-tight text-black sm:mt-10">
        {t('orderSuccess.title')}
      </h1>
      <p className="mt-3 font-mono text-sm text-black sm:text-base md:text-lg">
        {t('orderSuccess.subtitle')}
      </p>

      <div className="mt-10 w-full max-w-[500px] rounded-full border border-black/10 bg-jp-light-gray px-8 py-5 sm:mt-12 sm:py-6">
        <p className="font-mono text-xs text-jp-muted sm:text-sm">
          {t('orderSuccess.orderNumberLabel')}
        </p>
        <p className="mt-1.5 font-display text-xl font-semibold text-black sm:text-2xl md:text-3xl">
          {orderConfirmation.orderNumber}
        </p>
      </div>

      <p className="mt-8 max-w-lg font-mono text-xs leading-relaxed text-black sm:text-sm md:text-base">
        {t('orderSuccess.confirmationEmailPrefix')}{' '}
        <span className="font-semibold">{displayEmail}</span>
      </p>

      <div className="mt-10 flex max-w-lg flex-col items-center sm:mt-12">
        <Truck className="size-6 text-black sm:size-7" aria-hidden />
        <p className="mt-2.5 font-mono text-xs text-jp-muted sm:text-sm">
          {t('orderSuccess.estimatedDelivery')}
        </p>
        <p className="mt-1.5 font-display text-base font-semibold text-black sm:text-lg md:text-xl">
          {orderConfirmation.estimatedDelivery}
        </p>
        <p className="mt-2.5 font-mono text-xs text-jp-muted sm:text-sm">
          {t('orderSuccess.deliveryNotify')}
        </p>
      </div>

      <div className="mt-12 flex w-full max-w-[580px] flex-col gap-3.5 sm:mt-14 sm:flex-row sm:gap-5">
        <Link
          href="/account"
          className="inline-flex h-12 flex-1 items-center justify-center bg-black px-8 font-mono text-sm text-white transition-opacity hover:opacity-90 sm:h-14 sm:text-base"
        >
          {t('orderSuccess.trackOrder')}
        </Link>
        <Link
          href="/#collection"
          className="inline-flex h-12 flex-1 items-center justify-center border border-black bg-white px-8 font-mono text-sm text-black transition-opacity hover:opacity-80 sm:h-14 sm:text-base"
        >
          {t('orderSuccess.continueShopping')}
        </Link>
      </div>
    </div>
  );
}
