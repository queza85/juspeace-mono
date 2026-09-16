import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';

const REGISTRATION_TOKEN_BYTES = 32;

@Injectable()
export class RegistrationTokenService {
  private readonly tokenTtlMs: number;

  constructor(private readonly configService: ConfigService) {
    const ttlDays = this.configService.get<number>(
      'registry.registrationTokenTtlDays',
      30,
    );
    this.tokenTtlMs = ttlDays * 24 * 60 * 60 * 1000;
  }

  issue(): { rawToken: string; tokenHash: string; expiresAt: Date } {
    const rawToken = randomBytes(REGISTRATION_TOKEN_BYTES).toString(
      'base64url',
    );
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + this.tokenTtlMs);

    return { rawToken, tokenHash, expiresAt };
  }

  hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  matches(rawToken: string, tokenHash: string): boolean {
    const computed = Buffer.from(this.hashToken(rawToken));
    const stored = Buffer.from(tokenHash);

    if (computed.length !== stored.length) {
      return false;
    }

    return timingSafeEqual(computed, stored);
  }
}
