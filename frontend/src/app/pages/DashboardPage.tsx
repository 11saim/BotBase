import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutGrid, Bot, BarChart3, Settings, CreditCard, Key, Bell, Search, Plus, MoreVertical, ChevronDown } from 'lucide-react';
import { Toast } from '../components/Toast';

const mockBots = [
  {
    id: 1,
    name: 'Support Bot',
    emoji: '💬',
    status: 'active',
    sources: 3,
    messages: 1284,
    visitors: 342,
    lastMessage: '2h ago',
    chartData: [40, 65, 45, 80, 60, 75, 85],
  },
  {
    id: 2,
    name: 'Product FAQ',
    emoji: '📦',
    status: 'active',
    sources: 5,
    messages: 856,
    visitors: 234,
    lastMessage: '5h ago',
    chartData: [30, 45, 60, 55, 70, 65, 60],
  },
  {
    id: 3,
    name: 'Docs Helper',
    emoji: '📚',
    status: 'paused',
    sources: 2,
    messages: 423,
    visitors: 128,
    lastMessage: '1d ago',
    chartData: [20, 35, 40, 30, 25, 30, 28],
  },
];

export function DashboardPage() {
  const [selectedBot, setSelectedBot] = useState<number | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showMenu, setShowMenu] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [bots, setBots] = useState(mockBots);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredBots = bots.filter(bot => {
    if (activeFilter === 'all') return true;
    return bot.status === activeFilter;
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuAction = (botId: number, action: string) => {
    setShowMenu(null);

    switch(action) {
      case 'open':
        navigate(`/bot/${botId}`);
        break;
      case 'duplicate':
        const botToDuplicate = bots.find(b => b.id === botId);
        if (botToDuplicate) {
          const newBot = {
            ...botToDuplicate,
            id: bots.length + 1,
            name: `${botToDuplicate.name} (Copy)`,
          };
          setBots([...bots, newBot]);
          setToast({ message: `Bot "${botToDuplicate.name}" duplicated successfully!`, type: 'success' });
        }
        break;
      case 'retrain':
        setToast({ message: 'Bot retraining started...', type: 'info' });
        break;
      case 'copy':
        navigator.clipboard.writeText(`<script src="https://botbase.ai/widget.js" data-bot-id="${botId}"></script>`);
        setToast({ message: 'Script tag copied to clipboard!', type: 'success' });
        break;
      case 'pause':
        const bot = bots.find(b => b.id === botId);
        setBots(bots.map(b =>
          b.id === botId ? { ...b, status: b.status === 'active' ? 'paused' as const : 'active' as const } : b
        ));
        setToast({
          message: `Bot ${bot?.status === 'active' ? 'paused' : 'resumed'} successfully!`,
          type: 'success'
        });
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this bot?')) {
          const deletedBot = bots.find(b => b.id === botId);
          setBots(bots.filter(b => b.id !== botId));
          setToast({ message: `Bot "${deletedBot?.name}" deleted successfully!`, type: 'success' });
        }
        break;
    }
  };

  return (
    <div className="h-screen flex bg-[var(--bg-secondary)]">
      {/* Sidebar */}
      <div className="w-[220px] bg-white border-r border-[var(--border-default)] flex flex-col">
        {/* Logo */}
        <div className="p-4">
          <Link to="/" className="flex items-center gap-1" style={{ fontWeight: 500, fontSize: '15px' }}>
            <span>botbase</span>
            <span style={{ color: 'var(--text-secondary)' }}>.ai</span>
          </Link>

          {/* Workspace Switcher */}
          <button className="w-full mt-3 px-3 py-2 rounded-lg border border-[var(--border-default)] flex items-center justify-between hover:bg-[var(--bg-secondary)] transition-all">
            <span style={{ fontSize: '13px' }}>Saim's workspace</span>
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 space-y-1">
          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, color: 'var(--text-tertiary)', padding: '8px 12px' }}>
            WORKSPACE
          </p>

          {[
            { icon: LayoutGrid, label: 'Overview', active: false, to: '/overview' },
            { icon: Bot, label: 'My Bots', active: true, to: '/dashboard' },
            { icon: BarChart3, label: 'Analytics', active: false, to: '/analytics' },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all"
              style={{
                background: item.active ? 'var(--bg-secondary)' : 'transparent',
                borderLeft: item.active ? '2px solid var(--text-primary)' : '2px solid transparent',
                color: 'var(--text-primary)',
              }}
            >
              <item.icon size={14} />
              <span style={{ fontSize: '13px' }}>{item.label}</span>
            </Link>
          ))}

          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, color: 'var(--text-tertiary)', padding: '8px 12px', marginTop: '16px' }}>
            ACCOUNT
          </p>

          {[
            { icon: Settings, label: 'Settings', to: '/settings' },
            { icon: CreditCard, label: 'Billing & Plan', to: '/settings?tab=billing' },
            { icon: Key, label: 'API Keys', to: '/settings?tab=api-keys' },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-all"
            >
              <item.icon size={14} />
              <span style={{ fontSize: '13px' }}>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Plan Badge */}
        <div className="p-4 border-t border-[var(--border-default)]">
          <div className="bg-[var(--bg-secondary)] rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Free plan</span>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>1/3 bots</span>
            </div>
            <div className="w-full h-1 bg-white rounded-full overflow-hidden">
              <div className="h-full bg-[var(--text-primary)]" style={{ width: '33%' }} />
            </div>
            <Link to="/settings?tab=billing" className="text-xs underline" style={{ textDecorationOffset: '2px' }}>
              Upgrade
            </Link>
          </div>
        </div>

        {/* User */}
        <div className="border-t border-[var(--border-default)] p-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[var(--text-primary)] text-white flex items-center justify-center text-[10px] font-medium">
              SK
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: '12px', fontWeight: 500 }}>Saim Khan</p>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }} className="truncate">
                saim@example.com
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="h-[52px] bg-white border-b border-[var(--border-default)] flex items-center justify-between px-6 relative">
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 500, letterSpacing: '-0.4px' }}>My Bots</h2>
            <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)' }}>
              workspace / my bots
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-tertiary)' }}
              />
              <input
                type="text"
                placeholder="Search..."
                className="h-[36px] rounded-lg border bg-white transition-all"
                style={{
                  border: '1px solid var(--border-default)',
                  fontSize: '14px',
                  paddingLeft: '36px',
                  paddingRight: '12px',
                  width: searchFocused ? '280px' : '140px',
                }}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>

            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-9 h-9 rounded-lg border border-[var(--border-default)] flex items-center justify-center hover:bg-[var(--bg-secondary)] transition-all"
            >
              <Bell size={16} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--destructive)] rounded-full" />
            </button>

            {/* New Bot Button */}
            <Link
              to="/create-bot"
              className="h-[36px] px-4 rounded-lg text-white flex items-center gap-2 hover:bg-[#2A2A2A] transition-all"
              style={{ background: 'var(--text-primary)', fontSize: '14px', fontWeight: 500 }}
            >
              <Plus size={16} />
              New bot
            </Link>
          </div>

          {/* Ticker Line */}
          <div className="absolute bottom-0 left-0 right-0 h-[0.5px] bg-[var(--border-default)] overflow-hidden">
            <div
              className="absolute h-full w-[60px] bg-gradient-to-r from-transparent via-white to-transparent"
              style={{ animation: 'ticker-slide 4s ease-in-out infinite' }}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6" style={{ background: 'white' }}>
          {/* Filter Row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-3">
              {[
                { id: 'all', label: `All (${bots.length})` },
                { id: 'active', label: 'Active' },
                { id: 'paused', label: 'Paused' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as typeof activeFilter)}
                  className="px-4 py-2 rounded-full text-sm transition-all hover:scale-105"
                  style={{
                    background: activeFilter === tab.id ? 'var(--text-primary)' : 'transparent',
                    color: activeFilter === tab.id ? 'white' : 'var(--text-secondary)',
                    border: activeFilter === tab.id ? 'none' : '1px solid var(--border-default)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Recent <ChevronDown size={14} />
              </button>
            </div>
          </div>

          {/* Bot Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBots.map((bot) => (
              <div
                key={bot.id}
                className="bg-white rounded-xl border-2 p-5 transition-all hover:-translate-y-1 hover:shadow-lg relative"
                style={{
                  borderColor: bot.status === 'active' ? 'var(--success)' : 'var(--border-default)',
                  opacity: bot.status === 'paused' ? 0.7 : 1,
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-xl"
                    style={{ background: 'var(--bg-secondary)' }}
                  >
                    {bot.emoji}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: bot.status === 'active' ? '#F0FDF4' : 'var(--bg-secondary)' }}>
                      <span className={`w-1.5 h-1.5 rounded-full ${bot.status === 'active' ? 'bg-[var(--success)]' : 'bg-[var(--text-tertiary)]'}`} />
                      <span style={{ fontSize: '10px', color: bot.status === 'active' ? 'var(--success)' : 'var(--text-tertiary)' }}>
                        {bot.status}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowMenu(showMenu === bot.id ? null : bot.id)}
                      className="w-6 h-6 rounded hover:bg-[var(--bg-secondary)] flex items-center justify-center transition-all"
                    >
                      <MoreVertical size={14} />
                    </button>

                    {/* Three-dot Menu */}
                    {showMenu === bot.id && (
                      <div
                        ref={menuRef}
                        className="absolute top-12 right-5 w-[180px] bg-white rounded-lg border shadow-lg z-20"
                        style={{ border: '1px solid var(--border-default)' }}
                      >
                        {[
                          { label: 'Open bot', action: 'open', divider: false },
                          { label: 'Duplicate', action: 'duplicate', divider: true },
                          { label: 'Retrain', action: 'retrain', divider: false },
                          { label: 'Copy script tag', action: 'copy', divider: true },
                          { label: bot.status === 'active' ? 'Pause bot' : 'Resume bot', action: 'pause', divider: false },
                          { label: 'Delete bot', action: 'delete', divider: false, danger: true },
                        ].map((item, i) => (
                          <div key={i}>
                            {item.divider && i > 0 && <div className="border-t border-[var(--border-default)]" />}
                            <button
                              onClick={() => handleMenuAction(bot.id, item.action)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--bg-secondary)] transition-all"
                              style={{ color: item.danger ? 'var(--destructive)' : 'var(--text-primary)' }}
                            >
                              {item.label}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bot Name */}
                <h3 style={{ fontSize: '15px', fontWeight: 500, letterSpacing: '-0.2px' }}>{bot.name}</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{bot.sources} sources</p>

                {/* Separator */}
                <div className="my-4 border-t border-[var(--border-default)]" />

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p style={{ fontSize: '20px', fontWeight: 500 }}>{bot.messages}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>messages</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '20px', fontWeight: 500 }}>{bot.visitors}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>visitors</p>
                  </div>
                </div>

                {/* Mini Chart */}
                <div className="flex items-end gap-0.5 h-8 mb-3">
                  {bot.chartData.map((value, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t"
                      style={{
                        height: `${value}%`,
                        background: i === bot.chartData.length - 1 ? 'var(--text-primary)' : 'var(--border-default)',
                      }}
                    />
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Last message {bot.lastMessage}</span>
                  <Link
                    to={`/bot/${bot.id}`}
                    className="text-sm font-medium hover:gap-2 flex items-center gap-1 transition-all"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Open →
                  </Link>
                </div>
              </div>
            ))}

            {/* Create New Card */}
            <Link
              to="/create-bot"
              className="bg-white rounded-xl border-dashed p-5 flex flex-col items-center justify-center min-h-[300px] hover:border-solid hover:border-[var(--text-primary)] transition-all"
              style={{ border: '1px dashed var(--border-strong)' }}
            >
              <Plus size={24} style={{ color: 'var(--text-tertiary)' }} />
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '8px' }}>New bot</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div
          className="fixed top-[76px] right-6 w-[320px] bg-white rounded-xl border shadow-lg z-50"
          style={{ border: '1px solid var(--border-default)' }}
        >
          <div className="p-4 border-b border-[var(--border-default)] flex items-center justify-between">
            <h3 style={{ fontSize: '15px', fontWeight: 500 }}>Notifications</h3>
            <button className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Mark all read
            </button>
          </div>

          <div className="max-h-[400px] overflow-auto">
            {[
              { title: 'Support Bot hit 1,000 messages', time: '2 hours ago', unread: true },
              { title: 'Product FAQ was paused', time: '1 day ago', unread: false },
            ].map((notification, i) => (
              <div
                key={i}
                className="p-4 border-b border-[var(--border-default)] flex gap-3"
                style={{ background: notification.unread ? 'var(--bg-secondary)' : 'white' }}
              >
                {notification.unread && <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-primary)] mt-2" />}
                <div className="flex-1">
                  <p style={{ fontSize: '13px', fontWeight: 500 }}>{notification.title}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{notification.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 text-center">
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>All caught up.</p>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style>{`
        @keyframes ticker-slide {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
