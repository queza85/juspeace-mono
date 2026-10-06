'use client';

import { useMemo, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { listProducts } from '@/lib/api/products';
import { storedFileUrl, uploadImage } from '@/lib/api/site';
import { useAuth } from '@/lib/auth/auth-context';
import { useT } from '@/lib/i18n/locale-context';
import type { SiteField, SiteResourceConfig, SiteRow } from '@/lib/site/resources';

const inputClass =
  'h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm outline-none focus-visible:border-ring';

function readPath(row: SiteRow, key: string): unknown {
  return key.split('.').reduce<unknown>((current, part) => {
    if (current && typeof current === 'object' && part in current) {
      return (current as SiteRow)[part];
    }
    return undefined;
  }, row);
}

function blankValues(fields: SiteField[]): Record<string, string | number | boolean> {
  const values: Record<string, string | number | boolean> = {};
  for (const field of fields) {
    if (field.defaultValue !== undefined) {
      values[field.name] = field.defaultValue;
    } else if (field.type === 'checkbox') {
      values[field.name] = false;
    } else if (field.type === 'number') {
      values[field.name] = 0;
    } else if (field.type === 'select') {
      values[field.name] = field.options?.[0]?.value ?? '';
    } else {
      values[field.name] = '';
    }
  }
  return values;
}

function toDatetimeLocal(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function rowValues(row: SiteRow, fields: SiteField[]): Record<string, string | number | boolean> {
  const values = blankValues(fields);
  for (const field of fields) {
    const raw = row[field.name];
    if (field.type === 'checkbox') {
      values[field.name] = Boolean(raw);
    } else if (field.type === 'number') {
      values[field.name] = raw == null || raw === '' ? 0 : Number(raw);
    } else if (field.type === 'datetime') {
      values[field.name] = raw ? toDatetimeLocal(String(raw)) : '';
    } else {
      values[field.name] = raw == null ? '' : String(raw);
    }
  }
  return values;
}

function toBody(
  values: Record<string, string | number | boolean>,
  fields: SiteField[],
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const field of fields) {
    const value = values[field.name];
    if (field.type === 'number') {
      if (value === '' || value == null) {
        continue;
      }
      if (!field.required && field.defaultValue === undefined && Number(value) === 0) {
        continue;
      }
      body[field.name] = Number(value);
    } else if (field.type === 'checkbox') {
      body[field.name] = Boolean(value);
    } else if (field.type === 'datetime') {
      if (typeof value === 'string' && value.length > 0) {
        body[field.name] = new Date(value).toISOString();
      }
    } else if (typeof value === 'string') {
      body[field.name] = value.trim();
    } else {
      body[field.name] = value;
    }
  }
  return body;
}

function buildSchema(fields: SiteField[], requiredMessage: string) {
  const shape: Record<string, z.ZodType> = {};
  for (const field of fields) {
    if (field.type === 'checkbox') {
      shape[field.name] = z.boolean();
    } else if (field.type === 'number') {
      shape[field.name] = field.required
        ? z.coerce.number()
        : z.union([z.coerce.number(), z.literal('')]);
    } else if (field.required) {
      shape[field.name] = z.string().trim().min(1, requiredMessage);
    } else {
      shape[field.name] = z.string();
    }
  }
  return z.object(shape);
}

export function SiteResourcePage({ config }: { config: SiteResourceConfig }) {
  const t = useT();
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  const listQuery = useQuery({
    queryKey: [config.queryKey, accessToken],
    enabled: Boolean(accessToken),
    queryFn: () => config.list(accessToken ?? '') as Promise<SiteRow[]>,
  });

  const productsQuery = useQuery({
    queryKey: ['admin-site-products', accessToken],
    enabled: Boolean(accessToken) && Boolean(config.productField),
    queryFn: () => listProducts({ limit: 100, status: undefined }, accessToken ?? ''),
  });

  const fields = useMemo(() => {
    if (!config.productField) {
      return config.fields;
    }
    const options =
      productsQuery.data?.items.map((product) => ({
        value: product.id,
        label: `${product.name} (${product.slug})`,
      })) ?? [];
    return config.fields.map((field) =>
      field.name === config.productField ? { ...field, options } : field,
    );
  }, [config.fields, config.productField, productsQuery.data]);

  const editing = listQuery.data?.find((row) => String(row[config.idKey]) === editingId) ?? null;

  const saveMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      config.save(accessToken ?? '', body, editingId),
    onSuccess: async () => {
      setEditingId(null);
      setFormKey((current) => current + 1);
      await queryClient.invalidateQueries({ queryKey: [config.queryKey] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => config.remove?.(accessToken ?? '', id) ?? Promise.resolve(),
    onSuccess: async () => {
      setEditingId(null);
      setFormKey((current) => current + 1);
      await queryClient.invalidateQueries({ queryKey: [config.queryKey] });
    },
  });

  const showForm = config.canCreate || (config.canEdit && editingId);

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4">
      <header>
        <h1 className="text-lg font-semibold tracking-tight">{t(config.titleKey)}</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">{t(config.descriptionKey)}</p>
      </header>

      {config.noticeKey ? (
        <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          {t(config.noticeKey)}
        </p>
      ) : null}

      {showForm ? (
        <SiteForm
          key={`${formKey}-${editingId ?? 'new'}`}
          fields={fields}
          initialValues={editing ? rowValues(editing, fields) : blankValues(fields)}
          editing={Boolean(editing)}
          pending={saveMutation.isPending}
          onUploadImage={async (file) => {
            const uploaded = await uploadImage(accessToken ?? '', file);
            return uploaded.path;
          }}
          onSubmit={async (values) => {
            try {
              await saveMutation.mutateAsync(toBody(values, fields));
            } catch {
              return;
            }
          }}
          onClear={() => {
            setEditingId(null);
            setFormKey((current) => current + 1);
          }}
        />
      ) : null}

      {listQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      ) : null}
      {listQuery.isError ? (
        <div className="flex items-center gap-2">
          <p className="text-sm text-destructive">{t('common.error')}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void listQuery.refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
            <tr>
              {config.columns.map((column) => (
                <th key={column.key} className="px-3 py-2 font-medium">
                  {t(column.labelKey)}
                </th>
              ))}
              <th className="px-3 py-2 font-medium">{t('admin.site.actions.column')}</th>
            </tr>
          </thead>
          <tbody>
            {listQuery.data?.length ? (
              listQuery.data.map((row) => {
                const id = String(row[config.idKey]);
                return (
                  <tr key={id} className="border-b border-border/70 last:border-0">
                    {config.columns.map((column) => (
                      <td key={column.key} className="max-w-[280px] truncate px-3 py-2">
                        {formatCell(readPath(row, column.key), column.kind, t)}
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        {config.canEdit ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingId(id)}
                          >
                            {t('admin.site.actions.edit')}
                          </Button>
                        ) : null}
                        {config.canDelete ? (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={deleteMutation.isPending}
                            onClick={() => {
                              if (window.confirm(t('admin.site.actions.confirmDelete'))) {
                                void deleteMutation.mutateAsync(id).catch(() => undefined);
                              }
                            }}
                          >
                            {t('admin.site.actions.delete')}
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={config.columns.length + 1}
                  className="px-3 py-6 text-center text-sm text-muted-foreground"
                >
                  {t('admin.site.empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatCell(
  value: unknown,
  kind: 'text' | 'boolean' | 'money' | 'date' | undefined,
  t: (key: string) => string,
) {
  if (kind === 'boolean') {
    return value ? t('admin.site.actions.yes') : t('admin.site.actions.no');
  }
  if (kind === 'money') {
    const cents = typeof value === 'number' ? value : Number(value ?? 0);
    return `$${(cents / 100).toFixed(2)}`;
  }
  if (kind === 'date' && typeof value === 'string' && value) {
    return new Date(value).toLocaleString();
  }
  if (value == null || value === '') {
    return '—';
  }
  return String(value);
}

function SiteForm({
  fields,
  initialValues,
  editing,
  pending,
  onUploadImage,
  onSubmit,
  onClear,
}: {
  fields: SiteField[];
  initialValues: Record<string, string | number | boolean>;
  editing: boolean;
  pending: boolean;
  onUploadImage: (file: File) => Promise<string>;
  onSubmit: (values: Record<string, string | number | boolean>) => Promise<void>;
  onClear: () => void;
}) {
  const t = useT();
  const schema = useMemo(
    () => buildSchema(fields, t('admin.site.required')),
    [fields, t],
  );
  const form = useForm({
    defaultValues: initialValues,
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
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <form
      className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      {fields.map((field) => (
        <form.Field key={field.name} name={field.name}>
          {(fieldApi) => {
            const locked = editing && field.readOnlyOnEdit;
            const error = fieldApi.state.meta.errors[0];
            return (
              <label className={field.type === 'textarea' ? 'md:col-span-2' : undefined}>
                <span className="mb-1 block text-xs font-medium">{t(field.labelKey)}</span>
                {field.type === 'textarea' ? (
                  <textarea
                    className={`${inputClass} min-h-24 py-2`}
                    value={String(fieldApi.state.value ?? '')}
                    disabled={locked}
                    onBlur={fieldApi.handleBlur}
                    onChange={(event) => fieldApi.handleChange(event.target.value)}
                  />
                ) : null}
                {field.type === 'checkbox' ? (
                  <input
                    type="checkbox"
                    className="size-4"
                    checked={Boolean(fieldApi.state.value)}
                    disabled={locked}
                    onBlur={fieldApi.handleBlur}
                    onChange={(event) => fieldApi.handleChange(event.target.checked)}
                  />
                ) : null}
                {field.type === 'select' ? (
                  <select
                    className={inputClass}
                    value={String(fieldApi.state.value ?? '')}
                    disabled={locked}
                    onBlur={fieldApi.handleBlur}
                    onChange={(event) => fieldApi.handleChange(event.target.value)}
                  >
                    {(field.options ?? []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label ?? (option.labelKey ? t(option.labelKey) : option.value)}
                      </option>
                    ))}
                  </select>
                ) : null}
                {field.type === 'image' ? (
                  <ImageField
                    value={String(fieldApi.state.value ?? '')}
                    disabled={Boolean(locked)}
                    onBlur={fieldApi.handleBlur}
                    onChange={(next) => fieldApi.handleChange(next)}
                    onUpload={onUploadImage}
                  />
                ) : null}
                {field.type === 'text' || field.type === 'number' || field.type === 'datetime' ? (
                  <input
                    className={inputClass}
                    type={field.type === 'number' ? 'number' : field.type === 'datetime' ? 'datetime-local' : 'text'}
                    value={String(fieldApi.state.value ?? '')}
                    disabled={locked}
                    onBlur={fieldApi.handleBlur}
                    onChange={(event) =>
                      fieldApi.handleChange(
                        field.type === 'number' && event.target.value !== ''
                          ? Number(event.target.value)
                          : event.target.value,
                      )
                    }
                  />
                ) : null}
                {error ? (
                  <span className="mt-1 block text-xs text-destructive">
                    {typeof error === 'string' ? error : t('admin.site.required')}
                  </span>
                ) : null}
              </label>
            );
          }}
        </form.Field>
      ))}
      <div className="flex gap-2 md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? t('admin.site.actions.saving') : t('admin.site.actions.save')}
        </Button>
        <Button type="button" variant="outline" onClick={onClear}>
          {t('admin.site.actions.clear')}
        </Button>
      </div>
    </form>
  );
}

function ImageField({
  value,
  disabled,
  onBlur,
  onChange,
  onUpload,
}: {
  value: string;
  disabled: boolean;
  onBlur: () => void;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<string>;
}) {
  const t = useT();
  const [uploading, setUploading] = useState(false);
  const preview = storedFileUrl(value);

  return (
    <div className="flex flex-col gap-2">
      <input
        className={inputClass}
        type="text"
        value={value}
        disabled={disabled}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
      />
      <input
        className="text-xs"
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        disabled={disabled || uploading}
        aria-label={t('admin.site.actions.uploadImage')}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (!file) {
            return;
          }
          setUploading(true);
          void onUpload(file)
            .then((path) => onChange(path))
            .catch(() => undefined)
            .finally(() => setUploading(false));
        }}
      />
      {uploading ? (
        <span className="text-xs text-muted-foreground">{t('admin.site.actions.uploading')}</span>
      ) : null}
      {preview ? (
        // The API file proxy is a different origin and is not a Next image host.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt={t('admin.site.fields.imageUrl')}
          className="h-16 w-16 rounded object-cover"
        />
      ) : null}
    </div>
  );
}
