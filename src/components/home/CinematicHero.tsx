import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowRight, Play, Pause, RotateCcw } from 'lucide-react';

interface CinematicHeroProps {
  onRentClick?: () => void;
  onFleetClick?: () => void;
}

export const CinematicHero: React.FC<CinematicHeroProps> = ({
  onRentClick,
  onFleetClick,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const badgeRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 1;
    setProgress((current / dur) * 100);
  };

  const handleSeek = (val: number) => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration || 1;
    videoRef.current.currentTime = (val / 100) * dur;
    setProgress(val);
  };

  const handleReset = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.1 }
      )
        .fromTo(
          headlineRef.current?.querySelectorAll('.line-animate') || [],
          { opacity: 0, y: 60, skewY: 3 },
          { opacity: 1, y: 0, skewY: 0, duration: 1.1, stagger: 0.15 },
          '-=0.5'
        )
        .fromTo(
          contentRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.9 },
          '-=0.6'
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[92vh] lg:min-h-screen flex flex-col justify-between pt-24 lg:pt-28 pb-6 overflow-hidden bg-obsidian select-none"
    >
      {/* ── Background Automotive Video with Fallback Poster ── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          src="/hf_20261015_195744_725e4105-b360-4701-8f78-1d2719e1fdb7.mp4"
          poster="/assets/cinematic/audi_a5_hero.jpg"
          autoPlay
          loop
          muted
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="w-full h-full object-cover object-[center_right] lg:object-right-center filter brightness-[1.04] contrast-[1.05]"
        />

        {/* Clean, Non-Obstructive Readability Gradient (Left-side text shadow only) */}
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/90 via-obsidian/30 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-obsidian/80 to-transparent pointer-events-none" />
      </div>

      {/* ── Top Location Label ── */}
      <div className="section-container relative z-20 w-full px-6 sm:px-8 lg:px-12 pt-2">
        <div
          ref={badgeRef}
          className="flex items-center gap-2.5 font-mono text-[10px] md:text-xs text-silver tracking-[0.24em] uppercase"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
          <span>BIEL / BIENNE · PIETERLEN · CANTON BERN</span>
        </div>
      </div>

      {/* ── Main Hero Content Area ── */}
      <div className="section-container relative z-10 w-full my-auto px-6 sm:px-8 lg:px-12 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Location, Master 2-Line Headline, Description & Exact 2 CTAs */}
          <div className="lg:col-span-8 max-w-3xl">
            {/* Master 2-Line Headline: DRIVE (White) / EXCELLENCE. (Vivid Red) */}
            <h1
              ref={headlineRef}
              className="text-white font-display font-black tracking-[-0.01em] uppercase leading-[0.88] mb-6"
              style={{
                fontSize: 'clamp(3.5rem, 9.5vw, 7.8rem)',
                fontFamily: "'Cinzel', Georgia, serif",
                textShadow: '0 8px 30px rgba(0,0,0,0.85)',
              }}
            >
              <div className="overflow-hidden">
                <span className="line-animate block text-white">DRIVE</span>
              </div>
              <div className="overflow-hidden">
                <span className="line-animate block text-brand-red text-shadow-red">
                  EXCELLENCE.
                </span>
              </div>
            </h1>

            {/* Supporting Copy & CTAs */}
            <div ref={contentRef} className="space-y-6 max-w-xl">
              <div>
                <span className="label-technical text-silver text-[11px] tracking-[0.22em] block mb-2 font-mono">
                  PREMIUM AUDI RENTAL IN SWITZERLAND
                </span>
                <p className="text-pearl/90 text-sm md:text-base font-light leading-relaxed drop-shadow-md">
                  Experience our{' '}
                  <strong className="text-white font-semibold">
                    Audi A5 Sportback 3.0 TDI quattro S-Line (286 PS)
                  </strong>{' '}
                  in Pieterlen & Biel/Bienne. Modern design, powerful performance and transparent Swiss conditions.
                </p>
              </div>

              {/* Exact Two Action Buttons from Reference Design */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/booking?vehicle=audi-a5-sportback"
                  onClick={onRentClick}
                  className="btn-primary flex items-center gap-3 py-4 px-8 text-xs font-mono tracking-[0.16em] uppercase shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <span>RENT AUDI A5 SPORTBACK</span>
                  <ArrowRight size={15} />
                </Link>

                <a
                  href="#exceptional-fleet"
                  onClick={(e) => {
                    if (onFleetClick) {
                      e.preventDefault();
                      onFleetClick();
                    }
                  }}
                  className="btn-outline flex items-center gap-3 py-4 px-8 text-xs font-mono tracking-[0.16em] uppercase bg-black/40 backdrop-blur-md hover:bg-white hover:text-black transition-all"
                >
                  <span>DISCOVER THE FLEET</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Exact Vertical Technical Badge from Reference Image */}
          <div className="hidden xl:flex lg:col-span-4 justify-end items-center pr-4">
            <div className="relative pl-6 py-6 border-l border-brand-red/60 backdrop-blur-sm bg-black/20">
              <div className="flex flex-col gap-5 text-right font-mono select-none">
                <div>
                  <span className="block text-white font-display text-2xl font-bold tracking-widest leading-none">
                    A5
                  </span>
                  <span className="block text-[10px] text-silver tracking-[0.3em] uppercase mt-1">
                    SPORTBACK
                  </span>
                </div>

                <div className="space-y-1.5 text-[10px] tracking-[0.25em] text-ash uppercase">
                  <div className="text-pearl hover:text-brand-red transition-colors">POWER</div>
                  <div className="text-pearl hover:text-brand-red transition-colors">COMFORT</div>
                  <div className="text-pearl hover:text-brand-red transition-colors">ELEGANCE</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Seamless Automotive Video & Sequence Control HUD ── */}
      <div className="section-container relative z-20 w-full px-6 sm:px-8 lg:px-12 pt-4 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-4 py-2.5 px-4 bg-black/70 backdrop-blur-md border border-white/10 rounded-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-brand-red text-white transition-colors cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-silver hover:text-white transition-colors cursor-pointer"
              title="Restart"
              aria-label="Restart"
            >
              <RotateCcw size={11} />
            </button>

            <span className="font-mono text-[10px] text-silver tracking-widest uppercase font-bold">
              CINEMATIC REVEAL
            </span>
          </div>

          {/* Interactive Timeline Scrubber Bar */}
          <div className="flex-1 max-w-md mx-2 relative py-1 flex items-center cursor-pointer group">
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={progress}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-brand-red focus:outline-none"
              aria-label="Timeline position"
            />
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/fleet/audi-a5-sportback"
              className="font-mono text-[10px] text-white hover:text-brand-red tracking-wider uppercase font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>INSPECT VEHICLE</span>
              <ArrowRight size={11} className="text-brand-red" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
