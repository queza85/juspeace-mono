'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { listSiteSettings, saveSiteSetting, storedFileUrl, uploadImage } from '@/lib/api/site';
import { useAuth } from '@/lib/auth/auth-context';
import { useT } from '@/lib/i18n/locale-context';
import { SITE_SETTING_KEYS, type SiteSettingKey } from '@/lib/site/resources';

const inputClass =
  'h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm outline-none focus-visible:border-ring';

const IMAGE_KEYS = new Set<SiteSettingKey>(['logoUrl']);
const LONG_KEYS = new Set<SiteSettingKey>(['address']);

export function SiteSettingsEditor() {
  const t = useT();
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [editingKey, setEditingKey] = useState<SiteSettingKey | null>(null);
  const [draft, setDraft] = useState('');

  const listQuery = useQuery({
    queryKey: ['admin-site-settings', accessToken],
    enabled: Boolean(accessToken),
    queryFn: () => listSiteSettings(accessToken ?? ''),
  });

  const saveMutation = useMutation({
    mutationFn: (body: { key: SiteSettingKey; value: string }) =>
      saveSiteSetting(accessToken ?? '', body),
    onSuccess: async () => {
      setEditingKey(null);
      setDraft('');
      await queryClient.invalidateQueries({ queryKey: ['admin-site-settings'] });
    },
  });

  const values = new Map((listQuery.data ?? []).map((setting) => [setting.key, setting.value]));

  function startEdit(key: SiteSettingKey) {
    setEditingKey(key);
    setDraft(values.get(key) ?? '');
    saveMutation.reset();
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4">
      <header>
        <h1 className="text-lg font-semibold tracking-tight">{t('admin.site.settings.title')}</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">{t('admin.site.settings.description')}</p>
      </header>

      {listQuery.isLoading ? <p className="text-sm text-muted-foreground">{t('common.loading')}</p> : null}
      {listQuery.isError ? (
        <div className="flex items-center gap-2">
          <p className="text-sm text-destructive">{t('common.error')}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void listQuery.refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      ) : null}

      {listQuery.isSuccess ? (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">{t('admin.site.fields.key')}</th>
                <th className="px-3 py-2 font-medium">{t('admin.site.fields.value')}</th>
                <th className="px-3 py-2 font-medium">{t('admin.site.actions.column')}</th>
              </tr>
            </thead>
            <tbody>
              {SITE_SETTING_KEYS.map((key) => {
                const editing = editingKey === key;
                const saved = values.get(key) ?? '';
                return (
                  <tr key={key} className="border-b border-border/70 align-top last:border-0">
                    <td className="px-3 py-2 font-medium">{t(`admin.site.settingKeys.${key}`)}</td>
                    <td className="max-w-[480px] px-3 py-2">
                      {editing ? (
                        <SettingValueField
                          settingKey={key}
                          value={draft}
                          disabled={saveMutation.isPending}
                          onChange={setDraft}
                          onUpload={async (file) => {
                            const uploaded = await uploadImage(accessToken ?? '', file);
                            return uploaded.path;
                          }}
                        />
                      ) : saved ? (
                        <span className="block truncate" title={saved}>
                          {saved}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {editing ? (
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            disabled={saveMutation.isPending || draft.trim().length === 0}
                            onClick={() => {
                              void saveMutation.mutateAsync({ key, value: draft.trim() }).catch(() => undefined);
                            }}
                          >
                            {saveMutation.isPending ? t('admin.site.actions.saving') : t('admin.site.actions.save')}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={saveMutation.isPending}
                            onClick={() => {
                              setEditingKey(null);
                              setDraft('');
                            }}
                          >
                            {t('admin.site.actions.cancel')}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(key)}
                        >
                          {t('admin.site.actions.edit')}
                        </Button>
                      )}
                      {editing && saveMutation.isError ? (
                        <p className="mt-1 text-xs text-destructive">{t('common.error')}</p>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function SettingValueField({
  settingKey,
  value,
  disabled,
  onChange,
  onUpload,
}: {
  settingKey: SiteSettingKey;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onUpload: (file: File) => Promise<string>;
}) {
  const t = useT();
  const [uploading, setUploading] = useState(false);
  const preview = IMAGE_KEYS.has(settingKey) ? storedFileUrl(value) : '';

  if (LONG_KEYS.has(settingKey)) {
    return (
      <textarea
        className={`${inputClass} min-h-20 py-2`}
        value={value}
        disabled={disabled}
        aria-label={t(`admin.site.settingKeys.${settingKey}`)}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        className={inputClass}
        type="text"
        value={value}
        disabled={disabled}
        aria-label={t(`admin.site.settingKeys.${settingKey}`)}
        onChange={(event) => onChange(event.target.value)}
      />
      {IMAGE_KEYS.has(settingKey) ? (
        <>
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
              alt={t('admin.site.settingKeys.logoUrl')}
              className="h-16 w-16 rounded object-cover"
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
