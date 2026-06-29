import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

function buildTimeBuckets(range: "7d" | "30d" | "90d"): { label: string; shortLabel: string }[] {
  const now = new Date();
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const buckets: { label: string; shortLabel: string }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    buckets.push({
      label: `${y}-${m}-${day}`,
      shortLabel: `${monthNames[d.getMonth()]} ${d.getDate()}`,
    });
  }
  return buckets;
}

function mergeTimeData(range: "7d" | "30d" | "90d", backendData: { label: string; count: number }[]): { label: string; shortLabel: string; count: number }[] {
  const buckets = buildTimeBuckets(range);
  const countMap: Record<string, number> = {};
  backendData.forEach((d) => {
    countMap[d.label] = (countMap[d.label] || 0) + d.count;
  });
  return buckets.map((b) => ({ label: b.label, shortLabel: b.shortLabel, count: countMap[b.label] || 0 }));
}

export function DashboardAnalyticsPage() {
  const navigate = useNavigate();
  const [range, setRange] = useState<"7d" | "30d" | "90d">("7d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/dashboard/analytics?range=${range}`, { credentials: "include" });
        const json = await res.json();
        const total = json.resolution?.total ?? 1;
        const resolved = json.resolution?.resolved ?? 0;
        const unresolved = json.resolution?.unresolved ?? 0;
        setData({
          totalConversations: json.stats?.totalConversations ?? 0,
          resolutionRate: json.stats?.resolutionRate ?? 0,
          unresolvedCount: json.stats?.unresolvedCount ?? 0,
          avgMessagesPerConv: json.stats?.avgMessagesPerConversation ?? 0,
          resolutionBreakdown: {
            resolved: total > 0 ? Math.round((resolved / total) * 100) : 0,
            unresolved: total > 0 ? Math.round((unresolved / total) * 100) : 0,
          },
          conversationsOverTime: json.overTime ?? [],
          perBotPerformance: json.perBot ?? [],
        });
      } catch (err) {
        toast.error("Error Fetching Analytics.Please try again after some time.")
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [range]); // re-fetch when range changes

  // Normalize bar heights relative to max for conversations over time
  const chartData = mergeTimeData(range, data?.conversationsOverTime ?? []);
  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  // Line chart dimensions
  const chartW = 500;
  const chartH = 150;
  const padX = 10;
  const padY = 20;
  const plotW = chartW - padX * 2;
  const plotH = chartH - padY * 2;

  const points = chartData.map((d, i) => {
    const dateParts = d.label.split("-");
    const fullDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0].slice(2)}`;
    const isHigh = (padY + plotH - (d.count / maxCount) * plotH) < padY + 40;
    const isLeftEdge = i <= 1;
    const isRightEdge = i >= chartData.length - 2;
    return {
      x: padX + (i / Math.max(chartData.length - 1, 1)) * plotW,
      y: padY + plotH - (d.count / maxCount) * plotH,
      count: d.count,
      shortLabel: d.shortLabel,
      fullDate,
      tooltipBelow: isHigh,
      tooltipX: isLeftEdge ? 30 : isRightEdge ? chartW - 30 : undefined,
    };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Show every Nth label to avoid clutter
  const labelInterval = range === "7d" ? 1 : range === "30d" ? 5 : 15;

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-none" style={{ overflow: "visible" }}>

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6" style={{ overflow: "visible" }}>

            {/* Conversations over time */}
            <div className="bg-white rounded-lg border border-black/10 p-4" style={{ borderWidth: "0.5px", overflow: "visible" }}>
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">Conversations over time</h3>
              {chartData.length === 0 ? (
                <p className="text-[12px] text-[var(--text-tertiary)] w-full text-center py-10">No data for this period</p>
              ) : (
                <div className="overflow-x-auto" style={{ overflow: "visible" }}>
                  <style>{`
                    .dot-group .dot-visible { opacity: 0; transition: opacity 0.15s; }
                    .dot-group .dot-tooltip { opacity: 0; transition: opacity 0.15s; }
                    .dot-group:hover .dot-visible { opacity: 1; }
                    .dot-group:hover .dot-tooltip { opacity: 1; }
                    .chart-wrap { overflow: visible !important; }
                    .chart-wrap svg { overflow: visible !important; }
                  `}</style>
                  <svg viewBox={`0 0 ${chartW} ${chartH + 24}`} className="w-full" style={{ minWidth: range === "90d" ? "400px" : "auto", overflow: "visible" }}>
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
                      <line
                        key={pct}
                        x1={padX}
                        y1={padY + plotH * (1 - pct)}
                        x2={chartW - padX}
                        y2={padY + plotH * (1 - pct)}
                        stroke="#f0f0f0"
                        strokeWidth="1"
                      />
                    ))}

                    {/* Area fill */}
                    <path
                      d={`${linePath} L ${points[points.length - 1].x} ${padY + plotH} L ${points[0].x} ${padY + plotH} Z`}
                      fill="url(#areaGradient)"
                      opacity="0.3"
                    />

                    {/* Line */}
                    <path
                      d={linePath}
                      fill="none"
                      stroke={brandPurple}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Dots + hover areas */}
                    {points.map((p, i) => {
                      const tx = p.tooltipX ?? p.x;
                      const ty = p.tooltipBelow ? p.y + 18 : p.y - 36;
                      return (
                        <g key={i} className="dot-group" style={{ cursor: "pointer" }}>
                          <circle cx={p.x} cy={p.y} r="10" fill="transparent" />
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="3"
                            fill={brandPurple}
                            stroke="white"
                            strokeWidth="1.5"
                            className="dot-visible"
                            style={{ pointerEvents: "none" }}
                          />
                          <g className="dot-tooltip" style={{ pointerEvents: "none" }}>
                            <rect
                              x={tx - 32}
                              y={ty}
                              width="64"
                              height="30"
                              rx="4"
                              fill="var(--text-primary, #1f2937)"
                            />
                            <text
                              x={tx}
                              y={ty + 13}
                              textAnchor="middle"
                              fill="white"
                              fontSize="9"
                              fontWeight="600"
                            >
                              {p.count} conv{p.count !== 1 ? "s" : ""}
                            </text>
                            <text
                              x={tx}
                              y={ty + 24}
                              textAnchor="middle"
                              fill="#d1d5db"
                              fontSize="7.5"
                            >
                              {p.fullDate}
                            </text>
                          </g>
                        </g>
                      );
                    })}

                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={brandPurple} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={brandPurple} stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* X-axis labels */}
                    {points.map((p, i) => (
                      i % labelInterval === 0 && (
                        <text
                          key={i}
                          x={p.x}
                          y={chartH + 14}
                          textAnchor="middle"
                          fill="#9ca3af"
                          fontSize="8"
                        >
                          {p.shortLabel}
                        </text>
                      )
                    ))}
                  </svg>
                </div>
              )}
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

            {/* Top unanswered questions */}
            <div className="bg-white rounded-lg border border-black/10 p-4 relative overflow-hidden" style={{ borderWidth: "0.5px" }}>
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">Top unanswered questions</h3>
              <div className="flex flex-col gap-3 blur-[6px] select-none pointer-events-none">
                {["How do I export my data?", "Can I integrate with Slack?", "What languages are supported?", "How to reset my password?", "Is there an API available?"].map((q, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-black/5 last:border-0">
                    <span className="text-[11px] font-medium text-[var(--text-tertiary)] w-5 shrink-0">{i + 1}.</span>
                    <span className="text-[13px] text-[var(--text-primary)]">{q}</span>
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                <button
                  onClick={() => navigate("/dashboard/usage")}
                  className="px-5 py-2.5 rounded-lg bg-[var(--text-primary)] text-white text-[13px] font-medium hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  Upgrade to view
                </button>
              </div>
            </div>

            {/* Most active bots */}
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