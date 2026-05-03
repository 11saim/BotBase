import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { Sparkles, Zap, Shield, Globe, ArrowRight, MessageSquare, BarChart, Lock } from 'lucide-react';
import { ChatbotWidget } from '../components/ChatbotWidget';

export function NewLandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Enhanced Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div
            className="rounded-2xl px-6 py-3 flex items-center justify-between transition-all duration-300"
            style={{
              background: scrollY > 20 ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: scrollY > 20 ? '0 8px 32px rgba(0, 0, 0, 0.08)' : 'none',
            }}
          >
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0A0A0A] to-[#2A2A2A] flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="font-semibold text-lg">botbase<span className="text-gray-500">.ai</span></span>
            </Link>

            {/* Nav Items */}
            <div className="hidden md:flex items-center gap-1 bg-gray-50 rounded-xl p-1">
              {[
                { label: 'Features', icon: Zap },
                { label: 'Pricing', icon: BarChart },
                { label: 'Security', icon: Lock },
                { label: 'Customers', icon: Globe },
              ].map((item) => (
                <a
                  key={item.label}
                  href={`#${item.label.toLowerCase()}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-black hover:bg-white transition-all"
                >
                  <item.icon size={14} />
                  {item.label}
                </a>
              ))}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-3">
              <Link to="/login" className="hidden sm:block text-sm font-medium px-4 py-2 text-gray-600 hover:text-black transition-colors">
                Sign in
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-900 transition-all hover:gap-3 group"
              >
                Start Free
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-60" />
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-black/5"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.1, 0.4, 0.1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/10 shadow-lg mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium">Trusted by 10,000+ teams worldwide</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 px-4"
          >
            Turn Your Docs Into
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI-Powered Chatbots
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto px-4"
          >
            Upload a PDF, paste a URL, or write text. Get a fully-trained chatbot widget in 60 seconds. No coding required.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link
              to="/register"
              className="group flex items-center gap-2 px-8 py-4 bg-black text-white rounded-2xl text-base font-semibold hover:bg-gray-900 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Start Building Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="flex items-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 rounded-2xl text-base font-semibold hover:border-black transition-all">
              <MessageSquare size={18} />
              See Demo
            </button>
          </motion.div>

          {/* Floating Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mt-20">
            {[
              { icon: Zap, title: 'Deploy in 60s', desc: 'From upload to live' },
              { icon: Shield, title: 'Enterprise Ready', desc: 'SOC 2 compliant' },
              { icon: Globe, title: 'Multi-language', desc: '95+ languages' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center mb-4">
                  <feature.icon size={24} className="text-white" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-4">
              SEE IT IN ACTION
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Watch the Magic Happen</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From document to deployed chatbot in three simple steps
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Upload Content', desc: 'Drop your PDF, paste a URL, or write text directly' },
              { num: '02', title: 'AI Training', desc: 'Our AI chunks, embeds, and trains on your content' },
              { num: '03', title: 'Deploy Widget', desc: 'Copy one line of code and paste anywhere' },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative group"
              >
                <div className="bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-black transition-all h-full">
                  <div className="text-6xl font-bold text-gray-100 mb-4 group-hover:text-gray-200 transition-colors">
                    {step.num}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                  <div className="mt-6 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15 + 0.3, duration: 1 }}
                    />
                  </div>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-gray-300 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10K+', label: 'Active Users' },
              { value: '1M+', label: 'Messages/Day' },
              { value: '99.9%', label: 'Uptime' },
              { value: '<100ms', label: 'Response Time' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl sm:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-px h-px bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5,
                animation: `twinkle ${2 + Math.random() * 3}s infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-6xl font-bold mb-6">
            Ready to Build Your
            <br />
            AI Chatbot?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Join 10,000+ teams using botbase.ai
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black rounded-2xl text-lg font-semibold hover:scale-105 transition-transform shadow-2xl"
          >
            Get Started Free
            <ArrowRight size={20} />
          </Link>
          <p className="text-sm text-gray-500 mt-6">No credit card required • Free forever plan</p>
        </div>
      </section>

      {/* Chatbot Widget */}
      <ChatbotWidget botName="Demo Bot" emoji="🤖" themeColor="#0A0A0A" />

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
