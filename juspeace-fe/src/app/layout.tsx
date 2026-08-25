import type { Metadata } from 'next';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { AppProviders } from '@/components/providers/app-providers';
import { getLocale } from '@/lib/i18n/server';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Juspeace',
    template: '%s | Juspeace',
  },
  description: 'Mindful essentials for everyday peace',
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  const locale = await getLocale();

  return (
    <html lang={locale} className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <AppProviders locale={locale}>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </AppProviders>
      </body>
    </html>
  );
}
