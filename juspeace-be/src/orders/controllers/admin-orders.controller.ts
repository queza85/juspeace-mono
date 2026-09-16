import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
  CancelOrderDto,
  ListOrdersQueryDto,
  OrderDetailResponseDto,
  OrderStatsResponseDto,
  PaginatedOrdersResponseDto,
  RefundOrderDto,
  UpdateOrderStatusDto,
  UpdateOrderTrackingDto,
} from '../dto/order.dto';
import { OrdersService } from '../services/orders.service';

@ApiTags('admin-orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('stats')
  @ApiMessage('ORDER_STATS_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Order KPI stats' })
  @ApiOkResponse({ type: ApiResponseDto })
  getStats(): Promise<OrderStatsResponseDto> {
    return this.ordersService.getStats();
  }

  @Get()
  @ApiMessage('ORDERS_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'List orders' })
  @ApiOkResponse({ type: ApiResponseDto })
  list(
    @Query() query: ListOrdersQueryDto,
  ): Promise<PaginatedOrdersResponseDto> {
    return this.ordersService.list(query);
  }

  @Get(':id')
  @ApiMessage('ORDER_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Get order detail' })
  @ApiOkResponse({ type: ApiResponseDto })
  findById(@Param('id') id: string): Promise<OrderDetailResponseDto> {
    return this.ordersService.findById(id);
  }

  @Patch(':id/status')
  @ApiMessage('ORDER_STATUS_UPDATED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Update order fulfillment status' })
  @ApiOkResponse({ type: ApiResponseDto })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderDetailResponseDto> {
    return this.ordersService.updateStatus(id, dto);
  }

  @Patch(':id/tracking')
  @ApiMessage('ORDER_TRACKING_UPDATED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Update order tracking number' })
  @ApiOkResponse({ type: ApiResponseDto })
  updateTracking(
    @Param('id') id: string,
    @Body() dto: UpdateOrderTrackingDto,
  ): Promise<OrderDetailResponseDto> {
    return this.ordersService.updateTracking(id, dto);
  }

  @Post(':id/cancel')
  @ApiMessage('ORDER_CANCELLED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Cancel an order (prep stub — no payment gateway)' })
  @ApiOkResponse({ type: ApiResponseDto })
  cancel(
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
  ): Promise<OrderDetailResponseDto> {
    return this.ordersService.cancel(id, dto);
  }

  @Post(':id/refund')
  @ApiMessage('ORDER_REFUNDED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Record a refund (prep stub — no payment gateway)' })
  @ApiOkResponse({ type: ApiResponseDto })
  refund(
    @Param('id') id: string,
    @Body() dto: RefundOrderDto,
  ): Promise<OrderDetailResponseDto> {
    return this.ordersService.refund(id, dto);
  }
}
