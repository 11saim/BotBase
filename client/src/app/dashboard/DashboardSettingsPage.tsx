import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { User, Shield, Bell, CreditCard } from "lucide-react";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "billing", label: "Plan & billing", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
] as const;

export function DashboardSettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [active, setActive] = useState<string>("profile");

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t && tabs.some((x) => x.id === t)) setActive(t);
  }, [searchParams]);

  const go = (id: string) => {
    setActive(id);
    setSearchParams(id === "profile" ? {} : { tab: id });
  };

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6 lg:p-8" style={{ fontFamily: "var(--font-ui)" }}>
      <h1 className="mb-6 text-3xl font-medium tracking-tight" style={{ color: "var(--text-primary)", letterSpacing: "-0.8px" }}>
        Settings
      </h1>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-[var(--border-default)] pb-px">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => go(t.id)}
            className="flex shrink-0 items-center gap-2 border-b-2 px-3 py-2 text-sm transition-colors"
            style={{
              borderColor: active === t.id ? "var(--text-primary)" : "transparent",
              color: active === t.id ? "var(--text-primary)" : "var(--text-secondary)",
              fontWeight: active === t.id ? 500 : 400,
            }}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {active === "profile" && (
        <div className="rounded-xl border p-6" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
          <p className="mb-4 text-sm font-medium" style={{ color: "var(--text-primary)" }}>Profile</p>
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full text-lg font-medium text-white" style={{ background: "var(--text-primary)" }}>SK</div>
            <button type="button" className="h-8 rounded-lg border px-4 text-sm transition-colors hover:bg-[var(--bg-secondary)]" style={{ borderColor: "var(--border-default)" }}>Upload avatar</button>
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Full name</label>
            <input defaultValue="Saim Khan" className="h-9 w-full rounded-lg border px-3 text-sm" style={{ borderColor: "var(--border-default)" }} />
            <label className="block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Email</label>
            <input defaultValue="saim@example.com" disabled className="h-9 w-full rounded-lg border px-3 text-sm opacity-70" style={{ borderColor: "var(--border-default)" }} />
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Contact support to change email.</p>
          </div>
          <button type="button" className="mt-6 h-9 rounded-lg px-6 text-sm text-white" style={{ background: "var(--text-primary)" }}>Save</button>
        </div>
      )}

      {active === "security" && (
        <div className="space-y-6">
          <div className="rounded-xl border p-6" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
            <p className="mb-4 text-sm font-medium" style={{ color: "var(--text-primary)" }}>Login methods</p>
            <div className="space-y-3">
              <div className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "var(--border-default)" }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Email / password</p>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Active</p>
                </div>
                <button type="button" className="self-start text-sm underline sm:self-auto" style={{ color: "var(--text-primary)" }}>Add Google login</button>
              </div>
              <div className="rounded-lg border p-3" style={{ borderColor: "var(--border-default)" }}>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Google</p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Not connected</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border p-6" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
            <p className="mb-4 text-sm font-medium" style={{ color: "var(--text-primary)" }}>Change password</p>
            <div className="space-y-3">
              <input type="password" placeholder="Current" className="h-9 w-full rounded-lg border px-3 text-sm" style={{ borderColor: "var(--border-default)" }} />
              <input type="password" placeholder="New" className="h-9 w-full rounded-lg border px-3 text-sm" style={{ borderColor: "var(--border-default)" }} />
              <input type="password" placeholder="Confirm" className="h-9 w-full rounded-lg border px-3 text-sm" style={{ borderColor: "var(--border-default)" }} />
            </div>
            <button type="button" className="mt-4 h-9 rounded-lg px-6 text-sm text-white" style={{ background: "var(--text-primary)" }}>Update password</button>
          </div>
          <div className="rounded-xl border p-6" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
            <p className="mb-4 text-sm font-medium" style={{ color: "var(--text-primary)" }}>Active sessions</p>
            <ul className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              <li className="flex flex-col gap-2 border-b border-[var(--border-default)] py-2 sm:flex-row sm:items-center sm:justify-between">
                <span>Chrome on Windows · Toronto, CA</span>
                <span className="text-xs">Last active: now</span>
                <button type="button" className="text-xs underline" style={{ color: "var(--destructive)" }}>Revoke</button>
              </li>
              <li className="flex flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between">
                <span>Safari on iPhone · Toronto, CA</span>
                <span className="text-xs">Last active: 2d ago</span>
                <button type="button" className="text-xs underline" style={{ color: "var(--destructive)" }}>Revoke</button>
              </li>
            </ul>
            <button type="button" className="mt-4 h-9 w-full rounded-lg border text-sm sm:w-auto" style={{ borderColor: "var(--border-default)" }}>Log out all other sessions</button>
          </div>
        </div>
      )}

      {active === "billing" && (
        <div className="space-y-6">
          <div className="rounded-xl border p-6" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Current plan</p>
            <p className="mt-2 text-2xl font-medium" style={{ color: "var(--text-primary)" }}>Pro</p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>$29 / month · Renews Jun 1, 2026</p>
            <div className="mt-4 space-y-3">
              <UsageBar label="Messages" used={3200} cap={10000} />
              <UsageBar label="Bots" used={2} cap={10} />
              <UsageBar label="Storage (MB)" used={34} cap={500} />
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button type="button" className="h-9 rounded-lg px-4 text-sm text-white" style={{ background: "var(--text-primary)" }}>Upgrade</button>
              <button type="button" className="h-9 rounded-lg border px-4 text-sm" style={{ borderColor: "var(--border-default)" }}>Downgrade</button>
            </div>
          </div>
          <div className="rounded-xl border p-6" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
            <p className="mb-4 text-sm font-medium" style={{ color: "var(--text-primary)" }}>Billing history</p>
            <table className="w-full text-left text-sm">
              <thead><tr style={{ color: "var(--text-tertiary)" }}><th className="pb-2">Date</th><th>Amount</th><th>Status</th><th /></tr></thead>
              <tbody>
                <tr className="border-t border-[var(--border-default)]"><td className="py-2">May 1, 2026</td><td>$29.00</td><td>Paid</td><td><button type="button" className="text-xs underline">Invoice</button></td></tr>
                <tr className="border-t border-[var(--border-default)]"><td className="py-2">Apr 1, 2026</td><td>$29.00</td><td>Paid</td><td><button type="button" className="text-xs underline">Invoice</button></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {active === "notifications" && (
        <div className="rounded-xl border p-6" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
          <p className="mb-4 text-sm font-medium" style={{ color: "var(--text-primary)" }}>Email notifications</p>
          <div className="space-y-4">
            {[
              ["Email when a bot reaches 80% of message limit", true],
              ["Weekly usage summary email", true],
              ["Alert when a bot has a high gap rate", true],
              ["Product updates & announcements", false],
            ].map(([label, on]) => (
              <div key={String(label)} className="flex items-start justify-between gap-3 border-b border-[var(--border-default)] py-3 last:border-0">
                <p className="text-sm" style={{ color: "var(--text-primary)" }}>{label}</p>
                <button type="button" className="relative h-5 w-9 shrink-0 rounded-full" style={{ background: on ? "var(--text-primary)" : "var(--border-default)" }}>
                  <span className="absolute top-0.5 block h-4 w-4 rounded-full bg-white shadow" style={{ left: on ? "18px" : "2px" }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UsageBar({ label, used, cap }: { label: string; used: number; cap: number }) {
  const pct = Math.min(100, Math.round((used / cap) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs" style={{ color: "var(--text-secondary)" }}>
        <span>{label}</span>
        <span>{used.toLocaleString()} / {cap.toLocaleString()}</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--bg-tertiary)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--text-primary)" }} />
      </div>
    </div>
  );
}
