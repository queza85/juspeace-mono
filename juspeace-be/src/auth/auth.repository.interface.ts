import {
  OAuthAccount,
  OAuthProvider,
  PasswordResetCode,
  PasswordResetSession,
  RefreshToken,
  TwoFactorChallenge,
  TwoFactorCode,
  User,
  UserRole,
} from '@prisma/client';

export type AuthUser = Omit<User, 'passwordHash'>;

export interface CreateRefreshTokenInput {
  userId: string;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

export interface CreateUserFromOAuthInput {
  email: string;
  name?: string | null;
}

export interface CreateUserWithPasswordInput {
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
}

export interface CreateOAuthAccountInput {
  userId: string;
  provider: OAuthProvider;
  providerUserId: string;
}

export interface CreatePasswordResetCodeInput {
  userId: string;
  codeHash: string;
  expiresAt: Date;
}

export interface CreatePasswordResetSessionInput {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface CreateTwoFactorChallengeInput {
  userId: string;
  tokenHash: string;
  rememberMe: boolean;
  expiresAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

export interface CreateTwoFactorCodeInput {
  userId: string;
  codeHash: string;
  expiresAt: Date;
}

export type OAuthAccountWithUser = OAuthAccount & { user: User };

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
  findOAuthAccount(
    provider: OAuthProvider,
    providerUserId: string,
  ): Promise<OAuthAccountWithUser | null>;
  createUserFromOAuth(input: CreateUserFromOAuthInput): Promise<User>;
  createOAuthAccount(input: CreateOAuthAccountInput): Promise<OAuthAccount>;
  createUserWithOAuthAccount(
    userInput: CreateUserFromOAuthInput,
    oauthInput: Omit<CreateOAuthAccountInput, 'userId'>,
  ): Promise<User>;
  createUserWithPassword(input: CreateUserWithPasswordInput): Promise<User>;
  updateUserPassword(userId: string, passwordHash: string): Promise<User>;
  invalidateActivePasswordResetCodes(userId: string): Promise<number>;
  createPasswordResetCode(
    input: CreatePasswordResetCodeInput,
  ): Promise<PasswordResetCode>;
  findLatestActivePasswordResetCode(
    userId: string,
  ): Promise<PasswordResetCode | null>;
  incrementPasswordResetCodeAttempts(id: string): Promise<PasswordResetCode>;
  consumePasswordResetCode(id: string): Promise<void>;
  createPasswordResetSession(
    input: CreatePasswordResetSessionInput,
  ): Promise<PasswordResetSession>;
  findPasswordResetSessionByHash(
    tokenHash: string,
  ): Promise<(PasswordResetSession & { user: User }) | null>;
  consumePasswordResetSession(id: string): Promise<void>;
  invalidateActivePasswordResetSessions(userId: string): Promise<number>;
  invalidateActiveTwoFactorChallenges(userId: string): Promise<number>;
  createTwoFactorChallenge(
    input: CreateTwoFactorChallengeInput,
  ): Promise<TwoFactorChallenge>;
  findTwoFactorChallengeByHash(
    tokenHash: string,
  ): Promise<(TwoFactorChallenge & { user: User }) | null>;
  consumeTwoFactorChallenge(id: string): Promise<void>;
  invalidateActiveTwoFactorCodes(userId: string): Promise<number>;
  createTwoFactorCode(input: CreateTwoFactorCodeInput): Promise<TwoFactorCode>;
  findLatestActiveTwoFactorCode(userId: string): Promise<TwoFactorCode | null>;
  incrementTwoFactorCodeAttempts(id: string): Promise<TwoFactorCode>;
  consumeTwoFactorCode(id: string): Promise<void>;
}

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

export { UserRole, OAuthProvider };
