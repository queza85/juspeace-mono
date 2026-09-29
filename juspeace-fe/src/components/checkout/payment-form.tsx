'use client';

import { useMemo, type ReactNode } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  CreditCard,
} from 'lucide-react';
import {
  detectCardBrand,
  formatCardExpiry,
  formatCardNumber,
  formatCvv,
  isCompleteCardNumber,
} from '@/lib/checkout/card-input';
import {
  createPaymentFormSchema,
  type PaymentFormValues,
  type PaymentMethod,
} from '@/lib/checkout/payment-schema';
import { VisaLogo } from '@/components/checkout/visa-logo';
import { useLocale, useT } from '@/lib/i18n/locale-context';
import { cn } from '@/lib/utils';
import { useCheckoutStore } from '@/stores/checkout-store';

const inputClassName =
  'h-9 w-full rounded-none border bg-white px-2.5 font-mono text-[11px] text-black outline-none placeholder:text-jp-muted sm:text-xs';

function fieldInputClassName(hasError?: boolean) {
  return cn(
    inputClassName,
    hasError
      ? 'border-jp-accent-red focus:border-jp-accent-red'
      : 'border-black/15 focus:border-black/40',
  );
}

const PAYMENT_METHOD_OPTIONS: {
  id: PaymentMethod;
  labelKey: string;
  markLabelKey: string;
  logoSrc?: string;
}[] = [
  { id: 'card', labelKey: 'payment.methods.card', markLabelKey: 'payment.methods.card' },
  {
    id: 'apple_pay',
    labelKey: 'payment.methods.applePay',
    markLabelKey: 'payment.methods.pay',
    logoSrc: '/payment-method-checkout/apple-pay-logo.png',
  },
  {
    id: 'google_pay',
    labelKey: 'payment.methods.googlePay',
    markLabelKey: 'payment.methods.pay',
    logoSrc: '/payment-method-checkout/google-pay-logo.png',
  },
  {
    id: 'paypal',
    labelKey: 'payment.methods.paypal',
    markLabelKey: 'payment.methods.paypalMark',
    logoSrc: '/payment-method-checkout/paypal-logo.png',
  },
];

const BILLING_COUNTRIES = [
  { value: 'US', labelKey: 'payment.countries.unitedStates' },
  { value: 'KR', labelKey: 'payment.countries.korea' },
] as const;

const BILLING_STATES = [
  { value: 'chicago', labelKey: 'payment.states.chicago' },
  { value: 'california', labelKey: 'payment.states.california' },
  { value: 'newYork', labelKey: 'payment.states.newYork' },
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
      className="mt-1.5 flex items-start gap-1 font-mono text-[11px] leading-snug text-jp-accent-red sm:text-xs"
    >
      <AlertTriangle className="mt-px size-3 shrink-0" aria-hidden />
      <span>{message}</span>
    </p>
  );
}

function isLikelyValidCardNumber(value: string): boolean {
  return isCompleteCardNumber(value) && detectCardBrand(value) === 'visa';
}

function PaymentMethodCheckmark() {
  return (
    <span className="pointer-events-none absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-black">
      <Check className="size-2.5 text-white" strokeWidth={3} aria-hidden />
    </span>
  );
}

function PaymentBrandLogo({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt=""
      width={22}
      height={22}
      className="size-[22px] shrink-0 object-contain"
      aria-hidden
    />
  );
}

const BILLING_ZIP_CODES = ['60601', '60602', '60603'] as const;

function PaymentMethodButton({
  selected,
  onClick,
  label,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'relative inline-flex h-11 w-auto items-center justify-center gap-2 rounded-none border px-3 transition-colors sm:h-12 sm:gap-2.5 sm:px-3.5',
        selected
          ? 'border-2 border-black'
          : 'border border-black/10 hover:border-black/30',
      )}
    >
      {selected ? <PaymentMethodCheckmark /> : null}
      {children}
    </button>
  );
}

function FormFieldStack({
  label,
  htmlFor,
  required,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div>
      <FieldLabel htmlFor={htmlFor} required={required}>
        {label}
      </FieldLabel>
      <div className="mt-1.5">{children}</div>
      {error ? <FieldError message={error} /> : null}
    </div>
  );
}

export function PaymentForm() {
  const t = useT();
  const router = useRouter();
  const setPayment = useCheckoutStore((state) => state.setPayment);
  const { locale } = useLocale();
  const schema = useMemo(() => createPaymentFormSchema(locale), [locale]);

  const defaultValues: PaymentFormValues = {
    paymentMethod: 'card',
    nameOnCard: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    saveCard: true,
    billingSameAsShipping: false,
    billingLine1: '',
    billingLine2: '',
    billingCountry: 'US',
    billingState: 'chicago',
    billingZipCode: '',
  };

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      setPayment(value);
      router.push('/checkout/review');
    },
  });

  return (
    <form
      id="checkout-payment-form"
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <section className="border border-black/10 p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold text-black">
          {t('payment.chooseMethod')}
        </h2>

        <form.Field name="paymentMethod">
          {(field) => (
            <div className="mt-4 flex flex-wrap items-center gap-2.5 sm:gap-3">
              {PAYMENT_METHOD_OPTIONS.map((option) => {
                const selected = field.state.value === option.id;

                return (
                  <PaymentMethodButton
                    key={option.id}
                    selected={selected}
                    label={t(option.labelKey)}
                    onClick={() => field.handleChange(option.id)}
                  >
                    {option.logoSrc ? (
                      <PaymentBrandLogo src={option.logoSrc} />
                    ) : (
                      <CreditCard
                        className="size-5 shrink-0 text-black"
                        aria-hidden
                      />
                    )}
                    <span className="whitespace-nowrap font-display text-sm font-medium leading-none text-black">
                      {t(option.markLabelKey)}
                    </span>
                  </PaymentMethodButton>
                );
              })}
            </div>
          )}
        </form.Field>
      </section>

      <form.Subscribe selector={(state) => state.values.paymentMethod}>
        {(paymentMethod) =>
          paymentMethod === 'card' ? (
            <section className="border border-black/10 p-5 sm:p-6">
              <h2 className="font-display text-lg font-bold text-black">
                {t('payment.cardPayment')}
              </h2>

              <div className="mt-4 space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <form.Field name="nameOnCard">
                    {(field) => {
                      const error = fieldErrorText(
                        field.state.meta.errors,
                        t('common.error'),
                      );

                      return (
                        <FormFieldStack
                          label={t('payment.fields.nameOnCard')}
                          htmlFor={field.name}
                          required
                          error={error}
                        >
                          <input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                            placeholder={t('payment.placeholders.nameOnCard')}
                            aria-invalid={Boolean(error)}
                            className={fieldInputClassName(Boolean(error))}
                          />
                        </FormFieldStack>
                      );
                    }}
                  </form.Field>

                  <form.Field name="cardNumber">
                    {(field) => {
                      const error = fieldErrorText(
                        field.state.meta.errors,
                        t('common.error'),
                      );
                      const showCardBadge = isLikelyValidCardNumber(
                        field.state.value,
                      );

                      return (
                        <FormFieldStack
                          label={t('payment.fields.cardNumber')}
                          htmlFor={field.name}
                          required
                          error={error}
                        >
                          <div className="relative">
                            <input
                              id={field.name}
                              name={field.name}
                              inputMode="numeric"
                              autoComplete="cc-number"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(event) =>
                                field.handleChange(
                                  formatCardNumber(event.target.value),
                                )
                              }
                              placeholder={t('payment.placeholders.cardNumber')}
                              aria-invalid={Boolean(error)}
                              className={cn(
                                fieldInputClassName(Boolean(error)),
                                'pr-20',
                              )}
                            />
                            {showCardBadge ? (
                              <span className="pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
                                <VisaLogo alt={t('payment.visa')} />
                                <span className="flex size-3.5 items-center justify-center rounded-full bg-black">
                                  <Check
                                    className="size-2 text-white"
                                    strokeWidth={3}
                                    aria-hidden
                                  />
                                </span>
                              </span>
                            ) : null}
                          </div>
                        </FormFieldStack>
                      );
                    }}
                  </form.Field>

                  <form.Field name="expiryDate">
                    {(field) => {
                      const error = fieldErrorText(
                        field.state.meta.errors,
                        t('common.error'),
                      );

                      return (
                        <FormFieldStack
                          label={t('payment.fields.expiryDate')}
                          htmlFor={field.name}
                          required
                          error={error}
                        >
                          <div className="relative">
                            <input
                              id={field.name}
                              name={field.name}
                              inputMode="numeric"
                              autoComplete="cc-exp"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(event) =>
                                field.handleChange(
                                  formatCardExpiry(
                                    event.target.value,
                                    field.state.value,
                                  ),
                                )
                              }
                              placeholder={t('payment.placeholders.expiryDate')}
                              aria-invalid={Boolean(error)}
                              className={fieldInputClassName(Boolean(error))}
                            />
                          </div>
                        </FormFieldStack>
                      );
                    }}
                  </form.Field>

                  <form.Subscribe
                    selector={(state) => state.values.cardNumber}
                  >
                    {(cardNumber) => (
                      <form.Field name="cvv">
                        {(field) => {
                          const error = fieldErrorText(
                            field.state.meta.errors,
                            t('common.error'),
                          );
                          const brand = detectCardBrand(cardNumber);

                          return (
                            <FormFieldStack
                              label={t('payment.fields.cvv')}
                              htmlFor={field.name}
                              required
                              error={error}
                            >
                              <input
                                id={field.name}
                                name={field.name}
                                inputMode="numeric"
                                autoComplete="cc-csc"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(event) =>
                                  field.handleChange(
                                    formatCvv(event.target.value, brand),
                                  )
                                }
                                placeholder={
                                  brand === 'amex'
                                    ? t('payment.placeholders.cvvAmex')
                                    : t('payment.placeholders.cvv')
                                }
                                aria-invalid={Boolean(error)}
                                className={fieldInputClassName(Boolean(error))}
                              />
                            </FormFieldStack>
                          );
                        }}
                      </form.Field>
                    )}
                  </form.Subscribe>
                </div>

                <form.Field name="saveCard">
                  {(field) => (
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.checked)
                        }
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
                          <Check
                            className="size-2.5 text-white"
                            strokeWidth={3}
                          />
                        ) : null}
                      </span>
                      <span className="font-mono text-[11px] text-jp-muted sm:text-xs">
                        {t('payment.saveCard')}
                      </span>
                    </label>
                  )}
                </form.Field>
              </div>
            </section>
          ) : null
        }
      </form.Subscribe>

      <section className="border border-black/10 p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold text-black">
          {t('payment.billingAddress')}
        </h2>

        <form.Field name="billingSameAsShipping">
          {(field) => (
            <label className="mt-4 flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(event) =>
                  field.handleChange(event.target.checked)
                }
                className="sr-only"
              />
              <span
                className={cn(
                  'relative h-5 w-9 shrink-0 rounded-full transition-colors',
                  field.state.value ? 'bg-black' : 'bg-neutral-300',
                )}
                aria-hidden
              >
                <span
                  className={cn(
                    'absolute top-0.5 size-4 rounded-full bg-white transition-transform',
                    field.state.value ? 'left-[18px]' : 'left-0.5',
                  )}
                />
              </span>
              <span className="font-mono text-[11px] text-jp-muted sm:text-xs">
                {t('payment.billingSameAsShipping')}
              </span>
            </label>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => state.values.billingSameAsShipping}>
          {(billingSameAsShipping) =>
            !billingSameAsShipping ? (
              <div className="mt-5 space-y-5">
                <div>
                  <FieldLabel>{t('payment.streetAddress')}</FieldLabel>
                  <div className="mt-1.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <form.Field name="billingLine1">
                      {(field) => {
                        const error = fieldErrorText(
                          field.state.meta.errors,
                          t('common.error'),
                        );

                        return (
                          <div>
                            <input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(event) =>
                                field.handleChange(event.target.value)
                              }
                              placeholder={t('payment.placeholders.line1')}
                              aria-invalid={Boolean(error)}
                              className={fieldInputClassName(Boolean(error))}
                            />
                            {error ? <FieldError message={error} /> : null}
                          </div>
                        );
                      }}
                    </form.Field>
                    <form.Field name="billingLine2">
                      {(field) => (
                        <input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          placeholder={t('payment.placeholders.line2')}
                          className={fieldInputClassName(false)}
                        />
                      )}
                    </form.Field>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <form.Field name="billingCountry">
                    {(field) => {
                      const error = fieldErrorText(
                        field.state.meta.errors,
                        t('common.error'),
                      );

                      return (
                        <FormFieldStack
                          label={t('payment.fields.country')}
                          htmlFor={field.name}
                          required
                          error={error}
                        >
                          <div className="relative">
                            <ChevronDown
                              className="pointer-events-none absolute right-2.5 top-1/2 size-3 -translate-y-1/2 text-black/45"
                              aria-hidden
                            />
                            <select
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(event) =>
                                field.handleChange(event.target.value)
                              }
                              className={cn(
                                fieldInputClassName(Boolean(error)),
                                'appearance-none pr-8',
                              )}
                            >
                              {BILLING_COUNTRIES.map((country) => (
                                <option key={country.value} value={country.value}>
                                  {t(country.labelKey)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </FormFieldStack>
                      );
                    }}
                  </form.Field>

                  <form.Field name="billingState">
                    {(field) => {
                      const error = fieldErrorText(
                        field.state.meta.errors,
                        t('common.error'),
                      );

                      return (
                        <FormFieldStack
                          label={t('payment.fields.stateProvince')}
                          htmlFor={field.name}
                          required
                          error={error}
                        >
                          <div className="relative">
                            <ChevronDown
                              className="pointer-events-none absolute right-2.5 top-1/2 size-3 -translate-y-1/2 text-black/45"
                              aria-hidden
                            />
                            <select
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(event) =>
                                field.handleChange(event.target.value)
                              }
                              className={cn(
                                fieldInputClassName(Boolean(error)),
                                'appearance-none pr-8',
                              )}
                            >
                              {BILLING_STATES.map((state) => (
                                <option key={state.value} value={state.value}>
                                  {t(state.labelKey)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </FormFieldStack>
                      );
                    }}
                  </form.Field>

                  <form.Field name="billingZipCode">
                    {(field) => {
                      const error = fieldErrorText(
                        field.state.meta.errors,
                        t('common.error'),
                      );

                      return (
                        <FormFieldStack
                          label={t('payment.fields.zipCode')}
                          htmlFor={field.name}
                          required
                          error={error}
                        >
                          <div className="relative">
                            <ChevronDown
                              className="pointer-events-none absolute right-2.5 top-1/2 size-3 -translate-y-1/2 text-black/45"
                              aria-hidden
                            />
                            <select
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(event) =>
                                field.handleChange(event.target.value)
                              }
                              className={cn(
                                fieldInputClassName(Boolean(error)),
                                'appearance-none pr-8',
                                !field.state.value && 'text-jp-muted',
                              )}
                            >
                              <option value="">
                                {t('payment.placeholders.zipCode')}
                              </option>
                              {BILLING_ZIP_CODES.map((zip) => (
                                <option key={zip} value={zip} className="text-black">
                                  {zip}
                                </option>
                              ))}
                            </select>
                          </div>
                        </FormFieldStack>
                      );
                    }}
                  </form.Field>
                </div>
              </div>
            ) : null
          }
        </form.Subscribe>
      </section>
    </form>
  );
}
