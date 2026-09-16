import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User, UserRole } from '@prisma/client';
import { createHash } from 'crypto';
import { MailService } from '../mail/mail.service';
import type { IAuthRepository } from './auth.repository.interface';
import type { AuthService, IssuedSession } from './auth.service';
import { TwoFactorService } from './two-factor.service';

describe('TwoFactorService', () => {
  let service: TwoFactorService;
  let authRepository: jest.Mocked<IAuthRepository>;
  let authService: { issueSession: jest.Mock };
  let mailService: { sendTwoFactorOtp: jest.Mock };

  const now = new Date('2026-01-01T00:00:00.000Z');

  const activeUser: User = {
    id: 'user-1',
    email: 'admin@juspeace.local',
    passwordHash: 'hashed-password',
    role: UserRole.ADMIN,
    name: 'Admin',
    isActive: true,
    twoFactorEnabled: true,
    createdAt: now,
    updatedAt: now,
  };

  const challengeToken = 'a'.repeat(43);
  const challengeTokenHash = createHash('sha256')
    .update(challengeToken)
    .digest('hex');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(now);

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
      createUserWithPassword: jest.fn(),
      updateUserPassword: jest.fn(),
      invalidateActivePasswordResetCodes: jest.fn(),
      createPasswordResetCode: jest.fn(),
      findLatestActivePasswordResetCode: jest.fn(),
      incrementPasswordResetCodeAttempts: jest.fn(),
      consumePasswordResetCode: jest.fn(),
      createPasswordResetSession: jest.fn(),
      findPasswordResetSessionByHash: jest.fn(),
      consumePasswordResetSession: jest.fn(),
      invalidateActivePasswordResetSessions: jest.fn(),
      invalidateActiveTwoFactorChallenges: jest.fn(),
      createTwoFactorChallenge: jest.fn(),
      findTwoFactorChallengeByHash: jest.fn(),
      consumeTwoFactorChallenge: jest.fn(),
      invalidateActiveTwoFactorCodes: jest.fn(),
      createTwoFactorCode: jest.fn(),
      findLatestActiveTwoFactorCode: jest.fn(),
      incrementTwoFactorCodeAttempts: jest.fn(),
      consumeTwoFactorCode: jest.fn(),
    };

    authService = {
      issueSession: jest.fn(),
    };

    mailService = {
      sendTwoFactorOtp: jest.fn().mockResolvedValue(undefined),
    };

    const configService = {
      getOrThrow: jest.fn((key: string) => {
        if (key === 'twoFactor.codeTtlMinutes') {
          return 10;
        }
        if (key === 'twoFactor.challengeTtlMinutes') {
          return 15;
        }
        if (key === 'twoFactor.devChallengeEnabled') {
          return true;
        }
        throw new Error(`Unexpected config key: ${key}`);
      }),
    } as unknown as ConfigService;

    service = new TwoFactorService(
      authRepository,
      authService as unknown as AuthService,
      mailService as unknown as MailService,
      configService,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('creates a challenge and emails a hashed OTP', async () => {
    authRepository.findUserById.mockResolvedValue(activeUser);
    authRepository.invalidateActiveTwoFactorChallenges.mockResolvedValue(0);
    authRepository.invalidateActiveTwoFactorCodes.mockResolvedValue(0);
    authRepository.createTwoFactorChallenge.mockResolvedValue({
      id: 'challenge-1',
      userId: activeUser.id,
      tokenHash: 'hash',
      rememberMe: false,
      userAgent: null,
      ipAddress: null,
      expiresAt: new Date(now.getTime() + 900_000),
      consumedAt: null,
      createdAt: now,
    });
    authRepository.createTwoFactorCode.mockResolvedValue({
      id: 'code-1',
      userId: activeUser.id,
      codeHash: 'code-hash',
      expiresAt: new Date(now.getTime() + 600_000),
      consumedAt: null,
      attemptCount: 0,
      createdAt: now,
    });

    const result = await service.createChallenge(activeUser.id, {
      rememberMe: true,
    });

    expect(result.challengeToken).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(authRepository.createTwoFactorChallenge.mock.calls).toHaveLength(1);
    expect(mailService.sendTwoFactorOtp.mock.calls).toEqual([
      [activeUser.email, expect.stringMatching(/^\d{6}$/), 10],
    ]);
  });

  it('rejects unknown emails on the dev challenge endpoint path', async () => {
    authRepository.findUserByEmail.mockResolvedValue(null);

    await expect(
      service.createDevChallenge('missing@juspeace.local'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(mailService.sendTwoFactorOtp.mock.calls).toHaveLength(0);
  });

  it('issues a session when the OTP matches', async () => {
    const code = '123456';
    const codeHash = createHash('sha256').update(code).digest('hex');
    const session: IssuedSession = {
      accessToken: 'access',
      refreshToken: 'refresh',
      refreshMaxAgeMs: null,
      user: {
        id: activeUser.id,
        email: activeUser.email,
        role: activeUser.role,
        name: activeUser.name,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    };

    authRepository.findTwoFactorChallengeByHash.mockResolvedValue({
      id: 'challenge-1',
      userId: activeUser.id,
      tokenHash: challengeTokenHash,
      rememberMe: false,
      userAgent: null,
      ipAddress: null,
      expiresAt: new Date(now.getTime() + 900_000),
      consumedAt: null,
      createdAt: now,
      user: activeUser,
    });
    authRepository.findLatestActiveTwoFactorCode.mockResolvedValue({
      id: 'code-1',
      userId: activeUser.id,
      codeHash,
      expiresAt: new Date(now.getTime() + 600_000),
      consumedAt: null,
      attemptCount: 0,
      createdAt: now,
    });
    authRepository.consumeTwoFactorCode.mockResolvedValue();
    authRepository.consumeTwoFactorChallenge.mockResolvedValue();
    authRepository.invalidateActiveTwoFactorCodes.mockResolvedValue(0);
    authRepository.invalidateActiveTwoFactorChallenges.mockResolvedValue(0);
    authService.issueSession.mockResolvedValue(session);

    const result = await service.verifyCode(challengeToken, code);

    expect(result).toEqual(session);
    expect(authService.issueSession).toHaveBeenCalledWith(
      activeUser,
      expect.any(Object),
      expect.any(String),
      { rememberMe: false },
    );
  });

  it('rejects expired OTP codes', async () => {
    authRepository.findTwoFactorChallengeByHash.mockResolvedValue({
      id: 'challenge-1',
      userId: activeUser.id,
      tokenHash: challengeTokenHash,
      rememberMe: false,
      userAgent: null,
      ipAddress: null,
      expiresAt: new Date(now.getTime() + 900_000),
      consumedAt: null,
      createdAt: now,
      user: activeUser,
    });
    authRepository.findLatestActiveTwoFactorCode.mockResolvedValue({
      id: 'code-1',
      userId: activeUser.id,
      codeHash: 'hash',
      expiresAt: new Date(now.getTime() - 1),
      consumedAt: null,
      attemptCount: 0,
      createdAt: now,
    });

    await expect(
      service.verifyCode(challengeToken, '123456'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects invalid challenge tokens', async () => {
    authRepository.findTwoFactorChallengeByHash.mockResolvedValue(null);

    await expect(
      service.verifyCode(challengeToken, '123456'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('expires codes after max verify attempts', async () => {
    const code = '123456';
    const codeHash = createHash('sha256').update('999999').digest('hex');

    authRepository.findTwoFactorChallengeByHash.mockResolvedValue({
      id: 'challenge-1',
      userId: activeUser.id,
      tokenHash: challengeTokenHash,
      rememberMe: false,
      userAgent: null,
      ipAddress: null,
      expiresAt: new Date(now.getTime() + 900_000),
      consumedAt: null,
      createdAt: now,
      user: activeUser,
    });
    authRepository.findLatestActiveTwoFactorCode.mockResolvedValue({
      id: 'code-1',
      userId: activeUser.id,
      codeHash,
      expiresAt: new Date(now.getTime() + 600_000),
      consumedAt: null,
      attemptCount: 4,
      createdAt: now,
    });
    authRepository.incrementTwoFactorCodeAttempts.mockResolvedValue({
      id: 'code-1',
      userId: activeUser.id,
      codeHash,
      expiresAt: new Date(now.getTime() + 600_000),
      consumedAt: null,
      attemptCount: 5,
      createdAt: now,
    });

    await expect(
      service.verifyCode(challengeToken, code),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(authRepository.consumeTwoFactorCode.mock.calls).toEqual([
      ['code-1'],
    ]);
  });

  it('skips resend within the cooldown window', async () => {
    authRepository.findTwoFactorChallengeByHash.mockResolvedValue({
      id: 'challenge-1',
      userId: activeUser.id,
      tokenHash: challengeTokenHash,
      rememberMe: false,
      userAgent: null,
      ipAddress: null,
      expiresAt: new Date(now.getTime() + 900_000),
      consumedAt: null,
      createdAt: now,
      user: activeUser,
    });
    authRepository.findLatestActiveTwoFactorCode.mockResolvedValue({
      id: 'code-1',
      userId: activeUser.id,
      codeHash: 'hash',
      expiresAt: new Date(now.getTime() + 600_000),
      consumedAt: null,
      attemptCount: 0,
      createdAt: now,
    });

    await service.resendCode(challengeToken);

    expect(mailService.sendTwoFactorOtp.mock.calls).toHaveLength(0);
    expect(authRepository.createTwoFactorCode.mock.calls).toHaveLength(0);
  });
});
