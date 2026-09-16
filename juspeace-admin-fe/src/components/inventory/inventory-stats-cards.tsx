'use client';

import { memo } from 'react';
import { InventoryStatCard } from '@/components/inventory/inventory-stat-card';
import { inventoryPageStatMetrics } from '@/lib/inventory/mock-data';

function InventoryStatsCardsComponent() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {inventoryPageStatMetrics.map((metric) => (
        <InventoryStatCard key={metric.id} metric={metric} />
      ))}
    </div>
  );
}

export const InventoryStatsCards = memo(InventoryStatsCardsComponent);
