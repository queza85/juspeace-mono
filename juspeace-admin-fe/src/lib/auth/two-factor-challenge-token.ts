const CHALLENGE_TOKEN_KEY = 'juspeace_two_factor_challenge';

export function setTwoFactorChallengeToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  sessionStorage.setItem(CHALLENGE_TOKEN_KEY, token);
}

export function getTwoFactorChallengeToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return sessionStorage.getItem(CHALLENGE_TOKEN_KEY);
}

export function clearTwoFactorChallengeToken(): void {
  if (typeof window === 'undefined') {
    return;
  }
  sessionStorage.removeItem(CHALLENGE_TOKEN_KEY);
}
