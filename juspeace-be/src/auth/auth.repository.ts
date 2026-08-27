import { Injectable } from '@nestjs/common';
import {
  OAuthAccount,
  OAuthProvider,
  RefreshToken,
  User,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateOAuthAccountInput,
  CreateRefreshTokenInput,
  CreateUserFromOAuthInput,
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
