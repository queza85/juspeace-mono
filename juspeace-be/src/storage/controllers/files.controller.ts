import { Controller, Get, Header, Query, StreamableFile } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetStoredFileQueryDto } from '../dto/storage.dto';
import { StorageService } from '../storage.service';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly storageService: StorageService) {}

  @Get()
  @Header('Cross-Origin-Resource-Policy', 'cross-origin')
  @Header('Cache-Control', 'public, max-age=86400')
  @Header('X-Content-Type-Options', 'nosniff')
  @ApiOperation({ summary: 'Proxy a stored image from Azure Blob Storage' })
  @ApiOkResponse({ description: 'Image bytes' })
  async getFile(
    @Query() query: GetStoredFileQueryDto,
  ): Promise<StreamableFile> {
    const file = await this.storageService.readImage(query.fileName);
    return new StreamableFile(file.bytes, {
      type: file.contentType,
      disposition: 'inline',
    });
  }
}
