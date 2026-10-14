import { ShippingTask } from '@/components/qa-test/shipping-task';
import { qaTestPageMetadata } from '@/lib/qa-test/metadata';

export function generateMetadata() {
  return qaTestPageMetadata('qaTest.shipping.metaTitle');
}

export default function QaShippingPage() {
  return <ShippingTask />;
}
