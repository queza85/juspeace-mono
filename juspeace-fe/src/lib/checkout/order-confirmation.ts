export function generateOrderNumber(): string {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${suffix}`;
}

export function formatEstimatedDeliveryRange(
  locale: string,
  startOffsetDays = 3,
  endOffsetDays = 5,
): string {
  const start = new Date();
  start.setDate(start.getDate() + startOffsetDays);

  const end = new Date();
  end.setDate(end.getDate() + endOffsetDays);

  const formatter = new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}
