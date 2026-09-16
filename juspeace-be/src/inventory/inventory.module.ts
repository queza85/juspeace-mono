import { Module } from '@nestjs/common';
import { AdminInventoryController } from './controllers/admin-inventory.controller';
import { PrismaInventoryRepository } from './inventory.repository';
import { INVENTORY_REPOSITORY } from './inventory.repository.interface';
import { InventoryService } from './services/inventory.service';

@Module({
  controllers: [AdminInventoryController],
  providers: [
    InventoryService,
    {
      provide: INVENTORY_REPOSITORY,
      useClass: PrismaInventoryRepository,
    },
  ],
  exports: [InventoryService, INVENTORY_REPOSITORY],
})
export class InventoryModule {}
