'use client';

import { memo, useCallback } from 'react';
import { Printer } from 'lucide-react';
import { OrderDialogActions, OrderDialogFrame } from '@/components/orders/order-dialog-shell';
import { toast } from '@/components/ui/toast';
import { useT } from '@/lib/i18n/locale-context';

function PrintDocumentsDialogComponent({
  open,
  selectedCount,
  onClose,
}: {
  open: boolean;
  selectedCount: number;
  onClose: () => void;
}) {
  const t = useT();

  const handleConfirm = useCallback(() => {
    toast(t('admin.orders.printDocumentsDialog.successPreview', { count: selectedCount }), 'success');
    onClose();
  }, [onClose, selectedCount, t]);

  return (
    <OrderDialogFrame
      open={open}
      onClose={onClose}
      closeLabel={t('admin.orders.printDocumentsDialog.close')}
      title={t('admin.orders.printDocumentsDialog.title')}
      description={t('admin.orders.printDocumentsDialog.description', { count: selectedCount })}
      titleId="print-documents-dialog-title"
      descriptionId="print-documents-dialog-description"
      icon={Printer}
      iconWrapClassName="bg-teal-50"
      iconClassName="text-teal-700"
      role="alertdialog"
      footer={
        <OrderDialogActions
          cancelLabel={t('admin.orders.printDocumentsDialog.cancel')}
          confirmLabel={t('admin.orders.printDocumentsDialog.confirm')}
          onCancel={onClose}
          onConfirm={handleConfirm}
          confirmClassName="bg-teal-600 hover:bg-teal-600/90"
        />
      }
    />
  );
}

export const PrintDocumentsDialog = memo(PrintDocumentsDialogComponent);
