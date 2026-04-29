import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const API = '/api';

export default function Chat({ bot, onBack }) {
  const [messages, setMessages] = useState([
  {
    id: 1,
    role: 'bot',
    text: `Hi! I'm **${bot.botName}**. Ask me anything about ${bot.source}.`
  }
]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
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

    // Add user message
    const userMsg = { id: Date.now(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);

    // Add empty bot message that we'll fill in via streaming
    const botMsgId = Date.now() + 1;
    setMessages(prev => [...prev, { id: botMsgId, role: 'bot', text: '', streaming: true }]);

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

        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.token) {
              fullText += data.token;
              // Update the streaming bot message in real-time
              setMessages(prev =>
                prev.map(m =>
                  m.id === botMsgId ? { ...m, text: fullText } : m
                )
              );
            }
            if (data.done || data.error) {
              setMessages(prev =>
                prev.map(m =>
                  m.id === botMsgId ? { ...m, streaming: false, text: data.error ? '⚠️ Something went wrong. Please try again.' : fullText } : m
                )
              );
            }
          } catch {}
        }
      }
    } catch (err) {
      setMessages(prev =>
        prev.map(m =>
          m.id === (Date.now() + 1) ? { ...m, text: '⚠️ Connection error. Is the server running?', streaming: false } : m
        )
      );
    }

    setLoading(false);
    inputRef.current?.focus();
  }

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.backBtn} onClick={onBack}>← back</button>
          <div>
            <div style={styles.botName}>{bot.botName}</div>
            <div style={styles.botMeta}>
              <span style={styles.liveDot} />
              {bot.chunkCount} chunks · {bot.source}
            </div>
          </div>
        </div>
        <div style={styles.botId}>
          <span style={styles.label}>BOT ID</span>
          <code style={styles.code}>{bot.botId}</code>
        </div>
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              ...styles.msgRow,
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            {msg.role === 'bot' && (
              <div style={styles.avatar}>{bot.botName[0].toUpperCase()}</div>
            )}
            <div className={msg.role === 'bot' ? 'bot-bubble' : ''} style={{...styles.bubble, ...(msg.role === 'user' ? styles.userBubble : styles.botBubble)}}>
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

      {/* Input */}
      <div style={styles.inputRow}>
        <input
          ref={inputRef}
          style={styles.chatInput}
          placeholder="Ask something..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          autoFocus
        />
        <button
          style={{ ...styles.sendBtn, opacity: (!input.trim() || loading) ? 0.4 : 1 }}
          onClick={sendMessage}
          disabled={!input.trim() || loading}
        >
          →
        </button>
      </div>

    </div>
  );
}

function TypingDots() {
  return (
    <span style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '2px 0' }}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: '#a8a8a2',
            animation: 'bounce 1.2s ease infinite',
            animationDelay: `${i * 0.2}s`,
            display: 'inline-block',
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </span>
  );
}

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    maxWidth: 720,
    margin: '0 auto',
    borderLeft: '1px solid #e8e8e4',
    borderRight: '1px solid #e8e8e4',
  },
  header: {
    padding: '14px 20px',
    borderBottom: '1px solid #e8e8e4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#fff',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    fontSize: 12,
    color: '#6b6b65',
    background: 'none',
    border: '1px solid #e8e8e4',
    borderRadius: 6,
    padding: '4px 10px',
    cursor: 'pointer',
  },
  botName: {
    fontSize: 14,
    fontWeight: 500,
  },
  botMeta: {
    fontSize: 11,
    color: '#a8a8a2',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  liveDot: {
    display: 'inline-block',
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: '#1a6b3c',
  },
  botId: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 2,
  },
  label: {
    fontSize: 9,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#a8a8a2',
  },
  code: {
    fontSize: 11,
    fontFamily: 'monospace',
    background: '#f7f7f5',
    padding: '2px 6px',
    borderRadius: 4,
    color: '#6b6b65',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    background: '#fafaf8',
  },
  msgRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: '#0a0a0a',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 600,
    flexShrink: 0,
    marginTop: 2,
  },
  bubble: {
    maxWidth: '75%',
    padding: '10px 14px',
    fontSize: 14,
    lineHeight: 1.6,
    borderRadius: 12,
  },
  botBubble: {
    background: '#fff',
    border: '1px solid #e8e8e4',
    borderTopLeftRadius: 4,
    color: '#0a0a0a',
  },
  userBubble: {
    background: '#0a0a0a',
    color: '#fff',
    borderTopRightRadius: 4,
  },
  inputRow: {
    display: 'flex',
    gap: 8,
    padding: '14px 20px',
    borderTop: '1px solid #e8e8e4',
    background: '#fff',
  },
  chatInput: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 14,
    border: '1px solid #e8e8e4',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: '#0a0a0a',
    color: '#fff',
    fontSize: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.1s',
    flexShrink: 0,
  },
};
