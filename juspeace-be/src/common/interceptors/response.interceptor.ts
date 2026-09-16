import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { Observable, map } from 'rxjs';
import { API_MESSAGE_KEY } from '../decorators/api-message.decorator';
import type { ApiResponse } from '../dto/api-response.dto';

function defaultSuccessMessage(method: string): string {
  switch (method.toUpperCase()) {
    case 'POST':
      return 'CREATE_SUCCESSFULLY';
    case 'PUT':
    case 'PATCH':
      return 'UPDATE_SUCCESSFULLY';
    case 'DELETE':
      return 'DELETE_SUCCESSFULLY';
    default:
      return 'RETRIEVE_SUCCESSFULLY';
  }
}

function isAlreadyWrapped(payload: unknown): payload is ApiResponse {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'success' in payload &&
    'message' in payload &&
    'data' in payload
  );
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const customMessage = this.reflector.getAllAndOverride<string | undefined>(
      API_MESSAGE_KEY,
      [context.getHandler(), context.getClass()],
    );
    const message =
      customMessage ?? defaultSuccessMessage(request.method ?? 'GET');

    return next.handle().pipe(
      map((payload: unknown) => {
        if (isAlreadyWrapped(payload)) {
          return payload;
        }

        return {
          success: true,
          message,
          data: payload === undefined ? null : payload,
        } satisfies ApiResponse;
      }),
    );
  }
}
