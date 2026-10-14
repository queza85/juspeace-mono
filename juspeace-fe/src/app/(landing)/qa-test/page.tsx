import { QaTestHub } from '@/components/qa-test/qa-test-hub';
import { qaTestPageMetadata } from '@/lib/qa-test/metadata';

export function generateMetadata() {
  return qaTestPageMetadata('qaTest.hub.metaTitle');
}

export default function QaTestPage() {
  return <QaTestHub />;
}
