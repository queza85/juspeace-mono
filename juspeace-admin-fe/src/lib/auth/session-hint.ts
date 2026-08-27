const SESSION_HINT_KEY = 'juspeace_admin_has_session';
const PERSISTENT_HINT_KEY = 'juspeace_admin_persistent_session';

/** Non-secret flag so we only call /auth/refresh after a real login. */
export function hasSessionHint(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    if (window.sessionStorage.getItem(SESSION_HINT_KEY) === '1') {
      return true;
    }
    return window.localStorage.getItem(PERSISTENT_HINT_KEY) === '1';
  } catch {
    return false;
  }
}

export function setSessionHint(active: boolean, persistent = false): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (!active) {
      window.sessionStorage.removeItem(SESSION_HINT_KEY);
      window.localStorage.removeItem(PERSISTENT_HINT_KEY);
      return;
    }

    if (persistent) {
      window.localStorage.setItem(PERSISTENT_HINT_KEY, '1');
      window.sessionStorage.removeItem(SESSION_HINT_KEY);
      return;
    }

    window.sessionStorage.setItem(SESSION_HINT_KEY, '1');
    window.localStorage.removeItem(PERSISTENT_HINT_KEY);
  } catch {
    // Ignore storage failures (private mode quotas, etc.).
  }
}
