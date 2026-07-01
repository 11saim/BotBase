/// <reference types="vite/client" />

/** FastAPI base URL — set VITE_AI_SERVER_URL in .env for production */
export function getApiBase(): string {
  const v = import.meta.env.VITE_AI_SERVER_URL as string | undefined;
  return (v && v.replace(/\/$/, "")) || "http://localhost:3001";
}

export async function postIngestFile(
  file: File,
  opts: { botId?: string; botName?: string },
  onSseLine: (obj: Record<string, unknown>) => void,
): Promise<void> {
  const fd = new FormData();
  fd.append("file", file);
  if (opts.botName) fd.append("botName", opts.botName);
  if (opts.botId) fd.append("botId", opts.botId);

  const res = await fetch(`${getApiBase()}/api/ingest/file`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok || !res.body) {
    throw new Error(`Upload failed (${res.status})`);
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const parts = buf.split("\n\n");
    buf = parts.pop() || "";
    for (const block of parts) {
      const line = block.trim().split("\n").find((l) => l.startsWith("data: "));
      if (!line) continue;
      try {
        const json = JSON.parse(line.slice(6)) as Record<string, unknown>;
        onSseLine(json);
      } catch {
        /* ignore */
      }
    }
  }
}

export async function postIngestUrl(
  url: string,
  opts: { botId?: string; botName?: string },
  onSseLine: (obj: Record<string, unknown>) => void,
): Promise<void> {
  const res = await fetch(`${getApiBase()}/api/ingest/url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, botName: opts.botName || "", botId: opts.botId || "" }),
  });
  if (!res.ok || !res.body) {
    throw new Error(`URL ingest failed (${res.status})`);
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const parts = buf.split("\n\n");
    buf = parts.pop() || "";
    for (const block of parts) {
      const line = block.trim().split("\n").find((l) => l.startsWith("data: "));
      if (!line) continue;
      try {
        onSseLine(JSON.parse(line.slice(6)) as Record<string, unknown>);
      } catch {
        /* ignore */
      }
    }
  }
}

export async function postIngestText(
  text: string,
  opts: { botId?: string; botName?: string },
  onSseLine: (obj: Record<string, unknown>) => void,
): Promise<void> {
  const res = await fetch(`${getApiBase()}/api/ingest/text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, botName: opts.botName || "", botId: opts.botId || "" }),
  });
  if (!res.ok || !res.body) {
    throw new Error(`Text ingest failed (${res.status})`);
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const parts = buf.split("\n\n");
    buf = parts.pop() || "";
    for (const block of parts) {
      const line = block.trim().split("\n").find((l) => l.startsWith("data: "));
      if (!line) continue;
      try {
        onSseLine(JSON.parse(line.slice(6)) as Record<string, unknown>);
      } catch {
        /* ignore */
      }
    }
  }
}
