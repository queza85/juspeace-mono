import { beforeEach, describe, expect, it, vi } from 'vitest';
import { login } from '@/lib/api/auth';
import { apiRequestEnvelope } from '@/lib/api/client';
import { loginSuccessEnvelope } from '../../fixtures/auth';

vi.mock('@/lib/api/client', () => ({
  apiRequestEnvelope: vi.fn(),
  apiRequest: vi.fn(),
}));

describe('auth api / login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends rememberMe=true in the login request body', async () => {
    vi.mocked(apiRequestEnvelope).mockResolvedValue(loginSuccessEnvelope);

    await login('admin@juspeace.local', 'password123', true);

    expect(apiRequestEnvelope).toHaveBeenCalledWith(
      '/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@juspeace.local',
          password: 'password123',
          rememberMe: true,
        }),
      }),
    );
  });

  it('defaults rememberMe to false in the login request body', async () => {
    vi.mocked(apiRequestEnvelope).mockResolvedValue(loginSuccessEnvelope);

    await login('admin@juspeace.local', 'password123');

    expect(apiRequestEnvelope).toHaveBeenCalledWith(
      '/auth/login',
      expect.objectContaining({
        body: JSON.stringify({
          email: 'admin@juspeace.local',
          password: 'password123',
          rememberMe: false,
        }),
      }),
    );
  });
});
