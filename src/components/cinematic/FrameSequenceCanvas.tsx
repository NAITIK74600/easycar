import React, { useEffect, useRef, useState, useCallback } from 'react';
import { formatFrameUrl } from '../../config/cinematicSequences';

interface FrameSequenceCanvasProps {
  directory: string;
  totalFrames: number;
  namingConvention: string;
  poster: string;
  currentFrame: number; // 0-based or 1-based index
  width?: number;
  height?: number;
  className?: string;
  onLoadingProgress?: (progress: number) => void;
  priority?: boolean;
}

export const FrameSequenceCanvas: React.FC<FrameSequenceCanvasProps> = ({
  directory,
  totalFrames,
  namingConvention,
  poster,
  currentFrame,
  width = 1920,
  height = 1080,
  className = '',
  onLoadingProgress,
  priority = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesCache = useRef<Map<number, HTMLImageElement>>(new Map());
  const [hasFrames, setHasFrames] = useState<boolean>(totalFrames > 0);
  const [posterLoaded, setPosterLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const posterImgRef = useRef<HTMLImageElement | null>(null);
  const renderRafRef = useRef<number | null>(null);

  // Preload poster image
  useEffect(() => {
    const img = new Image();
    img.src = poster;
    img.onload = () => {
      posterImgRef.current = img;
      setPosterLoaded(true);
      drawFrame();
    };
    img.onerror = () => {
      setLoadError(true);
    };
  }, [poster]);

  // Frame preloading strategy: load nearest window around current frame
  useEffect(() => {
    if (totalFrames <= 0) {
      setHasFrames(false);
      return;
    }

    setHasFrames(true);
    let loadedCount = 0;
    const cache = imagesCache.current;

    // Load either all (if small) or sliding window of 20 frames around currentFrame
    const windowSize = priority ? totalFrames : Math.min(30, totalFrames);
    const start = Math.max(1, currentFrame - Math.floor(windowSize / 2));
    const end = Math.min(totalFrames, start + windowSize);

    for (let i = start; i <= end; i++) {
      if (!cache.has(i)) {
        const img = new Image();
        const url = formatFrameUrl(directory, namingConvention, i);
        img.src = url;
        img.onload = () => {
          cache.set(i, img);
          loadedCount++;
          if (onLoadingProgress) {
            onLoadingProgress(Math.min(100, Math.round((cache.size / totalFrames) * 100)));
          }
          if (i === currentFrame) {
            drawFrame();
          }
        };
        img.onerror = () => {
          // If 1st frame 404s, gracefully fallback to poster without throwing errors
          if (i === 1 && cache.size === 0) {
            setHasFrames(false);
          }
        };
      }
    }
  }, [directory, totalFrames, namingConvention, currentFrame, priority, onLoadingProgress]);

  // Render method with aspect ratio preservation
  const drawFrame = useCallback(() => {
    if (renderRafRef.current) {
      cancelAnimationFrame(renderRafRef.current);
    }

    renderRafRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Try drawing requested frame, or closest available frame, or poster image
      let targetImg: HTMLImageElement | null = null;
      if (hasFrames && totalFrames > 0) {
        const normalizedIndex = Math.max(1, Math.min(totalFrames, Math.round(currentFrame)));
        targetImg = imagesCache.current.get(normalizedIndex) || null;

        // If exact frame isn't loaded yet, find nearest cached frame
        if (!targetImg && imagesCache.current.size > 0) {
          let closestDiff = Infinity;
          for (const [idx, img] of imagesCache.current.entries()) {
            const diff = Math.abs(idx - normalizedIndex);
            if (diff < closestDiff) {
              closestDiff = diff;
              targetImg = img;
            }
          }
        }
      }

      if (!targetImg && posterImgRef.current && posterLoaded) {
        targetImg = posterImgRef.current;
      }

      if (targetImg && targetImg.complete && targetImg.naturalWidth > 0) {
        // Calculate cover scaling
        const imgWidth = targetImg.naturalWidth;
        const imgHeight = targetImg.naturalHeight;
        const scale = Math.max(displayWidth / imgWidth, displayHeight / imgHeight);
        const x = (displayWidth - imgWidth * scale) / 2;
        const y = (displayHeight - imgHeight * scale) / 2;

        ctx.drawImage(targetImg, x, y, imgWidth * scale, imgHeight * scale);
      } else {
        // Subtle luxury gradient fallback while loading
        const gradient = ctx.createLinearGradient(0, 0, 0, displayHeight);
        gradient.addColorStop(0, '#141414');
        gradient.addColorStop(0.5, '#0a0a0a');
        gradient.addColorStop(1, '#050505');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, displayWidth, displayHeight);
      }

      ctx.restore();
    });
  }, [currentFrame, hasFrames, totalFrames, posterLoaded]);

  useEffect(() => {
    drawFrame();
    return () => {
      if (renderRafRef.current) cancelAnimationFrame(renderRafRef.current);
    };
  }, [drawFrame]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => drawFrame();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawFrame]);

  return (
    <div className={`relative w-full h-full overflow-hidden bg-obsidian ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover block"
        style={{ width: '100%', height: '100%' }}
      />
      {/* Loading state indicator for sequences */}
      {hasFrames && imagesCache.current.size < 5 && (
        <div className="absolute bottom-6 right-6 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded border border-white/10 text-xs font-mono text-silver">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
          <span>INITIALIZING FRAME BUFFER</span>
        </div>
      )}
    </div>
  );
};
