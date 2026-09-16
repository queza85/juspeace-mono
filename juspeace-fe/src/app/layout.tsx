import type { Metadata } from 'next';
import { Fragment_Mono, Instrument_Serif } from 'next/font/google';
import { AppProviders } from '@/components/providers/app-providers';
import { getLocale } from '@/lib/i18n/server';
import './globals.css';

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const fragmentMono = Fragment_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-fragment-mono',
  display: 'swap',
});

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
      className={`min-h-full overflow-x-clip ${instrumentSerif.variable} ${fragmentMono.variable}`}
    >
      <body className="flex min-h-full flex-col overflow-x-clip antialiased">
        <AppProviders locale={locale}>{children}</AppProviders>
      </body>
    </html>
  );
}
