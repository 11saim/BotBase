import React, { useMemo, useState } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation, useSearchParams } from "react-router-dom";
import { CreditCard, LayoutGrid, Menu, X } from "lucide-react";
import { isAuthenticated } from "../../lib/auth";
import { DashboardBotsProvider } from "./DashboardBotsContext";
import { CreateBotWizardModal } from "./CreateBotWizardModal";

function greetingName(): string {
  const h = new Date().getHours();
  const part = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return `${part}, Saim`;
}

function DashboardFrame() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const createOpen = searchParams.get("create") === "1";
  const isHome = location.pathname === "/dashboard" || location.pathname === "/dashboard/";
  const isBotWorkspace = Boolean(location.pathname.match(/\/dashboard\/bots\/[^/]+$/));
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
    <div className="flex min-h-screen bg-[var(--bg-secondary)]" style={{ fontFamily: "var(--font-ui)" }}>
      {mobileMenuOpen && (
        <div
          role="presentation"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[17rem] flex-col border-r border-[var(--border-default)] bg-[var(--bg-primary)] shadow-[4px_0_40px_rgba(0,0,0,0.04)] transition-transform duration-300 lg:static lg:translate-x-0 lg:rounded-r-3xl ${
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

        <div className="flex flex-1 flex-col overflow-y-auto p-4 pt-14 lg:pt-6">
          <Link
            to="/"
            onClick={close}
            className="mb-8 flex items-center gap-2"
            style={{ fontWeight: 500, fontSize: "15px", color: "var(--text-primary)" }}
          >
            <span>botbase</span>
            <span style={{ color: "var(--text-secondary)" }}>.ai</span>
          </Link>

          <nav className="flex flex-1 flex-col gap-1" aria-label="Primary">
            <NavLink to="/dashboard" className={navCls} onClick={close} end>
              <LayoutGrid size={18} />
              Dashboard
            </NavLink>
            <NavLink to="/dashboard/usage" className={navCls} onClick={close}>
              <CreditCard size={18} />
              Plan & usage
            </NavLink>
          </nav>

          <div
            className="mt-auto rounded-2xl border p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            style={{ borderColor: "var(--border-default)", background: "var(--bg-secondary)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium text-white"
                style={{ background: "var(--text-primary)" }}
              >
                SK
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  Saim Khan
                </p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Member since Jan 2026
                </p>
              </div>
            </div>
            <div
              className="mt-3 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-default)",
              }}
            >
              Pro plan
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-[var(--border-default)] bg-[var(--bg-primary)]/95 px-4 py-3.5 backdrop-blur-sm sm:px-6"
        >
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
                style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}
                aria-label="Plan and usage"
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white sm:h-10 sm:w-10 sm:text-sm"
                  style={{ background: "var(--text-primary)" }}
                >
                  SK
                </div>
                <div className="min-w-0 flex-1 max-sm:hidden">
                  <p className="truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>
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
                    <span className="text-[11px] max-lg:hidden" style={{ color: "var(--text-tertiary)" }}>
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
      <CreateBotWizardModal open={createOpen} onOpenChange={setCreateWizardOpen} />
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
