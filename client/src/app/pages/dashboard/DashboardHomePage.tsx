import React from "react";
import { Link } from "react-router-dom";
import { useDashboardBots } from "./DashboardBotsContext";

export function DashboardHomePage() {
  const { bots } = useDashboardBots();

  const mockRecentActivity = [
    { type: "msg", action: "Support Bot answered a query", time: "Just now" },
    { type: "bot", action: "New bot 'HR Helper' created", time: "2 hours ago" },
    { type: "warn", action: "Sales Bot escalated to human", time: "5 hours ago" },
    { type: "milestone", action: "Support Bot hit 1,000 messages", time: "1 day ago" },
  ];

  const mockTopBots = [
    { name: "Support Bot", count: "1.2k", value: 100, color: "#8b5cf6", bg: "#7F77DD" },
    { name: "Sales Bot", count: "856", value: 71, color: "#0d9488", bg: "#AFA9EC" },
    { name: "Docs Bot", count: "423", value: 35, color: "#d97706", bg: "#AFA9EC" },
  ];

  const mockRecentConversations = [
    { bot: "Support Bot", text: "How do I reset my password?", time: "2m ago", resolved: true },
    { bot: "Sales Bot", text: "Pricing for enterprise team", time: "15m ago", resolved: false },
    { bot: "Support Bot", text: "Billing issue with latest invoice", time: "1h ago", resolved: true },
    { bot: "Docs Bot", text: "Where is the API documentation?", time: "2h ago", resolved: true },
    { bot: "HR Helper", text: "Holiday policy 2026", time: "3h ago", resolved: false },
    { bot: "Support Bot", text: "Can I get a refund?", time: "4h ago", resolved: true },
    { bot: "Sales Bot", text: "I want to upgrade my plan", time: "5h ago", resolved: true },
    { bot: "Docs Bot", text: "How to use webhooks?", time: "6h ago", resolved: false },
  ];

  function greetingName(): string {
    const h = new Date().getHours();
    const part = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    return `${part}, Saim`;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* Welcome Message */}
        <div style={{ marginBottom: '18px' }}>
          <h1 className="text-[16px] font-medium text-[var(--text-primary)]">
            {greetingName()}
          </h1>
          <p className="text-[12px] text-[var(--text-tertiary)] mt-1">
            Here's what's happening across your bots today
          </p>
        </div>

        {/* TOP ROW */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Bots" value={String(bots.length)} delta="↑ 1 new this week" isPositive={true} />
          <StatCard title="Conversations Today" value="342" delta="↑ 24% vs yesterday" isPositive={true} />
          <StatCard title="Avg. Response Time" value="1.2s" delta="↑ 0.3s faster" isPositive={true} />
          <StatCard title="Unanswered Queries" value="12" delta="↑ 4 need attention" isPositive={false} />
        </div>

        {/* MIDDLE ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="rounded-2xl border p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] bg-[var(--bg-primary)] border-[var(--border-default)]">
            <div className="flex items-center gap-2 mb-4 text-[var(--text-primary)]">
              <i className="ti ti-activity text-[16px]" />
              <h3 className="text-[14px] font-semibold tracking-tight">Recent activity</h3>
            </div>
            <div className="flex flex-col divide-y divide-[var(--border-tertiary)]" style={{ borderColor: 'var(--border-tertiary)' }}>
              {mockRecentActivity.map((item, i) => {
                let iconClass, bg, color;
                if (item.type === "msg") {
                  iconClass = "ti-message"; bg = "#E6F1FB"; color = "#185FA5";
                } else if (item.type === "bot") {
                  iconClass = "ti-robot"; bg = "#EEEDFE"; color = "#534AB7";
                } else if (item.type === "warn") {
                  iconClass = "ti-alert-triangle"; bg = "#FAEEDA"; color = "#854F0B";
                } else {
                  iconClass = "ti-trophy"; bg = "#EAF3DE"; color = "#3B6D11";
                }

                return (
                  <div key={i} className="flex items-center gap-3 py-3 border-black/5" style={{ borderWidth: i === 0 ? 0 : '0.5px' }}>
                    <div className="w-[26px] h-[26px] rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: bg, color: color }}>
                      <i className={`ti ${iconClass} text-[14px]`} />
                    </div>
                    <div>
                      <p className="text-[12px] text-[var(--text-primary)]">{item.action}</p>
                      <p className="text-[11px] text-[var(--text-tertiary)]">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Bots This Week */}
          <div className="rounded-2xl border p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] bg-[var(--bg-primary)] border-[var(--border-default)]">
            <div className="flex items-center gap-2 mb-4 text-[var(--text-primary)]">
              <i className="ti ti-trophy text-[16px]" />
              <h3 className="text-[14px] font-semibold tracking-tight">Top bots this week</h3>
            </div>
            <div className="flex flex-col divide-y divide-[var(--border-tertiary)]" style={{ borderColor: 'var(--border-tertiary)' }}>
              {mockTopBots.map((bot, i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-black/5" style={{ borderWidth: i === 0 ? 0 : '0.5px' }}>
                  <div className="w-[28px] h-[28px] rounded-md flex items-center justify-center shrink-0 text-white text-[11px] font-bold" style={{ backgroundColor: bot.color }}>
                    {bot.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="w-24 shrink-0">
                    <p className="text-[12px] font-medium text-[var(--text-primary)] truncate">{bot.name}</p>
                    <p className="text-[11px] text-[var(--text-secondary)]">{bot.count}</p>
                  </div>
                  <div className="flex-1 h-[6px] bg-[#f0f0f0] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${bot.value}%`, backgroundColor: bot.bg }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="w-full rounded-2xl border shadow-[0_1px_3px_rgba(0,0,0,0.04)] bg-[var(--bg-primary)] border-[var(--border-default)] flex flex-col overflow-hidden">
          <div className="p-6 pb-2">
            <div className="flex items-center gap-2 text-[var(--text-primary)]">
              <i className="ti ti-messages text-[16px]" />
              <h3 className="text-[14px] font-semibold tracking-tight">Recent conversations</h3>
            </div>
          </div>
          <div className="flex-1 flex flex-col divide-y divide-[var(--border-tertiary)]" style={{ borderColor: 'var(--border-tertiary)' }}>
            {mockRecentConversations.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-[var(--bg-secondary)] transition-colors border-black/5" style={{ borderWidth: i === 0 ? 0 : '0.5px' }}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "#EEEDFE", color: "#534AB7" }}>
                    {item.bot}
                  </span>
                  <span className="text-[12px] text-[var(--text-primary)] truncate" style={{ maxWidth: '60%' }}>
                    {item.text}
                  </span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-[11px] text-[var(--text-tertiary)] text-right w-16">
                    {item.time}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full w-20 text-center" style={item.resolved ? { backgroundColor: '#EAF3DE', color: '#3B6D11' } : { backgroundColor: '#FCEBEB', color: '#A32D2D' }}>
                    {item.resolved ? 'Resolved' : 'Unanswered'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 flex justify-end">
            <Link to="/dashboard/analytics" className="px-4 py-2 text-[13px] font-medium text-[var(--text-primary)] border border-black/10 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors">
              View full analytics &rarr;
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, delta, isPositive }: { title: string; value: string; delta: string; isPositive: boolean }) {
  return (
    <div className="rounded-2xl border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] bg-[var(--bg-primary)] border-[var(--border-default)]">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{title}</p>
      <p className="mt-2 text-[22px] font-medium tracking-tight text-[var(--text-primary)]">{value}</p>
      <p className="text-[11px] mt-1" style={{ color: isPositive ? '#3B6D11' : '#A32D2D', backgroundColor: 'transparent' }}>
        {delta}
      </p>
    </div>
  );
}
