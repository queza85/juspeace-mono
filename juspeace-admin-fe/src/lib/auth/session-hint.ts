const SESSION_HINT_KEY = 'juspeace_admin_has_session';

/** Non-secret flag so we only call /auth/refresh after a real login. */
export function hasSessionHint(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.sessionStorage.getItem(SESSION_HINT_KEY) === '1';
  } catch {
    return false;
  }
}

export function setSessionHint(active: boolean): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (active) {
      window.sessionStorage.setItem(SESSION_HINT_KEY, '1');
    } else {
      window.sessionStorage.removeItem(SESSION_HINT_KEY);
    }
  } catch {
    // Ignore storage failures (private mode quotas, etc.).
  }
}
