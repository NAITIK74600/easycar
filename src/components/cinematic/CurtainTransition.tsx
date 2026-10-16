import React, { useEffect, useState } from 'react';

interface CurtainTransitionProps {
  isTransitioning: boolean;
  onMidpoint?: () => void;
  onComplete?: () => void;
  durationMs?: number;
  label?: string;
}

export const CurtainTransition: React.FC<CurtainTransitionProps> = ({
  isTransitioning,
  onMidpoint,
  onComplete,
  durationMs = 900,
  label = 'SWITCHING VEHICLE MATRIX',
}) => {
  const [phase, setPhase] = useState<'idle' | 'closing' | 'closed' | 'opening'>('idle');

  useEffect(() => {
    if (!isTransitioning) {
      setPhase('idle');
      return;
    }

    setPhase('closing');
    const halfDuration = durationMs / 2;

    const midTimer = setTimeout(() => {
      setPhase('closed');
      if (onMidpoint) onMidpoint();

      const openTimer = setTimeout(() => {
        setPhase('opening');
        const doneTimer = setTimeout(() => {
          setPhase('idle');
          if (onComplete) onComplete();
        }, halfDuration);

        return () => clearTimeout(doneTimer);
      }, 100);

      return () => clearTimeout(openTimer);
    }, halfDuration);

    return () => clearTimeout(midTimer);
  }, [isTransitioning, durationMs, onMidpoint, onComplete]);

  if (phase === 'idle') return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-between overflow-hidden">
      {/* Top curtain shutter */}
      <div
        className={`w-full bg-obsidian border-b border-accent/40 shadow-2xl transition-transform ease-out duration-400 ${
          phase === 'closing' || phase === 'closed'
            ? 'h-1/2 translate-y-0'
            : phase === 'opening'
            ? 'h-1/2 -translate-y-full'
            : 'h-1/2 -translate-y-full'
        }`}
      />

      {/* Middle cinema telemetry line */}
      {(phase === 'closing' || phase === 'closed') && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="px-6 py-3 bg-charcoal/90 border border-white/20 backdrop-blur-xl rounded-none text-center animate-pulse">
            <span className="label-technical text-accent text-xs tracking-widest">{label}</span>
            <div className="h-0.5 w-24 bg-accent mx-auto mt-2" />
          </div>
        </div>
      )}

      {/* Bottom curtain shutter */}
      <div
        className={`w-full bg-obsidian border-t border-accent/40 shadow-2xl transition-transform ease-out duration-400 ${
          phase === 'closing' || phase === 'closed'
            ? 'h-1/2 translate-y-0'
            : phase === 'opening'
            ? 'h-1/2 translate-y-full'
            : 'h-1/2 translate-y-full'
        }`}
      />
    </div>
  );
};
