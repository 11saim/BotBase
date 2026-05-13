import { useEffect } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={16} className="text-[var(--success)]" />,
    error: <XCircle size={16} className="text-[var(--destructive)]" />,
    info: <Info size={16} className="text-[var(--text-primary)]" />,
  };

  const borderColors = {
    success: 'var(--success)',
    error: 'var(--destructive)',
    info: 'var(--text-primary)',
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-[300px] bg-white rounded-lg border shadow-lg p-4 animate-slide-in"
      style={{
        borderLeft: `3px solid ${borderColors[type]}`,
        animation: 'toast-slide-in 200ms ease-out',
      }}
    >
      <div className="flex items-start gap-3">
        {icons[type]}
        <div className="flex-1">
          <p className="text-sm">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--bg-secondary)] overflow-hidden rounded-b-lg">
        <div
          className="h-full"
          style={{
            background: borderColors[type],
            animation: `toast-progress ${duration}ms linear`,
          }}
        />
      </div>

      <style>{`
        @keyframes toast-slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes toast-progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
