import { useEffect, useState, useRef } from 'react';

export function GlobalEffects() {
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const cursorRef = useRef<{ x: number; y: number }>({ x: -100, y: -100 });
  const requestRef = useRef<number>();

  useEffect(() => {
    let magnetTarget: HTMLElement | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY };

      const target = e.target as HTMLElement;
      const interactive = target.closest('a, button, [role="button"]');

      if (interactive && interactive instanceof HTMLElement) {
        magnetTarget = interactive;
        setIsHovering(true);
      } else {
        magnetTarget = null;
        setIsHovering(false);
      }
    };

    const animate = () => {
      if (magnetTarget) {
        const rect = magnetTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.sqrt(
          Math.pow(cursorRef.current.x - centerX, 2) +
          Math.pow(cursorRef.current.y - centerY, 2)
        );

        if (distance < 100) {
          const pull = Math.min(0.2, 20 / distance);
          setCursorPos({
            x: cursorRef.current.x + (centerX - cursorRef.current.x) * pull,
            y: cursorRef.current.y + (centerY - cursorRef.current.y) * pull,
          });
        } else {
          setCursorPos(cursorRef.current);
        }
      } else {
        setCursorPos(cursorRef.current);
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Magnetic Cursor */}
      <div
        className="fixed pointer-events-none z-[9999] hidden md:block will-change-transform"
        style={{
          left: cursorPos.x,
          top: cursorPos.y,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <svg width={isHovering ? "60" : "40"} height={isHovering ? "60" : "40"} style={{ transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          {/* Outer ring */}
          <circle
            cx={isHovering ? "30" : "20"}
            cy={isHovering ? "30" : "20"}
            r={isHovering ? "25" : "15"}
            fill="none"
            stroke="#0A0A0A"
            strokeWidth="1"
            opacity="0.2"
          />
          {/* Middle ring */}
          <circle
            cx={isHovering ? "30" : "20"}
            cy={isHovering ? "30" : "20"}
            r={isHovering ? "18" : "10"}
            fill="none"
            stroke="#0A0A0A"
            strokeWidth="1"
            opacity="0.4"
          >
            <animate
              attributeName="r"
              values={isHovering ? "18;22;18" : "10;12;10"}
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          {/* Core dot */}
          <circle
            cx={isHovering ? "30" : "20"}
            cy={isHovering ? "30" : "20"}
            r={isHovering ? "3" : "5"}
            fill="#0A0A0A"
          />
          {/* Particle orbits */}
          <circle cx={isHovering ? "30" : "20"} cy={isHovering ? "30" : "20"} r="2" fill="#0A0A0A" opacity="0.6">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`0 ${isHovering ? "30 30" : "20 20"}`}
              to={`360 ${isHovering ? "30 30" : "20 20"}`}
              dur="3s"
              repeatCount="indefinite"
            />
            <animate attributeName="cx" values={isHovering ? "45;30;15;30;45" : "30;20;10;20;30"} dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx={isHovering ? "30" : "20"} cy={isHovering ? "30" : "20"} r="2" fill="#0A0A0A" opacity="0.4">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`180 ${isHovering ? "30 30" : "20 20"}`}
              to={`540 ${isHovering ? "30 30" : "20 20"}`}
              dur="3s"
              repeatCount="indefinite"
            />
            <animate attributeName="cy" values={isHovering ? "45;30;15;30;45" : "30;20;10;20;30"} dur="3s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      {/* Scroll Progress */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0A0A0A] to-transparent z-50" style={{ clipPath: `inset(0 ${100 - scrollProgress}% 0 0)` }} />

      <style>{`
        * { cursor: none !important; }
        input, textarea { cursor: text !important; }
        @media (max-width: 768px) { * { cursor: auto !important; } }
      `}</style>
    </>
  );
}
