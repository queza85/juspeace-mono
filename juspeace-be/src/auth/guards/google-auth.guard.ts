import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  getAuthenticateOptions() {
    return {
      prompt: 'select_account' as const,
      session: false,
    };
  }

  canActivate(context: ExecutionContext) {
    const clientId = this.configService.get<string>(
      'auth.oauth.google.clientId',
    );
    const clientSecret = this.configService.get<string>(
      'auth.oauth.google.clientSecret',
    );

    if (!clientId || !clientSecret) {
      const response = context.switchToHttp().getResponse<Response>();
      const request = context.switchToHttp().getRequest<Request>();

      if (!response.headersSent) {
        response.redirect(this.resolveFailureRedirect(request));
      }

      // Deny without throwing — GlobalExceptionFilter skips body when headersSent.
      return false;
    }

    return super.canActivate(context);
  }

  private resolveFailureRedirect(request: Request): string {
    const defaultUrl = this.configService.getOrThrow<string>(
      'auth.oauth.failureRedirectUrl',
    );
    const queryRedirect =
      typeof request.query.failureRedirect === 'string'
        ? request.query.failureRedirect.trim()
        : '';

    if (!queryRedirect) {
      return defaultUrl;
    }

    const allowedOrigins =
      this.configService.get<string[]>('corsOrigins') ?? [];
    try {
      const parsed = new URL(queryRedirect);
      if (allowedOrigins.includes(parsed.origin)) {
        return queryRedirect;
      }
    } catch {
      // Ignore invalid redirect URLs and fall back to the default.
    }

    return defaultUrl;
  }

  handleRequest<TUser>(
    err: Error | null,
    user: TUser,
    _info: unknown,
    context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      const res = context.switchToHttp().getResponse<Response>();
      if (!res.headersSent) {
        const failureRedirectUrl = this.configService.getOrThrow<string>(
          'auth.oauth.failureRedirectUrl',
        );
        res.redirect(failureRedirectUrl);
      }
      throw err ?? new UnauthorizedException('INVALID_OAUTH_PROFILE');
    }

    return user;
  }
}
