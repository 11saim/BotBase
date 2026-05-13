import React, { useMemo, useState, useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check, Pause, Play, X } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboardBots } from "./DashboardBotsContext";

const LIMITS = { messages: 5000, storageMb: 500, bots: 10 };
const ONBOARD_KEY = "botbase_onboarding_steps";
const BANNER_KEY = "botbase_usage_banner_dismissed";

type Onboarding = { upload: boolean; widget: boolean; snippet: boolean };

function loadOnboarding(): Onboarding {
  try {
    const r = localStorage.getItem(ONBOARD_KEY);
    if (!r) return { upload: false, widget: false, snippet: false };
    return { ...JSON.parse(r) };
  } catch {
    return { upload: false, widget: false, snippet: false };
  }
}

const chart7 = [
  { day: "Mon", msgs: 120 },
  { day: "Tue", msgs: 190 },
  { day: "Wed", msgs: 140 },
  { day: "Thu", msgs: 220 },
  { day: "Fri", msgs: 180 },
  { day: "Sat", msgs: 90 },
  { day: "Sun", msgs: 150 },
];

export function DashboardHomePage() {
  const { bots, updateBot } = useDashboardBots();
  const [range, setRange] = useState<"7d" | "30d" | "90d">("7d");
  const [onboarding, setOnboarding] = useState<Onboarding>(loadOnboarding);
  const [bannerDismissed, setBannerDismissed] = useState(
    () => localStorage.getItem(BANNER_KEY) === "1",
  );

  useEffect(() => {
    localStorage.setItem(ONBOARD_KEY, JSON.stringify(onboarding));
  }, [onboarding]);

  const totals = useMemo(() => {
    const active = bots.filter((b) => b.status === "active").length;
    const paused = bots.filter((b) => b.status === "paused").length;
    const messages = bots.reduce((a, b) => a + b.messagesMonth, 0);
    const users = bots.reduce((a, b) => a + b.usersMonth, 0);
    const storage = bots.reduce((a, b) => a + b.storageMb, 0);
    return { active, paused, messages, users, storage };
  }, [bots]);

  const usage = useMemo(() => {
    const m = totals.messages / LIMITS.messages;
    const s = totals.storage / LIMITS.storageMb;
    const b = bots.length / LIMITS.bots;
    return { worst: Math.max(m, s, b) };
  }, [totals, bots.length]);

  const showUsageBanner = !bannerDismissed && usage.worst >= 0.8;
  const onboardingDone = onboarding.upload && onboarding.widget && onboarding.snippet;

  const toggleStep = (key: keyof Onboarding) => {
    setOnboarding((o) => ({ ...o, [key]: !o[key] }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {showUsageBanner && (
          <div
            className="flex items-start justify-between gap-3 rounded-xl border p-4"
            style={{
              borderColor: "var(--border-strong)",
              background: "var(--bg-tertiary)",
            }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                You are approaching a plan limit
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                One or more of messages, storage, or bot count is above 80% of your current plan.
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-lg p-1 hover:bg-[var(--bg-secondary)]"
              aria-label="Dismiss"
              onClick={() => {
                setBannerDismissed(true);
                localStorage.setItem(BANNER_KEY, "1");
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div
          className="flex w-full max-w-md items-center gap-4 rounded-xl border p-4 sm:ml-auto"
          style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-medium text-white"
            style={{ background: "var(--text-primary)" }}
          >
            SK
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Saim Khan
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-default)",
                }}
              >
                Pro plan
              </span>
              <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                Member since Jan 2026
              </span>
            </div>
          </div>
        </div>

        {bots.length > 0 && !onboardingDone && (
          <div
            className="rounded-xl border p-4"
            style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
              Onboarding
            </p>
            <ul className="mt-3 space-y-2">
              {(
                [
                  ["upload", "Upload your first document"],
                  ["widget", "Customize your widget"],
                  ["snippet", "Copy your snippet"],
                ] as const
              ).map(([key, label]) => (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => toggleStep(key)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-[var(--bg-secondary)]"
                    style={{ color: "var(--text-primary)" }}
                  >
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded border"
                      style={{
                        borderColor: "var(--border-default)",
                        background: onboarding[key] ? "var(--text-primary)" : "transparent",
                        color: onboarding[key] ? "white" : "transparent",
                      }}
                    >
                      {onboarding[key] ? <Check size={12} /> : null}
                    </span>
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total bots"
            value={String(bots.length)}
            sub={`${totals.active} active · ${totals.paused} paused`}
          />
          <StatCard
            title="Messages this month"
            value={totals.messages.toLocaleString()}
            sub="Across all bots"
          />
          <StatCard
            title="Unique users this month"
            value={totals.users.toLocaleString()}
            sub="Across all bots"
          />
          <StatCard
            title="Storage used"
            value={`${totals.storage.toFixed(1)} MB / ${LIMITS.storageMb} MB`}
            sub={
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (totals.storage / LIMITS.storageMb) * 100)}%`,
                    background: "var(--text-primary)",
                  }}
                />
              </div>
            }
          />
        </div>

        <div
          className="rounded-xl border p-6"
          style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Activity
            </p>
            <div className="flex gap-2">
              {(["7d", "30d", "90d"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className="rounded-lg px-3 py-1 text-xs font-medium transition-colors"
                  style={{
                    background: range === r ? "var(--text-primary)" : "var(--bg-secondary)",
                    color: range === r ? "white" : "var(--text-secondary)",
                  }}
                >
                  {r === "7d" ? "7 days" : r === "30d" ? "30 days" : "90 days"}
                </button>
              ))}
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart7} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-default)",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="msgs" fill="var(--text-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
            Combined messages (sample) for {range}.
          </p>
        </div>

        <section>
          <h2 className="mb-4 text-lg font-medium tracking-tight" style={{ color: "var(--text-primary)" }}>
            Your bots
          </h2>
          {bots.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center rounded-xl border py-16 text-center"
              style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}
            >
              <div className="mb-4 text-5xl opacity-40">🤖</div>
              <p className="text-base font-medium" style={{ color: "var(--text-primary)" }}>
                Create your first bot
              </p>
              <p className="mt-2 max-w-sm text-sm" style={{ color: "var(--text-secondary)" }}>
                Connect your knowledge, match your brand, and go live with a single snippet.
              </p>
              <Link
                to="/dashboard/bots/new"
                className="mt-6 rounded-xl px-5 py-2.5 text-sm font-medium text-white"
                style={{ background: "var(--text-primary)" }}
              >
                Create bot
              </Link>
              <ul className="mt-8 space-y-2 text-left text-sm" style={{ color: "var(--text-secondary)" }}>
                <li className="flex items-center gap-2">
                  <Check size={16} style={{ color: "var(--success)" }} /> Upload data
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} style={{ color: "var(--success)" }} /> Customize widget
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} style={{ color: "var(--success)" }} /> Copy snippet
                </li>
              </ul>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {bots.map((bot) => (
                <div
                  key={bot.id}
                  className="flex flex-col rounded-xl border p-5"
                  style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                        style={{ background: "var(--bg-secondary)" }}
                      >
                        {bot.emoji}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                          {bot.name}
                        </p>
                        <span
                          className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                          style={{
                            background: bot.status === "active" ? "#F0FDF4" : "#FFFBEB",
                            color: bot.status === "active" ? "var(--success)" : "#B45309",
                          }}
                        >
                          {bot.status === "active" ? "Active" : "Paused"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                    Messages this week:{" "}
                    <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                      {bot.messagesThisWeek.toLocaleString()}
                    </span>
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    <Link
                      to={`/dashboard/bots/${bot.id}`}
                      className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                      style={{ background: "var(--text-primary)" }}
                    >
                      Open
                    </Link>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-[var(--bg-secondary)]"
                      style={{ borderColor: "var(--border-default)", color: "var(--text-primary)" }}
                      onClick={() =>
                        updateBot(bot.id, { status: bot.status === "active" ? "paused" : "active" })
                      }
                      aria-label={bot.status === "active" ? "Pause bot" : "Resume bot"}
                    >
                      {bot.status === "active" ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub }: { title: string; value: string; sub: ReactNode }) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
        {title}
      </p>
      <p className="mt-2 text-2xl font-medium tracking-tight" style={{ color: "var(--text-primary)" }}>
        {value}
      </p>
      <div className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
        {sub}
      </div>
    </div>
  );
}
