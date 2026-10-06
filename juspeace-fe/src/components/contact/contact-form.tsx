'use client';

import { useMemo, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Button } from '@/components/ui/button';
import { createContactInquiry } from '@/lib/api/contact';
import { createContactSchema, type ContactFormValues } from '@/lib/contact/contact-schema';
import { useLocale, useT } from '@/lib/i18n/locale-context';

const inputClass =
  'h-11 w-full rounded-md border border-black/15 bg-white px-3 text-sm outline-none focus-visible:border-ring';

const fields = [
  { name: 'name', labelKey: 'contact.name', type: 'text' },
  { name: 'email', labelKey: 'contact.email', type: 'email' },
  { name: 'phone', labelKey: 'contact.phone', type: 'tel' },
  { name: 'subject', labelKey: 'contact.subject', type: 'text' },
] as const;

export function ContactForm() {
  const t = useT();
  const { locale } = useLocale();
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const schema = useMemo(() => createContactSchema(locale), [locale]);

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    } satisfies ContactFormValues,
    validators: {
      onSubmit: ({ value }) => {
        const parsed = schema.safeParse(value);
        if (parsed.success) {
          return undefined;
        }
        const fieldErrors: Record<string, string> = {};
        for (const issue of parsed.error.issues) {
          const key = String(issue.path[0] ?? '');
          if (key && !fieldErrors[key]) {
            fieldErrors[key] = issue.message;
          }
        }
        return { fields: fieldErrors };
      },
    },
    onSubmit: async ({ value, formApi }) => {
      const parsed = schema.parse(value);
      setSubmitError(false);
      try {
        await createContactInquiry({
          name: parsed.name,
          email: parsed.email,
          phone: parsed.phone || undefined,
          subject: parsed.subject || undefined,
          message: parsed.message,
          locale,
        });
      } catch {
        setSubmitError(true);
        return;
      }
      setSent(true);
      formApi.reset();
    },
  });

  if (sent) {
    return (
      <div className="max-w-xl">
        <p className="text-sm leading-7">{t('contact.sent')}</p>
        <Button type="button" className="mt-6" onClick={() => setSent(false)}>
          {t('contact.sendAnother')}
        </Button>
      </div>
    );
  }

  return (
    <form
      className="grid max-w-xl gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      {fields.map((field) => (
        <form.Field key={field.name} name={field.name}>
          {(fieldApi) => {
            const error = fieldApi.state.meta.errors[0];
            return (
              <label>
                <span className="mb-1 block text-xs font-medium">{t(field.labelKey)}</span>
                <input
                  className={inputClass}
                  type={field.type}
                  value={fieldApi.state.value}
                  onBlur={fieldApi.handleBlur}
                  onChange={(event) => fieldApi.handleChange(event.target.value)}
                />
                {error ? (
                  <span className="mt-1 block text-xs text-destructive">
                    {typeof error === 'string' ? error : t('contact.validation.nameRequired')}
                  </span>
                ) : null}
              </label>
            );
          }}
        </form.Field>
      ))}
      <form.Field name="message">
        {(fieldApi) => {
          const error = fieldApi.state.meta.errors[0];
          return (
            <label>
              <span className="mb-1 block text-xs font-medium">{t('contact.message')}</span>
              <textarea
                className={`${inputClass} min-h-36 py-2`}
                value={fieldApi.state.value}
                onBlur={fieldApi.handleBlur}
                onChange={(event) => fieldApi.handleChange(event.target.value)}
              />
              {error ? (
                <span className="mt-1 block text-xs text-destructive">
                  {typeof error === 'string' ? error : t('contact.validation.messageRequired')}
                </span>
              ) : null}
            </label>
          );
        }}
      </form.Field>
      {submitError ? <p className="text-sm text-destructive">{t('contact.sendFailed')}</p> : null}
      <div>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('contact.sending') : t('contact.submit')}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
