'use client';

import { memo } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useT } from '@/lib/i18n/locale-context';

function ProductAddFormActionsComponent({
  onDiscard,
  onSaveDraft,
}: {
  onDiscard: () => void;
  onSaveDraft: () => void;
}) {
  const t = useT();

  return (
    <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
      <Button
        type="button"
        variant="ghost"
        className="h-9 gap-2 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={onDiscard}
      >
        <Trash2 className="size-4" aria-hidden />
        {t('admin.products.add.actions.discard')}
      </Button>
      <Button
        type="button"
        className="h-9 gap-2 border-transparent bg-[#f3eefb] px-4 text-primary hover:bg-[#ebe3f7]"
        onClick={onSaveDraft}
      >
        <Save className="size-4" aria-hidden />
        {t('admin.products.add.actions.saveDraft')}
      </Button>
      <Button type="submit" className="h-9 gap-2 px-4">
        <Plus className="size-4" aria-hidden />
        {t('admin.products.add.actions.publish')}
      </Button>
    </div>
  );
}

export const ProductAddFormActions = memo(ProductAddFormActionsComponent);
