import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Copy } from 'lucide-react';

const tabs = ['Overview', 'Customize', 'Knowledge', 'Analytics'];

export function BotDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      {/* Header */}
      <div className="bg-white border-b border-[var(--border-default)]">
        <div className="px-6 py-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-xs mb-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={12} />
            My bots
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl"
                style={{ background: 'var(--bg-secondary)' }}
              >
                💬
              </div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 500, letterSpacing: '-0.4px' }}>Support Bot</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F0FDF4]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                    <span style={{ fontSize: '10px', color: 'var(--success)' }}>active</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                className="px-4 h-[36px] rounded-lg border transition-all hover:bg-[var(--bg-secondary)]"
                style={{ border: '1px solid var(--border-default)', fontSize: '14px' }}
              >
                Retrain
              </button>
              <button
                className="px-4 h-[36px] rounded-lg text-white transition-all hover:bg-[#2A2A2A]"
                style={{ background: 'var(--text-primary)', fontSize: '14px' }}
              >
                Save changes
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-8 mt-6 border-b border-[var(--border-default)]">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                onClick={() => setActiveTab(index)}
                className="pb-3 text-sm relative transition-all"
                style={{
                  color: activeTab === index ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: activeTab === index ? 500 : 400,
                }}
              >
                {tab}
                {activeTab === index && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{ background: 'var(--text-primary)' }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-6xl mx-auto">
        {activeTab === 0 && (
          <div className="space-y-6">
            {/* Script Tag Card */}
            <div className="bg-white rounded-xl border p-6" style={{ border: '1px solid var(--border-default)' }}>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                EMBED SCRIPT
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="flex-1 p-3 rounded-lg font-mono text-xs overflow-x-auto"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}
                >
                  <code>&lt;script src="https://botbase.ai/widget.js" data-bot-id="bot-{id}"&gt;&lt;/script&gt;</code>
                </div>
                <button
                  onClick={handleCopy}
                  className="px-4 h-[36px] rounded-lg border flex items-center gap-2 transition-all hover:bg-[var(--bg-secondary)]"
                  style={{
                    border: copied ? '1px solid var(--success)' : '1px solid var(--border-default)',
                    color: copied ? 'var(--success)' : 'var(--text-primary)',
                  }}
                >
                  <Copy size={14} />
                  {copied ? 'Copied ✓' : 'Copy'}
                </button>
              </div>
              <p className="text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>
                Paste before &lt;/body&gt;. Changes reflect instantly.
              </p>

              <div className="flex gap-3 mt-4">
                {[
                  { label: 'live since Apr 12', color: '#1A6B3C' },
                  { label: '0ms sync delay', color: 'var(--text-tertiary)' },
                  { label: 'v1.2.0', color: 'var(--text-tertiary)' },
                ].map((pill) => (
                  <div
                    key={pill.label}
                    className="px-3 py-1 rounded-full text-xs flex items-center gap-2"
                    style={{ border: '1px solid var(--border-default)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: pill.color }} />
                    {pill.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Total messages', value: '1,284', change: '+12%', positive: true },
                { label: 'Total visitors', value: '342', change: '+8%', positive: true },
                { label: 'Answer rate', value: '94%', change: '−2%', positive: false },
                { label: 'Avg session', value: '2m 34s', change: '+5%', positive: true },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="bg-[var(--bg-secondary)] rounded-lg p-4"
                >
                  <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)' }}>
                    {metric.label}
                  </p>
                  <p style={{ fontSize: '24px', fontWeight: 500, marginTop: '8px' }}>{metric.value}</p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: metric.positive ? 'var(--success)' : 'var(--destructive)' }}
                  >
                    {metric.change} vs last week
                  </p>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="bg-white rounded-xl border p-6" style={{ border: '1px solid var(--border-default)' }}>
              <div className="flex items-center justify-between mb-6">
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, color: 'var(--text-tertiary)' }}>
                  ACTIVITY
                </p>
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

              <div className="flex items-end gap-2 h-32">
                {[40, 65, 45, 80, 60, 75, 85].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t transition-all hover:opacity-70 cursor-pointer"
                    style={{
                      height: `${height}%`,
                      background: i === 6 ? 'var(--text-primary)' : 'var(--border-default)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white rounded-xl border p-6" style={{ border: '1px solid var(--border-default)' }}>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, color: 'var(--text-tertiary)', marginBottom: '16px' }}>
                  APPEARANCE
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Bot name</label>
                    <input
                      type="text"
                      defaultValue="Support Bot"
                      className="w-full h-[36px] px-3 rounded-lg border"
                      style={{ border: '1px solid var(--border-default)', fontSize: '14px' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Theme color</label>
                    <div className="flex gap-2">
                      {['#0A0A0A', '#2A2A2A', '#1A6B3C', '#1A4A6B'].map((color) => (
                        <button
                          key={color}
                          className="w-7 h-7 rounded-full"
                          style={{ background: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky top-6">
              <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, color: 'var(--text-tertiary)', marginBottom: '12px' }}>
                LIVE PREVIEW
              </p>
              <div className="bg-white rounded-xl border p-6 h-[400px]" style={{ border: '1px solid var(--border-default)' }}>
                <div className="h-full bg-[var(--bg-secondary)] rounded-lg flex items-center justify-center">
                  <p style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Widget preview</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border" style={{ border: '1px solid var(--border-default)' }}>
              <div className="p-6 border-b border-[var(--border-default)] flex items-center justify-between">
                <p style={{ fontSize: '15px', fontWeight: 500 }}>Sources</p>
                <button
                  className="px-4 h-[32px] rounded-lg border transition-all hover:bg-[var(--bg-secondary)]"
                  style={{ border: '1px solid var(--border-default)', fontSize: '14px' }}
                >
                  Add source +
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border-default)]">
                      {['Name', 'Type', 'Added', 'Pages', 'Actions'].map((header) => (
                        <th
                          key={header}
                          className="px-6 py-3 text-left"
                          style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', fontWeight: 500 }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'getting-started.pdf', type: 'PDF', added: 'Apr 12, 2026', pages: 24 },
                      { name: 'docs.example.com', type: 'URL', added: 'Apr 10, 2026', pages: 12 },
                      { name: 'faq-content.txt', type: 'TEXT', added: 'Apr 8, 2026', pages: 1 },
                    ].map((source) => (
                      <tr key={source.name} className="border-b border-[var(--border-default)] hover:bg-[var(--bg-secondary)] transition-all">
                        <td className="px-6 py-4 text-sm">{source.name}</td>
                        <td className="px-6 py-4">
                          <span
                            className="px-2 py-1 rounded text-xs"
                            style={{ border: '1px solid var(--border-default)' }}
                          >
                            {source.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {source.added}
                        </td>
                        <td className="px-6 py-4 text-sm">{source.pages}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              Retrain ↺
                            </button>
                            <button className="text-xs" style={{ color: 'var(--destructive)' }}>
                              Remove ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 3 && (
          <div className="space-y-6">
            <div className="flex justify-end gap-2">
              {['7d', '30d', '90d', 'Custom'].map((period) => (
                <button
                  key={period}
                  className="px-3 py-1 rounded text-sm transition-all"
                  style={{
                    background: period === '7d' ? 'var(--text-primary)' : 'transparent',
                    color: period === '7d' ? 'white' : 'var(--text-secondary)',
                    border: period === '7d' ? 'none' : '1px solid var(--border-default)',
                  }}
                >
                  {period}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border p-6" style={{ border: '1px solid var(--border-default)' }}>
                <p style={{ fontSize: '15px', fontWeight: 500, marginBottom: '16px' }}>Top Questions</p>
                <div className="space-y-3">
                  {[
                    { question: 'How do I reset my password?', count: 142 },
                    { question: 'What are your pricing plans?', count: 98 },
                    { question: 'How do I cancel my subscription?', count: 76 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm flex-1">{item.question}</span>
                      <span className="text-xs px-2 py-1 rounded" style={{ background: 'var(--bg-secondary)' }}>
                        {item.count}×
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border p-6" style={{ border: '1px solid var(--border-default)' }}>
                <p style={{ fontSize: '15px', fontWeight: 500, marginBottom: '16px' }}>Unanswered Questions</p>
                <div className="space-y-3">
                  {[
                    { question: 'Do you offer enterprise plans?', count: 12 },
                    { question: 'Can I export my data?', count: 8 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <span className="text-sm flex-1">{item.question}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          {item.count}×
                        </span>
                        <button className="text-xs" style={{ color: 'var(--text-primary)' }}>
                          Add to Q&A
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
