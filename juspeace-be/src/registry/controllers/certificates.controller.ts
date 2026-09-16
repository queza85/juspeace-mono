import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ApiMessage } from '../../common/decorators/api-message.decorator';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import {
  CertificateResponseDto,
  CertificateVerifyResponseDto,
} from '../dto/registry.dto';
import { CertificatesService } from '../services/certificates.service';

@ApiTags('certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get(':certificateNo')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @ApiMessage('CERTIFICATE_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'View official digital certificate (public)' })
  @ApiOkResponse({ type: ApiResponseDto })
  getByNumber(
    @Param('certificateNo') certificateNo: string,
  ): Promise<CertificateResponseDto> {
    return this.certificatesService.getByNumber(certificateNo);
  }

  @Get(':certificateNo/verify')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @ApiMessage('CERTIFICATE_VERIFIED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Verify certificate status (public)' })
  @ApiOkResponse({ type: ApiResponseDto })
  verify(
    @Param('certificateNo') certificateNo: string,
  ): Promise<CertificateVerifyResponseDto> {
    return this.certificatesService.verify(certificateNo);
  }
}
