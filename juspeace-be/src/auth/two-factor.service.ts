import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes, randomInt, timingSafeEqual } from 'crypto';
import { MailService } from '../mail/mail.service';
import { AUTH_REPOSITORY } from './auth.repository.interface';
import type { IAuthRepository } from './auth.repository.interface';
import {
  AuthService,
  type IssuedSession,
  type SessionMeta,
} from './auth.service';

const MAX_VERIFY_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60_000;
const CHALLENGE_TOKEN_BYTES = 32;

export interface CreateTwoFactorChallengeOptions {
  rememberMe?: boolean;
  meta?: SessionMeta;
}

@Injectable()
export class TwoFactorService {
  private readonly logger = new Logger(TwoFactorService.name);
  private readonly codeTtlMs: number;
  private readonly challengeTtlMs: number;
  private readonly devChallengeEnabled: boolean;

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {
    this.codeTtlMs =
      this.configService.getOrThrow<number>('twoFactor.codeTtlMinutes') *
      60 *
      1000;
    this.challengeTtlMs =
      this.configService.getOrThrow<number>('twoFactor.challengeTtlMinutes') *
      60 *
      1000;
    this.devChallengeEnabled = this.configService.getOrThrow<boolean>(
      'twoFactor.devChallengeEnabled',
    );
  }

  async createChallenge(
    userId: string,
    options: CreateTwoFactorChallengeOptions = {},
  ): Promise<{ challengeToken: string }> {
    const user = await this.authRepository.findUserById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('INVALID_TWO_FACTOR_CHALLENGE');
    }

    await this.authRepository.invalidateActiveTwoFactorChallenges(userId);
    await this.authRepository.invalidateActiveTwoFactorCodes(userId);

    const challengeToken = randomBytes(CHALLENGE_TOKEN_BYTES).toString(
      'base64url',
    );
    const rememberMe = options.rememberMe ?? false;
    const meta = options.meta ?? {};

    await this.authRepository.createTwoFactorChallenge({
      userId,
      tokenHash: this.hashValue(challengeToken),
      rememberMe,
      expiresAt: new Date(Date.now() + this.challengeTtlMs),
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
    });

    await this.issueAndSendCode(userId, user.email);

    return { challengeToken };
  }

  async createDevChallenge(email: string): Promise<{ challengeToken: string }> {
    if (!this.devChallengeEnabled) {
      throw new NotFoundException('NOT_FOUND');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.authRepository.findUserByEmail(normalizedEmail);

    if (!user || !user.isActive) {
      throw new NotFoundException('EMAIL_NOT_FOUND');
    }

    return this.createChallenge(user.id, { rememberMe: false });
  }

  async resendCode(challengeToken: string): Promise<void> {
    const challenge = await this.requireActiveChallenge(challengeToken);

    const latest = await this.authRepository.findLatestActiveTwoFactorCode(
      challenge.userId,
    );

    if (
      latest &&
      Date.now() - latest.createdAt.getTime() < RESEND_COOLDOWN_MS
    ) {
      return;
    }

    await this.issueAndSendCode(challenge.userId, challenge.user.email);
  }

  async verifyCode(
    challengeToken: string,
    code: string,
    meta: SessionMeta = {},
  ): Promise<IssuedSession> {
    const challenge = await this.requireActiveChallenge(challengeToken);

    const activeCode = await this.authRepository.findLatestActiveTwoFactorCode(
      challenge.userId,
    );

    if (!activeCode) {
      throw new UnauthorizedException('TWO_FACTOR_CODE_EXPIRED');
    }

    if (activeCode.expiresAt.getTime() <= Date.now()) {
      await this.authRepository.consumeTwoFactorCode(activeCode.id);
      throw new UnauthorizedException('TWO_FACTOR_CODE_EXPIRED');
    }

    if (activeCode.attemptCount >= MAX_VERIFY_ATTEMPTS) {
      await this.authRepository.consumeTwoFactorCode(activeCode.id);
      throw new UnauthorizedException('TWO_FACTOR_CODE_EXPIRED');
    }

    const codeHash = this.hashValue(code);
    const matches = this.hashesEqual(codeHash, activeCode.codeHash);

    if (!matches) {
      const updated = await this.authRepository.incrementTwoFactorCodeAttempts(
        activeCode.id,
      );
      if (updated.attemptCount >= MAX_VERIFY_ATTEMPTS) {
        await this.authRepository.consumeTwoFactorCode(activeCode.id);
        throw new UnauthorizedException('TWO_FACTOR_CODE_EXPIRED');
      }
      throw new UnauthorizedException('INVALID_TWO_FACTOR_CODE');
    }

    await this.authRepository.consumeTwoFactorCode(activeCode.id);
    await this.authRepository.consumeTwoFactorChallenge(challenge.id);
    await this.authRepository.invalidateActiveTwoFactorCodes(challenge.userId);
    await this.authRepository.invalidateActiveTwoFactorChallenges(
      challenge.userId,
    );

    const sessionMeta: SessionMeta = {
      userAgent: meta.userAgent ?? challenge.userAgent ?? undefined,
      ipAddress: meta.ipAddress ?? challenge.ipAddress ?? undefined,
    };

    const session = await this.authService.issueSession(
      challenge.user,
      sessionMeta,
      randomBytes(16).toString('hex'),
      { rememberMe: challenge.rememberMe },
    );

    this.logger.log(`Two-factor verified for user ${challenge.userId}`);
    return session;
  }

  private async requireActiveChallenge(challengeToken: string) {
    const tokenHash = this.hashValue(challengeToken);
    const challenge =
      await this.authRepository.findTwoFactorChallengeByHash(tokenHash);

    if (!challenge || challenge.consumedAt) {
      throw new UnauthorizedException('INVALID_TWO_FACTOR_CHALLENGE');
    }

    if (challenge.expiresAt.getTime() <= Date.now()) {
      await this.authRepository.consumeTwoFactorChallenge(challenge.id);
      throw new UnauthorizedException('INVALID_TWO_FACTOR_CHALLENGE');
    }

    if (!challenge.user.isActive) {
      throw new UnauthorizedException('INVALID_TWO_FACTOR_CHALLENGE');
    }

    return challenge;
  }

  private async issueAndSendCode(userId: string, email: string): Promise<void> {
    await this.authRepository.invalidateActiveTwoFactorCodes(userId);

    const code = String(randomInt(100_000, 1_000_000));
    const codeTtlMinutes = Math.round(this.codeTtlMs / 60_000);

    await this.authRepository.createTwoFactorCode({
      userId,
      codeHash: this.hashValue(code),
      expiresAt: new Date(Date.now() + this.codeTtlMs),
    });

    await this.mailService.sendTwoFactorOtp(email, code, codeTtlMinutes);
  }

  private hashValue(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  private hashesEqual(a: string, b: string): boolean {
    const left = Buffer.from(a);
    const right = Buffer.from(b);
    if (left.length !== right.length) {
      return false;
    }
    return timingSafeEqual(left, right);
  }
}
