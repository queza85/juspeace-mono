import {
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

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
      throw new ServiceUnavailableException('GOOGLE_OAUTH_NOT_CONFIGURED');
    }

    return super.canActivate(context);
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
