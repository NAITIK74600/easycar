import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Gauge,
  Compass,
  ArrowRight,
  ShieldCheck,
  Maximize2,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AUDI_A5_HERO_SEQUENCE } from '../../config/vehicleSequences';

interface ScrollCinematicShowroomProps {
  className?: string;
  onBookClick?: () => void;
}

export const ScrollCinematicShowroom: React.FC<ScrollCinematicShowroomProps> = ({
  className = '',
  onBookClick,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const totalFrames = AUDI_A5_HERO_SEQUENCE.totalFrames;
  const imageCacheRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const pendingRequestsRef = useRef<Set<number>>(new Set());

  // Load a single frame
  const loadFrame = useCallback((index: number): Promise<HTMLImageElement> => {
    const clamped = Math.max(0, Math.min(totalFrames - 1, index));
    if (imageCacheRef.current.has(clamped)) {
      return Promise.resolve(imageCacheRef.current.get(clamped)!);
    }

    if (pendingRequestsRef.current.has(clamped)) {
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          if (imageCacheRef.current.has(clamped)) {
            clearInterval(interval);
            resolve(imageCacheRef.current.get(clamped)!);
          }
        }, 30);
      });
    }

    pendingRequestsRef.current.add(clamped);

    return new Promise((resolve) => {
      const img = new Image();
      img.src = AUDI_A5_HERO_SEQUENCE.getFrameUrl(clamped);
      img.onload = () => {
        imageCacheRef.current.set(clamped, img);
        pendingRequestsRef.current.delete(clamped);
        resolve(img);
      };
      img.onerror = () => {
        pendingRequestsRef.current.delete(clamped);
        const fallback = new Image();
        fallback.src = AUDI_A5_HERO_SEQUENCE.posterUrl;
        fallback.onload = () => resolve(fallback);
      };
    });
  }, [totalFrames]);

  // Preload initial frames and keyframes for responsive scrubbing
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      // Load initial batch
      const promises = [];
      for (let i = 0; i < 15; i++) {
        promises.push(loadFrame(i));
      }
      // Load keyframes every 15 frames for instant preview across the sequence
      for (let i = 15; i < totalFrames; i += 15) {
        promises.push(loadFrame(i));
      }

      await Promise.all(promises);
      if (!cancelled) {
        setIsLoaded(true);
        drawFrame(0);
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
      imageCacheRef.current.clear();
      pendingRequestsRef.current.clear();
    };
  }, [loadFrame, totalFrames]);

  // Draw frame to canvas
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let img = imageCacheRef.current.get(index);
    if (!img || !img.complete) {
      // Find closest loaded frame
      for (let d = 1; d <= 20; d++) {
        if (imageCacheRef.current.has(index - d)) {
          img = imageCacheRef.current.get(index - d);
          break;
        }
        if (imageCacheRef.current.has(index + d)) {
          img = imageCacheRef.current.get(index + d);
          break;
        }
      }
    }

    if (img && img.complete) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }, []);

  // Scroll listener tracking scroll position through the 250vh track
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Section total scrollable distance is container height - viewport height
      const totalScrollable = rect.height - windowHeight;
      if (totalScrollable <= 0) return;

      // Distance scrolled past top of section
      const scrolled = -rect.top;
      const rawProgress = scrolled / totalScrollable;
      const clamped = Math.max(0, Math.min(1, rawProgress));

      setScrollProgress(clamped);
      setIsPinned(rect.top <= 0 && rect.bottom >= windowHeight);

      // Map progress to frame
      const targetFrame = Math.min(totalFrames - 1, Math.floor(clamped * (totalFrames - 1)));
      setCurrentFrame(targetFrame);
      drawFrame(targetFrame);

      // Preload nearby frames
      for (let i = targetFrame - 5; i <= targetFrame + 10; i++) {
        if (i >= 0 && i < totalFrames) loadFrame(i);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [drawFrame, loadFrame, totalFrames]);

  // Dynamic narrative annotations based on frame progression
  const currentChapter =
    scrollProgress < 0.35
      ? {
          title: 'THE DYNAMIC APPROACH',
          subtitle: 'Daytona Grey Metallic • S-Line Aerodynamic Bodywork',
          description:
            'Continuous tracking approach revealing the 2018 Audi A5 Sportback with progressive low-stance silhouette.',
        }
      : scrollProgress < 0.70
      ? {
          title: 'SINGLEFRAME MATRIX ARCHITECTURE',
          subtitle: 'Titanium Honeycomb • Adaptive LED Lighting',
          description:
            'High-beam segmented Matrix LEDs with active directional beams designed for Swiss alpine switchbacks.',
        }
      : {
          title: 'PERMANENT QUATTRO POISE',
          subtitle: '3.0 TDI V6 (286 PS / 620 Nm) • 19" Rotor Alloys',
          description:
            'Unrivalled all-weather capability across rain, snow, and mountain passes with 40:60 self-locking differential.',
        };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[240vh] bg-black text-pearl select-none ${className}`}
    >
      {/* Sticky 100vh Viewport */}
      <div className="sticky top-0 w-full h-screen flex flex-col justify-between overflow-hidden bg-radial from-neutral-900 to-black">
        {/* Top Header Overlay */}
        <div className="relative z-20 flex items-center justify-between px-6 py-5 bg-gradient-to-b from-black/90 via-black/40 to-transparent">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600/20 text-red-400 font-mono text-[10px] uppercase font-bold tracking-widest border border-red-500/30">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              CINEMATIC SHOWROOM
            </span>
            <span className="font-mono text-xs text-white uppercase tracking-wider font-bold">
              AUDI A5 SPORTBACK S-LINE
            </span>
          </div>
        </div>

        {/* Main Canvas Presentation */}
        <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            width={AUDI_A5_HERO_SEQUENCE.width}
            height={AUDI_A5_HERO_SEQUENCE.height}
            className="w-full h-full object-contain"
          />

          {!isLoaded && (
            <img
              src={AUDI_A5_HERO_SEQUENCE.posterUrl}
              alt="Audi A5 Sequence Poster"
              className="absolute inset-0 w-full h-full object-contain"
            />
          )}

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/70 pointer-events-none" />

          {/* Floating Narrative Annotation Card */}
          <div className="absolute bottom-8 left-6 md:left-12 max-w-md z-20 pointer-events-none">
            <div className="p-5 bg-black/80 backdrop-blur-md border-l-2 border-l-red-600 border-y border-r border-white/10 shadow-2xl transition-all duration-300">
              <span className="text-red-400 font-mono text-[10px] font-bold tracking-widest uppercase block mb-1">
                {currentChapter.title}
              </span>
              <h3 className="text-lg md:text-xl font-bold font-display text-white mb-1.5">
                {currentChapter.subtitle}
              </h3>
              <p className="text-xs text-silver leading-relaxed">
                {currentChapter.description}
              </p>
            </div>
          </div>

          {/* Quick Booking CTA Card on Right */}
          <div className="absolute bottom-8 right-6 md:right-12 z-20 pointer-events-auto hidden sm:block">
            <div className="p-4 bg-black/85 backdrop-blur-md border border-white/15 shadow-2xl flex flex-col gap-2">
              <span className="text-[10px] font-mono text-silver uppercase">AUDI A5 SPORTBACK 3.0 TDI</span>
              <div className="text-xl font-bold font-display text-white">CHF 100 <span className="text-xs font-mono text-silver font-normal">/ DAY</span></div>
              <Link
                to="/booking?vehicle=audi-a5-sportback"
                className="mt-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <span>BOOK THIS VEHICLE</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Timeline Bar */}
        <div className="relative z-20 px-6 py-4 bg-gradient-to-t from-black/95 to-transparent flex items-center justify-between">
          <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-600 transition-all duration-75"
              style={{ width: `${scrollProgress * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
