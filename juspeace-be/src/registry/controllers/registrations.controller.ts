import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ApiMessage } from '../../common/decorators/api-message.decorator';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import {
  CertificateResponseDto,
  RegisterPurchaseDto,
  RegistrationLookupQueryDto,
  RegistrationPreviewResponseDto,
  SaleResponseDto,
} from '../dto/registry.dto';
import { RegistrationsService } from '../services/registrations.service';

@ApiTags('registrations')
@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Get('token/:token/preview')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiMessage('REGISTRATION_PREVIEW_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({
    summary: 'Preview offline sale linked to a registration token',
  })
  @ApiOkResponse({ type: ApiResponseDto })
  previewByToken(
    @Param('token') token: string,
  ): Promise<RegistrationPreviewResponseDto> {
    return this.registrationsService.previewByToken(token);
  }

  @Post('token/:token')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiMessage('OFFICIAL_PURCHASE_REGISTERED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Complete offline purchase registration' })
  @ApiOkResponse({ type: ApiResponseDto })
  registerByToken(
    @Param('token') token: string,
    @Body() dto: RegisterPurchaseDto,
  ): Promise<CertificateResponseDto> {
    return this.registrationsService.registerByToken(token, dto);
  }

  @Get('lookup')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiMessage('OFFICIAL_PURCHASE_FOUND')
  @ApiOperation({
    summary: 'Lookup online official purchase by order reference and email',
  })
  @ApiOkResponse({ type: ApiResponseDto })
  lookup(@Query() query: RegistrationLookupQueryDto): Promise<{
    sale: SaleResponseDto;
    certificate: CertificateResponseDto | null;
  }> {
    return this.registrationsService.lookup(query);
  }
}
