import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutGrid, Bot, Settings, CreditCard, Key, Bell, Search, Plus, MoreVertical, ChevronDown, TrendingUp, Users, MessageSquare, Target } from 'lucide-react';
import { Toast } from '../components/Toast';

const mockBots = [
  { id: 1, name: 'Support Bot', emoji: '💬', status: 'active' as const, sources: 3, messages: 1284, visitors: 342, lastMessage: '2h ago', chartData: [40, 65, 45, 80, 60, 75, 85] },
  { id: 2, name: 'Product FAQ', emoji: '📦', status: 'active' as const, sources: 5, messages: 856, visitors: 234, lastMessage: '5h ago', chartData: [30, 45, 60, 55, 70, 65, 60] },
  { id: 3, name: 'Docs Helper', emoji: '📚', status: 'paused' as const, sources: 2, messages: 423, visitors: 128, lastMessage: '1d ago', chartData: [20, 35, 40, 30, 25, 30, 28] },
];

export function UnifiedDashboard() {
  const [bots, setBots] = useState(mockBots);
  const [showMenu, setShowMenu] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredBots = bots.filter(bot => activeFilter === 'all' || bot.status === activeFilter);

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
    const bot = bots.find(b => b.id === botId);

    switch(action) {
      case 'open': navigate(`/bot/${botId}`); break;
      case 'duplicate':
        if (bot) {
          setBots([...bots, { ...bot, id: bots.length + 1, name: `${bot.name} (Copy)` }]);
          setToast({ message: `Bot duplicated!`, type: 'success' });
        }
        break;
      case 'retrain': setToast({ message: 'Retraining started...', type: 'info' }); break;
      case 'copy':
        navigator.clipboard.writeText(`<script src="https://botbase.ai/widget.js" data-bot-id="${botId}"></script>`);
        setToast({ message: 'Copied!', type: 'success' });
        break;
      case 'pause':
        setBots(bots.map(b => b.id === botId ? { ...b, status: b.status === 'active' ? 'paused' as const : 'active' as const } : b));
        setToast({ message: `Bot ${bot?.status === 'active' ? 'paused' : 'resumed'}!`, type: 'success' });
        break;
      case 'delete':
        if (confirm('Delete this bot?')) {
          setBots(bots.filter(b => b.id !== botId));
          setToast({ message: 'Bot deleted!', type: 'success' });
        }
        break;
    }
  };

  const totalMessages = bots.reduce((sum, bot) => sum + bot.messages, 0);
  const totalVisitors = bots.reduce((sum, bot) => sum + bot.visitors, 0);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:flex w-64 bg-white border-r flex-col">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
              <span className="text-white text-lg">⚡</span>
            </div>
            <span className="font-semibold">botbase<span className="text-gray-400">.ai</span></span>
          </Link>
        </div>

        <nav className="flex-1 px-4">
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">Workspace</p>
            <Link to="/unified-dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-100 text-black font-medium mb-1">
              <LayoutGrid size={18} />
              Dashboard
            </Link>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">Account</p>
            {[
              { icon: Settings, label: 'Settings', to: '/settings' },
              { icon: CreditCard, label: 'Billing', to: '/settings?tab=billing' },
              { icon: Key, label: 'API Keys', to: '/settings?tab=api-keys' },
            ].map((item) => (
              <Link key={item.label} to={item.to} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-black transition-all mb-1">
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t">
          <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl p-4 text-white">
            <p className="text-sm font-semibold mb-2">Free Plan</p>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="opacity-80">1/3 bots</span>
              <span className="opacity-80">33%</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden mb-3">
              <div className="h-full w-1/3 bg-white rounded-full" />
            </div>
            <Link to="/settings?tab=billing" className="text-xs font-medium underline underline-offset-2">
              Upgrade →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-0.5">Welcome back! Here's your overview</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <Link to="/create-bot" className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-medium hover:bg-gray-900 transition-colors">
                <Plus size={18} />
                <span className="hidden sm:inline">New Bot</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Bot, label: 'Total Bots', value: bots.length.toString(), change: '+1', color: 'blue', gradient: 'from-blue-500 to-blue-600' },
                { icon: MessageSquare, label: 'Total Messages', value: totalMessages.toLocaleString(), change: '+342', color: 'purple', gradient: 'from-purple-500 to-purple-600' },
                { icon: Users, label: 'Total Visitors', value: totalVisitors.toLocaleString(), change: '+89', color: 'green', gradient: 'from-green-500 to-green-600' },
                { icon: Target, label: 'Answer Rate', value: '94%', change: '+2%', color: 'orange', gradient: 'from-orange-500 to-orange-600' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl p-6 border hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient}`}>
                      <stat.icon size={20} className="text-white" />
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-50 text-green-700">{stat.change}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Chart */}
              <div className="bg-white rounded-2xl p-6 border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-lg">Activity Overview</h3>
                  <div className="flex gap-2">
                    {['7d', '30d', '90d'].map((period) => (
                      <button key={period} className="px-3 py-1 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-end gap-2 h-48">
                  {[45, 70, 55, 85, 65, 80, 95, 70, 90, 65, 80, 92].map((height, i) => (
                    <div key={i} className="flex-1 group relative">
                      <div
                        className="w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                        style={{
                          height: `${height}%`,
                          background: i === 11 ? 'linear-gradient(to top, #6366f1, #8b5cf6)' : '#e5e7eb',
                        }}
                      />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {Math.round(height * 10)} msgs
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Questions */}
              <div className="bg-white rounded-2xl p-6 border">
                <h3 className="font-semibold text-lg mb-4">Top Questions</h3>
                <div className="space-y-3">
                  {[
                    { q: 'How do I reset my password?', count: 142 },
                    { q: 'What are your pricing plans?', count: 98 },
                    { q: 'How do I cancel?', count: 76 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <span className="text-sm flex-1">{item.q}</span>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100">{item.count}×</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bots Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">My Bots</h2>
                <div className="flex gap-2">
                  {[
                    { id: 'all', label: `All (${bots.length})` },
                    { id: 'active', label: 'Active' },
                    { id: 'paused', label: 'Paused' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFilter(tab.id as typeof activeFilter)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        activeFilter === tab.id ? 'bg-black text-white' : 'bg-white border hover:border-black'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBots.map((bot) => (
                  <div key={bot.id} className="bg-white rounded-2xl p-6 border-2 hover:border-black transition-all relative group" style={{ borderColor: bot.status === 'active' ? '#10b981' : '#e5e7eb' }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">{bot.emoji}</div>
                        <div>
                          <h3 className="font-semibold">{bot.name}</h3>
                          <p className="text-xs text-gray-500">{bot.sources} sources</p>
                        </div>
                      </div>
                      <button onClick={() => setShowMenu(showMenu === bot.id ? null : bot.id)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <MoreVertical size={16} />
                      </button>

                      {showMenu === bot.id && (
                        <div ref={menuRef} className="absolute top-14 right-6 w-48 bg-white rounded-xl border shadow-xl z-20 py-1">
                          {[
                            { label: 'Open bot', action: 'open' },
                            { label: 'Duplicate', action: 'duplicate' },
                            { label: 'Retrain', action: 'retrain' },
                            { label: 'Copy script tag', action: 'copy' },
                            { label: bot.status === 'active' ? 'Pause' : 'Resume', action: 'pause' },
                            { label: 'Delete', action: 'delete', danger: true },
                          ].map((item) => (
                            <button
                              key={item.action}
                              onClick={() => handleMenuAction(bot.id, item.action)}
                              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${item.danger ? 'text-red-600' : ''}`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-2xl font-bold">{bot.messages.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">messages</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{bot.visitors.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">visitors</p>
                      </div>
                    </div>

                    <div className="flex items-end gap-1 h-12 mb-4">
                      {bot.chartData.map((val, i) => (
                        <div key={i} className="flex-1 rounded-t" style={{ height: `${val}%`, background: i === bot.chartData.length - 1 ? '#000' : '#e5e7eb' }} />
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Last msg {bot.lastMessage}</span>
                      <Link to={`/bot/${bot.id}`} className="font-medium hover:underline">Open →</Link>
                    </div>
                  </div>
                ))}

                <Link to="/create-bot" className="bg-white rounded-2xl p-6 border-2 border-dashed hover:border-solid hover:border-black transition-all flex flex-col items-center justify-center min-h-[300px] group">
                  <Plus size={32} className="text-gray-400 group-hover:text-black transition-colors mb-3" />
                  <p className="font-medium text-gray-600 group-hover:text-black transition-colors">Create New Bot</p>
                </Link>
              </div>
            </div>

            {/* Unanswered Questions */}
            <div className="bg-white rounded-2xl p-6 border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Unanswered Questions</h3>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-50 text-red-600">Needs Attention</span>
              </div>
              <div className="space-y-2">
                {[
                  { q: 'Do you offer enterprise plans?', bot: 'Support Bot', count: 12 },
                  { q: 'Can I export my data?', bot: 'Product FAQ', count: 8 },
                  { q: 'How do I integrate with Slack?', bot: 'Support Bot', count: 6 },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-xl border hover:border-black transition-all cursor-pointer group"
                    onClick={() => {
                      const answer = prompt(`Add answer for: "${item.q}"`);
                      if (answer) setToast({ message: 'Answer saved!', type: 'success' });
                    }}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium group-hover:text-black transition-colors">{item.q}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">{item.bot}</span>
                        <span className="text-xs text-gray-500">🔴 Asked {item.count}×</span>
                      </div>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium border rounded-xl hover:border-black transition-all">Add Answer</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
