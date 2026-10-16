import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [targetPos, setTargetPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [hoverText, setHoverText] = useState<string | null>(null);
  const [isDown, setIsDown] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only activate on devices that support hover (non-touch)
    if (window.matchMedia('(pointer: coarse)').matches) return;

    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      setTargetPos({ x: e.clientX, y: e.clientY });

      // Check if hovering over interactive elements
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest('a, button, input, [data-cursor]');
      if (interactive) {
        setIsHovered(true);
        const customText = interactive.getAttribute('data-cursor');
        setHoverText(customText || null);
      } else {
        setIsHovered(false);
        setHoverText(null);
      }
    };

    const handleMouseDown = () => setIsDown(true);
    const handleMouseUp = () => setIsDown(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  // Smooth cursor lerp animation frame
  useEffect(() => {
    if (!isVisible) return;

    let animId: number;
    const lerp = () => {
      setPos((prev) => ({
        x: prev.x + (targetPos.x - prev.x) * 0.2,
        y: prev.y + (targetPos.y - prev.y) * 0.2,
      }));
      animId = requestAnimationFrame(lerp);
    };
    animId = requestAnimationFrame(lerp);

    return () => cancelAnimationFrame(animId);
  }, [targetPos, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Outer Glow Ring */}
      <div
        className={`fixed -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-200 ease-out flex items-center justify-center ${
          hoverText
            ? 'w-20 h-20 bg-brand-red/90 border-brand-red text-white backdrop-blur-md shadow-2xl scale-100'
            : isHovered
            ? 'w-12 h-12 bg-white/10 border-brand-red scale-110 shadow-[0_0_20px_rgba(225,29,42,0.5)]'
            : 'w-7 h-7 border-white/40 scale-100'
        } ${isDown ? 'scale-75' : ''}`}
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
        }}
      >
        {hoverText && (
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white">
            {hoverText}
          </span>
        )}
      </div>

      {/* Center Precise Red Core Dot */}
      <div
        className={`fixed -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-red transition-all duration-75 pointer-events-none ${
          hoverText ? 'opacity-0' : isHovered ? 'w-2 h-2 opacity-80' : 'w-1.5 h-1.5'
        }`}
        style={{
          left: `${targetPos.x}px`,
          top: `${targetPos.y}px`,
        }}
      />
    </div>
  );
};
