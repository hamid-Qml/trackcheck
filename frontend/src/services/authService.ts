// src/services/authService.ts
import { api, STORAGE, setToken, clearAuth } from './api';

// Backend returns { access_token: string }
type TokenResponse = { access_token: string };

// Minimal User shape (adjust as your entity grows)
export type User = {
  id: string;
  email: string;
  full_name?: string | null;
  // add other safe fields from /auth/me here as needed
};

function saveUser(u: User | null) {
  if (!u) return localStorage.removeItem(STORAGE.USER);
  localStorage.setItem(STORAGE.USER, JSON.stringify(u));
}
export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE.USER);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export const authService = {
  // ------------------------
  // Auth flows
  // ------------------------

  async signup(payload: { email: string; password: string; full_name?: string }) {
    const res = await api<TokenResponse>('/auth/signup', {
      method: 'POST',
      body: payload,
    });
    setToken(res.access_token);
    const me = await this.me().catch((e) => {
      // if anything goes wrong fetching profile, still keep token
      console.warn('Failed to fetch /auth/me after signup:', e);
      return null;
    });
    if (me) saveUser(me);
    return { token: res.access_token, user: me };
  },

  async login(email: string, password: string) {
    const res = await api<TokenResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    setToken(res.access_token);
    const me = await this.me().catch((e) => {
      console.warn('Failed to fetch /auth/me after login:', e);
      return null;
    });
    if (me) saveUser(me);
    return { token: res.access_token, user: me };
  },

  logout() {
    clearAuth();
  },

  // Requires Bearer token (api() adds it automatically)
  async me(): Promise<User> {
    return api<User>('/auth/me', { method: 'GET' });
  },

  // Handy for testing a pasted token
  async meWithToken(token: string): Promise<User> {
    return api<User>('/auth/me', { method: 'GET', headers: { Authorization: `Bearer ${token}` } });
  },
  // ------------------------
  // Password flows
  // ------------------------
  async forgotPassword(email: string) {
    // Backend intentionally returns { ok: true } regardless of existence to avoid user enumeration
    return api<{ ok: true }>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  },

  async resetPassword(args: { email: string; token: string; new_password: string }) {
    return api<{ ok: true }>(
      `/auth/reset-password?email=${encodeURIComponent(args.email)}`,
      { method: 'POST', body: { token: args.token, new_password: args.new_password } }
    );
  }
};
