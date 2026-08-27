import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearSessionExpired,
  consumeSessionExpired,
  hasSessionHint,
  markSessionExpired,
  setSessionHint,
} from '@/lib/auth/session-hint';

describe('session-hint', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  it('uses sessionStorage for non-persistent sessions', () => {
    setSessionHint(true, false);

    expect(window.sessionStorage.getItem('juspeace_admin_has_session')).toBe(
      '1',
    );
    expect(
      window.localStorage.getItem('juspeace_admin_persistent_session'),
    ).toBeNull();
    expect(hasSessionHint()).toBe(true);
  });

  it('uses localStorage for persistent remember-me sessions', () => {
    setSessionHint(true, true);

    expect(
      window.localStorage.getItem('juspeace_admin_persistent_session'),
    ).toBe('1');
    expect(window.sessionStorage.getItem('juspeace_admin_has_session')).toBeNull();
    expect(hasSessionHint()).toBe(true);
  });

  it('clears both storage locations on logout', () => {
    setSessionHint(true, true);
    setSessionHint(false);

    expect(hasSessionHint()).toBe(false);
    expect(window.sessionStorage.length).toBe(0);
    expect(window.localStorage.length).toBe(0);
  });

  it('tracks session expiry as a one-time flag', () => {
    markSessionExpired();

    expect(consumeSessionExpired()).toBe(true);
    expect(consumeSessionExpired()).toBe(false);
  });

  it('clears session expiry flag when clearing session hint on logout', () => {
    markSessionExpired();
    setSessionHint(false);
    clearSessionExpired();

    expect(consumeSessionExpired()).toBe(false);
  });
});
