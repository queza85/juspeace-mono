import { RefreshToken, User, UserRole } from '@prisma/client';

export type AuthUser = Omit<User, 'passwordHash'>;

export interface CreateRefreshTokenInput {
  userId: string;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  createRefreshToken(input: CreateRefreshTokenInput): Promise<RefreshToken>;
  findRefreshTokenByHash(tokenHash: string): Promise<
    | (RefreshToken & {
        user: User;
      })
    | null
  >;
  revokeRefreshToken(id: string, revokedAt?: Date): Promise<void>;
  revokeRefreshTokenFamily(familyId: string, revokedAt?: Date): Promise<number>;
  revokeAllUserRefreshTokens(userId: string, revokedAt?: Date): Promise<number>;
}

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

export { UserRole };
