const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5111/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiFetch = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
    ...getAuthHeaders()
  };

  let body = options.body;
  if (body !== undefined && body !== null && !(body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as T) : (null as T);

  if (!response.ok) {
    const error = new Error('API request failed');
    (error as any).status = response.status;
    (error as any).data = data;
    throw error;
  }

  return data;
};

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown) => apiFetch<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => apiFetch<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: 'DELETE' })
};
