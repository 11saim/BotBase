import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  User,
  Shield,
  Bell,
  Key,
  CreditCard,
  AlertTriangle,
  Eye,
  EyeOff,
  Menu,
  X,
  ArrowLeft,
  LayoutGrid,
} from "lucide-react";

const settingsSections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "api-keys", label: "API Keys", icon: Key },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "danger", label: "Danger zone", icon: AlertTriangle },
];

export function SettingsPage() {
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState("profile");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNewKey, setShowNewKey] = useState(false);
  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      name: "Production Key",
      key: "sk_live_***************",
      created: "Apr 12, 2026",
      lastUsed: "2 hours ago",
      revealed: false,
    },
    {
      id: 2,
      name: "Development Key",
      key: "sk_test_***************",
      created: "Apr 8, 2026",
      lastUsed: "1 day ago",
      revealed: false,
    },
  ]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveSection(tab);
    }
  }, [searchParams]);

  const selectSection = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {mobileMenuOpen && (
        <div
          role="presentation"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar — drawer on small screens, fixed column on lg+ */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          className="absolute right-4 top-4 rounded-lg p-1.5 hover:bg-gray-100 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>

        <div className="flex flex-1 flex-col overflow-y-auto p-4 pt-14 lg:pt-6">
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="mb-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-black"
          >
            <ArrowLeft size={18} className="shrink-0" />
            Back to Dashboard
          </Link>

          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Settings
          </p>
          <nav className="space-y-1" aria-label="Settings sections">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => selectSection(section.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all ${
                  activeSection === section.id
                    ? "bg-gray-100 font-medium text-black"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <section.icon size={18} className="shrink-0" />
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 sm:px-6 lg:hidden">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="shrink-0 rounded-xl p-2 transition-colors hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open settings menu"
            >
              <Menu size={20} />
            </button>
            <h1 className="truncate text-lg font-semibold">Settings</h1>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="mx-auto max-w-2xl">
            <h1
              className="mb-6 hidden text-3xl font-medium tracking-tight lg:block"
              style={{ letterSpacing: "-0.8px" }}
            >
              Settings
            </h1>

            {activeSection === "profile" && (
              <div
                className="bg-white rounded-xl border p-6 space-y-6"
                style={{ border: "1px solid var(--border-default)" }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "15px",
                      fontWeight: 500,
                      marginBottom: "16px",
                    }}
                  >
                    Profile
                  </p>

                  <div className="mb-6 flex flex-wrap items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--text-primary)] text-white flex items-center justify-center text-xl font-medium">
                      SK
                    </div>
                    <button
                      className="px-4 h-[32px] rounded-lg border transition-all hover:bg-[var(--bg-secondary)]"
                      style={{
                        border: "1px solid var(--border-default)",
                        fontSize: "14px",
                      }}
                    >
                      Upload new
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Full name
                      </label>
                      <input
                        type="text"
                        defaultValue="Saim Khan"
                        className="w-full h-[36px] px-3 rounded-lg border"
                        style={{
                          border: "1px solid var(--border-default)",
                          fontSize: "14px",
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          defaultValue="saim@example.com"
                          className="w-full h-[36px] px-3 pr-20 rounded-lg border"
                          style={{
                            border: "1px solid var(--border-default)",
                            fontSize: "14px",
                          }}
                          disabled
                        />
                        <span
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-0.5 rounded"
                          style={{
                            background: "var(--success)",
                            color: "white",
                          }}
                        >
                          verified ✓
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    className="mt-6 px-6 h-[36px] rounded-lg text-white transition-all hover:bg-[#2A2A2A]"
                    style={{
                      background: "var(--text-primary)",
                      fontSize: "14px",
                    }}
                  >
                    Save profile
                  </button>
                </div>
              </div>
            )}

            {activeSection === "security" && (
              <div
                className="bg-white rounded-xl border p-6 space-y-6"
                style={{ border: "1px solid var(--border-default)" }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "15px",
                      fontWeight: 500,
                      marginBottom: "16px",
                    }}
                  >
                    Change Password
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Current password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full h-[36px] px-3 rounded-lg border"
                        style={{
                          border: "1px solid var(--border-default)",
                          fontSize: "14px",
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        New password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full h-[36px] px-3 rounded-lg border"
                        style={{
                          border: "1px solid var(--border-default)",
                          fontSize: "14px",
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Confirm new password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full h-[36px] px-3 rounded-lg border"
                        style={{
                          border: "1px solid var(--border-default)",
                          fontSize: "14px",
                        }}
                      />
                    </div>
                  </div>
                  <button
                    className="mt-6 px-6 h-[36px] rounded-lg text-white transition-all hover:bg-[#2A2A2A]"
                    style={{
                      background: "var(--text-primary)",
                      fontSize: "14px",
                    }}
                  >
                    Update password
                  </button>
                </div>

                <div className="border-t border-[var(--border-default)] pt-6">
                  <p
                    style={{
                      fontSize: "15px",
                      fontWeight: 500,
                      marginBottom: "16px",
                    }}
                  >
                    Connected Accounts
                  </p>
                  <div
                    className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                    style={{ border: "1px solid var(--border-default)" }}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-medium">Google</p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          saim@example.com
                        </p>
                      </div>
                    </div>
                    <button
                      className="shrink-0 self-start text-sm sm:self-auto"
                      style={{ color: "var(--destructive)" }}
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "api-keys" && (
              <div className="space-y-6">
                <div
                  className="bg-white rounded-xl border p-6"
                  style={{ border: "1px solid var(--border-default)" }}
                >
                  <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p style={{ fontSize: "15px", fontWeight: 500 }}>
                        API Keys
                      </p>
                      <p
                        className="mt-1 text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Manage your API keys for programmatic access
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNewKey(true)}
                      className="h-[32px] shrink-0 self-start rounded-lg px-4 text-white transition-all hover:bg-[#2A2A2A] sm:self-auto"
                      style={{
                        background: "var(--text-primary)",
                        fontSize: "14px",
                      }}
                    >
                      Create new key
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[var(--border-default)]">
                          {[
                            "Name",
                            "Key",
                            "Created",
                            "Last Used",
                            "Actions",
                          ].map((header) => (
                            <th
                              key={header}
                              className="px-4 py-3 text-left"
                              style={{
                                fontSize: "10px",
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                                color: "var(--text-tertiary)",
                                fontWeight: 500,
                              }}
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {apiKeys.map((key) => (
                          <tr
                            key={key.id}
                            className="border-b border-[var(--border-default)]"
                          >
                            <td className="px-4 py-4 text-sm">{key.name}</td>
                            <td className="px-4 py-4">
                              <code className="text-xs font-mono">
                                {key.revealed
                                  ? "sk_live_1234567890abcdef"
                                  : key.key}
                              </code>
                            </td>
                            <td
                              className="px-4 py-4 text-sm"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {key.created}
                            </td>
                            <td
                              className="px-4 py-4 text-sm"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {key.lastUsed}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setApiKeys(
                                      apiKeys.map((k) =>
                                        k.id === key.id
                                          ? { ...k, revealed: !k.revealed }
                                          : k,
                                      ),
                                    );
                                  }}
                                  className="text-xs"
                                  style={{ color: "var(--text-secondary)" }}
                                >
                                  {key.revealed ? (
                                    <EyeOff size={14} />
                                  ) : (
                                    <Eye size={14} />
                                  )}
                                </button>
                                <button
                                  className="text-xs"
                                  style={{ color: "var(--destructive)" }}
                                >
                                  Revoke
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {showNewKey && (
                  <div
                    className="bg-white rounded-xl border p-6"
                    style={{ border: "1px solid var(--border-default)" }}
                  >
                    <p
                      style={{
                        fontSize: "15px",
                        fontWeight: 500,
                        marginBottom: "16px",
                      }}
                    >
                      Create New API Key
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Key Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Production Key"
                          className="w-full h-[36px] px-3 rounded-lg border"
                          style={{
                            border: "1px solid var(--border-default)",
                            fontSize: "14px",
                          }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="px-4 h-[36px] rounded-lg text-white transition-all hover:bg-[#2A2A2A]"
                          style={{
                            background: "var(--text-primary)",
                            fontSize: "14px",
                          }}
                        >
                          Create key
                        </button>
                        <button
                          onClick={() => setShowNewKey(false)}
                          className="px-4 h-[36px] rounded-lg border transition-all hover:bg-[var(--bg-secondary)]"
                          style={{
                            border: "1px solid var(--border-default)",
                            fontSize: "14px",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === "billing" && (
              <div className="space-y-6">
                <div
                  className="bg-white rounded-xl border p-6"
                  style={{ border: "1px solid var(--border-default)" }}
                >
                  <p
                    style={{
                      fontSize: "15px",
                      fontWeight: 500,
                      marginBottom: "16px",
                    }}
                  >
                    Current plan
                  </p>

                  <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p style={{ fontSize: "20px", fontWeight: 500 }}>Free</p>
                      <p
                        style={{
                          fontSize: "14px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        $0 / month
                      </p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="flex h-[36px] shrink-0 items-center self-start rounded-lg px-4 text-white transition-all hover:bg-[#2A2A2A] sm:self-auto"
                      style={{
                        background: "var(--text-primary)",
                        fontSize: "14px",
                      }}
                    >
                      Upgrade plan
                    </Link>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "var(--text-secondary)" }}>
                        Bots used
                      </span>
                      <span>1 / 3</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--text-primary)]"
                        style={{ width: "33%" }}
                      />
                    </div>

                    <div className="flex justify-between text-sm">
                      <span style={{ color: "var(--text-secondary)" }}>
                        Messages used
                      </span>
                      <span>1,284 / 5,000</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--text-primary)]"
                        style={{ width: "26%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "danger" && (
              <div
                className="bg-white rounded-xl p-6 space-y-6"
                style={{ border: "1.5px solid var(--destructive)" }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      fontWeight: 500,
                      color: "var(--destructive)",
                      marginBottom: "12px",
                    }}
                  >
                    DANGER ZONE
                  </p>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 border-b border-[var(--border-default)] py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p style={{ fontSize: "14px", fontWeight: 500 }}>
                          Delete all bots
                        </p>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                            marginTop: "2px",
                          }}
                        >
                          Permanently delete all bots and their data
                        </p>
                      </div>
                      <button
                        type="button"
                        className="h-[32px] shrink-0 self-start rounded-lg border px-4 transition-all hover:bg-[#FFF5F5] sm:self-auto"
                        style={{
                          border: "1px solid var(--destructive)",
                          color: "var(--destructive)",
                          fontSize: "14px",
                        }}
                      >
                        Delete all bots
                      </button>
                    </div>

                    <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p style={{ fontSize: "14px", fontWeight: 500 }}>
                          Delete account
                        </p>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                            marginTop: "2px",
                          }}
                        >
                          Permanently delete your account and all data
                        </p>
                      </div>
                      <button
                        type="button"
                        className="h-[32px] shrink-0 self-start rounded-lg border px-4 transition-all hover:bg-[#FFF5F5] sm:self-auto"
                        style={{
                          border: "1px solid var(--destructive)",
                          color: "var(--destructive)",
                          fontSize: "14px",
                        }}
                      >
                        Delete account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
