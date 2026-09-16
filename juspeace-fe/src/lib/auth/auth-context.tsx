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
  hasSessionHint,
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
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchSession(): Promise<AuthSession | null> {
  // Avoid calling /auth/refresh when the user has never logged in this tab.
  if (!hasSessionHint()) {
    return null;
  }

  try {
    const { accessToken } = await authApi.refreshSession();
    const user = await authApi.getMe(accessToken);
    return { accessToken, user };
  } catch (error) {
    setSessionHint(false);

    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    throw error;
  }
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
    }: {
      email: string;
      password: string;
    }) => authApi.login(email, password),
    onSuccess: (data) => {
      setSessionHint(true);
      queryClient.setQueryData<AuthSession>(authKeys.session(), {
        accessToken: data.accessToken,
        user: data.user,
      });
    },
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
      queryClient.setQueryData(authKeys.session(), null);
      await queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });

  const login = useCallback(
    async (email: string, password: string) => {
      await loginMutation.mutateAsync({ email, password });
    },
    [loginMutation],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync(
      sessionQuery.data?.accessToken ?? null,
    );
  }, [logoutMutation, sessionQuery.data?.accessToken]);

  const refresh = useCallback(async () => {
    try {
      const session = await queryClient.fetchQuery({
        queryKey: authKeys.session(),
        queryFn: fetchSession,
      });
      return Boolean(session);
    } catch {
      setSessionHint(false);
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
