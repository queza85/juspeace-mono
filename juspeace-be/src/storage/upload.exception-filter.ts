import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { MulterError } from 'multer';
import { errorResponse } from '../common/dto/api-response.dto';

@Catch(MulterError)
export class UploadExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost) {
    const message =
      exception.code === 'LIMIT_FILE_SIZE'
        ? 'FILE_TOO_LARGE'
        : 'FILE_TYPE_NOT_ALLOWED';
    const response = host.switchToHttp().getResponse<Response>();
    response.status(HttpStatus.BAD_REQUEST).json(errorResponse(message));
  }
}
