import React, { useCallback, useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { HexColorPicker } from "react-colorful";
import { Check, FileText, Link2, Trash2 } from "lucide-react";
import {
  defaultAppearance,
  type BotAppearance,
  type BotFontId,
} from "./DashboardBotsContext";
import { BOT_FONT_STACK, FONT_OPTIONS } from "./botFonts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

const API = "http://localhost:5000/api";

const STEPS = ["Identity", "Knowledge", "Appearance", "Deploy"] as const;
const ICONS = ["💬", "💼", "🤖", "🎓", "📦", "⚡", "🔮", "🧠", "📚", "🛟", "✨", "🌐", "📎", "🎯", "💡", "🏷️"];
const LANGS = [
  { v: "en", l: "English" },
  { v: "es", l: "Spanish" },
  { v: "fr", l: "French" },
  { v: "de", l: "German" },
];

// ─── Pending knowledge item (held in state, not yet uploaded) ─────────────────
type PendingChunk =
  | { id: string; type: "file"; name: string; file: File; status: "pending" | "uploading" | "ready" | "failed" }
  | { id: string; type: "text"; name: string; text: string; status: "pending" | "uploading" | "ready" | "failed" };

// ─── Map frontend appearance → backend widgetConfig ───────────────────────────
function toWidgetConfig(a: BotAppearance) {
  const posMap: Record<string, string> = { br: "bottom-right", bl: "bottom-left" };
  const sizeMap: Record<string, string> = { sm: "small", md: "medium", lg: "large" };
  const shapeMap: Record<string, string> = { circle: "circle", rounded: "rounded", square: "square" };

  return {
    position: posMap[a.widgetPosition] ?? "bottom-right",
    launcherSize: sizeMap[a.widgetSize] ?? "medium",
    launcherShape: shapeMap[a.widgetShape] ?? "circle",
    launcherColor: a.widgetBg,
    tooltipText: a.widgetTooltip,
    panelTheme: a.chatTheme === "auto" ? "light" : a.chatTheme,
    chatFont: a.fontId,
    accentColor: a.primaryColor,
    welcomeMessage: a.welcomeMessage,
    inputPlaceholder: a.inputPlaceholder,
    showPoweredBy: a.poweredBy,
    fallbackReply: a.fallbackMessage,
    pausedMessage: a.pausedMessage,
    responseStyle: a.responseStyle,
    language: a.language,
  };
}

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

export function CreateBotWizardModal({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Step 0 — Identity
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("💬");
  const [description, setDescription] = useState("");
  const [iconDataUrl, setIconDataUrl] = useState<string | null>(null);

  // Step 1 — Knowledge (held in state, uploaded after bot creation)
  const [chunks, setChunks] = useState<PendingChunk[]>([]);
  const [kbTab, setKbTab] = useState<"file" | "text">("file");
  const [pasteText, setPasteText] = useState("");

  // Step 2 — Appearance
  const [appearance, setAppearance] = useState<BotAppearance>(() => defaultAppearance());

  // Step 3 — after creation
  const [createdBotId, setCreatedBotId] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [finishLog, setFinishLog] = useState("");

  useEffect(() => {
    if (!open) {
      setStep(0); setName(""); setEmoji("💬"); setDescription("");
      setIconDataUrl(null); setChunks([]); setKbTab("file");
      setPasteText(""); setAppearance(defaultAppearance());
      setCreatedBotId(null); setFinishing(false); setFinishLog("");
    }
  }, [open]);

  const canNext = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return chunks.length > 0;
    return true;
  };

  const goNext = () => { if (step < STEPS.length - 1 && canNext()) setStep(s => s + 1); };
  const goBack = () => setStep(s => Math.max(0, s - 1));

  // ─── Step 1: just add file to pending state, don't upload yet ───────────────
  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    const id = `tmp_${crypto.randomUUID().slice(0, 8)}`;
    setChunks(c => [...c, { id, type: "file", name: file.name, file, status: "pending" }]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "text/plain": [".txt"] },
    multiple: false,
  });

  const addTextSource = () => {
    if (pasteText.trim().length < 50) return;
    const id = `tmp_${crypto.randomUUID().slice(0, 8)}`;
    setChunks(c => [...c, { id, type: "text", name: "Pasted text", text: pasteText, status: "pending" }]);
    setPasteText("");
  };

  const removeChunk = (id: string) => setChunks(c => c.filter(x => x.id !== id));

  const onIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 400_000) return;
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") setIconDataUrl(reader.result); };
    reader.readAsDataURL(file);
  };

  // ─── Step 3: create bot then upload knowledge sources ────────────────────────
  const finish = async () => {
    setFinishing(true);
    setFinishLog("Creating bot...");

    try {
      // 1. Create the bot
      const botRes = await fetch(`${API}/bots`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          botAvatar: iconDataUrl || emoji,
          widgetConfig: toWidgetConfig(appearance),
        }),
      });

      const botData = await botRes.json();
      if (!botRes.ok) throw new Error(botData.error || "Failed to create bot");

      const botId = botData.bot._id;
      setCreatedBotId(botId);

      // 2. Upload each knowledge source (fire and don't block navigation)
      for (const chunk of chunks) {
        setFinishLog(`Uploading '${chunk.name}'...`);

        if (chunk.type === "file") {
          const form = new FormData();
          form.append("file", chunk.file, chunk.name);

          // Update status to uploading
          setChunks(c => c.map(x => x.id === chunk.id ? { ...x, status: "uploading" } : x));

          const res = await fetch(`${API}/bots/${botId}/knowledge/pdf`, {
            method: "POST",
            credentials: "include",
            body: form,
          });

          setChunks(c => c.map(x =>
            x.id === chunk.id ? { ...x, status: res.ok ? "ready" : "failed" } : x
          ));
        }

        if (chunk.type === "text") {
          setChunks(c => c.map(x => x.id === chunk.id ? { ...x, status: "uploading" } : x));

          const res = await fetch(`${API}/bots/${botId}/knowledge/text`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: chunk.text, name: chunk.name }),
          });

          setChunks(c => c.map(x =>
            x.id === chunk.id ? { ...x, status: res.ok ? "ready" : "failed" } : x
          ));
        }
      }

      setFinishLog("Done!");
      setStep(3); // move to deploy step to show embed snippet

    } catch (err: any) {
      setFinishLog(`Error: ${err.message}`);
    } finally {
      setFinishing(false);
    }
  };

  const openBot = () => {
    onOpenChange(false);
    if (createdBotId) navigate(`/dashboard/bots/${createdBotId}`, { replace: true });
  };

  const snippet = createdBotId
    ? `<script src="https://botbase.ai/widget.js" data-bot-id="${createdBotId}"></script>`
    : `<script src="https://botbase.ai/widget.js" data-bot-id="YOUR_BOT_ID"></script>`;

  const previewFont = BOT_FONT_STACK[appearance.fontId];
  const chatShell = appearance.chatTheme === "dark"
    ? { bg: "#171717", surface: "#262626", text: "#fafafa", muted: "#a3a3a3", bubbleBot: "#404040", border: "#404040" }
    : { bg: "#ffffff", surface: "#f5f5f5", text: "#0a0a0a", muted: "#737373", bubbleBot: "#f0f0f0", border: "#e5e5e5" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed top-1/2 left-1/2 z-50 flex max-h-[min(920px,94vh)] w-[calc(100%-1.25rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 flex-col gap-0 overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-0 shadow-2xl sm:max-h-[92vh]">
        <DialogHeader className="shrink-0 border-b border-[var(--border-default)] px-5 py-4 text-left sm:px-6">
          <DialogTitle className="text-lg font-medium tracking-tight" style={{ color: "var(--text-primary)" }}>
            Create a bot
          </DialogTitle>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
                  style={{
                    background: i <= step ? "var(--text-primary)" : "var(--bg-tertiary)",
                    color: i <= step ? "white" : "var(--text-tertiary)",
                    border: i > step ? "1px solid var(--border-default)" : "none",
                  }}
                >
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span className="hidden text-xs font-medium sm:inline" style={{ color: i === step ? "var(--text-primary)" : "var(--text-tertiary)" }}>
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className="hidden h-px w-6 sm:block" style={{ background: i < step ? "var(--text-primary)" : "var(--border-default)" }} />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 overflow-y-auto lg:grid-cols-[1fr_300px]">
          <div className="min-w-0 space-y-6 px-5 py-6 sm:px-6">

            {/* ── Step 0: Identity ── */}
            {step === 0 && (
              <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)]/60 p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Identity</p>
                <h2 className="mt-1 text-lg font-medium tracking-tight" style={{ color: "var(--text-primary)" }}>Name &amp; avatar</h2>
                <label className="mt-5 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Bot name *</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--text-primary)]/15"
                  placeholder="e.g. Support Bot"
                />
                <label className="mt-5 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  className="mt-2 w-full resize-none rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--text-primary)]/15"
                  placeholder="One line about what this bot helps with"
                />
                <p className="mt-5 text-sm font-medium" style={{ color: "var(--text-primary)" }}>Avatar</p>
                <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>Pick an emoji or upload a square image (PNG/JPG/WebP, max ~400KB).</p>
                <div className="mt-3 flex flex-wrap items-start gap-4">
                  <label className="flex cursor-pointer flex-col items-center gap-2">
                    <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed text-xs font-medium transition-colors hover:bg-[var(--bg-tertiary)]" style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}>
                      {iconDataUrl ? <img src={iconDataUrl} alt="" className="h-full w-full object-cover" /> : "Upload"}
                    </span>
                    <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onIconUpload} />
                  </label>
                  {iconDataUrl && (
                    <button type="button" className="text-xs font-medium underline" style={{ color: "var(--text-primary)" }} onClick={() => setIconDataUrl(null)}>
                      Remove image
                    </button>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {ICONS.map(ic => (
                    <button
                      key={ic} type="button"
                      onClick={() => { setEmoji(ic); setIconDataUrl(null); }}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border text-xl transition-all"
                      style={{
                        borderColor: emoji === ic && !iconDataUrl ? "var(--text-primary)" : "var(--border-default)",
                        background: emoji === ic && !iconDataUrl ? "var(--bg-tertiary)" : "var(--bg-primary)",
                      }}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 1: Knowledge ── */}
            {step === 1 && (
              <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)]/60 p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Knowledge</p>
                <h2 className="mt-1 text-lg font-medium tracking-tight" style={{ color: "var(--text-primary)" }}>Train your bot</h2>
                <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>Files will be uploaded when you create the bot.</p>
                <div className="mt-5 flex gap-1 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-1">
                  {(["file", "text"] as const).map(t => (
                    <button key={t} type="button" onClick={() => setKbTab(t)}
                      className="flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all"
                      style={{ background: kbTab === t ? "var(--text-primary)" : "transparent", color: kbTab === t ? "white" : "var(--text-secondary)" }}
                    >
                      {t === "file" ? "Files" : "Paste text"}
                    </button>
                  ))}
                </div>
                {kbTab === "file" && (
                  <div
                    {...getRootProps()}
                    className="mt-4 cursor-pointer rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors"
                    style={{ borderColor: isDragActive ? "var(--text-primary)" : "var(--border-default)", background: "var(--bg-primary)" }}
                  >
                    <input {...getInputProps()} />
                    <FileText className="mx-auto mb-2 opacity-50" size={28} />
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Drop PDF or TXT, or click to browse</p>
                  </div>
                )}
                {kbTab === "text" && (
                  <div className="mt-4">
                    <textarea
                      value={pasteText}
                      onChange={e => setPasteText(e.target.value)}
                      rows={8}
                      className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm"
                      placeholder="At least 50 characters…"
                    />
                    <button
                      type="button"
                      disabled={pasteText.trim().length < 50}
                      onClick={addTextSource}
                      className="mt-3 rounded-xl px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40"
                      style={{ background: "var(--text-primary)" }}
                    >
                      Add text source
                    </button>
                  </div>
                )}
                <ul className="mt-4 space-y-2">
                  {chunks.map(c => (
                    <li key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2.5">
                      <div className="flex min-w-0 items-center gap-2">
                        {c.type === "file" ? <FileText size={16} /> : <Link2 size={16} />}
                        <span className="truncate text-sm" style={{ color: "var(--text-primary)" }}>{c.name}</span>
                        <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                          style={{
                            background: c.status === "ready" ? "#F0FDF4" : c.status === "failed" ? "#FEF2F2" : "var(--bg-tertiary)",
                            color: c.status === "ready" ? "#166534" : c.status === "failed" ? "#991B1B" : "var(--text-secondary)",
                          }}
                        >
                          {c.status === "pending" ? "queued" : c.status}
                        </span>
                      </div>
                      <button type="button" onClick={() => removeChunk(c.id)} className="shrink-0 rounded-lg p-1.5 hover:bg-[var(--bg-secondary)]">
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Step 2: Appearance ── */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)]/60 p-5 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Launcher</p>
                  <h2 className="mt-1 text-lg font-medium tracking-tight" style={{ color: "var(--text-primary)" }}>Widget on your site</h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <LabeledSelect label="Position" value={appearance.widgetPosition} onChange={v => setAppearance(a => ({ ...a, widgetPosition: v as any }))} options={[{ v: "br", l: "Bottom right" }, { v: "bl", l: "Bottom left" }]} />
                    <LabeledSelect label="Shape" value={appearance.widgetShape} onChange={v => setAppearance(a => ({ ...a, widgetShape: v as any }))} options={[{ v: "circle", l: "Circle" }, { v: "rounded", l: "Rounded" }]} />
                    <LabeledSelect label="Size" value={appearance.widgetSize} onChange={v => setAppearance(a => ({ ...a, widgetSize: v as any }))} options={[{ v: "sm", l: "Small" }, { v: "md", l: "Medium" }, { v: "lg", l: "Large" }]} />
                  </div>
                  <div className="mt-5 grid gap-6 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Launcher color</p>
                      <div className="mt-2 flex justify-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-3">
                        <HexColorPicker color={appearance.widgetBg} onChange={widgetBg => setAppearance(a => ({ ...a, widgetBg }))} style={{ width: 140, height: 140 }} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Tooltip</p>
                      <input className="mt-2 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm" value={appearance.widgetTooltip} onChange={e => setAppearance(a => ({ ...a, widgetTooltip: e.target.value }))} />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)]/60 p-5 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Chat panel</p>
                  <h2 className="mt-1 text-lg font-medium tracking-tight" style={{ color: "var(--text-primary)" }}>Look &amp; copy</h2>
                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <LabeledSelect label="Panel theme" value={appearance.chatTheme} onChange={v => setAppearance(a => ({ ...a, chatTheme: v as any }))} options={[{ v: "light", l: "Light" }, { v: "dark", l: "Dark" }, { v: "auto", l: "Auto" }]} />
                    <div>
                      <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Chat font</p>
                      <select className="mt-2 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm" value={appearance.fontId} onChange={e => setAppearance(a => ({ ...a, fontId: e.target.value as BotFontId }))}>
                        {FONT_OPTIONS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mt-5">
                    <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Accent (header &amp; buttons)</p>
                    <div className="mt-2 flex justify-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-3">
                      <HexColorPicker color={appearance.primaryColor} onChange={primaryColor => setAppearance(a => ({ ...a, primaryColor }))} style={{ width: 140, height: 140 }} />
                    </div>
                  </div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <Field label="Welcome message">
                      <input className="mt-1.5 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm" value={appearance.welcomeMessage} onChange={e => setAppearance(a => ({ ...a, welcomeMessage: e.target.value }))} />
                    </Field>
                    <Field label="Input placeholder">
                      <input className="mt-1.5 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm" value={appearance.inputPlaceholder} onChange={e => setAppearance(a => ({ ...a, inputPlaceholder: e.target.value }))} />
                    </Field>
                  </div>
                  <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <input type="checkbox" className="h-4 w-4 rounded border-[var(--border-default)]" checked={appearance.poweredBy} onChange={e => setAppearance(a => ({ ...a, poweredBy: e.target.checked }))} />
                    Show "Powered by BotBase" in widget
                  </label>
                  <div className="mt-6 grid gap-4 border-t border-[var(--border-default)] pt-6 sm:grid-cols-2">
                    <Field label="Fallback reply">
                      <textarea rows={2} className="mt-1.5 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm" value={appearance.fallbackMessage} onChange={e => setAppearance(a => ({ ...a, fallbackMessage: e.target.value }))} />
                    </Field>
                    <Field label="Paused message">
                      <textarea rows={2} className="mt-1.5 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm" value={appearance.pausedMessage} onChange={e => setAppearance(a => ({ ...a, pausedMessage: e.target.value }))} />
                    </Field>
                  </div>
                  <div className="mt-5">
                    <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Response style</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(["formal", "friendly", "concise"] as const).map(r => (
                        <button key={r} type="button" onClick={() => setAppearance(a => ({ ...a, responseStyle: r }))}
                          className="rounded-xl px-4 py-2 text-sm font-medium capitalize transition-all"
                          style={{
                            background: appearance.responseStyle === r ? "var(--text-primary)" : "var(--bg-primary)",
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
                    <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Language</p>
                    <select className="mt-2 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm" value={appearance.language} onChange={e => setAppearance(a => ({ ...a, language: e.target.value }))}>
                      {LANGS.map(l => <option key={l.v} value={l.v}>{l.l}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Deploy ── */}
            {step === 3 && (
              <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-secondary)]/60 p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Deploy</p>
                <h2 className="mt-1 text-lg font-medium tracking-tight" style={{ color: "var(--text-primary)" }}>Install snippet</h2>
                <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  Paste before the closing <code className="rounded bg-[var(--bg-tertiary)] px-1">&lt;/body&gt;</code> tag.
                </p>
                <pre className="mt-4 overflow-x-auto rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-4 text-xs leading-relaxed" style={{ color: "var(--text-primary)" }}>
                  {snippet}
                </pre>
                {/* Knowledge upload status */}
                {chunks.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Knowledge sources</p>
                    <ul className="space-y-1">
                      {chunks.map(c => (
                        <li key={c.id} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                          <span className={`w-2 h-2 rounded-full ${c.status === "ready" ? "bg-green-500" : c.status === "failed" ? "bg-red-500" : "bg-yellow-400"}`} />
                          {c.name} — {c.status}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* ── Navigation buttons ── */}
            <div className="flex flex-wrap gap-3 pb-2">
              {step > 0 && step < 3 && (
                <button type="button" onClick={goBack} className="rounded-xl border border-[var(--border-default)] px-5 py-2.5 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  Back
                </button>
              )}
              {step < 2 && (
                <button type="button" disabled={!canNext()} onClick={goNext} className="rounded-xl px-6 py-2.5 text-sm font-medium text-white disabled:opacity-40" style={{ background: "var(--text-primary)" }}>
                  Continue
                </button>
              )}
              {step === 2 && (
                <button type="button" disabled={finishing} onClick={finish} className="rounded-xl px-6 py-2.5 text-sm font-medium text-white disabled:opacity-40" style={{ background: "var(--text-primary)" }}>
                  {finishing ? (finishLog || "Creating...") : "Create Bot"}
                </button>
              )}
              {step === 3 && (
                <button type="button" onClick={openBot} className="rounded-xl px-6 py-2.5 text-sm font-medium text-white" style={{ background: "var(--text-primary)" }}>
                  Open bot →
                </button>
              )}
            </div>
          </div>

          {/* ── Live preview ── */}
          <aside className="border-t border-[var(--border-default)] bg-[var(--bg-secondary)]/80 p-5 lg:border-l lg:border-t-0">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Live preview</p>
            <div className="mt-4 overflow-hidden rounded-2xl border shadow-[0_8px_30px_rgba(0,0,0,0.08)]" style={{ borderColor: chatShell.border, fontFamily: previewFont }}>
              <div className="px-4 py-3 text-white" style={{ background: appearance.primaryColor }}>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/15 text-lg">
                    {iconDataUrl ? <img src={iconDataUrl} alt="" className="h-full w-full object-cover" /> : emoji}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{name || "Your bot"}</p>
                    {description.trim()
                      ? <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-white/85">{description}</p>
                      : <p className="mt-0.5 text-xs text-white/70">Add a description on step 1</p>
                    }
                  </div>
                </div>
              </div>
              <div className="space-y-3 p-4" style={{ background: chatShell.bg, minHeight: 200 }}>
                <div className="max-w-[92%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm leading-relaxed shadow-sm" style={{ background: chatShell.bubbleBot, color: chatShell.text }}>
                  {appearance.welcomeMessage}
                </div>
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md px-3.5 py-2.5 text-sm shadow-sm" style={{ background: appearance.primaryColor, color: "white" }}>
                  Example visitor question
                </div>
                <div className="flex items-center gap-2 rounded-full border px-3 py-2.5 text-sm shadow-inner" style={{ borderColor: chatShell.border, background: chatShell.surface, color: chatShell.muted }}>
                  <span className="min-w-0 flex-1 truncate">{appearance.inputPlaceholder}</span>
                  <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white" style={{ background: appearance.primaryColor }}>Send</span>
                </div>
                {appearance.poweredBy && <p className="text-center text-[10px]" style={{ color: chatShell.muted }}>Powered by BotBase</p>}
              </div>
            </div>
            <div className="mt-8 flex justify-center">
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
                {iconDataUrl ? <img src={iconDataUrl} alt="" className="h-[55%] w-[55%] object-contain" /> : emoji}
              </div>
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{label}</span>
      {children}
    </label>
  );
}

function LabeledSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <div>
      <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{label}</p>
      <select className="mt-2 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}