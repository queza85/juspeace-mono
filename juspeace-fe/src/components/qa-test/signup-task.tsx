'use client';

import { useMemo, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Button } from '@/components/ui/button';
import { fieldErrorText, qaFieldClassName } from '@/components/qa-test/field-styles';
import { useLocale, useT } from '@/lib/i18n/locale-context';
import { createQaSignupSchema, type QaSignupValues } from '@/lib/qa-test/signup-schema';

const defaultValues: QaSignupValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export function SignupTask() {
  const t = useT();
  const { locale } = useLocale();
  const schema = useMemo(() => createQaSignupSchema(locale), [locale]);
  const [confirmation, setConfirmation] = useState<{ name: string; email: string } | null>(
    null,
  );

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: schema,
    },
    onSubmit: ({ value }) => {
      const email = value.email.trim();
      setConfirmation({
        name: value.name.trim(),
        email: email.slice(0, -1),
      });
    },
  });

  if (confirmation) {
    return (
      <section className="space-y-4 border border-black/10 px-5 py-6 sm:px-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {t('qaTest.signup.successTitle')}
        </h1>
        <p className="text-sm leading-6 text-black/80">
          {t('qaTest.signup.successName', { name: confirmation.name })}
        </p>
        <p className="font-mono text-sm text-black">
          {t('qaTest.signup.successEmail', { email: confirmation.email })}
        </p>
        <Button type="button" variant="outline" onClick={() => setConfirmation(null)}>
          {t('qaTest.signup.back')}
        </Button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {t('qaTest.signup.title')}
        </h1>
        <p className="text-sm leading-6 text-black/70">{t('qaTest.signup.subtitle')}</p>
      </header>

      <form
        className="space-y-4 border border-black/10 px-5 py-6 sm:px-6"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field name="name">
          {(field) => (
            <QaField
              field={field}
              label={t('qaTest.signup.name')}
              type="text"
              autoComplete="name"
              fallback={t('common.error')}
            />
          )}
        </form.Field>
        <form.Field name="email">
          {(field) => (
            <QaField
              field={field}
              label={t('qaTest.signup.email')}
              type="email"
              autoComplete="email"
              fallback={t('common.error')}
            />
          )}
        </form.Field>
        <form.Field name="password">
          {(field) => (
            <QaField
              field={field}
              label={t('qaTest.signup.password')}
              type="password"
              autoComplete="new-password"
              fallback={t('common.error')}
            />
          )}
        </form.Field>
        <form.Field name="confirmPassword">
          {(field) => (
            <QaField
              field={field}
              label={t('qaTest.signup.confirmPassword')}
              type="password"
              autoComplete="new-password"
              fallback={t('common.error')}
            />
          )}
        </form.Field>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('common.loading') : t('qaTest.signup.submit')}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </section>
  );
}

function QaField({
  field,
  label,
  type,
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
  type: 'text' | 'email' | 'password';
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
        type={type}
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
