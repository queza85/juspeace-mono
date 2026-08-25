'use client';

import { useForm } from '@tanstack/react-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-context';
import { loginFormSchema } from '@/lib/auth/login-schema';
import { t } from '@/lib/i18n';

function fieldErrorText(errors: unknown[]): string | null {
  if (!errors.length) {
    return null;
  }

  const first = errors[0];
  if (typeof first === 'string') {
    return first;
  }
  if (
    first &&
    typeof first === 'object' &&
    'message' in first &&
    typeof (first as { message: unknown }).message === 'string'
  ) {
    return (first as { message: string }).message;
  }
  return t('common.error');
}

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: loginFormSchema,
    },
    onSubmit: async ({ value }) => {
      await login(value.email, value.password);
      const returnUrl = searchParams.get('returnUrl') || '/account';
      router.replace(returnUrl.startsWith('/') ? returnUrl : '/account');
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
      className="mx-auto flex w-full max-w-sm flex-col gap-4"
    >
      <form.Field name="email">
        {(field) => {
          const error = fieldErrorText(field.state.meta.errors);
          return (
            <div className="flex flex-col gap-1.5">
              <label htmlFor={field.name} className="text-sm font-medium">
                {t('auth.email')}
              </label>
              <input
                id={field.name}
                name={field.name}
                type="email"
                autoComplete="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              />
              {field.state.meta.isTouched && error ? (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
            </div>
          );
        }}
      </form.Field>

      <form.Field name="password">
        {(field) => {
          const error = fieldErrorText(field.state.meta.errors);
          return (
            <div className="flex flex-col gap-1.5">
              <label htmlFor={field.name} className="text-sm font-medium">
                {t('auth.password')}
              </label>
              <input
                id={field.name}
                name={field.name}
                type="password"
                autoComplete="current-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              />
              {field.state.meta.isTouched && error ? (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
            </div>
          );
        }}
      </form.Field>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('common.loading') : t('auth.login')}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
