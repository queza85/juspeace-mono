import { Module } from '@nestjs/common';
import { AdminOrdersController } from './controllers/admin-orders.controller';
import { PrismaOrdersRepository } from './orders.repository';
import { ORDERS_REPOSITORY } from './orders.repository.interface';
import { OrderNumberService } from './services/order-number.service';
import { OrdersService } from './services/orders.service';

@Module({
  controllers: [AdminOrdersController],
  providers: [
    OrdersService,
    OrderNumberService,
    {
      provide: ORDERS_REPOSITORY,
      useClass: PrismaOrdersRepository,
    },
  ],
  exports: [OrdersService, OrderNumberService, ORDERS_REPOSITORY],
})
export class OrdersModule {}
