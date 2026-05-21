import React, { useState } from "react";

export function DashboardAnalyticsPage() {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("7d");

  const brandPurple = "#8b5cf6";
  const lightPurple = "#ddd6fe";
  const brandTeal = "#0d9488";
  const lightGray = "#e5e7eb";

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-none">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Analytics</h1>
        <div className="flex shrink-0 gap-1 rounded-xl p-1 bg-white">
          {(["7d", "30d", "90d"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${range === r ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-black/10' : 'bg-transparent text-[var(--text-secondary)] border border-transparent'}`}
            >
              {r === "7d" ? "7 days" : r === "30d" ? "30 days" : "90 days"}
            </button>
          ))}
        </div>
      </div>

      {/* Top Row: 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Conversations" value="1,248" delta="↑ 12%" deltaColor="text-[#3B6D11]" />
        <StatCard title="Resolved by AI" value="91%" delta="↑ 4%" deltaColor="text-[#3B6D11]" />
        <StatCard title="Avg. Session Length" value="1m 42s" delta="↑ 18s" deltaColor="text-[#3B6D11]" />
        <StatCard title="Unanswered Queries" value="42" delta="↑ 14" deltaColor="text-[#A32D2D]" />
      </div>

      {/* Second Row: 2 equal columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Conversations over time */}
        <div className="bg-white rounded-lg border border-black/10 p-4" style={{ borderWidth: '0.5px' }}>
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-6">Conversations over time</h3>
          <div className="flex items-end justify-between h-40 pt-4 px-2">
            {[
              { label: "W1", height: 40, color: lightPurple },
              { label: "W2", height: 60, color: lightPurple },
              { label: "W3", height: 45, color: lightPurple },
              { label: "W4", height: 85, color: brandPurple },
            ].map((bar, i) => (
              <div key={i} className="flex flex-col items-center justify-end gap-2 flex-1 group h-full">
                <div
                  className="w-8 sm:w-12 rounded-t-sm transition-all group-hover:opacity-80"
                  style={{ height: `${bar.height}%`, backgroundColor: bar.color }}
                />
                <span className="text-xs text-[var(--text-secondary)]">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution breakdown */}
        <div className="bg-white rounded-lg border border-black/10 p-4" style={{ borderWidth: '0.5px' }}>
          <h3 className="text-[14px] font-medium text-[var(--text-primary)] mb-6">Resolution breakdown</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 h-auto sm:h-40">
            {/* Donut SVG mock */}
            <div className="relative w-32 h-32 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-200" strokeWidth="4" />
                {/* Unanswered (3%) */}
                <circle cx="18" cy="18" r="16" fill="none" stroke={lightGray} strokeWidth="4" strokeDasharray="100 100" />
                {/* Escalated (6%) */}
                <circle cx="18" cy="18" r="16" fill="none" stroke="#1D9E75" strokeWidth="4" strokeDasharray="97 100" />
                {/* Resolved (91%) */}
                <circle cx="18" cy="18" r="16" fill="none" stroke="#7F77DD" strokeWidth="4" strokeDasharray="91 100" />
              </svg>
            </div>
            {/* Legend */}
            <div className="flex flex-col gap-3">
              {[
                { label: "Resolved by AI", value: "91%", color: "#7F77DD" },
                { label: "Escalated", value: "6%", color: "#1D9E75" },
                { label: "Unanswered", value: "3%", color: lightGray },
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

      {/* Third Row: 2 equal columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per-bot performance */}
        <div className="bg-white rounded-lg border border-black/10 p-4" style={{ borderWidth: '0.5px' }}>
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">Per-bot performance</h3>
          <div className="flex flex-col gap-4 mt-6">
            {[
              { name: "Support Bot", count: "1.2k", pct: 100, color: brandPurple },
              { name: "Sales Bot", count: "856", pct: 71, color: lightPurple },
              { name: "Docs Bot", count: "423", pct: 35, color: lightPurple },
              { name: "HR Helper", count: "128", pct: 10, color: lightPurple },
            ].map((bot, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm text-[var(--text-primary)] w-24 shrink-0 truncate">{bot.name}</span>
                <div className="flex-1 h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${bot.pct}%`, backgroundColor: bot.color }} />
                </div>
                <span className="text-xs text-[var(--text-secondary)] w-10 text-right shrink-0">{bot.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top unanswered queries */}
        <div className="bg-white rounded-lg border border-black/10 p-4" style={{ borderWidth: '0.5px' }}>
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">Top unanswered queries</h3>
          <div className="flex flex-col divide-y border-black/5" style={{ borderWidth: '0.5px 0 0 0' }}>
            {[
              { q: "Enterprise pricing volume discount", freq: 12 },
              { q: "How to integrate with Salesforce?", freq: 9 },
              { q: "SSO SAML configuration steps", freq: 6 },
              { q: "Refund policy for annual plans", freq: 4 },
              { q: "Can I self-host the widget?", freq: 2 },
            ].map((item, i) => {
              let badgeColor = "bg-gray-100 text-gray-700";
              if (item.freq >= 8) badgeColor = "bg-red-100 text-red-700";
              else if (item.freq >= 4) badgeColor = "bg-amber-100 text-amber-700";

              return (
                <div key={i} className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-[var(--text-primary)] flex-1 truncate pr-4">{item.q}</span>
                  <span className={`text-[10px] font-medium w-6 h-6 flex items-center justify-center rounded-full shrink-0 ${badgeColor}`}>
                    {item.freq}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
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
