const AUTH_KEY = "botbase_auth_token";

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}
