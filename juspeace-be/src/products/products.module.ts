import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PrismaProductsRepository } from './products.repository';
import { PRODUCTS_REPOSITORY } from './products.repository.interface';

@Module({
  controllers: [ProductsController],
  providers: [
    ProductsService,
    {
      provide: PRODUCTS_REPOSITORY,
      useClass: PrismaProductsRepository,
    },
  ],
})
export class ProductsModule {}
