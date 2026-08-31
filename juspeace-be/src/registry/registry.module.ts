import { Module } from '@nestjs/common';
import { AdminRegistryController } from './controllers/admin-registry.controller';
import { CertificatesController } from './controllers/certificates.controller';
import { RegistrationsController } from './controllers/registrations.controller';
import { SalesController } from './controllers/sales.controller';
import { PrismaRegistryRepository } from './registry.repository';
import { REGISTRY_REPOSITORY } from './registry.repository.interface';
import { CertificateNumberService } from './services/certificate-number.service';
import { CertificatesService } from './services/certificates.service';
import { RegistrationTokenService } from './services/registration-token.service';
import { RegistrationsService } from './services/registrations.service';
import { SalesService } from './services/sales.service';

@Module({
  controllers: [
    SalesController,
    RegistrationsController,
    CertificatesController,
    AdminRegistryController,
  ],
  providers: [
    SalesService,
    RegistrationsService,
    CertificatesService,
    RegistrationTokenService,
    CertificateNumberService,
    {
      provide: REGISTRY_REPOSITORY,
      useClass: PrismaRegistryRepository,
    },
  ],
  exports: [SalesService, RegistrationsService, CertificatesService],
})
export class RegistryModule {}
