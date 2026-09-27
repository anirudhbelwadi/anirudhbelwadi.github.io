import { API_BASE_URL } from './config';
import type { Analytics, VisitorPage } from './types';

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
  /** The token is missing, expired, or the key was rotated. */
  get needsLogin() {
    return this.status === 401;
  }
}

const TIMEOUT_MS = 20000;

async function request<T>(path: string, token: string | null, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        ...(init?.headers ?? {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new ApiError(body?.message ?? `Request failed (${response.status})`, response.status);
    }
    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if ((error as Error).name === 'AbortError') {
      throw new ApiError('The server took too long to answer.', 0);
    }
    throw new ApiError('Could not reach the analytics server.', 0);
  } finally {
    clearTimeout(timer);
  }
}

export async function login(password: string): Promise<string> {
  const body = await request<{ token: string }>('/api/login', null, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  return body.token;
}

export function fetchAnalytics(token: string): Promise<Analytics> {
  return request<Analytics>('/api/analytics', token);
}

export function fetchVisitors(
  token: string,
  { limit = 40, offset = 0, q = '' }: { limit?: number; offset?: number; q?: string }
): Promise<VisitorPage> {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (q.trim()) params.set('q', q.trim());
  return request<VisitorPage>(`/api/visitors?${params.toString()}`, token);
}
