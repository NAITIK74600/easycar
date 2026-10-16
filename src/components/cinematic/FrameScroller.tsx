import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Compass, Shield, Key, Gauge, Layers, Info } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface ChapterOverlay {
  start: number;
  end: number;
  tag: string;
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
}

const CHAPTERS: ChapterOverlay[] = [
  {
    start: 0,
    end: 0.25,
    tag: 'CHAPTER 01 / V6 PERFORMANCE (2018)',
    title: 'AUDI A5 3.0 TDI QUATTRO S-LINE',
    description: 'Leistungsstarker 3,0-Liter-V6-Turbodiesel mit 286 PS, Automatikgetriebe und permanentem quattro-Allradantrieb in Daytona Grey.',
    metric: '286 PS',
    metricLabel: '3.0L V6 TURBODIESEL',
  },
  {
    start: 0.25,
    end: 0.50,
    tag: 'CHAPTER 02 / KOMFORT & MULTIMEDIA',
    title: 'MASSAGE & PANORAMADACH',
    description: 'Exklusive Massagesitze, Sportsitze mit Sitzheizung, Panorama-Glasdach, Apple CarPlay, Android Auto, MMI Navigation und Rückfahrkamera.',
    metric: 'MASSAGE',
    metricLabel: 'SPORTSITZE & PANORAMADACH',
  },
  {
    start: 0.50,
    end: 0.75,
    tag: 'CHAPTER 03 / STANDORT PIETERLEN & BIEL',
    title: 'GANZJAHRESBEREIFUNG & QUATTRO',
    description: 'Standort Pieterlen (Hauptstrasse 12) & Biel/Bienne (Zentralstrasse 4). Ganzjahresreifen für alle Jahreszeiten und alpine Straßen.',
    metric: 'QUATTRO',
    metricLabel: 'ALLRADANTRIEB & GANZJAHRESREIFEN',
  },
  {
    start: 0.75,
    end: 1.0,
    tag: 'CHAPTER 04 / FAIRE SCHWEIZER PREISE',
    title: 'ALL-INCLUSIVE TAGESMIETE',
    description: 'Inklusive Schweizer Autobahnvignette, Vollkaskoschutz und professioneller Vorbereitung. Keine versteckten Kosten.',
    metric: 'CHF 100',
    metricLabel: 'TRANSPARENTER TAGESPREIS (200 KM INKL.)',
  },
];

interface FrameScrollerProps {
  totalFrames?: number;
  frameDirectory?: string;
  frameNaming?: string; // e.g. 'frame_{0000}.webp' or 'frame_%04d.jpg'
  videoFallback?: string;
}

export const FrameScroller: React.FC<FrameScrollerProps> = ({
  totalFrames = 120,
  frameDirectory = '/sequences/audi-a5/',
  frameNaming = 'frame_{0000}.webp',
  videoFallback = '/videos/easycars-hero.mp4',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(1);
  const [usingImageSequence, setUsingImageSequence] = useState<boolean>(false);
  const [loadedFrameCount, setLoadedFrameCount] = useState<number>(0);
  const [activeChapter, setActiveChapter] = useState<ChapterOverlay>(CHAPTERS[0]);

  const [activePattern, setActivePattern] = useState<{ dir: string; naming: string }>({
    dir: frameDirectory,
    naming: frameNaming,
  });

  const frameCache = useRef<Map<number, HTMLImageElement>>(new Map());
  const rafId = useRef<number | null>(null);

  // Helper to resolve frame URL based on convention
  const getFrameUrlWith = useCallback((dir: string, convention: string, index: number) => {
    const padLength = (convention.match(/0+/)?.[0]?.length) || 4;
    const padded = String(index).padStart(padLength, '0');
    const fileName = convention.replace(/\{0+\}/, padded);
    return `${dir.endsWith('/') ? dir : dir + '/'}${fileName}`;
  }, []);

  const getFrameUrl = useCallback((index: number) => {
    return getFrameUrlWith(activePattern.dir, activePattern.naming, index);
  }, [activePattern, getFrameUrlWith]);

  // Attempt to probe and auto-detect frames across common formats
  useEffect(() => {
    let cancelled = false;

    const candidatePatterns = [
      { dir: '/sequences/audi-a5/', naming: 'frame_{0000}.webp' },
      { dir: '/sequences/audi-a5/', naming: 'frame_{0000}.jpg' },
      { dir: '/sequences/audi-a5/', naming: 'frame_{000}.jpg' },
      { dir: '/sequences/audi-a5/', naming: 'ezgif-frame-{000}.jpg' },
      { dir: '/frames/', naming: 'frame_{0000}.webp' },
      { dir: '/frames/', naming: 'frame_{0000}.jpg' },
      { dir: '/frames/', naming: 'frame_{000}.jpg' },
      { dir: '/frames/', naming: 'ezgif-frame-{000}.jpg' },
      { dir: '/frames/', naming: '{0001}.jpg' },
    ];

    let patternFound = false;

    const tryPattern = (idx: number) => {
      if (idx >= candidatePatterns.length || patternFound || cancelled) {
        if (!patternFound && !cancelled) {
          setUsingImageSequence(false);
        }
        return;
      }

      const p = candidatePatterns[idx];
      const testImg = new Image();
      testImg.src = getFrameUrlWith(p.dir, p.naming, 1);

      testImg.onload = () => {
        if (cancelled) return;
        patternFound = true;
        setActivePattern(p);
        setUsingImageSequence(true);
        frameCache.current.set(1, testImg);

        // Preload rest of frames in background
        const maxToLoad = Math.min(totalFrames, 80);
        let loaded = 1;
        for (let i = 2; i <= maxToLoad; i++) {
          const img = new Image();
          img.src = getFrameUrlWith(p.dir, p.naming, i);
          img.onload = () => {
            if (!cancelled) {
              frameCache.current.set(i, img);
              loaded++;
              setLoadedFrameCount(loaded);
            }
          };
        }
      };

      testImg.onerror = () => {
        tryPattern(idx + 1);
      };
    };

    tryPattern(0);

    return () => {
      cancelled = true;
    };
  }, [getFrameUrlWith, totalFrames]);

  // High DPI Canvas rendering callback
  const drawFrameToCanvas = useCallback((source: HTMLImageElement | HTMLVideoElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Calculate aspect ratio covering
    const srcWidth = source instanceof HTMLImageElement ? source.naturalWidth : source.videoWidth || 1920;
    const srcHeight = source instanceof HTMLImageElement ? source.naturalHeight : source.videoHeight || 1080;

    const srcRatio = srcWidth / srcHeight;
    const destRatio = width / height;

    let drawW = width;
    let drawH = height;
    let offsetX = 0;
    let offsetY = 0;

    if (destRatio > srcRatio) {
      drawH = width / srcRatio;
      offsetY = (height - drawH) / 2;
    } else {
      drawW = height * srcRatio;
      offsetX = (width - drawW) / 2;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(source, offsetX, offsetY, drawW, drawH);
    ctx.restore();
  }, []);

  // Update canvas on frame change or video seek
  const renderCurrent = useCallback((progress: number) => {
    if (rafId.current) cancelAnimationFrame(rafId.current);

    rafId.current = requestAnimationFrame(() => {
      if (usingImageSequence) {
        const frame = Math.max(1, Math.min(totalFrames, Math.round(progress * (totalFrames - 1)) + 1));
        setCurrentFrameIndex(frame);

        const cached = frameCache.current.get(frame);
        if (cached && cached.complete) {
          drawFrameToCanvas(cached);
        } else if (frameCache.current.get(1)) {
          drawFrameToCanvas(frameCache.current.get(1)!);
        }
      } else if (videoRef.current) {
        // Direct video frame scrubbing
        const video = videoRef.current;
        if (video.duration) {
          video.currentTime = progress * video.duration;
          drawFrameToCanvas(video);
        }
      }
    });
  }, [usingImageSequence, totalFrames, drawFrameToCanvas]);

  // Set up GSAP Pinning and Scrubbing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const st = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: '+=250%',
      pin: true,
      scrub: 0.15,
      anticipatePin: 1,
      onUpdate: (self) => {
        const p = self.progress;
        setScrollProgress(p);

        // Determine current chapter overlay
        const match = CHAPTERS.find((c) => p >= c.start && p < c.end) || CHAPTERS[CHAPTERS.length - 1];
        setActiveChapter(match);

        renderCurrent(p);
      },
    });

    return () => {
      st.kill();
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [renderCurrent]);

  // Handle video metadata loaded
  const handleVideoLoaded = () => {
    if (!usingImageSequence && videoRef.current) {
      drawFrameToCanvas(videoRef.current);
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen bg-obsidian text-pearl overflow-hidden select-none"
    >
      {/* Hidden background video used for real-time video frame scrubbing when frames are not loaded */}
      {!usingImageSequence && (
        <video
          ref={videoRef}
          src={videoFallback}
          muted
          playsInline
          preload="auto"
          onLoadedData={handleVideoLoaded}
          onSeeked={() => videoRef.current && drawFrameToCanvas(videoRef.current)}
          className="hidden"
        />
      )}

      {/* Main High-Performance Canvas Stage */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Cinematic Vignette & Dynamic Atmosphere Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-black/60 pointer-events-none z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(8,8,8,0.7)_100%)] pointer-events-none z-10" />

      {/* Top Technical HUD Bar */}
      <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="p-1 bg-white rounded-sm shadow-md">
            <img src="/easy-car.jpeg" alt="Easy Cars Biel" className="h-6 w-auto object-contain" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-display text-xs font-bold text-white tracking-widest uppercase">
              EASY CARS BIEL • SCROLL EXPLORER
            </span>
            <span className="text-[9px] font-mono text-silver">
              AUDI A5 SPORTBACK S LINE (DAYTONA GREY)
            </span>
          </div>
        </div>

        {/* Live Frame / Progress Telemetry */}
        <div className="flex items-center gap-3 bg-black/75 backdrop-blur-md border border-white/10 px-3.5 py-1.5 font-mono text-[11px]">
          <span className="text-brand-red font-bold">
            {usingImageSequence ? `FRAME ${String(currentFrameIndex).padStart(4, '0')} / ${totalFrames}` : 'CINEMATIC SCRUB'}
          </span>
          <span className="text-white/20">|</span>
          <span className="text-silver">
            {Math.round(scrollProgress * 100)}% COMPLETE
          </span>
        </div>
      </div>

      {/* Chapter Information Card (Fades & Shifts on Scroll) */}
      <div className="absolute bottom-16 left-6 md:left-12 max-w-xl z-20 pointer-events-none">
        <div className="p-6 md:p-8 bg-charcoal/90 border border-white/15 backdrop-blur-2xl shadow-2xl transition-all duration-300">
          <span className="label-technical text-brand-red text-[10px] block mb-2 font-mono">
            {activeChapter.tag}
          </span>

          <h2 className="heading-subsection text-2xl md:text-4xl text-white mb-3 font-display">
            {activeChapter.title}
          </h2>

          <p className="text-ash text-xs md:text-sm leading-relaxed mb-6">
            {activeChapter.description}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div>
              <span className="text-2xl md:text-3xl font-black font-display text-white block">
                {activeChapter.metric}
              </span>
              <span className="text-[10px] font-mono text-silver uppercase block">
                {activeChapter.metricLabel}
              </span>
            </div>

            <Link
              to="/booking?vehicle=audi-a5-sportback"
              className="pointer-events-auto btn-primary py-2.5 px-6 text-xs font-mono tracking-wider flex items-center gap-2"
            >
              <span>RENT THIS CAR</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Vertical Scroll Timeline Marker (Right Edge) */}
      <div className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col items-center gap-3 z-20 pointer-events-none">
        {CHAPTERS.map((c, i) => {
          const isActive = scrollProgress >= c.start && scrollProgress < c.end;
          return (
            <div key={c.tag} className="flex items-center gap-2 group">
              <span
                className={`text-[9px] font-mono transition-colors uppercase ${
                  isActive ? 'text-brand-red font-bold' : 'text-steel'
                }`}
              >
                0{i + 1}
              </span>
              <div
                className={`w-1 transition-all rounded-full ${
                  isActive ? 'h-8 bg-brand-red' : 'h-3 bg-white/20'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Bottom Scroll Prompt Bar */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center pointer-events-none">
        <div className="flex items-center gap-2 text-[10px] font-mono text-silver uppercase tracking-widest bg-black/60 px-4 py-1 border border-white/10 rounded-full">
          <span>SCROLL DOWN TO SCRUB VEHICLE FRAMES</span>
          <div className="w-1.5 h-1.5 rounded-full bg-brand-red animate-ping" />
        </div>
      </div>
    </section>
  );
};
