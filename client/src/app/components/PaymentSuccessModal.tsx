import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface PaymentSuccessModalProps {
  open: boolean;
  onClose: () => void;
}

export function PaymentSuccessModal({ open, onClose }: PaymentSuccessModalProps) {
  const [animateIn, setAnimateIn] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        setAnimateIn(true);
        setShowConfetti(true);
      });
    } else {
      setAnimateIn(false);
      setShowConfetti(false);
    }
  }, [open]);

  const handleClose = () => {
    setAnimateIn(false);
    setTimeout(() => {
      setShowConfetti(false);
      onClose();
    }, 300);
  };

  if (!open) return null;

  return (
    <>
      {/* Inline styles for animations */}
      <style>{`
        @keyframes psmCheckDraw {
          0% { stroke-dashoffset: 48; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes psmCircleDraw {
          0% { stroke-dashoffset: 220; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes psmPulseRing {
          0% { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes psmConfetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(420px) rotate(720deg); opacity: 0; }
        }
        @keyframes psmShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .psm-check-path {
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: psmCheckDraw 0.5s ease-out 0.6s forwards;
        }
        .psm-circle-path {
          stroke-dasharray: 220;
          stroke-dashoffset: 220;
          animation: psmCircleDraw 0.6s ease-out 0.2s forwards;
        }
        .psm-pulse-ring {
          animation: psmPulseRing 1.2s ease-out 0.4s forwards;
        }
        .psm-shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.08) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: psmShimmer 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        onClick={handleClose}
      >
        {/* Dark overlay */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          style={{ opacity: animateIn ? 1 : 0 }}
        />

        {/* Confetti particles */}
        {showConfetti && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => {
              const colors = ["#10b981", "#34d399", "#6ee7b7", "#fbbf24", "#f59e0b", "#a78bfa", "#818cf8", "#f472b6"];
              const color = colors[i % colors.length];
              const left = Math.random() * 100;
              const delay = Math.random() * 1.5;
              const duration = 2 + Math.random() * 2;
              const size = 6 + Math.random() * 8;
              const isCircle = i % 3 === 0;

              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    top: "-20px",
                    left: `${left}%`,
                    width: `${size}px`,
                    height: isCircle ? `${size}px` : `${size * 0.5}px`,
                    backgroundColor: color,
                    borderRadius: isCircle ? "50%" : "2px",
                    animation: `psmConfetti ${duration}s ease-in ${delay}s forwards`,
                    opacity: 0,
                    animationFillMode: "forwards",
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Modal card */}
        <div
          className="relative z-10 w-[380px] max-w-[90vw] rounded-2xl overflow-hidden"
          style={{
            opacity: animateIn ? 1 : 0,
            transform: animateIn ? "scale(1) translateY(0)" : "scale(0.9) translateY(20px)",
            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top gradient band */}
          <div className="relative h-[160px] bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center overflow-hidden">
            {/* Shimmer overlay */}
            <div className="psm-shimmer absolute inset-0" />

            {/* Pulse ring */}
            <div
              className="psm-pulse-ring absolute w-[80px] h-[80px] rounded-full border-2 border-white/30"
              style={{ opacity: 0 }}
            />

            {/* Animated checkmark */}
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className="relative z-10">
              <circle
                className="psm-circle-path"
                cx="36" cy="36" r="34"
                stroke="white"
                strokeWidth="2.5"
                fill="none"
              />
              <path
                className="psm-check-path"
                d="M22 36 L32 46 L50 28"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
            >
              <X size={14} className="text-white" />
            </button>
          </div>

          {/* Body */}
          <div className="bg-white px-8 py-7 text-center">
            <h2 className="text-[20px] font-semibold text-neutral-900 tracking-tight mb-2">
              Payment Successful!
            </h2>
            <p className="text-[13px] text-neutral-500 leading-relaxed mb-4">
              Your subscription is now active. Enjoy your upgraded plan with all the premium features unlocked.
            </p>

            {/* Demo notice */}
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 mb-6 text-left">
              <p className="text-[12px] font-semibold text-amber-700 mb-1">Demo Project Notice</p>
              <p className="text-[11px] text-amber-600 leading-relaxed">
                This is a demo project, not a real service. No actual payment was processed and you are still on the <span className="font-semibold">Free plan</span>. Your plan has not been upgraded.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-2.5 rounded-lg bg-neutral-900 text-white text-[13px] font-medium hover:bg-neutral-800 active:scale-[0.98] transition-all"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
