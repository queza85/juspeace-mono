import { toast } from '@/components/ui/toast';
import { humanizeApiMessage } from '@/lib/api/format-message';
import {
  markSessionExpired,
  setSessionHint,
} from '@/lib/auth/session-hint';
import type { ApiEnvelope, ApiErrorBody } from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:7777/api/v1';

/** IANA timezone header sent on every browser → API request. */
export const TIMEZONE_HEADER = 'X-Timezone';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: ApiErrorBody,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
  accessToken?: string;
  /** When true, send cookies (needed for refresh-token auth). */
  withCredentials?: boolean;
  /** Skip Next.js fetch cache (auth and mutations). */
  noStore?: boolean;
  /**
   * Show a top-right toast from the API `message` code (browser only).
   * - `true` / `'both'`: toast success and error
   * - `'success'`: only success
   * - `'error'`: only error
   */
  notify?: boolean | 'success' | 'error' | 'both';
}

function shouldNotifySuccess(notify?: RequestOptions['notify']) {
  return notify === true || notify === 'both' || notify === 'success';
}

function shouldNotifyError(notify?: RequestOptions['notify']) {
  return notify === true || notify === 'both' || notify === 'error';
}

function notifyBrowser(messageCode: string, variant: 'success' | 'error') {
  if (typeof window === 'undefined') {
    return;
  }
  toast(humanizeApiMessage(messageCode), variant);
}

function redirectToSessionExpired() {
  if (typeof window === 'undefined') {
    return;
  }

  const path = window.location.pathname;
  if (path === '/session-expired' || path.startsWith('/login')) {
    return;
  }

  setSessionHint(false);
  markSessionExpired();
  const returnUrl = encodeURIComponent(`${path}${window.location.search}`);
  // Full navigation from fetch layer; no router available here.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- session expiry must hard-reset client state
  window.location.assign(`/session-expired?returnUrl=${returnUrl}`);
}

function buildUrl(path: string, params?: RequestOptions['params']) {
  const url = new URL(`${API_BASE_URL}${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

/** Browser IANA zone (e.g. Asia/Yangon, Asia/Seoul). Undefined on the server. */
export function getBrowserTimeZone(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

function toHeaderRecord(headers?: HeadersInit): Record<string, string> {
  if (!headers) {
    return {};
  }

  if (headers instanceof Headers) {
    const record: Record<string, string> = {};
    headers.forEach((value, key) => {
      record[key] = value;
    });
    return record;
  }

  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }

  return { ...headers };
}

function isApiEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    'message' in value &&
    'data' in value
  );
}

/** Full envelope (message code + data). Prefer this when you need the API message. */
export async function apiRequestEnvelope<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiEnvelope<T>> {
  const {
    params,
    headers,
    accessToken,
    withCredentials,
    noStore,
    notify,
    ...init
  } = options;

  const requestHeaders = toHeaderRecord(headers);
  requestHeaders.Accept = requestHeaders.Accept ?? 'application/json';

  const timeZone = getBrowserTimeZone();
  if (timeZone) {
    requestHeaders[TIMEZONE_HEADER] = timeZone;
  }

  if (accessToken) {
    requestHeaders.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(buildUrl(path, params), {
    ...init,
    headers: requestHeaders,
    credentials: withCredentials ? 'include' : init.credentials,
    cache: noStore ? 'no-store' : init.cache,
    next: noStore ? undefined : (init.next ?? { revalidate: 60 }),
  });

  let payload: unknown;

  try {
    payload = response.status === 204 ? null : await response.json();
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    const body = isApiEnvelope(payload)
      ? (payload as ApiErrorBody)
      : undefined;
    const messageCode =
      body?.message ?? `REQUEST_FAILED_${response.status}`;

    if (response.status === 401 && accessToken) {
      redirectToSessionExpired();
    }

    if (shouldNotifyError(notify)) {
      notifyBrowser(messageCode, 'error');
    }

    throw new ApiError(messageCode, response.status, body);
  }

  if (isApiEnvelope(payload)) {
    if (!payload.success) {
      if (shouldNotifyError(notify)) {
        notifyBrowser(payload.message, 'error');
      }
      throw new ApiError(
        payload.message,
        response.status,
        payload as ApiErrorBody,
      );
    }

    if (shouldNotifySuccess(notify)) {
      notifyBrowser(payload.message, 'success');
    }

    return payload as ApiEnvelope<T>;
  }

  const fallback: ApiEnvelope<T> = {
    success: true,
    message: 'RETRIEVE_SUCCESSFULLY',
    data: payload as T,
  };

  if (shouldNotifySuccess(notify)) {
    notifyBrowser(fallback.message, 'success');
  }

  return fallback;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const envelope = await apiRequestEnvelope<T>(path, options);
  return envelope.data;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}
