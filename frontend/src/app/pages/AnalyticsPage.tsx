import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Bot, BarChart3, Settings, CreditCard, Key, Bell, Search, ChevronDown } from 'lucide-react';

export function AnalyticsPage() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [dateRange, setDateRange] = useState('7d');

  return (
    <div className="h-screen flex bg-[var(--bg-secondary)]">
      {/* Sidebar - Same as Overview */}
      <div className="w-[220px] bg-white border-r border-[var(--border-default)] flex flex-col">
        <div className="p-4">
          <Link to="/" className="flex items-center gap-1" style={{ fontWeight: 500, fontSize: '15px' }}>
            <span>botbase</span>
            <span style={{ color: 'var(--text-secondary)' }}>.ai</span>
          </Link>

          <button className="w-full mt-3 px-3 py-2 rounded-lg border border-[var(--border-default)] flex items-center justify-between hover:bg-[var(--bg-secondary)] transition-all">
            <span style={{ fontSize: '13px' }}>Saim's workspace</span>
            <ChevronDown size={14} />
          </button>
        </div>

        <nav className="flex-1 px-2 space-y-1">
          <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, color: 'var(--text-tertiary)', padding: '8px 12px' }}>
            WORKSPACE
          </p>

          {[
            { icon: LayoutGrid, label: 'Overview', active: false, to: '/overview' },
            { icon: Bot, label: 'My Bots', active: false, to: '/dashboard' },
            { icon: BarChart3, label: 'Analytics', active: true, to: '/analytics' },
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
            <h2 style={{ fontSize: '20px', fontWeight: 500, letterSpacing: '-0.4px' }}>Analytics</h2>
            <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)' }}>
              workspace / analytics
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {['7d', '30d', '90d', 'Custom'].map((period) => (
                <button
                  key={period}
                  onClick={() => setDateRange(period)}
                  className="px-3 py-1 rounded text-sm transition-all"
                  style={{
                    background: dateRange === period ? 'var(--text-primary)' : 'transparent',
                    color: dateRange === period ? 'white' : 'var(--text-secondary)',
                    border: dateRange === period ? 'none' : '1px solid var(--border-default)',
                  }}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-[0.5px] bg-[var(--border-default)] overflow-hidden">
            <div
              className="absolute h-full w-[60px] bg-gradient-to-r from-transparent via-white to-transparent"
              style={{ animation: 'ticker-slide 4s ease-in-out infinite' }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6" style={{ background: '#FAFAFA' }}>
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Metrics Row - Different style than Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Messages', value: '2,563', change: '+342', gradient: 'from-blue-50 to-blue-100' },
                { label: 'Total Visitors', value: '704', change: '+89', gradient: 'from-green-50 to-green-100' },
                { label: 'Active Bots', value: '3', change: '+1', gradient: 'from-purple-50 to-purple-100' },
                { label: 'Answer Rate', value: '94%', change: '+2%', gradient: 'from-orange-50 to-orange-100' },
              ].map((metric) => (
                <div key={metric.label} className={`bg-gradient-to-br ${metric.gradient} rounded-xl p-5 border border-white shadow-sm`}>
                  <div className="flex items-center justify-between mb-2">
                    <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {metric.label}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white" style={{ color: 'var(--success)' }}>
                      {metric.change}
                    </span>
                  </div>
                  <p style={{ fontSize: '36px', fontWeight: 600, color: 'var(--text-primary)' }}>{metric.value}</p>
                </div>
              ))}
            </div>

            {/* Bot Performance Comparison */}
            <div className="bg-white rounded-xl border p-6" style={{ border: '1px solid var(--border-default)' }}>
              <p style={{ fontSize: '15px', fontWeight: 500, marginBottom: '16px' }}>Bot Performance</p>
              <div className="space-y-4">
                {[
                  { name: 'Support Bot', messages: 1284, color: '#0A0A0A', percentage: 100 },
                  { name: 'Product FAQ', messages: 856, color: '#6B6B65', percentage: 67 },
                  { name: 'Docs Helper', messages: 423, color: '#A8A8A2', percentage: 33 },
                ].map((bot) => (
                  <div key={bot.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">{bot.name}</span>
                      <span className="text-sm font-medium">{bot.messages} messages</span>
                    </div>
                    <div className="w-full h-8 bg-[var(--bg-secondary)] rounded-lg overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${bot.percentage}%`,
                          background: bot.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Combined Messages Chart */}
            <div className="bg-white rounded-xl border p-6" style={{ border: '1px solid var(--border-default)' }}>
              <div className="flex items-center justify-between mb-6">
                <p style={{ fontSize: '15px', fontWeight: 500 }}>Messages Over Time</p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#0A0A0A]" />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Support Bot</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#6B6B65]" />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Product FAQ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#A8A8A2]" />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Docs Helper</span>
                  </div>
                </div>
              </div>

              <div className="flex items-end gap-2 h-48">
                {Array(14).fill(0).map((_, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end gap-1">
                    <div className="rounded-t bg-[#0A0A0A]" style={{ height: `${Math.random() * 60 + 40}%` }} />
                    <div className="rounded-t bg-[#6B6B65]" style={{ height: `${Math.random() * 40 + 20}%` }} />
                    <div className="rounded-t bg-[#A8A8A2]" style={{ height: `${Math.random() * 30 + 10}%` }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Unanswered Questions Across All Bots */}
            <div className="bg-white rounded-xl border p-6" style={{ border: '1px solid var(--border-default)' }}>
              <div className="flex items-center justify-between mb-4">
                <p style={{ fontSize: '15px', fontWeight: 500 }}>Unanswered Questions</p>
                <span className="text-xs px-3 py-1 rounded-full bg-red-50" style={{ color: 'var(--destructive)' }}>
                  Needs attention
                </span>
              </div>
              <div className="space-y-2">
                {[
                  { question: 'Do you offer enterprise plans?', bot: 'Support Bot', count: 12 },
                  { question: 'Can I export my data?', bot: 'Product FAQ', count: 8 },
                  { question: 'How do I integrate with Slack?', bot: 'Support Bot', count: 6 },
                  { question: 'What APIs are available?', bot: 'Docs Helper', count: 5 },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-lg border border-transparent hover:border-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all cursor-pointer group"
                    onClick={() => {
                      const answer = prompt(`Add an answer for: "${item.question}"`);
                      if (answer) {
                        alert(`Answer saved for "${item.question}"`);
                      }
                    }}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium group-hover:text-[var(--text-primary)] transition-colors">{item.question}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className="text-xs px-2 py-1 rounded-full bg-[var(--bg-secondary)]"
                        >
                          {item.bot}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          🔴 Asked {item.count} times
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const answer = prompt(`Add an answer for: "${item.question}"`);
                        if (answer) {
                          alert(`Answer saved: "${answer}"`);
                        }
                      }}
                      className="text-xs px-4 py-2 rounded-lg border transition-all hover:bg-white hover:border-[var(--text-primary)]"
                      style={{ border: '1px solid var(--border-default)' }}
                    >
                      Add Answer
                    </button>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-sm rounded-lg border border-dashed hover:border-solid transition-all" style={{ border: '1px dashed var(--border-default)' }}>
                View all unanswered questions →
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ticker-slide {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
