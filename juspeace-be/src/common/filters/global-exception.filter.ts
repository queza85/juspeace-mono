import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { errorResponse } from '../dto/api-response.dto';

const STATUS_MESSAGE_MAP: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
  [HttpStatus.TOO_MANY_REQUESTS]: 'TOO_MANY_REQUESTS',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
};

const PHRASE_MESSAGE_MAP: Record<string, string> = {
  'invalid credentials': 'INVALID_CREDENTIALS',
  'invalid refresh token': 'INVALID_REFRESH_TOKEN',
  'insufficient permissions': 'INSUFFICIENT_PERMISSIONS',
  throttlerexception: 'TOO_MANY_REQUESTS',
  'too many requests': 'TOO_MANY_REQUESTS',
};

function isScreamingSnake(value: string): boolean {
  return /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/.test(value);
}

function normalizePhrase(value: string): string {
  return value.trim().toLowerCase();
}

function toMessageCode(
  status: number,
  detail: string | string[] | undefined,
): string {
  if (Array.isArray(detail)) {
    return 'VALIDATION_FAILED';
  }

  if (typeof detail === 'string' && detail.length > 0) {
    if (isScreamingSnake(detail)) {
      return detail;
    }

    const mapped = PHRASE_MESSAGE_MAP[normalizePhrase(detail)];
    if (mapped) {
      return mapped;
    }

    if (normalizePhrase(detail).includes('not found')) {
      return 'NOT_FOUND';
    }
  }

  return STATUS_MESSAGE_MAP[status] ?? 'INTERNAL_SERVER_ERROR';
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // OAuth guards may redirect before throwing; avoid double-writing the body.
    if (response.headersSent) {
      return;
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let detail: string | string[] | undefined;

    if (typeof exceptionResponse === 'string') {
      detail = exceptionResponse;
    } else if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      detail = (exceptionResponse as { message?: string | string[] }).message;
    } else if (exception instanceof Error) {
      detail = exception.message;
    }

    const message = toMessageCode(status, detail);

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const data =
      Array.isArray(detail) && message === 'VALIDATION_FAILED'
        ? { errors: detail }
        : null;

    response.status(status).json(errorResponse(message, data));
  }
}
