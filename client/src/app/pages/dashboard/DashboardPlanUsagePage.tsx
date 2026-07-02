import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Zap } from "lucide-react";
import PricingSection from "@/app/components/PricingSection";
import DemoDisclaimerModal from "@/app/components/DemoDisclaimerModal";
import { toast } from "sonner";
import { clearAuth } from "@/hooks/useAuth";
import { API_URL } from "../../lib/config";
import { authFetch } from "../../lib/authFetch";

const API = API_URL;

const PLAN_LABELS: Record<string, "Free" | "Starter" | "Pro" | "Agency"> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  agency: "Agency",
};

interface UsageData {
  plan: string;
  usage: { messagesUsed: number; botsCreated: number; sourcesUploaded: number };
  limits: { messagesPerMonth: number; bots: number; sources: number };
  period: { start: string; end: string | null };
}

function StatCard({
  label, value, sub, pct, warn,
}: {
  label: string;
  value: React.ReactNode;
  sub: string;
  pct: number;
  warn?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">{label}</p>
      <p className="mt-2 font-mono text-3xl font-medium tracking-tight text-neutral-900">{value}</p>
      <p className="mt-1 text-xs text-neutral-400">{sub}</p>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-neutral-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ${warn ? "bg-red-500" : "bg-black"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`mt-1.5 font-mono text-[11px] ${warn ? "text-red-500" : "text-neutral-400"}`}>
        {pct}% used{warn ? " — running low" : ""}
      </p>
    </div>
  );
}

export function DashboardPlanUsagePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    const plan = searchParams.get("plan");
    if (!plan) return;

    searchParams.delete("plan");
    setSearchParams(searchParams, { replace: true });

    setSelectedPlan(plan);
    setDemoModalOpen(true);
  }, []);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await authFetch(`${API}/dashboard/usage`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        toast.error("Error fetching usage.Please try again after some time.")
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, []);

  const signOut = async () => {
    const res = await authFetch(`${API}/auth/logout`, {
      method: "POST",
    });
    const json = await res.json();
    clearAuth();
    toast.success(json.message || "Logout successful");
    navigate("/login", { replace: true });
  };

  // Calculate percentages — handle -1 (unlimited) as 0%
  const pct = (used: number, limit: number) =>
    limit === -1 ? 0 : Math.min(100, Math.round((used / limit) * 100));

  const msgPct = pct(data?.usage.messagesUsed ?? 0, data?.limits.messagesPerMonth ?? 1);
  const botPct = pct(data?.usage.botsCreated ?? 0, data?.limits.bots ?? 1);
  const srcPct = pct(data?.usage.sourcesUploaded ?? 0, data?.limits.sources ?? 1);

  // Renewal date — periodEnd if paid plan, null if free
  const renewalDate = data?.period.end
    ? new Date(data.period.end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  const planLabel: "Free" | "Starter" | "Pro" | "Agency" = PLAN_LABELS[data?.plan ?? "free"] ?? "Free";

  const PRICE_IDS: Record<string, string> = {
    Starter: "price_1TmXjfDJ6uKm9It9H5RFsUWs",
    Pro: "price_1TmXkbDJ6uKm9It9eAkgt0lc",
    Agency: "price_1TmXlBDJ6uKm9It96ta0OiNg",
  };

  const handleCheckout = async (plan: string) => {
    try {
      const priceId = PRICE_IDS[plan];
      const res = await authFetch(`${API}/stripe/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, plan }),
      });
      const data = await res.json();
      window.location.href = data.url;
    } catch (error: any) {
      toast.error(error?.message || "Failed to start checkout.");
    }
  };

  const handleModalConfirm = () => {
    setDemoModalOpen(false);
    if (selectedPlan) {
      handleCheckout(selectedPlan);
    }
    setSelectedPlan(null);
  };

  const handleModalClose = () => {
    setDemoModalOpen(false);
    setSelectedPlan(null);
  };

  return (
    <>
      <DemoDisclaimerModal
        open={demoModalOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
      />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-8">

          {/* Hero */}
          <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white px-8 py-10 sm:px-10 sm:py-12">
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg,#e5e5e5 0,#e5e5e5 0.5px,transparent 0.5px,transparent 40px),repeating-linear-gradient(0deg,#e5e5e5 0,#e5e5e5 0.5px,transparent 0.5px,transparent 40px)",
              }}
            />
            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Workspace</p>
                <h1 className="mt-2 text-3xl font-medium tracking-tight text-neutral-900 sm:text-4xl">Plan &amp; usage</h1>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-500">
                  Monitor how your workspace compares to your current plan limits.
                  All counters reset on your monthly billing date.
                </p>
              </div>
              {/* Dynamic plan badge */}
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-700 lg:self-auto">
                <Zap size={14} className="text-neutral-400" />
                {loading ? "Loading..." : `${planLabel} plan`}
              </div>
            </div>
          </div>

          {/* Usage stats */}
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">This month</p>
            {loading ? (
              <p className="text-[13px] text-neutral-400">Loading...</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                <StatCard
                  label="Messages"
                  value={(data?.usage.messagesUsed ?? 0).toLocaleString()}
                  sub={data?.limits.messagesPerMonth === -1
                    ? "Unlimited"
                    : `of ${(data?.limits.messagesPerMonth ?? 0).toLocaleString()} / month`}
                  pct={msgPct}
                  warn={msgPct >= 80}
                />
                <StatCard
                  label="Bots"
                  value={data?.usage.botsCreated ?? 0}
                  sub={data?.limits.bots === -1
                    ? "Unlimited"
                    : `of ${data?.limits.bots ?? 0} included`}
                  pct={botPct}
                  warn={botPct >= 80}
                />
                <StatCard
                  label="Sources"
                  value={data?.usage.sourcesUploaded ?? 0}
                  sub={data?.limits.sources === -1
                    ? "Unlimited"
                    : `of ${data?.limits.sources ?? 0} included`}
                  pct={srcPct}
                  warn={srcPct >= 80}
                />
              </div>
            )}
          </div>

          {/* Pricing plans */}
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Upgrade your plan</p>
            <div className="rounded-3xl border border-neutral-200 bg-white px-1 py-5 md:p-5">
              <PricingSection variant="plan&usage" currentPlan={planLabel} />
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid gap-3 sm:grid-cols-2">

            {/* Billing */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Billing</p>
              <h3 className="mt-1.5 text-[15px] font-medium text-neutral-900">
                {renewalDate ? "Next renewal" : "Plan"}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                {renewalDate ? (
                  <>
                    Your {planLabel} plan renews on{" "}
                    <span className="font-medium text-neutral-800">{renewalDate}</span>.
                    You won't be charged if you downgrade before that date.
                  </>
                ) : (
                  <>You are on the <span className="font-medium text-neutral-800">Free plan</span>. Upgrade anytime to unlock more features.</>
                )}
              </p>
            </div>

            {/* Sign out */}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Session</p>
              <h3 className="mt-1.5 text-[15px] font-medium text-neutral-900">This device</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                Sign out when you are done on a shared computer to keep your workspace secure.
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
    </>
  );
}