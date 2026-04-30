import { useState, useRef } from "react";

const API = "/api";

export default function Upload({ onBotCreated }) {
  const [tab, setTab] = useState("file"); // file | text
  const [botName, setBotName] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]); // progress messages
  const [error, setError] = useState("");
  const fileRef = useRef();

  const addLog = (msg, type = "info") => {
    setLogs((prev) => [...prev, { msg, type, id: Date.now() + Math.random() }]);
  };

  async function handleSubmit() {
    setError("");
    setLogs([]);
    setLoading(true);

    try {
      let response;

      if (tab === "file") {
        if (!file) {
          setError("Please select a file");
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append("file", file);
        formData.append("botName", botName || file.name.replace(/\.\w+$/, ""));
        response = await fetch(`${API}/ingest/file`, {
          method: "POST",
          body: formData,
        });
      } else {
        if (text.trim().length < 50) {
          setError("Text must be at least 50 characters");
          setLoading(false);
          return;
        }
        response = await fetch(`${API}/ingest/text`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: text.trim(),
            botName: botName || "Text Bot",
          }),
        });
      }

      // Read SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));

            if (data.error) {
              addLog(data.message, "error");
              setError(data.message);
              setLoading(false);
              return;
            }

            addLog(data.message, data.done ? "success" : "info");

            if (data.done) {
              setLoading(false);
              onBotCreated({
                botId: data.botId,
                botName: data.botName,
                chunkCount: data.chunkCount,
                source: data.source,
                sourceType: data.sourceType,
              });
              return;
            }
          } catch {}
        }
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  function onFileDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }

  return (
    <div style={styles.page} className="dot-grid">
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>Bot Base</div>
          <div style={styles.tagline}>Upload Content → Get a Chatbot</div>
        </div>

        {/* Bot name */}
        <div style={styles.field}>
          <label style={styles.label}>Bot Name (optional)</label>
          <input
            style={styles.input}
            placeholder="e.g. Support Bot, Product FAQ..."
            value={botName}
            onChange={(e) => setBotName(e.target.value)}
          />
        </div>

        {/* Source tabs */}
        <div style={styles.tabs}>
          {["file", "text"].map((t) => (
            <button
              key={t}
              style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}
              onClick={() => setTab(t)}
            >
              {{ file: "File", text: "Text" }[t]}
            </button>
          ))}
        </div>

        {/* File tab */}
        {tab === "file" && (
          <div
            style={{
              ...styles.dropZone,
              ...(dragOver ? styles.dropZoneActive : {}),
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onFileDrop}
            onClick={() => fileRef.current.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.txt"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
            />
            {file ? (
              <>
                <div style={styles.fileName}>📄 {file.name}</div>
                <div style={styles.fileSize}>
                  {(file.size / 1024).toFixed(0)} KB
                </div>
                <button
                  style={styles.changeBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                >
                  Change file
                </button>
              </>
            ) : (
              <>
                <div style={styles.dropIcon}>↑</div>
                <div style={styles.dropTitle}>
                  {dragOver ? "Drop to upload" : "Drop file or click to browse"}
                </div>
                <div style={styles.dropSub}>PDF or TXT · up to 20MB</div>
              </>
            )}
          </div>
        )}

        {/* Text tab */}
        {tab === "text" && (
          <div style={styles.field}>
            <textarea
              style={{
                ...styles.input,
                height: 160,
                resize: "vertical",
                padding: "10px 12px",
              }}
              placeholder="Paste your FAQs, product docs, support content..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div style={styles.hint}>
              {text.length.toLocaleString()} characters
            </div>
          </div>
        )}

        {/* Error */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Progress log */}
        {logs.length > 0 && (
          <div style={styles.logBox}>
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  ...styles.logLine,
                  color:
                    log.type === "error"
                      ? "#cc2222"
                      : log.type === "success"
                        ? "#1a6b3c"
                        : "#6b6b65",
                }}
              >
                {log.type === "success"
                  ? "✓"
                  : log.type === "error"
                    ? "✕"
                    : "·"}{" "}
                {log.msg}
              </div>
            ))}
            {loading && <div style={styles.spinner} />}
          </div>
        )}

        {/* Submit */}
        <button
          style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Processing..." : "Create Bot →"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f7f7f5",
    padding: "24px",
  },
  card: {
    background: "#fff",
    border: "1px solid #e8e8e4",
    borderRadius: 16,
    padding: "32px",
    width: "100%",
    maxWidth: 460,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  header: {
    borderBottom: "1px solid #e8e8e4",
    paddingBottom: 20,
  },
  logo: {
    fontSize: 20,
    fontWeight: 600,
    letterSpacing: "-0.5px",
    marginBottom: 4,
  },
  tagline: {
    fontSize: 13,
    color: "#6b6b65",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#6b6b65",
  },
  input: {
    padding: "9px 12px",
    borderRadius: 8,
    width: "100%",
  },
  hint: {
    fontSize: 11,
    color: "#a8a8a2",
    textAlign: "right",
  },
  tabs: {
    display: "flex",
    gap: 4,
    paddingBottom: 0,
  },
  tab: {
    padding: "8px 14px",
    background: "transparent",
    border: "none",
    color: "#6b6b65",
    fontSize: 13,
    marginBottom: -1,
    borderRadius: 0,
    transition: "all 0.15s",
    fontWeight: 500,
  },
  tabActive: {
    color: "#0a0a0a",
    borderBottom: "2px solid #0a0a0a",
  },
  dropZone: {
    border: "1px dashed #c8c8c2",
    borderRadius: 12,
    padding: "32px 20px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.15s",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  dropZoneActive: {
    border: "2px solid #0a0a0a",
    background: "#f7f7f5",
    transform: "scale(1.01)",
  },
  dropIcon: {
    fontSize: 24,
    color: "#a8a8a2",
    lineHeight: 1,
  },
  dropTitle: {
    fontSize: 14,
    fontWeight: 500,
  },
  dropSub: {
    fontSize: 12,
    color: "#a8a8a2",
  },
  fileName: {
    fontSize: 14,
    fontWeight: 500,
  },
  fileSize: {
    fontSize: 12,
    color: "#a8a8a2",
  },
  changeBtn: {
    marginTop: 4,
    fontSize: 12,
    color: "#6b6b65",
    background: "none",
    border: "none",
    textDecoration: "underline",
    cursor: "pointer",
  },
  logBox: {
    background: "#f7f7f5",
    border: "1px solid #e8e8e4",
    borderRadius: 8,
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  logLine: {
    fontSize: 12,
    fontFamily: "monospace",
  },
  spinner: {
    width: 16,
    height: 16,
    border: "2px solid #e8e8e4",
    borderTopColor: "#0a0a0a",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    marginTop: 4,
  },
  error: {
    fontSize: 12,
    color: "#cc2222",
    background: "#fff5f5",
    border: "1px solid #fcc",
    borderRadius: 8,
    padding: "8px 12px",
  },
  btn: {
    width: "100%",
    padding: "11px",
    background: "#0a0a0a",
    color: "#fff",
    fontSize: 14,
    fontWeight: 500,
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    transition: "opacity 0.1s",
  },
};
