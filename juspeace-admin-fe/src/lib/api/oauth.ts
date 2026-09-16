import { getApiBaseUrl } from './client';

function frontendOrigin(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:3001';
}

/** Start Google OAuth with admin frontend redirect URLs. */
export function buildGoogleOAuthUrl(returnUrl?: string): string {
  const origin = frontendOrigin();
  const params = new URLSearchParams({
    successRedirect: `${origin}/auth/callback`,
    failureRedirect: `${origin}/login?error=oauth`,
  });

  if (returnUrl) {
    params.set('returnUrl', returnUrl);
  }

  return `${getApiBaseUrl()}/auth/google?${params.toString()}`;
}
