const TOKEN_KEY = "botbase_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function authHeaders(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/**
 * Fetch wrapper that attaches the JWT token and handles 401s globally.
 * Use this instead of plain `fetch` for any authenticated request.
 */
export async function authFetch(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = { ...init.headers, ...authHeaders() };

  // Don't set Content-Type for FormData (browser sets multipart boundary)
  if (init.body instanceof FormData) {
    delete (headers as Record<string, string>)["Content-Type"];
  }

  const res = await fetch(url, { ...init, headers });

  if (res.status === 401) {
    removeToken();
    // Only redirect if not already on login page
    if (!window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
  }

  return res;
}
