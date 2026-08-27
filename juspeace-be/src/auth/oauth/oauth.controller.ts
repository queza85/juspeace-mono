import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeController } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from '../auth.service';
import { clearRefreshCookie, setRefreshCookie } from '../auth.cookie';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import type { GoogleOAuthProfile } from '../strategies/google.strategy';

@ApiExcludeController()
@Controller('auth')
export class OAuthController {
  private readonly cookieName: string;
  private readonly cookieSecure: boolean;
  private readonly successRedirectUrl: string;
  private readonly failureRedirectUrl: string;

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
  }

  @Get('google')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @UseGuards(GoogleAuthGuard)
  googleAuth(): void {
    // Guard redirects to Google.
  }

  @Get('google/callback')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const profile = req.user as GoogleOAuthProfile | undefined;
      if (!profile) {
        res.redirect(this.failureRedirectUrl);
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

      res.redirect(this.successRedirectUrl);
    } catch {
      clearRefreshCookie(res, {
        cookieName: this.cookieName,
        cookieSecure: this.cookieSecure,
      });
      res.redirect(this.failureRedirectUrl);
    }
  }
}
