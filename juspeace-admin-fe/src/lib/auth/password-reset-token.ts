const RESET_TOKEN_KEY = 'juspeace_pwd_reset_token';

export function setPasswordResetToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  sessionStorage.setItem(RESET_TOKEN_KEY, token);
}

export function getPasswordResetToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return sessionStorage.getItem(RESET_TOKEN_KEY);
}

export function clearPasswordResetToken(): void {
  if (typeof window === 'undefined') {
    return;
  }
  sessionStorage.removeItem(RESET_TOKEN_KEY);
}
