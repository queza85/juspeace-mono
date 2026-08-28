'use client';

import { memo, useCallback, useEffect, useState } from 'react';
import {
  ArrowUpDown,
  ShoppingBag,
  SquareArrowOutUpRight,
  TrendingDown,
} from 'lucide-react';
import {
  OrderDialogActions,
  OrderDialogFrame,
  orderInputClassName,
} from '@/components/orders/order-dialog-shell';
import { toast } from '@/components/ui/toast';
import { useT } from '@/lib/i18n/locale-context';
import type { InventoryDetail } from '@/lib/inventory/inventory-detail-mock';

export type InventoryDetailDialogType =
  | 'adjustStock'
  | 'markSoldOut'
  | 'setThreshold'
  | 'export'
  | null;

type ExportFormat = 'csv' | 'xlsx';

function StockQuantityField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="text-left">
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-foreground">
        {label}
      </label>
      <input
        id={id}
        type="number"
        min={0}
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={orderInputClassName}
      />
    </div>
  );
}

function AdjustStockFields({
  initialQuantity,
  onQuantityChange,
}: {
  initialQuantity: number;
  onQuantityChange: (value: string) => void;
}) {
  const t = useT();
  const [stockQuantity, setStockQuantity] = useState(String(initialQuantity));

  useEffect(() => {
    onQuantityChange(String(initialQuantity));
  }, [initialQuantity, onQuantityChange]);

  const handleChange = (value: string) => {
    setStockQuantity(value);
    onQuantityChange(value);
  };

  return (
    <StockQuantityField
      id="inventory-adjust-stock-quantity"
      label={t('admin.inventory.detail.dialogs.stockQuantityLabel')}
      value={stockQuantity}
      onChange={handleChange}
    />
  );
}

function SetThresholdFields({
  onQuantityChange,
}: {
  onQuantityChange: (value: string) => void;
}) {
  const t = useT();
  const [thresholdQuantity, setThresholdQuantity] = useState('20');

  useEffect(() => {
    onQuantityChange('20');
  }, [onQuantityChange]);

  const handleChange = (value: string) => {
    setThresholdQuantity(value);
    onQuantityChange(value);
  };

  return (
    <StockQuantityField
      id="inventory-set-threshold-quantity"
      label={t('admin.inventory.detail.dialogs.stockQuantityLabel')}
      value={thresholdQuantity}
      onChange={handleChange}
    />
  );
}

function ExportFormatFields({
  onFormatChange,
}: {
  onFormatChange: (value: ExportFormat) => void;
}) {
  const t = useT();
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');

  useEffect(() => {
    onFormatChange('csv');
  }, [onFormatChange]);

  const handleChange = (value: ExportFormat) => {
    setExportFormat(value);
    onFormatChange(value);
  };

  return (
    <fieldset className="space-y-2.5 text-left">
      <legend className="sr-only">
        {t('admin.inventory.detail.dialogs.export.formatLegend')}
      </legend>
      {(['csv', 'xlsx'] as const).map((option) => (
        <label
          key={option}
          className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-foreground"
        >
          <input
            type="radio"
            name="inventory-export-format"
            value={option}
            checked={exportFormat === option}
            onChange={() => handleChange(option)}
            className="size-4 border-border text-teal-600 accent-teal-600 focus-visible:ring-2 focus-visible:ring-ring/30"
          />
          {t(`admin.inventory.detail.dialogs.export.formats.${option}`)}
        </label>
      ))}
    </fieldset>
  );
}

function InventoryDetailDialogsComponent({
  activeDialog,
  detail,
  onClose,
}: {
  activeDialog: InventoryDetailDialogType;
  detail: InventoryDetail;
  onClose: () => void;
}) {
  const t = useT();
  const [stockQuantity, setStockQuantity] = useState(String(detail.availableStock));
  const [thresholdQuantity, setThresholdQuantity] = useState('20');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');

  const handleAdjustStock = useCallback(() => {
    toast(
      t('admin.inventory.detail.dialogs.adjustStock.successPreview', {
        quantity: stockQuantity,
      }),
      'success',
    );
    onClose();
  }, [onClose, stockQuantity, t]);

  const handleSetThreshold = useCallback(() => {
    toast(
      t('admin.inventory.detail.dialogs.setThreshold.successPreview', {
        quantity: thresholdQuantity,
      }),
      'success',
    );
    onClose();
  }, [onClose, t, thresholdQuantity]);

  const handleMarkSoldOut = useCallback(() => {
    toast(t('admin.inventory.detail.dialogs.markSoldOut.successPreview'), 'success');
    onClose();
  }, [onClose, t]);

  const handleExport = useCallback(() => {
    toast(
      t('admin.inventory.detail.dialogs.export.successPreview', {
        format: t(`admin.inventory.detail.dialogs.export.formats.${exportFormat}`),
      }),
      'success',
    );
    onClose();
  }, [exportFormat, onClose, t]);

  return (
    <>
      <OrderDialogFrame
        open={activeDialog === 'adjustStock'}
        onClose={onClose}
        closeLabel={t('admin.inventory.detail.dialogs.adjustStock.close')}
        title={t('admin.inventory.detail.dialogs.adjustStock.title')}
        description={t('admin.inventory.detail.dialogs.adjustStock.description')}
        titleId="inventory-adjust-stock-title"
        descriptionId="inventory-adjust-stock-description"
        icon={ArrowUpDown}
        iconPresentation="plain"
        footer={
          <OrderDialogActions
            cancelLabel={t('admin.inventory.detail.dialogs.adjustStock.cancel')}
            confirmLabel={t('admin.inventory.detail.dialogs.adjustStock.confirm')}
            onCancel={onClose}
            onConfirm={handleAdjustStock}
          />
        }
      >
        {activeDialog === 'adjustStock' ? (
          <AdjustStockFields
            key={`${detail.id}-adjust-stock`}
            initialQuantity={detail.availableStock}
            onQuantityChange={setStockQuantity}
          />
        ) : null}
      </OrderDialogFrame>

      <OrderDialogFrame
        open={activeDialog === 'setThreshold'}
        onClose={onClose}
        closeLabel={t('admin.inventory.detail.dialogs.setThreshold.close')}
        title={t('admin.inventory.detail.dialogs.setThreshold.title')}
        description={t('admin.inventory.detail.dialogs.setThreshold.description')}
        titleId="inventory-set-threshold-title"
        descriptionId="inventory-set-threshold-description"
        icon={TrendingDown}
        iconPresentation="plain"
        footer={
          <OrderDialogActions
            cancelLabel={t('admin.inventory.detail.dialogs.setThreshold.cancel')}
            confirmLabel={t('admin.inventory.detail.dialogs.setThreshold.confirm')}
            onCancel={onClose}
            onConfirm={handleSetThreshold}
          />
        }
      >
        {activeDialog === 'setThreshold' ? (
          <SetThresholdFields
            key={`${detail.id}-set-threshold`}
            onQuantityChange={setThresholdQuantity}
          />
        ) : null}
      </OrderDialogFrame>

      <OrderDialogFrame
        open={activeDialog === 'markSoldOut'}
        onClose={onClose}
        closeLabel={t('admin.inventory.detail.dialogs.markSoldOut.close')}
        title={t('admin.inventory.detail.dialogs.markSoldOut.title')}
        description={t('admin.inventory.detail.dialogs.markSoldOut.description')}
        titleId="inventory-mark-sold-out-title"
        descriptionId="inventory-mark-sold-out-description"
        icon={ShoppingBag}
        iconPresentation="plain"
        role="alertdialog"
        footer={
          <OrderDialogActions
            cancelLabel={t('admin.inventory.detail.dialogs.markSoldOut.cancel')}
            confirmLabel={t('admin.inventory.detail.dialogs.markSoldOut.confirm')}
            onCancel={onClose}
            onConfirm={handleMarkSoldOut}
          />
        }
      />

      <OrderDialogFrame
        open={activeDialog === 'export'}
        onClose={onClose}
        closeLabel={t('admin.inventory.detail.dialogs.export.close')}
        title={t('admin.inventory.detail.dialogs.export.title')}
        description={t('admin.inventory.detail.dialogs.export.description')}
        titleId="inventory-export-title"
        descriptionId="inventory-export-description"
        icon={SquareArrowOutUpRight}
        iconPresentation="plain"
        footer={
          <OrderDialogActions
            cancelLabel={t('admin.inventory.detail.dialogs.export.cancel')}
            confirmLabel={t('admin.inventory.detail.dialogs.export.confirm')}
            onCancel={onClose}
            onConfirm={handleExport}
            confirmClassName="bg-teal-600 hover:bg-teal-600/90"
          />
        }
      >
        {activeDialog === 'export' ? (
          <ExportFormatFields
            key={`${detail.id}-export`}
            onFormatChange={setExportFormat}
          />
        ) : null}
      </OrderDialogFrame>
    </>
  );
}

export const InventoryDetailDialogs = memo(InventoryDetailDialogsComponent);
