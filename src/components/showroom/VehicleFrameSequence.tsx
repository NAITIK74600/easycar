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
  externalProgress?: number;
  onHotspotSelect?: (hotspot: SequenceHotspot | null) => void;
  onBookClick?: () => void;
}

export const VehicleFrameSequence: React.FC<VehicleFrameSequenceProps> = ({
  config = AUDI_A5_HERO_SEQUENCE,
  className = '',
  enableScrollScrub = false,
  initialFrame = 0,
  externalProgress,
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

  // Synchronize with external scroll progress from pinned showroom
  useEffect(() => {
    if (externalProgress !== undefined && !isPlaying) {
      const target = Math.round(externalProgress * (totalFrames - 1));
      seekToFrame(target);
    }
  }, [externalProgress, isPlaying, seekToFrame, totalFrames]);

  // Scroll-driven frame progression when scrolling the page (fallback if external progress is not provided)
  useEffect(() => {
    if (isPlaying || externalProgress !== undefined) return;

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
  }, [isPlaying, externalProgress, seekToFrame, totalFrames]);

  // Mouse wheel frame scrubbing (only active when not using external scroll-pinned track)
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (externalProgress !== undefined) return;
    const delta = Math.sign(e.deltaY) * 3;
    seekToFrame(currentFrameRef.current + delta);
  };

  // Calculate current timestamp formatted mm:ss.ms
  const currentSeconds = (currentFrame / config.fps).toFixed(2);
  const totalSeconds = (totalFrames / config.fps).toFixed(2);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex flex-col bg-black/90 border border-white/10 rounded-sm overflow-hidden select-none transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      } ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* 1. Header Technical HUD Strip (Floating overlay so it takes 0px vertical height from vehicle canvas) */}
      <div className="absolute top-0 left-0 right-0 z-20 flex flex-wrap items-center justify-between px-4 py-2.5 bg-gradient-to-b from-black/85 via-black/40 to-transparent gap-3 pointer-events-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 bg-brand-red/20 text-brand-red font-mono text-[10px] uppercase font-bold tracking-wider border border-brand-red/30 backdrop-blur-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
            DYNAMIC REVEAL
          </span>
          <span className="text-xs font-mono text-white font-bold tracking-wider uppercase drop-shadow-md">
            {config.vehicleName}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-silver pointer-events-auto">
          <div className="flex items-center gap-1.5 text-white/80">
            <span>{currentSeconds}s</span>
            <span className="text-white/40">/</span>
            <span>{totalSeconds}s</span>
          </div>
          <span className="text-white/30">•</span>
          <span className="text-[10px] text-white/60 tracking-wider">
            FRAME {currentFrame + 1}/{totalFrames}
          </span>
          <button
            onClick={toggleFullscreen}
            className="flex items-center justify-center w-6 h-6 rounded-xs bg-white/10 hover:bg-white/25 text-silver hover:text-white transition-colors ml-1 cursor-pointer"
            title="Toggle fullscreen"
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>
      </div>

      {/* 2. Main Canvas Viewport Area — Full width covering black screen with bottom-elevated framing */}
      <div className="relative flex-1 min-h-0 w-full h-full flex items-center justify-center bg-radial from-neutral-900 to-black overflow-hidden cursor-ew-resize">
        <canvas
          ref={canvasRef}
          width={config.width}
          height={config.height}
          style={{ objectPosition: 'center 93%' }}
          className="w-full h-full object-contain sm:object-cover pointer-events-none drop-shadow-2xl"
        />

        {/* Poster / Fallback element before canvas buffers */}
        {!isInitialReady && (
          <img
            src={config.posterUrl}
            alt={config.vehicleName}
            style={{ objectPosition: 'center 93%' }}
            className="absolute inset-0 w-full h-full object-contain sm:object-cover pointer-events-none"
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
