import { useState, useRef } from "react";

const API = "/api";

export default function Upload({ onBotCreated }) {
  const [tab, setTab]         = useState("file");
  const [botName, setBotName] = useState("");
  const [text, setText]       = useState("");
  const [file, setFile]       = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [logs, setLogs]         = useState([]);
  const [error, setError]       = useState("");
  const fileRef = useRef();

  const addLog = (msg, type = "info") =>
    setLogs(prev => [...prev, { msg, type, id: Date.now() + Math.random() }]);

  async function handleSubmit() {
    setError(""); setLogs([]); setLoading(true);
    try {
      let response;
      if (tab === "file") {
        if (!file) { setError("Select a file first"); setLoading(false); return; }
        const fd = new FormData();
        fd.append("file", file);
        fd.append("botName", botName || file.name.replace(/\.\w+$/, ""));
        response = await fetch(`${API}/ingest/file`, { method: "POST", body: fd });
      } else {
        if (text.trim().length < 50) { setError("Text must be at least 50 characters"); setLoading(false); return; }
        response = await fetch(`${API}/ingest/text`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: text.trim(), botName: botName || "Text Bot" }),
        });
      }

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.error) { addLog(data.message, "error"); setError(data.message); setLoading(false); return; }
            addLog(data.message, data.done ? "success" : "info");
            if (data.done) {
              setLoading(false);
              onBotCreated({ botId: data.botId, botName: data.botName, chunkCount: data.chunkCount, source: data.source, sourceType: data.sourceType });
              return;
            }
          } catch {}
        }
      }
    } catch (err) { setError(err.message); setLoading(false); }
  }

  function onFileDrop(e) {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }

  const canSubmit = tab === "file" ? !!file : text.trim().length >= 50;

  return (
    <div style={s.page} className="grid-bg">

      {/* Corner decoration */}
      <div style={s.cornerTL} />
      <div style={s.cornerBR} />

      <div style={s.wrapper}>

        {/* Wordmark */}
        <div style={s.wordmark}>
          <span style={s.wordmarkDot} />
          <span style={s.wordmarkText}>BotBase</span>
        </div>

        {/* Card */}
        <div style={s.card}>

          {/* Card header strip */}
          <div style={s.cardHeader}>
            <div>
              <div style={s.cardTitle}>Create your bot</div>
              <div style={s.cardSub}>Upload content, get an AI chatbot instantly</div>
            </div>
            <div style={s.stepBadge}>01 / SETUP</div>
          </div>

          {/* Bot name */}
          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>Bot Name <span style={s.optional}>optional</span></label>
            <input
              style={s.input}
              placeholder="e.g. Support Bot, Product FAQ…"
              value={botName}
              onChange={e => setBotName(e.target.value)}
            />
          </div>

          {/* Source tabs */}
          <div style={s.tabRow}>
            {["file", "text"].map(t => (
              <button
                key={t}
                style={{ ...s.tabBtn, ...(tab === t ? s.tabBtnActive : {}) }}
                onClick={() => setTab(t)}
              >
                <span style={tab === t ? s.tabIconActive : s.tabIcon}>
                  {t === "file" ? "▤" : "≡"}
                </span>
                {t === "file" ? "File Upload" : "Paste Text"}
              </button>
            ))}
          </div>

          {/* File drop */}
          {tab === "file" && (
            <div
              style={{ ...s.dropZone, ...(dragOver ? s.dropZoneHover : {}) }}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onFileDrop}
              onClick={() => fileRef.current.click()}
            >
              <input ref={fileRef} type="file" accept=".pdf,.txt" style={{ display: "none" }} onChange={e => setFile(e.target.files[0])} />
              {file ? (
                <div style={s.fileInfo}>
                  <div style={s.fileIconWrap}>
                    <span style={s.fileIcon}>{file.name.endsWith('.pdf') ? '⬡' : '⬢'}</span>
                  </div>
                  <div>
                    <div style={s.fileName}>{file.name}</div>
                    <div style={s.fileMeta}>{(file.size / 1024).toFixed(0)} KB · {file.name.split('.').pop().toUpperCase()}</div>
                  </div>
                  <button style={s.removeBtn} onClick={e => { e.stopPropagation(); setFile(null); }}>✕</button>
                </div>
              ) : (
                <div style={s.dropEmpty}>
                  <div style={s.dropArrow}>{dragOver ? '↓' : '↑'}</div>
                  <div style={s.dropLabel}>{dragOver ? "Release to upload" : "Drop file here or click to browse"}</div>
                  <div style={s.dropTypes}>PDF · TXT · up to 20 MB</div>
                </div>
              )}
            </div>
          )}

          {/* Text area */}
          {tab === "text" && (
            <div style={s.fieldGroup}>
              <textarea
                style={{ ...s.input, ...s.textarea }}
                placeholder="Paste your FAQs, product docs, support content, knowledge base…"
                value={text}
                onChange={e => setText(e.target.value)}
              />
              <div style={s.charCount}>
                <span style={{ color: text.length >= 50 ? 'var(--green)' : 'var(--text3)' }}>
                  {text.length >= 50 ? '✓' : '○'}
                </span>
                {' '}{text.length.toLocaleString()} chars {text.length < 50 && <span style={{ color: 'var(--text3)' }}>· need {50 - text.length} more</span>}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={s.errorBox}>
              <span style={{ color: 'var(--red)' }}>✕</span> {error}
            </div>
          )}

          {/* Log */}
          {logs.length > 0 && (
            <div style={s.logBox}>
              <div style={s.logHeader}>
                <span style={{ color: 'var(--accent)', fontFamily: "'DM Mono', monospace", fontSize: 10 }}>PROCESSING</span>
                {loading && <span style={s.spinner} />}
              </div>
              {logs.map(l => (
                <div key={l.id} style={{ ...s.logLine, color: l.type === 'error' ? 'var(--red)' : l.type === 'success' ? 'var(--green)' : 'var(--text2)' }}>
                  <span style={s.logDot}>{l.type === 'success' ? '✓' : l.type === 'error' ? '✕' : '›'}</span>
                  {l.msg}
                </div>
              ))}
            </div>
          )}

          {/* Submit */}
          <button
            style={{ ...s.submitBtn, ...((!canSubmit || loading) ? s.submitDisabled : {}) }}
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <span style={s.spinner} /> Ingesting content…
              </span>
            ) : (
              <span>Create Bot <span style={s.btnArrow}>→</span></span>
            )}
          </button>

        </div>

        <div style={s.footer}>
          Powered by vector search · Streaming responses · RAG architecture
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  cornerTL: {
    position: 'absolute', top: 0, left: 0,
    width: 320, height: 320,
    background: 'radial-gradient(circle at 0% 0%, rgba(232,197,71,0.07) 0%, transparent 65%)',
    pointerEvents: 'none',
  },
  cornerBR: {
    position: 'absolute', bottom: 0, right: 0,
    width: 320, height: 320,
    background: 'radial-gradient(circle at 100% 100%, rgba(82,183,136,0.05) 0%, transparent 65%)',
    pointerEvents: 'none',
  },
  wrapper: {
    width: '100%', maxWidth: 480,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
    animation: 'fadeUp 0.4s ease both',
  },
  wordmark: {
    display: 'flex', alignItems: 'center', gap: 8,
    marginBottom: 4,
  },
  wordmarkDot: {
    display: 'inline-block', width: 8, height: 8,
    borderRadius: '50%', background: 'var(--accent)',
    boxShadow: '0 0 10px rgba(232,197,71,0.5)',
  },
  wordmarkText: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px',
    color: 'var(--text)',
  },
  card: {
    width: '100%',
    background: 'var(--surface)',
    border: '1px solid var(--border2)',
    borderRadius: 16,
    padding: 28,
    display: 'flex', flexDirection: 'column', gap: 22,
    boxShadow: '0 0 0 1px var(--border), 0 24px 60px rgba(0,0,0,0.4)',
  },
  cardHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    borderBottom: '1px solid var(--border)', paddingBottom: 18,
  },
  cardTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px',
    color: 'var(--text)',
  },
  cardSub: {
    fontSize: 12, color: 'var(--text2)', marginTop: 3,
  },
  stepBadge: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 9, fontWeight: 500,
    color: 'var(--accent)',
    border: '1px solid rgba(232,197,71,0.25)',
    borderRadius: 4, padding: '3px 7px',
    letterSpacing: '0.08em',
  },
  fieldGroup: {
    display: 'flex', flexDirection: 'column', gap: 7,
  },
  fieldLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 10, fontWeight: 500,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    color: 'var(--text2)',
    display: 'flex', alignItems: 'center', gap: 6,
  },
  optional: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 9, color: 'var(--text3)',
    textTransform: 'none', letterSpacing: 0,
    border: '1px solid var(--border2)', borderRadius: 3,
    padding: '1px 5px',
  },
  input: {
    padding: '10px 12px',
    borderRadius: 8, width: '100%',
  },
  textarea: {
    height: 150, resize: 'vertical',
    lineHeight: 1.7, paddingTop: 10,
  },
  charCount: {
    fontSize: 11, color: 'var(--text2)', textAlign: 'right',
    fontFamily: "'DM Mono', monospace",
  },
  tabRow: {
    display: 'flex', gap: 6,
  },
  tabBtn: {
    flex: 1, padding: '9px 14px',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text2)', fontSize: 12, fontWeight: 500,
    display: 'flex', alignItems: 'center', gap: 6,
    justifyContent: 'center',
    transition: 'all 0.15s',
  },
  tabBtnActive: {
    background: 'var(--surface3)',
    border: '1px solid var(--border2)',
    color: 'var(--text)',
  },
  tabIcon: { color: 'var(--text3)', fontSize: 14 },
  tabIconActive: { color: 'var(--accent)', fontSize: 14 },
  dropZone: {
    border: '1px dashed var(--border2)',
    borderRadius: 12, padding: '28px 20px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    background: 'var(--surface2)',
  },
  dropZoneHover: {
    border: '1px solid var(--accent)',
    background: 'rgba(232,197,71,0.04)',
    transform: 'scale(1.005)',
  },
  dropEmpty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
  },
  dropArrow: {
    fontSize: 22, color: 'var(--text3)', lineHeight: 1,
    marginBottom: 2,
  },
  dropLabel: {
    fontSize: 13, fontWeight: 500, color: 'var(--text)',
  },
  dropTypes: {
    fontSize: 11, color: 'var(--text3)',
    fontFamily: "'DM Mono', monospace",
  },
  fileInfo: {
    display: 'flex', alignItems: 'center', gap: 12,
  },
  fileIconWrap: {
    width: 40, height: 40, borderRadius: 8,
    background: 'var(--surface3)',
    border: '1px solid var(--border2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  fileIcon: { fontSize: 18, color: 'var(--accent)' },
  fileName: { fontSize: 13, fontWeight: 500, color: 'var(--text)' },
  fileMeta: { fontSize: 11, color: 'var(--text2)', marginTop: 2, fontFamily: "'DM Mono', monospace" },
  removeBtn: {
    marginLeft: 'auto', background: 'none', border: 'none',
    color: 'var(--text3)', fontSize: 12, cursor: 'pointer',
    padding: '4px 6px',
    borderRadius: 4,
    flexShrink: 0,
  },
  errorBox: {
    fontSize: 12, color: 'var(--red)',
    background: 'rgba(224,85,85,0.08)',
    border: '1px solid rgba(224,85,85,0.2)',
    borderRadius: 8, padding: '9px 12px',
    display: 'flex', alignItems: 'center', gap: 6,
  },
  logBox: {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 10, padding: '12px 14px',
    display: 'flex', flexDirection: 'column', gap: 6,
    fontFamily: "'DM Mono', monospace",
  },
  logHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 4,
  },
  logLine: {
    fontSize: 11, display: 'flex', gap: 8, alignItems: 'flex-start',
    lineHeight: 1.5,
  },
  logDot: { flexShrink: 0, width: 10 },
  spinner: {
    display: 'inline-block',
    width: 12, height: 12,
    border: '1.5px solid var(--border2)',
    borderTopColor: 'var(--accent)',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  submitBtn: {
    width: '100%', padding: '12px',
    background: 'var(--accent)',
    color: '#0c0c0a',
    fontSize: 14, fontWeight: 600,
    fontFamily: "'Syne', sans-serif",
    borderRadius: 8, border: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.15s, transform 0.1s',
    letterSpacing: '-0.2px',
  },
  submitDisabled: {
    opacity: 0.35, cursor: 'not-allowed', transform: 'none',
  },
  btnArrow: { opacity: 0.7 },
  footer: {
    fontSize: 10, color: 'var(--text3)',
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '0.04em',
    textAlign: 'center',
  },
};
