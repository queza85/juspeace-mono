import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { MailService } from '../mail/mail.service';
import type { IAuthRepository } from './auth.repository.interface';
import { PasswordResetService } from './password-reset.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('PasswordResetService', () => {
  let service: PasswordResetService;
  let authRepository: jest.Mocked<IAuthRepository>;
  let mailService: { sendPasswordResetOtp: jest.Mock };

  const now = new Date('2026-01-01T00:00:00.000Z');

  const activeUser: User = {
    id: 'user-1',
    email: 'admin@juspeace.local',
    passwordHash: 'hashed-password',
    role: UserRole.ADMIN,
    name: 'Admin',
    isActive: true,
    twoFactorEnabled: false,
    createdAt: now,
    updatedAt: now,
  };

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

    mailService = {
      sendPasswordResetOtp: jest.fn().mockResolvedValue(undefined),
    };

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

    const configService = {
      getOrThrow: jest.fn((key: string) => {
        if (key === 'passwordReset.codeTtlMinutes') {
          return 10;
        }
        if (key === 'passwordReset.tokenTtlMinutes') {
          return 15;
        }
        throw new Error(`Unexpected config key: ${key}`);
      }),
    } as unknown as ConfigService;

    service = new PasswordResetService(
      authRepository,
      mailService as unknown as MailService,
      configService,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('sends a hashed OTP for an existing password user', async () => {
    authRepository.findUserByEmail.mockResolvedValue(activeUser);
    authRepository.invalidateActivePasswordResetCodes.mockResolvedValue(0);
    authRepository.createPasswordResetCode.mockResolvedValue({
      id: 'code-1',
      userId: activeUser.id,
      codeHash: 'hash',
      expiresAt: new Date(now.getTime() + 600_000),
      consumedAt: null,
      attemptCount: 0,
      createdAt: now,
    });

    await service.requestReset(activeUser.email);

    expect(
      authRepository.createPasswordResetCode.mock.calls.length,
    ).toBeGreaterThan(0);
    expect(mailService.sendPasswordResetOtp.mock.calls).toEqual([
      [activeUser.email, expect.stringMatching(/^\d{6}$/), 10],
    ]);
  });

  it('rejects unknown emails and does not send mail', async () => {
    authRepository.findUserByEmail.mockResolvedValue(null);

    await expect(
      service.requestReset('missing@juspeace.local'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(mailService.sendPasswordResetOtp.mock.calls).toHaveLength(0);
    expect(authRepository.createPasswordResetCode.mock.calls).toHaveLength(0);
  });

  it('rejects OAuth-only accounts that have no password', async () => {
    authRepository.findUserByEmail.mockResolvedValue({
      ...activeUser,
      passwordHash: null,
    });

    await expect(service.requestReset(activeUser.email)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(mailService.sendPasswordResetOtp.mock.calls).toHaveLength(0);
  });

  it('issues a reset token when the OTP matches', async () => {
    const code = '123456';
    const codeHash = createHash('sha256').update(code).digest('hex');

    authRepository.findUserByEmail.mockResolvedValue(activeUser);
    authRepository.findLatestActivePasswordResetCode.mockResolvedValue({
      id: 'code-1',
      userId: activeUser.id,
      codeHash,
      expiresAt: new Date(now.getTime() + 600_000),
      consumedAt: null,
      attemptCount: 0,
      createdAt: now,
    });
    authRepository.consumePasswordResetCode.mockResolvedValue();
    authRepository.invalidateActivePasswordResetSessions.mockResolvedValue(0);
    authRepository.createPasswordResetSession.mockResolvedValue({
      id: 'session-1',
      userId: activeUser.id,
      tokenHash: 'token-hash',
      expiresAt: new Date(now.getTime() + 900_000),
      consumedAt: null,
      createdAt: now,
    });

    const result = await service.verifyCode(activeUser.email, code);

    expect(result.resetToken).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(authRepository.consumePasswordResetCode.mock.calls).toEqual([
      ['code-1'],
    ]);
  });

  it('rejects expired OTP codes', async () => {
    authRepository.findUserByEmail.mockResolvedValue(activeUser);
    authRepository.findLatestActivePasswordResetCode.mockResolvedValue({
      id: 'code-1',
      userId: activeUser.id,
      codeHash: 'hash',
      expiresAt: new Date(now.getTime() - 1),
      consumedAt: null,
      attemptCount: 0,
      createdAt: now,
    });

    await expect(
      service.verifyCode(activeUser.email, '123456'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects password reuse on reset', async () => {
    authRepository.findPasswordResetSessionByHash.mockResolvedValue({
      id: 'session-1',
      userId: activeUser.id,
      tokenHash: 'token-hash',
      expiresAt: new Date(now.getTime() + 900_000),
      consumedAt: null,
      createdAt: now,
      user: activeUser,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await expect(
      service.resetPassword('raw-reset-token', 'SamePassword1'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(authRepository.updateUserPassword.mock.calls).toHaveLength(0);
  });

  it('updates password and revokes sessions on successful reset', async () => {
    authRepository.findPasswordResetSessionByHash.mockResolvedValue({
      id: 'session-1',
      userId: activeUser.id,
      tokenHash: 'token-hash',
      expiresAt: new Date(now.getTime() + 900_000),
      consumedAt: null,
      createdAt: now,
      user: activeUser,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
    authRepository.updateUserPassword.mockResolvedValue({
      ...activeUser,
      passwordHash: 'new-hash',
    });
    authRepository.consumePasswordResetSession.mockResolvedValue();
    authRepository.invalidateActivePasswordResetCodes.mockResolvedValue(0);
    authRepository.invalidateActivePasswordResetSessions.mockResolvedValue(0);
    authRepository.revokeAllUserRefreshTokens.mockResolvedValue(1);

    await service.resetPassword('raw-reset-token', 'NewPassword1');

    expect(authRepository.updateUserPassword.mock.calls).toEqual([
      [activeUser.id, 'new-hash'],
    ]);
    expect(authRepository.revokeAllUserRefreshTokens.mock.calls).toEqual([
      [activeUser.id],
    ]);
  });
});
