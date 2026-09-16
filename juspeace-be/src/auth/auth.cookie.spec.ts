import type { Response } from 'express';
import { clearRefreshCookie, setRefreshCookie } from './auth.cookie';

describe('auth.cookie', () => {
  const options = {
    cookieName: 'juspeace_refresh',
    cookieSecure: false,
  };

  let cookie: jest.Mock;
  let clearCookie: jest.Mock;
  let res: Response;

  beforeEach(() => {
    cookie = jest.fn();
    clearCookie = jest.fn();
    res = {
      cookie,
      clearCookie,
    } as unknown as Response;
  });

  it('sets a persistent refresh cookie when maxAgeMs is provided', () => {
    const maxAgeMs = 5 * 24 * 60 * 60 * 1000;

    setRefreshCookie(res, 'refresh-token', maxAgeMs, options);

    expect(cookie).toHaveBeenCalledWith(
      options.cookieName,
      'refresh-token',
      expect.objectContaining({
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/api/v1/auth',
        maxAge: maxAgeMs,
      }),
    );
  });

  it('sets a session refresh cookie when maxAgeMs is null', () => {
    setRefreshCookie(res, 'refresh-token', null, options);

    const [, , cookieOptions] = cookie.mock.calls[0] as [
      string,
      string,
      Record<string, unknown>,
    ];
    expect(cookieOptions).toMatchObject({
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/api/v1/auth',
    });
    expect(cookieOptions).not.toHaveProperty('maxAge');
  });

  it('clears the refresh cookie on logout', () => {
    clearRefreshCookie(res, options);

    expect(clearCookie).toHaveBeenCalledWith(
      options.cookieName,
      expect.objectContaining({
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/api/v1/auth',
      }),
    );
  });
});
