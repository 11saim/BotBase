import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowLeft, Mail, MessageCircle } from "lucide-react";

export function ContactPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden relative flex flex-col items-center pt-24 px-4 sm:px-6 lg:px-8">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-60" />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl px-6 py-3 flex items-center justify-between bg-white/80 backdrop-blur-[20px] border border-black/5 shadow-sm">
            <Link to="/" className="flex items-center gap-2 group">
              <img src="/logo.png" alt="BotBase" className="w-8 h-8 rounded-lg object-contain transform group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-lg">Bot Base</span>
            </Link>

            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto text-center mt-12 w-full">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
          Contact Us
        </h1>
        <p className="text-lg text-gray-600 mb-12">
          Have questions or need help? We're here for you.
        </p>

        <div className="gap-6 max-w-2xl mx-auto">
          <a
            href="mailto:shabbirsaim333@gmail.com"
            className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4 text-blue-600">
              <Mail size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Email Support</h3>
            <p className="text-gray-500 text-sm">shabbirsaim333@gmail.com</p>
          </a>
        </div>
      </div>
    </div>
  );
}
