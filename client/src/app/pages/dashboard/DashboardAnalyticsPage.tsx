import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const API = "http://localhost:5000/api";

const brandPurple = "#8b5cf6";
const lightPurple = "#ddd6fe";
const lightGray = "#e5e7eb";

interface AnalyticsData {
  totalConversations: number;
  resolutionRate: number;
  unresolvedCount: number;
  avgMessagesPerConv: number;
  resolutionBreakdown: { resolved: number; unresolved: number };
  conversationsOverTime: { label: string; count: number }[];
  perBotPerformance: { name: string; count: string | number; pct: number }[];
}

export function DashboardAnalyticsPage() {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("7d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/dashboard/analytics?range=${range}`, { credentials: "include" });
        const json = await res.json();
        setData(json);
      } catch (err) {
        toast.error("Error Fetching Analytics.Please try again after some time.")
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [range]); // re-fetch when range changes

  // Normalize bar heights relative to max for conversations over time
  const maxCount = Math.max(...(data?.conversationsOverTime?.map(d => d.count) ?? [1]), 1);

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-none">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Analytics</h1>
        <div className="flex shrink-0 gap-1 rounded-xl p-1 bg-white">
          {(["7d", "30d", "90d"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${range === r ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-black/10" : "bg-transparent text-[var(--text-secondary)] border border-transparent"}`}
            >
              {r === "7d" ? "7 days" : r === "30d" ? "30 days" : "90 days"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-[13px] text-[var(--text-tertiary)]">Loading...</p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title="Total Conversations" value={String(data?.totalConversations ?? 0)} delta="In selected period" deltaColor="text-[#3B6D11]" />
            <StatCard title="Resolved by AI" value={`${data?.resolutionRate ?? 0}%`} delta="Of classified conversations" deltaColor="text-[#3B6D11]" />
            <StatCard title="Avg Messages / Conv" value={String(data?.avgMessagesPerConv ?? 0)} delta="Per conversation" deltaColor="text-[#3B6D11]" />
            <StatCard title="Unresolved" value={String(data?.unresolvedCount ?? 0)} delta="Need attention" deltaColor="text-[#A32D2D]" />
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

            {/* Conversations over time */}
            <div className="bg-white rounded-lg border border-black/10 p-4" style={{ borderWidth: "0.5px" }}>
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-6">Conversations over time</h3>
              <div className="flex items-end justify-between h-40 pt-4 px-2">
                {data?.conversationsOverTime?.length === 0 ? (
                  <p className="text-[12px] text-[var(--text-tertiary)] w-full text-center">No data for this period</p>
                ) : (
                  data?.conversationsOverTime?.map((bar, i) => (
                    <div key={i} className="flex flex-col items-center justify-end gap-2 flex-1 group h-full">
                      <div
                        className="w-8 sm:w-12 rounded-t-sm transition-all group-hover:opacity-80"
                        style={{
                          height: `${Math.round((bar.count / maxCount) * 100)}%`,
                          backgroundColor: i === data.conversationsOverTime?.length - 1 ? brandPurple : lightPurple,
                          minHeight: "4px",
                        }}
                      />
                      <span className="text-xs text-[var(--text-secondary)] truncate max-w-[40px]">{bar.label}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Resolution breakdown */}
            <div className="bg-white rounded-lg border border-black/10 p-4" style={{ borderWidth: "0.5px" }}>
              <h3 className="text-[14px] font-medium text-[var(--text-primary)] mb-6">Resolution breakdown</h3>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 h-auto sm:h-40">
                <div className="relative w-32 h-32 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-200" strokeWidth="4" />
                    <circle cx="18" cy="18" r="16" fill="none" stroke={lightGray} strokeWidth="4" strokeDasharray={`${data?.resolutionBreakdown?.unresolved ?? 0} 100`} />
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#7F77DD" strokeWidth="4" strokeDasharray={`${data?.resolutionBreakdown?.resolved ?? 0} 100`} />
                  </svg>
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    { label: "Resolved by AI", value: `${data?.resolutionBreakdown?.resolved ?? 0}%`, color: "#7F77DD" },
                    { label: "Unresolved", value: `${data?.resolutionBreakdown?.unresolved ?? 0}%`, color: lightGray },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[var(--text-secondary)] w-32">{item.label}</span>
                      <span className="font-medium text-[var(--text-primary)]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Per-bot performance */}
            <div className="bg-white rounded-lg border border-black/10 p-4" style={{ borderWidth: "0.5px" }}>
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">Per-bot performance</h3>
              <div className="flex flex-col gap-4 mt-6">
                {data?.perBotPerformance?.length === 0 && (
                  <p className="text-[12px] text-[var(--text-tertiary)] text-center py-4">No data for this period</p>
                )}
                {data?.perBotPerformance?.map((bot, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm text-[var(--text-primary)] w-24 shrink-0 truncate">{bot.name}</span>
                    <div className="flex-1 h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${bot.pct}%`, backgroundColor: i === 0 ? brandPurple : lightPurple }} />
                    </div>
                    <span className="text-xs text-[var(--text-secondary)] w-10 text-right shrink-0">{bot.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Most active bots — replaces "Top unanswered queries" */}
            <div className="bg-white rounded-lg border border-black/10 p-4" style={{ borderWidth: "0.5px" }}>
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">Most active bots</h3>
              <div className="flex flex-col divide-y" style={{ borderWidth: "0.5px 0 0 0" }}>
                {data?.perBotPerformance?.length === 0 && (
                  <p className="text-[12px] text-[var(--text-tertiary)] text-center py-4">No data for this period</p>
                )}
                {data?.perBotPerformance?.slice(0, 5).map((bot, i) => {
                  const badgeColor = bot.pct === 100 ? "bg-red-100 text-red-700" : bot.pct >= 50 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700";
                  return (
                    <div key={i} className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-[var(--text-primary)] flex-1 truncate pr-4">{bot.name}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${badgeColor}`}>
                        {bot.count} convs
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, delta, deltaColor }: { title: string; value: string; delta: string; deltaColor: string }) {
  return (
    <div className="bg-[var(--bg-primary)] rounded-lg p-[14px]">
      <p className="text-[11px] text-[var(--text-tertiary)] mb-1">{title}</p>
      <p className="text-[22px] font-medium text-[var(--text-primary)] leading-tight">{value}</p>
      <p className={`text-[11px] mt-1 ${deltaColor}`}>{delta}</p>
    </div>
  );
}