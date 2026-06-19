import React, { useEffect, useMemo, useState } from "react";
import {
  Link,
  Navigate,
  Outlet,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { CreditCard, LayoutGrid, Menu, MoreHorizontal, Plus, Search, X, Bot as BotIcon, BarChart2, MessageSquare } from "lucide-react";
import { CreateBotWizardModal } from "./CreateBotWizardModal";

const API = "http://localhost:5000/api";

// ─── Types matching the real API response ──────────────────────────────────────
interface WidgetConfig {
  position: string; launcherSize: string; launcherShape: string; launcherColor: string;
  tooltipText: string;[key: string]: any;
}

interface Bot {
  _id: string;
  name: string;
  description: string;
  botAvatar: string;
  status: "active" | "paused" | "locked" | "deleted";
  conversationCount: number;
  widgetConfig: WidgetConfig;
  createdAt: string;
  updatedAt: string;
}

interface UsageData {
  plan: string;
  usage: { messagesUsed: number; botsCreated: number; sourcesUploaded: number };
  limits: { messagesPerMonth: number; bots: number; sources: number };
}

interface User {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
}

function greetingName(name?: string): string {
  const h = new Date().getHours();
  const part = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return name ? `${part}, ${name.split(" ")[0]}` : part;
}

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

function DashboardFrame() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const createOpen = searchParams.get("create") === "1";
  const isHome = location.pathname === "/dashboard" || location.pathname === "/dashboard/";
  const isBotWorkspace = Boolean(location.pathname.match(/\/dashboard\/bots\/[^/]+$/));

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [botsRes, usageRes, meRes] = await Promise.all([
          fetch(`${API}/bots`, { credentials: "include" }),
          fetch(`${API}/dashboard/usage`, { credentials: "include" }),
          fetch(`${API}/auth/me`, { credentials: "include" }),
        ]);

        const [botsData, usageData, meData] = await Promise.all([
          botsRes.json(), usageRes.json(), meRes.json(),
        ]);

        setBots(botsData.bots || []);
        setUsage(usageRes.ok ? usageData : null);
        setUser(meRes.ok ? meData.user : null);
      } catch (err) {
        console.error("Dashboard shell fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const setCreateWizardOpen = (open: boolean) => {
    setSearchParams((prev) => {
      const n = new URLSearchParams(prev);
      if (open) n.set("create", "1"); else n.delete("create");
      return n;
    }, { replace: true });
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutGrid },
    { label: "All Bots", path: "/dashboard/bots", icon: BotIcon },
    { label: "Analytics", path: "/dashboard/analytics", icon: BarChart2 },
    { label: "Plan & Usage", path: "/dashboard/usage", icon: CreditCard },
    { label: "Recent Conversations", path: "/dashboard/recent-conversations", icon: MessageSquare },
  ];

  const close = () => setMobileMenuOpen(false);

  const topBarTitle = useMemo(() => {
    if (createOpen) return "Create bot";
    if (isHome) return greetingName(user?.fullName);
    if (location.pathname.startsWith("/dashboard/usage")) return "Plan & usage";
    if (location.pathname.startsWith("/dashboard/analytics")) return "Analytics";
    if (location.pathname.startsWith("/dashboard/recent-conversations")) return "Recent Conversations";
    if (isBotWorkspace) return "Bot workspace";
    if (location.pathname === "/dashboard/bots") return "All bots";
    return "Dashboard";
  }, [location.pathname, isHome, createOpen, isBotWorkspace, user]);

  // Usage percentage — handle unlimited (-1) and missing data safely
  const msgUsed = usage?.usage.messagesUsed ?? 0;
  const msgLimit = usage?.limits.messagesPerMonth ?? 0;
  const msgPct = msgLimit === -1 || msgLimit === 0 ? 0 : Math.min(100, Math.round((msgUsed / msgLimit) * 100));
  const isUnlimited = msgLimit === -1;

  return (
    <div className="flex min-h-screen bg-[var(--bg-secondary)]" style={{ fontFamily: "var(--font-ui)" }}>
      {mobileMenuOpen && (
        <div role="presentation" className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={close} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 max-h-screen flex w-[18rem] flex-col border-r border-[var(--border-default)] bg-[var(--bg-primary)] shadow-[4px_0_40px_rgba(0,0,0,0.04)] transition-transform duration-300 lg:static lg:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <button type="button" className="absolute right-4 top-4 rounded-lg p-1.5 hover:bg-[var(--bg-secondary)] lg:hidden" onClick={close} aria-label="Close menu">
          <X size={18} />
        </button>

        <div className="px-3.5 pt-5">
          <div className="flex items-center gap-2">
            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] text-[12px] font-black tracking-tighter text-white" style={{ background: "var(--text-primary)" }}>
              B
              <div className="absolute inset-0 rounded-[7px] ring-1 ring-inset ring-white/20" />
            </div>
            <div className="flex gap-[3px]">
              <span className="text-[22px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>Bot</span>
              <span className="text-[22px] font-bold tracking-tight" style={{ color: "var(--text-tertiary)" }}>Base</span>
            </div>
          </div>
        </div>

        <div className="mx-2 mt-4 mb-3 h-px bg-black/5" />
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          <div className="mb-3">
            <div className="space-y-2">
              {navItems.map(({ label, path, icon }) => {
                const isActive = location.pathname === path;
                return (
                  <Link key={path} to={path} onClick={close}
                    className={`flex w-full items-center justify-between gap-3 rounded-lg leading-none px-3 py-4 text-[13px] transition ${isActive ? "bg-black text-white" : "text-neutral-600 hover:bg-[#f5f5f2] hover:text-black"}`}
                  >
                    <span className="flex items-center">
                      {icon && React.createElement(icon, { size: 16, className: "mr-3" })}
                      {label}
                    </span>
                    {label === "All Bots" && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? "bg-white/20" : "bg-black/5"}`}>{bots.length}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mx-2 mb-3 h-px bg-black/5" />

          <div className="mb-3">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">Recent Bots</p>
            <div className="space-y-1">
              {loading ? (
                <p className="px-3 text-[12px] text-neutral-400">Loading...</p>
              ) : bots.length === 0 ? (
                <p className="px-3 text-[12px] text-neutral-400">No bots yet</p>
              ) : (
                bots.slice(0, 6).map((bot) => (
                  <Link key={bot._id} to={`/dashboard/bots/${bot._id}`} onClick={close}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition text-neutral-600 hover:bg-[#f5f5f2] hover:text-black"
                  >
                    {bot.botAvatar.startsWith("data")
                      ? <img src={bot.botAvatar} alt="" className="h-4 w-4 object-cover mr-2 rounded" />
                      : <span className="text-lg">{bot.botAvatar}</span>
                    }
                    <span className="truncate flex-1">{bot.name}</span>
                    <span className={`ml-auto h-1.5 w-1.5 rounded-full ${bot.status === "active" ? "bg-green-500" : "bg-neutral-300"}`} />
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="px-3 mt-4">
            <Link onClick={close} to="?create=1" className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-neutral-800">
              <Plus size={16} />
              New Bot
            </Link>
          </div>
        </div>

        <div className="border-t border-black/5 p-3">
          {/* Usage — now real data */}
          <div className="rounded-2xl border border-black/5 bg-[#f7f7f5] p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] text-neutral-500">Messages this month</span>
              <span className="font-mono text-[11px] font-semibold text-neutral-700">
                {isUnlimited ? `${msgUsed.toLocaleString()} / ∞` : `${msgUsed.toLocaleString()} / ${msgLimit.toLocaleString()}`}
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-[#e8e8e4]">
              <div className="h-full rounded-full bg-black" style={{ width: `${msgPct}%` }} />
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-black/5 pt-3">
              <span className="flex-1 text-[11px] text-neutral-500">
                {isUnlimited ? "Unlimited plan" : `${msgPct}% of plan used`}
              </span>
              <Link to="/dashboard/usage" onClick={close}>
                <button className="rounded-md border border-black/10 bg-white px-3 py-1 text-[11px] font-semibold text-black transition hover:bg-[#f0f0ec]">
                  {usage?.plan === "agency" ? "Manage" : "Upgrade"}
                </button>
              </Link>
            </div>
          </div>

          {/* Profile */}
          <button className="mt-3 flex w-full items-center gap-3 rounded-xl px-1 py-2 transition hover:bg-[#f5f5f2]">
            <div className="relative">
              {user?.avatar ? (
                <img src={user?.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-[11px] font-bold text-white">
                  {getInitials(user?.fullName)}
                </div>
              )}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-white bg-green-500" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-[13px] font-semibold text-black">{user?.fullName || "Loading..."}</p>
              <p className="truncate text-[11px] text-neutral-400">{user?.email || ""}</p>
            </div>
            <MoreHorizontal size={16} className="text-neutral-400" />
          </button>
        </div>
      </aside>

      <div className="flex max-h-screen overflow-auto min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--border-default)] bg-[var(--bg-primary)]/95 px-4 py-3 backdrop-blur-sm lg:hidden">
          <button type="button" className="rounded-xl p-2 hover:bg-[var(--bg-secondary)]" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
            <Menu size={23} />
          </button>
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{topBarTitle}</span>
          <Link to="?create=1" className="rounded-lg p-2 bg-black text-white" aria-label="Create bot">
            <Plus size={20} />
          </Link>
        </header>

        <main className="min-h-0 flex-1 bg-[var(--bg-secondary)]">
          <Outlet />
        </main>
      </div>

      <CreateBotWizardModal open={createOpen} onOpenChange={setCreateWizardOpen} />
    </div>
  );
}

export function DashboardShell() {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API}/auth/me`, { credentials: "include" });
        setIsAuth(response.ok);
      } catch {
        setIsAuth(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuth === null) return <div>Loading...</div>;
  if (!isAuth) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return <DashboardFrame />;
}