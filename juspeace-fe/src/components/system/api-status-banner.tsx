import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getHealthStatus } from '@/lib/api/products';
import { t } from '@/lib/i18n';

export async function ApiStatusBanner() {
  const connected = await getHealthStatus()
    .then(() => true)
    .catch(() => false);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t('home.apiStatus')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Badge variant={connected ? 'default' : 'outline'}>
          {connected ? t('home.apiConnected') : t('home.apiDisconnected')}
        </Badge>
      </CardContent>
    </Card>
  );
}
