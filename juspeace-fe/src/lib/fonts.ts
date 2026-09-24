import { Fragment_Mono, Instrument_Sans, Instrument_Serif } from 'next/font/google';

export const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

/** Figma: “JUSPEACE” wordmark in Brand Story quote */
export const instrumentSansBold = Instrument_Sans({
  weight: '700',
  subsets: ['latin'],
  display: 'swap',
});

export const fragmentMono = Fragment_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-fragment-mono',
  display: 'swap',
});

export const rootFontVariableClasses = [
  instrumentSerif.variable,
  fragmentMono.variable,
].join(' ');
