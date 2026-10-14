'use client';

import { useMemo, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Button } from '@/components/ui/button';
import { fieldErrorText, qaFieldClassName } from '@/components/qa-test/field-styles';
import { useFormatPrice, useLocale, useT } from '@/lib/i18n/locale-context';
import {
  isQaShippingMethodId,
  QA_CART_ITEMS,
  QA_SHIPPING_METHODS,
  type QaShippingMethodId,
} from '@/lib/qa-test/catalog';
import {
  createQaShippingSchema,
  type QaShippingValues,
} from '@/lib/qa-test/shipping-schema';

const defaultValues: QaShippingValues = {
  recipient: '',
  phone: '',
  address: '',
};

export function ShippingTask() {
  const t = useT();
  const formatPrice = useFormatPrice();
  const { locale } = useLocale();
  const schema = useMemo(() => createQaShippingSchema(locale), [locale]);
  const [methodId, setMethodId] = useState<QaShippingMethodId>(QA_SHIPPING_METHODS[0].id);
  const [savedMethodId, setSavedMethodId] = useState<QaShippingMethodId | null>(null);

  const selected =
    QA_SHIPPING_METHODS.find((method) => method.id === methodId) ?? QA_SHIPPING_METHODS[0];
  const merchandiseCents = QA_CART_ITEMS.reduce((sum, item) => sum + item.priceCents, 0);
  const shippingFeeCents = QA_SHIPPING_METHODS[0].feeCents;
  const totalCents = merchandiseCents + shippingFeeCents;

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: schema,
    },
    onSubmit: () => {
      setSavedMethodId(methodId);
    },
  });

  if (savedMethodId) {
    const saved =
      QA_SHIPPING_METHODS.find((method) => method.id === savedMethodId) ??
      QA_SHIPPING_METHODS[0];

    return (
      <section className="space-y-4 border border-black/10 px-5 py-6 sm:px-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {t('qaTest.shipping.successTitle')}
        </h1>
        <p className="text-sm leading-6 text-black/80">
          {t('qaTest.shipping.successBody', { method: t(saved.labelKey) })}
        </p>
        <Button type="button" variant="outline" onClick={() => setSavedMethodId(null)}>
          {t('qaTest.shipping.back')}
        </Button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {t('qaTest.shipping.title')}
        </h1>
        <p className="text-sm leading-6 text-black/70">{t('qaTest.shipping.subtitle')}</p>
      </header>

      <form
        className="space-y-6 border border-black/10 px-5 py-6 sm:px-6"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field name="recipient">
          {(field) => (
            <ShippingField
              field={field}
              label={t('qaTest.shipping.recipient')}
              autoComplete="name"
              fallback={t('common.error')}
            />
          )}
        </form.Field>
        <form.Field name="phone">
          {(field) => (
            <ShippingField
              field={field}
              label={t('qaTest.shipping.phone')}
              autoComplete="tel"
              fallback={t('common.error')}
            />
          )}
        </form.Field>
        <form.Field name="address">
          {(field) => (
            <ShippingField
              field={field}
              label={t('qaTest.shipping.address')}
              autoComplete="street-address"
              fallback={t('common.error')}
            />
          )}
        </form.Field>

        <fieldset className="space-y-3">
          <legend className="font-display text-xs font-semibold text-black">
            {t('qaTest.shipping.method')}
          </legend>
          {QA_SHIPPING_METHODS.map((method) => {
            const inputId = `shipping-method-${method.id}`;
            return (
              <label
                key={method.id}
                htmlFor={inputId}
                className="flex cursor-pointer items-center justify-between gap-3 border border-black/15 px-3 py-2"
              >
                <span className="flex items-center gap-2 text-sm">
                  <input
                    id={inputId}
                    type="radio"
                    name="shippingMethod"
                    value={method.id}
                    checked={methodId === method.id}
                    onChange={(event) => {
                      if (isQaShippingMethodId(event.target.value)) {
                        setMethodId(event.target.value);
                      }
                    }}
                  />
                  {t(method.labelKey)}
                </span>
                <span className="font-mono text-xs">{formatPrice(method.feeCents)}</span>
              </label>
            );
          })}
        </fieldset>

        <dl className="space-y-2 border-t border-black/10 pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt>{t('qaTest.shipping.selectedMethod')}</dt>
            <dd>{t(selected.labelKey)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>{t('qaTest.shipping.merchandise')}</dt>
            <dd className="font-mono text-xs">{formatPrice(merchandiseCents)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>{t('qaTest.shipping.shippingFee')}</dt>
            <dd className="font-mono text-xs">{formatPrice(shippingFeeCents)}</dd>
          </div>
          <div className="flex justify-between gap-4 font-display font-semibold">
            <dt>{t('qaTest.shipping.total')}</dt>
            <dd className="font-mono text-xs font-semibold">{formatPrice(totalCents)}</dd>
          </div>
        </dl>

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('common.loading') : t('qaTest.shipping.submit')}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </section>
  );
}

function ShippingField({
  field,
  label,
  autoComplete,
  fallback,
}: {
  field: {
    name: string;
    state: { value: string; meta: { errors: unknown[] } };
    handleBlur: () => void;
    handleChange: (value: string) => void;
  };
  label: string;
  autoComplete: string;
  fallback: string;
}) {
  const error = fieldErrorText(field.state.meta.errors, fallback);
  const errorId = `${field.name}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={field.name}
        className="block font-display text-xs font-semibold leading-none text-black"
      >
        {label}
        <span className="text-jp-stock-red"> *</span>
      </label>
      <input
        id={field.name}
        name={field.name}
        type="text"
        autoComplete={autoComplete}
        value={field.state.value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        className={qaFieldClassName(Boolean(error))}
      />
      {error ? (
        <p id={errorId} className="text-xs text-jp-accent-red" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
