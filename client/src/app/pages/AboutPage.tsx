import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowLeft } from "lucide-react";

export function AboutPage() {
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

      <div className="relative z-10 max-w-3xl mx-auto text-center mt-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
          About Us
        </h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          We're building the infrastructure for the next generation of AI chatbots. 
          Our mission is to make it incredibly easy for any team to launch 
          fully-trained, intelligent bots from their existing knowledge bases.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed">
          Stay tuned for more updates as we continue to grow and evolve our platform.
        </p>
      </div>
    </div>
  );
}
