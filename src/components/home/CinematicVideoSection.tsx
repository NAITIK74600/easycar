import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Sliders, Sparkles, Compass, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CinematicVideoSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isCinemaMode, setIsCinemaMode] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Time formatting (MM:SS)
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

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

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

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

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = clickRatio * (videoRef.current.duration || 1);
    videoRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  const cycleSpeed = () => {
    if (!videoRef.current) return;
    const speeds = [0.75, 1.0, 1.25];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    videoRef.current.playbackRate = nextSpeed;
    setPlaybackSpeed(nextSpeed);
  };

  return (
    <section id="cinema-experience" className="relative w-full bg-charcoal/60 py-20 border-t border-white/5 select-none overflow-hidden">
      <div className="section-container px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-brand-red tracking-[0.24em] uppercase mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
              <span>OFFICIAL 4K CINEMATIC REEL</span>
            </div>
            <h2
              className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-wide uppercase leading-tight"
              style={{ fontFamily: "'Cinzel', Georgia, serif" }}
            >
              DRIVE EXCELLENCE ON FILM
            </h2>
          </div>
          <div className="max-w-md">
            <p className="text-silver text-xs sm:text-sm font-light leading-relaxed">
              Experience the Audi A5 Sportback 3.0 TDI quattro S-Line in dynamic cinematic motion. Engineered for Swiss alpine precision and uncompromising luxury.
            </p>
          </div>
        </div>

        {/* ── Main Cinema Video Player ── */}
        <div className="relative bg-black border border-white/15 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)] group">
          {/* Aspect Ratio Video Container */}
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              src="/hf_20261015_195744_725e4105-b360-4701-8f78-1d2719e1fdb7.mp4"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              className={`w-full h-full object-cover transition-all duration-700 ${
                isCinemaMode ? 'scale-[1.02] filter contrast-[1.08]' : ''
              }`}
            />

            {/* Cinema Letterbox Overlay */}
            {isCinemaMode && (
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between z-10">
                <div className="h-10 md:h-16 w-full bg-black/95 backdrop-blur-md border-b border-white/5" />
                <div className="h-10 md:h-16 w-full bg-black/95 backdrop-blur-md border-t border-white/5" />
              </div>
            )}

            {/* Subtle Gradient Overlays for Controls Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity" />

            {/* Big Center Play Trigger when paused */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute z-20 w-20 h-20 rounded-full bg-brand-red/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer"
                aria-label="Play video"
              >
                <Play size={32} className="ml-1 fill-current" />
              </button>
            )}

            {/* Top Video Telemetry Badge */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2.5 bg-black/70 backdrop-blur-md border border-white/10 px-3.5 py-1.5 font-mono text-[10px] text-white">
              <span className="w-2 h-2 rounded-full bg-brand-red animate-ping" />
              <span className="font-bold tracking-wider">AUDI A5 SPORTBACK 3.0 TDI</span>
              <span className="text-white/20">|</span>
              <span className="text-silver">4K CINEMA GRADE</span>
            </div>

            {/* Top Right Sound Quick Indicator */}
            <button
              onClick={toggleMute}
              className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/70 hover:bg-brand-red hover:text-white backdrop-blur-md border border-white/15 px-3 py-1.5 font-mono text-[10px] text-pearl transition-all cursor-pointer"
            >
              {!isMuted ? <Volume2 size={14} className="text-white" /> : <VolumeX size={14} className="text-silver" />}
              <span>{!isMuted ? 'SOUND ON' : 'UNMUTE FILM'}</span>
            </button>
          </div>

          {/* ── Interactive Scrubber & Transport Bar ── */}
          <div className="relative z-20 bg-charcoal/95 border-t border-white/10 p-3 sm:p-4 font-mono text-xs">
            {/* Scrubber Timeline */}
            <div
              ref={progressRef}
              onClick={handleScrubberClick}
              className="group/track relative w-full h-1.5 hover:h-2.5 bg-white/15 transition-all cursor-pointer rounded-full overflow-hidden mb-3"
              title="Click to seek"
            >
              <div
                className="h-full bg-gradient-to-r from-brand-red to-brand-red-light relative transition-all duration-75"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white opacity-0 group-hover/track:opacity-100 shadow-md" />
              </div>
            </div>

            {/* Controls Bar Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Left Playback Buttons */}
              <div className="flex items-center gap-2 text-white">
                <button
                  onClick={togglePlay}
                  className="p-2 bg-obsidian hover:bg-brand-red border border-white/10 transition-colors cursor-pointer"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} className="fill-current" />}
                </button>

                <button
                  onClick={toggleMute}
                  className={`p-2 border transition-colors cursor-pointer flex items-center gap-1.5 ${
                    !isMuted
                      ? 'bg-brand-red text-white border-brand-red'
                      : 'bg-obsidian hover:bg-white/10 text-silver border-white/10'
                  }`}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {!isMuted ? <Volume2 size={14} /> : <VolumeX size={14} />}
                </button>

                <button
                  onClick={cycleSpeed}
                  className="px-2.5 py-1.5 bg-obsidian hover:bg-white/10 text-silver border border-white/10 text-[11px] cursor-pointer"
                  title="Playback Speed"
                >
                  {playbackSpeed}x
                </button>

                <button
                  onClick={() => setIsCinemaMode(!isCinemaMode)}
                  className={`px-2.5 py-1.5 border text-[10px] tracking-wider uppercase transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isCinemaMode
                      ? 'bg-brand-red text-white border-brand-red'
                      : 'bg-obsidian hover:bg-white/10 text-silver border-white/10'
                  }`}
                >
                  <Sliders size={12} />
                  <span className="hidden md:inline">{isCinemaMode ? 'EXIT CINEMA' : 'CINEMA SCOPE'}</span>
                </button>

                {/* Time Display */}
                <span className="text-silver text-[11px] ml-2">
                  {formatTime(currentTime)} <span className="text-white/30">/</span> {formatTime(duration)}
                </span>
              </div>

              {/* Right Telemetry & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-4 text-[11px] text-silver">
                <span className="hidden lg:inline text-white font-bold">
                  286 PS • quattro • S-Line
                </span>

                <button
                  onClick={toggleFullscreen}
                  className="p-2 bg-obsidian hover:bg-white/10 text-silver hover:text-white border border-white/10 transition-colors cursor-pointer"
                  aria-label="Toggle Fullscreen"
                  title="Fullscreen"
                >
                  <Maximize2 size={14} />
                </button>

                <Link
                  to="/booking?vehicle=audi-a5-sportback"
                  className="btn-primary py-2 px-4 text-[11px] font-mono tracking-widest flex items-center gap-1.5"
                >
                  <span>RENT AUDI A5</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
