export type CardBrand =
  | 'visa'
  | 'mastercard'
  | 'amex'
  | 'discover'
  | 'unionpay'
  | 'unknown';

const CARD_FORMAT: Record<
  CardBrand,
  { groups: number[]; maxDigits: number; cvvLength: number }
> = {
  visa: { groups: [4, 4, 4, 4, 3], maxDigits: 19, cvvLength: 3 },
  mastercard: { groups: [4, 4, 4, 4], maxDigits: 16, cvvLength: 3 },
  amex: { groups: [4, 6, 5], maxDigits: 15, cvvLength: 4 },
  discover: { groups: [4, 4, 4, 4, 3], maxDigits: 19, cvvLength: 3 },
  unionpay: { groups: [4, 4, 4, 4, 3], maxDigits: 19, cvvLength: 3 },
  unknown: { groups: [4, 4, 4, 4], maxDigits: 16, cvvLength: 3 },
};

export function cardDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function detectCardBrand(value: string): CardBrand {
  const digits = cardDigits(value);

  if (digits.startsWith('4')) {
    return 'visa';
  }

  if (digits.startsWith('34') || digits.startsWith('37')) {
    return 'amex';
  }

  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) {
    return 'mastercard';
  }

  if (/^(6011|65|64[4-9])/.test(digits)) {
    return 'discover';
  }

  if (digits.startsWith('62')) {
    return 'unionpay';
  }

  return 'unknown';
}

export function cvvLengthForBrand(brand: CardBrand): number {
  return CARD_FORMAT[brand].cvvLength;
}

export function formatCardNumber(value: string): string {
  const brand = detectCardBrand(value);
  const { groups, maxDigits } = CARD_FORMAT[brand];
  const digits = cardDigits(value).slice(0, maxDigits);
  const parts: string[] = [];
  let index = 0;

  for (const size of groups) {
    if (index >= digits.length) {
      break;
    }

    parts.push(digits.slice(index, index + size));
    index += size;
  }

  return parts.join(' ');
}

export function formatCardExpiry(value: string, previous = ''): string {
  const fullDate = value.trim().match(/^(\d{1,2})\/\d{1,2}\/(\d{4})$/);
  if (fullDate) {
    const month = fullDate[1].padStart(2, '0').slice(0, 2);
    const monthNumber = Number(month);
    const safeMonth =
      monthNumber < 1 ? '01' : monthNumber > 12 ? '12' : month;
    return `${safeMonth}/${fullDate[2].slice(-2)}`;
  }

  const nextDigits = cardDigits(value).slice(0, 4);
  const previousDigits = cardDigits(previous);

  if (
    previous.endsWith('/') &&
    !value.includes('/') &&
    nextDigits === previousDigits &&
    nextDigits.length > 0
  ) {
    return nextDigits.slice(0, -1);
  }

  const deleting = nextDigits.length < previousDigits.length;
  let month = nextDigits.slice(0, 2);
  let year = nextDigits.slice(2);

  if (!deleting && month.length === 1 && Number(month) > 1) {
    month = `0${month}`;
  }

  if (!deleting && month.length === 2) {
    const monthNumber = Number(month);
    if (monthNumber === 0) {
      month = '01';
    } else if (monthNumber > 12) {
      year = `${month.slice(1)}${year}`;
      month = `0${month[0]}`;
    }
  }

  year = year.slice(0, 2);

  if (year.length === 0) {
    if (!deleting && month.length === 2) {
      return `${month}/`;
    }

    return month;
  }

  return `${month}/${year}`;
}

export function formatCvv(value: string, brand: CardBrand): string {
  return cardDigits(value).slice(0, cvvLengthForBrand(brand));
}

export function isCompleteCardNumber(value: string): boolean {
  const digits = cardDigits(value);
  const brand = detectCardBrand(digits);
  const completeLengths: Record<CardBrand, number[]> = {
    visa: [16, 19],
    mastercard: [16],
    amex: [15],
    discover: [16, 19],
    unionpay: [16, 19],
    unknown: [],
  };

  return completeLengths[brand].includes(digits.length);
}
