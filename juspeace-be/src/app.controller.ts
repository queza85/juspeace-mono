import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('root')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'API metadata' })
  @ApiOkResponse({ description: 'Service metadata and documentation links' })
  getMetadata() {
    return {
      name: 'Juspeace API',
      version: '1.0.0',
      docs: '/docs',
      health: '/api/v1/health',
    };
  }
}
