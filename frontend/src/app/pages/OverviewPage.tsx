import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Bot, BarChart3, Settings, CreditCard, Key, Bell, Search, ChevronDown } from 'lucide-react';

export function OverviewPage() {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div className="h-screen flex bg-[var(--bg-secondary)]">
      {/* Sidebar */}
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
            { icon: LayoutGrid, label: 'Overview', active: true, to: '/overview' },
            { icon: Bot, label: 'My Bots', active: false, to: '/dashboard' },
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
            <h2 style={{ fontSize: '20px', fontWeight: 500, letterSpacing: '-0.4px' }}>Overview</h2>
            <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)' }}>
              workspace / overview
            </p>
          </div>

          <div className="flex items-center gap-3">
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

            <button className="relative w-9 h-9 rounded-lg border border-[var(--border-default)] flex items-center justify-center hover:bg-[var(--bg-secondary)] transition-all">
              <Bell size={16} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--destructive)] rounded-full" />
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-[0.5px] bg-[var(--border-default)] overflow-hidden">
            <div
              className="absolute h-full w-[60px] bg-gradient-to-r from-transparent via-white to-transparent"
              style={{ animation: 'ticker-slide 4s ease-in-out infinite' }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6" style={{ background: 'white' }}>
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-[#0A0A0A] to-[#2A2A2A] rounded-xl p-6 text-white">
              <h3 className="text-xl font-medium mb-2">Welcome back, Saim! 👋</h3>
              <p className="text-sm opacity-80">Your bots handled 342 new conversations this week</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Bots', value: '3', change: '+1', positive: true, icon: '🤖', color: '#1A6B3C' },
                { label: 'Total Messages', value: '2,563', change: '+342', positive: true, icon: '💬', color: '#0A0A0A' },
                { label: 'Active Visitors', value: '704', change: '+89', positive: true, icon: '👥', color: '#1A4A6B' },
                { label: 'Answer Rate', value: '94%', change: '-2%', positive: false, icon: '🎯', color: '#6B1A4A' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border-2 p-5 hover:scale-105 transition-transform" style={{ borderColor: stat.color }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{stat.icon}</span>
                    <p className="text-xs px-2 py-1 rounded-full" style={{
                      background: stat.positive ? '#F0FDF4' : '#FFF5F5',
                      color: stat.positive ? 'var(--success)' : 'var(--destructive)'
                    }}>
                      {stat.change}
                    </p>
                  </div>
                  <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)' }}>
                    {stat.label}
                  </p>
                  <p style={{ fontSize: '32px', fontWeight: 500, marginTop: '4px', color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Activity Chart */}
            <div className="bg-white rounded-xl border p-6" style={{ border: '1px solid var(--border-default)' }}>
              <div className="flex items-center justify-between mb-6">
                <p style={{ fontSize: '15px', fontWeight: 500 }}>Activity Overview</p>
                <div className="flex gap-2">
                  {['7d', '30d', '90d'].map((period) => (
                    <button
                      key={period}
                      className="px-3 py-1 rounded text-xs transition-all"
                      style={{
                        background: period === '7d' ? 'var(--text-primary)' : 'transparent',
                        color: period === '7d' ? 'white' : 'var(--text-secondary)',
                      }}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-end gap-2 h-48">
                {[40, 65, 45, 80, 60, 75, 85, 70, 90, 65, 80, 95, 85, 92].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t transition-all hover:opacity-70 cursor-pointer"
                    style={{
                      height: `${height}%`,
                      background: i === 13 ? 'var(--text-primary)' : 'var(--border-default)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/create-bot"
                className="bg-white rounded-xl border p-6 hover:border-[var(--text-primary)] transition-all"
                style={{ border: '1px solid var(--border-default)' }}
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--text-primary)] text-white flex items-center justify-center text-lg mb-3">
                  +
                </div>
                <p style={{ fontSize: '15px', fontWeight: 500 }}>Create New Bot</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Start a new chatbot in 60 seconds
                </p>
              </Link>

              <Link
                to="/dashboard"
                className="bg-white rounded-xl border p-6 hover:border-[var(--text-primary)] transition-all"
                style={{ border: '1px solid var(--border-default)' }}
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-lg mb-3">
                  💬
                </div>
                <p style={{ fontSize: '15px', fontWeight: 500 }}>My Bots</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Manage your 3 active bots
                </p>
              </Link>

              <Link
                to="/analytics"
                className="bg-white rounded-xl border p-6 hover:border-[var(--text-primary)] transition-all"
                style={{ border: '1px solid var(--border-default)' }}
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-lg mb-3">
                  📊
                </div>
                <p style={{ fontSize: '15px', fontWeight: 500 }}>Analytics</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  View detailed performance metrics
                </p>
              </Link>
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
