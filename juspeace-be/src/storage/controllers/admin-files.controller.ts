import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ApiMessage } from '../../common/decorators/api-message.decorator';
import { UploadImageFieldsDto } from '../dto/storage.dto';
import { StorageService } from '../storage.service';
import { UploadExceptionFilter } from '../upload.exception-filter';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

@ApiTags('admin-files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@UseFilters(UploadExceptionFilter)
@Controller('admin/files')
export class AdminFilesController {
  constructor(private readonly storageService: StorageService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiMessage('FILE_UPLOADED_SUCCESSFULLY')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an image to Azure Blob Storage' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'type'],
      properties: {
        file: { type: 'string', format: 'binary' },
        type: { type: 'string', enum: ['image'] },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_IMAGE_BYTES },
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() fields: UploadImageFieldsDto,
  ) {
    if (!file || fields.type !== 'image') {
      throw new BadRequestException('FILE_REQUIRED');
    }
    return this.storageService.uploadImage({
      originalname: file.originalname,
      buffer: file.buffer,
    });
  }
}
