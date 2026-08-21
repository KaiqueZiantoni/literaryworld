const API_URL = 'http://localhost:8080';

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

async function tryRefresh(): Promise<boolean> {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    setAccessToken(null);
    return false;
  }

  const data = await response.json();
  setAccessToken(data.accessToken);
  return true;
}

export async function api(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  let response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Access token expirou? Tenta renovar UMA vez e repete a requisição original
  if (response.status === 401 && accessToken) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers.set('Authorization', `Bearer ${getAccessToken()}`);
      response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        credentials: 'include',
      });
    }
  }

  return response;
}