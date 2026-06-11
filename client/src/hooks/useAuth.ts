import { useEffect, useState } from "react";

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
    if (cache && !cache.loading) return;

    fetch("http://localhost:5000/api/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        cache = { user: data?.user ?? null, loading: false };
        setState(cache);
      })
      .catch(() => {
        cache = { user: null, loading: false };
        setState(cache);
      });
  }, []);

  return state;
}

export function invalidateAuth() {
  cache = null;
}
