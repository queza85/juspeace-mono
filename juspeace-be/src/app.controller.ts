import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiMessage } from './common/decorators/api-message.decorator';
import { ApiResponseDto } from './common/dto/api-response.dto';

@ApiTags('root')
@Controller()
export class AppController {
  @Get()
  @ApiMessage('API_METADATA_RETRIEVED_SUCCESSFULLY')
  @ApiOperation({ summary: 'API metadata' })
  @ApiOkResponse({ type: ApiResponseDto })
  getMetadata() {
    return {
      name: 'Juspeace API',
      version: '1.0.0',
      docs: '/docs',
      health: '/api/v1/health',
    };
  }
}
