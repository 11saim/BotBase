import React from "react";
import { ChevronDown } from "lucide-react";

export function DashboardRecentConversationsPage() {
  const mockRows = Array.from({ length: 14 }).map((_, i) => ({
    bot: i % 3 === 0 ? "Support Bot" : i % 3 === 1 ? "Sales Bot" : "Docs Bot",
    preview: "User message preview text that gives some context...",
    timestamp: "Oct 24, 2026, 2:30 PM",
    resolved: i % 4 !== 0,
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-none bg-[var(--bg-primary)] min-h-full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Recent Conversations</h1>
        <p className="text-[13px] mt-1 text-[var(--text-secondary)]">All conversations across your bots</p>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-[var(--border-tertiary)]" style={{ borderWidth: '0 0 0.5px 0' }}>
        <button className="flex items-center gap-2 px-3 py-1.5 border border-black/10 rounded-md text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
          All Bots <ChevronDown size={14} className="text-[var(--text-tertiary)]" />
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 border border-black/10 rounded-md text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
          All Statuses <ChevronDown size={14} className="text-[var(--text-tertiary)]" />
        </button>
        <div className="flex items-center rounded-md border border-black/10 overflow-hidden ml-auto">
          {["Today", "7d", "30d"].map((range, i) => (
            <button key={range} className={`px-3 py-1.5 text-[13px] font-medium transition-colors border-r border-black/10 last:border-0 ${i === 1 ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)]' : 'bg-white text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}>
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Table/List */}
      <div className="flex flex-col">
        {mockRows.map((row, i) => (
          <div key={i} className="flex items-center gap-4 py-4 border-b border-[var(--border-tertiary)] last:border-0 group" style={{ borderWidth: '0 0 0.5px 0' }}>
            <div className="shrink-0 w-[100px]">
              <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "#EEEDFE", color: "#534AB7" }}>
                {row.bot}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-[var(--text-primary)] truncate">{row.preview}</p>
            </div>
            <div className="shrink-0 w-[140px] text-right">
              <span className="text-[12px] text-[var(--text-tertiary)]">{row.timestamp}</span>
            </div>
            <div className="shrink-0 w-[90px] text-center">
              <span className="text-[11px] px-2 py-0.5 rounded-full" style={row.resolved ? { backgroundColor: '#EAF3DE', color: '#3B6D11' } : { backgroundColor: '#FCEBEB', color: '#A32D2D' }}>
                {row.resolved ? 'Resolved' : 'Unanswered'}
              </span>
            </div>
            <div className="shrink-0 w-[80px] text-right">
              <button className="text-[12px] font-medium px-3 py-1.5 border border-black/10 rounded-md text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors opacity-0 group-hover:opacity-100">
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
