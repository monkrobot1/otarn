import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  delayMs?: number;
}

export const Tooltip = ({ content, children, delayMs = 1500 }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const timerRef = useRef<number | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    timerRef.current = window.setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords({
          x: rect.left + rect.width / 2,
          y: rect.top - 8 // Hover 8px above the element
        });
      }
      setIsVisible(true);
    }, delayMs);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsVisible(false);
  };

  // Ensure scroll/resize hides it to prevent floating orphans
  useEffect(() => {
    if (isVisible) {
      const hide = () => setIsVisible(false);
      window.addEventListener('scroll', hide, true);
      window.addEventListener('resize', hide);
      return () => {
        window.removeEventListener('scroll', hide, true);
        window.removeEventListener('resize', hide);
      };
    }
  }, [isVisible]);

  return (
    <>
      <div 
        ref={triggerRef}
        className="inline-flex items-center justify-center cursor-help"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      
      {isVisible && createPortal(
        <div 
          className="fixed z-[100] w-max max-w-xs p-2 text-[10px] font-mono leading-relaxed text-cyan-100 bg-black/95 border border-cyan-500/50 rounded shadow-[0_0_15px_rgba(0,255,255,0.2)] pointer-events-none animate-fade-in text-left transform -translate-x-1/2 -translate-y-full"
          style={{ left: coords.x, top: coords.y }}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
};
