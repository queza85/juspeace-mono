import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

const CERTIFICATE_SUFFIX_LENGTH = 8;
const CERTIFICATE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

@Injectable()
export class CertificateNumberService {
  format(marketCode: string): string {
    const normalizedMarket = marketCode.trim().toUpperCase();
    return `JPC-${normalizedMarket}-${this.generateSuffix()}`;
  }

  private generateSuffix(): string {
    const bytes = randomBytes(CERTIFICATE_SUFFIX_LENGTH);
    let suffix = '';

    for (let index = 0; index < CERTIFICATE_SUFFIX_LENGTH; index += 1) {
      const alphabetIndex = bytes[index] % CERTIFICATE_ALPHABET.length;
      suffix += CERTIFICATE_ALPHABET[alphabetIndex];
    }

    return suffix;
  }
}
