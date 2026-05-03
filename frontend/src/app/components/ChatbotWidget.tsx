import { useState, useEffect, useRef } from 'react';
import { X, Minus, Send } from 'lucide-react';

interface Message {
  role: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

interface ChatbotWidgetProps {
  botName?: string;
  emoji?: string;
  themeColor?: string;
  position?: 'bottom-right' | 'bottom-left';
}

export function ChatbotWidget({
  botName = 'Support Bot',
  emoji = '💬',
  themeColor = '#0A0A0A',
  position = 'bottom-right',
}: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: 'Hi! Ask me anything.',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const botMessage: Message = {
        role: 'bot',
        content: 'Thanks for your question! This is a demo response. In a real bot, I would provide a helpful answer based on your knowledge base.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="fixed z-50"
      style={{
        [position.includes('right') ? 'right' : 'left']: '20px',
        bottom: '20px',
      }}
    >
      {/* Bubble (collapsed state) */}
      {!isOpen && (
        <>
          <button
            onClick={() => {
              setIsOpen(true);
              setShowTooltip(false);
            }}
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg transition-transform hover:scale-110 relative"
            style={{
              background: themeColor,
              animation: 'bubble-appear 300ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {emoji}
          </button>

          {/* Tooltip */}
          {showTooltip && (
            <div
              className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-lg px-4 py-2 whitespace-nowrap border"
              style={{
                border: '1px solid var(--border-default)',
                animation: 'tooltip-slide 200ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <p className="text-sm">👋 Hi! Ask me anything.</p>
            </div>
          )}
        </>
      )}

      {/* Window (expanded state) */}
      {isOpen && (
        <div
          className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{
            width: '340px',
            height: '480px',
            border: '1px solid var(--border-default)',
            animation: 'window-appear 250ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ background: themeColor }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">
                {emoji}
              </div>
              <div>
                <p className="text-white text-sm font-medium">{botName}</p>
                <p className="text-white/70 text-xs">● Online</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center text-white transition-all"
              >
                <Minus size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ background: 'white' }}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                style={{
                  animation: 'message-appear 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <div
                  className="max-w-[80%] px-3 py-2 text-sm"
                  style={{
                    background: message.role === 'bot' ? 'var(--bg-secondary)' : themeColor,
                    color: message.role === 'bot' ? 'var(--text-primary)' : 'white',
                    borderRadius:
                      message.role === 'bot'
                        ? '4px 12px 12px 12px'
                        : '12px 4px 12px 12px',
                  }}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div
                  className="px-3 py-2 rounded-xl"
                  style={{ background: 'var(--bg-secondary)' }}
                >
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: 'var(--text-tertiary)',
                          animation: `typing-dot 1.2s ease-in-out ${i * 0.133}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Row */}
          <div className="border-t px-3 py-3 flex items-center gap-2" style={{ borderColor: 'var(--border-default)' }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask something..."
              className="flex-1 outline-none text-sm"
              style={{ background: 'transparent' }}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all disabled:opacity-40"
              style={{ background: themeColor }}
            >
              <Send size={14} className="text-white" />
            </button>
          </div>

          {/* Powered By */}
          <div className="text-center py-2 border-t" style={{ borderColor: 'var(--border-default)' }}>
            <a
              href="/"
              className="text-[9px]"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Powered by botbase.ai
            </a>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bubble-appear {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes window-appear {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes message-appear {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes tooltip-slide {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes typing-dot {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </div>
  );
}
