'use client';

import { memo } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n/locale-context';

function ProductEditFormActionsComponent({
  onCancel,
}: {
  onCancel: () => void;
}) {
  const t = useT();

  return (
    <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
      <Button
        type="button"
        variant="outline"
        className="h-9 px-4"
        onClick={onCancel}
      >
        {t('admin.products.edit.actions.cancel')}
      </Button>
      <Button type="submit" className="h-9 gap-2 px-4">
        <Save className="size-4" aria-hidden />
        {t('admin.products.edit.actions.saveChanges')}
      </Button>
    </div>
  );
}

export const ProductEditFormActions = memo(ProductEditFormActionsComponent);
