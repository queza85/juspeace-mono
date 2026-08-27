'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from 'react';
import { ToastViewport } from '@/components/ui/toast';
import { AuthProvider } from '@/lib/auth/auth-context';
import type { Locale } from '@/lib/i18n';
import { LocaleProvider } from '@/lib/i18n/locale-context';
import { getQueryClient } from '@/lib/query/get-query-client';

export function AppProviders({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const queryClient = getQueryClient();

  return (
    <LocaleProvider key={locale} initialLocale={locale}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <ToastViewport />
        </AuthProvider>
        {process.env.NODE_ENV === 'development' ? (
          <ReactQueryDevtools
            initialIsOpen={false}
            buttonPosition="bottom-left"
          />
        ) : null}
      </QueryClientProvider>
    </LocaleProvider>
  );
}
