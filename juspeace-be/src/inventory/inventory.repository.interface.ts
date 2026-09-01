export interface VariantWithProduct {
  id: string;
  productId: string;
  sku: string;
  variationLabel: string;
  variationKey: string;
  initialStock: number;
  availableStock: number;
  reservedStock: number;
  soldQuantity: number;
  cancelledReturned: number;
  lowStockThreshold: number | null;
  createdAt: Date;
  updatedAt: Date;
  product: {
    name: string;
    slug: string;
    brand: string | null;
  };
}

export interface ListInventoryOptions {
  search?: string;
  limit?: number;
  offset?: number;
}

export interface IInventoryRepository {
  findManyVariants(
    options: ListInventoryOptions,
  ): Promise<VariantWithProduct[]>;
  countVariants(options: ListInventoryOptions): Promise<number>;
  findVariantById(id: string): Promise<VariantWithProduct | null>;
}

export const INVENTORY_REPOSITORY = Symbol('INVENTORY_REPOSITORY');
