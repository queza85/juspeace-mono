'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { buttonVariants } from '@/components/ui/button';
import { clearSessionExpired } from '@/lib/auth/session-hint';
import { useT } from '@/lib/i18n/locale-context';
import { cn } from '@/lib/utils';

export function SessionExpiredCard() {
  const t = useT();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';
  const safeReturnUrl = returnUrl.startsWith('/') ? returnUrl : '/dashboard';
  const loginHref = `/login?returnUrl=${encodeURIComponent(safeReturnUrl)}`;

  return (
    <div className="box-border w-full max-w-[400px] rounded-lg border border-border bg-white px-5 py-6 shadow-sm">
      <div className="mb-5 flex flex-col items-center text-center">
        <Image
          src="/logo.png"
          alt=""
          width={48}
          height={48}
          className="mb-3 size-12"
          priority
        />
        <h1 className="text-base font-bold tracking-tight text-foreground">
          {t('auth.sessionExpired.title')}
        </h1>
        <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
          {t('auth.sessionExpired.subtitle')}
        </p>
      </div>

      <Link
        href={loginHref}
        onClick={() => clearSessionExpired()}
        className={cn(
          buttonVariants({ size: 'default' }),
          'h-9 w-full rounded-md text-[13px] font-semibold',
        )}
      >
        {t('auth.login')}
      </Link>
    </div>
  );
}
