import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const API = '/api';

export default function Chat({ bot, onBack }) {
  const [view, setView] = useState('chat'); // 'chat' | 'embed'
  const [messages, setMessages] = useState([
    { id: 1, role: 'bot', text: `Hi! I'm **${bot.botName}**. Ask me anything about ${bot.source}.` }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);
  const bottomRef = useRef();
  const inputRef  = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setLoading(true);

    const userMsg  = { id: Date.now(), role: 'user', text };
    const botMsgId = Date.now() + 1;
    setMessages(prev => [...prev, userMsg, { id: botMsgId, role: 'bot', text: '', streaming: true }]);

    try {
      const response = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botId: bot.botId,
          message: text,
          botSettings: {
            name: bot.botName,
            tone: 'Friendly',
            fallbackMessage: "I don't have information about that in my knowledge base."
          }
        })
      });

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText  = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split('\n')) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.token) {
              fullText += data.token;
              setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: fullText } : m));
            }
            if (data.done || data.error) {
              setMessages(prev => prev.map(m =>
                m.id === botMsgId
                  ? { ...m, streaming: false, text: data.error ? '⚠️ Something went wrong.' : fullText }
                  : m
              ));
            }
          } catch {}
        }
      }
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === (Date.now() + 1) ? { ...m, text: '⚠️ Connection error.', streaming: false } : m
      ));
    }

    setLoading(false);
    inputRef.current?.focus();
  }

  const embedCode = `<!-- BotBase Widget — ${bot.botName} -->
<script
  src="https://YOUR_DOMAIN/botbase-widget.js"
  data-bot-id="${bot.botId}"
  data-bot-name="${bot.botName}"
  data-api-url="https://YOUR_DOMAIN"
  data-accent="#e8c547"
  data-position="bottom-right"
></script>`;

  function copyEmbed() {
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={s.page}>

      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <button style={s.backBtn} onClick={onBack}>
            <span style={s.backArrow}>←</span> Back
          </button>
          <div style={s.sep} />
          <div style={s.botInfo}>
            <div style={s.botAvatar}>{bot.botName[0].toUpperCase()}</div>
            <div>
              <div style={s.botName}>{bot.botName}</div>
              <div style={s.botMeta}>
                <span style={s.onlineDot} />
                <span style={s.metaText}>{bot.chunkCount} chunks · {bot.source}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={s.headerRight}>
          <div style={s.viewToggle}>
            {['chat', 'embed'].map(v => (
              <button
                key={v}
                style={{ ...s.viewBtn, ...(view === v ? s.viewBtnActive : {}) }}
                onClick={() => setView(v)}
              >
                {v === 'chat' ? '◉ Demo' : '</> Embed'}
              </button>
            ))}
          </div>
          <div style={s.botIdTag}>
            <span style={s.idLabel}>ID</span>
            <code style={s.idCode}>{bot.botId.slice(0, 8)}…</code>
          </div>
        </div>
      </div>

      {/* CHAT VIEW */}
      {view === 'chat' && (
        <>
          <div style={s.messages}>
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{ ...s.msgRow, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', animation: 'fadeUp 0.2s ease' }}
              >
                {msg.role === 'bot' && (
                  <div style={s.avatar}>{bot.botName[0].toUpperCase()}</div>
                )}
                <div
                  className={msg.role === 'bot' ? 'bot-bubble' : ''}
                  style={{ ...s.bubble, ...(msg.role === 'user' ? s.userBubble : s.botBubble) }}
                >
                  {msg.streaming && !msg.text
                    ? <TypingDots />
                    : msg.role === 'bot'
                      ? <ReactMarkdown>{msg.text}</ReactMarkdown>
                      : msg.text
                  }
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div style={s.inputArea}>
            <div style={s.inputWrap}>
              <input
                ref={inputRef}
                style={s.chatInput}
                placeholder="Ask something…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                autoFocus
              />
              <button
                style={{ ...s.sendBtn, opacity: (!input.trim() || loading) ? 0.35 : 1 }}
                onClick={sendMessage}
                disabled={!input.trim() || loading}
              >
                →
              </button>
            </div>
            <div style={s.inputHint}>Press Enter to send · Shift+Enter for new line</div>
          </div>
        </>
      )}

      {/* EMBED VIEW */}
      {view === 'embed' && (
        <div style={s.embedPage}>
          <div style={s.embedContent}>

            <div style={s.embedHero}>
              <div style={s.embedBadge}>EMBED</div>
              <h2 style={s.embedTitle}>Add {bot.botName} to any website</h2>
              <p style={s.embedDesc}>
                Drop one script tag into your HTML and a floating chat widget appears instantly.
                No setup, no dependencies, no framework required.
              </p>
            </div>

            {/* Steps */}
            <div style={s.stepsRow}>
              {[
                { n: '1', label: 'Copy the snippet below' },
                { n: '2', label: 'Replace YOUR_DOMAIN with your host' },
                { n: '3', label: 'Paste before </body> tag' },
              ].map(step => (
                <div key={step.n} style={s.stepCard}>
                  <div style={s.stepNum}>{step.n}</div>
                  <div style={s.stepLabel}>{step.label}</div>
                </div>
              ))}
            </div>

            {/* Code block */}
            <div style={s.codeBlock}>
              <div style={s.codeHeader}>
                <span style={s.codeLang}>HTML</span>
                <button style={{ ...s.copyBtn, ...(copied ? s.copyBtnDone : {}) }} onClick={copyEmbed}>
                  {copied ? '✓ Copied' : 'Copy snippet'}
                </button>
              </div>
              <pre style={s.codePre}><code style={s.codeText}>{embedCode}</code></pre>
            </div>

            {/* Config reference */}
            <div style={s.configTable}>
              <div style={s.configTitle}>Configuration attributes</div>
              {[
                { attr: 'data-bot-id', val: bot.botId, desc: 'Your bot identifier (prefilled)' },
                { attr: 'data-bot-name', val: bot.botName, desc: 'Display name in the widget' },
                { attr: 'data-api-url', val: 'https://your-domain.com', desc: 'Your BotBase server URL' },
                { attr: 'data-accent', val: '#e8c547', desc: 'Widget accent color (hex)' },
                { attr: 'data-position', val: 'bottom-right', desc: 'bottom-right or bottom-left' },
                { attr: 'data-greeting', val: 'optional', desc: 'Custom opening message' },
              ].map(row => (
                <div key={row.attr} style={s.configRow}>
                  <code style={s.configAttr}>{row.attr}</code>
                  <code style={s.configVal}>{row.val}</code>
                  <span style={s.configDesc}>{row.desc}</span>
                </div>
              ))}
            </div>

            {/* Widget preview */}
            <div style={s.previewBox}>
              <div style={s.previewLabel}>Widget preview</div>
              <div style={s.previewArea}>
                <div style={s.mockPage}>
                  <div style={s.mockContent}>
                    <div style={s.mockLine} />
                    <div style={{ ...s.mockLine, width: '70%' }} />
                    <div style={{ ...s.mockLine, width: '85%' }} />
                    <div style={{ ...s.mockLine, width: '55%', marginTop: 12 }} />
                  </div>
                </div>
                <div style={s.widgetPreview}>
                  <div style={s.widgetBubble}>
                    <div style={s.widgetAvatar}>{bot.botName[0]}</div>
                    <div style={s.widgetBubbleTail} />
                    <div style={s.widgetText}>Hi! I'm {bot.botName}. How can I help? 👋</div>
                  </div>
                  <div style={s.widgetFab}>
                    <span style={s.widgetFabIcon}>💬</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

function TypingDots() {
  return (
    <span style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '2px 0' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 5, height: 5, borderRadius: '50%',
          background: 'var(--text3)',
          animation: 'bounce 1.2s ease infinite',
          animationDelay: `${i * 0.2}s`,
          display: 'inline-block',
        }} />
      ))}
    </span>
  );
}

const s = {
  page: {
    display: 'flex', flexDirection: 'column',
    height: '100vh', maxWidth: 760,
    margin: '0 auto',
    borderLeft: '1px solid var(--border)',
    borderRight: '1px solid var(--border)',
    background: 'var(--bg)',
  },
  header: {
    padding: '12px 20px',
    borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    background: 'var(--surface)',
    position: 'sticky', top: 0, zIndex: 10,
    gap: 12,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 10 },
  backBtn: {
    fontSize: 12, color: 'var(--text2)',
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: 6, padding: '5px 10px',
    display: 'flex', alignItems: 'center', gap: 4,
    fontFamily: "'DM Mono', monospace",
  },
  backArrow: { fontSize: 11 },
  sep: {
    width: 1, height: 24, background: 'var(--border)',
  },
  botInfo: { display: 'flex', alignItems: 'center', gap: 10 },
  botAvatar: {
    width: 30, height: 30, borderRadius: '50%',
    background: 'var(--accent)',
    color: '#0c0c0a',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700,
    fontFamily: "'Syne', sans-serif",
    flexShrink: 0,
  },
  botName: {
    fontSize: 13, fontWeight: 600, color: 'var(--text)',
    fontFamily: "'Syne', sans-serif",
  },
  botMeta: {
    display: 'flex', alignItems: 'center', gap: 5, marginTop: 1,
  },
  onlineDot: {
    width: 5, height: 5, borderRadius: '50%',
    background: 'var(--green)',
    boxShadow: '0 0 5px rgba(82,183,136,0.6)',
    flexShrink: 0,
  },
  metaText: {
    fontSize: 10, color: 'var(--text2)',
    fontFamily: "'DM Mono', monospace",
  },
  viewToggle: {
    display: 'flex', gap: 3,
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 8, padding: 3,
  },
  viewBtn: {
    fontSize: 11, padding: '4px 10px',
    borderRadius: 5, border: 'none',
    background: 'none', color: 'var(--text2)',
    fontFamily: "'DM Mono', monospace",
    cursor: 'pointer', transition: 'all 0.15s',
  },
  viewBtnActive: {
    background: 'var(--surface3)',
    color: 'var(--accent)',
    border: '1px solid var(--border2)',
  },
  botIdTag: {
    display: 'flex', alignItems: 'center', gap: 5,
  },
  idLabel: {
    fontSize: 9, fontWeight: 600, color: 'var(--text3)',
    fontFamily: "'DM Mono', monospace",
    textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  idCode: {
    fontSize: 10, fontFamily: "'DM Mono', monospace",
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    padding: '2px 6px', borderRadius: 4, color: 'var(--text2)',
  },

  // Chat
  messages: {
    flex: 1, overflowY: 'auto',
    padding: '24px 20px',
    display: 'flex', flexDirection: 'column', gap: 16,
    background: 'var(--bg)',
  },
  msgRow: {
    display: 'flex', alignItems: 'flex-start', gap: 10,
  },
  avatar: {
    width: 26, height: 26, borderRadius: '50%',
    background: 'var(--accent)', color: '#0c0c0a',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 10, fontWeight: 700,
    fontFamily: "'Syne', sans-serif",
    flexShrink: 0, marginTop: 2,
  },
  bubble: {
    maxWidth: '74%', padding: '10px 14px',
    fontSize: 14, lineHeight: 1.65, borderRadius: 12,
  },
  botBubble: {
    background: 'var(--surface)',
    border: '1px solid var(--border2)',
    borderTopLeftRadius: 3,
    color: 'var(--text)',
  },
  userBubble: {
    background: 'var(--accent)',
    color: '#0c0c0a',
    borderTopRightRadius: 3,
    fontWeight: 400,
  },
  inputArea: {
    padding: '14px 20px',
    borderTop: '1px solid var(--border)',
    background: 'var(--surface)',
    display: 'flex', flexDirection: 'column', gap: 6,
  },
  inputWrap: {
    display: 'flex', gap: 8, alignItems: 'center',
  },
  chatInput: {
    flex: 1, padding: '10px 14px',
    borderRadius: 8, fontSize: 14,
    background: 'var(--surface2)',
    border: '1px solid var(--border2)',
    color: 'var(--text)',
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: '50%',
    background: 'var(--accent)', color: '#0c0c0a',
    fontSize: 16, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', cursor: 'pointer',
    flexShrink: 0, transition: 'opacity 0.15s',
  },
  inputHint: {
    fontSize: 10, color: 'var(--text3)',
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '0.03em',
  },

  // Embed view
  embedPage: {
    flex: 1, overflowY: 'auto',
    background: 'var(--bg)',
  },
  embedContent: {
    maxWidth: 640, margin: '0 auto',
    padding: '32px 20px',
    display: 'flex', flexDirection: 'column', gap: 28,
  },
  embedHero: {
    display: 'flex', flexDirection: 'column', gap: 8,
    animation: 'fadeUp 0.3s ease both',
  },
  embedBadge: {
    display: 'inline-block',
    fontFamily: "'DM Mono', monospace",
    fontSize: 9, fontWeight: 600,
    color: 'var(--accent)',
    border: '1px solid rgba(232,197,71,0.25)',
    borderRadius: 4, padding: '3px 8px',
    letterSpacing: '0.1em',
    marginBottom: 4,
    width: 'fit-content',
  },
  embedTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 22, fontWeight: 700, letterSpacing: '-0.3px',
    color: 'var(--text)',
  },
  embedDesc: {
    fontSize: 13, color: 'var(--text2)', lineHeight: 1.7,
    maxWidth: 480,
  },
  stepsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
  },
  stepCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 10, padding: '14px 14px',
    display: 'flex', flexDirection: 'column', gap: 6,
  },
  stepNum: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 11, fontWeight: 500, color: 'var(--accent)',
    width: 22, height: 22, borderRadius: '50%',
    border: '1px solid rgba(232,197,71,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  stepLabel: {
    fontSize: 12, color: 'var(--text)', lineHeight: 1.5,
  },
  codeBlock: {
    background: 'var(--bg)',
    border: '1px solid var(--border2)',
    borderRadius: 10, overflow: 'hidden',
  },
  codeHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 14px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)',
  },
  codeLang: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 9, color: 'var(--text3)',
    textTransform: 'uppercase', letterSpacing: '0.1em',
    fontWeight: 600,
  },
  copyBtn: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 11, padding: '4px 10px',
    background: 'var(--surface2)',
    border: '1px solid var(--border2)',
    borderRadius: 5, color: 'var(--text2)',
    cursor: 'pointer', transition: 'all 0.15s',
  },
  copyBtnDone: {
    background: 'rgba(82,183,136,0.12)',
    border: '1px solid rgba(82,183,136,0.3)',
    color: 'var(--green)',
  },
  codePre: {
    padding: '16px 18px', margin: 0,
    overflowX: 'auto',
  },
  codeText: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 12, color: 'var(--text2)',
    lineHeight: 1.8, whiteSpace: 'pre',
  },
  configTable: {
    display: 'flex', flexDirection: 'column', gap: 0,
    border: '1px solid var(--border)',
    borderRadius: 10, overflow: 'hidden',
  },
  configTitle: {
    padding: '10px 16px',
    background: 'var(--surface)',
    fontSize: 10, fontWeight: 600, color: 'var(--text2)',
    textTransform: 'uppercase', letterSpacing: '0.07em',
    fontFamily: "'DM Mono', monospace",
    borderBottom: '1px solid var(--border)',
  },
  configRow: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr',
    gap: 12, padding: '10px 16px',
    borderBottom: '1px solid var(--border)',
    alignItems: 'center',
    background: 'var(--bg)',
    fontSize: 11,
  },
  configAttr: {
    fontFamily: "'DM Mono', monospace",
    color: 'var(--accent)', fontSize: 11,
  },
  configVal: {
    fontFamily: "'DM Mono', monospace",
    color: 'var(--text2)', fontSize: 11,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  configDesc: {
    color: 'var(--text3)', fontSize: 11,
  },
  previewBox: {
    border: '1px solid var(--border)',
    borderRadius: 10, overflow: 'hidden',
  },
  previewLabel: {
    padding: '10px 16px',
    background: 'var(--surface)',
    fontSize: 10, fontWeight: 600, color: 'var(--text2)',
    textTransform: 'uppercase', letterSpacing: '0.07em',
    fontFamily: "'DM Mono', monospace",
    borderBottom: '1px solid var(--border)',
  },
  previewArea: {
    padding: 20, background: 'var(--bg)',
    position: 'relative', minHeight: 140,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  mockPage: {
    flex: 1, maxWidth: 320, padding: 16,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 8,
  },
  mockContent: { display: 'flex', flexDirection: 'column', gap: 8 },
  mockLine: {
    height: 8, borderRadius: 4,
    background: 'var(--surface3)',
    width: '100%',
  },
  widgetPreview: {
    position: 'absolute', bottom: 20, right: 20,
    display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8,
  },
  widgetBubble: {
    background: 'var(--surface)',
    border: '1px solid var(--border2)',
    borderRadius: 10, borderBottomRightRadius: 2,
    padding: '8px 12px',
    maxWidth: 180,
    position: 'relative',
  },
  widgetBubbleTail: {},
  widgetAvatar: {},
  widgetText: {
    fontSize: 11, color: 'var(--text)', lineHeight: 1.5,
  },
  widgetFab: {
    width: 44, height: 44, borderRadius: '50%',
    background: 'var(--accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(232,197,71,0.3)',
    cursor: 'pointer',
  },
  widgetFabIcon: { fontSize: 20 },
};
