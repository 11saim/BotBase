import React from "react";
import { Code, Copy, Globe, Key, Mail, MessageCircle, Plus, ShoppingBag, Webhook } from "lucide-react";

export function DashboardIntegrationsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-none">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Integrations</h1>
        <p className="text-[13px] mt-1 text-[var(--text-secondary)]">Connect your bots to external tools and services</p>
      </div>

      <div className="space-y-8 max-w-4xl">
        {/* Connected Section */}
        <section>
          <h2 className="text-[12px] font-medium text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Connected</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <IntegrationCard
              icon={<Code size={20} className="text-green-600" />}
              iconBg="bg-green-50"
              name="Website embed"
              desc="Live chat widget for your website"
              status="Connected"
            />
            <IntegrationCard
              icon={<MessageCircle size={20} className="text-blue-600" />}
              iconBg="bg-blue-50"
              name="Slack"
              desc="Answer questions directly in Slack channels"
              status="Connected"
            />
          </div>
        </section>

        {/* Available Section */}
        <section>
          <h2 className="text-[12px] font-medium text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Available</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <IntegrationCard
              icon={<ShoppingBag size={20} className="text-amber-600" />}
              iconBg="bg-amber-100"
              name="Shopify"
              desc="Product & order context"
              status="Connect"
            />
            <IntegrationCard
              icon={<Globe size={20} className="text-purple-600" />}
              iconBg="bg-purple-100"
              name="WordPress"
              desc="Plugin-based embed"
              status="Connect"
            />
            <IntegrationCard
              icon={<Mail size={20} className="text-pink-600" />}
              iconBg="bg-pink-100"
              name="Email/SMTP"
              desc="Trigger emails on events"
              status="Connect"
            />
            <IntegrationCard
              icon={<Webhook size={20} className="text-teal-600" />}
              iconBg="bg-teal-100"
              name="Webhooks"
              desc="Custom HTTP callbacks"
              status="Connect"
            />
          </div>
        </section>

        {/* API Keys Section */}
        <section>
          <div className="bg-white rounded-lg p-4 border border-black/10" style={{ borderWidth: '0.5px' }}>
            <div className="flex items-center gap-2 mb-4 text-[var(--text-primary)]">
              <Key size={16} />
              <h3 className="text-[14px] font-medium">API keys</h3>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-end justify-between py-2 border-b border-black/5" style={{ borderWidth: '0 0 0.5px 0' }}>
                <div className="min-w-0 pr-2 flex-1">
                  <p className="text-[11px] text-[var(--text-tertiary)] mb-0.5">Live key</p>
                  <p className="font-mono text-[13px] text-[var(--text-primary)]">sk_live_••••••••••••••••8f92</p>
                </div>
                <button className="shrink-0 p-1.5 rounded border border-black/10 hover:bg-[var(--bg-secondary)] transition-colors" title="Copy">
                  <Copy size={14} className="text-[var(--text-secondary)]" />
                </button>
              </div>
              <div className="flex items-end justify-between py-2 border-b border-black/5" style={{ borderWidth: '0 0 0.5px 0' }}>
                <div className="min-w-0 pr-2 flex-1">
                  <p className="text-[11px] text-[var(--text-tertiary)] mb-0.5">Test key</p>
                  <p className="font-mono text-[13px] text-[var(--text-primary)]">sk_test_••••••••••••••••3a1b</p>
                </div>
                <button className="shrink-0 p-1.5 rounded border border-black/10 hover:bg-[var(--bg-secondary)] transition-colors" title="Copy">
                  <Copy size={14} className="text-[var(--text-secondary)]" />
                </button>
              </div>
            </div>

            <button className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded border border-black/10 hover:bg-[var(--bg-secondary)] transition-colors">
              <Plus size={14} className="text-[var(--text-secondary)]" />
              Generate new key
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function IntegrationCard({ icon, iconBg, name, desc, status }: { icon: React.ReactNode, iconBg: string, name: string, desc: string, status: string }) {
  const isConnected = status === "Connected";

  return (
    <div className="bg-white rounded-lg p-[14px] border border-black/10 flex items-center gap-3" style={{ borderWidth: '0.5px' }}>
      <div className={`w-[36px] h-[36px] rounded-md flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[13px] font-medium text-[var(--text-primary)] truncate">{name}</h4>
        <p className="text-[11px] text-[var(--text-secondary)] truncate">{desc}</p>
      </div>
      <div className="shrink-0">
        {isConnected ? (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: '#EAF3DE', color: '#3B6D11' }}>
            Connected
          </span>
        ) : (
          <button className="inline-block px-3 py-1 rounded-full text-[11px] font-medium bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-black/5 transition-colors">
            Connect
          </button>
        )}
      </div>
    </div>
  );
}
