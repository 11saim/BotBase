import React, { useMemo, useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { CreditCard, LayoutGrid, Menu, Plus, Search, X } from "lucide-react";
import { isAuthenticated } from "../../lib/auth";
import { DashboardBotsProvider } from "./DashboardBotsContext";
import { CreateBotWizardModal } from "./CreateBotWizardModal";

function greetingName(): string {
  const h = new Date().getHours();
  const part =
    h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return `${part}, Saim`;
}

function DashboardFrame() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const createOpen = searchParams.get("create") === "1";
  const isHome =
    location.pathname === "/dashboard" || location.pathname === "/dashboard/";
  const isBotWorkspace = Boolean(
    location.pathname.match(/\/dashboard\/bots\/[^/]+$/),
  );

  const setCreateWizardOpen = (open: boolean) => {
    setSearchParams(
      (prev) => {
        const n = new URLSearchParams(prev);
        if (open) n.set("create", "1");
        else n.delete("create");
        return n;
      },
      { replace: true },
    );
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Plan & Usage", path: "/dashboard/usage" },
    { label: "See All Bots", path: "/dashboard/bots" },
  ];

  const close = () => setMobileMenuOpen(false);

  const topBarTitle = useMemo(() => {
    if (createOpen) return "Create bot";
    if (isHome) return greetingName();
    if (location.pathname.startsWith("/dashboard/usage")) return "Plan & usage";
    if (isBotWorkspace) return "Bot workspace";
    return "Dashboard";
  }, [location.pathname, isHome, createOpen, isBotWorkspace]);

  return (
    <div
      className="flex min-h-screen bg-[var(--bg-secondary)]"
      style={{ fontFamily: "var(--font-ui)" }}
    >
      {mobileMenuOpen && (
        <div
          role="presentation"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 max-h-screen flex w-[18rem] flex-col border-r border-[var(--border-default)] bg-[var(--bg-primary)] shadow-[4px_0_40px_rgba(0,0,0,0.04)] transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          className="absolute right-4 top-4 rounded-lg p-1.5 hover:bg-[var(--bg-secondary)] lg:hidden"
          onClick={close}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>

        <div className="px-3.5 pt-5">
          <div className="flex items-center gap-2">
            {/* Logo mark */}
            <div
              className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] text-[12px] font-black tracking-tighter text-white"
              style={{ background: "var(--text-primary)" }}
            >
              B
              <div className="absolute inset-0 rounded-[7px] ring-1 ring-inset ring-white/20" />
            </div>

            {/* Wordmark */}
            <div className="flex gap-[3px]">
              <span
                className="text-[22px] font-bold tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                Bot
              </span>
              <span
                className="text-[22px] font-bold tracking-tight"
                style={{ color: "var(--text-tertiary)" }}
              >
                Base
              </span>
            </div>
          </div>
        </div>

        {/* Scroll Area */}
        <div className="mx-2 mt-4 mb-3 h-px bg-black/5" />
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {/* Main Navigation */}
          <div className="mb-3">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
              Main
            </p>

            <div className="space-y-2">
              {navItems.map(({ label, path }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex w-full items-center gap-3 rounded-lg leading-none px-5 py-4 text-[13px] transition
            ${
              isActive
                ? "bg-black text-white"
                : "text-neutral-600 hover:bg-[#f5f5f2] hover:text-black"
            }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mx-2 mb-3 h-px bg-black/5" />

          {/* Integration Guide */}
          <div className="mb-3 px-3">
            <div className="rounded-xl border border-black/5 bg-[#f0f0ec] p-4">
               <h4 className="text-[12px] font-semibold text-neutral-800 mb-1">Integration Guide</h4>
               <p className="text-[11px] text-neutral-500 mb-3 leading-relaxed">
                 Add the bot to your website by pasting our JS snippet before the closing <span className="font-mono bg-black/5 px-1 rounded">&lt;/body&gt;</span> tag.
               </p>
               <Link to="/dashboard/integration" className="block text-center w-full rounded-lg bg-black text-white px-3 py-2 text-[11.5px] font-medium transition hover:bg-neutral-800">
                 View snippet instructions
               </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-black/5 p-3">
          {/* Usage */}
          <div className="rounded-2xl border border-black/5 bg-[#f7f7f5] p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] text-neutral-500">
                Messages this month
              </span>

              <span className="font-mono text-[11px] font-semibold text-neutral-700">
                8,241 / 10k
              </span>
            </div>

            <div className="h-1 overflow-hidden rounded-full bg-[#e8e8e4]">
              <div className="h-full w-[82%] rounded-full bg-black" />
            </div>

            <div className="mt-3 flex items-center gap-2 border-t border-black/5 pt-3">
              <span className="flex-1 text-[11px] text-neutral-500">
                82% of plan used
              </span>

              <Link to={"/dashboard/usage"}>
                <button className="rounded-md border border-black/10 bg-white px-3 py-1 text-[11px] font-semibold text-black transition hover:bg-[#f0f0ec]">
                  Upgrade
                </button>
              </Link>
            </div>
          </div>

          {/* Profile */}
          <button className="mt-3 flex w-full items-center gap-3 rounded-xl px-1 py-2 transition hover:bg-[#f5f5f2]">
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-[11px] font-bold text-white">
                SK
              </div>

              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-white bg-green-500" />
            </div>

            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-[13px] font-semibold text-black">
                Saim Khan
              </p>

              <p className="text-[11px] text-neutral-400">
                Member since Jan 2026
              </p>
            </div>

            <i className="ti ti-dots text-[16px] text-neutral-400" />
          </button>
        </div>
      </aside>

      <div className="flex max-h-screen overflow-auto min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--border-default)] bg-[var(--bg-primary)]/95 px-4 py-3 backdrop-blur-sm lg:hidden">
          <button
            type="button"
            className="rounded-xl p-2 hover:bg-[var(--bg-secondary)]"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={23} />
          </button>

          <span
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {topBarTitle}
          </span>

          <Link
            to="?create=1"
            className="rounded-lg p-2 bg-black text-white"
            aria-label="Create bot"
          >
            <Plus size={20} />
          </Link>
        </header>

        <main className="min-h-0 flex-1 bg-[var(--bg-secondary)]">
          <Outlet />
        </main>
      </div>

      <CreateBotWizardModal
        open={createOpen}
        onOpenChange={setCreateWizardOpen}
      />
    </div>
  );
}

export function DashboardShell() {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return (
    <DashboardBotsProvider>
      <DashboardFrame />
    </DashboardBotsProvider>
  );
}
