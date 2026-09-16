import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as authApi from '@/lib/api/auth';
import { useAuth } from '@/lib/auth/auth-context';
import { setSessionHint } from '@/lib/auth/session-hint';
import { adminUser } from '../../fixtures/auth';
import { createAuthProviderWrapper } from '../../helpers/auth-provider-wrapper';

vi.mock('@/lib/api/auth');
vi.mock('@/lib/auth/session-hint', () => ({
  hasSessionHint: vi.fn(() => false),
  setSessionHint: vi.fn(),
}));

describe('auth context / remember me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('persists a remember-me session hint after admin login', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: 'access-token',
      user: adminUser,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createAuthProviderWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await result.current.login('admin@juspeace.local', 'password123', true);

    expect(authApi.login).toHaveBeenCalledWith(
      'admin@juspeace.local',
      'password123',
      true,
    );
    expect(setSessionHint).toHaveBeenCalledWith(true, true);
  });

  it('uses a session-only hint when remember me is disabled', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: 'access-token',
      user: adminUser,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: createAuthProviderWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await result.current.login('admin@juspeace.local', 'password123');

    expect(authApi.login).toHaveBeenCalledWith(
      'admin@juspeace.local',
      'password123',
      false,
    );
    expect(setSessionHint).toHaveBeenCalledWith(true, false);
  });
});
