'use client';

import { memo } from 'react';
import { DashboardPanel } from '@/components/dashboard/dashboard-panel';
import { operationalAlerts } from '@/lib/dashboard/mock-data';
import { useT } from '@/lib/i18n/locale-context';
import { cn } from '@/lib/utils';

const dotStyles = {
  orange: 'bg-orange-400',
  red: 'bg-red-400',
  purple: 'bg-purple-400',
  blue: 'bg-blue-400',
  cyan: 'bg-cyan-400',
} as const;

function OperationalAlertsComponent() {
  const t = useT();

  return (
    <DashboardPanel
      title={t('admin.dashboard.alerts.title')}
      action={
        <button
          type="button"
          className="text-[11px] font-medium text-primary hover:underline"
        >
          {t('admin.dashboard.alerts.viewAll')}
        </button>
      }
      className="h-full"
    >
      <ul className="divide-y divide-border/60">
        {operationalAlerts.map((alert) => (
          <li
            key={alert.id}
            className="flex items-center gap-2.5 py-2.5 first:pt-0 last:pb-0"
          >
            <span
              className={cn('size-2 shrink-0 rounded-full', dotStyles[alert.tone])}
            />
            <p className="min-w-0 flex-1 text-xs leading-snug">
              {t(alert.messageKey, { count: String(alert.count) })}
            </p>
            <button
              type="button"
              className="shrink-0 text-[11px] font-medium text-primary hover:underline"
            >
              {t('admin.dashboard.alerts.review')}
            </button>
          </li>
        ))}
      </ul>
    </DashboardPanel>
  );
}

export const OperationalAlerts = memo(OperationalAlertsComponent);
