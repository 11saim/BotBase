(function () {
    "use strict";

    // ---------------------------------------------------------------------
    // 1. Resolve config from the <script> tag
    // ---------------------------------------------------------------------
    const currentScript =
        document.currentScript ||
        (function () {
            const scripts = document.getElementsByTagName("script");
            return scripts[scripts.length - 1];
        })();

    const BOT_ID = currentScript.getAttribute("data-bot-id");
    if (!BOT_ID) {
        console.error("[BotBase Widget] Missing required data-bot-id attribute on the script tag.");
        return;
    }

    const API_BASE = "http://localhost:5000";

    // change this once your public config route exists (see header comment above)
    const PUBLIC_BOT_CONFIG_PATH = (botId) => `/api/bots/config/${botId}`;

    const SESSION_STORAGE_KEY = `botbase_session_${BOT_ID}`;
    const PING_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

    // ---------------------------------------------------------------------
    // 2. Session persistence
    // ---------------------------------------------------------------------
    function getOrCreateSessionId() {
        try {
            let sid = localStorage.getItem(SESSION_STORAGE_KEY);
            if (!sid) {
                sid = crypto.randomUUID
                    ? crypto.randomUUID()
                    : "sid_" + Math.random().toString(36).slice(2) + Date.now();
                localStorage.setItem(SESSION_STORAGE_KEY, sid);
            }
            return sid;
        } catch {
            return "sid_" + Math.random().toString(36).slice(2) + Date.now();
        }
    }

    // ---------------------------------------------------------------------
    // 3. Backend calls
    // ---------------------------------------------------------------------
    async function fetchBotConfig(botId) {
        const res = await fetch(`${API_BASE}${PUBLIC_BOT_CONFIG_PATH(botId)}`, {
            method: "GET",
            headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`Failed to load bot config (${res.status})`);
        const data = await res.json();
        return data.bot;
    }

    async function startConversation(botId, sessionId) {
        const res = await fetch(`${API_BASE}/api/chat/start`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ botId, sessionId }),
        });
        if (!res.ok) throw new Error(`Failed to start conversation (${res.status})`);
        return res.json();
    }

    function sendPing(sessionId) {
        fetch(`${API_BASE}/api/chat/ping`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
        }).catch(() => { });
    }

    async function sendMessageStream({ sessionId, message, onToken, onDone, onPlainError, onError }) {
        let res;
        try {
            res = await fetch(`${API_BASE}/api/chat/message`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, message }),
            });
        } catch (err) {
            onError(err);
            return;
        }

        const contentType = res.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            try {
                const data = await res.json();
                onPlainError(data.error || "Something went wrong.");
            } catch {
                onError(new Error("Unexpected response from server."));
            }
            return;
        }

        if (!res.ok || !res.body) {
            onError(new Error(`Request failed (${res.status})`));
            return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullText = "";

        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });

                const events = buffer.split("\n\n");
                buffer = events.pop();

                for (const evt of events) {
                    const line = evt.trim();
                    if (!line.startsWith("data:")) continue;

                    const jsonStr = line.slice(5).trim();
                    let data;
                    try {
                        data = JSON.parse(jsonStr);
                    } catch {
                        continue;
                    }

                    if (data.error) {
                        onError(new Error(data.error));
                        return;
                    }
                    if (data.token) {
                        fullText += data.token;
                        onToken(fullText, data.token);
                    }
                    if (data.done) {
                        onDone(fullText);
                        return;
                    }
                }
            }
            onDone(fullText);
        } catch (err) {
            onError(err);
        }
    }

    // ---------------------------------------------------------------------
    // 4. UI — built inside a Shadow DOM so the host site's CSS never leaks in
    // ---------------------------------------------------------------------
    function escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str == null ? "" : String(str);
        return div.innerHTML;
    }

    function buildWidget(bot, initialState) {
        const cfg = (bot && bot.widgetConfig) || {};
        const botName = (bot && bot.name) || "Assistant";
        const avatar = (bot && bot.botAvatar) || "\ud83e\udd16";
        const isAvatarUrl = typeof avatar === "string" && /^https?:\/\//.test(avatar);

        const launcherColor = cfg.launcherColor || "#4F46E5";
        const accentColor = cfg.accentColor || "#4F46E5";
        const position = cfg.position === "bottom-left" ? "bottom-left" : "bottom-right";
        const tooltipText = cfg.tooltipText || "Need help? Ask me!";
        const inputPlaceholder = cfg.inputPlaceholder || "Type a message...";
        const showPoweredBy = cfg.showPoweredBy !== false;
        const isDark = cfg.panelTheme === "dark";
        const fallbackReply = cfg.fallbackReply || "I'm not sure about that. Please contact support.";

        const panelBg = isDark ? "#1f2125" : "#ffffff";
        const panelText = isDark ? "#f1f1f3" : "#1f2937";
        const messagesBg = isDark ? "#15161a" : "#f7f7f9";
        const botBubbleBg = isDark ? "#2a2c31" : "#ffffff";
        const botBubbleBorder = isDark ? "#383a40" : "#ececef";

        const host = document.createElement("div");
        host.id = "botbase-widget-host";
        host.style.position = "fixed";
        host.style.zIndex = "2147483647";
        host.style[position === "bottom-right" ? "right" : "left"] = "20px";
        host.style.bottom = "20px";
        document.body.appendChild(host);

        const shadow = host.attachShadow({ mode: "open" });

        const style = document.createElement("style");
        style.textContent = `
      * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
      .bb-bubble {
        width: 56px; height: 56px; border-radius: 50%;
        background: ${launcherColor}; color: #fff; border: none; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 14px rgba(0,0,0,0.18);
        transition: transform 0.15s ease;
        font-size: 24px;
        position: relative;
      }
      .bb-bubble:hover { transform: scale(1.06); }
      .bb-bubble svg { width: 26px; height: 26px; }
      .bb-bubble img { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }

      .bb-tooltip {
        position: absolute;
        bottom: 64px;
        ${position === "bottom-right" ? "right: 0;" : "left: 0;"}
        background: #111827; color: #fff; font-size: 12.5px;
        padding: 7px 12px; border-radius: 8px; white-space: nowrap;
        box-shadow: 0 4px 14px rgba(0,0,0,0.15);
      }
      .bb-tooltip.hidden { display: none; }

      .bb-window {
        position: absolute;
        bottom: 72px;
        ${position === "bottom-right" ? "right: 0;" : "left: 0;"}
        width: 360px;
        max-width: calc(100vw - 32px);
        height: 520px;
        max-height: 70vh;
        background: ${panelBg};
        color: ${panelText};
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        display: none;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid rgba(0,0,0,0.06);
      }
      .bb-window.open { display: flex; }

      .bb-header {
        background: ${accentColor};
        color: #fff;
        padding: 14px 16px;
        display: flex; align-items: center; gap: 10px;
      }
      .bb-header .bb-avatar { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; display: flex; align-items: center; justify-content: center; font-size: 18px; }
      .bb-header .bb-title { font-weight: 600; font-size: 14px; }
      .bb-header .bb-close { margin-left: auto; cursor: pointer; opacity: 0.85; background: none; border: none; color: #fff; font-size: 18px; line-height: 1; }
      .bb-header .bb-close:hover { opacity: 1; }

      .bb-messages {
        flex: 1; overflow-y: auto; padding: 14px;
        display: flex; flex-direction: column; gap: 10px;
        background: ${messagesBg};
      }
      .bb-msg { max-width: 80%; padding: 9px 12px; border-radius: 12px; font-size: 13.5px; line-height: 1.45; white-space: pre-wrap; word-wrap: break-word; }
      .bb-msg.bot { align-self: flex-start; background: ${botBubbleBg}; color: ${panelText}; border: 1px solid ${botBubbleBorder}; border-bottom-left-radius: 4px; }
      .bb-msg.user { align-self: flex-end; background: ${accentColor}; color: #fff; border-bottom-right-radius: 4px; }
      .bb-msg.system { align-self: center; background: transparent; color: #9a9a9a; font-size: 12px; text-align: center; }

      .bb-inputbar { display: flex; gap: 8px; padding: 10px; border-top: 1px solid ${isDark ? "#2a2c31" : "#eee"}; background: ${panelBg}; }
      .bb-inputbar input {
        flex: 1; border: 1px solid ${isDark ? "#383a40" : "#ddd"}; background: ${isDark ? "#15161a" : "#fff"}; color: ${panelText};
        border-radius: 10px; padding: 10px 12px; font-size: 13.5px; outline: none;
      }
      .bb-inputbar input:focus { border-color: ${accentColor}; }
      .bb-inputbar input:disabled { opacity: 0.6; }
      .bb-inputbar button {
        background: ${accentColor}; color: #fff; border: none; border-radius: 10px;
        width: 40px; cursor: pointer; display: flex; align-items: center; justify-content: center;
      }
      .bb-inputbar button:disabled { opacity: 0.5; cursor: not-allowed; }

      .bb-typing { align-self: flex-start; display: flex; gap: 4px; padding: 9px 12px; }
      .bb-typing span { width: 6px; height: 6px; border-radius: 50%; background: #b9b9bf; animation: bb-bounce 1.2s infinite ease-in-out; }
      .bb-typing span:nth-child(2) { animation-delay: 0.15s; }
      .bb-typing span:nth-child(3) { animation-delay: 0.3s; }
      @keyframes bb-bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-4px); } }

      .bb-footer { text-align: center; font-size: 10.5px; color: #aaa; padding: 6px 0; background: ${panelBg}; }
    `;
        shadow.appendChild(style);

        const bubbleWrap = document.createElement("div");
        bubbleWrap.style.position = "relative";

        const tooltip = document.createElement("div");
        tooltip.className = "bb-tooltip";
        tooltip.textContent = tooltipText;

        const bubble = document.createElement("button");
        bubble.className = "bb-bubble";
        bubble.setAttribute("aria-label", "Open chat");
        bubble.innerHTML = isAvatarUrl
            ? `<img src="${avatar}" alt="${escapeHtml(botName)}" />`
            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`;

        bubbleWrap.appendChild(tooltip);
        bubbleWrap.appendChild(bubble);

        const win = document.createElement("div");
        win.className = "bb-window";
        win.innerHTML = `
      <div class="bb-header">
        <div class="bb-avatar">${isAvatarUrl ? `<img src="${avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />` : escapeHtml(avatar)}</div>
        <div class="bb-title">${escapeHtml(botName)}</div>
        <button class="bb-close" aria-label="Close chat">&times;</button>
      </div>
      <div class="bb-messages" id="bb-messages"></div>
      <div class="bb-inputbar">
        <input type="text" id="bb-input" placeholder="${escapeHtml(inputPlaceholder)}" autocomplete="off" />
        <button id="bb-send" aria-label="Send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg>
        </button>
      </div>
      ${showPoweredBy ? `<div class="bb-footer">Powered by BotBase</div>` : ""}
    `;

        shadow.appendChild(win);
        shadow.appendChild(bubbleWrap);

        const messagesEl = win.querySelector("#bb-messages");
        const inputEl = win.querySelector("#bb-input");
        const sendBtn = win.querySelector("#bb-send");
        const closeBtn = win.querySelector(".bb-close");

        const sessionId = getOrCreateSessionId();
        let isSending = false;
        let pingTimer = null;
        let hasOpenedOnce = false;

        function appendMessage(text, role) {
            const el = document.createElement("div");
            el.className = `bb-msg ${role}`;
            el.textContent = text;
            messagesEl.appendChild(el);
            messagesEl.scrollTop = messagesEl.scrollHeight;
            return el;
        }

        function showTyping() {
            const el = document.createElement("div");
            el.className = "bb-typing";
            el.id = "bb-typing-indicator";
            el.innerHTML = "<span></span><span></span><span></span>";
            messagesEl.appendChild(el);
            messagesEl.scrollTop = messagesEl.scrollHeight;
            return el;
        }

        function removeTyping() {
            const el = shadow.getElementById("bb-typing-indicator");
            if (el) el.remove();
        }

        function disableInput(disabled) {
            inputEl.disabled = disabled;
            sendBtn.disabled = disabled;
        }

        function renderInitialState() {
            if (initialState && initialState.paused) {
                appendMessage(initialState.message || "This bot is currently unavailable.", "system");
                disableInput(true);
                return;
            }
            if (initialState && Array.isArray(initialState.messages) && initialState.messages.length > 0) {
                initialState.messages.forEach((m) => appendMessage(m.content, m.role === "user" ? "user" : "bot"));
            } else if (initialState && initialState.welcomeMessage) {
                appendMessage(initialState.welcomeMessage, "bot");
            }
        }

        async function sendMessage(text) {
            const trimmed = (text || "").trim();
            if (!trimmed || isSending) return;
            if (initialState && initialState.paused) return;

            isSending = true;
            disableInput(true);
            inputEl.value = "";

            appendMessage(trimmed, "user");
            showTyping();
            let botMsgEl = null;

            await sendMessageStream({
                sessionId,
                message: trimmed,
                onToken: (fullText) => {
                    if (!botMsgEl) {
                        removeTyping();
                        botMsgEl = appendMessage("", "bot");
                    }
                    botMsgEl.textContent = fullText;
                    messagesEl.scrollTop = messagesEl.scrollHeight;
                },
                onDone: () => {
                    isSending = false;
                    disableInput(false);
                    inputEl.focus();
                },
                onPlainError: (msg) => {
                    removeTyping();
                    appendMessage(msg, "system");
                    isSending = false;
                    disableInput(false);
                },
                onError: (err) => {
                    console.error("[BotBase Widget] Stream error:", err);
                    removeTyping();
                    if (!botMsgEl) appendMessage(fallbackReply, "bot");
                    isSending = false;
                    disableInput(false);
                },
            });
        }

        bubble.addEventListener("click", () => {
            win.classList.toggle("open");
            tooltip.classList.add("hidden");
            if (win.classList.contains("open")) {
                inputEl.focus();
                if (!hasOpenedOnce) {
                    hasOpenedOnce = true;
                    renderInitialState();
                    pingTimer = setInterval(() => sendPing(sessionId), PING_INTERVAL_MS);
                }
            }
        });
        closeBtn.addEventListener("click", () => win.classList.remove("open"));
        sendBtn.addEventListener("click", () => sendMessage(inputEl.value));
        inputEl.addEventListener("keydown", (e) => {
            if (e.key === "Enter") sendMessage(inputEl.value);
        });

        setTimeout(() => tooltip.classList.add("hidden"), 6000);
    }

    // ---------------------------------------------------------------------
    // 5. Boot
    // ---------------------------------------------------------------------
    async function init() {
        const sessionId = getOrCreateSessionId();
        let bot = null;
        let initialState = null;

        try {
            bot = await fetchBotConfig(BOT_ID);
        } catch (err) {
            console.error("[BotBase Widget] Failed to load bot config:", err);
        }

        try {
            initialState = await startConversation(BOT_ID, sessionId);
        } catch (err) {
            console.error("[BotBase Widget] Failed to start conversation:", err);
        }

        buildWidget(bot || {}, initialState || {});
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();