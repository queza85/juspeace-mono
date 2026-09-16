'use client';

import { memo } from 'react';
import { InventoryStatsCards } from '@/components/inventory/inventory-stats-cards';
import { InventoryTablePanel } from '@/components/inventory/inventory-table-panel';

function InventoryPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4">
      <InventoryStatsCards />
      <InventoryTablePanel />
    </div>
  );
}

export default memo(InventoryPage);
