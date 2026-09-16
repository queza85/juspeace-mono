import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy,
  type Profile,
  type VerifyCallback,
} from 'passport-google-oauth20';

export interface GoogleOAuthProfile {
  providerUserId: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    const clientID =
      configService.get<string>('auth.oauth.google.clientId') ?? '';
    const clientSecret =
      configService.get<string>('auth.oauth.google.clientSecret') ?? '';
    const callbackURL =
      configService.get<string>('auth.oauth.google.callbackUrl') ??
      'http://localhost:7777/api/v1/auth/google/callback';

    super({
      clientID: clientID || 'disabled',
      clientSecret: clientSecret || 'disabled',
      callbackURL,
      scope: ['email', 'profile'],
      state: true,
      pkce: true,
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const email = profile.emails?.[0]?.value?.trim().toLowerCase();
    const emailVerified =
      (profile.emails?.[0] as { verified?: boolean } | undefined)?.verified !==
      false;

    if (!profile.id || !email) {
      done(new UnauthorizedException('INVALID_OAUTH_PROFILE'), undefined);
      return;
    }

    const result: GoogleOAuthProfile = {
      providerUserId: profile.id,
      email,
      emailVerified,
      name: profile.displayName?.trim() || null,
    };

    done(null, result);
  }
}
