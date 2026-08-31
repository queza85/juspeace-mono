import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CertificateStatus } from '@prisma/client';
import {
  CertificateResponseDto,
  CertificateVerifyResponseDto,
  ListCertificatesQueryDto,
  PaginatedCertificatesResponseDto,
} from '../dto/registry.dto';
import type { IRegistryRepository } from '../registry.repository.interface';
import { REGISTRY_REPOSITORY } from '../registry.repository.interface';

@Injectable()
export class CertificatesService {
  constructor(
    @Inject(REGISTRY_REPOSITORY)
    private readonly registryRepository: IRegistryRepository,
  ) {}

  async getByNumber(certificateNo: string): Promise<CertificateResponseDto> {
    const certificate =
      await this.registryRepository.findCertificateByNumber(certificateNo);

    if (!certificate) {
      throw new NotFoundException('CERTIFICATE_NOT_FOUND');
    }

    return this.toResponse(certificate);
  }

  async verify(certificateNo: string): Promise<CertificateVerifyResponseDto> {
    const certificate =
      await this.registryRepository.findCertificateByNumber(certificateNo);

    if (!certificate) {
      return {
        certificateNo,
        status: CertificateStatus.REVOKED,
        verified: false,
        message: 'CERTIFICATE_NOT_FOUND',
      };
    }

    const verified = certificate.status === CertificateStatus.ACTIVE;

    return {
      certificateNo: certificate.certificateNo,
      status: certificate.status,
      verified,
      message: verified
        ? 'OFFICIAL_PURCHASE_VERIFIED'
        : 'CERTIFICATE_NOT_ACTIVE',
    };
  }

  async list(
    query: ListCertificatesQueryDto,
  ): Promise<PaginatedCertificatesResponseDto> {
    const options = {
      status: query.status,
      limit: query.limit,
      offset: query.offset,
    };

    const [items, total] = await Promise.all([
      this.registryRepository.listCertificates(options),
      this.registryRepository.countCertificates({ status: query.status }),
    ]);

    return {
      items: items.map((certificate) => this.toResponse(certificate)),
      total,
      limit: query.limit ?? 20,
      offset: query.offset ?? 0,
    };
  }

  private toResponse(certificate: {
    certificateNo: string;
    status: CertificateStatus;
    productName: string;
    collectionName: string | null;
    marketCode: string;
    sellerName: string;
    purchaseChannel: CertificateResponseDto['purchaseChannel'];
    registrationDate: Date;
    issuedAt: Date;
  }): CertificateResponseDto {
    return {
      certificateNo: certificate.certificateNo,
      status: certificate.status,
      productName: certificate.productName,
      collectionName: certificate.collectionName,
      marketCode: certificate.marketCode,
      sellerName: certificate.sellerName,
      purchaseChannel: certificate.purchaseChannel,
      registrationDate: certificate.registrationDate,
      issuedAt: certificate.issuedAt,
    };
  }
}
