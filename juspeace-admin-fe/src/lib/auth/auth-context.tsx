'use client';

import {
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext } from 'react';
import * as authApi from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import type { AuthUser } from '@/lib/api/types';
import {
  AdminAccessDeniedError,
  isAdminUser,
} from '@/lib/auth/admin-access';
import {
  clearSessionExpired,
  hasSessionHint,
  markSessionExpired,
  setSessionHint,
} from '@/lib/auth/session-hint';
import { authKeys } from '@/lib/query/keys';

interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function clearNonAdminSession(accessToken: string): Promise<void> {
  try {
    await authApi.logout(accessToken);
  } catch {
    // Best-effort cleanup.
  }
  setSessionHint(false);
}

async function fetchSession(): Promise<AuthSession | null> {
  const hadSession = hasSessionHint();
  if (!hadSession) {
    return null;
  }

  try {
    const { accessToken } = await authApi.refreshSession();
    const user = await authApi.getMe(accessToken);

    if (!isAdminUser(user.role)) {
      await clearNonAdminSession(accessToken);
      return null;
    }

    return { accessToken, user };
  } catch (error) {
    setSessionHint(false);

    if (error instanceof ApiError && error.status === 401) {
      markSessionExpired();
      return null;
    }

    throw error;
  }
}

function persistAdminSession(
  queryClient: ReturnType<typeof useQueryClient>,
  session: AuthSession,
  persistent = false,
) {
  setSessionHint(true, persistent);
  queryClient.setQueryData<AuthSession>(authKeys.session(), session);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: authKeys.session(),
    queryFn: fetchSession,
    retry: false,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });

  const loginMutation = useMutation({
    mutationFn: ({
      email,
      password,
      rememberMe,
    }: {
      email: string;
      password: string;
      rememberMe: boolean;
    }) => authApi.login(email, password, rememberMe),
  });

  const logoutMutation = useMutation({
    mutationFn: async (accessToken: string | null) => {
      if (!accessToken) {
        return;
      }
      try {
        await authApi.logout(accessToken);
      } catch (error) {
        if (!(error instanceof ApiError && error.status === 401)) {
          // Best-effort logout; still clear local session below.
        }
      }
    },
    onSettled: async () => {
      setSessionHint(false);
      clearSessionExpired();
      queryClient.setQueryData(authKeys.session(), null);
      await queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });

  const login = useCallback(
    async (email: string, password: string, rememberMe = false) => {
      const data = await loginMutation.mutateAsync({
        email,
        password,
        rememberMe,
      });

      if (!isAdminUser(data.user.role)) {
        await clearNonAdminSession(data.accessToken);
        queryClient.setQueryData(authKeys.session(), null);
        throw new AdminAccessDeniedError();
      }

      persistAdminSession(
        queryClient,
        {
          accessToken: data.accessToken,
          user: data.user,
        },
        rememberMe,
      );
    },
    [loginMutation, queryClient],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync(
      sessionQuery.data?.accessToken ?? null,
    );
  }, [logoutMutation, sessionQuery.data?.accessToken]);

  const refresh = useCallback(async () => {
    const hadSession = hasSessionHint();
    try {
      const session = await queryClient.fetchQuery({
        queryKey: authKeys.session(),
        queryFn: fetchSession,
      });
      return Boolean(session);
    } catch {
      setSessionHint(false);
      if (hadSession) {
        markSessionExpired();
      }
      queryClient.setQueryData(authKeys.session(), null);
      return false;
    }
  }, [queryClient]);

  const session = sessionQuery.data ?? null;

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      isLoading: sessionQuery.isPending || loginMutation.isPending,
      isAuthenticated: Boolean(session?.user && session?.accessToken),
      login,
      logout,
      refresh,
    }),
    [
      session,
      sessionQuery.isPending,
      loginMutation.isPending,
      login,
      logout,
      refresh,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export { AdminAccessDeniedError };
