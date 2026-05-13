import React, { useCallback, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { HexColorPicker } from "react-colorful";
import { Check, FileText, Globe, Link2, Trash2, X } from "lucide-react";
import { postIngestFile, postIngestText, postIngestUrl } from "../lib/api";
import { defaultAppearance, type BotAppearance, type KnowledgeChunk } from "./DashboardBotsContext";
import { useDashboardBots } from "./DashboardBotsContext";

const STEPS = ["Identity", "Knowledge base", "Appearance", "Deploy"] as const;
const ICONS = ["💬", "💼", "🤖", "🎓", "📦", "⚡", "🔮", "🧠", "📚", "🛟", "✨", "🌐", "📎", "🎯", "💡", "🏷️"];

const LANGS = [
  { v: "en", l: "English" },
  { v: "es", l: "Spanish" },
  { v: "fr", l: "French" },
  { v: "de", l: "German" },
];

export function BotCreationWizardPage() {
  const navigate = useNavigate();
  const { addBot } = useDashboardBots();
  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("💬");
  const [description, setDescription] = useState("");

  const [chunks, setChunks] = useState<KnowledgeChunk[]>([]);
  const [kbTab, setKbTab] = useState<"file" | "text" | "url">("file");
  const [pasteText, setPasteText] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [ingestBusy, setIngestBusy] = useState(false);
  const [ingestLog, setIngestLog] = useState("");

  const [appearance, setAppearance] = useState<BotAppearance>(() => defaultAppearance());
  const [domains, setDomains] = useState<string[]>(["localhost"]);
  const [domainInput, setDomainInput] = useState("");

  const canNext = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return chunks.length > 0;
    return true;
  };

  const goNext = () => {
    if (step < STEPS.length - 1 && canNext()) setStep(step + 1);
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;
      const id = `tmp_${crypto.randomUUID().slice(0, 8)}`;
      setChunks((c) => [
        ...c,
        {
          id,
          name: file.name,
          type: "file",
          sizeLabel: `${(file.size / 1024).toFixed(0)} KB`,
          addedAt: new Date().toLocaleDateString(),
          status: "processing",
        },
      ]);
      setIngestBusy(true);
      setIngestLog("");
      try {
        await postIngestFile(file, { botName: name || file.name }, (ev) => {
          if (typeof ev.message === "string") setIngestLog(ev.message);
          if (ev.error) throw new Error(String(ev.message));
          if (ev.done) {
            setChunks((c) =>
              c.map((x) => (x.id === id ? { ...x, status: "ready" as const, name: String(ev.source || file.name) } : x)),
            );
          }
        });
      } catch {
        setChunks((c) => c.map((x) => (x.id === id ? { ...x, status: "failed" as const } : x)));
      } finally {
        setIngestBusy(false);
      }
    },
    [name],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"], "text/plain": [".txt"] },
    multiple: false,
  });

  const addTextSource = async () => {
    if (pasteText.trim().length < 50) return;
    const id = `tmp_${crypto.randomUUID().slice(0, 8)}`;
    setChunks((c) => [
      ...c,
      {
        id,
        name: "Pasted text",
        type: "text",
        addedAt: new Date().toLocaleDateString(),
        status: "processing",
      },
    ]);
    setIngestBusy(true);
    try {
      await postIngestText(pasteText, { botName: name || "Text bot" }, (ev) => {
        if (ev.done) {
          setChunks((c) => c.map((x) => (x.id === id ? { ...x, status: "ready" as const } : x)));
        }
      });
      setPasteText("");
    } catch {
      setChunks((c) => c.map((x) => (x.id === id ? { ...x, status: "failed" as const } : x)));
    } finally {
      setIngestBusy(false);
    }
  };

  const addUrlSource = async () => {
    if (!urlInput.trim()) return;
    const id = `tmp_${crypto.randomUUID().slice(0, 8)}`;
    setChunks((c) => [
      ...c,
      {
        id,
        name: urlInput.slice(0, 48),
        type: "url",
        addedAt: new Date().toLocaleDateString(),
        status: "processing",
      },
    ]);
    setIngestBusy(true);
    try {
      await postIngestUrl(urlInput.trim(), { botName: name || "URL bot" }, (ev) => {
        if (ev.done) {
          setChunks((c) =>
            c.map((x) =>
              x.id === id ? { ...x, status: "ready" as const, name: String(ev.source || urlInput).slice(0, 48) } : x,
            ),
          );
        }
      });
      setUrlInput("");
    } catch {
      setChunks((c) => c.map((x) => (x.id === id ? { ...x, status: "failed" as const } : x)));
    } finally {
      setIngestBusy(false);
    }
  };

  const removeChunk = (id: string) => setChunks((c) => c.filter((x) => x.id !== id));

  const finish = () => {
    const bot = addBot({
      name: name.trim(),
      emoji,
      description,
      status: "active",
      messagesThisWeek: 0,
      messagesMonth: 0,
      usersMonth: 0,
      storageMb: 2 + chunks.length * 0.2,
      avgConfidence: 0.82,
      gapsCount: 0,
      domains: domains.length ? domains : ["localhost"],
      webhookEnabled: false,
      webhookUrl: "",
      leadCaptureEnabled: false,
      handoffInboxEnabled: false,
      appearance,
      chunks,
      activity: [{ id: "a0", text: "Bot created — " + new Date().toLocaleDateString(), at: new Date().toISOString().slice(0, 10) }],
      leads: [],
      inbox: [],
    });
    navigate(`/dashboard/bots/${bot.id}`);
  };

  const snippet = `<script src="https://botbase.ai/widget.js" data-bot-id="NEW_BOT_ID"></script>`;

  return (
    <div className="min-h-full bg-[var(--bg-secondary)] pb-12" style={{ fontFamily: "var(--font-ui)" }}>
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-primary)] px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4">
          <Link to="/dashboard" className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Cancel
          </Link>
          <div className="flex flex-1 flex-wrap items-center gap-4 overflow-x-auto">
            {STEPS.map((label, i) => (
              <div key={label} className="flex shrink-0 items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium"
                  style={{
                    background: i <= step ? "var(--text-primary)" : "transparent",
                    color: i <= step ? "white" : "var(--text-tertiary)",
                    border: i <= step ? "none" : "1px solid var(--border-default)",
                  }}
                >
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span
                  className="whitespace-nowrap text-sm"
                  style={{
                    color: i <= step ? "var(--text-primary)" : "var(--text-tertiary)",
                    fontWeight: i === step ? 500 : 400,
                  }}
                >
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <div
                    className="mx-2 hidden h-px w-8 sm:block"
                    style={{ background: i < step ? "var(--text-primary)" : "var(--border-default)" }}
                  />
                )}
              </div>
            ))}
          </div>
          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            Step {step + 1} of {STEPS.length}
          </span>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {step === 0 && (
            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-6">
              <h2 className="text-lg font-medium tracking-tight" style={{ color: "var(--text-primary)" }}>
                Identity
              </h2>
              <label className="mt-4 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Bot name *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-lg border px-3 py-2"
                style={{ borderColor: "var(--border-default)", fontSize: "var(--text-body)" }}
                placeholder="e.g. Support Bot"
              />
              <p className="mt-4 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Avatar
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setEmoji(ic)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border text-xl transition-colors"
                    style={{
                      borderColor: emoji === ic ? "var(--text-primary)" : "var(--border-default)",
                      background: emoji === ic ? "var(--bg-secondary)" : "transparent",
                    }}
                  >
                    {ic}
                  </button>
                ))}
              </div>
              <label className="mt-4 block text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                Short description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-2 w-full rounded-lg border px-3 py-2"
                style={{ borderColor: "var(--border-default)", fontSize: "var(--text-body)" }}
                placeholder="Internal reference only"
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-6">
              <h2 className="text-lg font-medium tracking-tight" style={{ color: "var(--text-primary)" }}>
                Knowledge base
              </h2>
              <div className="flex gap-2 border-b border-[var(--border-default)] pb-2">
                {(["file", "text", "url"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setKbTab(t)}
                    className="rounded-lg px-3 py-1.5 text-sm capitalize"
                    style={{
                      background: kbTab === t ? "var(--bg-tertiary)" : "transparent",
                      color: "var(--text-primary)",
                    }}
                  >
                    {t === "file" ? "Files" : t === "text" ? "Paste text" : "Add URL"}
                  </button>
                ))}
              </div>
              {kbTab === "file" && (
                <div
                  {...getRootProps()}
                  className="cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors"
                  style={{
                    borderColor: isDragActive ? "var(--text-primary)" : "var(--border-default)",
                    background: "var(--bg-secondary)",
                  }}
                >
                  <input {...getInputProps()} />
                  <p style={{ color: "var(--text-secondary)" }}>Drop PDF or TXT here, or click to browse</p>
                  <p className="mt-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
                    Server accepts PDF and TXT per current API.
                  </p>
                </div>
              )}
              {kbTab === "text" && (
                <div>
                  <textarea
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    rows={8}
                    className="w-full rounded-lg border px-3 py-2"
                    style={{ borderColor: "var(--border-default)" }}
                    placeholder="Paste at least 50 characters…"
                  />
                  <button
                    type="button"
                    disabled={pasteText.trim().length < 50 || ingestBusy}
                    onClick={addTextSource}
                    className="mt-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
                    style={{ background: "var(--text-primary)" }}
                  >
                    Add text source
                  </button>
                </div>
              )}
              {kbTab === "url" && (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1 rounded-lg border px-3 py-2"
                    style={{ borderColor: "var(--border-default)" }}
                    placeholder="https://…"
                  />
                  <button
                    type="button"
                    disabled={!urlInput.trim() || ingestBusy}
                    onClick={addUrlSource}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
                    style={{ background: "var(--text-primary)" }}
                  >
                    Scrape
                  </button>
                </div>
              )}
              {ingestLog && (
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {ingestLog}
                </p>
              )}
              <div className="space-y-2">
                {chunks.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                    style={{ borderColor: "var(--border-default)" }}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {c.type === "file" ? <FileText size={16} /> : c.type === "url" ? <Globe size={16} /> : <Link2 size={16} />}
                      <span className="truncate text-sm" style={{ color: "var(--text-primary)" }}>
                        {c.name}
                      </span>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                        style={{
                          background:
                            c.status === "ready" ? "#F0FDF4" : c.status === "failed" ? "#FEF2F2" : "var(--bg-tertiary)",
                          color:
                            c.status === "ready" ? "var(--success)" : c.status === "failed" ? "var(--destructive)" : "var(--text-secondary)",
                        }}
                      >
                        {c.status}
                      </span>
                    </div>
                    <button type="button" onClick={() => removeChunk(c.id)} className="shrink-0 p-1 hover:opacity-70">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-6">
              <h2 className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>
                Appearance & behavior
              </h2>
              <section>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                  Widget on site
                </p>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <Field label="Position">
                    <select
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      style={{ borderColor: "var(--border-default)" }}
                      value={appearance.widgetPosition}
                      onChange={(e) =>
                        setAppearance((a) => ({ ...a, widgetPosition: e.target.value as BotAppearance["widgetPosition"] }))
                      }
                    >
                      <option value="br">Bottom right</option>
                      <option value="bl">Bottom left</option>
                    </select>
                  </Field>
                  <Field label="Shape">
                    <select
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      style={{ borderColor: "var(--border-default)" }}
                      value={appearance.widgetShape}
                      onChange={(e) =>
                        setAppearance((a) => ({ ...a, widgetShape: e.target.value as BotAppearance["widgetShape"] }))
                      }
                    >
                      <option value="circle">Circle</option>
                      <option value="rounded">Rounded square</option>
                    </select>
                  </Field>
                  <Field label="Size">
                    <select
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      style={{ borderColor: "var(--border-default)" }}
                      value={appearance.widgetSize}
                      onChange={(e) =>
                        setAppearance((a) => ({ ...a, widgetSize: e.target.value as BotAppearance["widgetSize"] }))
                      }
                    >
                      <option value="sm">Small</option>
                      <option value="md">Medium</option>
                      <option value="lg">Large</option>
                    </select>
                  </Field>
                  <Field label="Background">
                    <div className="flex items-center gap-3">
                      <HexColorPicker
                        color={appearance.widgetBg}
                        onChange={(widgetBg) => setAppearance((a) => ({ ...a, widgetBg }))}
                        style={{ width: 120, height: 120 }}
                      />
                    </div>
                  </Field>
                </div>
                <Field label="Tooltip">
                  <input
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: "var(--border-default)" }}
                    value={appearance.widgetTooltip}
                    onChange={(e) => setAppearance((a) => ({ ...a, widgetTooltip: e.target.value }))}
                  />
                </Field>
              </section>
              <section>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                  Chat interface
                </p>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <Field label="Theme">
                    <select
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      style={{ borderColor: "var(--border-default)" }}
                      value={appearance.chatTheme}
                      onChange={(e) =>
                        setAppearance((a) => ({ ...a, chatTheme: e.target.value as BotAppearance["chatTheme"] }))
                      }
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </Field>
                  <Field label="Primary color">
                    <HexColorPicker
                      color={appearance.primaryColor}
                      onChange={(primaryColor) => setAppearance((a) => ({ ...a, primaryColor }))}
                      style={{ width: 120, height: 120 }}
                    />
                  </Field>
                </div>
                <Field label="Font">
                  <select
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: "var(--border-default)" }}
                    value={appearance.fontId}
                    onChange={(e) => setAppearance((a) => ({ ...a, fontId: e.target.value as BotAppearance["fontId"] }))}
                  >
                    <option value="dm-sans">DM Sans</option>
                    <option value="inter">Inter</option>
                    <option value="serif">Serif</option>
                    <option value="mono">Mono</option>
                  </select>
                </Field>
                <Field label="Welcome message">
                  <input
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: "var(--border-default)" }}
                    value={appearance.welcomeMessage}
                    onChange={(e) => setAppearance((a) => ({ ...a, welcomeMessage: e.target.value }))}
                  />
                </Field>
                <Field label="Input placeholder">
                  <input
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: "var(--border-default)" }}
                    value={appearance.inputPlaceholder}
                    onChange={(e) => setAppearance((a) => ({ ...a, inputPlaceholder: e.target.value }))}
                  />
                </Field>
                <label className="mt-3 flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <input
                    type="checkbox"
                    checked={appearance.poweredBy}
                    onChange={(e) => setAppearance((a) => ({ ...a, poweredBy: e.target.checked }))}
                  />
                  Powered by BotBase (locked on Free — upgrade to remove)
                </label>
              </section>
              <section>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                  Behavior
                </p>
                <Field label="Fallback message">
                  <textarea
                    rows={2}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: "var(--border-default)" }}
                    value={appearance.fallbackMessage}
                    onChange={(e) => setAppearance((a) => ({ ...a, fallbackMessage: e.target.value }))}
                  />
                </Field>
                <Field label="Paused message">
                  <textarea
                    rows={2}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: "var(--border-default)" }}
                    value={appearance.pausedMessage}
                    onChange={(e) => setAppearance((a) => ({ ...a, pausedMessage: e.target.value }))}
                  />
                </Field>
                <Field label="Response style">
                  <div className="mt-1 flex gap-2">
                    {(["formal", "friendly", "concise"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setAppearance((a) => ({ ...a, responseStyle: r }))}
                        className="rounded-lg border px-3 py-1.5 text-sm capitalize"
                        style={{
                          borderColor: appearance.responseStyle === r ? "var(--text-primary)" : "var(--border-default)",
                          background: appearance.responseStyle === r ? "var(--bg-tertiary)" : "transparent",
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Language">
                  <select
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                    style={{ borderColor: "var(--border-default)" }}
                    value={appearance.language}
                    onChange={(e) => setAppearance((a) => ({ ...a, language: e.target.value }))}
                  >
                    {LANGS.map((l) => (
                      <option key={l.v} value={l.v}>
                        {l.l}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={`Confidence threshold (${appearance.confidenceThreshold}%)`}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    className="mt-2 w-full"
                    value={appearance.confidenceThreshold}
                    onChange={(e) => setAppearance((a) => ({ ...a, confidenceThreshold: Number(e.target.value) }))}
                  />
                </Field>
              </section>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] p-6">
              <h2 className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>
                Deploy
              </h2>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                Snippet
              </p>
              <pre
                className="overflow-x-auto rounded-lg border p-3 text-xs"
                style={{ borderColor: "var(--border-default)", background: "var(--bg-secondary)" }}
              >
                {snippet}
              </pre>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                Allowed domains
              </p>
              <div className="flex flex-wrap gap-2">
                {domains.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"
                    style={{ borderColor: "var(--border-default)" }}
                  >
                    {d}
                    <button type="button" onClick={() => setDomains(domains.filter((x) => x !== d))}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  className="flex-1 rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--border-default)" }}
                  placeholder="example.com"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && domainInput.trim()) {
                      setDomains([...domains, domainInput.trim()]);
                      setDomainInput("");
                    }
                  }}
                />
                <button
                  type="button"
                  className="rounded-lg px-3 py-2 text-sm"
                  style={{ border: "1px solid var(--border-default)" }}
                  onClick={() => {
                    if (!domainInput.trim()) return;
                    setDomains([...domains, domainInput.trim()]);
                    setDomainInput("");
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={goBack}
                className="rounded-xl border px-4 py-2 text-sm font-medium"
                style={{ borderColor: "var(--border-default)", color: "var(--text-primary)" }}
              >
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                disabled={!canNext()}
                onClick={goNext}
                className="rounded-xl px-5 py-2 text-sm font-medium text-white disabled:opacity-40"
                style={{ background: "var(--text-primary)" }}
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={finish}
                className="rounded-xl px-5 py-2 text-sm font-medium text-white"
                style={{ background: "var(--text-primary)" }}
              >
                Finish
              </button>
            )}
          </div>
        </div>

        <aside
          className="hidden h-min rounded-xl border p-4 lg:block"
          style={{ borderColor: "var(--border-default)", background: "var(--bg-primary)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Live preview
          </p>
          <div
            className="mt-4 overflow-hidden rounded-xl border"
            style={{
              borderColor: "var(--border-default)",
              fontFamily: appearance.fontId === "mono" ? "var(--font-mono)" : "var(--font-ui)",
            }}
          >
            <div
              className="px-3 py-2 text-sm text-white"
              style={{ background: appearance.primaryColor }}
            >
              {name || "Your bot"}
            </div>
            <div className="space-y-2 bg-[var(--bg-secondary)] p-3 text-sm" style={{ minHeight: 160 }}>
              <div className="rounded-lg bg-white px-2 py-1.5 shadow-sm" style={{ color: "var(--text-primary)" }}>
                {appearance.welcomeMessage}
              </div>
              <div
                className="rounded-lg border px-2 py-2 text-xs"
                style={{ borderColor: "var(--border-default)", color: "var(--text-tertiary)" }}
              >
                {appearance.inputPlaceholder}
              </div>
            </div>
          </div>
          <div
            className="mt-6 flex items-center justify-center rounded-full text-white shadow-lg"
            style={{
              width:
                appearance.widgetSize === "sm" ? 40 : appearance.widgetSize === "lg" ? 56 : 48,
              height:
                appearance.widgetSize === "sm" ? 40 : appearance.widgetSize === "lg" ? 56 : 48,
              borderRadius: appearance.widgetShape === "circle" ? "9999px" : "12px",
              background: appearance.widgetBg,
            }}
            title={appearance.widgetTooltip}
          >
            💬
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm" style={{ color: "var(--text-secondary)" }}>
      {label}
      {children}
    </label>
  );
}
