import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "botbase_workspace_v1";

export type BotStatus = "active" | "paused";
export type ChunkStatus = "processing" | "ready" | "failed";
export type ResponseStyle = "formal" | "friendly" | "concise";

export interface KnowledgeChunk {
  id: string;
  name: string;
  type: "file" | "url" | "text";
  sizeLabel?: string;
  addedAt: string;
  status: ChunkStatus;
}

export type BotFontId =
  | "dm-sans"
  | "inter"
  | "system-ui"
  | "georgia"
  | "mono"
  | "nunito"
  | "source-serif";

export interface BotAppearance {
  widgetPosition: "br" | "bl";
  widgetShape: "circle" | "rounded";
  widgetSize: "sm" | "md" | "lg";
  widgetBg: string;
  widgetTooltip: string;
  chatTheme: "light" | "dark" | "auto";
  primaryColor: string;
  fontId: BotFontId;
  welcomeMessage: string;
  inputPlaceholder: string;
  poweredBy: boolean;
  fallbackMessage: string;
  pausedMessage: string;
  responseStyle: ResponseStyle;
  language: string;
}

export interface LeadEntry {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface InboxEntry {
  id: string;
  message: string;
  createdAt: string;
}

export interface ActivityEntry {
  id: string;
  text: string;
  at: string;
}

export interface DashboardBot {
  id: string;
  name: string;
  emoji: string;
  /** Data URL or remote URL for custom avatar (optional) */
  iconUrl?: string | null;
  description?: string;
  status: BotStatus;
  messagesThisWeek: number;
  messagesMonth: number;
  usersMonth: number;
  storageMb: number;
  avgConfidence: number;
  gapsCount: number;
  domains: string[];
  webhookEnabled: boolean;
  webhookUrl: string;
  leadCaptureEnabled: boolean;
  handoffInboxEnabled: boolean;
  appearance: BotAppearance;
  chunks: KnowledgeChunk[];
  activity: ActivityEntry[];
  leads: LeadEntry[];
  inbox: InboxEntry[];
}

export const defaultAppearance = (): BotAppearance => ({
  widgetPosition: "br",
  widgetShape: "circle",
  widgetSize: "md",
  widgetBg: "#0A0A0A",
  widgetTooltip: "Chat with us!",
  chatTheme: "auto",
  primaryColor: "#0A0A0A",
  fontId: "dm-sans",
  welcomeMessage: "Hi! How can we help today?",
  inputPlaceholder: "Ask anything…",
  poweredBy: true,
  fallbackMessage: "I do not have enough information to answer that yet.",
  pausedMessage: "This assistant is temporarily paused. Please try again later.",
  responseStyle: "friendly",
  language: "en",
});

function coerceFontId(v: unknown): BotFontId {
  const allowed: BotFontId[] = ["dm-sans", "inter", "system-ui", "georgia", "mono", "nunito", "source-serif"];
  if (typeof v === "string" && allowed.includes(v as BotFontId)) return v as BotFontId;
  if (v === "serif") return "source-serif";
  return "dm-sans";
}

function normalizeAppearance(p: Partial<BotAppearance> | undefined): BotAppearance {
  const merged = { ...defaultAppearance(), ...(p || {}) } as Record<string, unknown>;
  delete merged.confidenceThreshold;
  const a = { ...defaultAppearance(), ...merged } as BotAppearance;
  a.fontId = coerceFontId(a.fontId);
  return a;
}

function seedBot(partial: Partial<DashboardBot> & Pick<DashboardBot, "id" | "name" | "emoji">): DashboardBot {
  const appearance = normalizeAppearance(partial.appearance);
  return {
    description: "",
    status: "active",
    messagesThisWeek: 48,
    messagesMonth: 420,
    usersMonth: 112,
    storageMb: 2.4,
    avgConfidence: 0.87,
    gapsCount: 6,
    domains: [],
    webhookEnabled: false,
    webhookUrl: "",
    leadCaptureEnabled: false,
    handoffInboxEnabled: false,
    chunks: [
      {
        id: `c-${partial.id}-1`,
        name: "faq.pdf",
        type: "file",
        sizeLabel: "120 KB",
        addedAt: "May 2, 2026",
        status: "ready",
      },
    ],
    activity: [
      { id: `a-${partial.id}-1`, text: "Added data — May 8", at: "2026-05-08" },
      { id: `a-${partial.id}-2`, text: "Updated appearance — May 6", at: "2026-05-06" },
    ],
    leads: [],
    inbox: [],
    ...partial,
    appearance,
  };
}

function hydrateBot(b: Partial<DashboardBot>): DashboardBot {
  const id = String(b.id || `bot_${crypto.randomUUID().slice(0, 12)}`);
  const base = seedBot({ id, name: b.name || "Untitled", emoji: b.emoji || "🤖" });
  return {
    ...base,
    ...b,
    id,
    appearance: normalizeAppearance({ ...base.appearance, ...(b.appearance || {}) }),
    chunks: Array.isArray(b.chunks) ? b.chunks : base.chunks,
    activity: Array.isArray(b.activity) ? b.activity : base.activity,
    leads: Array.isArray(b.leads) ? b.leads : [],
    inbox: Array.isArray(b.inbox) ? b.inbox : [],
  };
}

function loadBots(): DashboardBot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<DashboardBot>[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((b) => hydrateBot(b));
  } catch {
    return [];
  }
}

interface DashboardBotsContextValue {
  bots: DashboardBot[];
  addBot: (bot: Omit<DashboardBot, "id"> & { id?: string }) => DashboardBot;
  updateBot: (id: string, patch: Partial<DashboardBot>) => void;
  deleteBot: (id: string) => void;
  appendActivity: (botId: string, text: string) => void;
  setChunks: (botId: string, chunks: KnowledgeChunk[]) => void;
  addLead: (botId: string, lead: Omit<LeadEntry, "id">) => void;
  addInbox: (botId: string, message: string) => void;
}

const DashboardBotsContext = createContext<DashboardBotsContextValue | null>(null);

export function DashboardBotsProvider({ children }: { children: ReactNode }) {
  const [bots, setBots] = useState<DashboardBot[]>(() => loadBots());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bots));
  }, [bots]);

  const addBot = useCallback((bot: Omit<DashboardBot, "id"> & { id?: string }) => {
    const id = bot.id || `bot_${crypto.randomUUID().slice(0, 12)}`;
    const full: DashboardBot = {
      ...seedBot({ id, name: bot.name, emoji: bot.emoji }),
      ...bot,
      id,
      appearance: normalizeAppearance({ ...defaultAppearance(), ...bot.appearance }),
    };
    setBots((prev) => [...prev, full]);
    return full;
  }, []);

  const updateBot = useCallback((id: string, patch: Partial<DashboardBot>) => {
    setBots((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const next = { ...b, ...patch };
        if (patch.appearance) next.appearance = normalizeAppearance({ ...b.appearance, ...patch.appearance });
        return next;
      }),
    );
  }, []);

  const deleteBot = useCallback((id: string) => {
    setBots((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const appendActivity = useCallback((botId: string, text: string) => {
    const entry: ActivityEntry = {
      id: `a-${crypto.randomUUID().slice(0, 8)}`,
      text,
      at: new Date().toISOString().slice(0, 10),
    };
    setBots((prev) =>
      prev.map((b) =>
        b.id === botId ? { ...b, activity: [entry, ...b.activity].slice(0, 10) } : b,
      ),
    );
  }, []);

  const setChunks = useCallback((botId: string, chunks: KnowledgeChunk[]) => {
    setBots((prev) => prev.map((b) => (b.id === botId ? { ...b, chunks } : b)));
  }, []);

  const addLead = useCallback((botId: string, lead: Omit<LeadEntry, "id">) => {
    const row: LeadEntry = { ...lead, id: `l-${crypto.randomUUID().slice(0, 8)}` };
    setBots((prev) => prev.map((b) => (b.id === botId ? { ...b, leads: [row, ...b.leads] } : b)));
  }, []);

  const addInbox = useCallback((botId: string, message: string) => {
    const row: InboxEntry = {
      id: `i-${crypto.randomUUID().slice(0, 8)}`,
      message,
      createdAt: new Date().toLocaleString(),
    };
    setBots((prev) => prev.map((b) => (b.id === botId ? { ...b, inbox: [row, ...b.inbox] } : b)));
  }, []);

  const value = useMemo(
    () => ({
      bots,
      addBot,
      updateBot,
      deleteBot,
      appendActivity,
      setChunks,
      addLead,
      addInbox,
    }),
    [bots, addBot, updateBot, deleteBot, appendActivity, setChunks, addLead, addInbox],
  );

  return <DashboardBotsContext.Provider value={value}>{children}</DashboardBotsContext.Provider>;
}

export function useDashboardBots() {
  const ctx = useContext(DashboardBotsContext);
  if (!ctx) throw new Error("useDashboardBots must be used inside DashboardBotsProvider");
  return ctx;
}
