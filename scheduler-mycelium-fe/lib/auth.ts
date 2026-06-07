import type { AuthResponse, Role } from '@/types/api';

const STORAGE_KEY = 'scheduler-token';

export function getStoredAuth(): AuthResponse | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    return null;
  }
}

export function setToken(auth: AuthResponse): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getToken(): string | null {
  return getStoredAuth()?.token ?? null;
}

export function getRole(): Role | null {
  return getStoredAuth()?.role ?? null;
}

/**
 * Returns accountId from the stored AuthResponse.
 * The JWT sub is email — publicId is not in the JWT payload.
 * We use accountId as the account identifier client-side.
 */
export function getAccountId(): number | null {
  return getStoredAuth()?.accountId ?? null;
}

export function getSlug(): string | null {
  return getStoredAuth()?.slug ?? null;
}

export function getEmail(): string | null {
  return getStoredAuth()?.email ?? null;
}

export function isAuthenticated(): boolean {
  const auth = getStoredAuth();
  if (!auth?.token) return false;
  try {
    // Decode JWT payload to check expiry
    const payload = JSON.parse(atob(auth.token.split('.')[1])) as { exp: number };
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
