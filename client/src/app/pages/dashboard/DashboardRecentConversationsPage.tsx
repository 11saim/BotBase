import React, { useEffect, useState, useRef } from "react";
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
  // dropdown visibility state
  const [showBotOptions, setShowBotOptions] = useState(false);
  const [showStatusOptions, setShowStatusOptions] = useState(false);

  // refs for dropdown containers
  const botRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const [rows, setRows] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchConversations = async () => {
      try {
        setLoading(true);
        // ... existing fetch logic remains unchanged ...


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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showBotOptions && botRef.current && !botRef.current.contains(e.target as Node)) {
        setShowBotOptions(false);
      }
      if (showStatusOptions && statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setShowStatusOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBotOptions, showStatusOptions]);

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
          {/* Bot Filter Dropdown - Custom */}
          <div className="relative inline-block" ref={botRef}>
            <button type="button" onClick={() => { setShowBotOptions(!showBotOptions); setShowStatusOptions(false); }} className="w-full flex items-center justify-between px-3 py-1.5 border border-black/10 rounded-lg bg-[var(--bg-primary)] text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] outline-none transition-colors">
              <span className="truncate max-w-[8rem]">{botId === "all" ? "All Bots" : botId === "support" ? "Support Bot" : botId}</span>
              <ChevronDown size={14} className="ml-2 text-[var(--text-tertiary)]" />
            </button>
            {showBotOptions && (
              <ul className="absolute left-0 mt-1 min-w-[8rem] w-auto bg-[var(--bg-primary)] border border-black/10 rounded-md shadow-lg max-h-60 overflow-y-auto z-10 transition-opacity duration-150 ease-out opacity-100">
                <li onClick={() => { setBotId("all"); setShowBotOptions(false); }} className="px-3 py-2 cursor-pointer hover:bg-[var(--bg-secondary)] whitespace-nowrap overflow-hidden text-ellipsis">All Bots</li>
                <li onClick={() => { setBotId("support"); setShowBotOptions(false); }} className="px-3 py-2 cursor-pointer hover:bg-[var(--bg-secondary)] whitespace-nowrap overflow-hidden text-ellipsis">Support Bot</li>
              </ul>
            )}
          </div>
          {/* Status Filter Dropdown - Custom */}
          <div className="relative inline-block ml-2" ref={statusRef}>
            <button type="button" onClick={() => { setShowStatusOptions(!showStatusOptions); setShowBotOptions(false); }} className="w-full flex items-center justify-between px-3 py-1.5 border border-black/10 rounded-lg bg-[var(--bg-primary)] text-[13px] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] outline-none transition-colors">
              <span className="truncate max-w-[8rem]">{status === "all" ? "All Status" : status === "resolved" ? "Resolved" : status === "unresolved" ? "Unanswered" : status}</span>
              <ChevronDown size={14} className="ml-2 text-[var(--text-tertiary)]" />
            </button>
            {showStatusOptions && (
              <ul className="absolute left-0 mt-1 min-w-[8rem] w-auto bg-[var(--bg-primary)] border border-black/10 rounded-md shadow-lg max-h-60 overflow-y-auto z-10 transition-opacity duration-150 ease-out opacity-100">
                <li onClick={() => { setStatus("all"); setShowStatusOptions(false); }} className="px-3 py-2 cursor-pointer hover:bg-[var(--bg-secondary)] whitespace-nowrap overflow-hidden text-ellipsis">All Status</li>
                <li onClick={() => { setStatus("resolved"); setShowStatusOptions(false); }} className="px-3 py-2 cursor-pointer hover:bg-[var(--bg-secondary)] whitespace-nowrap overflow-hidden text-ellipsis">Resolved</li>
                <li onClick={() => { setStatus("unresolved"); setShowStatusOptions(false); }} className="px-3 py-2 cursor-pointer hover:bg-[var(--bg-secondary)] whitespace-nowrap overflow-hidden text-ellipsis">Unanswered</li>
              </ul>
            )}
          </div>
        </div>
        <div className="flex items-center rounded-md border border-black/10 overflow-hidden sm:ml-auto w-full sm:w-auto">
          {/* Period Toggle Buttons */}
          {["All", "Today", "7d", "30d"].map((range) => {
            const value = range.toLowerCase();
            return (
              <button
                key={range}
                onClick={() => setPeriod(value)}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-[13px] font-medium transition-colors border-r border-black/10 last:border-0 ${period === value ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)]' : 'bg-white text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'}`}
              >
                {range}
              </button>
            );
          })}
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

