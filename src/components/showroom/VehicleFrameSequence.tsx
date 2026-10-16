import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Info,
  Sparkles,
  ShieldCheck,
  Eye,
  Sliders,
  Volume2,
  Layers,
  ArrowRight,
  X,
  Gauge,
  Compass,
} from 'lucide-react';
import {
  VehicleSequenceConfig,
  SequenceHotspot,
  AUDI_A5_HERO_SEQUENCE,
} from '../../config/vehicleSequences';

interface VehicleFrameSequenceProps {
  config?: VehicleSequenceConfig;
  className?: string;
  enableScrollScrub?: boolean;
  initialFrame?: number;
  onHotspotSelect?: (hotspot: SequenceHotspot | null) => void;
  onBookClick?: () => void;
}

export const VehicleFrameSequence: React.FC<VehicleFrameSequenceProps> = ({
  config = AUDI_A5_HERO_SEQUENCE,
  className = '',
  enableScrollScrub = false,
  initialFrame = 0,
  onHotspotSelect,
  onBookClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Current frame state
  const [currentFrame, setCurrentFrame] = useState<number>(initialFrame);
  const currentFrameRef = useRef<number>(initialFrame);
  currentFrameRef.current = currentFrame;

  // Loading and buffering state
  const [loadedCount, setLoadedCount] = useState<number>(0);
  const [isInitialReady, setIsInitialReady] = useState<boolean>(false);
  const [bufferProgress, setBufferProgress] = useState<number>(0);

  // Playback control
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const animFrameIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  // Pointer drag scrubbing
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartFrameRef = useRef<number>(0);

  // Hotspots
  const [selectedHotspot, setSelectedHotspot] = useState<SequenceHotspot | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<SequenceHotspot | null>(null);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);

  // UI state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'interactive' | 'cinematic' | 'dossier'>('interactive');

  // Progressive image cache (sliding window around current frame)
  const imageCacheRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const pendingRequestsRef = useRef<Set<number>>(new Set());

  const totalFrames = config.totalFrames;

  // Helper to load a single frame into cache
  const loadFrame = useCallback(
    (index: number): Promise<HTMLImageElement> => {
      const clamped = Math.max(0, Math.min(totalFrames - 1, index));
      if (imageCacheRef.current.has(clamped)) {
        return Promise.resolve(imageCacheRef.current.get(clamped)!);
      }

      if (pendingRequestsRef.current.has(clamped)) {
        return new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (imageCacheRef.current.has(clamped)) {
              clearInterval(checkInterval);
              resolve(imageCacheRef.current.get(clamped)!);
            }
          }, 40);
        });
      }

      pendingRequestsRef.current.add(clamped);

      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = config.getFrameUrl(clamped);

        img.onload = () => {
          imageCacheRef.current.set(clamped, img);
          pendingRequestsRef.current.delete(clamped);
          setLoadedCount((prev) => prev + 1);
          resolve(img);
        };

        img.onerror = () => {
          pendingRequestsRef.current.delete(clamped);
          // Graceful fallback to frame 0 or poster
          const fallback = new Image();
          fallback.src = config.posterUrl;
          fallback.onload = () => {
            imageCacheRef.current.set(clamped, fallback);
            resolve(fallback);
          };
        };
      });
    },
    [config, totalFrames]
  );

  // Preload a sliding window of frames around target index
  const preloadSlidingWindow = useCallback(
    (targetIndex: number) => {
      const windowRadius = 15; // 15 frames backward, 25 frames forward
      const start = Math.max(0, targetIndex - windowRadius);
      const end = Math.min(totalFrames - 1, targetIndex + windowRadius + 10);

      // Priority 1: Target frame
      loadFrame(targetIndex);

      // Priority 2: Next few frames
      for (let i = targetIndex + 1; i <= Math.min(totalFrames - 1, targetIndex + 6); i++) {
        loadFrame(i);
      }

      // Priority 3: Surrounding window
      for (let i = start; i <= end; i++) {
        if (!imageCacheRef.current.has(i)) {
          loadFrame(i);
        }
      }

      // Evict distant frames if cache exceeds 60 frames to save mobile memory
      if (imageCacheRef.current.size > 65) {
        for (const key of imageCacheRef.current.keys()) {
          if (key < targetIndex - 30 || key > targetIndex + 40) {
            imageCacheRef.current.delete(key);
          }
        }
      }
    },
    [loadFrame, totalFrames]
  );

  // Initial load: preload first 12 frames to ensure instant interaction
  useEffect(() => {
    let isCancelled = false;

    async function initialBootstrap() {
      // Load initial frame and surrounding batch
      const initialPromises = [];
      for (let i = 0; i < Math.min(12, totalFrames); i++) {
        initialPromises.push(loadFrame(i));
      }

      await Promise.all(initialPromises);
      if (!isCancelled) {
        setIsInitialReady(true);
        drawFrameToCanvas(0);
      }
    }

    initialBootstrap();

    return () => {
      isCancelled = true;
      imageCacheRef.current.clear();
      pendingRequestsRef.current.clear();
    };
  }, [config, loadFrame, totalFrames]);

  // Update buffer progress indicator
  useEffect(() => {
    const pct = Math.min(100, Math.round((loadedCount / Math.min(60, totalFrames)) * 100));
    setBufferProgress(pct);
  }, [loadedCount, totalFrames]);

  // Draw target frame onto HTML5 Canvas
  const drawFrameToCanvas = useCallback(
    (frameIndex: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = imageCacheRef.current.get(frameIndex);

      if (!img || !img.complete) {
        // Find closest cached frame for seamless continuity
        let fallbackImg: HTMLImageElement | undefined;
        for (let diff = 1; diff <= 10; diff++) {
          if (imageCacheRef.current.has(frameIndex - diff)) {
            fallbackImg = imageCacheRef.current.get(frameIndex - diff);
            break;
          }
          if (imageCacheRef.current.has(frameIndex + diff)) {
            fallbackImg = imageCacheRef.current.get(frameIndex + diff);
            break;
          }
        }

        if (fallbackImg && fallbackImg.complete) {
          ctx.drawImage(fallbackImg, 0, 0, canvas.width, canvas.height);
        }
        return;
      }

      // Draw high resolution frame
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    },
    []
  );

  // Set frame index and trigger progressive load
  const seekToFrame = useCallback(
    (newIndex: number) => {
      const clamped = Math.max(0, Math.min(totalFrames - 1, Math.round(newIndex)));
      setCurrentFrame(clamped);
      currentFrameRef.current = clamped;
      drawFrameToCanvas(clamped);
      preloadSlidingWindow(clamped);
    },
    [drawFrameToCanvas, preloadSlidingWindow, totalFrames]
  );

  // Playback Loop via requestAnimationFrame
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      return;
    }

    const frameInterval = (1000 / config.fps) / playbackSpeed;

    const loop = (timestamp: number) => {
      if (!lastFrameTimeRef.current) lastFrameTimeRef.current = timestamp;
      const delta = timestamp - lastFrameTimeRef.current;

      if (delta >= frameInterval) {
        lastFrameTimeRef.current = timestamp;
        const next = (currentFrameRef.current + 1) % totalFrames;
        seekToFrame(next);
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPlaying, playbackSpeed, config.fps, totalFrames, seekToFrame]);

  // Pointer Drag scrubbing handler
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // If clicking a hotspot or control button, don't initiate drag
    if ((e.target as HTMLElement).closest('button, [data-hotspot]')) return;

    setIsDragging(true);
    setIsPlaying(false);
    dragStartXRef.current = e.clientX;
    dragStartFrameRef.current = currentFrame;

    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragStartXRef.current;

    // Sensitivity: Dragging across the full container width scrubs through ~180 frames
    const frameSpan = 180;
    const frameDelta = (deltaX / rect.width) * frameSpan;

    const targetFrame = dragStartFrameRef.current + frameDelta;
    seekToFrame(targetFrame);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);

    if (containerRef.current && containerRef.current.hasPointerCapture(e.pointerId)) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.matches(':hover')) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        seekToFrame(currentFrameRef.current + (e.shiftKey ? 10 : 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        seekToFrame(currentFrameRef.current - (e.shiftKey ? 10 : 1));
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [seekToFrame]);

  // Hotspots visible on current frame
  const activeHotspots = useMemo(() => {
    return config.hotspots.filter(
      (h) => currentFrame >= h.frameStart && currentFrame <= h.frameEnd
    );
  }, [config.hotspots, currentFrame]);

  const handleHotspotClick = (h: SequenceHotspot) => {
    setIsPlaying(false);
    setSelectedHotspot(h);
    onHotspotSelect?.(h);
  };

  const handleCloseHotspotModal = () => {
    setSelectedHotspot(null);
    onHotspotSelect?.(null);
  };

  const handleNextHotspot = () => {
    if (!selectedHotspot) return;
    const currentIndex = config.hotspots.findIndex((h) => h.id === selectedHotspot.id);
    const nextIndex = (currentIndex + 1) % config.hotspots.length;
    const nextHotspot = config.hotspots[nextIndex];
    setSelectedHotspot(nextHotspot);
    seekToFrame(Math.round((nextHotspot.frameStart + nextHotspot.frameEnd) / 2));
  };

  const handlePrevHotspot = () => {
    if (!selectedHotspot) return;
    const currentIndex = config.hotspots.findIndex((h) => h.id === selectedHotspot.id);
    const prevIndex = (currentIndex - 1 + config.hotspots.length) % config.hotspots.length;
    const prevHotspot = config.hotspots[prevIndex];
    setSelectedHotspot(prevHotspot);
    seekToFrame(Math.round((prevHotspot.frameStart + prevHotspot.frameEnd) / 2));
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Scroll-driven frame progression when scrolling the page
  useEffect(() => {
    if (isPlaying) return;

    const handleWindowScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // When showroom is in viewport
      if (rect.bottom >= 0 && rect.top <= windowHeight) {
        const totalDistance = windowHeight + rect.height;
        const scrollOffset = windowHeight - rect.top;
        const rawProgress = scrollOffset / totalDistance;
        const clamped = Math.max(0, Math.min(1, rawProgress));
        const targetFrame = Math.round(clamped * (totalFrames - 1));
        seekToFrame(targetFrame);
      }
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, [isPlaying, seekToFrame, totalFrames]);

  // Mouse wheel frame scrubbing
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const delta = Math.sign(e.deltaY) * 3;
    seekToFrame(currentFrameRef.current + delta);
  };

  // Calculate current timestamp formatted mm:ss.ms
  const currentSeconds = (currentFrame / config.fps).toFixed(2);
  const totalSeconds = (totalFrames / config.fps).toFixed(2);

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-black/90 border border-white/10 rounded-sm overflow-hidden select-none transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      } ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* 1. Header Technical HUD Strip */}
      <div className="relative z-20 flex flex-wrap items-center justify-between px-4 py-3 bg-gradient-to-b from-black/90 to-transparent border-b border-white/5 gap-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-brand-red/20 text-brand-red font-mono text-[10px] uppercase font-bold tracking-wider border border-brand-red/30">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
            DYNAMIC REVEAL
          </span>
          <span className="text-xs font-mono text-white font-bold tracking-wider uppercase">
            {config.vehicleName}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-silver">
          <div className="flex items-center gap-1.5 text-white/70">
            <span>{currentSeconds}s</span>
            <span className="text-white/30">/</span>
            <span>{totalSeconds}s</span>
          </div>
        </div>
      </div>

      {/* 2. Main Canvas Viewport Area */}
      <div className="relative w-full aspect-video flex items-center justify-center bg-radial from-neutral-900 to-black overflow-hidden cursor-ew-resize">
        <canvas
          ref={canvasRef}
          width={config.width}
          height={config.height}
          className="w-full h-full object-contain pointer-events-none"
        />

        {/* Poster / Fallback element before canvas buffers */}
        {!isInitialReady && (
          <img
            src={config.posterUrl}
            alt={config.vehicleName}
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}

        {/* Loading Spinner & Progress Overlay */}
        {!isInitialReady && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-30">
            <div className="w-8 h-8 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin" />
          </div>
        )}

        {/* 3. Hotspots Overlay on top of sequence */}
        {showHotspots && isInitialReady && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {activeHotspots.map((h) => {
              const isSelected = selectedHotspot?.id === h.id;
              const isHovered = hoveredHotspot?.id === h.id;

              return (
                <div
                  key={h.id}
                  data-hotspot
                  style={{ top: `${h.y}%`, left: `${h.x}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-transform duration-200"
                  onMouseEnter={() => setHoveredHotspot(h)}
                  onMouseLeave={() => setHoveredHotspot(null)}
                >
                  <button
                    onClick={() => handleHotspotClick(h)}
                    className="relative group p-2 focus:outline-none"
                    aria-label={`Inspect ${h.name}`}
                  >
                    {/* Pulsing beacon */}
                    <span
                      className={`absolute inset-0 rounded-full transition-all duration-300 ${
                        isSelected
                          ? 'bg-red-500/40 animate-ping'
                          : 'bg-white/20 group-hover:bg-red-500/30'
                      }`}
                    />

                    {/* Core icon disc */}
                    <span
                      className={`relative flex items-center justify-center w-7 h-7 rounded-full border transition-all duration-300 ${
                        isSelected
                          ? 'bg-red-600 border-white text-white scale-110 shadow-[0_0_15px_rgba(230,0,0,0.8)]'
                          : 'bg-black/80 border-red-500/70 text-red-400 group-hover:scale-110 group-hover:border-red-400 group-hover:text-white'
                      }`}
                    >
                      <Sparkles size={13} />
                    </span>

                    {/* Floating Tooltip Label */}
                    {(isHovered || isSelected) && (
                      <div className="absolute left-1/2 -top-10 -translate-x-1/2 px-3 py-1 bg-black/95 border border-red-500/50 text-white font-mono text-[11px] whitespace-nowrap shadow-xl z-20 pointer-events-none">
                        <span className="text-red-400 font-bold mr-1.5">•</span>
                        {h.name}
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Luxury Cinematic Timeline Scrubber */}
      <div className="relative z-20 px-4 py-3 bg-neutral-950 border-t border-white/10">
        <div className="flex items-center gap-3">
          {/* Play / Pause Toggle */}
          <button
            onClick={() => setIsPlaying((prev) => !prev)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-red-600 text-white transition-colors"
            title={isPlaying ? 'Pause (Space)' : 'Play reveal (Space)'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </button>

          {/* Reset Frame */}
          <button
            onClick={() => seekToFrame(0)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/20 text-silver hover:text-white transition-colors"
            title="Reset to beginning"
          >
            <RotateCcw size={13} />
          </button>

          {/* Step Back 1 Frame */}
          <button
            onClick={() => seekToFrame(currentFrame - 1)}
            className="flex items-center justify-center w-7 h-7 bg-white/5 hover:bg-white/15 text-silver hover:text-white transition-colors text-xs"
            title="Previous frame (Left arrow)"
          >
            <ChevronLeft size={14} />
          </button>

          {/* Scrubber Track */}
          <div className="relative flex-1 py-2 cursor-pointer group">
            <input
              type="range"
              min={0}
              max={totalFrames - 1}
              value={currentFrame}
              onChange={(e) => seekToFrame(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-red-600 focus:outline-none"
            />
            {/* Progress glow bar */}
            <div
              className="absolute top-1/2 left-0 -translate-y-1/2 h-1.5 bg-red-600 pointer-events-none rounded-l-lg"
              style={{ width: `${(currentFrame / (totalFrames - 1)) * 100}%` }}
            />
          </div>

          {/* Step Forward 1 Frame */}
          <button
            onClick={() => seekToFrame(currentFrame + 1)}
            className="flex items-center justify-center w-7 h-7 bg-white/5 hover:bg-white/15 text-silver hover:text-white transition-colors text-xs"
            title="Next frame (Right arrow)"
          >
            <ChevronRight size={14} />
          </button>

          {/* Playback Speed selector */}
          <div className="hidden sm:flex items-center gap-1 border-l border-white/10 pl-3">
            {[0.5, 1.0, 2.0].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2 py-0.5 text-[10px] font-mono transition-colors ${
                  playbackSpeed === speed
                    ? 'bg-red-600 text-white font-bold'
                    : 'bg-white/5 text-silver hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Hotspots Toggle */}
          <button
            onClick={() => setShowHotspots((prev) => !prev)}
            className={`px-2.5 py-1 text-[11px] font-mono flex items-center gap-1.5 border transition-colors ${
              showHotspots
                ? 'bg-red-600/20 border-red-500/50 text-red-400'
                : 'bg-white/5 border-white/10 text-silver'
            }`}
            title="Toggle component hotspots"
          >
            <Sparkles size={11} />
            <span className="hidden md:inline">HOTSPOTS</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/20 text-silver hover:text-white transition-colors"
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* 5. Hotspot Detail Drawer / Modal (When a part is inspected) */}
      {selectedHotspot && (
        <div className="relative z-30 p-5 bg-neutral-900 border-t border-red-500/40 text-pearl flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            {selectedHotspot.detailImage && (
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-xs overflow-hidden border border-white/20 shrink-0 bg-black">
                <img
                  src={selectedHotspot.detailImage}
                  alt={selectedHotspot.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-red-600 text-white font-mono text-[9px] uppercase font-bold tracking-wider">
                  {selectedHotspot.category} COMPONENT
                </span>
                <span className="text-xs font-mono text-silver">
                  FRAMES {selectedHotspot.frameStart}–{selectedHotspot.frameEnd}
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-bold font-display text-white mb-1">
                {selectedHotspot.name}
              </h3>
              <p className="text-xs text-ash max-w-xl mb-2">{selectedHotspot.description}</p>
              {selectedHotspot.specs && (
                <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck size={13} />
                  <span>{selectedHotspot.specs}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
            <button
              onClick={handlePrevHotspot}
              className="p-2 bg-white/5 hover:bg-white/15 border border-white/10 text-silver hover:text-white transition-colors"
              title="Previous component"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNextHotspot}
              className="p-2 bg-white/5 hover:bg-white/15 border border-white/10 text-silver hover:text-white transition-colors"
              title="Next component"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={handleCloseHotspotModal}
              className="p-2 bg-white/5 hover:bg-red-600 text-silver hover:text-white transition-colors"
              title="Close component inspection"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
