import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiMessage } from '../../common/decorators/api-message.decorator';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import {
  CreateContactInquiryDto,
  CreateNewsletterSubscriberDto,
  ListContentQueryDto,
  ListReviewsQueryDto,
} from '../dto/site.dto';
import { SiteService } from '../site.service';

@ApiTags('site')
@Controller()
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Get('content-blocks')
  @ApiMessage('CONTENT_BLOCKS_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Published storefront content' })
  @ApiOkResponse({ type: ApiResponseDto })
  listContent(@Query() query: ListContentQueryDto) {
    return this.siteService.listContent(query, true);
  }

  @Get('site-settings')
  @ApiMessage('SITE_SETTINGS_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Public site settings' })
  listSettings() {
    return this.siteService.listSettings();
  }

  @Get('shipping-methods')
  @ApiMessage('SHIPPING_METHODS_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Enabled shipping methods' })
  listShipping() {
    return this.siteService.listShipping(true);
  }

  @Get('payment-methods')
  @ApiMessage('PAYMENT_METHODS_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Enabled dummy payment methods' })
  listPayments() {
    return this.siteService.listPayments(true);
  }

  @Get('categories')
  @ApiMessage('CATEGORIES_RETRIEVED_SUCCESSFULLY')
  listCategories() {
    return this.siteService.listCategories();
  }

  @Get('reviews')
  @ApiMessage('REVIEWS_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Published product reviews' })
  listReviews(@Query() query: ListReviewsQueryDto) {
    return this.siteService.listReviews(query, true);
  }

  @Get('featured-products')
  @ApiMessage('FEATURED_PRODUCTS_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Featured products for the storefront' })
  listFeatured() {
    return this.siteService.listFeatured(true);
  }

  @Post('contact-inquiries')
  @HttpCode(HttpStatus.CREATED)
  @ApiMessage('CONTACT_INQUIRY_CREATED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Submit a Contact us inquiry' })
  createInquiry(@Body() dto: CreateContactInquiryDto) {
    return this.siteService.createInquiry(dto);
  }

  @Post('newsletter-subscribers')
  @HttpCode(HttpStatus.OK)
  @ApiMessage('NEWSLETTER_SUBSCRIBER_CREATED_SUCCESSFULLY')
  @ApiOperation({ summary: 'Subscribe an email address' })
  subscribe(@Body() dto: CreateNewsletterSubscriberDto) {
    return this.siteService.subscribe(dto);
  }
}
