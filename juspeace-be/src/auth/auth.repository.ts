import { Injectable } from '@nestjs/common';
import {
  OAuthAccount,
  OAuthProvider,
  PasswordResetCode,
  PasswordResetSession,
  RefreshToken,
  TwoFactorChallenge,
  TwoFactorCode,
  User,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateOAuthAccountInput,
  CreatePasswordResetCodeInput,
  CreatePasswordResetSessionInput,
  CreateRefreshTokenInput,
  CreateTwoFactorChallengeInput,
  CreateTwoFactorCodeInput,
  CreateUserFromOAuthInput,
  CreateUserWithPasswordInput,
  IAuthRepository,
  OAuthAccountWithUser,
} from './auth.repository.interface';

@Injectable()
export class PrismaAuthRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  createRefreshToken(input: CreateRefreshTokenInput): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({
      data: {
        userId: input.userId,
        tokenHash: input.tokenHash,
        familyId: input.familyId,
        expiresAt: input.expiresAt,
        userAgent: input.userAgent,
        ipAddress: input.ipAddress,
      },
    });
  }

  findRefreshTokenByHash(tokenHash: string): Promise<
    | (RefreshToken & {
        user: User;
      })
    | null
  > {
    return this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  async revokeRefreshToken(id: string, revokedAt = new Date()): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id },
      data: { revokedAt },
    });
  }

  async revokeRefreshTokenFamily(
    familyId: string,
    revokedAt = new Date(),
  ): Promise<number> {
    const result = await this.prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt },
    });
    return result.count;
  }

  async revokeAllUserRefreshTokens(
    userId: string,
    revokedAt = new Date(),
  ): Promise<number> {
    const result = await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt },
    });
    return result.count;
  }

  findOAuthAccount(
    provider: OAuthProvider,
    providerUserId: string,
  ): Promise<OAuthAccountWithUser | null> {
    return this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerUserId: { provider, providerUserId },
      },
      include: { user: true },
    });
  }

  createUserFromOAuth(input: CreateUserFromOAuthInput): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        name: input.name ?? null,
        passwordHash: null,
      },
    });
  }

  createOAuthAccount(input: CreateOAuthAccountInput): Promise<OAuthAccount> {
    return this.prisma.oAuthAccount.create({
      data: {
        userId: input.userId,
        provider: input.provider,
        providerUserId: input.providerUserId,
      },
    });
  }

  createUserWithPassword(input: CreateUserWithPasswordInput): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash: input.passwordHash,
        name: input.name,
        role: input.role,
        isActive: true,
      },
    });
  }

  updateUserPassword(userId: string, passwordHash: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async invalidateActivePasswordResetCodes(userId: string): Promise<number> {
    const result = await this.prisma.passwordResetCode.updateMany({
      where: { userId, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    return result.count;
  }

  createPasswordResetCode(
    input: CreatePasswordResetCodeInput,
  ): Promise<PasswordResetCode> {
    return this.prisma.passwordResetCode.create({
      data: {
        userId: input.userId,
        codeHash: input.codeHash,
        expiresAt: input.expiresAt,
      },
    });
  }

  findLatestActivePasswordResetCode(
    userId: string,
  ): Promise<PasswordResetCode | null> {
    return this.prisma.passwordResetCode.findFirst({
      where: {
        userId,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  incrementPasswordResetCodeAttempts(id: string): Promise<PasswordResetCode> {
    return this.prisma.passwordResetCode.update({
      where: { id },
      data: { attemptCount: { increment: 1 } },
    });
  }

  async consumePasswordResetCode(id: string): Promise<void> {
    await this.prisma.passwordResetCode.update({
      where: { id },
      data: { consumedAt: new Date() },
    });
  }

  createPasswordResetSession(
    input: CreatePasswordResetSessionInput,
  ): Promise<PasswordResetSession> {
    return this.prisma.passwordResetSession.create({
      data: {
        userId: input.userId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      },
    });
  }

  findPasswordResetSessionByHash(
    tokenHash: string,
  ): Promise<(PasswordResetSession & { user: User }) | null> {
    return this.prisma.passwordResetSession.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  async consumePasswordResetSession(id: string): Promise<void> {
    await this.prisma.passwordResetSession.update({
      where: { id },
      data: { consumedAt: new Date() },
    });
  }

  async invalidateActivePasswordResetSessions(userId: string): Promise<number> {
    const result = await this.prisma.passwordResetSession.updateMany({
      where: { userId, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    return result.count;
  }

  async invalidateActiveTwoFactorChallenges(userId: string): Promise<number> {
    const result = await this.prisma.twoFactorChallenge.updateMany({
      where: { userId, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    return result.count;
  }

  createTwoFactorChallenge(
    input: CreateTwoFactorChallengeInput,
  ): Promise<TwoFactorChallenge> {
    return this.prisma.twoFactorChallenge.create({
      data: {
        userId: input.userId,
        tokenHash: input.tokenHash,
        rememberMe: input.rememberMe,
        expiresAt: input.expiresAt,
        userAgent: input.userAgent,
        ipAddress: input.ipAddress,
      },
    });
  }

  findTwoFactorChallengeByHash(
    tokenHash: string,
  ): Promise<(TwoFactorChallenge & { user: User }) | null> {
    return this.prisma.twoFactorChallenge.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  async consumeTwoFactorChallenge(id: string): Promise<void> {
    await this.prisma.twoFactorChallenge.update({
      where: { id },
      data: { consumedAt: new Date() },
    });
  }

  async invalidateActiveTwoFactorCodes(userId: string): Promise<number> {
    const result = await this.prisma.twoFactorCode.updateMany({
      where: { userId, consumedAt: null },
      data: { consumedAt: new Date() },
    });
    return result.count;
  }

  createTwoFactorCode(input: CreateTwoFactorCodeInput): Promise<TwoFactorCode> {
    return this.prisma.twoFactorCode.create({
      data: {
        userId: input.userId,
        codeHash: input.codeHash,
        expiresAt: input.expiresAt,
      },
    });
  }

  findLatestActiveTwoFactorCode(userId: string): Promise<TwoFactorCode | null> {
    return this.prisma.twoFactorCode.findFirst({
      where: {
        userId,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  incrementTwoFactorCodeAttempts(id: string): Promise<TwoFactorCode> {
    return this.prisma.twoFactorCode.update({
      where: { id },
      data: { attemptCount: { increment: 1 } },
    });
  }

  async consumeTwoFactorCode(id: string): Promise<void> {
    await this.prisma.twoFactorCode.update({
      where: { id },
      data: { consumedAt: new Date() },
    });
  }

  async createUserWithOAuthAccount(
    userInput: CreateUserFromOAuthInput,
    oauthInput: Omit<CreateOAuthAccountInput, 'userId'>,
  ): Promise<User> {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: userInput.email.toLowerCase(),
          name: userInput.name ?? null,
          passwordHash: null,
        },
      });

      await tx.oAuthAccount.create({
        data: {
          userId: user.id,
          provider: oauthInput.provider,
          providerUserId: oauthInput.providerUserId,
        },
      });

      return user;
    });
  }
}
