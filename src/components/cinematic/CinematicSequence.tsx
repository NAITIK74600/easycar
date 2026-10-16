import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FrameSequenceCanvas } from './FrameSequenceCanvas';
import { Play, Pause, AlertCircle, Eye } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface CinematicSequenceProps {
  sequenceId: string;
  directory: string;
  totalFrames: number;
  namingConvention?: string;
  poster: string;
  videoUrl?: string;
  className?: string;
  scrollTriggered?: boolean;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  autoplay?: boolean;
  fps?: number;
  altText?: string;
}

export const CinematicSequence: React.FC<CinematicSequenceProps> = ({
  sequenceId,
  directory,
  totalFrames,
  namingConvention = 'frame_{0000}.webp',
  poster,
  videoUrl,
  className = '',
  scrollTriggered = false,
  scrollContainerRef,
  autoplay = false,
  fps = 30,
  altText = 'Automotive Cinematic Experience',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentFrame, setCurrentFrame] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(autoplay);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [hasReducedMotion, setHasReducedMotion] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);
  const animIntervalRef = useRef<number | null>(null);

  // Check user preference for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setHasReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setHasReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // GSAP ScrollTrigger mapping scroll progress directly to frame index
  useEffect(() => {
    if (!scrollTriggered || totalFrames <= 0 || hasReducedMotion) return;

    const target = scrollContainerRef?.current || containerRef.current;
    if (!target) return;

    const trigger = ScrollTrigger.create({
      trigger: target,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: (self) => {
        const frame = Math.max(1, Math.min(totalFrames, Math.round(self.progress * (totalFrames - 1)) + 1));
        setCurrentFrame(frame);
      },
    });

    return () => {
      trigger.kill();
    };
  }, [scrollTriggered, totalFrames, hasReducedMotion, scrollContainerRef]);

  // Autoplay loop when not scroll triggered
  useEffect(() => {
    if (scrollTriggered || !isPlaying || totalFrames <= 0 || hasReducedMotion) {
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
      return;
    }

    const intervalMs = 1000 / fps;
    animIntervalRef.current = window.setInterval(() => {
      setCurrentFrame((prev) => (prev >= totalFrames ? 1 : prev + 1));
    }, intervalMs);

    return () => {
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
    };
  }, [scrollTriggered, isPlaying, totalFrames, fps, hasReducedMotion]);

  // If prefers-reduced-motion, render static poster with cinematic styling
  if (hasReducedMotion) {
    return (
      <div className={`relative w-full h-full overflow-hidden ${className}`}>
        <img
          src={poster}
          alt={altText}
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute top-4 left-4 px-3 py-1 bg-black/70 backdrop-blur-sm rounded text-[11px] font-mono text-silver tracking-wider border border-white/10 flex items-center gap-1.5">
          <Eye size={12} className="text-accent" />
          <span>REDUCED MOTION ACTIVE</span>
        </div>
      </div>
    );
  }

  // If videoUrl is provided and functional, allow video playback mode
  if (videoUrl && !videoError) {
    return (
      <div ref={containerRef} className={`relative w-full h-full overflow-hidden ${className}`}>
        <video
          src={videoUrl}
          poster={poster}
          autoPlay={autoplay}
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          onError={() => setVideoError(true)}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative w-full h-full overflow-hidden group ${className}`}>
      <FrameSequenceCanvas
        directory={directory}
        totalFrames={totalFrames}
        namingConvention={namingConvention}
        poster={poster}
        currentFrame={currentFrame}
        onLoadingProgress={setLoadingProgress}
      />

      {/* Manual play/pause control when not scroll-bound and frames exist */}
      {!scrollTriggered && totalFrames > 0 && (
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? 'Pause sequence' : 'Play sequence'}
          className="absolute bottom-6 left-6 z-20 flex items-center gap-2 px-3.5 py-2 bg-charcoal/80 hover:bg-gunmetal backdrop-blur-md rounded border border-white/10 text-xs font-mono uppercase tracking-wider text-pearl transition-all"
        >
          {isPlaying ? <Pause size={14} className="text-accent" /> : <Play size={14} className="text-accent" />}
          <span>{isPlaying ? 'PAUSE' : 'PLAY SEQUENCE'}</span>
        </button>
      )}

      {/* Frame counter badge when frame sequence active */}
      {totalFrames > 0 && (
        <div className="absolute top-6 right-6 z-20 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded border border-white/10 text-[11px] font-mono text-ash tracking-widest">
          FRAME {String(currentFrame).padStart(4, '0')} / {String(totalFrames).padStart(4, '0')}
        </div>
      )}
    </div>
  );
};
