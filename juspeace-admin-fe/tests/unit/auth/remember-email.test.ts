import { beforeEach, describe, expect, it } from 'vitest';
import {
  getRememberedEmail,
  REMEMBER_EMAIL_KEY,
  setRememberedEmail,
} from '@/lib/auth/remember-email';

describe('remember-email', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns an empty string when no email is stored', () => {
    expect(getRememberedEmail()).toBe('');
  });

  it('stores and reads the remembered email', () => {
    setRememberedEmail('admin@juspeace.local');

    expect(window.localStorage.getItem(REMEMBER_EMAIL_KEY)).toBe(
      'admin@juspeace.local',
    );
    expect(getRememberedEmail()).toBe('admin@juspeace.local');
  });

  it('clears the remembered email when set to null', () => {
    setRememberedEmail('admin@juspeace.local');
    setRememberedEmail(null);

    expect(getRememberedEmail()).toBe('');
  });
});
