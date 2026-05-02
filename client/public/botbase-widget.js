/**
 * BotBase Embeddable Widget
 * Usage:
 *   <script
 *     src="https://your-domain.com/botbase-widget.js"
 *     data-bot-id="YOUR_BOT_ID"
 *     data-bot-name="Support Bot"
 *     data-api-url="https://your-domain.com"
 *     data-accent="#e8c547"
 *     data-position="bottom-right"
 *     data-greeting="Hi! How can I help you today?"
 *   ></script>
 */
(function () {
  'use strict';

  // ── Config from script tag ──────────────────────────────────────────────────
  const scriptTag = document.currentScript || (function () {
    const scripts = document.querySelectorAll('script[data-bot-id]');
    return scripts[scripts.length - 1];
  })();

  const cfg = {
    botId: scriptTag.getAttribute('data-bot-id') || '',
    botName: scriptTag.getAttribute('data-bot-name') || 'Assistant',
    apiUrl: (scriptTag.getAttribute('data-api-url') || '').replace(/\/$/, ''),
    accent: scriptTag.getAttribute('data-accent') || '#e8c547',
    position: scriptTag.getAttribute('data-position') || 'bottom-right',
    greeting: scriptTag.getAttribute('data-greeting') || null,
  };

  if (!cfg.botId || !cfg.apiUrl) {
    console.warn('[BotBase] data-bot-id and data-api-url are required.');
    return;
  }

  // ── Derived colors ──────────────────────────────────────────────────────────
  function hexToRgb(hex) {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? `${parseInt(r[1], 16)}, ${parseInt(r[2], 16)}, ${parseInt(r[3], 16)}` : '232, 197, 71';
  }
  const accentRgb = hexToRgb(cfg.accent);

  // ── Styles ──────────────────────────────────────────────────────────────────
  const css = `
    #bb-root * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
    #bb-root { position: fixed; z-index: 2147483647;
      ${cfg.position === 'bottom-left' ? 'left: 20px;' : 'right: 20px;'}
      bottom: 20px;
      display: flex; flex-direction: column; align-items: ${cfg.position === 'bottom-left' ? 'flex-start' : 'flex-end'};
      gap: 12px; pointer-events: none;
    }
    #bb-root > * { pointer-events: auto; }

    /* FAB */
    #bb-fab {
      width: 52px; height: 52px; border-radius: 50%;
      background: ${cfg.accent}; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 20px rgba(${accentRgb}, 0.4), 0 2px 6px rgba(0,0,0,0.2);
      transition: transform 0.2s, box-shadow 0.2s;
      font-size: 22px; line-height: 1;
      color: #111;
    }
    #bb-fab:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(${accentRgb}, 0.5); }
    #bb-fab:active { transform: scale(0.95); }
    #bb-fab .bb-icon-chat, #bb-fab .bb-icon-close { position: absolute; transition: opacity 0.2s, transform 0.2s; }
    #bb-fab .bb-icon-close { opacity: 0; transform: rotate(-90deg); }
    #bb-fab.bb-open .bb-icon-chat { opacity: 0; transform: rotate(90deg); }
    #bb-fab.bb-open .bb-icon-close { opacity: 1; transform: rotate(0deg); }
    #bb-fab { position: relative; }

    /* Panel */
    #bb-panel {
      width: 360px; height: 520px;
      background: #111110; border: 1px solid rgba(255,255,255,0.12);
      border-radius: 16px; overflow: hidden;
      display: flex; flex-direction: column;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05);
      opacity: 0; transform: translateY(12px) scale(0.97);
      transition: opacity 0.2s ease, transform 0.2s ease;
      pointer-events: none;
    }
    #bb-panel.bb-visible { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }

    /* Panel header */
    #bb-header {
      background: #1a1a18; border-bottom: 1px solid rgba(255,255,255,0.08);
      padding: 12px 16px; display: flex; align-items: center; gap: 10;
    }
    #bb-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: ${cfg.accent}; color: #111;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700; flex-shrink: 0;margin-right: 4px;
    }
    #bb-header-info { flex: 1; }
    #bb-header-name { font-size: 13px; font-weight: 600; color: #f0ede6; }
    #bb-header-status {
      font-size: 10px; color: #7a7a72; margin-top: 1px;
      display: flex; align-items: center; gap: 4;
    }
    #bb-header-dot {
      width: 5px; height: 5px; border-radius: 50%;
      background: #52b788;
      box-shadow: 0 0 5px rgba(82,183,136,0.6);
      display: inline-block;margin-right: 2px;
    }

    /* Messages */
    #bb-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 12px;
      background: #0c0c0a;
      scrollbar-width: thin; scrollbar-color: #2a2a26 transparent;
    }
    #bb-messages::-webkit-scrollbar { width: 3px; }
    #bb-messages::-webkit-scrollbar-thumb { background: #2a2a26; border-radius: 4px; }

    .bb-msg-row { display: flex; align-items: flex-end; gap: 8;}
    .bb-msg-row.bb-user { justify-content: flex-end; }

    .bb-msg-avatar {
      width: 24px; height: 24px; border-radius: 50%;
      background: ${cfg.accent}; color: #111;
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; font-weight: 700; flex-shrink: 0; margin-right: 4px !important;
    }
    .bb-bubble {
      max-width: 82%; padding: 4px 12px !important;
      font-size: 13px; line-height: 1.6; border-radius: 6px;
      animation: bbFadeUp 0.2s ease both;
    }
    .bb-bubble.bb-bot {
      background: #1c1c19; border: 1px solid rgba(255,255,255,0.09);
      border-bottom-left-radius: 0px; color: #e8e4dc;
    }
    .bb-bubble.bb-user {
      background: ${cfg.accent}; color: #111;
      border-bottom-right-radius: 0px; font-weight: 400;
    }
    .bb-bubble p { margin: 0 0 6px; }
    .bb-bubble p:last-child { margin-bottom: 0; }
    .bb-bubble strong { font-weight: 600; }
    .bb-bubble ul, .bb-bubble ol { padding-left: 14px; margin: 4px 0; }
    .bb-bubble li { margin-bottom: 3px; }
    .bb-bubble code {
      font-family: monospace; font-size: 11px;
      background: rgba(255,255,255,0.08); padding: 1px 4px; border-radius: 3px;
      color: ${cfg.accent};
    }

    /* Typing dots */
    .bb-dots { display: flex; gap: 4; align-items: center; padding: 2px 0; }
    .bb-dot {
      width: 5px; height: 5px; border-radius: 50%;
      background: #4a4a45;
      animation: bbBounce 1.2s ease infinite;
    }
    .bb-dot:nth-child(2) { animation-delay: 0.2s; }
    .bb-dot:nth-child(3) { animation-delay: 0.4s; }

    /* Input area */
    #bb-input-area {
      padding: 12px; border-top: 1px solid rgba(255,255,255,0.07);
      background: #1a1a18; display: flex; gap: 8; align-items: center;
    }
    #bb-input {
      flex: 1; padding: 9px 12px; border-radius: 8px;
      font-size: 13px; background: #242420;
      border: 1px solid rgba(255,255,255,0.1); color: #f0ede6;
      outline: none; transition: border-color 0.15s;
    }
    #bb-input:focus { border-color: ${cfg.accent}; box-shadow: 0 0 0 2px rgba(${accentRgb}, 0.12); }
    #bb-input::placeholder { color: #4a4a45; }
    #bb-send {
      width: 36px; height: 36px; border-radius: 50%;
      background: ${cfg.accent}; color: #111; font-size: 15px; font-weight: 700;
      border: none; cursor: pointer; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      transition: opacity 0.15s, transform 0.1s;
      margin-left: 4px;
    }
    #bb-send:hover { transform: scale(1.05); }
    #bb-send:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

    /* Branding */
    #bb-brand {
      text-align: center; padding: 5px;
      font-size: 9px; color: #3a3a36;
      letter-spacing: 0.05em;
    }

    /* Notification badge */
    #bb-badge {
      position: absolute; top: -3px; right: -3px;
      width: 14px; height: 14px; border-radius: 50%;
      background: #e05555; color: #fff;
      font-size: 8px; font-weight: 700;
      display: none; align-items: center; justify-content: center;
      border: 2px solid #0c0c0a;
    }
    #bb-badge.bb-show { display: flex; }

    @keyframes bbFadeUp {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes bbBounce {
      0%, 80%, 100% { transform: translateY(0); }
      40%           { transform: translateY(-4px); }
    }
  `;

  // ── DOM construction ────────────────────────────────────────────────────────
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  const root = document.createElement('div');
  root.id = 'bb-root';

  // Panel
  const panel = document.createElement('div');
  panel.id = 'bb-panel';
  panel.innerHTML = `
    <div id="bb-header">
      <div id="bb-avatar">${cfg.botName[0].toUpperCase()}</div>
      <div id="bb-header-info">
        <div id="bb-header-name">${escHtml(cfg.botName)}</div>
        <div id="bb-header-status">
          <span id="bb-header-dot"></span> Online · Ask me anything
        </div>
      </div>
    </div>
    <div id="bb-messages"></div>
    <div id="bb-input-area">
      <input id="bb-input" type="text" placeholder="Type a message…" autocomplete="off" />
      <button id="bb-send" disabled>→</button>
    </div>
    <div id="bb-brand">Powered by BotBase</div>
  `;

  // FAB
  const fab = document.createElement('button');
  fab.id = 'bb-fab';
  fab.setAttribute('aria-label', 'Open chat');
  fab.innerHTML = `
    <span class="bb-icon-chat">💬</span>
    <span class="bb-icon-close">✕</span>
    <span id="bb-badge"></span>
  `;

  root.appendChild(panel);
  root.appendChild(fab);
  document.body.appendChild(root);

  // ── State ───────────────────────────────────────────────────────────────────
  let isOpen = false;
  let isStreaming = false;
  let msgIdCounter = 0;

  const messagesEl = panel.querySelector('#bb-messages');
  const inputEl = panel.querySelector('#bb-input');
  const sendEl = panel.querySelector('#bb-send');
  const badgeEl = panel.querySelector('#bb-badge');

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Minimal markdown → HTML renderer (bold, italic, code, bullets)
  function renderMarkdown(text) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/^[\-\*] (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .split(/\n\n+/).map(p => p.startsWith('<ul>') || p.startsWith('<ol>') ? p : `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addMessage(role, html, streaming = false) {
    const id = ++msgIdCounter;
    const row = document.createElement('div');
    row.className = `bb-msg-row ${role === 'user' ? 'bb-user' : ''}`;
    row.dataset.id = id;

    if (role === 'bot') {
      row.innerHTML = `
        <div class="bb-msg-avatar">${cfg.botName[0].toUpperCase()}</div>
        <div class="bb-bubble bb-bot" data-bubble="${id}">
          ${streaming
          ? '<div class="bb-dots"><div class="bb-dot"></div><div class="bb-dot"></div><div class="bb-dot"></div></div>'
          : html}
        </div>`;
    } else {
      row.innerHTML = `<div class="bb-bubble bb-user">${html}</div>`;
    }
    messagesEl.appendChild(row);
    scrollToBottom();
    return id;
  }

  function updateBotMessage(id, html) {
    const bubble = messagesEl.querySelector(`[data-bubble="${id}"]`);
    if (bubble) { bubble.innerHTML = html; scrollToBottom(); }
  }

  function showGreeting() {
    const msg = cfg.greeting || `Hi! I'm **${cfg.botName}**. How can I help you today?`;
    addMessage('bot', renderMarkdown(msg));
  }

  // ── Toggle open/close ───────────────────────────────────────────────────────
  let greetingShown = false;

  function togglePanel() {
    isOpen = !isOpen;
    panel.classList.toggle('bb-visible', isOpen);
    fab.classList.toggle('bb-open', isOpen);
    fab.setAttribute('aria-label', isOpen ? 'Close chat' : 'Open chat');

    if (isOpen) {
      badgeEl.classList.remove('bb-show');
      if (!greetingShown) { greetingShown = true; showGreeting(); }
      setTimeout(() => inputEl.focus(), 220);
    }
  }

  fab.addEventListener('click', togglePanel);

  // ── Send message ────────────────────────────────────────────────────────────
  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || isStreaming) return;

    inputEl.value = '';
    sendEl.disabled = true;
    isStreaming = true;

    addMessage('user', escHtml(text));
    const botId = addMessage('bot', '', true);

    try {
      const response = await fetch(`${cfg.apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botId: cfg.botId,
          message: text,
          botSettings: {
            name: cfg.botName,
            tone: 'Friendly',
            fallbackMessage: "I don't have information about that in my knowledge base."
          }
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let started = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split('\n')) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.token) {
              if (!started) { started = true; updateBotMessage(botId, ''); }
              fullText += data.token;
              updateBotMessage(botId, renderMarkdown(fullText));
            }
            if (data.done || data.error) {
              if (data.error) updateBotMessage(botId, '⚠️ Something went wrong. Please try again.');
              else updateBotMessage(botId, renderMarkdown(fullText));
            }
          } catch { }
        }
      }

      // Show badge if panel is closed
      if (!isOpen) {
        badgeEl.classList.add('bb-show');
        badgeEl.textContent = '1';
      }

    } catch (err) {
      updateBotMessage(botId, '⚠️ Connection error. Please check your network.');
    }

    isStreaming = false;
    sendEl.disabled = inputEl.value.trim() === '';
    inputEl.focus();
  }

  sendEl.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  inputEl.addEventListener('input', () => {
    sendEl.disabled = inputEl.value.trim() === '' || isStreaming;
  });

  // ── Close on outside click ──────────────────────────────────────────────────
  document.addEventListener('click', e => {
    if (isOpen && !root.contains(e.target)) togglePanel();
  }, true);

  // ── Keyboard shortcut ───────────────────────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) togglePanel();
  });

})();
