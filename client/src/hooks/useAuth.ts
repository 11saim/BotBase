import { useEffect, useState } from "react";
import { API_URL } from "../app/lib/config";
import { getToken, setToken, removeToken } from "../app/lib/authFetch";

interface User {
  _id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
}

let cache: AuthState | null = null;

export function useAuth() {
  const [state, setState] = useState<AuthState>(
    cache ?? { user: null, loading: true },
  );

  useEffect(() => {
    let cancelled = false;
    const token = getToken();

    if (!token) {
      const next = { user: null, loading: false };
      cache = next;
      setState(next);
      return;
    }

    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          removeToken();
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const next = { user: data?.user ?? null, loading: false };
        if (!next.user) removeToken();
        cache = next;
        setState(next);
      })
      .catch(() => {
        if (cancelled) return;
        removeToken();
        const next = { user: null, loading: false };
        cache = next;
        setState(next);
      });

    return () => { cancelled = true; };
  }, []);

  return state;
}

export function invalidateAuth() {
  cache = null;
}

export function clearAuth() {
  cache = null;
  removeToken();
}
