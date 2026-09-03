'use client';

import Image from 'next/image';
import { useMemo, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { AlertTriangle, Check, ChevronDown, MapPin, Package } from 'lucide-react';
import {
  createShippingFormSchema,
  type ShippingFormValues,
} from '@/lib/checkout/shipping-schema';
import { useLocale, useT } from '@/lib/i18n/locale-context';
import { cn } from '@/lib/utils';
import { useCheckoutStore } from '@/stores/checkout-store';

const inputClassName =
  'h-9 w-full rounded-none border bg-white px-2.5 font-mono text-[11px] text-black outline-none placeholder:text-jp-muted sm:text-xs';

function fieldInputClassName(hasError?: boolean) {
  return cn(
    inputClassName,
    hasError
      ? 'border-jp-stock-red focus:border-jp-stock-red'
      : 'border-black/15 focus:border-black/40',
  );
}

const FLAG_KO = '/header/korea.png';
const FLAG_US = '/header/english.png';

const PHONE_COUNTRY_OPTIONS = [
  { iso: 'KR', code: '+82', flagSrc: FLAG_KO, labelKey: 'checkout.phoneCountries.korea' },
  { iso: 'US', code: '+1', flagSrc: FLAG_US, labelKey: 'checkout.phoneCountries.usa' },
] as const;

function FieldLabel({
  htmlFor,
  required,
  className,
  children,
}: {
  htmlFor?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const labelClassName = cn(
    'font-display text-xs font-semibold leading-none text-black',
    className,
  );

  if (htmlFor) {
    return (
      <label htmlFor={htmlFor} className={labelClassName}>
        {children}
        {required ? <span className="text-jp-stock-red"> *</span> : null}
      </label>
    );
  }

  return (
    <p className={labelClassName}>
      {children}
      {required ? <span className="text-jp-stock-red"> *</span> : null}
    </p>
  );
}

function fieldErrorText(errors: unknown[], fallback: string): string | null {
  if (!errors.length) return null;
  const first = errors[0];
  if (typeof first === 'string') return first;
  if (
    first &&
    typeof first === 'object' &&
    'message' in first &&
    typeof (first as { message: unknown }).message === 'string'
  ) {
    return (first as { message: string }).message;
  }
  return fallback;
}

function FieldError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="mt-1.5 flex items-start gap-1 font-mono text-[11px] leading-snug text-jp-stock-red sm:text-xs"
    >
      <AlertTriangle className="mt-px size-3 shrink-0" aria-hidden />
      <span>{message}</span>
    </p>
  );
}

export function ShippingForm() {
  const t = useT();
  const router = useRouter();
  const setShipping = useCheckoutStore((state) => state.setShipping);
  const { locale } = useLocale();
  const schema = useMemo(() => createShippingFormSchema(locale), [locale]);

  const defaultValues: ShippingFormValues = {
    name: '',
    phoneCountryCode: '+82',
    phoneNumber: '',
    address: '',
    city: '',
    postalCode: '',
    deliveryNote: '',
    saveForNextTime: true,
    shippingMethod: 'standard',
  };

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      setShipping(value);
      router.push('/checkout/payment');
    },
  });

  return (
    <form
      id="checkout-shipping-form"
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <section className="border border-black/10 p-5 sm:p-6">
        <h2 className="font-display text-sm font-semibold text-black">
          {t('checkout.shippingDetails')}
        </h2>

        <div className="mt-4 space-y-5">
          <div className="grid grid-cols-1 gap-x-5 gap-y-1.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <form.Field name="name">
              {(field) => {
                const nameError = fieldErrorText(
                  field.state.meta.errors,
                  t('common.error'),
                );

                return (
                  <>
                    <FieldLabel
                      htmlFor={field.name}
                      required
                      className="sm:col-start-1 sm:row-start-1"
                    >
                      {t('checkout.fields.name')}
                    </FieldLabel>
                    <div className="sm:col-start-1 sm:row-start-2">
                      <input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder={t('checkout.placeholders.name')}
                        aria-invalid={Boolean(nameError)}
                        className={fieldInputClassName(Boolean(nameError))}
                      />
                      {nameError ? <FieldError message={nameError} /> : null}
                    </div>
                  </>
                );
              }}
            </form.Field>

            <FieldLabel
              required
              className="sm:col-start-2 sm:row-start-1"
            >
              {t('checkout.fields.phoneNumber')}
            </FieldLabel>
            <div className="sm:col-start-2 sm:row-start-2">
              <form.Subscribe
                selector={(state) => state.fieldMeta.phoneNumber?.errors}
              >
                {(phoneErrors) => {
                  const phoneError = fieldErrorText(
                    phoneErrors ?? [],
                    t('common.error'),
                  );
                  const hasPhoneError = Boolean(phoneError);

                  return (
                    <>
                      <div className="flex items-center gap-2">
                        <form.Field name="phoneCountryCode">
                          {(field) => {
                            const selectedOption =
                              PHONE_COUNTRY_OPTIONS.find(
                                (option) => option.code === field.state.value,
                              ) ?? PHONE_COUNTRY_OPTIONS[0];

                            return (
                              <div className="relative w-[88px] shrink-0">
                                <Image
                                  src={selectedOption.flagSrc}
                                  alt=""
                                  width={24}
                                  height={16}
                                  className="pointer-events-none absolute left-2.5 top-1/2 z-10 h-3.5 w-5 -translate-y-1/2 object-cover"
                                  aria-hidden
                                />
                                <span
                                  className="pointer-events-none absolute left-9 top-1/2 z-10 -translate-y-1/2 font-mono text-[11px] text-black sm:text-xs"
                                  aria-hidden
                                >
                                  {selectedOption.code}
                                </span>
                                <ChevronDown
                                  className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-black/45"
                                  aria-hidden
                                />
                                <select
                                  id={field.name}
                                  name={field.name}
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) =>
                                    field.handleChange(
                                      event.target
                                        .value as ShippingFormValues['phoneCountryCode'],
                                    )
                                  }
                                  className={cn(
                                    fieldInputClassName(false),
                                    'appearance-none pr-6 pl-9 font-mono text-transparent',
                                  )}
                                  aria-label={t(
                                    'checkout.fields.phoneCountryCode',
                                  )}
                                >
                                  {PHONE_COUNTRY_OPTIONS.map((option) => (
                                    <option
                                      key={option.code}
                                      value={option.code}
                                      className="text-black"
                                    >
                                      {`${t(option.labelKey)} (${option.code})`}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            );
                          }}
                        </form.Field>
                        <form.Field name="phoneNumber">
                          {(field) => (
                            <div className="min-w-0 flex-1">
                              <input
                                id={field.name}
                                name={field.name}
                                type="tel"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(event) =>
                                  field.handleChange(event.target.value)
                                }
                                placeholder={t(
                                  'checkout.placeholders.phoneNumber',
                                )}
                                aria-invalid={hasPhoneError}
                                className={fieldInputClassName(hasPhoneError)}
                              />
                            </div>
                          )}
                        </form.Field>
                      </div>
                      {phoneError ? (
                        <FieldError message={phoneError} />
                      ) : null}
                    </>
                  );
                }}
              </form.Subscribe>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
            <form.Field name="address">
              {(field) => {
                const addressError = fieldErrorText(
                  field.state.meta.errors,
                  t('common.error'),
                );

                return (
                  <div>
                    <FieldLabel htmlFor={field.name} required>
                      {t('checkout.fields.address')}
                    </FieldLabel>
                    <input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder={t('checkout.placeholders.address')}
                      aria-invalid={Boolean(addressError)}
                      className={cn(fieldInputClassName(Boolean(addressError)), 'mt-1.5')}
                    />
                    {addressError ? (
                      <FieldError message={addressError} />
                    ) : null}
                  </div>
                );
              }}
            </form.Field>

            <form.Field name="city">
              {(field) => {
                const cityError = fieldErrorText(
                  field.state.meta.errors,
                  t('common.error'),
                );

                return (
                  <div>
                    <FieldLabel htmlFor={field.name} required>
                      {t('checkout.fields.city')}
                    </FieldLabel>
                    <input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder={t('checkout.placeholders.city')}
                      aria-invalid={Boolean(cityError)}
                      className={cn(fieldInputClassName(Boolean(cityError)), 'mt-1.5')}
                    />
                    {cityError ? <FieldError message={cityError} /> : null}
                  </div>
                );
              }}
            </form.Field>

            <form.Field name="postalCode">
              {(field) => {
                const postalCodeError = fieldErrorText(
                  field.state.meta.errors,
                  t('common.error'),
                );

                return (
                  <div>
                    <FieldLabel htmlFor={field.name} required>
                      {t('checkout.fields.postalCode')}
                    </FieldLabel>
                    <input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      placeholder={t('checkout.placeholders.postalCode')}
                      aria-invalid={Boolean(postalCodeError)}
                      className={cn(
                        fieldInputClassName(Boolean(postalCodeError)),
                        'mt-1.5',
                      )}
                    />
                    {postalCodeError ? (
                      <FieldError message={postalCodeError} />
                    ) : null}
                  </div>
                );
              }}
            </form.Field>
          </div>

          <form.Field name="deliveryNote">
            {(field) => (
              <div>
                <FieldLabel htmlFor={field.name}>
                  {t('checkout.fields.deliveryNote')}
                </FieldLabel>
                <textarea
                  id={field.name}
                  name={field.name}
                  rows={3}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder={t('checkout.placeholders.deliveryNote')}
                  className={cn(
                    fieldInputClassName(false),
                    'mt-1.5 min-h-[80px] resize-y py-2',
                  )}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="saveForNextTime">
            {(field) => (
              <label className="flex cursor-pointer items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  checked={field.state.value}
                  onChange={(event) => field.handleChange(event.target.checked)}
                  className="sr-only"
                />
                <span
                  className={cn(
                    'flex size-3.5 shrink-0 items-center justify-center border border-black',
                    field.state.value ? 'bg-black' : 'bg-white',
                  )}
                  aria-hidden
                >
                  {field.state.value ? (
                    <Check className="size-2.5 stroke-[2.5] text-white" />
                  ) : null}
                </span>
                <span className="font-mono text-[11px] text-black sm:text-xs">
                  {t('checkout.saveForNextTime')}
                </span>
              </label>
            )}
          </form.Field>
        </div>
      </section>

      <section className="border border-black/10 p-5 sm:p-6">
        <h2 className="font-display text-sm font-semibold text-black">
          {t('checkout.shippingMethod')}
        </h2>

        <form.Field name="shippingMethod">
          {(field) => (
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => field.handleChange('standard')}
                className={cn(
                  'flex w-full rounded-none border p-5 text-left transition-colors sm:p-6',
                  field.state.value === 'standard'
                    ? 'border-2 border-black'
                    : 'border border-black/10 hover:border-black/30',
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3 sm:gap-3.5">
                      <span
                        className={cn(
                          'flex size-5 shrink-0 items-center justify-center rounded-full border sm:size-6',
                          field.state.value === 'standard'
                            ? 'border-black'
                            : 'border-black/30',
                        )}
                        aria-hidden
                      >
                        {field.state.value === 'standard' ? (
                          <span className="size-2.5 rounded-full bg-black sm:size-3" />
                        ) : null}
                      </span>
                      <Package
                        className="size-6 shrink-0 text-black sm:size-7"
                        aria-hidden
                      />
                      <span className="font-display text-base font-semibold text-black sm:text-lg">
                        {t('checkout.methods.standard.title')}
                      </span>
                    </div>
                    <span className="shrink-0 font-mono text-sm font-semibold text-black sm:text-base">
                      {t('checkout.free')}
                    </span>
                  </div>
                  <p className="mt-2 pl-[4.25rem] font-mono text-sm text-jp-muted sm:pl-[5.5rem] sm:text-base">
                    {t('checkout.methods.standard.description')}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => field.handleChange('pickup')}
                className={cn(
                  'flex w-full rounded-none border p-5 text-left transition-colors sm:p-6',
                  field.state.value === 'pickup'
                    ? 'border-2 border-black'
                    : 'border border-black/10 hover:border-black/30',
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3 sm:gap-3.5">
                      <span
                        className={cn(
                          'flex size-5 shrink-0 items-center justify-center rounded-full border sm:size-6',
                          field.state.value === 'pickup'
                            ? 'border-black'
                            : 'border-black/30',
                        )}
                        aria-hidden
                      >
                        {field.state.value === 'pickup' ? (
                          <span className="size-2.5 rounded-full bg-black sm:size-3" />
                        ) : null}
                      </span>
                      <MapPin
                        className="size-6 shrink-0 text-black sm:size-7"
                        aria-hidden
                      />
                      <span className="font-display text-base font-semibold text-black sm:text-lg">
                        {t('checkout.methods.pickup.title')}
                      </span>
                    </div>
                    <span className="shrink-0 font-mono text-sm font-semibold text-black sm:text-base">
                      {t('checkout.free')}
                    </span>
                  </div>
                  <p className="mt-2 pl-[4.25rem] font-mono text-sm text-jp-muted sm:pl-[5.5rem] sm:text-base">
                    {t('checkout.methods.pickup.description')}
                  </p>
                </div>
              </button>
            </div>
          )}
        </form.Field>
      </section>
    </form>
  );
}
