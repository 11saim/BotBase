import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useDashboardBots } from "./DashboardBotsContext";
import { clearAuthToken } from "../../lib/auth";

const LIMITS = { messages: 5000, storageMb: 500, bots: 10 };

export function DashboardPlanUsagePage() {
  const { bots } = useDashboardBots();
  const navigate = useNavigate();

  const totals = useMemo(() => {
    const messages = bots.reduce((a, b) => a + b.messagesMonth, 0);
    const storage = bots.reduce((a, b) => a + b.storageMb, 0);
    return { messages, storage, bots: bots.length };
  }, [bots]);

  const signOut = () => {
    clearAuthToken();
    navigate("/login", { replace: true });
  };

  const msgPct = Math.min(100, Math.round((totals.messages / LIMITS.messages) * 100));
  const botPct = Math.min(100, Math.round((totals.bots / LIMITS.bots) * 100));
  const storPct = Math.min(100, Math.round((totals.storage / LIMITS.storageMb) * 100));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--border-default)] bg-[var(--bg-primary)] px-6 py-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:px-10 sm:py-12">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-[0.07]"
            style={{ background: "var(--text-primary)" }}
          />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                Workspace
              </p>
              <h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl" style={{ color: "var(--text-primary)" }}>
                Plan &amp; usage
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed sm:text-base" style={{ color: "var(--text-secondary)" }}>
                One place to see how your workspace compares to your current plan limits.
              </p>
            </div>
            <div
              className="inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 text-sm font-medium lg:self-auto"
              style={{ borderColor: "var(--border-default)", color: "var(--text-primary)", background: "var(--bg-secondary)" }}
            >
              <Sparkles size={16} style={{ color: "var(--text-secondary)" }} />
              Pro plan
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div
            className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.04)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
              Messages
            </p>
            <p className="mt-3 text-3xl font-medium tabular-nums tracking-tight" style={{ color: "var(--text-primary)" }}>
              {totals.messages.toLocaleString()}
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              of {LIMITS.messages.toLocaleString()} / month
            </p>
            <div className="mt-5 h-2 overflow-hidden rounded-full" style={{ background: "var(--bg-tertiary)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${msgPct}%`, background: "var(--text-primary)" }} />
            </div>
            <p className="mt-2 text-xs tabular-nums" style={{ color: "var(--text-tertiary)" }}>
              {msgPct}% used
            </p>
          </div>
          <div
            className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.04)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
              Bots
            </p>
            <p className="mt-3 text-3xl font-medium tabular-nums tracking-tight" style={{ color: "var(--text-primary)" }}>
              {totals.bots}
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              of {LIMITS.bots} included
            </p>
            <div className="mt-5 h-2 overflow-hidden rounded-full" style={{ background: "var(--bg-tertiary)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${botPct}%`, background: "var(--text-primary)" }} />
            </div>
            <p className="mt-2 text-xs tabular-nums" style={{ color: "var(--text-tertiary)" }}>
              {botPct}% used
            </p>
          </div>
          <div
            className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.04)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
              Storage
            </p>
            <p className="mt-3 text-3xl font-medium tabular-nums tracking-tight" style={{ color: "var(--text-primary)" }}>
              {Math.round(totals.storage * 10) / 10}
              <span className="text-lg font-normal" style={{ color: "var(--text-tertiary)" }}>
                {" "}
                MB
              </span>
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              of {LIMITS.storageMb} MB pooled
            </p>
            <div className="mt-5 h-2 overflow-hidden rounded-full" style={{ background: "var(--bg-tertiary)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${storPct}%`,
                  background: storPct >= 90 ? "var(--destructive)" : "var(--text-primary)",
                }}
              />
            </div>
            <p className="mt-2 text-xs tabular-nums" style={{ color: "var(--text-tertiary)" }}>
              {storPct}% used
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div
            className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-6 sm:p-8"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
              What happens next
            </p>
            <h2 className="mt-2 text-lg font-medium tracking-tight" style={{ color: "var(--text-primary)" }}>
              Need more headroom?
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              When you outgrow Pro, you can move to a higher tier for more messages, bots, and storage. Billing is not wired in this preview build.
            </p>
          </div>
          <div
            className="flex flex-col justify-between rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-6 sm:p-8"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                Session
              </p>
              <h2 className="mt-2 text-lg font-medium tracking-tight" style={{ color: "var(--text-primary)" }}>
                This device
              </h2>
              <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                Sign out when you are done on a shared computer.
              </p>
            </div>
            <button
              type="button"
              className="mt-6 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] px-5 py-3 text-sm font-medium transition-colors hover:bg-[var(--bg-tertiary)] sm:mt-8 sm:w-auto"
              style={{ color: "var(--text-primary)" }}
              onClick={signOut}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
