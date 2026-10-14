'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFormatPrice, useT } from '@/lib/i18n/locale-context';
import { QA_CART_ITEMS, type QaCartItemId } from '@/lib/qa-test/catalog';

type CartLine = {
  id: QaCartItemId;
  qty: number;
};

const initialLines: CartLine[] = QA_CART_ITEMS.map((item) => ({
  id: item.id,
  qty: 1,
}));

export function CartTask() {
  const t = useT();
  const formatPrice = useFormatPrice();
  const [lines, setLines] = useState<CartLine[]>(initialLines);
  const listedCount = QA_CART_ITEMS.length;

  const subtotalCents = lines.reduce((sum, line) => {
    const item = QA_CART_ITEMS.find((entry) => entry.id === line.id);
    return sum + (item?.priceCents ?? 0);
  }, 0);

  function changeQty(id: QaCartItemId, delta: number) {
    setLines((current) =>
      current.map((line) => {
        if (line.id !== id) {
          return line;
        }
        const nextQty = line.qty + delta;
        if (nextQty < 1) {
          return line;
        }
        return { ...line, qty: nextQty };
      }),
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">{t('qaTest.cart.title')}</h1>
        <p className="font-display text-sm font-semibold">{t('qaTest.cart.count', { count: listedCount })}</p>
        <p className="text-sm leading-6 text-black/70">{t('qaTest.cart.subtitle')}</p>
      </header>

      {lines.length === 0 ? (
        <p className="border border-black/10 px-5 py-6 text-sm text-black/70">{t('qaTest.cart.empty')}</p>
      ) : (
        <ul className="divide-y divide-black/10 border border-black/10">
          {lines.map((line) => {
            const item = QA_CART_ITEMS.find((entry) => entry.id === line.id);
            if (!item) {
              return null;
            }
            const name = t(item.nameKey);
            return (
              <li key={line.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="font-display text-sm font-semibold">{name}</p>
                  <p className="font-mono text-[11px] text-black/70">
                    {t('qaTest.cart.each', { price: formatPrice(item.priceCents) })}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center border border-black/15">
                    <button
                      type="button"
                      className="h-9 w-9 text-sm disabled:opacity-40"
                      aria-label={t('qaTest.cart.decrease', { name })}
                      disabled={line.qty <= 1}
                      onClick={() => changeQty(line.id, -1)}
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center font-mono text-xs" aria-live="polite">
                      <span className="sr-only">{t('qaTest.cart.quantity')} </span>
                      {line.qty}
                    </span>
                    <button
                      type="button"
                      className="h-9 w-9 text-sm"
                      aria-label={t('qaTest.cart.increase', { name })}
                      onClick={() => changeQty(line.id, 1)}
                    >
                      +
                    </button>
                  </div>
                  <p className="min-w-28 font-mono text-xs">
                    <span className="mr-2 text-black/60">{t('qaTest.cart.lineTotal')}</span>
                    {formatPrice(item.priceCents)}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setLines((current) => current.filter((entry) => entry.id !== line.id))
                    }
                  >
                    {t('qaTest.cart.remove', { name })}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="flex items-center justify-between border border-black/10 px-5 py-4 font-display text-sm font-semibold">
        <span>{t('qaTest.cart.subtotal')}</span>
        <span className="font-mono text-xs">{formatPrice(subtotalCents)}</span>
      </p>
    </section>
  );
}
