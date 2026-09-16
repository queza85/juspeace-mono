import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
  AdjustInventoryStockDto,
  InventoryDetailResponseDto,
  InventoryStatsResponseDto,
  ListInventoryQueryDto,
  PaginatedInventoryResponseDto,
  UpdateInventoryThresholdDto,
} from '../dto/inventory.dto';
import { InventoryService } from '../services/inventory.service';

@ApiTags('admin-inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/inventory')
export class AdminInventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('stats')
  @ApiMessage('INVENTORY_STATS_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Inventory KPI stats' })
  @ApiOkResponse({ type: ApiResponseDto })
  getStats(): Promise<InventoryStatsResponseDto> {
    return this.inventoryService.getStats();
  }

  @Get()
  @ApiMessage('INVENTORY_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'List inventory variants' })
  @ApiOkResponse({ type: ApiResponseDto })
  list(
    @Query() query: ListInventoryQueryDto,
  ): Promise<PaginatedInventoryResponseDto> {
    return this.inventoryService.list(query);
  }

  @Get(':id')
  @ApiMessage('INVENTORY_DETAIL_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Get inventory variant detail' })
  @ApiOkResponse({ type: ApiResponseDto })
  findById(@Param('id') id: string): Promise<InventoryDetailResponseDto> {
    return this.inventoryService.findById(id);
  }

  @Patch(':id/adjust')
  @ApiMessage('INVENTORY_STOCK_ADJUSTED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Adjust available stock' })
  @ApiOkResponse({ type: ApiResponseDto })
  adjustStock(
    @Param('id') id: string,
    @Body() dto: AdjustInventoryStockDto,
  ): Promise<InventoryDetailResponseDto> {
    return this.inventoryService.adjustStock(id, dto);
  }

  @Patch(':id/threshold')
  @ApiMessage('INVENTORY_THRESHOLD_UPDATED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Update low-stock threshold' })
  @ApiOkResponse({ type: ApiResponseDto })
  updateThreshold(
    @Param('id') id: string,
    @Body() dto: UpdateInventoryThresholdDto,
  ): Promise<InventoryDetailResponseDto> {
    return this.inventoryService.updateThreshold(id, dto);
  }
}
