import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Activity, MessageSquare, Bot, AlertTriangle, Trophy, MessagesSquare, Zap } from "lucide-react";
import { toast } from "sonner";
import { PaymentSuccessModal } from "../../components/PaymentSuccessModal";

import { API_URL } from "../../lib/config";
import { authFetch } from "../../lib/authFetch";

const API = API_URL;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Stats {
  totalBots: number;
  conversationsToday: number;
  resolutionRate: number;
  messagesUsed: number;
}

interface ActivityItem {
  _id: string;
  eventType: string;
  title: string;
  createdAt: string;
}

interface TopBot {
  id: string;
  name: string;
  count: number;
  value: number;
}

interface RecentConversation {
  _id: string;
  label: string;
  isResolved: boolean;
  lastMessageAt: string;
  botId: { _id: string; name: string };
}

// ─── Event type → icon + colors ───────────────────────────────────────────────
function getActivityStyle(eventType: string) {
  if (eventType.startsWith("bot_")) return { Icon: Bot, bg: "#EEEDFE", color: "#534AB7" };
  if (eventType.startsWith("source_")) return { Icon: Zap, bg: "#EAF3DE", color: "#3B6D11" };
  if (eventType.startsWith("plan_")) return { Icon: AlertTriangle, bg: "#FAEEDA", color: "#854F0B" };
  if (eventType.startsWith("conversation_")) return { Icon: MessageSquare, bg: "#E6F1FB", color: "#185FA5" };
  if (eventType.includes("messages")) return { Icon: Trophy, bg: "#EAF3DE", color: "#3B6D11" };
  return { Icon: Activity, bg: "#F3F3F3", color: "#555" };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function greetingName(): string {
  const h = new Date().getHours();
  const part = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return `${part}`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function DashboardHomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [topBots, setTopBots] = useState<TopBot[]>([]);
  const [conversations, setConversations] = useState<RecentConversation[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) return;

    // Clean the URL immediately so it doesn't re-trigger
    searchParams.delete("session_id");
    setSearchParams(searchParams, { replace: true });

    // Verify the session with the backend
    const verifyPayment = async () => {
      try {
        const res = await authFetch(
          `${API}/stripe/verify-session/${sessionId}`
        );
        const data = await res.json();
        if (data.success) {
          setShowPaymentSuccess(true);
        }
      } catch {
        // Silently fail — don't show the modal for fake/invalid sessions
      }
    };

    verifyPayment();
  }, []);

  const BOT_COLORS = ["#8b5cf6", "#0d9488", "#d97706", "#e11d48", "#2563eb"];

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, activityRes, topBotsRes, convsRes, usageRes] = await Promise.all([
          authFetch(`${API}/dashboard/stats`),
          authFetch(`${API}/dashboard/recent-activity`),
          authFetch(`${API}/dashboard/top-bots`),
          authFetch(`${API}/conversations?period=today&status=all&botId=all`),
          authFetch(`${API}/dashboard/usage`),
        ]);

        const [statsData, activityData, topBotsData, convsData, usageData] = await Promise.all([
          statsRes.json(), activityRes.json(), topBotsRes.json(), convsRes.json(), usageRes.json(),
        ]);

        setStats({
          totalBots: statsData.totalBots,
          conversationsToday: statsData.conversationsToday,
          resolutionRate: statsData.resolutionRate,
          messagesUsed: usageData.usage.messagesUsed,
        });
        setActivity(activityData.activity || []);
        setTopBots(topBotsData.topBots || []);
        setConversations((convsData.conversations || []).slice(0, 8));
      } catch (err) {
        toast.error("Error Fetching Dashboard Data.Please try again after some time.")
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-[13px] text-[var(--text-tertiary)]">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <PaymentSuccessModal
        open={showPaymentSuccess}
        onClose={() => setShowPaymentSuccess(false)}
      />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">

          {/* Welcome */}
          <div style={{ marginBottom: "18px" }}>
            <h1 className="text-[16px] font-medium text-[var(--text-primary)]">{greetingName()}</h1>
            <p className="text-[12px] text-[var(--text-tertiary)] mt-1">Here's what's happening across your bots today</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Bots" value={String(stats?.totalBots ?? 0)} delta="Active bots" isPositive={true} />
            <StatCard title="Conversations Today" value={String(stats?.conversationsToday ?? 0)} delta="Since midnight" isPositive={true} />
            <StatCard title="Resolution Rate" value={`${stats?.resolutionRate ?? 0}%`} delta="Of all classified conversations" isPositive={true} />
            <StatCard title="Messages This Month" value={String(stats?.messagesUsed ?? 0)} delta="Toward your plan limit" isPositive={true} />
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Recent Activity */}
            <div className="rounded-2xl border p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] bg-[var(--bg-primary)] border-[var(--border-default)]">
              <div className="flex items-center gap-2 mb-4 text-[var(--text-primary)]">
                <Activity size={16} />
                <h3 className="text-[14px] font-semibold tracking-tight">Recent activity</h3>
              </div>
              <div className="flex flex-col divide-y divide-[var(--border-tertiary)] max-h-[320px] overflow-y-auto">
                {activity.length === 0 && (
                  <p className="text-[12px] text-[var(--text-tertiary)] py-4 text-center">No activity yet</p>
                )}
                {activity.map((item) => {
                  const { Icon, bg, color } = getActivityStyle(item.eventType);
                  return (
                    <div key={item._id} className="flex items-center gap-3 py-3">
                      <div className="w-[26px] h-[26px] rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: bg, color }}>
                        <Icon size={14} />
                      </div>
                      <div>
                        <p className="text-[12px] text-[var(--text-primary)]">{item.title}</p>
                        <p className="text-[11px] text-[var(--text-tertiary)]">{timeAgo(item.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Bots */}
            <div className="relative rounded-2xl border p-6 pb-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)] bg-[var(--bg-primary)] border-[var(--border-default)] flex flex-col">
              <div className="flex items-center gap-2 mb-4 text-[var(--text-primary)]">
                <Trophy size={16} />
                <h3 className="text-[14px] font-semibold tracking-tight">Top bots this week</h3>
              </div>
              <div className="flex flex-col divide-y divide-[var(--border-tertiary)]">
                {topBots.length === 0 && (
                  <p className="text-[12px] text-[var(--text-tertiary)] py-4 text-center">No conversations yet</p>
                )}
                {topBots.map((bot, i) => (
                  <div key={bot.id} className="flex items-center gap-3 py-3">
                    <div className="w-[28px] h-[28px] rounded-md flex items-center justify-center shrink-0 text-white text-[11px] font-bold" style={{ backgroundColor: BOT_COLORS[i % BOT_COLORS.length] }}>
                      {bot.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="w-24 shrink-0">
                      <p className="text-[12px] font-medium text-[var(--text-primary)] truncate">{bot.name}</p>
                      <p className="text-[11px] text-[var(--text-secondary)]">{bot.count} convs</p>
                    </div>
                    <div className="flex-1 h-[6px] bg-[#f0f0f0] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${bot.value}%`, backgroundColor: BOT_COLORS[i % BOT_COLORS.length] }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 flex justify-end mt-auto">
                <Link to="/dashboard/analytics" className="px-4 py-2 text-[13px] font-medium text-[var(--text-primary)] border border-black/10 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors">
                  View all analytics &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Conversations */}
          <div className="w-full rounded-2xl border shadow-[0_1px_3px_rgba(0,0,0,0.04)] bg-[var(--bg-primary)] border-[var(--border-default)] flex flex-col overflow-hidden">
            <div className="p-6 pb-2">
              <div className="flex items-center gap-2 text-[var(--text-primary)]">
                <MessagesSquare size={16} />
                <h3 className="text-[14px] font-semibold tracking-tight">Recent conversations</h3>
              </div>
            </div>
            <div className="flex-1 flex flex-col divide-y divide-[var(--border-tertiary)]">
              {conversations.length === 0 && (
                <p className="text-[12px] text-[var(--text-tertiary)] p-6 text-center">No conversations today</p>
              )}
              {conversations.map((item, i) => (
                <div key={item._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 p-4 hover:bg-[var(--bg-secondary)] transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "#EEEDFE", color: "#534AB7" }}>
                      {item.botId?.name}
                    </span>
                    <span className="text-[12px] text-[var(--text-primary)] truncate">
                      {item.label || "Conversation"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <span className="text-[11px] text-[var(--text-tertiary)] w-16 text-right">
                      {timeAgo(item.lastMessageAt)}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full w-20 text-center" style={item.isResolved ? { backgroundColor: "#EAF3DE", color: "#3B6D11" } : { backgroundColor: "#FCEBEB", color: "#A32D2D" }}>
                      {item.isResolved ? "Resolved" : "Unresolved"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 flex justify-end">
              <Link to="/dashboard/recent-conversations" className="px-4 py-2 text-[13px] font-medium text-[var(--text-primary)] border border-black/10 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors">
                View all conversations &rarr;
              </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

function StatCard({ title, value, delta, isPositive }: { title: string; value: string; delta: string; isPositive: boolean }) {
  return (
    <div className="rounded-2xl border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] bg-[var(--bg-primary)] border-[var(--border-default)]">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{title}</p>
      <p className="mt-2 text-[22px] font-medium tracking-tight text-[var(--text-primary)]">{value}</p>
      <p className="text-[11px] mt-1" style={{ color: isPositive ? "#3B6D11" : "#A32D2D" }}>{delta}</p>
    </div>
  );
}