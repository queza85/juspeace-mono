'use client';

import { useMemo, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import {
  AlertTriangle,
  Calendar,
  Check,
  ChevronDown,
  CreditCard,
} from 'lucide-react';
import {
  createPaymentFormSchema,
  type PaymentFormValues,
  type PaymentMethod,
} from '@/lib/checkout/payment-schema';
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
  brandClassName?: string;
}[] = [
  { id: 'card', labelKey: 'payment.methods.card' },
  { id: 'apple_pay', labelKey: 'payment.methods.applePay' },
  { id: 'google_pay', labelKey: 'payment.methods.googlePay' },
  { id: 'paypal', labelKey: 'payment.methods.paypal' },
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
  const digits = value.replace(/\D/g, '');
  return digits.length >= 13 && digits.length <= 19;
}

function PaymentMethodCheckmark() {
  return (
    <span className="absolute -right-px -top-px flex size-4 items-center justify-center rounded-full bg-black">
      <Check className="size-2.5 text-white" strokeWidth={3} aria-hidden />
    </span>
  );
}

function ApplePayMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5 shrink-0"
      aria-hidden
      fill="currentColor"
    >
      <path d="M16.34 12.67c-.02-2.14 1.75-3.17 1.83-3.22-1-.14-1.96.59-2.47.59-.52 0-1.31-.57-2.16-.55-1.11.02-2.14.65-2.71 1.65-1.16 2.01-.3 4.98.83 6.61.55.8 1.2 1.69 2.06 1.66.83-.03 1.14-.54 2.14-.54 1 0 1.28.54 2.15.52.89-.01 1.45-.81 1.99-1.62.63-.92.89-1.82.9-1.87-.02-.01-1.74-.67-1.76-2.65zm-1.66-4.86c.46-.56.77-1.33.69-2.1-.67.03-1.47.45-1.95 1.01-.43.5-.8 1.29-.7 2.05.74.06 1.5-.37 1.96-.96z" />
    </svg>
  );
}

function GooglePayMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0" aria-hidden>
      <path
        fill="#4285F4"
        d="M21.8 12.227c0-.709-.064-1.39-.182-2.045H12v3.868h5.502a4.64 4.64 0 0 1-2.014 3.045v2.091h3.259c1.909-1.758 3.053-4.345 3.053-7.959z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.964-.895 6.618-2.423l-3.259-2.091c-.905.605-2.064.964-3.359.964-2.582 0-4.773-1.745-5.555-4.091H3.18v2.159A9.996 9.996 0 0 0 12 22z"
      />
      <path
        fill="#FBBC05"
        d="M6.445 13.359A5.985 5.985 0 0 1 6.14 12c0-.473.082-.932.223-1.359V8.482H3.18A9.996 9.996 0 0 0 2 12c0 1.614.386 3.141 1.068 4.518l3.377-2.159z"
      />
      <path
        fill="#EA4335"
        d="M12 5.864c1.468 0 2.786.505 3.823 1.496l2.868-2.868C16.955 2.864 14.695 2 12 2 8.091 2 4.818 4.137 3.18 7.482l3.377 2.159C7.227 7.609 9.418 5.864 12 5.864z"
      />
    </svg>
  );
}

function PayPalMark() {
  return (
    <span className="font-display text-sm font-bold leading-none">
      <span className="text-[#003087]">Pay</span>
      <span className="text-[#009CDE]">Pal</span>
    </span>
  );
}

const BILLING_ZIP_CODES = ['60601', '60602', '60603'] as const;

function PaymentMethodButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex h-11 w-full items-center justify-center gap-2 rounded-none border px-2 text-center transition-colors sm:h-12 sm:gap-2.5 sm:px-3',
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
        <h2 className="font-display text-sm font-semibold text-black">
          {t('payment.chooseMethod')}
        </h2>

        <form.Field name="paymentMethod">
          {(field) => (
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
              {PAYMENT_METHOD_OPTIONS.map((option) => {
                const selected = field.state.value === option.id;

                return (
                  <PaymentMethodButton
                    key={option.id}
                    selected={selected}
                    onClick={() => field.handleChange(option.id)}
                  >
                    {option.id === 'card' ? (
                      <>
                        <CreditCard
                          className="size-4 shrink-0 text-black sm:size-[18px]"
                          aria-hidden
                        />
                        <span className="font-display text-[10px] font-semibold leading-tight text-black sm:text-[11px]">
                          {t(option.labelKey)}
                        </span>
                      </>
                    ) : option.id === 'apple_pay' ? (
                      <>
                        <ApplePayMark />
                        <span className="font-display text-sm font-semibold text-black">
                          Pay
                        </span>
                      </>
                    ) : option.id === 'google_pay' ? (
                      <>
                        <GooglePayMark />
                        <span className="font-display text-sm font-semibold text-black">
                          Pay
                        </span>
                      </>
                    ) : (
                      <>
                        <PayPalMark />
                        <span className="sr-only">{t(option.labelKey)}</span>
                      </>
                    )}
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
              <h2 className="font-display text-sm font-semibold text-black">
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
                                field.handleChange(event.target.value)
                              }
                              placeholder={t('payment.placeholders.cardNumber')}
                              aria-invalid={Boolean(error)}
                              className={cn(
                                fieldInputClassName(Boolean(error)),
                                'pr-16',
                              )}
                            />
                            {showCardBadge ? (
                              <span className="pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                                <span className="font-display text-[10px] font-bold tracking-wide text-[#1A1F71] sm:text-[11px]">
                                  VISA
                                </span>
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
                              autoComplete="cc-exp"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(event) =>
                                field.handleChange(event.target.value)
                              }
                              placeholder={t('payment.placeholders.expiryDate')}
                              aria-invalid={Boolean(error)}
                              className={cn(
                                fieldInputClassName(Boolean(error)),
                                'pr-9',
                              )}
                            />
                            <Calendar
                              className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-black/45"
                              aria-hidden
                            />
                          </div>
                        </FormFieldStack>
                      );
                    }}
                  </form.Field>

                  <form.Field name="cvv">
                    {(field) => {
                      const error = fieldErrorText(
                        field.state.meta.errors,
                        t('common.error'),
                      );

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
                              field.handleChange(event.target.value)
                            }
                            placeholder={t('payment.placeholders.cvv')}
                            aria-invalid={Boolean(error)}
                            className={fieldInputClassName(Boolean(error))}
                          />
                        </FormFieldStack>
                      );
                    }}
                  </form.Field>
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
        <h2 className="font-display text-sm font-semibold text-black">
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
