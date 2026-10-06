import { Module } from '@nestjs/common';
import { AdminSiteController } from './controllers/admin-site.controller';
import { SiteController } from './controllers/site.controller';
import { PrismaSiteRepository } from './site.repository';
import { SITE_REPOSITORY } from './site.repository.interface';
import { SiteService } from './site.service';

@Module({
  controllers: [SiteController, AdminSiteController],
  providers: [
    SiteService,
    {
      provide: SITE_REPOSITORY,
      useClass: PrismaSiteRepository,
    },
  ],
})
export class SiteModule {}
