import Link from 'next/link';
import { getTranslator } from '@/lib/i18n/server';

const TASKS = [
  {
    href: '/qa-test/signup',
    titleKey: 'qaTest.hub.signupTitle',
    bodyKey: 'qaTest.hub.signupBody',
  },
  {
    href: '/qa-test/cart',
    titleKey: 'qaTest.hub.cartTitle',
    bodyKey: 'qaTest.hub.cartBody',
  },
  {
    href: '/qa-test/shipping',
    titleKey: 'qaTest.hub.shippingTitle',
    bodyKey: 'qaTest.hub.shippingBody',
  },
] as const;

export async function QaTestHub() {
  const { t } = await getTranslator();

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-bold tracking-tight">{t('qaTest.hub.title')}</h1>
        <p className="max-w-xl text-sm leading-6 text-black/70">{t('qaTest.hub.intro')}</p>
        <p className="text-sm">
          <span className="font-display font-semibold">{t('qaTest.hub.timeLabel')}</span>
          <span className="mx-2 text-black/40">/</span>
          {t('qaTest.hub.timeValue')}
        </p>
      </header>

      <section className="space-y-3 border border-black/10 px-5 py-6 sm:px-6">
        <h2 className="font-display text-lg font-bold">{t('qaTest.hub.reportTitle')}</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-black/80">
          <li>{t('qaTest.hub.reportSteps')}</li>
          <li>{t('qaTest.hub.reportExpected')}</li>
          <li>{t('qaTest.hub.reportActual')}</li>
          <li>{t('qaTest.hub.reportSeverity')}</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold">{t('qaTest.hub.tasksTitle')}</h2>
        <ul className="grid gap-4">
          {TASKS.map((task) => (
            <li key={task.href} className="border border-black/10 px-5 py-5 sm:px-6">
              <h3 className="font-display text-base font-semibold">{t(task.titleKey)}</h3>
              <p className="mt-2 text-sm leading-6 text-black/70">{t(task.bodyKey)}</p>
              <Link
                href={task.href}
                className="mt-4 inline-flex text-sm font-medium underline underline-offset-4"
              >
                {t('qaTest.hub.openTask')}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
