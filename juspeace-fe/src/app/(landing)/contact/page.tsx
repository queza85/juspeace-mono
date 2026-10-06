import { ContactForm } from '@/components/contact/contact-form';
import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingHeader } from '@/components/landing/landing-header';
import { getTranslator } from '@/lib/i18n/server';

export async function generateMetadata() {
  const { t } = await getTranslator();
  return {
    title: t('contact.title'),
    description: t('contact.description'),
  };
}

export default async function ContactPage() {
  const { t } = await getTranslator();

  return (
    <>
      <LandingHeader variant="light" />
      <article className="min-h-[60vh] bg-white">
        <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-6 lg:py-24">
          <h1 className="font-display text-3xl font-bold tracking-tight">{t('contact.title')}</h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-black/70">{t('contact.description')}</p>
          <div className="mt-10">
            <ContactForm />
          </div>
        </div>
      </article>
      <LandingFooter />
    </>
  );
}
