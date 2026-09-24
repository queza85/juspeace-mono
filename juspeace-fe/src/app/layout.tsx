import type { Metadata } from 'next';
import { AppProviders } from '@/components/providers/app-providers';
import { fragmentMono, instrumentSerif, rootFontVariableClasses } from '@/lib/fonts';
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
    <html
      lang={locale}
      className={`min-h-full overflow-x-clip ${rootFontVariableClasses}`}
    >
      <body className="flex min-h-full flex-col overflow-x-clip antialiased">
        <AppProviders locale={locale}>{children}</AppProviders>
      </body>
    </html>
  );
}
