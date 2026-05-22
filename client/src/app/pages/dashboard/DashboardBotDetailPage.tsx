import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { HexColorPicker } from "react-colorful";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import {
  useDashboardBots,
  type BotAppearance,
  type BotFontId,
  type DashboardBot,
  type KnowledgeChunk,
} from "./DashboardBotsContext";
import { BotMessagesTrendChart } from "./DashboardCharts";
import { BOT_FONT_STACK, FONT_OPTIONS } from "./botFonts";

const TABS = ["Overview", "Questions", "Knowledge base", "Appearance", "Settings"] as const;

const MOCK_TOP_Q = [
  { q: "How do I reset my password?", n: 142, conf: 0.94 },
  { q: "What are your pricing plans?", n: 98, conf: 0.88 },
  { q: "How do I cancel?", n: 76, conf: 0.81 },
  { q: "Do you offer SSO?", n: 54, conf: 0.79 },
  { q: "Where is data hosted?", n: 41, conf: 0.92 },
];

const MOCK_GAPS = [
  { q: "Do you offer enterprise plans?", n: 12, conf: 0.42 },
  { q: "Can I export my data?", n: 8, conf: 0.51 },
];

export function DashboardBotDetailPage() {
  const { botId } = useParams<{ botId: string }>();
  const navigate = useNavigate();
  const { bots, updateBot, deleteBot, appendActivity, setChunks } = useDashboardBots();
  const bot = bots.find((b) => b.id === botId);

  const [tab, setTab] = useState(0);
  const [range, setRange] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [gapDrawer, setGapDrawer] = useState<string | null>(null);
  const [gapPaste, setGapPaste] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [rename, setRename] = useState("");

  useEffect(() => {
    if (bot) setRename(bot.name);
  }, [bot?.id, bot?.name]);

  const metrics = useMemo(
    () => [
      { label: "Messages sent", value: bot?.messagesMonth.toLocaleString() ?? "0" },
      { label: "Unique users", value: bot?.usersMonth.toLocaleString() ?? "0" },
      { label: "Avg. confidence", value: `${Math.round((bot?.avgConfidence ?? 0) * 100)}%` },
      { label: "Gaps count", value: String(bot?.gapsCount ?? 0) },
    ],
    [bot],
  );

  if (!bot) {
    return (
      <div className="p-8 text-center" style={{ color: "var(--text-secondary)" }}>
        <p>Bot not found.</p>
        <Link to="/dashboard" className="mt-4 inline-block text-sm underline" style={{ color: "var(--text-primary)" }}>
          Back to dashboard
        </Link>
      </div>
    );
  }

  const handleSaveAppearance = () => {
    appendActivity(bot.id, "Updated appearance — " + new Date().toLocaleDateString());
  };

  const handleDelete = () => {
    if (deleteConfirm !== bot.name) return;
    deleteBot(bot.id);
    setDeleteOpen(false);
    navigate("/dashboard");
  };

  const addKbChunk = (chunk: KnowledgeChunk) => {
    setChunks(bot.id, [...bot.chunks, chunk]);
    appendActivity(bot.id, `Added data — ${chunk.name}`);
  };

  return (
    <div className="min-h-full" style={{ fontFamily: "var(--font-ui)" }}>
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-primary)] px-4 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl text-2xl" style={{ background: "var(--bg-secondary)" }}>
              {bot.iconUrl ? <img src={bot.iconUrl} alt="" className="h-full w-full object-cover" /> : bot.emoji}
            </div>
            <div>
              <h1 className="text-xl font-medium tracking-tight" style={{ color: "var(--text-primary)" }}>
                {bot.name}
              </h1>
              <button
                className="inline-block rounded-full px-2.5 py-0.5 text-[12px] font-semibold uppercase"
                style={{
                  background: bot.status === "active" ? "#F0FDF4" : "#FFFBEB",
                  color: bot.status === "active" ? "var(--success)" : "#B45309",
                }}
                onClick={() => updateBot(bot.id, { status: bot.status === "active" ? "paused" : "active" })}
              >
                {bot.status === "active" ? "Active" : "Pause"}
              </button>
            </div>
          </div>
        </div>
        <div className="mt-5 flex overflow-auto gap-2 sm:gap-1 border-t border-[var(--border-default)] pt-4">
          {TABS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setTab(i)}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-all flex-1 sm:flex-none text-center"
              style={{
                background: tab === i ? "var(--bg-tertiary)" : "transparent",
                color: tab === i ? "var(--text-primary)" : "var(--text-secondary)",
                fontWeight: tab === i ? 600 : 400,
                boxShadow: tab === i ? "inset 0 0 0 1px var(--border-default)" : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8 overflow-hidden sm:overflow-visible">
        {tab === 0 && (
          <OverviewTab bot={bot} metrics={metrics} range={range} setRange={setRange} botId={bot.id} />
        )}
        {tab === 1 && <QuestionsTab setGapDrawer={setGapDrawer} setGapPaste={setGapPaste} />}
        {tab === 2 && (
          <KnowledgeTab bot={bot} addKbChunk={addKbChunk} setChunks={setChunks} appendActivity={appendActivity} />
        )}
        {tab === 3 && (
          <AppearanceEditor bot={bot} appearance={bot.appearance} onChange={(a) => updateBot(bot.id, { appearance: a })} onSave={handleSaveAppearance} />
        )}
        {tab === 4 && (
          <BotSettingsTab bot={bot} rename={rename} setRename={setRename} updateBot={updateBot} onDeleteOpen={() => { setDeleteConfirm(""); setDeleteOpen(true); }} />
        )}
      </div>

      <Sheet open={!!gapDrawer} onOpenChange={() => setGapDrawer(null)}>
        <SheetContent className="bg-[var(--bg-primary)]">
          <SheetHeader>
            <SheetTitle>Add knowledge for gap</SheetTitle>
          </SheetHeader>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>{gapDrawer}</p>
          <textarea
            className="mt-4 w-full rounded-lg border p-3 text-sm"
            style={{ borderColor: "var(--border-default)" }}
            rows={8}
            value={gapPaste}
            onChange={(e) => setGapPaste(e.target.value)}
            placeholder="Paste answer or notes…"
          />
          <button
            type="button"
            className="mt-3 w-full rounded-lg py-2 text-sm font-medium text-white"
            style={{ background: "var(--text-primary)" }}
            onClick={() => {
              if (gapPaste.trim()) {
                addKbChunk({
                  id: `c-${crypto.randomUUID().slice(0, 8)}`,
                  name: `Gap: ${(gapDrawer || "").slice(0, 24)}…`,
                  type: "text",
                  addedAt: new Date().toLocaleDateString(),
                  status: "ready",
                });
              }
              setGapDrawer(null);
            }}
          >
            Save to knowledge base
          </button>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete bot</AlertDialogTitle>
            <AlertDialogDescription>
              Type <strong>{bot.name}</strong> to confirm permanent deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            style={{ borderColor: "var(--border-default)" }}
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder={bot.name}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
              disabled={deleteConfirm !== bot.name}
              className="bg-[var(--destructive)] text-white hover:opacity-90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function OverviewTab({
  bot,
  metrics,
  range,
  setRange,
  botId,
}: {
  bot: DashboardBot;
  metrics: { label: string; value: string }[];
  range: "daily" | "weekly" | "monthly";
  setRange: (r: "daily" | "weekly" | "monthly") => void;
  botId: string;
}) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-1 rounded-xl border p-1" style={{ borderColor: "var(--border-default)", background: "var(--bg-secondary)" }}>
        {(["daily", "weekly", "monthly"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className="rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all"
            style={{
              background: range === r ? "var(--text-primary)" : "transparent",
              color: range === r ? "white" : "var(--text-secondary)",
              boxShadow: range === r ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {r}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-2xl border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
              {m.label}
            </p>
            <p className="mt-2 text-2xl font-medium tracking-tight" style={{ color: "var(--text-primary)" }}>
              {m.value}
            </p>
          </div>
        ))}
      </div>
      <div
        className="rounded-2xl border p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:p-8"
        style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
          Analytics
        </p>
        <p className="mt-1 text-lg font-medium tracking-tight" style={{ color: "var(--text-primary)" }}>
          Message volume
        </p>
        <p className="mt-1 max-w-lg text-sm" style={{ color: "var(--text-secondary)" }}>
          Sample trend for this bot (preview). Granularity follows the range you select.
        </p>
        <div className="mt-6 w-full h-64 sm:h-80 overflow-hidden">
          <BotMessagesTrendChart range={range} botId={botId} height={300} />
        </div>
      </div>
      <div
        className="rounded-2xl border p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
          Insights
        </p>
        <p className="mt-1 text-lg font-medium tracking-tight" style={{ color: "var(--text-primary)" }}>
          Top questions (preview)
        </p>
        <ul className="mt-4 space-y-0 divide-y divide-[var(--border-default)] text-sm" style={{ color: "var(--text-secondary)" }}>
          {MOCK_TOP_Q.map((row) => (
            <li key={row.q} className="flex justify-between gap-3 py-3 first:pt-0">
              <span className="min-w-0 truncate" style={{ color: "var(--text-primary)" }}>
                {row.q}
              </span>
              <span className="shrink-0 tabular-nums text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>
                {row.n}×
              </span>
            </li>
          ))}
        </ul>
      </div>
      {bot.leadCaptureEnabled && (
        <div
          className="rounded-2xl border p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}
        >
          <div className="mb-3 flex justify-between">
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Leads</p>
            <button type="button" className="text-xs underline" style={{ color: "var(--text-primary)" }}>Export CSV</button>
          </div>
          {bot.leads.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No leads yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[400px]">
                <thead><tr style={{ color: "var(--text-tertiary)" }}><th className="pb-2">Name</th><th>Email</th><th>Date</th></tr></thead>
                <tbody>
                  {bot.leads.map((l) => (
                    <tr key={l.id} className="border-t border-[var(--border-default)]"><td className="py-2 pr-2">{l.name}</td><td className="pr-2">{l.email}</td><td className="whitespace-nowrap">{l.createdAt}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {bot.handoffInboxEnabled && (
        <div
          className="rounded-2xl border p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}
        >
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Inbox</p>
          {bot.inbox.length === 0 ? (
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>No handoff messages yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {bot.inbox.map((m) => (
                <li key={m.id} className="rounded-lg border p-3 break-words" style={{ borderColor: "var(--border-default)" }}>{m.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function QuestionsTab({ setGapDrawer, setGapPaste }: { setGapDrawer: (q: string | null) => void; setGapPaste: (s: string) => void }) {
  return (
    <div className="space-y-8">
      <section
        className="rounded-2xl border p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}
      >
        <h3 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Top questions</h3>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-sm min-w-[400px]">
            <thead><tr style={{ color: "var(--text-tertiary)" }}><th className="pb-2">Question</th><th>Asked</th><th>Avg. confidence</th></tr></thead>
            <tbody>
              {MOCK_TOP_Q.map((row) => (
                <tr key={row.q} className="border-t border-[var(--border-default)]">
                  <td className="py-2 pr-2">{row.q}</td><td>{row.n}×</td><td>{Math.round(row.conf * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section
        className="rounded-2xl border p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}
      >
        <h3 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Gaps</h3>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-sm min-w-[500px]">
            <thead><tr style={{ color: "var(--text-tertiary)" }}><th className="pb-2">Question</th><th>Asked</th><th>Confidence</th><th /></tr></thead>
            <tbody>
              {MOCK_GAPS.map((row) => (
                <tr key={row.q} className="border-t border-[var(--border-default)]">
                  <td className="py-2 pr-2">{row.q}</td><td>{row.n}×</td><td>{Math.round(row.conf * 100)}%</td>
                  <td className="py-2 text-right">
                    <button type="button" className="text-xs font-medium underline whitespace-nowrap" style={{ color: "var(--text-primary)" }} onClick={() => { setGapDrawer(row.q); setGapPaste(""); }}>Add to Knowledge Base</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function KnowledgeTab({
  bot,
  addKbChunk,
  setChunks,
  appendActivity,
}: {
  bot: DashboardBot;
  addKbChunk: (c: KnowledgeChunk) => void;
  setChunks: (id: string, c: KnowledgeChunk[]) => void;
  appendActivity: (id: string, t: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Knowledge chunks</h3>
        <button type="button" className="rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ background: "var(--text-primary)" }} onClick={() => addKbChunk({ id: `c-${crypto.randomUUID().slice(0, 8)}`, name: "Manual note", type: "text", addedAt: new Date().toLocaleDateString(), status: "ready" })}>Add more data</button>
      </div>
      <div className="overflow-x-auto rounded-2xl border shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead><tr style={{ color: "var(--text-tertiary)" }}><th className="px-4 py-3">Source</th><th className="px-4 py-3">Size</th><th className="px-4 py-3">Added</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr></thead>
          <tbody>
            {bot.chunks.map((c) => (
              <tr key={c.id} className="border-t border-[var(--border-default)]">
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3">{c.sizeLabel ?? "—"}</td>
                <td className="px-4 py-3">{c.addedAt}</td>
                <td className="px-4 py-3 capitalize">{c.status}</td>
                <td className="px-4 py-3 text-right">
                  <Popover>
                    <PopoverTrigger asChild><button type="button" className="text-xs underline" style={{ color: "var(--destructive)" }}>Delete</button></PopoverTrigger>
                    <PopoverContent className="w-56 p-3 text-sm">
                      <p style={{ color: "var(--text-secondary)" }}>Remove this chunk?</p>
                      <button type="button" className="mt-2 w-full rounded-lg py-1.5 text-xs text-white" style={{ background: "var(--destructive)" }} onClick={() => { setChunks(bot.id, bot.chunks.filter((x) => x.id !== c.id)); appendActivity(bot.id, `Deleted chunk ${c.name}`); }}>Confirm delete</button>
                    </PopoverContent>
                  </Popover>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-2xl border p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Activity log</p>
        <ul className="mt-2 space-y-1 text-xs" style={{ color: "var(--text-secondary)" }}>
          {bot.activity.slice(0, 10).map((a) => (<li key={a.id} className="break-words">{a.text}</li>))}
        </ul>
      </div>
    </div>
  );
}

function AppearanceEditor({
  bot,
  appearance,
  onChange,
  onSave,
}: {
  bot: DashboardBot;
  appearance: BotAppearance;
  onChange: (a: BotAppearance) => void;
  onSave: () => void;
}) {
  const previewFont = BOT_FONT_STACK[appearance.fontId];
  const chatShell =
    appearance.chatTheme === "dark"
      ? { bg: "#171717", surface: "#262626", text: "#fafafa", muted: "#a3a3a3", bubbleBot: "#404040", border: "#404040" }
      : appearance.chatTheme === "light"
        ? { bg: "#ffffff", surface: "#f5f5f5", text: "#0a0a0a", muted: "#737373", bubbleBot: "#f0f0f0", border: "#e5e5e5" }
        : { bg: "#fafafa", surface: "#f4f4f5", text: "#18181b", muted: "#71717a", bubbleBot: "#e4e4e7", border: "#e4e4e7" };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_min(340px,100%)]">
      <div className="space-y-6">
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Launcher
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <DetailField label="Position">
              <select
                className="mt-1.5 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 text-sm"
                value={appearance.widgetPosition}
                onChange={(e) => onChange({ ...appearance, widgetPosition: e.target.value as BotAppearance["widgetPosition"] })}
              >
                <option value="br">Bottom right</option>
                <option value="bl">Bottom left</option>
              </select>
            </DetailField>
            <DetailField label="Shape">
              <select
                className="mt-1.5 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 text-sm"
                value={appearance.widgetShape}
                onChange={(e) => onChange({ ...appearance, widgetShape: e.target.value as BotAppearance["widgetShape"] })}
              >
                <option value="circle">Circle</option>
                <option value="rounded">Rounded</option>
              </select>
            </DetailField>
            <DetailField label="Size">
              <select
                className="mt-1.5 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 text-sm"
                value={appearance.widgetSize}
                onChange={(e) => onChange({ ...appearance, widgetSize: e.target.value as BotAppearance["widgetSize"] })}
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </DetailField>
          </div>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                Launcher color
              </p>
              <div className="mt-2 flex justify-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3">
                <HexColorPicker color={appearance.widgetBg} onChange={(widgetBg) => onChange({ ...appearance, widgetBg })} style={{ width: 120, height: 120 }} />
              </div>
            </div>
            <DetailField label="Tooltip">
              <input
                className="mt-1.5 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 text-sm"
                value={appearance.widgetTooltip}
                onChange={(e) => onChange({ ...appearance, widgetTooltip: e.target.value })}
              />
            </DetailField>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Chat interface
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <DetailField label="Panel theme">
              <select
                className="mt-1.5 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 text-sm"
                value={appearance.chatTheme}
                onChange={(e) => onChange({ ...appearance, chatTheme: e.target.value as BotAppearance["chatTheme"] })}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </DetailField>
            <DetailField label="Font">
              <select
                className="mt-1.5 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 text-sm"
                value={appearance.fontId}
                onChange={(e) => onChange({ ...appearance, fontId: e.target.value as BotFontId })}
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </DetailField>
          </div>
          <div className="mt-5">
            <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              Accent color
            </p>
            <div className="mt-2 flex justify-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3">
              <HexColorPicker color={appearance.primaryColor} onChange={(primaryColor) => onChange({ ...appearance, primaryColor })} style={{ width: 120, height: 120 }} />
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <DetailField label="Welcome message">
              <input
                className="mt-1.5 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 text-sm"
                value={appearance.welcomeMessage}
                onChange={(e) => onChange({ ...appearance, welcomeMessage: e.target.value })}
              />
            </DetailField>
            <DetailField label="Input placeholder">
              <input
                className="mt-1.5 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 text-sm"
                value={appearance.inputPlaceholder}
                onChange={(e) => onChange({ ...appearance, inputPlaceholder: e.target.value })}
              />
            </DetailField>
          </div>
          <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={appearance.poweredBy}
              onChange={(e) => onChange({ ...appearance, poweredBy: e.target.checked })}
            />
            Show “Powered by BotBase”
          </label>
          <div className="mt-6 grid gap-4 border-t border-[var(--border-default)] pt-6 sm:grid-cols-2">
            <DetailField label="Fallback message">
              <textarea
                rows={2}
                className="mt-1.5 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 text-sm"
                value={appearance.fallbackMessage}
                onChange={(e) => onChange({ ...appearance, fallbackMessage: e.target.value })}
              />
            </DetailField>
            <DetailField label="Paused message">
              <textarea
                rows={2}
                className="mt-1.5 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 text-sm"
                value={appearance.pausedMessage}
                onChange={(e) => onChange({ ...appearance, pausedMessage: e.target.value })}
              />
            </DetailField>
          </div>
          <div className="mt-5">
            <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              Response style
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["formal", "friendly", "concise"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onChange({ ...appearance, responseStyle: r })}
                  className="rounded-xl px-4 py-2 text-sm font-medium capitalize transition-all"
                  style={{
                    background: appearance.responseStyle === r ? "var(--text-primary)" : "var(--bg-secondary)",
                    color: appearance.responseStyle === r ? "white" : "var(--text-secondary)",
                    border: "1px solid var(--border-default)",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 max-w-xs">
            <DetailField label="Language">
              <select
                className="mt-1.5 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 text-sm"
                value={appearance.language}
                onChange={(e) => onChange({ ...appearance, language: e.target.value })}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </DetailField>
          </div>
          <button
            type="button"
            className="mt-6 rounded-xl px-5 py-2.5 text-sm font-medium text-white"
            style={{ background: "var(--text-primary)" }}
            onClick={onSave}
          >
            Save changes
          </button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-4 lg:self-start">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
          Preview
        </p>
        <div
          className="mt-3 overflow-hidden rounded-2xl border shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
          style={{ borderColor: chatShell.border, fontFamily: previewFont }}
        >
          <div className="px-4 py-3 text-white" style={{ background: appearance.primaryColor }}>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/15 text-lg">
                {bot.iconUrl ? <img src={bot.iconUrl} alt="" className="h-full w-full object-cover" /> : bot.emoji}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{bot.name}</p>
                {bot.description?.trim() ? (
                  <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-white/85">{bot.description}</p>
                ) : (
                  <p className="mt-0.5 text-xs text-white/70">No description</p>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-3 p-4" style={{ background: chatShell.bg, minHeight: 180 }}>
            <div
              className="max-w-[92%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm leading-relaxed shadow-sm"
              style={{ background: chatShell.bubbleBot, color: chatShell.text }}
            >
              {appearance.welcomeMessage}
            </div>
            <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md px-3.5 py-2.5 text-sm text-white shadow-sm" style={{ background: appearance.primaryColor }}>
              Example visitor message
            </div>
            <div
              className="flex items-center gap-2 rounded-full border px-3 py-2.5 text-sm shadow-inner"
              style={{ borderColor: chatShell.border, background: chatShell.surface, color: chatShell.muted }}
            >
              <span className="min-w-0 flex-1 truncate">{appearance.inputPlaceholder}</span>
              <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white" style={{ background: appearance.primaryColor }}>
                Send
              </span>
            </div>
            {appearance.poweredBy && (
              <p className="text-center text-[10px]" style={{ color: chatShell.muted }}>
                Powered by BotBase
              </p>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <div
            className="flex items-center justify-center text-lg text-white shadow-lg"
            style={{
              width: appearance.widgetSize === "sm" ? 44 : appearance.widgetSize === "lg" ? 60 : 52,
              height: appearance.widgetSize === "sm" ? 44 : appearance.widgetSize === "lg" ? 60 : 52,
              borderRadius: appearance.widgetShape === "circle" ? "9999px" : "14px",
              background: appearance.widgetBg,
            }}
            title={appearance.widgetTooltip}
          >
            {bot.iconUrl ? <img src={bot.iconUrl} alt="" className="h-[55%] w-[55%] object-contain" /> : bot.emoji}
          </div>
        </div>
      </aside>
    </div>
  );
}

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function BotSettingsTab({ bot, rename, setRename, updateBot, onDeleteOpen }: { bot: DashboardBot; rename: string; setRename: (s: string) => void; updateBot: (id: string, p: Partial<DashboardBot>) => void; onDeleteOpen: () => void }) {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="rounded-2xl border p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
        <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Bot name</label>
        <input className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--border-default)" }} value={rename} onChange={(e) => setRename(e.target.value)} onBlur={() => updateBot(bot.id, { name: rename })} />
      </div>
      <div className="rounded-2xl border p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
        <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Description</label>
        <textarea
          className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: "var(--border-default)" }}
          rows={3}
          value={bot.description ?? ""}
          onChange={(e) => updateBot(bot.id, { description: e.target.value })}
          placeholder="Shown in widget header when set"
        />
      </div>
      <div className="rounded-2xl border p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Pause / resume</p>
        <label className="mt-3 flex items-center gap-3"><input type="checkbox" checked={bot.status === "paused"} onChange={(e) => updateBot(bot.id, { status: e.target.checked ? "paused" : "active" })} /><span className="text-sm" style={{ color: "var(--text-secondary)" }}>Bot is paused on the website</span></label>
        <p className="mt-2 rounded-lg border p-3 text-xs" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>Paused message: {bot.appearance.pausedMessage}</p>
      </div>
      <div className="rounded-2xl border p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Webhook</p>
        <label className="mt-2 flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}><input type="checkbox" checked={bot.webhookEnabled} onChange={(e) => updateBot(bot.id, { webhookEnabled: e.target.checked })} />Enable webhook</label>
        <input className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--border-default)" }} placeholder="https://…" value={bot.webhookUrl} onChange={(e) => updateBot(bot.id, { webhookUrl: e.target.value })} />
        <button type="button" className="mt-2 rounded-lg border px-3 py-1.5 text-xs" style={{ borderColor: "var(--border-default)" }} onClick={() => { if (bot.webhookUrl) void fetch(bot.webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "test", botId: bot.id }) }).catch(() => { }); }}>Test webhook</button>
      </div>
      <div className="rounded-2xl border p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}><label className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}><input type="checkbox" checked={bot.leadCaptureEnabled} onChange={(e) => updateBot(bot.id, { leadCaptureEnabled: e.target.checked })} />Ask for name/email before chat</label></div>
      <div className="rounded-2xl border p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}><label className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}><input type="checkbox" checked={bot.handoffInboxEnabled} onChange={(e) => updateBot(bot.id, { handoffInboxEnabled: e.target.checked })} />Allow message when bot cannot answer</label></div>
      <div className="border-t border-[var(--border-default)] pt-6"><button type="button" className="w-full rounded-xl border py-3 text-sm font-medium" style={{ borderColor: "var(--destructive)", color: "var(--destructive)" }} onClick={onDeleteOpen}>Delete bot</button></div>
    </div>
  );
}
