import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuthProvider, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { AUTH_REPOSITORY } from './auth.repository.interface';
import type { AuthUser, IAuthRepository } from './auth.repository.interface';
import {
  AccessTokenResponseDto,
  AuthTokensResponseDto,
  UserResponseDto,
} from './dto/auth.dto';
import type { GoogleOAuthProfile } from './strategies/google.strategy';
import { JwtPayload } from './strategies/jwt.strategy';

const REFRESH_TOKEN_BYTES = 32;

export interface SessionMeta {
  userAgent?: string;
  ipAddress?: string;
}

export interface IssuedSession {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
  refreshMaxAgeMs: number;
}

@Injectable()
export class AuthService {
  private readonly refreshTtlDays: number;
  private readonly jwtAccessTtl: string;

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.refreshTtlDays = this.configService.getOrThrow<number>(
      'auth.refreshTokenTtlDays',
    );
    this.jwtAccessTtl =
      this.configService.getOrThrow<string>('auth.jwtAccessTtl');
  }

  async login(
    email: string,
    password: string,
    meta: SessionMeta = {},
  ): Promise<IssuedSession> {
    const user = await this.authRepository.findUserByEmail(email);

    if (!user || !user.isActive || !user.passwordHash) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    return this.issueSession(user, meta);
  }

  async loginWithGoogle(
    profile: GoogleOAuthProfile,
    meta: SessionMeta = {},
  ): Promise<IssuedSession> {
    if (!profile.emailVerified) {
      throw new UnauthorizedException('OAUTH_EMAIL_NOT_VERIFIED');
    }

    const existingAccount = await this.authRepository.findOAuthAccount(
      OAuthProvider.GOOGLE,
      profile.providerUserId,
    );

    if (existingAccount) {
      if (!existingAccount.user.isActive) {
        throw new UnauthorizedException('INVALID_CREDENTIALS');
      }
      return this.issueSession(existingAccount.user, meta);
    }

    const existingUser = await this.authRepository.findUserByEmail(
      profile.email,
    );

    if (existingUser) {
      if (!existingUser.isActive) {
        throw new UnauthorizedException('INVALID_CREDENTIALS');
      }

      await this.authRepository.createOAuthAccount({
        userId: existingUser.id,
        provider: OAuthProvider.GOOGLE,
        providerUserId: profile.providerUserId,
      });

      return this.issueSession(existingUser, meta);
    }

    const user = await this.authRepository.createUserWithOAuthAccount(
      { email: profile.email, name: profile.name },
      {
        provider: OAuthProvider.GOOGLE,
        providerUserId: profile.providerUserId,
      },
    );

    return this.issueSession(user, meta);
  }

  async refresh(
    rawRefreshToken: string | undefined,
    meta: SessionMeta = {},
  ): Promise<IssuedSession> {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('INVALID_REFRESH_TOKEN');
    }

    const tokenHash = this.hashToken(rawRefreshToken);
    const stored = await this.authRepository.findRefreshTokenByHash(tokenHash);

    if (!stored) {
      throw new UnauthorizedException('INVALID_REFRESH_TOKEN');
    }

    if (stored.revokedAt) {
      await this.authRepository.revokeRefreshTokenFamily(stored.familyId);
      throw new UnauthorizedException('INVALID_REFRESH_TOKEN');
    }

    if (stored.expiresAt.getTime() <= Date.now()) {
      await this.authRepository.revokeRefreshToken(stored.id);
      throw new UnauthorizedException('INVALID_REFRESH_TOKEN');
    }

    if (!stored.user.isActive) {
      await this.authRepository.revokeRefreshTokenFamily(stored.familyId);
      throw new UnauthorizedException('INVALID_REFRESH_TOKEN');
    }

    await this.authRepository.revokeRefreshToken(stored.id);

    return this.issueSession(stored.user, meta, stored.familyId);
  }

  async logout(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) {
      return;
    }

    const tokenHash = this.hashToken(rawRefreshToken);
    const stored = await this.authRepository.findRefreshTokenByHash(tokenHash);

    if (stored && !stored.revokedAt) {
      await this.authRepository.revokeRefreshToken(stored.id);
    }
  }

  async logoutAll(userId: string): Promise<void> {
    await this.authRepository.revokeAllUserRefreshTokens(userId);
  }

  async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.authRepository.findUserById(userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    return this.toUserResponse(user);
  }

  toAuthTokensResponse(session: IssuedSession): AuthTokensResponseDto {
    return {
      accessToken: session.accessToken,
      user: session.user,
    };
  }

  toAccessTokenResponse(session: IssuedSession): AccessTokenResponseDto {
    return { accessToken: session.accessToken };
  }

  hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  /** Constant-time compare for hex digests (defense in depth). */
  tokensEqual(a: string, b: string): boolean {
    const left = Buffer.from(a);
    const right = Buffer.from(b);
    if (left.length !== right.length) {
      return false;
    }
    return timingSafeEqual(left, right);
  }

  private async issueSession(
    user: User,
    meta: SessionMeta,
    familyId = this.createFamilyId(),
  ): Promise<IssuedSession> {
    const accessToken = await this.signAccessToken(user);
    const rawRefreshToken =
      randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');
    const refreshMaxAgeMs = this.refreshTtlDays * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + refreshMaxAgeMs);

    await this.authRepository.createRefreshToken({
      userId: user.id,
      tokenHash: this.hashToken(rawRefreshToken),
      familyId,
      expiresAt,
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: this.toUserResponse(user),
      refreshMaxAgeMs,
    };
  }

  private async signAccessToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: this.jwtAccessTtl as `${number}${'s' | 'm' | 'h' | 'd'}`,
      algorithm: 'HS256',
    });
  }

  private createFamilyId(): string {
    return randomBytes(16).toString('hex');
  }

  private toUserResponse(user: User | AuthUser): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
