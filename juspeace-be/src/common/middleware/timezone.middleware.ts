import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

export const TIMEZONE_HEADER = 'x-timezone';

/** Loose IANA timezone check (e.g. Asia/Yangon, Asia/Seoul, UTC). */
const IANA_TIMEZONE_PATTERN = /^[A-Za-z0-9_]+(?:\/[A-Za-z0-9_+-]+)+$|^UTC$/;

export type RequestWithTimezone = Request & {
  timezone?: string;
};

@Injectable()
export class TimezoneMiddleware implements NestMiddleware {
  use(req: RequestWithTimezone, _res: Response, next: NextFunction): void {
    const raw = req.header(TIMEZONE_HEADER)?.trim();

    if (raw && IANA_TIMEZONE_PATTERN.test(raw) && raw.length <= 64) {
      req.timezone = raw;
    }

    next();
  }
}
