'use client';

import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getHealthStatus } from '@/lib/api/health';
import { useT } from '@/lib/i18n/locale-context';

export function ApiStatusCard() {
  const t = useT();
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: () => getHealthStatus(),
    retry: false,
    staleTime: 30_000,
  });

  const connected = healthQuery.isSuccess;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t('admin.dashboard.apiStatus')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Badge variant={connected ? 'default' : 'outline'}>
          {connected
            ? t('admin.dashboard.apiConnected')
            : t('admin.dashboard.apiDisconnected')}
        </Badge>
      </CardContent>
    </Card>
  );
}
