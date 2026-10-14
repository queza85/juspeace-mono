import { CartTask } from '@/components/qa-test/cart-task';
import { qaTestPageMetadata } from '@/lib/qa-test/metadata';

export function generateMetadata() {
  return qaTestPageMetadata('qaTest.cart.metaTitle');
}

export default function QaCartPage() {
  return <CartTask />;
}
