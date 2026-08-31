import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ApiMessage } from '../../common/decorators/api-message.decorator';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import {
  AuthorizedSellerResponseDto,
  CompleteOnlineSaleDto,
  ListCertificatesQueryDto,
  PaginatedCertificatesResponseDto,
  RegistryDashboardResponseDto,
  SaleResponseDto,
} from '../dto/registry.dto';
import { CertificatesService } from '../services/certificates.service';
import { SalesService } from '../services/sales.service';
import type { IRegistryRepository } from '../registry.repository.interface';
import { REGISTRY_REPOSITORY } from '../registry.repository.interface';

@ApiTags('admin-registry')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/registry')
export class AdminRegistryController {
  constructor(
    private readonly salesService: SalesService,
    private readonly certificatesService: CertificatesService,
    @Inject(REGISTRY_REPOSITORY)
    private readonly registryRepository: IRegistryRepository,
  ) {}

  @Get('dashboard')
  @ApiMessage('REGISTRY_DASHBOARD_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Global sold vs registered metrics' })
  @ApiOkResponse({ type: ApiResponseDto })
  getDashboard(): Promise<RegistryDashboardResponseDto> {
    return this.registryRepository.getDashboardStats();
  }

  @Get('sellers')
  @ApiMessage('AUTHORIZED_SELLERS_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'List authorized sellers' })
  @ApiOkResponse({ type: ApiResponseDto })
  async listSellers(): Promise<AuthorizedSellerResponseDto[]> {
    const sellers = await this.registryRepository.listSellers();

    return sellers.map((seller) => ({
      id: seller.id,
      name: seller.name,
      type: seller.type,
      marketCode: seller.market.code,
      locationLabel: seller.locationLabel,
      isActive: seller.isActive,
    }));
  }

  @Get('certificates')
  @ApiMessage('CERTIFICATES_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'List digital certificates' })
  @ApiOkResponse({ type: ApiResponseDto })
  listCertificates(
    @Query() query: ListCertificatesQueryDto,
  ): Promise<PaginatedCertificatesResponseDto> {
    return this.certificatesService.list(query);
  }

  @Post('sales/online')
  @HttpCode(HttpStatus.CREATED)
  @ApiMessage('ONLINE_SALE_REGISTERED_SUCCESSFULLY')
  @ApiOperation({
    summary:
      'Preparation endpoint: record online sale with auto-registration and certificate',
  })
  @ApiOkResponse({ type: ApiResponseDto })
  completeOnlineSale(
    @Body() dto: CompleteOnlineSaleDto,
  ): Promise<SaleResponseDto> {
    return this.salesService.completeOnlineSale(dto);
  }

  @Post('sales/:id/refund')
  @HttpCode(HttpStatus.OK)
  @ApiMessage('SALE_REFUNDED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Refund sale and revoke certificate if issued' })
  @ApiOkResponse({ type: ApiResponseDto })
  refundSale(@Param('id') id: string): Promise<SaleResponseDto> {
    return this.salesService.refundSale(id);
  }
}
