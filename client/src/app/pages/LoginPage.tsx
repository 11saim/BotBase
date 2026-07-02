import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Toaster, toast } from "sonner";
import { GoogleLogin } from '@react-oauth/google';
import { API_URL } from '../lib/config';
import { invalidateAuth } from "@/hooks/useAuth";
import { setToken } from '../lib/authFetch';

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      setToken(data.token);
      if (!response.ok) {
        toast.error(data.error || 'Login failed');
        return;
      }

      invalidateAuth();

      toast.success(data.message || 'Login successful');
      navigate(from, { replace: true });
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Half - Dark */}
      <div className="hidden lg:flex w-[40%] bg-[var(--text-primary)] relative items-center justify-center">
        <div className="absolute inset-0 opacity-[0.04]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-[260px] text-center">
          <p
            className="text-white"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              fontStyle: 'italic',
              lineHeight: 1.4,
            }}
          >
            "Your knowledge,
            <br />
            always available."
          </p>
          <p className="text-white/40 text-xs mt-4">Bot Base</p>
        </div>

        {/* Animated vertical line */}
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/20 overflow-hidden">
          <div
            className="w-full h-[80px] bg-gradient-to-b from-transparent via-white/40 to-transparent"
            style={{
              animation: 'slide-vertical 3s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      {/* Right Half - White */}
      <div className="flex-1 bg-white flex items-center justify-center px-6 relative">
        <Link
          to="/"
          className="absolute top-6 left-6 flex items-center gap-2"
          style={{ fontWeight: 500, fontSize: '15px' }}
        >
          <img src="/logo.png" alt="BotBase" className="h-6 w-6 rounded object-contain" />
          <span>Bot Base</span>
        </Link>

        <div className="w-full max-w-[360px]">
          <div className="mb-8">
            <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, color: 'var(--text-tertiary)' }}>
              WELCOME BACK
            </p>
            <h2 style={{ fontSize: '20px', fontWeight: 500, letterSpacing: '-0.4px', marginTop: '8px' }}>
              Sign in
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-[36px] px-3 rounded-lg border bg-white transition-all"
                style={{
                  border: '1px solid var(--border-default)',
                  fontSize: '14px',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--text-primary)';
                  e.target.style.outline = '3px solid rgba(10, 10, 10, 0.06)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-default)';
                  e.target.style.outline = 'none';
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-[36px] px-3 pr-10 rounded-lg border bg-white transition-all"
                  style={{
                    border: '1px solid var(--border-default)',
                    fontSize: '14px',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--text-primary)';
                    e.target.style.outline = '3px solid rgba(10, 10, 10, 0.06)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-default)';
                    e.target.style.outline = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="text-right mt-2">
                <Link
                  to="/forgot-password"
                  className="text-xs underline"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-[36px] rounded-lg text-white transition-all hover:bg-[#2A2A2A] active:scale-[0.98]"
              style={{
                background: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 500,
              }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: 'var(--border-default)' }} />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white" style={{ color: 'var(--text-tertiary)' }}>
                  or
                </span>
              </div>
            </div>

            <div className="w-full flex justify-center [&>div]:w-full [&>div>div]:w-full [&>div>div>iframe]:!w-full">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    const res = await fetch(`${API_URL}/auth/google`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ token: credentialResponse.credential }),
                    });

                    const data = await res.json();

                    if (!res.ok) {
                      toast.error(data.error || "Google login failed");
                      return;
                    }

                    setToken(data.token);

                    invalidateAuth();
                    toast.success("Login successful");
                    navigate(from, { replace: true });

                  } catch (err) {
                    toast.error("Something went wrong");
                  }
                }}
                onError={() => {
                  toast.error("Google login failed");
                }}
              />
            </div>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="underline" style={{ color: 'var(--text-primary)' }}>
              Get started
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slide-vertical {
          0%, 100% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
}
