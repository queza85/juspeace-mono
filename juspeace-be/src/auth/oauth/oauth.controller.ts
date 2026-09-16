import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeController } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import type { Session } from 'express-session';
import { AuthService } from '../auth.service';
import { clearRefreshCookie, setRefreshCookie } from '../auth.cookie';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import type { GoogleOAuthProfile } from '../strategies/google.strategy';

type OAuthSession = Session & {
  oauthSuccessRedirect?: string;
  oauthFailureRedirect?: string;
  oauthReturnUrl?: string;
};

@ApiExcludeController()
@Controller('auth')
export class OAuthController {
  private readonly cookieName: string;
  private readonly cookieSecure: boolean;
  private readonly successRedirectUrl: string;
  private readonly failureRedirectUrl: string;
  private readonly allowedOrigins: string[];

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.cookieName = this.configService.getOrThrow<string>('auth.cookieName');
    this.cookieSecure =
      this.configService.getOrThrow<boolean>('auth.cookieSecure');
    this.successRedirectUrl = this.configService.getOrThrow<string>(
      'auth.oauth.successRedirectUrl',
    );
    this.failureRedirectUrl = this.configService.getOrThrow<string>(
      'auth.oauth.failureRedirectUrl',
    );
    this.allowedOrigins = this.configService.get<string[]>('corsOrigins') ?? [];
  }

  @Get('google')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @UseGuards(GoogleAuthGuard)
  googleAuth(@Req() req: Request): void {
    this.persistOAuthContext(req);
  }

  @Get('google/callback')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { successRedirect, failureRedirect } =
      this.resolveOAuthRedirects(req);

    try {
      const profile = req.user as GoogleOAuthProfile | undefined;
      if (!profile) {
        res.redirect(failureRedirect);
        return;
      }

      const session = await this.authService.loginWithGoogle(profile, {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      });

      setRefreshCookie(res, session.refreshToken, session.refreshMaxAgeMs, {
        cookieName: this.cookieName,
        cookieSecure: this.cookieSecure,
      });

      res.redirect(successRedirect);
    } catch {
      clearRefreshCookie(res, {
        cookieName: this.cookieName,
        cookieSecure: this.cookieSecure,
      });
      res.redirect(failureRedirect);
    }
  }

  private persistOAuthContext(req: Request): void {
    const session = req.session as OAuthSession;
    const successRedirect = this.readQueryString(req.query.successRedirect);
    const failureRedirect = this.readQueryString(req.query.failureRedirect);
    const returnUrl = this.readQueryString(req.query.returnUrl);

    if (successRedirect && this.isAllowedFrontendRedirect(successRedirect)) {
      session.oauthSuccessRedirect = successRedirect;
    }

    if (failureRedirect && this.isAllowedFrontendRedirect(failureRedirect)) {
      session.oauthFailureRedirect = failureRedirect;
    }

    if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')) {
      session.oauthReturnUrl = returnUrl;
    }
  }

  private resolveOAuthRedirects(req: Request): {
    successRedirect: string;
    failureRedirect: string;
  } {
    const session = req.session as OAuthSession;
    const successBase = session.oauthSuccessRedirect ?? this.successRedirectUrl;
    const failureRedirect =
      session.oauthFailureRedirect ?? this.failureRedirectUrl;
    const returnUrl = session.oauthReturnUrl;

    delete session.oauthSuccessRedirect;
    delete session.oauthFailureRedirect;
    delete session.oauthReturnUrl;

    if (!returnUrl) {
      return { successRedirect: successBase, failureRedirect };
    }

    const separator = successBase.includes('?') ? '&' : '?';
    return {
      successRedirect: `${successBase}${separator}returnUrl=${encodeURIComponent(returnUrl)}`,
      failureRedirect,
    };
  }

  private readQueryString(value: unknown): string | undefined {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    return undefined;
  }

  private isAllowedFrontendRedirect(url: string): boolean {
    try {
      const parsed = new URL(url);
      return this.allowedOrigins.includes(parsed.origin);
    } catch {
      return false;
    }
  }
}
