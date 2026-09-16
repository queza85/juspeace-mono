export const REMEMBER_EMAIL_KEY = 'juspeace_admin_remember_email';

export function getRememberedEmail(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    return window.localStorage.getItem(REMEMBER_EMAIL_KEY) ?? '';
  } catch {
    return '';
  }
}

export function setRememberedEmail(email: string | null): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (email) {
      window.localStorage.setItem(REMEMBER_EMAIL_KEY, email);
      return;
    }
    window.localStorage.removeItem(REMEMBER_EMAIL_KEY);
  } catch {
    // Ignore storage failures.
  }
}
