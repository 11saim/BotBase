import type { BotFontId } from "./DashboardBotsContext";

/** CSS font stacks for widget preview (Google fonts linked in index.html where needed) */
export const BOT_FONT_STACK: Record<BotFontId, string> = {
  "dm-sans": "var(--font-ui), system-ui, sans-serif",
  inter: '"Inter", system-ui, sans-serif',
  "system-ui": "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  georgia: "Georgia, 'Times New Roman', serif",
  mono: "ui-monospace, 'Geist Mono', 'Cascadia Mono', monospace",
  nunito: '"Nunito Sans", system-ui, sans-serif',
  "source-serif": '"Source Serif 4", Georgia, serif',
};

export const FONT_OPTIONS: { id: BotFontId; label: string }[] = [
  { id: "dm-sans", label: "DM Sans" },
  { id: "inter", label: "Inter" },
  { id: "nunito", label: "Nunito Sans" },
  { id: "source-serif", label: "Source Serif" },
  { id: "georgia", label: "Georgia" },
  { id: "system-ui", label: "System UI" },
  { id: "mono", label: "Monospace" },
];
