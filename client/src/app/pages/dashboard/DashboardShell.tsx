import React, { useMemo, useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { CreditCard, LayoutGrid, Menu, X } from "lucide-react";
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
  const showCreateCta = !isBotWorkspace;

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

  const close = () => setMobileMenuOpen(false);

  const navCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
      isActive
        ? "bg-[var(--bg-tertiary)] font-medium text-[var(--text-primary)] shadow-[inset_0_0_0_1px_var(--border-default)]"
        : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
    }`;

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

        {/* Workspace Header */}
        <div className="border-b border-black/5 px-4 pb-3 pt-4">
          <button className="flex w-full items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-[#f5f5f2]">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-black text-sm font-bold tracking-tight text-white">
              BB
            </div>

            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-[13.5px] font-semibold text-black">
                Bot Base
              </p>
              <p className="text-[11px] text-neutral-500">Pro workspace</p>
            </div>

            <i className="ti ti-chevrons-up-down text-sm text-neutral-400" />
          </button>
        </div>

        {/* New Bot Button */}
        <div className="px-3 py-3">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-[13px] font-medium text-white transition hover:opacity-90">
            <i className="ti ti-plus text-[15px]" />
            New bot
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-3">
          <div className="flex cursor-text items-center gap-2 rounded-xl border border-black/5 bg-[#f5f5f2] px-3 py-2">
            <i className="ti ti-search text-sm text-neutral-400" />

            <span className="flex-1 text-[12.5px] text-neutral-400">
              Search...
            </span>

            <kbd className="rounded-md border border-black/10 bg-[#ebebeb] px-1.5 py-0.5 font-mono text-[10px] text-neutral-400">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Scroll Area */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {/* Main Navigation */}
          <div className="mb-3">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
              Main
            </p>

            <div className="space-y-1">
              <button className="flex w-full items-center gap-3 rounded-xl bg-black px-3 py-2 text-left text-[13px] text-white">
                <i className="ti ti-layout-grid text-[16px]" />
                Dashboard
              </button>

              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[13px] text-neutral-600 transition hover:bg-[#f5f5f2] hover:text-black">
                <i className="ti ti-robot text-[16px]" />

                <span>All bots</span>

                <span className="ml-auto rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
                  3
                </span>
              </button>

              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[13px] text-neutral-600 transition hover:bg-[#f5f5f2] hover:text-black">
                <i className="ti ti-chart-bar text-[16px]" />
                Analytics
              </button>

              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[13px] text-neutral-600 transition hover:bg-[#f5f5f2] hover:text-black">
                <i className="ti ti-database text-[16px]" />
                Knowledge base
              </button>

              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[13px] text-neutral-600 transition hover:bg-[#f5f5f2] hover:text-black">
                <i className="ti ti-bell text-[16px]" />

                <span>Activity</span>

                <span className="ml-auto h-2 w-2 rounded-full bg-red-500" />
              </button>
            </div>
          </div>

          <div className="mx-2 mb-3 h-px bg-black/5" />

          {/* Bots */}
          <div className="mb-3 px-1">
            <div className="mb-2 flex items-center justify-between px-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                Your bots
              </p>
            </div>

            <div className="space-y-1">
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-[#f5f5f2]">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-black/5 bg-[#f0f0ec] text-sm">
                  🤖
                </div>

                <span className="flex-1 truncate text-left text-[12.5px] text-neutral-800">
                  Support Assistant
                </span>

                <span className="h-2 w-2 rounded-full bg-green-500" />
              </button>

              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-[#f5f5f2]">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-black/5 bg-[#f0f0ec] text-sm">
                  📚
                </div>

                <span className="flex-1 truncate text-left text-[12.5px] text-neutral-800">
                  Docs Bot
                </span>

                <span className="h-2 w-2 rounded-full bg-green-500" />
              </button>

              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-[#f5f5f2]">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-black/5 bg-[#f0f0ec] text-sm">
                  💼
                </div>

                <span className="flex-1 truncate text-left text-[12.5px] text-neutral-800">
                  Sales Helper
                </span>

                <span className="h-2 w-2 rounded-full bg-neutral-300" />
              </button>
            </div>
          </div>

          <div className="mx-2 mb-3 h-px bg-black/5" />

          {/* Configure */}
          <div>
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
              Configure
            </p>

            <div className="space-y-1">
              {[
                ["ti-puzzle", "Integrations"],
                ["ti-code", "API & webhooks"],
                ["ti-palette", "Appearance"],
                ["ti-credit-card", "Plan & usage"],
                ["ti-settings", "Settings"],
              ].map(([icon, label]) => (
                <button
                  key={label}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[13px] text-neutral-600 transition hover:bg-[#f5f5f2] hover:text-black"
                >
                  <i className={`ti ${icon} text-[16px]`} />
                  {label}
                </button>
              ))}
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

              <button className="rounded-md border border-black/10 bg-white px-3 py-1 text-[11px] font-semibold text-black transition hover:bg-[#f0f0ec]">
                Upgrade
              </button>
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
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-[var(--border-default)] bg-[var(--bg-primary)]/95 px-4 py-3.5 backdrop-blur-sm sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="shrink-0 rounded-xl p-2 hover:bg-[var(--bg-secondary)] lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <p
              className="truncate text-sm sm:text-base"
              style={{ fontWeight: 500, color: "var(--text-primary)" }}
            >
              {topBarTitle}
            </p>
          </div>
          {showCreateCta && (
            <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
              <Link
                to="?create=1"
                className="rounded-xl px-3 py-2 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.12)] transition-opacity hover:opacity-90 sm:px-4"
                style={{ background: "var(--text-primary)" }}
              >
                Create bot
              </Link>
              {isHome && (
                <Link
                  to="/dashboard/usage"
                  className="flex max-w-[min(100%,14rem)] items-center gap-2 rounded-xl border p-1.5 pl-2 pr-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors hover:bg-[var(--bg-secondary)] sm:max-w-none sm:gap-3 sm:p-2 sm:pr-3"
                  style={{
                    borderColor: "var(--border-default)",
                    background: "var(--bg-primary)",
                  }}
                  aria-label="Plan and usage"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white sm:h-10 sm:w-10 sm:text-sm"
                    style={{ background: "var(--text-primary)" }}
                  >
                    SK
                  </div>
                  <div className="min-w-0 flex-1 max-sm:hidden">
                    <p
                      className="truncate text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Saim Khan
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                        style={{
                          background: "var(--bg-tertiary)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border-default)",
                        }}
                      >
                        Pro plan
                      </span>
                      <span
                        className="text-[11px] max-lg:hidden"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        Since Jan 2026
                      </span>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          )}
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
