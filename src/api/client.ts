import type { ResumeData, ThemeName } from '../types/resume';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  } catch {
    throw new Error(`Cannot reach the server at ${API_BASE}. Is the backend running?`);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  auth: {
    register: (email: string, password: string, name?: string) =>
      request<{ user: { id: string; email: string; name?: string }; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      }),
    login: (email: string, password: string) =>
      request<{ user: { id: string; email: string; name?: string }; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    logout: () =>
      request<{ success: boolean }>('/auth/logout', { method: 'POST' }),
    me: () =>
      request<{ user: { id: string; email: string; name?: string } }>('/auth/me'),
  },
  resumes: {
    list: () =>
      request<{ resumes: Array<{ id: string; title: string; theme: string; isPublic: boolean; createdAt: string; updatedAt: string }> }>('/resumes'),
    get: (id: string) =>
      request<{ resume: { id: string; title: string; data: any; theme: string; isPublic: boolean; userId: string; createdAt: string; updatedAt: string } }>(`/resumes/${id}`),
    create: (data: { title: string; data: any; theme?: string; isPublic?: boolean }) =>
      request<{ resume: any }>('/resumes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<{ title: string; data: any; theme: string; isPublic: boolean }>) =>
      request<{ resume: any }>(`/resumes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/resumes/${id}`, { method: 'DELETE' }),
    duplicate: (id: string) =>
      request<{ resume: any }>(`/resumes/${id}/duplicate`, { method: 'POST' }),
  },
  pdf: {
    generate: (data: ResumeData, theme: ThemeName) =>
      fetch(`${API_BASE}/pdf/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('auth_token') ? { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` } : {}),
        },
        body: JSON.stringify({ data, theme }),
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to generate PDF');
        return res.blob();
      }),
    public: (id: string) =>
      fetch(`${API_BASE}/pdf/public/${id}`).then((res) => {
        if (!res.ok) throw new Error('Failed to generate PDF');
        return res.blob();
      }),
  },
};

export function setAuthToken(token: string) {
  localStorage.setItem('auth_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('auth_token');
}

export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}