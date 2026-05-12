import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
} from "../components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import {
  useDashboardBots,
  type BotAppearance,
  type DashboardBot,
  type KnowledgeChunk,
} from "./DashboardBotsContext";

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

const chartData = [
  { t: "W1", v: 120 },
  { t: "W2", v: 190 },
  { t: "W3", v: 140 },
  { t: "W4", v: 220 },
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
    <div className="min-h-full bg-[var(--bg-secondary)]" style={{ fontFamily: "var(--font-ui)" }}>
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-primary)] px-4 py-4 sm:px-6">
        <Link to="/dashboard" className="mb-3 inline-flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
          ← Dashboard
        </Link>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ background: "var(--bg-secondary)" }}>
              {bot.emoji}
            </div>
            <div>
              <h1 className="text-xl font-medium tracking-tight" style={{ color: "var(--text-primary)" }}>
                {bot.name}
              </h1>
              <span
                className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                style={{
                  background: bot.status === "active" ? "#F0FDF4" : "#FFFBEB",
                  color: bot.status === "active" ? "var(--success)" : "#B45309",
                }}
              >
                {bot.status === "active" ? "Active" : "Paused"}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-4 overflow-x-auto border-t border-[var(--border-default)] pt-3">
          {TABS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setTab(i)}
              className="whitespace-nowrap border-b-2 pb-2 text-sm transition-colors"
              style={{
                borderColor: tab === i ? "var(--text-primary)" : "transparent",
                color: tab === i ? "var(--text-primary)" : "var(--text-secondary)",
                fontWeight: tab === i ? 500 : 400,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl p-4 sm:p-6">
        {tab === 0 && (
          <OverviewTab bot={bot} metrics={metrics} range={range} setRange={setRange} />
        )}
        {tab === 1 && <QuestionsTab setGapDrawer={setGapDrawer} setGapPaste={setGapPaste} />}
        {tab === 2 && (
          <KnowledgeTab bot={bot} addKbChunk={addKbChunk} setChunks={setChunks} appendActivity={appendActivity} />
        )}
        {tab === 3 && (
          <AppearanceEditor appearance={bot.appearance} onChange={(a) => updateBot(bot.id, { appearance: a })} onSave={handleSaveAppearance} />
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
}: {
  bot: DashboardBot;
  metrics: { label: string; value: string }[];
  range: "daily" | "weekly" | "monthly";
  setRange: (r: "daily" | "weekly" | "monthly") => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(["daily", "weekly", "monthly"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className="rounded-lg px-3 py-1.5 text-xs font-medium capitalize"
            style={{
              background: range === r ? "var(--text-primary)" : "var(--bg-primary)",
              color: range === r ? "white" : "var(--text-secondary)",
              border: "1px solid var(--border-default)",
            }}
          >
            {r}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl border p-4" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>{m.label}</p>
            <p className="mt-2 text-2xl font-medium" style={{ color: "var(--text-primary)" }}>{m.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border p-6" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Messages</p>
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
              <Tooltip />
              <Bar dataKey="v" fill="var(--text-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-xl border p-6" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Top questions (preview)</p>
        <ul className="mt-3 space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          {MOCK_TOP_Q.map((row) => (
            <li key={row.q} className="flex justify-between gap-2 border-b border-[var(--border-default)] py-2 last:border-0">
              <span className="min-w-0 truncate">{row.q}</span>
              <span className="shrink-0">{row.n}×</span>
            </li>
          ))}
        </ul>
      </div>
      {bot.leadCaptureEnabled && (
        <div className="rounded-xl border p-6" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
          <div className="mb-3 flex justify-between">
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Leads</p>
            <button type="button" className="text-xs underline" style={{ color: "var(--text-primary)" }}>Export CSV</button>
          </div>
          {bot.leads.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No leads yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead><tr style={{ color: "var(--text-tertiary)" }}><th className="pb-2">Name</th><th>Email</th><th>Date</th></tr></thead>
              <tbody>
                {bot.leads.map((l) => (
                  <tr key={l.id} className="border-t border-[var(--border-default)]"><td className="py-2">{l.name}</td><td>{l.email}</td><td>{l.createdAt}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {bot.handoffInboxEnabled && (
        <div className="rounded-xl border p-6" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Inbox</p>
          {bot.inbox.length === 0 ? (
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>No handoff messages yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {bot.inbox.map((m) => (
                <li key={m.id} className="rounded-lg border p-3" style={{ borderColor: "var(--border-default)" }}>{m.message}</li>
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
      <section className="rounded-xl border p-6" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
        <h3 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Top questions</h3>
        <table className="mt-4 w-full text-left text-sm">
          <thead><tr style={{ color: "var(--text-tertiary)" }}><th className="pb-2">Question</th><th>Asked</th><th>Avg. confidence</th></tr></thead>
          <tbody>
            {MOCK_TOP_Q.map((row) => (
              <tr key={row.q} className="border-t border-[var(--border-default)]">
                <td className="py-2 pr-2">{row.q}</td><td>{row.n}×</td><td>{Math.round(row.conf * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="rounded-xl border p-6" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
        <h3 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Gaps</h3>
        <table className="mt-4 w-full text-left text-sm">
          <thead><tr style={{ color: "var(--text-tertiary)" }}><th className="pb-2">Question</th><th>Asked</th><th>Confidence</th><th /></tr></thead>
          <tbody>
            {MOCK_GAPS.map((row) => (
              <tr key={row.q} className="border-t border-[var(--border-default)]">
                <td className="py-2 pr-2">{row.q}</td><td>{row.n}×</td><td>{Math.round(row.conf * 100)}%</td>
                <td className="py-2 text-right">
                  <button type="button" className="text-xs font-medium underline" style={{ color: "var(--text-primary)" }} onClick={() => { setGapDrawer(row.q); setGapPaste(""); }}>Add to Knowledge Base</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
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
      <div className="rounded-xl border p-4" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Activity log</p>
        <ul className="mt-2 space-y-1 text-xs" style={{ color: "var(--text-secondary)" }}>
          {bot.activity.slice(0, 10).map((a) => (<li key={a.id}>{a.text}</li>))}
        </ul>
      </div>
    </div>
  );
}

function AppearanceEditor({ appearance, onChange, onSave }: { appearance: BotAppearance; onChange: (a: BotAppearance) => void; onSave: () => void }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div className="space-y-4 rounded-xl border p-6" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
        <h3 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Appearance & behavior</h3>
        <label className="block text-xs" style={{ color: "var(--text-secondary)" }}>Primary color<div className="mt-2"><HexColorPicker color={appearance.primaryColor} onChange={(primaryColor) => onChange({ ...appearance, primaryColor })} /></div></label>
        <label className="block text-xs" style={{ color: "var(--text-secondary)" }}>Welcome<input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--border-default)" }} value={appearance.welcomeMessage} onChange={(e) => onChange({ ...appearance, welcomeMessage: e.target.value })} /></label>
        <label className="block text-xs" style={{ color: "var(--text-secondary)" }}>Fallback<textarea rows={2} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--border-default)" }} value={appearance.fallbackMessage} onChange={(e) => onChange({ ...appearance, fallbackMessage: e.target.value })} /></label>
        <label className="block text-xs" style={{ color: "var(--text-secondary)" }}>Paused<textarea rows={2} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--border-default)" }} value={appearance.pausedMessage} onChange={(e) => onChange({ ...appearance, pausedMessage: e.target.value })} /></label>
        <label className="block text-xs" style={{ color: "var(--text-secondary)" }}>Confidence ({appearance.confidenceThreshold}%)<input type="range" min={0} max={100} className="mt-2 block w-full" value={appearance.confidenceThreshold} onChange={(e) => onChange({ ...appearance, confidenceThreshold: Number(e.target.value) })} /></label>
        <button type="button" className="rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ background: "var(--text-primary)" }} onClick={onSave}>Save changes</button>
      </div>
      <aside className="rounded-xl border p-4 text-sm" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>Preview<div className="mt-3 rounded-lg border p-3" style={{ borderColor: "var(--border-default)" }}><div className="rounded-md px-2 py-1 text-xs text-white" style={{ background: appearance.primaryColor }}>Header</div><p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>{appearance.welcomeMessage}</p></div></aside>
    </div>
  );
}

function BotSettingsTab({ bot, rename, setRename, updateBot, onDeleteOpen }: { bot: DashboardBot; rename: string; setRename: (s: string) => void; updateBot: (id: string, p: Partial<DashboardBot>) => void; onDeleteOpen: () => void }) {
  const [domainIn, setDomainIn] = useState("");
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="rounded-xl border p-6" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
        <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Bot name</label>
        <input className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--border-default)" }} value={rename} onChange={(e) => setRename(e.target.value)} onBlur={() => updateBot(bot.id, { name: rename })} />
      </div>
      <div className="rounded-xl border p-6" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Allowed domains</p>
        <div className="mt-2 flex flex-wrap gap-2">{bot.domains.map((d) => (<span key={d} className="rounded-full border px-2 py-0.5 text-xs" style={{ borderColor: "var(--border-default)" }}>{d}<button type="button" className="ml-1" onClick={() => updateBot(bot.id, { domains: bot.domains.filter((x) => x !== d) })}>×</button></span>))}</div>
        <div className="mt-2 flex gap-2"><input className="flex-1 rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--border-default)" }} value={domainIn} onChange={(e) => setDomainIn(e.target.value)} placeholder="domain.com" /><button type="button" className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--border-default)" }} onClick={() => { if (!domainIn.trim()) return; updateBot(bot.id, { domains: [...bot.domains, domainIn.trim()] }); setDomainIn(""); }}>Add</button></div>
      </div>
      <div className="rounded-xl border p-6" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Pause / resume</p>
        <label className="mt-3 flex items-center gap-3"><input type="checkbox" checked={bot.status === "paused"} onChange={(e) => updateBot(bot.id, { status: e.target.checked ? "paused" : "active" })} /><span className="text-sm" style={{ color: "var(--text-secondary)" }}>Bot is paused on the website</span></label>
        <p className="mt-2 rounded-lg border p-3 text-xs" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>Paused message: {bot.appearance.pausedMessage}</p>
      </div>
      <div className="rounded-xl border p-6" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Webhook</p>
        <label className="mt-2 flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}><input type="checkbox" checked={bot.webhookEnabled} onChange={(e) => updateBot(bot.id, { webhookEnabled: e.target.checked })} />Enable webhook</label>
        <input className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--border-default)" }} placeholder="https://…" value={bot.webhookUrl} onChange={(e) => updateBot(bot.id, { webhookUrl: e.target.value })} />
        <button type="button" className="mt-2 rounded-lg border px-3 py-1.5 text-xs" style={{ borderColor: "var(--border-default)" }} onClick={() => { if (bot.webhookUrl) void fetch(bot.webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "test", botId: bot.id }) }).catch(() => {}); }}>Test webhook</button>
      </div>
      <div className="rounded-xl border p-6" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}><label className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}><input type="checkbox" checked={bot.leadCaptureEnabled} onChange={(e) => updateBot(bot.id, { leadCaptureEnabled: e.target.checked })} />Ask for name/email before chat</label></div>
      <div className="rounded-xl border p-6" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}><label className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}><input type="checkbox" checked={bot.handoffInboxEnabled} onChange={(e) => updateBot(bot.id, { handoffInboxEnabled: e.target.checked })} />Allow message when bot cannot answer</label></div>
      <div className="border-t border-[var(--border-default)] pt-6"><button type="button" className="w-full rounded-xl border py-3 text-sm font-medium" style={{ borderColor: "var(--destructive)", color: "var(--destructive)" }} onClick={onDeleteOpen}>Delete bot</button></div>
    </div>
  );
}
