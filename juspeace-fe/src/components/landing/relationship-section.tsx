import { SectionHeading } from '@/components/landing/section-heading';
import { SectionLabel } from '@/components/landing/section-label';
import { SectionShell } from '@/components/landing/section-shell';
import { getTranslator } from '@/lib/i18n/server';

export async function RelationshipSection() {
  const { t } = await getTranslator();

  return (
    <SectionShell id="relationship" className="bg-white py-16 lg:py-24">
      <div className="mx-auto flex max-w-[1116px] flex-col items-center text-center">
        <SectionLabel>{t('landing.relationship.label')}</SectionLabel>
        <SectionHeading className="mt-6">
          <span className="block">{t('landing.relationship.statementLine1')}</span>
          <span className="block">{t('landing.relationship.statementLine2')}</span>
          <span className="block">{t('landing.relationship.statementLine3')}</span>
        </SectionHeading>
      </div>
    </SectionShell>
  );
}
