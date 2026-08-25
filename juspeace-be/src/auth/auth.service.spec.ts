import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import type { IAuthRepository } from './auth.repository.interface';
import { AUTH_REPOSITORY } from './auth.repository.interface';

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

  beforeEach(() => {
    authRepository = {
      findUserByEmail: jest.fn(),
      findUserById: jest.fn(),
      createRefreshToken: jest.fn(),
      findRefreshTokenByHash: jest.fn(),
      revokeRefreshToken: jest.fn(),
      revokeRefreshTokenFamily: jest.fn(),
      revokeAllUserRefreshTokens: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('access-token'),
    };

    const configService = {
      getOrThrow: jest.fn((key: string) => {
        if (key === 'auth.refreshTokenTtlDays') {
          return 7;
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
  });

  it('logs in with valid credentials and stores hashed refresh token', async () => {
    authRepository.findUserByEmail.mockResolvedValue(activeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
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

  it('rejects invalid credentials with a generic error', async () => {
    authRepository.findUserByEmail.mockResolvedValue(activeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login(activeUser.email, 'wrong-password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
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
    authRepository.createRefreshToken.mockResolvedValue({
      id: 'rt-new',
      userId: activeUser.id,
      tokenHash: 'new-hash',
      familyId: 'family-1',
      expiresAt: new Date(Date.now() + 86_400_000),
      revokedAt: null,
      userAgent: null,
      ipAddress: null,
      createdAt: now,
    });

    const session = await service.refresh(rawToken);

    expect(authRepository.revokeRefreshToken.mock.calls).toEqual([['rt-old']]);
    const createArgs = authRepository.createRefreshToken.mock.calls[0]?.[0];
    expect(createArgs?.familyId).toBe('family-1');
    expect(session.accessToken).toBe('access-token');
    expect(session.refreshToken).not.toBe(rawToken);
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
});

describe('AUTH_REPOSITORY token', () => {
  it('exports a DI symbol', () => {
    expect(AUTH_REPOSITORY).toBeDefined();
  });
});
