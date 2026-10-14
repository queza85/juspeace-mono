import { SignupTask } from '@/components/qa-test/signup-task';
import { qaTestPageMetadata } from '@/lib/qa-test/metadata';

export function generateMetadata() {
  return qaTestPageMetadata('qaTest.signup.metaTitle');
}

export default function QaSignupPage() {
  return <SignupTask />;
}
