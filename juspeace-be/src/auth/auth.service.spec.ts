import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuthProvider, User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import type { IAuthRepository } from './auth.repository.interface';
import { AUTH_REPOSITORY } from './auth.repository.interface';
import type { GoogleOAuthProfile } from './strategies/google.strategy';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: jest.Mocked<IAuthRepository>;
  let jwtService: { signAsync: jest.Mock };

  const now = new Date('2026-01-01T00:00:00.000Z');

  const activeUser: User = {
    id: 'user-1',
    email: 'user@juspeace.local',
    passwordHash: 'hashed',
    role: UserRole.USER,
    name: 'Demo User',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const oauthOnlyUser: User = {
    ...activeUser,
    id: 'user-oauth',
    email: 'oauth@juspeace.local',
    passwordHash: null,
    name: 'OAuth User',
  };

  const googleProfile: GoogleOAuthProfile = {
    providerUserId: 'google-sub-1',
    email: 'oauth@juspeace.local',
    emailVerified: true,
    name: 'OAuth User',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    authRepository = {
      findUserByEmail: jest.fn(),
      findUserById: jest.fn(),
      createRefreshToken: jest.fn(),
      findRefreshTokenByHash: jest.fn(),
      revokeRefreshToken: jest.fn(),
      revokeRefreshTokenFamily: jest.fn(),
      revokeAllUserRefreshTokens: jest.fn(),
      findOAuthAccount: jest.fn(),
      createUserFromOAuth: jest.fn(),
      createOAuthAccount: jest.fn(),
      createUserWithOAuthAccount: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('access-token'),
    };

    const configService = {
      getOrThrow: jest.fn((key: string) => {
        if (key === 'auth.refreshTokenSessionTtlDays') {
          return 1;
        }
        if (key === 'auth.refreshTokenRememberTtlDays') {
          return 5;
        }
        if (key === 'auth.jwtAccessTtl') {
          return '15m';
        }
        throw new Error(`Unexpected config key: ${key}`);
      }),
    } as unknown as ConfigService;

    service = new AuthService(
      authRepository,
      jwtService as unknown as JwtService,
      configService,
    );

    authRepository.createRefreshToken.mockResolvedValue({
      id: 'rt-1',
      userId: activeUser.id,
      tokenHash: 'hash',
      familyId: 'family-1',
      expiresAt: new Date(now.getTime() + 86_400_000),
      revokedAt: null,
      userAgent: null,
      ipAddress: null,
      createdAt: now,
    });
  });

  it('logs in with valid credentials and stores hashed refresh token', async () => {
    authRepository.findUserByEmail.mockResolvedValue(activeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const session = await service.login(activeUser.email, 'password123');

    expect(session.accessToken).toBe('access-token');
    expect(session.user.email).toBe(activeUser.email);
    expect(session.refreshToken).toBeTruthy();

    const createArgs = authRepository.createRefreshToken.mock.calls[0]?.[0];
    expect(createArgs).toEqual(
      expect.objectContaining({
        userId: activeUser.id,
      }),
    );
    expect(typeof createArgs?.tokenHash).toBe('string');
    expect(typeof createArgs?.familyId).toBe('string');
  });

  it('issues a longer refresh token when rememberMe is enabled', async () => {
    authRepository.findUserByEmail.mockResolvedValue(activeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const session = await service.login(
      activeUser.email,
      'password123',
      {},
      { rememberMe: true },
    );

    expect(session.refreshMaxAgeMs).toBe(5 * 24 * 60 * 60 * 1000);

    const createArgs = authRepository.createRefreshToken.mock.calls[0]?.[0];
    const ttlMs = createArgs.expiresAt.getTime() - Date.now();
    expect(ttlMs).toBeGreaterThan(4 * 24 * 60 * 60 * 1000);
    expect(ttlMs).toBeLessThanOrEqual(5 * 24 * 60 * 60 * 1000);
  });

  it('issues a session-scoped refresh token when rememberMe is disabled', async () => {
    authRepository.findUserByEmail.mockResolvedValue(activeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const session = await service.login(activeUser.email, 'password123');

    expect(session.refreshMaxAgeMs).toBeNull();

    const createArgs = authRepository.createRefreshToken.mock.calls[0]?.[0];
    const ttlMs = createArgs.expiresAt.getTime() - Date.now();
    expect(ttlMs).toBeGreaterThan(23 * 60 * 60 * 1000);
    expect(ttlMs).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
  });

  it('rejects invalid credentials with a generic error', async () => {
    authRepository.findUserByEmail.mockResolvedValue(activeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login(activeUser.email, 'wrong-password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects password login for OAuth-only users', async () => {
    authRepository.findUserByEmail.mockResolvedValue(oauthOnlyUser);

    await expect(
      service.login(oauthOnlyUser.email, 'any-password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('rotates refresh tokens on successful refresh', async () => {
    const rawToken = 'raw-refresh-token';
    const tokenHash = service.hashToken(rawToken);

    authRepository.findRefreshTokenByHash.mockResolvedValue({
      id: 'rt-old',
      userId: activeUser.id,
      tokenHash,
      familyId: 'family-1',
      expiresAt: new Date(Date.now() + 86_400_000),
      revokedAt: null,
      userAgent: null,
      ipAddress: null,
      createdAt: now,
      user: activeUser,
    });

    const session = await service.refresh(rawToken);

    expect(authRepository.revokeRefreshToken.mock.calls).toEqual([['rt-old']]);
    const createArgs = authRepository.createRefreshToken.mock.calls[0]?.[0];
    expect(createArgs?.familyId).toBe('family-1');
    expect(session.accessToken).toBe('access-token');
    expect(session.refreshToken).not.toBe(rawToken);
  });

  it('preserves remember-me sessions when rotating refresh tokens', async () => {
    const rawToken = 'remember-refresh-token';
    const tokenHash = service.hashToken(rawToken);
    const rememberTtlMs = 5 * 24 * 60 * 60 * 1000;
    const createdAt = new Date(Date.now() - 60_000);

    authRepository.findRefreshTokenByHash.mockResolvedValue({
      id: 'rt-remember',
      userId: activeUser.id,
      tokenHash,
      familyId: 'family-remember',
      expiresAt: new Date(Date.now() + rememberTtlMs),
      revokedAt: null,
      userAgent: null,
      ipAddress: null,
      createdAt,
      user: activeUser,
    });

    const session = await service.refresh(rawToken);

    expect(session.refreshMaxAgeMs).toBe(rememberTtlMs);
    const createArgs = authRepository.createRefreshToken.mock.calls[0]?.[0];
    expect(createArgs?.familyId).toBe('family-remember');
  });

  it('revokes the token family when a revoked refresh token is reused', async () => {
    const rawToken = 'stolen-refresh-token';
    const tokenHash = service.hashToken(rawToken);

    authRepository.findRefreshTokenByHash.mockResolvedValue({
      id: 'rt-old',
      userId: activeUser.id,
      tokenHash,
      familyId: 'family-1',
      expiresAt: new Date(Date.now() + 86_400_000),
      revokedAt: new Date(),
      userAgent: null,
      ipAddress: null,
      createdAt: now,
      user: activeUser,
    });

    await expect(service.refresh(rawToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(authRepository.revokeRefreshTokenFamily.mock.calls).toEqual([
      ['family-1'],
    ]);
  });

  it('revokes the current refresh token on logout', async () => {
    const rawToken = 'logout-refresh-token';
    const tokenHash = service.hashToken(rawToken);

    authRepository.findRefreshTokenByHash.mockResolvedValue({
      id: 'rt-1',
      userId: activeUser.id,
      tokenHash,
      familyId: 'family-1',
      expiresAt: new Date(Date.now() + 86_400_000),
      revokedAt: null,
      userAgent: null,
      ipAddress: null,
      createdAt: now,
      user: activeUser,
    });

    await service.logout(rawToken);

    expect(authRepository.revokeRefreshToken.mock.calls).toEqual([['rt-1']]);
  });

  describe('loginWithGoogle', () => {
    it('provisions a new user when no account exists', async () => {
      authRepository.findOAuthAccount.mockResolvedValue(null);
      authRepository.findUserByEmail.mockResolvedValue(null);
      authRepository.createUserWithOAuthAccount.mockResolvedValue(
        oauthOnlyUser,
      );

      const session = await service.loginWithGoogle(googleProfile);

      expect(authRepository.createUserWithOAuthAccount.mock.calls).toEqual([
        [
          { email: googleProfile.email, name: googleProfile.name },
          {
            provider: OAuthProvider.GOOGLE,
            providerUserId: googleProfile.providerUserId,
          },
        ],
      ]);
      expect(session.user.email).toBe(oauthOnlyUser.email);
      expect(session.accessToken).toBe('access-token');
    });

    it('reuses an existing OAuth account on return login', async () => {
      authRepository.findOAuthAccount.mockResolvedValue({
        id: 'oa-1',
        provider: OAuthProvider.GOOGLE,
        providerUserId: googleProfile.providerUserId,
        userId: oauthOnlyUser.id,
        createdAt: now,
        updatedAt: now,
        user: oauthOnlyUser,
      });

      const session = await service.loginWithGoogle(googleProfile);

      expect(authRepository.createUserWithOAuthAccount.mock.calls).toEqual([]);
      expect(authRepository.createOAuthAccount.mock.calls).toEqual([]);
      expect(session.user.id).toBe(oauthOnlyUser.id);
    });

    it('links Google to an existing email user when email is verified', async () => {
      authRepository.findOAuthAccount.mockResolvedValue(null);
      authRepository.findUserByEmail.mockResolvedValue(activeUser);
      authRepository.createOAuthAccount.mockResolvedValue({
        id: 'oa-2',
        provider: OAuthProvider.GOOGLE,
        providerUserId: googleProfile.providerUserId,
        userId: activeUser.id,
        createdAt: now,
        updatedAt: now,
      });

      const session = await service.loginWithGoogle({
        ...googleProfile,
        email: activeUser.email,
      });

      expect(authRepository.createOAuthAccount.mock.calls).toEqual([
        [
          {
            userId: activeUser.id,
            provider: OAuthProvider.GOOGLE,
            providerUserId: googleProfile.providerUserId,
          },
        ],
      ]);
      expect(session.user.id).toBe(activeUser.id);
    });

    it('rejects unverified Google emails', async () => {
      await expect(
        service.loginWithGoogle({ ...googleProfile, emailVerified: false }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(authRepository.findOAuthAccount.mock.calls).toEqual([]);
    });

    it('rejects inactive users on Google login', async () => {
      authRepository.findOAuthAccount.mockResolvedValue({
        id: 'oa-1',
        provider: OAuthProvider.GOOGLE,
        providerUserId: googleProfile.providerUserId,
        userId: oauthOnlyUser.id,
        createdAt: now,
        updatedAt: now,
        user: { ...oauthOnlyUser, isActive: false },
      });

      await expect(
        service.loginWithGoogle(googleProfile),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});

describe('AUTH_REPOSITORY token', () => {
  it('exports a DI symbol', () => {
    expect(AUTH_REPOSITORY).toBeDefined();
  });
});
