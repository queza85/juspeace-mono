import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
import type { AuthUser } from '../../auth/auth.repository.interface';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import {
  ListSalesQueryDto,
  PaginatedSalesResponseDto,
  QuickSaleDto,
  QuickSaleResponseDto,
  RegistrationTokenResponseDto,
  SaleResponseDto,
} from '../dto/registry.dto';
import { SalesService } from '../services/sales.service';

@ApiTags('sales')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post('quick')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.DISTRIBUTOR)
  @ApiMessage('QUICK_SALE_COMPLETED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Record an offline quick sale (distributor)' })
  @ApiOkResponse({ type: ApiResponseDto })
  quickSale(
    @CurrentUser() user: AuthUser,
    @Body() dto: QuickSaleDto,
  ): Promise<QuickSaleResponseDto> {
    return this.salesService.quickSale(user, dto);
  }

  @Get()
  @Roles(UserRole.DISTRIBUTOR, UserRole.ADMIN)
  @ApiMessage('SALES_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({
    summary: 'List sales for distributor or all sales for admin',
  })
  @ApiOkResponse({ type: ApiResponseDto })
  list(
    @CurrentUser() user: AuthUser,
    @Query() query: ListSalesQueryDto,
  ): Promise<PaginatedSalesResponseDto> {
    return this.salesService.listSales(user, query);
  }

  @Get(':id')
  @Roles(UserRole.DISTRIBUTOR, UserRole.ADMIN)
  @ApiMessage('SALE_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Get sale detail' })
  @ApiOkResponse({ type: ApiResponseDto })
  getById(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<SaleResponseDto> {
    return this.salesService.getSale(user, id);
  }

  @Post(':id/void')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.DISTRIBUTOR, UserRole.ADMIN)
  @ApiMessage('SALE_VOIDED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Void a sale before customer registration' })
  @ApiOkResponse({ type: ApiResponseDto })
  voidSale(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<SaleResponseDto> {
    return this.salesService.voidSale(user, id);
  }

  @Get(':id/registration-token')
  @Roles(UserRole.DISTRIBUTOR)
  @ApiMessage('REGISTRATION_TOKEN_ISSUED_SUCCESSFULLY')
  @ApiOperation({
    summary: 'Issue or refresh Transaction QR registration token',
  })
  @ApiOkResponse({ type: ApiResponseDto })
  issueRegistrationToken(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<RegistrationTokenResponseDto> {
    return this.salesService.issueRegistrationTokenForSale(user, id);
  }
}
