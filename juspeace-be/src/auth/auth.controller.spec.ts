import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordResetService } from './password-reset.service';
import { TwoFactorService } from './two-factor.service';
import * as authCookie from './auth.cookie';
import { UserRole } from './auth.repository.interface';

jest.mock('./auth.cookie', () => ({
  setRefreshCookie: jest.fn(),
  clearRefreshCookie: jest.fn(),
}));

describe('AuthController remember me', () => {
  let controller: AuthController;
  let authService: {
    login: jest.Mock;
    toAuthTokensResponse: jest.Mock;
  };

  const res = {} as Response;
  const req = {
    headers: { 'user-agent': 'vitest' },
    ip: '127.0.0.1',
  } as Request;

  beforeEach(async () => {
    jest.clearAllMocks();

    authService = {
      login: jest.fn(),
      toAuthTokensResponse: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
        {
          provide: PasswordResetService,
          useValue: {
            requestReset: jest.fn(),
            resendCode: jest.fn(),
            verifyCode: jest.fn(),
            resetPassword: jest.fn(),
          },
        },
        {
          provide: TwoFactorService,
          useValue: {
            createDevChallenge: jest.fn(),
            resendCode: jest.fn(),
            verifyCode: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              if (key === 'auth.cookieName') {
                return 'juspeace_refresh';
              }
              if (key === 'auth.cookieSecure') {
                return false;
              }
              throw new Error(`Unexpected config key: ${key}`);
            }),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get(AuthController);
  });

  it('passes rememberMe to AuthService.login and sets a persistent cookie', async () => {
    const rememberMaxAgeMs = 5 * 24 * 60 * 60 * 1000;
    const session = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      refreshMaxAgeMs: rememberMaxAgeMs,
      user: {
        id: 'admin-1',
        email: 'admin@juspeace.local',
        role: UserRole.ADMIN,
      },
    };

    authService.login.mockResolvedValue(session);
    authService.toAuthTokensResponse.mockReturnValue({
      accessToken: session.accessToken,
      user: session.user,
    });

    await controller.login(
      {
        email: 'admin@juspeace.local',
        password: 'password123',
        rememberMe: true,
      },
      req,
      res,
    );

    expect(authService.login).toHaveBeenCalledWith(
      'admin@juspeace.local',
      'password123',
      {
        userAgent: 'vitest',
        ipAddress: '127.0.0.1',
      },
      { rememberMe: true },
    );
    expect(authCookie.setRefreshCookie).toHaveBeenCalledWith(
      res,
      'refresh-token',
      rememberMaxAgeMs,
      {
        cookieName: 'juspeace_refresh',
        cookieSecure: false,
      },
    );
  });

  it('defaults rememberMe to false and sets a session cookie', async () => {
    const session = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      refreshMaxAgeMs: null,
      user: {
        id: 'admin-1',
        email: 'admin@juspeace.local',
        role: UserRole.ADMIN,
      },
    };

    authService.login.mockResolvedValue(session);
    authService.toAuthTokensResponse.mockReturnValue({
      accessToken: session.accessToken,
      user: session.user,
    });

    await controller.login(
      {
        email: 'admin@juspeace.local',
        password: 'password123',
      },
      req,
      res,
    );

    expect(authService.login).toHaveBeenCalledWith(
      'admin@juspeace.local',
      'password123',
      {
        userAgent: 'vitest',
        ipAddress: '127.0.0.1',
      },
      { rememberMe: false },
    );
    expect(authCookie.setRefreshCookie).toHaveBeenCalledWith(
      res,
      'refresh-token',
      null,
      {
        cookieName: 'juspeace_refresh',
        cookieSecure: false,
      },
    );
  });
});
