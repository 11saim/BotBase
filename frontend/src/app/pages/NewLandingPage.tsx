import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "motion/react";
import {
  Sparkles,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  MessageSquare,
  BarChart,
  Check,
  Menu,
  X,
} from "lucide-react";
import { ChatbotWidget } from "../components/ChatbotWidget";

export function NewLandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const NAV_OFFSET = 88;
      const sectionTop =
        section.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
      window.scrollTo({ top: Math.max(0, sectionTop), behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Enhanced Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div
            className="rounded-2xl px-6 py-3 flex items-center justify-between transition-all duration-300"
            style={{
              background:
                scrollY > 20
                  ? "rgba(255, 255, 255, 0.95)"
                  : "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(0, 0, 0, 0.06)",
              boxShadow:
                scrollY > 20 ? "0 8px 32px rgba(0, 0, 0, 0.08)" : "none",
            }}
          >
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0A0A0A] to-[#2A2A2A] flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="font-semibold text-lg">
                botbase<span className="text-gray-500">.ai</span>
              </span>
            </Link>

            {/* Nav Items */}
            <div className="max-[840.98px]:hidden min-[841px]:flex items-center gap-1 bg-gray-50 rounded-xl p-1">
              {[
                { label: "Features", icon: Zap, id: "features" },
                {
                  label: "How It Works",
                  icon: MessageSquare,
                  id: "how-it-works",
                },
                { label: "Pricing", icon: BarChart, id: "pricing" },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-black hover:bg-white transition-all"
                >
                  <item.icon size={14} />
                  {item.label}
                </button>
              ))}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="max-[840.98px]:hidden text-sm font-medium px-4 py-2 text-gray-600 hover:text-black transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="max-[840.98px]:hidden items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-900 transition-all hover:gap-3 group min-[841px]:flex"
              >
                Start Free
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </Link>
              <button
                type="button"
                className="min-[841px]:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="min-[841px]:hidden mt-3 rounded-2xl border border-black/10 bg-white/95 backdrop-blur-xl p-3 shadow-xl">
              <div className="grid gap-1">
                {[
                  { label: "Features", icon: Zap, id: "features" },
                  {
                    label: "How It Works",
                    icon: MessageSquare,
                    id: "how-it-works",
                  },
                  { label: "Pricing", icon: BarChart, id: "pricing" },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      scrollToSection(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-100 transition-all"
                  >
                    <item.icon size={14} />
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  className="text-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="text-center px-3 py-2 rounded-lg text-sm font-medium bg-black text-white hover:bg-gray-900 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start Free
                </Link>
              </div>
            </div>
          )}
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
            <span className="text-sm font-medium">
              Trusted by 10,000+ teams worldwide
            </span>
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
            Upload a PDF, paste a URL, or write text. Get a fully-trained
            chatbot widget in 60 seconds. No coding required.
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
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </motion.div>

          {/* Feature Highlights */}
          <div
            id="features"
            className="max-w-5xl mx-auto pt-2 pb-5 mt-20 scroll-mt-28"
          >
            <div className="text-center mb-8">
              <p className="text-xs font-semibold tracking-[0.18em] text-gray-500">
                WHY BOTBASE
              </p>
              <h3 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">
                Built for speed, trust, and global reach
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  icon: Zap,
                  title: "Deploy in 60s",
                  desc: "From upload to live chatbot in one minute.",
                  badge: "Fast",
                },
                {
                  icon: Shield,
                  title: "Enterprise Ready",
                  desc: "Security-first architecture with compliance support.",
                  badge: "Secure",
                },
                {
                  icon: Globe,
                  title: "Multi-language",
                  desc: "Serve customers naturally in 95+ languages.",
                  badge: "Global",
                },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="relative rounded-3xl p-6 border border-gray-200/80 bg-white shadow-lg"
                >
                  <div className="absolute right-4 top-4 text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-semibold uppercase tracking-wider">
                    {feature.badge}
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-black to-gray-700 flex items-center justify-center mb-5 shadow-md">
                    <feature.icon size={22} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section
        id="how-it-works"
        className="pt-2 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-4">
              SEE IT IN ACTION
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Watch the Magic Happen
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From document to deployed chatbot in three simple steps
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: "01",
                title: "Upload Content",
                desc: "Drop your PDF, paste a URL, or write text directly",
              },
              {
                num: "02",
                title: "AI Training",
                desc: "Our AI chunks, embeds, and trains on your content",
              },
              {
                num: "03",
                title: "Deploy Widget",
                desc: "Copy one line of code and paste anywhere",
              },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative group"
              >
                <div className="bg-white rounded-3xl p-8 pb-10 border-2 border-gray-100 hover:transition-all h-full">
                  <div className="text-6xl font-bold text-gray-100 mb-4 group-hover:text-gray-200 transition-colors">
                    {step.num}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                  <div className="w-[80%] absolute left-1/2 -translate-x-1/2 bottom-4 h-2 bg-gray-100 rounded-full overflow-hidden flex items-center justify-start">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15 + 0.3, duration: 1 }}
                    />
                  </div>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-8 w-10 h-0.5 bg-gradient-to-r from-gray-300 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="pt-2 pb-20 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold mb-4">
              SIMPLE PRICING
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Choose a plan that scales with you
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Start free and upgrade when your chatbot traffic grows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Starter",
                price: "$0",
                period: "/mo",
                description: "Perfect for trying botbase.ai",
                cta: "Start Free",
                popular: false,
                features: [
                  "1 bot",
                  "500 messages/month",
                  "Basic analytics",
                  "Community support",
                ],
              },
              {
                name: "Pro",
                price: "$19",
                period: "/mo",
                description: "For growing products and teams",
                cta: "Choose Pro",
                popular: true,
                features: [
                  "10 bots",
                  "10,000 messages/month",
                  "Advanced analytics",
                  "Priority support",
                  "Custom branding",
                ],
              },
              {
                name: "Business",
                price: "$49",
                period: "/mo",
                description: "For high-volume and complex use cases",
                cta: "Choose Business",
                popular: false,
                features: [
                  "Unlimited bots",
                  "50,000 messages/month",
                  "API access",
                  "Team collaboration",
                  "White-label widget",
                ],
              },
            ].map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-3xl p-8 transition-all ${plan.popular ? "border-2 border-black shadow-2xl bg-white" : "border border-gray-200 shadow-lg bg-gray-50/40"}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black text-white text-xs font-semibold tracking-wide">
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-end gap-1 mb-6">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-gray-500 mb-1">{plan.period}</span>
                </div>

                <Link
                  to="/register"
                  className={`w-full inline-flex items-center justify-center rounded-xl px-4 py-3 font-semibold transition-colors ${plan.popular ? "bg-black text-white hover:bg-gray-900" : "bg-white text-black border border-gray-300 hover:border-black"}`}
                >
                  {plan.cta}
                </Link>

                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 text-sm text-gray-700"
                    >
                      <Check size={16} className="text-green-600 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
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
          <p className="text-sm text-gray-500 mt-6">
            No credit card required • Free forever plan
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#050505] text-white px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
            <div className="lg:col-span-5">
              <Link to="/" className="inline-flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white to-gray-300 text-black flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <span className="font-semibold text-lg">botbase.ai</span>
              </Link>
              <p className="text-gray-400 max-w-md">
                Build and ship AI chatbots from your docs in minutes. Fast
                setup, rich analytics, and production-ready embeds.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold hover:bg-gray-200 transition-colors"
                >
                  Start Free
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl border border-white/20 text-sm font-semibold hover:border-white/40 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-white">
                    Product
                  </h4>
                  <div className="space-y-2 text-sm text-gray-400">
                    <button
                      type="button"
                      onClick={() => scrollToSection("features")}
                      className="block hover:text-white transition-colors"
                    >
                      Features
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollToSection("how-it-works")}
                      className="block hover:text-white transition-colors"
                    >
                      How It Works
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollToSection("pricing")}
                      className="block hover:text-white transition-colors"
                    >
                      Pricing
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-3 text-white">
                    Company
                  </h4>
                  <div className="space-y-2 text-sm text-gray-400">
                    <a
                      href="#"
                      className="block hover:text-white transition-colors"
                    >
                      About
                    </a>
                    <a
                      href="#"
                      className="block hover:text-white transition-colors"
                    >
                      Contact
                    </a>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-3 text-white">
                    Why Teams Pick Us
                  </h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-300 mt-0.5">✓</span>
                      <span>Launch in 60s</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-300 mt-0.5">✓</span>
                      <span>No-code embed</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-300 mt-0.5">✓</span>
                      <span>Built-in analytics</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-gray-500">
            <p>© 2026 botbase.ai. All rights reserved.</p>
            <p>Built for speed, clarity, and conversion.</p>
          </div>
        </div>
      </footer>

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
