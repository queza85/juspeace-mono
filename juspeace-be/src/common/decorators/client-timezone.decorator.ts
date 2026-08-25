import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestWithTimezone } from '../middleware/timezone.middleware';

/**
 * IANA timezone from the `X-Timezone` request header (e.g. Asia/Yangon).
 * Undefined when missing or invalid.
 */
export const ClientTimezone = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithTimezone>();
    return request.timezone;
  },
);
