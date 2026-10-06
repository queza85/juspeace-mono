import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ApiMessage } from '../../common/decorators/api-message.decorator';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import {
  CreateCategoryDto,
  CreateContentBlockDto,
  CreateFeaturedProductDto,
  CreateNewsletterSubscriberDto,
  CreatePaymentMethodDto,
  CreatePromotionDto,
  CreateReviewDto,
  CreateShippingMethodDto,
  ListContentQueryDto,
  ListReviewsQueryDto,
  UpdateCategoryDto,
  UpdateContactInquiryStatusDto,
  UpdateContentBlockDto,
  UpdateCustomerDto,
  UpdateFeaturedProductDto,
  UpdatePaymentMethodDto,
  UpdatePromotionDto,
  UpdateReviewDto,
  UpdateShippingMethodDto,
  UpsertSiteSettingDto,
} from '../dto/site.dto';
import { SiteService } from '../site.service';

@ApiTags('admin-site')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminSiteController {
  constructor(private readonly siteService: SiteService) {}

  @Get('content-blocks')
  @ApiMessage('CONTENT_BLOCKS_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'List storefront content blocks' })
  @ApiOkResponse({ type: ApiResponseDto })
  listContent(@Query() query: ListContentQueryDto) {
    return this.siteService.listContent(query, false);
  }

  @Post('content-blocks')
  @HttpCode(HttpStatus.CREATED)
  @ApiMessage('CONTENT_BLOCK_CREATED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Create a storefront content block' })
  createContent(@Body() dto: CreateContentBlockDto) {
    return this.siteService.createContent(dto);
  }

  @Patch('content-blocks/:id')
  @ApiMessage('CONTENT_BLOCK_UPDATED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Update a storefront content block' })
  updateContent(@Param('id') id: string, @Body() dto: UpdateContentBlockDto) {
    return this.siteService.updateContent(id, dto);
  }

  @Delete('content-blocks/:id')
  @ApiMessage('CONTENT_BLOCK_DELETED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Delete a storefront content block' })
  deleteContent(@Param('id') id: string) {
    return this.siteService.deleteContent(id);
  }

  @Get('site-settings')
  @ApiMessage('SITE_SETTINGS_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'List site settings' })
  listSettings() {
    return this.siteService.listSettings();
  }

  @Post('site-settings')
  @HttpCode(HttpStatus.OK)
  @ApiMessage('SITE_SETTING_SAVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Create or update a site setting' })
  upsertSetting(@Body() dto: UpsertSiteSettingDto) {
    return this.siteService.upsertSetting(dto);
  }

  @Get('shipping-methods')
  @ApiMessage('SHIPPING_METHODS_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'List shipping methods' })
  listShipping() {
    return this.siteService.listShipping(false);
  }

  @Post('shipping-methods')
  @HttpCode(HttpStatus.CREATED)
  @ApiMessage('SHIPPING_METHOD_CREATED_SUCCESSFULLY')
  createShipping(@Body() dto: CreateShippingMethodDto) {
    return this.siteService.createShipping(dto);
  }

  @Patch('shipping-methods/:id')
  @ApiMessage('SHIPPING_METHOD_UPDATED_SUCCESSFULLY')
  updateShipping(
    @Param('id') id: string,
    @Body() dto: UpdateShippingMethodDto,
  ) {
    return this.siteService.updateShipping(id, dto);
  }

  @Delete('shipping-methods/:id')
  @ApiMessage('SHIPPING_METHOD_DELETED_SUCCESSFULLY')
  deleteShipping(@Param('id') id: string) {
    return this.siteService.deleteShipping(id);
  }

  @Get('payment-methods')
  @ApiMessage('PAYMENT_METHODS_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'List dummy payment methods (no PG credentials)' })
  listPayments() {
    return this.siteService.listPayments(false);
  }

  @Post('payment-methods')
  @HttpCode(HttpStatus.CREATED)
  @ApiMessage('PAYMENT_METHOD_CREATED_SUCCESSFULLY')
  createPayment(@Body() dto: CreatePaymentMethodDto) {
    return this.siteService.createPayment(dto);
  }

  @Patch('payment-methods/:id')
  @ApiMessage('PAYMENT_METHOD_UPDATED_SUCCESSFULLY')
  updatePayment(@Param('id') id: string, @Body() dto: UpdatePaymentMethodDto) {
    return this.siteService.updatePayment(id, dto);
  }

  @Delete('payment-methods/:id')
  @ApiMessage('PAYMENT_METHOD_DELETED_SUCCESSFULLY')
  deletePayment(@Param('id') id: string) {
    return this.siteService.deletePayment(id);
  }

  @Get('promotions')
  @ApiMessage('PROMOTIONS_RETRIEVED_SUCCESSFULLY')
  listPromotions() {
    return this.siteService.listPromotions(false);
  }

  @Post('promotions')
  @HttpCode(HttpStatus.CREATED)
  @ApiMessage('PROMOTION_CREATED_SUCCESSFULLY')
  createPromotion(@Body() dto: CreatePromotionDto) {
    return this.siteService.createPromotion(dto);
  }

  @Patch('promotions/:id')
  @ApiMessage('PROMOTION_UPDATED_SUCCESSFULLY')
  updatePromotion(@Param('id') id: string, @Body() dto: UpdatePromotionDto) {
    return this.siteService.updatePromotion(id, dto);
  }

  @Delete('promotions/:id')
  @ApiMessage('PROMOTION_DELETED_SUCCESSFULLY')
  deletePromotion(@Param('id') id: string) {
    return this.siteService.deletePromotion(id);
  }

  @Get('reviews')
  @ApiMessage('REVIEWS_RETRIEVED_SUCCESSFULLY')
  listReviews(@Query() query: ListReviewsQueryDto) {
    return this.siteService.listReviews(query, false);
  }

  @Post('reviews')
  @HttpCode(HttpStatus.CREATED)
  @ApiMessage('REVIEW_CREATED_SUCCESSFULLY')
  createReview(@Body() dto: CreateReviewDto) {
    return this.siteService.createReview(dto);
  }

  @Patch('reviews/:id')
  @ApiMessage('REVIEW_UPDATED_SUCCESSFULLY')
  updateReview(@Param('id') id: string, @Body() dto: UpdateReviewDto) {
    return this.siteService.updateReview(id, dto);
  }

  @Delete('reviews/:id')
  @ApiMessage('REVIEW_DELETED_SUCCESSFULLY')
  deleteReview(@Param('id') id: string) {
    return this.siteService.deleteReview(id);
  }

  @Get('categories')
  @ApiMessage('CATEGORIES_RETRIEVED_SUCCESSFULLY')
  listCategories() {
    return this.siteService.listCategories();
  }

  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  @ApiMessage('CATEGORY_CREATED_SUCCESSFULLY')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.siteService.createCategory(dto);
  }

  @Patch('categories/:id')
  @ApiMessage('CATEGORY_UPDATED_SUCCESSFULLY')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.siteService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @ApiMessage('CATEGORY_DELETED_SUCCESSFULLY')
  deleteCategory(@Param('id') id: string) {
    return this.siteService.deleteCategory(id);
  }

  @Get('customers')
  @ApiMessage('CUSTOMERS_RETRIEVED_SUCCESSFULLY')
  listCustomers() {
    return this.siteService.listCustomers();
  }

  @Patch('customers/:id')
  @ApiMessage('CUSTOMER_UPDATED_SUCCESSFULLY')
  updateCustomer(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.siteService.updateCustomer(id, dto);
  }

  @Get('contact-inquiries')
  @ApiMessage('CONTACT_INQUIRIES_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'List Contact us inquiries' })
  listInquiries() {
    return this.siteService.listInquiries();
  }

  @Patch('contact-inquiries/:id')
  @ApiMessage('CONTACT_INQUIRY_UPDATED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Update a Contact us inquiry status' })
  updateInquiry(
    @Param('id') id: string,
    @Body() dto: UpdateContactInquiryStatusDto,
  ) {
    return this.siteService.updateInquiryStatus(id, dto);
  }

  @Get('newsletter-subscribers')
  @ApiMessage('NEWSLETTER_SUBSCRIBERS_RETRIEVED_SUCCESSFULLY')
  listSubscribers() {
    return this.siteService.listSubscribers();
  }

  @Post('newsletter-subscribers')
  @HttpCode(HttpStatus.CREATED)
  @ApiMessage('NEWSLETTER_SUBSCRIBER_CREATED_SUCCESSFULLY')
  createSubscriber(@Body() dto: CreateNewsletterSubscriberDto) {
    return this.siteService.subscribe(dto);
  }

  @Delete('newsletter-subscribers/:id')
  @ApiMessage('NEWSLETTER_SUBSCRIBER_DELETED_SUCCESSFULLY')
  deleteSubscriber(@Param('id') id: string) {
    return this.siteService.deleteSubscriber(id);
  }

  @Get('featured-products')
  @ApiMessage('FEATURED_PRODUCTS_RETRIEVED_SUCCESSFULLY')
  listFeatured() {
    return this.siteService.listFeatured(false);
  }

  @Post('featured-products')
  @HttpCode(HttpStatus.CREATED)
  @ApiMessage('FEATURED_PRODUCT_CREATED_SUCCESSFULLY')
  createFeatured(@Body() dto: CreateFeaturedProductDto) {
    return this.siteService.createFeatured(dto);
  }

  @Patch('featured-products/:id')
  @ApiMessage('FEATURED_PRODUCT_UPDATED_SUCCESSFULLY')
  updateFeatured(
    @Param('id') id: string,
    @Body() dto: UpdateFeaturedProductDto,
  ) {
    return this.siteService.updateFeatured(id, dto);
  }

  @Delete('featured-products/:id')
  @ApiMessage('FEATURED_PRODUCT_DELETED_SUCCESSFULLY')
  deleteFeatured(@Param('id') id: string) {
    return this.siteService.deleteFeatured(id);
  }
}
