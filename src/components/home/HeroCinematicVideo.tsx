import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { soundEngine } from '../../utils/audioEngine';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sliders,
  Compass,
  ArrowRight,
  ArrowDown,
  Sparkles,
  Radio,
  Gauge,
  Navigation,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const HeroCinematicVideo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoWrapperRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const badgeRef = useRef<HTMLDivElement | null>(null);
  const sublineRef = useRef<HTMLParagraphElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const hudRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  // Player states
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [hudMode, setHudMode] = useState<'cinema' | 'telemetry'>('telemetry');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [swissTime, setSwissTime] = useState<string>('');

  // Live Swiss CET Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSwissTime(
        now.toLocaleTimeString('de-CH', {
          timeZone: 'Europe/Zurich',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // GSAP Text and Container Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: -20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, delay: 0.2 }
      )
        .fromTo(
          headlineRef.current?.querySelectorAll('.kinetic-word') || [],
          { opacity: 0, y: 70, rotateX: -30 },
          { opacity: 1, y: 0, rotateX: 0, duration: 1.1, stagger: 0.12 },
          '-=0.4'
        )
        .fromTo(
          sublineRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.9 },
          '-=0.6'
        )
        .fromTo(
          actionsRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.5'
        )
        .fromTo(
          hudRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 1 },
          '-=0.4'
        );

      // ScrollTrigger: Cinematic Parallax and Smooth Scale down into the next section
      if (containerRef.current && videoWrapperRef.current) {
        gsap.to(videoWrapperRef.current, {
          scale: 0.94,
          borderRadius: '24px',
          opacity: 0.85,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });

        gsap.to(headlineRef.current, {
          yPercent: -40,
          opacity: 0.2,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Video Time & Progress Listener
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    soundEngine.playClickSound();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleAudio = () => {
    soundEngine.playClickSound();
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);

    // Coordinate with ambient luxury sound synthesizer
    if (!nextMuted) {
      soundEngine.toggleAmbient();
    }
  };

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = clickRatio * (videoRef.current.duration || 1);
    videoRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const cycleSpeed = () => {
    soundEngine.playClickSound();
    if (!videoRef.current) return;
    const speeds = [0.75, 1.0, 1.25];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    videoRef.current.playbackRate = nextSpeed;
    setPlaybackSpeed(nextSpeed);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}.${ms}`;
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-obsidian pt-24 pb-8"
    >
      {/* ── Background Cinematic Video Canvas ── */}
      <div
        ref={videoWrapperRef}
        className="absolute inset-0 z-0 overflow-hidden transition-all duration-700 ease-out"
        style={{ transformOrigin: 'center center' }}
      >
        <video
          ref={videoRef}
          src="/videos/easycars-hero.mp4"
          autoPlay
          loop
          muted={isMuted}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          className="w-full h-full object-cover"
        />

        {/* Cinematic Atmospheric Multi-Pass Vignette & Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/60 to-black/70 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_rgba(8,8,8,0.75)_90%)] pointer-events-none" />

        {/* Ambient Red Aura reacting to star car */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[400px] bg-brand-red/15 blur-[160px] rounded-full pointer-events-none" />

        {/* Optional Cinema Mode Letterbox Bars */}
        {hudMode === 'cinema' && (
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between z-10 transition-all duration-500">
            <div className="h-10 md:h-16 w-full bg-black/95 backdrop-blur-md border-b border-white/5" />
            <div className="h-10 md:h-16 w-full bg-black/95 backdrop-blur-md border-t border-white/5" />
          </div>
        )}
      </div>

      {/* ── Top Level Floating Telemetry Indicator ── */}
      <div className="section-container relative z-20 pt-2 flex items-center justify-between">
        <div
          ref={badgeRef}
          className="inline-flex items-center gap-3 p-1.5 pr-4 bg-charcoal/90 border border-white/15 backdrop-blur-xl rounded-none shadow-2xl"
        >
          <div className="h-8 w-auto bg-white p-1 rounded-sm shadow-sm flex items-center justify-center">
            <img src="/easy-car.jpeg" alt="Easy Cars Biel" className="h-full w-auto object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="label-technical text-white text-[10px] tracking-[0.16em]">
              WWW.EASYCARSBIEL.CH
            </span>
            <span className="text-[9px] font-mono text-silver">
              BIEL/BIENNE & PIETERLEN • CANTON BERN
            </span>
          </div>
        </div>

        {/* Live HUD System Widget */}
        <div className="hidden md:flex items-center gap-3 bg-black/70 backdrop-blur-md border border-white/10 px-4 py-2 font-mono text-xs">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-bold">SYSTEM ACTIVE</span>
          </div>
          <span className="text-white/20">|</span>
          <span className="text-silver text-[11px]">CET: <strong className="text-white font-mono">{swissTime || '12:00:00'}</strong></span>
          <span className="text-white/20">|</span>
          <span className="text-brand-red text-[11px]">AUDI A5 S LINE</span>
        </div>
      </div>

      {/* ── Main Hero Typography & Call-To-Action ── */}
      <div className="section-container relative z-20 my-auto py-6">
        <div className="max-w-4xl">
          {/* Master Shimmering Luxury Headline */}
          <h1
            ref={headlineRef}
            className="heading-hero mb-6 tracking-wide select-none"
          >
            <div className="overflow-hidden">
              <span className="kinetic-word inline-block font-display text-white">DRIVE</span>
            </div>
            <div className="overflow-hidden flex flex-wrap items-center gap-3">
              <span className="kinetic-word inline-block font-display text-brand-red shimmer-text font-black hover:text-white transition-colors duration-500">
                EXCELLENCE.
              </span>
              <span className="kinetic-word inline-block text-xs font-mono tracking-widest text-silver uppercase px-3 py-1 bg-white/5 border border-white/10 rounded-sm">
                47.1368° N, 7.2468° E
              </span>
            </div>
          </h1>

          {/* Subtitle with High-Tech Highlights */}
          <p
            ref={sublineRef}
            className="body-large text-pearl max-w-xl mb-8 text-base md:text-lg font-light leading-relaxed drop-shadow"
          >
            Experience our flagship <strong className="text-white font-bold">Audi A5 Sportback 3.0 TDI quattro S-Line (286 PS)</strong> in Pieterlen & Biel/Bienne. Massagesitze, Panorama-Glasdach, Apple CarPlay, Allradantrieb und transparente Schweizer Konditionen.
          </p>

          {/* Action Buttons */}
          <div
            ref={actionsRef}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6"
          >
            <Link
              to="/booking?vehicle=audi-a5-sportback"
              data-cursor="RENT"
              className="btn-primary group flex items-center justify-center gap-3 py-4 px-8 text-xs font-mono tracking-widest shadow-2xl transition-all duration-300 hover:scale-[1.02]"
            >
              <span>RENT AUDI A5 SPORTBACK</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/fleet"
              data-cursor="VIEW"
              className="btn-outline flex items-center justify-center gap-3 py-4 px-8 text-xs font-mono tracking-widest bg-obsidian/40 backdrop-blur-md hover:bg-white hover:text-obsidian"
            >
              <span>DISCOVER THE FLEET</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Interactive Video Controls & Telemetry HUD Strip ── */}
      <div
        ref={hudRef}
        className="section-container relative z-20"
      >
        {/* Scrubber Progress Bar */}
        <div
          ref={progressRef}
          onClick={handleScrubberClick}
          className="group relative w-full h-1.5 bg-white/15 hover:h-2.5 transition-all cursor-pointer rounded-full overflow-hidden mb-4"
          title="Click to seek video"
        >
          <div
            className="h-full bg-gradient-to-r from-brand-red to-brand-red-light transition-all duration-100 relative"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100" />
          </div>
        </div>

        {/* Bottom Control Bar & Live Specs */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-3 bg-charcoal/90 border border-white/10 backdrop-blur-xl">
          {/* Left: Video Playback Controls */}
          <div className="flex items-center gap-2 font-mono text-xs">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-2 bg-obsidian hover:bg-brand-red text-white transition-colors border border-white/10 cursor-pointer"
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>

            {/* Mute/Sound with Equalizer Bars */}
            <button
              onClick={toggleAudio}
              className={`p-2 transition-colors border cursor-pointer flex items-center gap-2 ${
                !isMuted
                  ? 'bg-brand-red text-white border-brand-red'
                  : 'bg-obsidian hover:bg-white/10 text-silver border-white/10'
              }`}
              title={isMuted ? 'Enable Sound' : 'Mute Sound'}
            >
              {!isMuted ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span className="text-[10px] hidden sm:inline uppercase">
                {!isMuted ? 'AUDIO LIVE' : 'UNMUTE'}
              </span>
            </button>

            {/* Playback Speed */}
            <button
              onClick={cycleSpeed}
              className="px-2.5 py-1.5 bg-obsidian hover:bg-white/10 text-silver text-[11px] border border-white/10 cursor-pointer"
              title="Toggle Playback Speed"
            >
              {playbackSpeed}x
            </button>

            {/* View Mode Toggle */}
            <button
              onClick={() => {
                soundEngine.playClickSound();
                setHudMode(hudMode === 'cinema' ? 'telemetry' : 'cinema');
              }}
              className="px-2.5 py-1.5 bg-obsidian hover:bg-white/10 text-silver text-[11px] border border-white/10 cursor-pointer flex items-center gap-1.5"
            >
              <Sliders size={12} className="text-brand-red" />
              <span className="uppercase text-[10px]">
                {hudMode === 'cinema' ? 'TELEMETRY' : 'CINEMA VIEW'}
              </span>
            </button>

            {/* Timecode */}
            <span className="text-steel font-mono text-[11px] ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right: Star Car Telemetry Indicators */}
          <div className="flex flex-wrap items-center gap-6 text-xs font-mono pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10">
            <div>
              <span className="text-steel block text-[9px] uppercase">FLAGSHIP</span>
              <span className="text-white font-bold">AUDI A5 SPORTBACK</span>
            </div>

            <div className="h-6 w-px bg-white/10 hidden sm:block" />

            <div>
              <span className="text-steel block text-[9px] uppercase">POWERTRAIN</span>
              <span className="text-pearl">3.0 TDI V6 QUATTRO • 286 PS</span>
            </div>

            <div className="h-6 w-px bg-white/10 hidden sm:block" />

            <div>
              <span className="text-steel block text-[9px] uppercase">SWISS RATE</span>
              <span className="text-brand-red font-bold">CHF 100 / DAY</span>
            </div>

            <a
              href="#exterior-chapter"
              className="flex items-center gap-1.5 text-silver hover:text-white transition-colors ml-auto text-[10px] uppercase tracking-wider"
            >
              <span>INSPECT</span>
              <ArrowDown size={12} className="text-brand-red animate-bounce" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
