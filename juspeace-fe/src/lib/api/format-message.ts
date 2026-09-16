import { t } from '@/lib/i18n';

/** Convert LOGIN_SUCCESSFULLY → "Login successfully" when no i18n entry exists. */
export function humanizeApiMessage(code: string): string {
  const normalized = code.trim();
  if (!normalized) {
    return t('common.error');
  }

  const i18nKey = `apiMessages.${normalized}`;
  const translated = t(i18nKey);
  if (translated !== i18nKey) {
    return translated;
  }

  const sentence = normalized
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .join(' ');

  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}
