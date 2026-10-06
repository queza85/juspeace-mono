'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  listContactInquiries,
  updateContactInquiryStatus,
  type ContactInquiryStatus,
} from '@/lib/api/site';
import { useAuth } from '@/lib/auth/auth-context';
import { useT } from '@/lib/i18n/locale-context';

const STATUSES: ContactInquiryStatus[] = ['WAITING', 'REPLIED'];

export function InquiriesPage() {
  const t = useT();
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['admin-contact-inquiries', accessToken],
    enabled: Boolean(accessToken),
    queryFn: () => listContactInquiries(accessToken ?? ''),
  });

  const statusMutation = useMutation({
    mutationFn: (input: { id: string; status: ContactInquiryStatus }) =>
      updateContactInquiryStatus(accessToken ?? '', input.id, input.status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-contact-inquiries'] });
    },
  });

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4">
      <header>
        <h1 className="text-lg font-semibold tracking-tight">{t('admin.inquiries.title')}</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">{t('admin.inquiries.description')}</p>
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

      {listQuery.isSuccess && listQuery.data.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('admin.inquiries.empty')}</p>
      ) : null}

      {listQuery.data?.length ? (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">{t('admin.inquiries.fields.name')}</th>
                <th className="px-3 py-2 font-medium">{t('admin.inquiries.fields.email')}</th>
                <th className="px-3 py-2 font-medium">{t('admin.inquiries.fields.subject')}</th>
                <th className="px-3 py-2 font-medium">{t('admin.inquiries.fields.message')}</th>
                <th className="px-3 py-2 font-medium">{t('admin.inquiries.fields.createdAt')}</th>
                <th className="px-3 py-2 font-medium">{t('admin.inquiries.fields.status')}</th>
              </tr>
            </thead>
            <tbody>
              {listQuery.data.map((inquiry) => (
                <tr key={inquiry.id} className="border-b border-border/70 align-top last:border-0">
                  <td className="px-3 py-2">
                    <div className="font-medium">{inquiry.name}</div>
                    {inquiry.phone ? (
                      <div className="text-xs text-muted-foreground">{inquiry.phone}</div>
                    ) : null}
                  </td>
                  <td className="px-3 py-2">{inquiry.email}</td>
                  <td className="max-w-[160px] px-3 py-2">{inquiry.subject || '—'}</td>
                  <td className="max-w-[360px] px-3 py-2 whitespace-pre-wrap">{inquiry.message}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {new Date(inquiry.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    <select
                      className="h-9 cursor-pointer rounded-md border border-border bg-background px-2.5 text-sm outline-none focus-visible:border-ring"
                      aria-label={t('admin.inquiries.fields.status')}
                      value={inquiry.status}
                      disabled={statusMutation.isPending}
                      onChange={(event) => {
                        const status = event.target.value as ContactInquiryStatus;
                        if (status === inquiry.status) {
                          return;
                        }
                        void statusMutation.mutateAsync({ id: inquiry.id, status }).catch(() => undefined);
                      }}
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {t(`admin.inquiries.status.${status}`)}
                        </option>
                      ))}
                    </select>
                    {statusMutation.isError && statusMutation.variables?.id === inquiry.id ? (
                      <p className="mt-1 text-xs text-destructive">{t('common.error')}</p>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
