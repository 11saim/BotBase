import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Check, X } from "lucide-react";
import { useDashboardBots } from "./DashboardBotsContext";
import PricingSection from "@/app/components/PricingSection";
import { toast } from "sonner";
import { invalidateAuth } from "@/hooks/useAuth";

const LIMITS = { messages: 5000, storageMb: 500, bots: 10 };

const plans = [
  {
    key: "pro",
    label: "Pro",
    pill: "Current",
    pillStyle: "bg-neutral-100 text-neutral-500",
    price: "$29",
    period: "/mo",
    desc: "Perfect for individuals and small projects.",
    features: [
      { text: "5,000 messages / mo", included: true },
      { text: "10 bots", included: true },
      { text: "500 MB storage", included: true },
      { text: "Priority support", included: false },
      { text: "Custom domains", included: false },
    ],
    current: true,
    featured: false,
    btnLabel: "Your current plan",
    btnStyle:
      "w-full py-2 rounded-lg text-[13px] font-medium border border-neutral-200 bg-neutral-100 text-neutral-400 cursor-default",
  },
  {
    key: "business",
    label: "Business",
    pill: "Most popular",
    pillStyle: "bg-blue-50 text-blue-700",
    price: "$79",
    period: "/mo",
    desc: "For growing teams that need more capacity and control.",
    features: [
      { text: "20,000 messages / mo", included: true },
      { text: "50 bots", included: true },
      { text: "5 GB storage", included: true },
      { text: "Priority support", included: true },
      { text: "Custom domains", included: false },
    ],
    current: false,
    featured: true,
    btnLabel: "Upgrade to Business",
    btnStyle:
      "w-full py-2 rounded-lg text-[13px] font-medium bg-black text-white hover:opacity-85 transition-opacity",
  },
  {
    key: "enterprise",
    label: "Enterprise",
    pill: "Enterprise",
    pillStyle: "bg-neutral-100 text-neutral-500",
    price: "Custom",
    period: " pricing",
    desc: "Unlimited scale, SSO, SLAs, and a dedicated success team.",
    features: [
      { text: "Unlimited messages", included: true },
      { text: "Unlimited bots", included: true },
      { text: "Unlimited storage", included: true },
      { text: "Priority support", included: true },
      { text: "Custom domains + SSO", included: true },
    ],
    current: false,
    featured: false,
    btnLabel: "Contact sales",
    btnStyle:
      "w-full py-2 rounded-lg text-[13px] font-medium border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 transition-colors",
  },
];

function StatCard({
  label,
  value,
  sub,
  pct,
  warn,
}: {
  label: string;
  value: React.ReactNode;
  sub: string;
  pct: number;
  warn?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
        {label}
      </p>
      <p className="mt-2 font-mono text-3xl font-medium tracking-tight text-neutral-900">
        {value}
      </p>
      <p className="mt-1 text-xs text-neutral-400">{sub}</p>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-neutral-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ${warn ? "bg-red-500" : "bg-black"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p
        className={`mt-1.5 font-mono text-[11px] ${warn ? "text-red-500" : "text-neutral-400"}`}
      >
        {pct}% used{warn ? " — running low" : ""}
      </p>
    </div>
  );
}

export function DashboardPlanUsagePage() {
  const { bots } = useDashboardBots();
  const navigate = useNavigate();

  const totals = useMemo(() => {
    const messages = bots.reduce((a, b) => a + b.messagesMonth, 0);
    const storage = bots.reduce((a, b) => a + b.storageMb, 0);
    return { messages, storage, bots: bots.length };
  }, [bots]);

  const signOut = async () => {
    const res = await fetch('http://localhost:5000/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    const data = await res.json();
    invalidateAuth();
    toast.success(data.message || 'Logout successful', { position: "top-center" });
    navigate("/login", { replace: true });
  };

  const msgPct = Math.min(
    100,
    Math.round((totals.messages / LIMITS.messages) * 100),
  );
  const botPct = Math.min(100, Math.round((totals.bots / LIMITS.bots) * 100));
  const storPct = Math.min(
    100,
    Math.round((totals.storage / LIMITS.storageMb) * 100),
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* ── Hero ── */}
        <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white px-8 py-10 sm:px-10 sm:py-12">
          {/* subtle grid bg */}
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg,#e5e5e5 0,#e5e5e5 0.5px,transparent 0.5px,transparent 40px),repeating-linear-gradient(0deg,#e5e5e5 0,#e5e5e5 0.5px,transparent 0.5px,transparent 40px)",
            }}
          />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                Workspace
              </p>
              <h1 className="mt-2 text-3xl font-medium tracking-tight text-neutral-900 sm:text-4xl">
                Plan &amp; usage
              </h1>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-500">
                Monitor how your workspace compares to your current plan limits.
                All counters reset on your monthly billing date.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-700 lg:self-auto">
              <Zap size={14} className="text-neutral-400" />
              Pro plan
            </div>
          </div>
        </div>

        {/* ── Usage stats ── */}
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
            This month
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              label="Messages"
              value={totals.messages.toLocaleString()}
              sub={`of ${LIMITS.messages.toLocaleString()} / month`}
              pct={msgPct}
            />
            <StatCard
              label="Bots"
              value={totals.bots}
              sub={`of ${LIMITS.bots} included`}
              pct={botPct}
            />
            <StatCard
              label="Storage"
              value={
                <>
                  {Math.round(totals.storage * 10) / 10}
                  <span className="text-lg font-normal text-neutral-400">
                    {" "}
                    MB
                  </span>
                </>
              }
              sub={`of ${LIMITS.storageMb} MB pooled`}
              pct={storPct}
              warn={storPct >= 80}
            />
          </div>
        </div>

        {/* ── Upgrade plans ── */}
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
            Upgrade your plan
          </p>
          <div className="rounded-3xl border border-neutral-200 bg-white px-1 py-5 md:p-5">
            <PricingSection variant="plan&usage" currentPlan="Pro" />
          </div>
        </div>

        {/* ── Bottom row ── */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
              Billing
            </p>
            <h3 className="mt-1.5 text-[15px] font-medium text-neutral-900">
              Next renewal
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500">
              Your Pro plan renews on{" "}
              <span className="font-medium text-neutral-800">
                June 16, 2026
              </span>
              . You won't be charged if you downgrade before that date.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
              Session
            </p>
            <h3 className="mt-1.5 text-[15px] font-medium text-neutral-900">
              This device
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500">
              Sign out when you are done on a shared computer to keep your
              workspace secure.
            </p>
            <button
              type="button"
              onClick={signOut}
              className="mt-5 rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
