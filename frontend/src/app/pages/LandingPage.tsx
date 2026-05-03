import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Play, Check } from 'lucide-react';
import { ChatbotWidget } from '../components/ChatbotWidget';

export function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annually'>('monthly');

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-[52px] flex items-center justify-between px-6"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: scrollY > 20 ? '0.5px solid var(--border-default)' : '0.5px solid transparent',
          transition: 'border-bottom 200ms',
        }}
      >
        <div className="flex items-center gap-1">
          <span style={{ fontWeight: 500, fontSize: '15px' }}>botbase</span>
          <span style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>.ai</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Pricing', 'Showcase'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              style={{ fontSize: '14px', color: 'var(--text-primary)' }}
              className="hover:opacity-70 transition-opacity"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            style={{
              fontSize: '14px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)',
              background: 'transparent',
              color: 'var(--text-primary)',
              transition: 'all 80ms var(--ease-smooth)',
            }}
            className="hover:bg-[var(--bg-secondary)]"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            style={{
              fontSize: '14px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--text-primary)',
              color: 'white',
              transition: 'all 80ms var(--ease-smooth)',
            }}
            className="hover:bg-[#2A2A2A]"
          >
            Get started
          </Link>
        </div>

        {/* Ticker Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[0.5px] bg-[var(--border-default)] overflow-hidden">
          <div
            className="absolute h-full w-[60px] bg-gradient-to-r from-transparent via-white to-transparent"
            style={{
              animation: 'ticker-slide 4s ease-in-out infinite',
            }}
          />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-[52px] relative overflow-hidden">
        <div className="absolute inset-0 dot-grid" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border-default)] text-[10px] uppercase tracking-wider font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
            <span>live · AI-powered chatbots</span>
          </motion.div>

          {/* Headline */}
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '56px', letterSpacing: '-1.5px', lineHeight: 1.2 }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Your docs, turned into
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.5 }}
              style={{ fontStyle: 'italic', fontSize: '60px' }}
            >
              a chatbot
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36, duration: 0.5 }}
            >
              for any website.
            </motion.div>
          </div>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto' }}
          >
            Upload a PDF or paste a URL. We train a chatbot and give you a script tag. Done in 60 seconds.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.4 }}
            className="flex items-center justify-center gap-3"
          >
            <Link
              to="/register"
              style={{
                fontSize: '14px',
                padding: '12px 24px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--text-primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Start for free →
            </Link>
            <button
              style={{
                fontSize: '14px',
                padding: '12px 24px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-default)',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Play size={14} />
              See how it works
            </button>
          </motion.div>

          {/* Social Proof */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.4 }}
            style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}
          >
            No credit card required · Free forever plan
          </motion.p>
        </div>

        {/* Hero Visual */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="mt-16 relative"
          style={{
            transform: `translateY(${scrollY * -0.4}px)`,
          }}
        >
          <div
            className="relative border rounded-2xl overflow-hidden shadow-2xl"
            style={{
              width: '800px',
              maxWidth: '90vw',
              border: '1px solid var(--border-default)',
            }}
          >
            <div className="bg-[var(--bg-secondary)] p-3 border-b border-[var(--border-default)] flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Live Demo - Try It!</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-[var(--bg-secondary)] p-8 h-[450px] flex items-center justify-center relative overflow-hidden">
              {/* Animated background grid */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'linear-gradient(var(--border-default) 1px, transparent 1px), linear-gradient(90deg, var(--border-default) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                  animation: 'grid-flow 20s linear infinite'
                }} />
              </div>

              {/* Feature Cards Carousel */}
              <div className="relative z-10 w-full max-w-2xl">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.6, duration: 0.6 }}
                  className="space-y-6"
                >
                  {/* Main Feature Card */}
                  <div className="bg-white rounded-xl border-2 border-[var(--text-primary)] p-6 shadow-xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0A0A0A] to-[#2A2A2A] flex items-center justify-center text-2xl">
                        ⚡
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">Deploy in 60 Seconds</h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          From upload to live chat widget
                        </p>
                      </div>
                    </div>

                    {/* Progress Animation */}
                    <div className="space-y-3">
                      {[
                        { step: 'Upload document', delay: 1.8, duration: 0.8 },
                        { step: 'AI training & embedding', delay: 2.6, duration: 1.2 },
                        { step: 'Widget deployed', delay: 3.8, duration: 0.6 },
                      ].map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: item.delay, duration: 0.4 }}
                          className="flex items-center gap-3"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: item.delay + 0.2, duration: 0.3 }}
                            className="w-5 h-5 rounded-full bg-[var(--success)] flex items-center justify-center text-white text-xs"
                          >
                            ✓
                          </motion.div>
                          <div className="flex-1">
                            <p className="text-sm">{item.step}</p>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ delay: item.delay + 0.3, duration: item.duration }}
                              className="h-1 bg-[var(--text-primary)] rounded-full mt-1"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Stats Row */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 4.6, duration: 0.5 }}
                    className="grid grid-cols-3 gap-4"
                  >
                    {[
                      { icon: '🤖', label: 'Smart AI', value: 'GPT-4' },
                      { icon: '⚡', label: 'Response', value: '<100ms' },
                      { icon: '🎯', label: 'Accuracy', value: '94%' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white rounded-lg border p-4 text-center hover:scale-105 transition-transform">
                        <div className="text-2xl mb-2">{stat.icon}</div>
                        <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</div>
                        <div className="text-sm font-medium mt-1">{stat.value}</div>
                      </div>
                    ))}
                  </motion.div>

                  {/* Floating Code Snippet */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 5.2, duration: 0.5 }}
                    className="bg-[#0A0A0A] rounded-lg p-4 font-mono text-xs text-white"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-[#FF5F56]" />
                      <div className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
                      <div className="w-2 h-2 rounded-full bg-[#27C93F]" />
                      <span className="ml-2 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>embed.html</span>
                    </div>
                    <code className="text-[#4EC9B0]">
                      &lt;<span className="text-[#569CD6]">script</span> <span className="text-[#9CDCFE]">src</span>=<span className="text-[#CE9178]">"botbase.ai/widget.js"</span>&gt;&lt;/<span className="text-[#569CD6]">script</span>&gt;
                    </code>
                  </motion.div>
                </motion.div>
              </div>

              {/* Floating particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-[var(--text-primary)]"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + (i % 3) * 20}%`,
                    opacity: 0.1,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.1, 0.3, 0.1],
                  }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bottom Divider with Marquee */}
        <div className="absolute bottom-0 left-0 right-0 h-[40px] border-t border-[var(--border-default)] overflow-hidden">
          <div className="marquee flex items-center h-full gap-4 text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
            {Array(20).fill(['PDF', 'DOCX', 'TXT', 'URL', 'ANY WEBSITE']).flat().map((item, i) => (
              <span key={i} className="whitespace-nowrap">
                {item} ·
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="features" className="py-20 px-6" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, color: 'var(--text-tertiary)' }}>
              HOW IT WORKS
            </p>
            <h2 style={{ fontSize: '32px', fontWeight: 500, letterSpacing: '-0.8px', marginTop: '8px' }}>
              Three steps. Then done.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Upload', desc: 'Drop your PDF, paste a URL, or write text', icon: '📄' },
              { num: '02', title: 'Train', desc: 'We chunk, embed, and deploy your bot', icon: '⚡' },
              { num: '03', title: 'Embed', desc: 'Copy one script tag. Paste. You\'re live.', icon: '🚀' },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="relative bg-white p-8 rounded-xl border border-[var(--border-default)]"
              >
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '64px', fontStyle: 'italic', color: 'var(--text-tertiary)', position: 'absolute', top: '16px', left: '16px' }}>
                  {step.num}
                </div>
                <div className="relative z-10 mt-12 space-y-3">
                  <div style={{ fontSize: '32px' }}>{step.icon}</div>
                  <h3 style={{ fontSize: '15px', fontWeight: 500, letterSpacing: '-0.2px' }}>{step.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <div className="h-[56px] bg-[var(--text-primary)] flex items-center overflow-hidden">
        <div className="marquee-fast flex items-center gap-6 text-white uppercase text-[13px]">
          {Array(20).fill(['Embeddable', 'RAG-powered', 'Real-time sync', 'Multi-source', 'Analytics', 'Q&A pairs', 'Auto-trained', 'Instant deploy']).flat().map((item, i) => (
            <span key={i} className="whitespace-nowrap flex items-center gap-6">
              {item} <span className="text-[#555]">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 style={{ fontSize: '32px', fontWeight: 500, letterSpacing: '-0.8px' }}>Simple, transparent pricing</h2>
          </div>

          {/* Toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-2 p-1 rounded-full bg-white border border-[var(--border-default)]">
              <button
                onClick={() => setSelectedPlan('monthly')}
                className="px-4 py-2 rounded-full text-sm transition-all"
                style={{
                  background: selectedPlan === 'monthly' ? 'var(--text-primary)' : 'transparent',
                  color: selectedPlan === 'monthly' ? 'white' : 'var(--text-secondary)',
                }}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan('annually')}
                className="px-4 py-2 rounded-full text-sm transition-all flex items-center gap-2"
                style={{
                  background: selectedPlan === 'annually' ? 'var(--text-primary)' : 'transparent',
                  color: selectedPlan === 'annually' ? 'white' : 'var(--text-secondary)',
                }}
              >
                Annually
                {selectedPlan === 'annually' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--success)] text-white">Save 20%</span>
                )}
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Free', price: '$0', features: ['1 bot', '500 messages/mo', 'Basic analytics', 'Community support'], popular: false },
              { name: 'Pro', price: selectedPlan === 'monthly' ? '$19' : '$15', features: ['10 bots', '10k messages/mo', 'Advanced analytics', 'Priority support', 'Custom branding'], popular: true },
              { name: 'Team', price: selectedPlan === 'monthly' ? '$49' : '$39', features: ['Unlimited bots', '50k messages/mo', 'Team collaboration', 'API access', 'White-label'], popular: false },
            ].map((plan) => (
              <div
                key={plan.name}
                className="bg-white rounded-xl p-6 relative transition-all hover:scale-[1.02]"
                style={{
                  border: plan.popular ? '1.5px solid var(--text-primary)' : '1px solid var(--border-default)',
                  transform: plan.popular ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[var(--text-primary)] text-white text-[10px] uppercase tracking-wider font-medium">
                    Most popular
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 500 }}>{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span style={{ fontSize: '32px', fontWeight: 500 }}>{plan.price}</span>
                      {plan.price !== '$0' && <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>/mo</span>}
                    </div>
                  </div>
                  <div className="border-t border-[var(--border-default)] pt-4 space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <Check size={16} className="text-[var(--success)]" />
                        <span style={{ fontSize: '14px' }}>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    to="/register"
                    className="block w-full text-center py-2 rounded-lg transition-all"
                    style={{
                      background: plan.popular ? 'var(--text-primary)' : 'transparent',
                      color: plan.popular ? 'white' : 'var(--text-primary)',
                      border: '1px solid var(--border-default)',
                      fontSize: '14px',
                      marginTop: '16px',
                    }}
                  >
                    Get started
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--text-primary)] text-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="font-medium mb-2">Product</div>
              <div className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <div>Features</div>
                <div>Pricing</div>
                <div>Changelog</div>
              </div>
            </div>
            <div>
              <div className="font-medium mb-2">Developers</div>
              <div className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <div>Documentation</div>
                <div>API</div>
                <div>Status</div>
              </div>
            </div>
            <div>
              <div className="font-medium mb-2">Company</div>
              <div className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <div>About</div>
                <div>Blog</div>
                <div>Careers</div>
              </div>
            </div>
            <div>
              <div className="font-medium mb-2">Legal</div>
              <div className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <div>Privacy</div>
                <div>Terms</div>
                <div>Security</div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <div>© 2026 botbase.ai</div>
            <div className="flex gap-6">
              <span>Status</span>
              <span>Twitter</span>
              <span>GitHub</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Chatbot Widget */}
      <ChatbotWidget botName="Demo Bot" emoji="🤖" themeColor="#0A0A0A" />

      {/* Global CSS */}
      <style>{`
        @keyframes ticker-slide {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }

        .marquee {
          animation: marquee 30s linear infinite;
          width: max-content;
        }

        .marquee-fast {
          animation: marquee 30s linear infinite;
          width: max-content;
        }

        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @keyframes grid-flow {
          from { transform: translateY(0); }
          to { transform: translateY(40px); }
        }
      `}</style>
    </div>
  );
}
