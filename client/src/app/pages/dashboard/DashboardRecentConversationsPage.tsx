import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

type Conversation = {
  bot: string;
  preview: string;
  timestamp: string;
  resolved: boolean;
};

const API = "http://localhost:5000/api/";

export function DashboardRecentConversationsPage() {
  const [botId, setBotId] = useState("all");
  const [status, setStatus] = useState("all");
  const [period, setPeriod] = useState("all");

  const [rows, setRows] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchConversations = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${API}conversations?botId=${botId}&status=${status}&period=${period}`,
          { credentials: "include", signal: controller.signal }
        );

        const data = await res.json();
        setRows(data.conversations || []);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch conversations:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    return () => controller.abort();
  }, [botId, status, period]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-none bg-[var(--bg-primary)] min-h-full">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Recent Conversations</h1>
        <p className="text-[13px] mt-1 text-[var(--text-secondary)]">All conversations across your bots</p>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 mb-6 pb-6 border-b border-[var(--border-tertiary)]" style={{ borderWidth: '0 0 0.5px 0' }}>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button onClick={() => setBotId(botId === "all" ? "support" : "all")} className="flex items-center gap-2 px-3 py-1.5 border border-black/10 rounded-md text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
            All Bots <ChevronDown size={14} className="text-[var(--text-tertiary)]" />
          </button>
          <button onClick={() => setStatus(status === "all" ? "resolved" : "all")} className="flex items-center gap-2 px-3 py-1.5 border border-black/10 rounded-md text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
            All Status <ChevronDown size={14} className="text-[var(--text-tertiary)]" />
          </button>
        </div>
        <div className="flex items-center rounded-md border border-black/10 overflow-hidden sm:ml-auto w-full sm:w-auto">
          {["All", "Today", "7d", "30d"].map((range) => (
            <button key={range} onClick={() => setPeriod(range)} className={`flex-1 sm:flex-none px-3 py-1.5 text-[13px] font-medium transition-colors border-r border-black/10 last:border-0 ${period === range ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)]' : 'bg-white text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}>
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex flex-col">
        {loading ? (
          <div className="text-sm text-gray-500 py-4">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No Conversations Found</p>
          </div>
        ) : (
          rows.map((row, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center gap-2 py-4 border-b"
            >
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#EEEDFE] text-[#534AB7]">
                {row.bot}
              </span>

              <div className="flex-1">
                <p className="text-[13px] truncate">{row.preview}</p>
                <p className="text-[11px] text-gray-500 sm:hidden">
                  {row.timestamp}
                </p>
              </div>

              <div className="hidden sm:block w-[140px] text-right text-[12px] text-gray-500">
                {row.timestamp}
              </div>

              <div className="text-[11px]">
                {row.resolved ? "Resolved" : "Unanswered"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

