import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { HexColorPicker } from "react-colorful";
import { FileText, Link2, Copy, Check } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { toast } from "sonner";
import { BOT_FONT_STACK, FONT_OPTIONS } from "./botFonts";
import { API_URL } from "../../lib/config";
import { authFetch } from "../../lib/authFetch";

const API = API_URL;
const TABS = ["Overview", "Conversations", "Knowledge base", "Appearance", "Embed", "Settings"] as const;

interface WidgetConfig {
  position: string; launcherSize: string; launcherShape: string; launcherColor: string;
  tooltipText: string; panelTheme: string; chatFont: string; accentColor: string;
  welcomeMessage: string; inputPlaceholder: string; showPoweredBy: boolean;
  pausedMessage: string; fallbackReply: string; responseStyle: string; language: string;
}

interface Bot {
  _id: string; name: string; description: string; botAvatar: string;
  status: "active" | "paused" | "locked" | "deleted";
  widgetConfig: WidgetConfig; createdAt: string;
}

interface KnowledgeSource {
  _id: string; name: string; type: "pdf" | "text"; status: string;
  chunkCount: number; createdAt: string;
}

interface Conversation {
  _id: string; label: string | null; isResolved: boolean | null;
  lastMessageAt: string; messageCount: number;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000), hours = Math.floor(mins / 60), days = Math.floor(hours / 24);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function DashboardBotDetailPage() {
  const { botId } = useParams<{ botId: string }>();
  const navigate = useNavigate();

  const [bot, setBot] = useState<Bot | null>(null);
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [rename, setRename] = useState("");
  const [renameDesc, setRenameDesc] = useState("");

  const fetchBot = useCallback(async () => {
    if (!botId) return;
    try {
      const [botRes, srcRes, convRes] = await Promise.all([
        authFetch(`${API}/bots/${botId}`),
        authFetch(`${API}/bots/${botId}/knowledge`),
        authFetch(`${API}/conversations?botId=${botId}&status=all&period=all`),
      ]);
      const botData = await botRes.json();
      const srcData = await srcRes.json();
      const convData = await convRes.json();

      if (botRes.ok) {
        setBot(botData.bot);
        setRename(botData.bot.name);
        setRenameDesc(botData.bot.description);
      }
      setSources(srcData.sources || []);
      setConversations(convData.conversations || []);
    } catch (err) {
      console.error("Bot detail fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [botId]);

  useEffect(() => { fetchBot(); }, [fetchBot]);

  const metrics = useMemo(() => {
    const resolved = conversations.filter(c => c.isResolved === true).length;
    const classified = conversations.filter(c => c.isResolved !== null).length;
    return [
      { label: "Conversations", value: String(conversations.length) },
      { label: "Resolution rate", value: classified ? `${Math.round((resolved / classified) * 100)}%` : "—" },
      { label: "Knowledge sources", value: String(sources.filter(s => s.status === "active").length) },
      { label: "Status", value: bot?.status === "active" ? "Active" : bot?.status === "paused" ? "Paused" : bot?.status ?? "—" },
    ];
  }, [conversations, sources, bot]);

  const toggleStatus = async () => {
    if (!bot) return;
    const newStatus = bot.status === "active" ? "paused" : "active";
    const res = await authFetch(`${API}/bots/${bot._id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) setBot(b => b ? { ...b, status: newStatus } : b);
  };

  const saveBasicInfo = async () => {
    if (!bot) return;
    const res = await authFetch(`${API}/bots/${bot._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: rename, description: renameDesc }),
    });
    const data = await res.json();
    if (res.ok) setBot(data.bot);
  };

  const handleDelete = async () => {
    if (!bot || deleteConfirm !== bot.name) return;
    await authFetch(`${API}/bots/${bot._id}`, { method: "DELETE" });
    setDeleteOpen(false);
    navigate("/dashboard/bots");
  };

  if (loading) {
    return <div className="p-8 text-center text-sm" style={{ color: "var(--text-secondary)" }}>Loading...</div>;
  }

  if (!bot) {
    return (
      <div className="p-8 text-center" style={{ color: "var(--text-secondary)" }}>
        <p>Bot not found.</p>
        <Link to="/dashboard/bots" className="mt-4 inline-block text-sm underline" style={{ color: "var(--text-primary)" }}>
          Back to all bots
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-full" style={{ fontFamily: "var(--font-ui)" }}>
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-primary)] px-4 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl text-2xl" style={{ background: "var(--bg-secondary)" }}>
              {bot.botAvatar.startsWith("data") ? <img src={bot.botAvatar} alt="" className="h-full w-full object-cover" /> : bot.botAvatar}
            </div>
            <div>
              <h1 className="text-xl font-medium tracking-tight" style={{ color: "var(--text-primary)" }}>{bot.name}</h1>
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleStatus}
                  disabled={bot.status === "locked"}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    bot.status === "active" ? "bg-[#16A34A]" : "bg-gray-300"
                  } ${bot.status === "locked" ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out ${
                      bot.status === "active" ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-[12px] font-medium" style={{ color: bot.status === "active" ? "#16A34A" : "#B45309" }}>
                  {bot.status === "active" ? "Active" : bot.status === "paused" ? "Paused" : bot.status}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5 flex overflow-auto gap-2 sm:gap-1 border-t border-[var(--border-default)] pt-4">
          {TABS.map((label, i) => (
            <button
              key={label} type="button" onClick={() => setTab(i)}
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
        {tab === 0 && <OverviewTab metrics={metrics} conversations={conversations} />}
        {tab === 1 && <ConversationsTab conversations={conversations} />}
        {tab === 2 && <KnowledgeTab botId={bot._id} sources={sources} onRefresh={fetchBot} />}
        {tab === 3 && <AppearanceEditor bot={bot} onSaved={(updated) => setBot(updated)} />}
        {tab === 4 && <EmbedTab botId={bot._id} />}
        {tab === 5 && (
          <BotSettingsTab
            bot={bot} rename={rename} setRename={setRename}
            renameDesc={renameDesc} setRenameDesc={setRenameDesc}
            onSave={saveBasicInfo}
            onDeleteOpen={() => { setDeleteConfirm(""); setDeleteOpen(true); }}
          />
        )}
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete bot</AlertDialogTitle>
            <AlertDialogDescription>Type <strong>{bot.name}</strong> to confirm permanent deletion.</AlertDialogDescription>
          </AlertDialogHeader>
          <input
            className="w-full rounded-md border px-3 py-2 text-sm" style={{ borderColor: "var(--border-default)" }}
            value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder={bot.name}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDelete(); }} disabled={deleteConfirm !== bot.name} className="bg-red-600 text-white hover:opacity-90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function OverviewTab({ metrics, conversations }: { metrics: { label: string; value: string }[]; conversations: Conversation[] }) {
  const recent = conversations.slice(0, 5);
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-2xl border p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>{m.label}</p>
            <p className="mt-2 text-2xl font-medium tracking-tight" style={{ color: "var(--text-primary)" }}>{m.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Recent</p>
        <p className="mt-1 text-lg font-medium tracking-tight" style={{ color: "var(--text-primary)" }}>Latest conversations</p>
        {recent.length === 0 ? (
          <p className="mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>No conversations yet.</p>
        ) : (
          <ul className="mt-4 space-y-0 divide-y divide-[var(--border-default)] text-sm">
            {recent.map((c) => (
              <li key={c._id} className="flex justify-between gap-3 py-3 first:pt-0">
                <span className="min-w-0 truncate" style={{ color: "var(--text-primary)" }}>{c.label || "Conversation"}</span>
                <span className="shrink-0 text-xs" style={{ color: "var(--text-tertiary)" }}>{timeAgo(c.lastMessageAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ConversationsTab({ conversations }: { conversations: Conversation[] }) {
  return (
    <div className="rounded-2xl border p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
      <h3 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>All conversations</h3>
      {conversations.length === 0 ? (
        <p className="mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>No conversations yet.</p>
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-sm min-w-[480px]">
            <thead><tr style={{ color: "var(--text-tertiary)" }}><th className="pb-2">Conversation</th><th>Messages</th><th>Status</th><th>Last activity</th></tr></thead>
            <tbody>
              {conversations.map((c) => (
                <tr key={c._id} className="border-t border-[var(--border-default)]">
                  <td className="py-2 pr-2 truncate max-w-[240px]">{c.label || "Conversation"}</td>
                  <td>{c.messageCount}</td>
                  <td>
                    {c.isResolved === null ? "—" : (
                      <span className="text-[11px] px-2 py-0.5 rounded-full" style={c.isResolved ? { background: "#EAF3DE", color: "#3B6D11" } : { background: "#FCEBEB", color: "#A32D2D" }}>
                        {c.isResolved ? "Resolved" : "Unresolved"}
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap">{timeAgo(c.lastMessageAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function KnowledgeTab({ botId, sources, onRefresh }: { botId: string; sources: KnowledgeSource[]; onRefresh: () => void }) {
  const [kbTab, setKbTab] = useState<"file" | "text">("file");
  const [pasteText, setPasteText] = useState("");
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState("");

  // Returns { ok, message } instead of nothing — lets callers know whether
  // the upload actually succeeded so they can show the right toast.
  const drainStream = async (res: Response): Promise<{ ok: boolean; message?: string }> => {
    const reader = res.body?.getReader();
    if (!reader) return { ok: false, message: "No response from server" };
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let boundary: number;
      while ((boundary = buffer.indexOf("\n\n")) !== -1) {
        const rawEvent = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);

        const lines = rawEvent.split("\n").filter(l => l.startsWith("data:"));
        for (const line of lines) {
          try {
            const data = JSON.parse(line.replace(/^data:\s*/, ""));
            if (data.error) return { ok: false, message: data.error || data.message || "Failed" };
            if (data.done) return { ok: true, message: data.message };
            if (data.message) setLog(data.message);
          } catch { }
        }
      }
    }
    return { ok: false, message: "Connection closed unexpectedly" };
  };

  const onDrop = useCallback(async (accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    setBusy(true);
    setLog(`Uploading ${file.name}...`);
    try {
      const form = new FormData();
      form.append("file", file, file.name);
      const res = await authFetch(`${API}/bots/${botId}/knowledge/pdf`, { method: "POST", body: form });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        const message = json.error || json.message || "Upload failed";
        toast.error(`'${file.name}' failed to upload: ${message}`);
        setLog(message);
        return; // backend already deleted the stuck doc, refresh in finally
      }

      const result = await drainStream(res);
      if (result.ok) {
        toast.success(`'${file.name}' uploaded successfully`);
        setLog("Done!");
      } else {
        toast.error(`'${file.name}' failed to upload: ${result.message}`);
        setLog(result.message || "Upload failed");
      }
    } catch (err: any) {
      toast.error(`'${file.name}' failed to upload: AI service may be offline`);
      setLog("Upload failed — AI service may be offline");
    } finally {
      setBusy(false);
      onRefresh(); // always refresh so failed/stuck docs disappear from the list
    }
  }, [botId, onRefresh]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "application/pdf": [".pdf"] }, multiple: false,
  });

  const addTextSource = async () => {
    if (pasteText.trim().length < 50) return;
    setBusy(true);
    setLog("Processing text...");
    try {
      const res = await authFetch(`${API}/bots/${botId}/knowledge/text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pasteText, name: "Pasted text" }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        const message = json.error || json.message || "Upload failed";
        toast.error(`Text source failed to upload: ${message}`);
        setLog(message);
        return;
      }

      const result = await drainStream(res);
      if (result.ok) {
        toast.success("Text source uploaded successfully");
        setLog("Done!");
        setPasteText("");
      } else {
        toast.error(`Text source failed to upload: ${result.message}`);
        setLog(result.message || "Upload failed");
      }
    } catch {
      toast.error("Text source failed to upload: AI service may be offline");
      setLog("Upload failed — AI service may be offline");
    } finally {
      setBusy(false);
      onRefresh();
    }
  };

  const toggleSourceStatus = async (source: KnowledgeSource) => {
    const newStatus = source.status === "active" ? "paused" : "active";
    await authFetch(`${API}/bots/${botId}/knowledge/${source._id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    onRefresh();
  };

  const deleteSource = async (id: string) => {
    await authFetch(`${API}/bots/${botId}/knowledge/${id}`, { method: "DELETE" });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
        <h3 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Add knowledge</h3>
        <div className="mt-4 flex gap-1 rounded-xl border p-1" style={{ borderColor: "var(--border-default)" }}>
          {(["file", "text"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setKbTab(t)}
              className="flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all"
              style={{ background: kbTab === t ? "var(--text-primary)" : "transparent", color: kbTab === t ? "white" : "var(--text-secondary)" }}>
              {t === "file" ? "PDF" : "Paste text"}
            </button>
          ))}
        </div>
        {kbTab === "file" && (
          <div {...getRootProps()} className="mt-4 cursor-pointer rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors" style={{ borderColor: isDragActive ? "var(--text-primary)" : "var(--border-default)" }}>
            <input {...getInputProps()} />
            <FileText className="mx-auto mb-2 opacity-50" size={28} />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Drop PDF, or click to browse</p>
          </div>
        )}
        {kbTab === "text" && (
          <div className="mt-4">
            <textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)} rows={6}
              className="w-full rounded-xl border px-3 py-2.5 text-sm" style={{ borderColor: "var(--border-default)" }} placeholder="At least 50 characters…" />
            <button type="button" disabled={pasteText.trim().length < 50 || busy} onClick={addTextSource}
              className="mt-3 rounded-xl px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40" style={{ background: "var(--text-primary)" }}>
              Add text source
            </button>
          </div>
        )}
        {log && <p className="mt-3 text-xs" style={{ color: "var(--text-secondary)" }}>{log}</p>}
      </div>

      <div className="overflow-x-auto rounded-2xl border shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead><tr style={{ color: "var(--text-tertiary)" }}><th className="px-4 py-3">Source</th><th className="px-4 py-3">Chunks</th><th className="px-4 py-3">Added</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr></thead>
          <tbody>
            {sources.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-sm" style={{ color: "var(--text-tertiary)" }}>No knowledge sources yet</td></tr>
            )}
            {sources.map((s) => (
              <tr key={s._id} className="border-t border-[var(--border-default)]">
                <td className="px-4 py-3 flex items-center gap-2">
                  {s.type === "pdf" ? <FileText size={14} /> : <Link2 size={14} />} {s.name}
                </td>
                <td className="px-4 py-3">{s.chunkCount}</td>
                <td className="px-4 py-3">{new Date(s.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleSourceStatus(s)} className="text-xs underline capitalize" style={{ color: "var(--text-primary)" }}>
                    {s.status}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <Popover>
                    <PopoverTrigger asChild><button type="button" className="text-xs underline text-red-600">Delete</button></PopoverTrigger>
                    <PopoverContent className="w-56 p-3 text-sm">
                      <p style={{ color: "var(--text-secondary)" }}>Remove this source?</p>
                      <button type="button" className="mt-2 w-full rounded-lg py-1.5 text-xs text-white bg-red-600" onClick={() => deleteSource(s._id)}>Confirm delete</button>
                    </PopoverContent>
                  </Popover>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AppearanceEditor({ bot, onSaved }: { bot: Bot; onSaved: (b: Bot) => void }) {
  const [cfg, setCfg] = useState<WidgetConfig>(bot.widgetConfig);
  const [saving, setSaving] = useState(false);

  const previewFont = (BOT_FONT_STACK as Record<string, string>)[cfg.chatFont] ?? cfg.chatFont;
  const chatShell = cfg.panelTheme === "dark"
    ? { bg: "#171717", surface: "#262626", text: "#fafafa", muted: "#a3a3a3", bubbleBot: "#404040", border: "#404040" }
    : { bg: "#ffffff", surface: "#f5f5f5", text: "#0a0a0a", muted: "#737373", bubbleBot: "#f0f0f0", border: "#e5e5e5" };

  const save = async () => {
    setSaving(true);
    try {
      const res = await authFetch(`${API}/bots/${bot._id}/appearance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });
      const data = await res.json();
      if (res.ok) onSaved(data.bot);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_min(340px,100%)]">
      <div className="space-y-6">
        <div className="rounded-2xl border p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Launcher</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <DetailField label="Position">
              <select className="mt-1.5 w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: "var(--border-default)" }} value={cfg.position} onChange={(e) => setCfg({ ...cfg, position: e.target.value })}>
                <option value="bottom-right">Bottom right</option><option value="bottom-left">Bottom left</option>
              </select>
            </DetailField>
            <DetailField label="Shape">
              <select className="mt-1.5 w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: "var(--border-default)" }} value={cfg.launcherShape} onChange={(e) => setCfg({ ...cfg, launcherShape: e.target.value })}>
                <option value="circle">Circle</option><option value="rounded">Rounded</option><option value="square">Square</option>
              </select>
            </DetailField>
            <DetailField label="Size">
              <select className="mt-1.5 w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: "var(--border-default)" }} value={cfg.launcherSize} onChange={(e) => setCfg({ ...cfg, launcherSize: e.target.value })}>
                <option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option>
              </select>
            </DetailField>
          </div>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Launcher color</p>
              <div className="mt-2 flex justify-center rounded-xl border p-3" style={{ borderColor: "var(--border-default)" }}>
                <HexColorPicker color={cfg.launcherColor} onChange={(launcherColor) => setCfg({ ...cfg, launcherColor })} style={{ width: 120, height: 120 }} />
              </div>
            </div>
            <DetailField label="Tooltip">
              <input className="mt-1.5 w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: "var(--border-default)" }} value={cfg.tooltipText} onChange={(e) => setCfg({ ...cfg, tooltipText: e.target.value })} />
            </DetailField>
          </div>
        </div>

        <div className="rounded-2xl border p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Chat interface</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <DetailField label="Panel theme">
              <select className="mt-1.5 w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: "var(--border-default)" }} value={cfg.panelTheme} onChange={(e) => setCfg({ ...cfg, panelTheme: e.target.value })}>
                <option value="light">Light</option><option value="dark">Dark</option>
              </select>
            </DetailField>
            <DetailField label="Font">
              <select className="mt-1.5 w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: "var(--border-default)" }} value={cfg.chatFont} onChange={(e) => setCfg({ ...cfg, chatFont: e.target.value })}>
                {FONT_OPTIONS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
            </DetailField>
          </div>
          <div className="mt-5">
            <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Accent color</p>
            <div className="mt-2 flex justify-center rounded-xl border p-3" style={{ borderColor: "var(--border-default)" }}>
              <HexColorPicker color={cfg.accentColor} onChange={(accentColor) => setCfg({ ...cfg, accentColor })} style={{ width: 120, height: 120 }} />
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <DetailField label="Welcome message">
              <input className="mt-1.5 w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: "var(--border-default)" }} value={cfg.welcomeMessage} onChange={(e) => setCfg({ ...cfg, welcomeMessage: e.target.value })} />
            </DetailField>
            <DetailField label="Input placeholder">
              <input className="mt-1.5 w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: "var(--border-default)" }} value={cfg.inputPlaceholder} onChange={(e) => setCfg({ ...cfg, inputPlaceholder: e.target.value })} />
            </DetailField>
          </div>
          <div className="mt-6 grid gap-4 border-t pt-6 sm:grid-cols-2" style={{ borderColor: "var(--border-default)" }}>
            <DetailField label="Fallback reply">
              <textarea rows={2} className="mt-1.5 w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: "var(--border-default)" }} value={cfg.fallbackReply} onChange={(e) => setCfg({ ...cfg, fallbackReply: e.target.value })} />
            </DetailField>
            <DetailField label="Paused message">
              <textarea rows={2} className="mt-1.5 w-full rounded-xl border px-3 py-2 text-sm" style={{ borderColor: "var(--border-default)" }} value={cfg.pausedMessage} onChange={(e) => setCfg({ ...cfg, pausedMessage: e.target.value })} />
            </DetailField>
          </div>
          <button type="button" disabled={saving} className="mt-6 rounded-xl px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50" style={{ background: "var(--text-primary)" }} onClick={save}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-4 lg:self-start">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Preview</p>
        <div className="mt-3 overflow-hidden rounded-2xl border shadow-[0_8px_30px_rgba(0,0,0,0.08)]" style={{ borderColor: chatShell.border, fontFamily: previewFont }}>
          <div className="px-4 py-3 text-white" style={{ background: cfg.accentColor }}>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/15 text-lg">
                {bot.botAvatar.startsWith("data") ? <img src={bot.botAvatar} alt="" className="h-full w-full object-cover" /> : bot.botAvatar}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{bot.name}</p>
                <p className="mt-0.5 text-xs text-white/70">{bot.description || "No description"}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3 p-4" style={{ background: chatShell.bg, minHeight: 180 }}>
            <div className="max-w-[92%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm leading-relaxed shadow-sm" style={{ background: chatShell.bubbleBot, color: chatShell.text }}>
              {cfg.welcomeMessage}
            </div>
            <div className="flex items-center gap-2 rounded-full border px-3 py-2.5 text-sm shadow-inner" style={{ borderColor: chatShell.border, background: chatShell.surface, color: chatShell.muted }}>
              <span className="min-w-0 flex-1 truncate">{cfg.inputPlaceholder}</span>
              <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white" style={{ background: cfg.accentColor }}>Send</span>
            </div>
            {cfg.showPoweredBy && <p className="text-center text-[10px]" style={{ color: chatShell.muted }}>Powered by BotBase</p>}
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <div className="flex items-center justify-center text-lg text-white shadow-lg"
            style={{
              width: cfg.launcherSize === "small" ? 44 : cfg.launcherSize === "large" ? 60 : 52,
              height: cfg.launcherSize === "small" ? 44 : cfg.launcherSize === "large" ? 60 : 52,
              borderRadius: cfg.launcherShape === "circle" ? "9999px" : "14px",
              background: cfg.launcherColor,
            }}
            title={cfg.tooltipText}
          >
            {bot.botAvatar.startsWith("data") ? <img src={bot.botAvatar} alt="" className="h-[55%] w-[55%] object-contain" /> : bot.botAvatar}
          </div>
        </div>
      </aside>
    </div>
  );
}

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{label}</span>
      {children}
    </label>
  );
}

function BotSettingsTab({
  bot, rename, setRename, renameDesc, setRenameDesc, onSave, onDeleteOpen,
}: {
  bot: Bot; rename: string; setRename: (s: string) => void;
  renameDesc: string; setRenameDesc: (s: string) => void;
  onSave: () => void; onDeleteOpen: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="rounded-2xl border p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
        <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Bot name</label>
        <input className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--border-default)" }} value={rename} onChange={(e) => setRename(e.target.value)} onBlur={onSave} />
      </div>
      <div className="rounded-2xl border p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
        <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Description</label>
        <textarea className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" style={{ borderColor: "var(--border-default)" }} rows={3} value={renameDesc} onChange={(e) => setRenameDesc(e.target.value)} onBlur={onSave} />
      </div>
      <div className="border-t pt-6" style={{ borderColor: "var(--border-default)" }}>
        <button type="button" className="w-full rounded-xl border py-3 text-sm font-medium text-red-600 border-red-600" onClick={onDeleteOpen}>
          Delete bot
        </button>
      </div>
    </div>
  );
}

function EmbedTab({ botId }: { botId: string }) {
  const [copied, setCopied] = useState(false);

  const embedScript = `<script\n  src="https://bot-base-alpha.vercel.app/script.js"\n  data-bot-id="${botId}"\n  async\n></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="rounded-2xl border p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}>
        <h3 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Embed Script</h3>
        <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
          Copy this snippet and paste it into your website's HTML, right before the closing <code className="rounded bg-black/5 px-1 py-0.5 text-[11px]">&lt;/body&gt;</code> tag.
        </p>

        <div className="mt-4 relative rounded-xl border" style={{ borderColor: "var(--border-default)" }}>
          <pre className="overflow-x-auto p-4 text-[12px] leading-relaxed" style={{ color: "var(--text-primary)", fontFamily: "monospace", background: "var(--bg-secondary)" }}>
            {embedScript}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all"
            style={{
              borderColor: "var(--border-default)",
              background: "var(--bg-primary)",
              color: copied ? "#16A34A" : "var(--text-secondary)",
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div className="mt-4 rounded-xl border p-4" style={{ borderColor: "var(--border-default)", background: "var(--bg-secondary)" }}>
          <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Bot ID</p>
          <p className="mt-1 font-mono text-[13px]" style={{ color: "var(--text-primary)" }}>{botId}</p>
        </div>
      </div>
    </div>
  );
}