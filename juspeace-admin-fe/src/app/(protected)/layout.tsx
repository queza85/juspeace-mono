'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminShell } from '@/components/layout/admin-shell';
import { useAuth } from '@/lib/auth/auth-context';
import { consumeSessionExpired } from '@/lib/auth/session-hint';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname || '/dashboard');
      if (consumeSessionExpired()) {
        router.replace(`/session-expired?returnUrl=${returnUrl}`);
        return;
      }
      router.replace(`/login?returnUrl=${returnUrl}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
