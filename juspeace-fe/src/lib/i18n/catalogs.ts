import en from '@/messages/en.json';
import ko from '@/messages/ko.json';
import type { Locale } from './config';

export type Messages = typeof en;

export const catalogs: Record<Locale, Messages> = {
  en,
  ko,
};

export function getCatalog(locale: Locale): Messages {
  return catalogs[locale] ?? catalogs.en;
}
