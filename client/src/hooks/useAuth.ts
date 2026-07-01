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
    { user: null, loading: true },
  );

  useEffect(() => {
    let cancelled = false;

    fetch("http://localhost:5000/api/auth/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        const next = { user: data?.user ?? null, loading: false };
        cache = next;
        setState(next);
      })
      .catch(() => {
        if (cancelled) return;
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
