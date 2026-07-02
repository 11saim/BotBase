import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CloudCog, Eye, EyeOff } from "lucide-react";
import { Toaster, toast } from "sonner";
import { GoogleLogin } from '@react-oauth/google';
import { API_URL } from '../lib/config';
import { invalidateAuth } from "@/hooks/useAuth";
import { setToken } from "../lib/authFetch";

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value.length === 0) {
      setPasswordStrength(0);
    } else if (value.length < 6) {
      setPasswordStrength(1);
    } else if (value.length < 10) {
      setPasswordStrength(2);
    } else {
      setPasswordStrength(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Registration failed');
        return;
      }
      setToken(data.token);
      invalidateAuth();

      toast.success(data.message || 'Registration successful');
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      toast.error(error.message || 'Something went Wrong');
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength === 1) return "#CC2222";
    if (passwordStrength === 2) return "#FFBD2E";
    return "#28a745";
  };

  return (
    <div className="min-h-screen flex">
      <Toaster richColors />
      {/* Left Half - Dark */}
      <div className="hidden lg:flex w-[40%] bg-[var(--text-primary)] relative items-center justify-center">
        <div className="absolute inset-0 opacity-[0.04]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-[260px] text-center">
          <p
            className="text-white"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "18px",
              fontStyle: "italic",
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
              animation: "slide-vertical 3s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* Right Half - White */}
      <div className="flex-1 bg-white flex items-center justify-center px-6 relative">
        <Link
          to="/"
          className="absolute top-6 left-6 flex items-center gap-2"
          style={{ fontWeight: 500, fontSize: "15px" }}
        >
          <img src="/logo.png" alt="BotBase" className="h-6 w-6 rounded object-contain" />
          <span>Bot Base</span>
        </Link>

        <div className="w-full max-w-[360px]">
          <div className="mb-8">
            <p
              style={{
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 500,
                color: "var(--text-tertiary)",
              }}
            >
              CREATE ACCOUNT
            </p>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 500,
                letterSpacing: "-0.4px",
                marginTop: "8px",
              }}
            >
              Start for free
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-secondary)",
                marginTop: "4px",
              }}
            >
              No credit card needed.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full h-[36px] px-3 rounded-lg border bg-white transition-all"
                style={{
                  border: "1px solid var(--border-default)",
                  fontSize: "14px",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--text-primary)";
                  e.target.style.outline = "3px solid rgba(10, 10, 10, 0.06)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border-default)";
                  e.target.style.outline = "none";
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-[36px] px-3 rounded-lg border bg-white transition-all"
                style={{
                  border: "1px solid var(--border-default)",
                  fontSize: "14px",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--text-primary)";
                  e.target.style.outline = "3px solid rgba(10, 10, 10, 0.06)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border-default)";
                  e.target.style.outline = "none";
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-[36px] px-3 pr-10 rounded-lg border bg-white transition-all"
                  style={{
                    border: "1px solid var(--border-default)",
                    fontSize: "14px",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--text-primary)";
                    e.target.style.outline = "3px solid rgba(10, 10, 10, 0.06)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border-default)";
                    e.target.style.outline = "none";
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

              {/* Password Strength Bar */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 h-[3px]">
                    {[1, 2, 3].map((segment) => (
                      <div
                        key={segment}
                        className="flex-1 rounded-full transition-all duration-300"
                        style={{
                          background:
                            passwordStrength >= segment
                              ? getStrengthColor()
                              : "var(--border-default)",
                        }}
                      />
                    ))}
                  </div>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {passwordStrength === 1 && "Weak"}
                    {passwordStrength === 2 && "Fair"}
                    {passwordStrength === 3 && "Strong"}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5"
              />
              <label htmlFor="terms" className="text-sm">
                I agree to{" "}
                <a
                  href="#"
                  className="underline"
                  style={{ textDecorationOffset: "2px" }}
                >
                  Terms
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="underline"
                  style={{ textDecorationOffset: "2px" }}
                >
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={!agreedToTerms || loading}
              className="w-full h-[36px] rounded-lg text-white transition-all hover:bg-[#2A2A2A] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[var(--text-primary)]"
              style={{
                background: "var(--text-primary)",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              {loading ? 'Creating account...' : 'Create account →'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div
                  className="w-full border-t"
                  style={{ borderColor: "var(--border-default)" }}
                />
              </div>
              <div className="relative flex justify-center text-xs">
                <span
                  className="px-2 bg-white"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  or
                </span>
              </div>
            </div>

            <div>
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

          <p
            className="text-center text-sm mt-6"
            style={{ color: "var(--text-secondary)" }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className="underline"
              style={{ color: "var(--text-primary)" }}
            >
              Sign in
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
