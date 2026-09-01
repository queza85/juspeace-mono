import { Module } from '@nestjs/common';
import { AdminProductsController } from './controllers/admin-products.controller';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PrismaProductsRepository } from './products.repository';
import { PRODUCTS_REPOSITORY } from './products.repository.interface';

@Module({
  controllers: [ProductsController, AdminProductsController],
  providers: [
    ProductsService,
    {
      provide: PRODUCTS_REPOSITORY,
      useClass: PrismaProductsRepository,
    },
  ],
  exports: [ProductsService, PRODUCTS_REPOSITORY],
})
export class ProductsModule {}
