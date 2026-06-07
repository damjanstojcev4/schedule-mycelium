'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { clearToken, getStoredAuth, setToken } from '@/lib/auth';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types/api';

// ─── External auth store ──────────────────────────────────────────────────────
// useSyncExternalStore is the React 18 idiomatic solution for reading
// localStorage in a way that is SSR-safe and avoids hydration mismatches.
// The server snapshot always returns null (no localStorage on the server),
// and React reconciles correctly without throwing a hydration error.

type Listener = () => void;
let listeners: Listener[] = [];

function subscribeAuth(callback: Listener): () => void {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

function notifyAuth(): void {
  for (const l of listeners) l();
}

let cachedRaw: string | null = null;
let cachedAuth: AuthResponse | null = null;

function getAuthSnapshot(): AuthResponse | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('scheduler-token');
  if (raw === cachedRaw) {
    return cachedAuth;
  }
  cachedRaw = raw;
  cachedAuth = getStoredAuth();
  return cachedAuth;
}

function getAuthServerSnapshot(): null {
  return null;
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AuthContextValue {
  auth: AuthResponse | null;
  /** Always false — kept for API compatibility, auth is synchronous now */
  loading: boolean;
  login: (body: LoginRequest) => Promise<AuthResponse>;
  register: (body: RegisterRequest) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // SSR returns null → client returns real auth from localStorage.
  // No hydration mismatch because React uses getAuthServerSnapshot on the server.
  const auth = useSyncExternalStore(
    subscribeAuth,
    getAuthSnapshot,
    getAuthServerSnapshot,
  );

  const login = useCallback(async (body: LoginRequest): Promise<AuthResponse> => {
    const response = await api.login(body);
    setToken(response);
    notifyAuth();           // triggers re-render via useSyncExternalStore
    return response;
  }, []);

  const register = useCallback(async (body: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.register(body);
    setToken(response);
    notifyAuth();
    return response;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    notifyAuth();
    router.push('/login');
  }, [router]);

  const value = useMemo(
    () => ({ auth, loading: false, login, register, logout }),
    [auth, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
