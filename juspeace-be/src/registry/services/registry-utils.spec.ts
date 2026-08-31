import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CertificateNumberService } from './certificate-number.service';
import { RegistrationTokenService } from './registration-token.service';

describe('CertificateNumberService', () => {
  let service: CertificateNumberService;

  beforeEach(() => {
    service = new CertificateNumberService();
  });

  it('formats certificate numbers with market code prefix', () => {
    const certificateNo = service.format('mx');

    expect(certificateNo).toMatch(/^JPC-MX-[A-Z2-9]{8}$/);
  });
});

describe('RegistrationTokenService', () => {
  let service: RegistrationTokenService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RegistrationTokenService,
        {
          provide: ConfigService,
          useValue: {
            get: (_key: string, defaultValue: number) => defaultValue,
          },
        },
      ],
    }).compile();

    service = moduleRef.get(RegistrationTokenService);
  });

  it('issues hashable one-time tokens', () => {
    const issued = service.issue();

    expect(issued.rawToken.length).toBeGreaterThan(20);
    expect(service.matches(issued.rawToken, issued.tokenHash)).toBe(true);
    expect(service.matches('invalid-token', issued.tokenHash)).toBe(false);
  });
});
