import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes, randomInt, timingSafeEqual } from 'crypto';
import { MailService } from '../mail/mail.service';
import { AUTH_REPOSITORY } from './auth.repository.interface';
import type { IAuthRepository } from './auth.repository.interface';
import type { User } from '@prisma/client';

const BCRYPT_ROUNDS = 12;
const MAX_VERIFY_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60_000;
const RESET_TOKEN_BYTES = 32;

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);
  private readonly codeTtlMs: number;
  private readonly tokenTtlMs: number;

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {
    this.codeTtlMs =
      this.configService.getOrThrow<number>('passwordReset.codeTtlMinutes') *
      60 *
      1000;
    this.tokenTtlMs =
      this.configService.getOrThrow<number>('passwordReset.tokenTtlMinutes') *
      60 *
      1000;
  }

  async requestReset(email: string): Promise<void> {
    const user = await this.requirePasswordAccount(email);
    await this.issueAndSendCode(user.id, user.email);
  }

  async resendCode(email: string): Promise<void> {
    const user = await this.requirePasswordAccount(email);

    const latest = await this.authRepository.findLatestActivePasswordResetCode(
      user.id,
    );

    if (
      latest &&
      Date.now() - latest.createdAt.getTime() < RESEND_COOLDOWN_MS
    ) {
      return;
    }

    await this.issueAndSendCode(user.id, user.email);
  }

  async verifyCode(
    email: string,
    code: string,
  ): Promise<{ resetToken: string }> {
    const user = await this.requirePasswordAccount(email);

    const activeCode =
      await this.authRepository.findLatestActivePasswordResetCode(user.id);

    if (!activeCode) {
      throw new UnauthorizedException('RESET_CODE_EXPIRED');
    }

    if (activeCode.expiresAt.getTime() <= Date.now()) {
      await this.authRepository.consumePasswordResetCode(activeCode.id);
      throw new UnauthorizedException('RESET_CODE_EXPIRED');
    }

    if (activeCode.attemptCount >= MAX_VERIFY_ATTEMPTS) {
      await this.authRepository.consumePasswordResetCode(activeCode.id);
      throw new UnauthorizedException('RESET_CODE_EXPIRED');
    }

    const codeHash = this.hashValue(code);
    const matches = this.hashesEqual(codeHash, activeCode.codeHash);

    if (!matches) {
      const updated =
        await this.authRepository.incrementPasswordResetCodeAttempts(
          activeCode.id,
        );
      if (updated.attemptCount >= MAX_VERIFY_ATTEMPTS) {
        await this.authRepository.consumePasswordResetCode(activeCode.id);
        throw new UnauthorizedException('RESET_CODE_EXPIRED');
      }
      throw new UnauthorizedException('INVALID_RESET_CODE');
    }

    await this.authRepository.consumePasswordResetCode(activeCode.id);
    await this.authRepository.invalidateActivePasswordResetSessions(user.id);

    const rawToken = randomBytes(RESET_TOKEN_BYTES).toString('base64url');
    await this.authRepository.createPasswordResetSession({
      userId: user.id,
      tokenHash: this.hashValue(rawToken),
      expiresAt: new Date(Date.now() + this.tokenTtlMs),
    });

    return { resetToken: rawToken };
  }

  async resetPassword(resetToken: string, password: string): Promise<void> {
    const tokenHash = this.hashValue(resetToken);
    const session =
      await this.authRepository.findPasswordResetSessionByHash(tokenHash);

    if (!session || session.consumedAt) {
      throw new UnauthorizedException('INVALID_RESET_TOKEN');
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      await this.authRepository.consumePasswordResetSession(session.id);
      throw new UnauthorizedException('RESET_TOKEN_EXPIRED');
    }

    if (!session.user.isActive) {
      throw new UnauthorizedException('INVALID_RESET_TOKEN');
    }

    if (session.user.passwordHash) {
      const isSamePassword = await bcrypt.compare(
        password,
        session.user.passwordHash,
      );
      if (isSamePassword) {
        throw new BadRequestException('PASSWORD_REUSE_NOT_ALLOWED');
      }
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await this.authRepository.updateUserPassword(session.userId, passwordHash);
    await this.authRepository.consumePasswordResetSession(session.id);
    await this.authRepository.invalidateActivePasswordResetCodes(
      session.userId,
    );
    await this.authRepository.invalidateActivePasswordResetSessions(
      session.userId,
    );
    await this.authRepository.revokeAllUserRefreshTokens(session.userId);

    this.logger.log(`Password reset completed for user ${session.userId}`);
  }

  private async requirePasswordAccount(email: string): Promise<User> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.authRepository.findUserByEmail(normalizedEmail);

    if (!user) {
      throw new NotFoundException('EMAIL_NOT_FOUND');
    }

    if (!user.isActive) {
      throw new BadRequestException('ACCOUNT_INACTIVE');
    }

    if (!user.passwordHash) {
      throw new BadRequestException('PASSWORD_RESET_UNAVAILABLE');
    }

    return user;
  }

  private async issueAndSendCode(userId: string, email: string): Promise<void> {
    await this.authRepository.invalidateActivePasswordResetCodes(userId);

    const code = String(randomInt(100_000, 1_000_000));
    const codeTtlMinutes = Math.round(this.codeTtlMs / 60_000);

    await this.authRepository.createPasswordResetCode({
      userId,
      codeHash: this.hashValue(code),
      expiresAt: new Date(Date.now() + this.codeTtlMs),
    });

    await this.mailService.sendPasswordResetOtp(email, code, codeTtlMinutes);
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
