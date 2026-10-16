import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  RotateCcw,
  Play,
  Pause,
  Compass,
  Layers,
  Sparkles,
  Maximize2,
  Info,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
} from 'lucide-react';

interface Interactive360SequenceViewerProps {
  vehicleId?: string;
  vehicleName?: string;
  className?: string;
}

// Available sequence modes
type SequenceAngle = 'exterior-360' | 'side-profile' | 'rear-back' | 'interior-cockpit';

export const Interactive360SequenceViewer: React.FC<Interactive360SequenceViewerProps> = ({
  vehicleId = 'audi-a5',
  vehicleName = 'Audi A5 Sportback 3.0 TDI quattro',
  className = '',
}) => {
  const [activeAngle, setActiveAngle] = useState<SequenceAngle>('exterior-360');
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isAutoSpinning, setIsAutoSpinning] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragStartFrame, setDragStartFrame] = useState<number>(0);

  // Sequences mapped for the 4 perspectives requested by the user:
  // (exterior, side, back, interior)
  const angleSequences: Record<SequenceAngle, { label: string; frames: string[]; description: string }> = {
    'exterior-360': {
      label: 'EXTERIOR 360° TURNTABLE',
      description: 'Continuous exterior turntable walkthrough of the Audi A5 Sportback S-Line.',
      frames: [
        '/assets/vehicles/audi-a5/exterior/a5_01.jpeg', // Front 3/4
        '/assets/vehicles/audi-a5/exterior/a5_04.jpeg', // Front Grille & Matrix Headlights
        '/assets/vehicles/audi-a5/exterior/details/a5_11.jpeg', // Front Fender & Mirror
        '/assets/vehicles/audi-a5/exterior/a5_02.jpeg', // Side Profile
        '/assets/vehicles/audi-a5/exterior/details/a5_10.jpeg', // 19" Alloy Wheel Detail
        '/assets/vehicles/audi-a5/exterior/a5_03.jpeg', // Rear Three-Quarter
        '/assets/vehicles/audi-a5/exterior/details/a5_14.jpeg', // Rear Diffuser & Dual Exhaust
      ],
    },
    'side-profile': {
      label: 'SIDE PROFILE ROTATION',
      description: 'Frameless 4-door coupé silhouette, tornado shoulder crease, and 19-inch bi-color turbine rims.',
      frames: [
        '/assets/vehicles/audi-a5/exterior/a5_02.jpeg',
        '/assets/vehicles/audi-a5/exterior/details/a5_11.jpeg',
        '/assets/vehicles/audi-a5/exterior/details/a5_10.jpeg',
        '/assets/vehicles/audi-a5/exterior/a5_01.jpeg',
      ],
    },
    'rear-back': {
      label: 'BACK & TAILGATE VIEW',
      description: 'Rear LED taillight blade, electric fastback liftback tailgate, and 480L cargo area.',
      frames: [
        '/assets/vehicles/audi-a5/exterior/a5_03.jpeg',
        '/assets/vehicles/audi-a5/exterior/details/a5_14.jpeg',
        '/assets/vehicles/audi-a5/interior/a5_13.jpeg',
      ],
    },
    'interior-cockpit': {
      label: 'INTERIOR COCKPIT PANORAMA',
      description: 'Digital Virtual Cockpit, S-Line flat-bottom sport steering wheel, MMI Touch, and massage sports seats.',
      frames: [
        '/assets/vehicles/audi-a5/interior/a5_05.jpeg', // Cockpit
        '/assets/vehicles/audi-a5/interior/a5_06.jpeg', // MMI Screen
        '/assets/vehicles/audi-a5/interior/a5_12.jpeg', // Center console
        '/assets/vehicles/audi-a5/interior/a5_07.jpeg', // Heated Massage Seats
        '/assets/vehicles/audi-a5/interior/a5_09.jpeg', // Panoramic Sunroof
        '/assets/vehicles/audi-a5/interior/a5_08.jpeg', // Rear cabin
      ],
    },
  };

  const currentSequence = angleSequences[activeAngle];
  const totalFrames = currentSequence.frames.length;

  // Auto spin timer
  useEffect(() => {
    if (!isAutoSpinning) return;
    const interval = setInterval(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % totalFrames);
    }, 1200);
    return () => clearInterval(interval);
  }, [isAutoSpinning, totalFrames]);

  // Handle pointer drag (mouse & touch)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartFrame(currentFrameIndex);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX;
    // Every 40px of drag advances 1 frame
    const frameOffset = Math.round(deltaX / 40);
    let nextIndex = (dragStartFrame - frameOffset) % totalFrames;
    if (nextIndex < 0) nextIndex += totalFrames;
    setCurrentFrameIndex(nextIndex);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleAngleSwitch = (angle: SequenceAngle) => {
    setActiveAngle(angle);
    setCurrentFrameIndex(0);
    setIsAutoSpinning(false);
  };

  const nextFrame = useCallback(() => {
    setCurrentFrameIndex((prev) => (prev + 1) % totalFrames);
  }, [totalFrames]);

  const prevFrame = useCallback(() => {
    setCurrentFrameIndex((prev) => (prev - 1 + totalFrames) % totalFrames);
  }, [totalFrames]);

  return (
    <div className={`relative w-full h-full bg-obsidian flex flex-col justify-between overflow-hidden select-none ${className}`}>
      {/* ── TOP HUD ANGLE SWITCHER ── */}
      <div className="absolute top-4 inset-x-4 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Angle Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-black/85 backdrop-blur-md border border-white/10 shadow-2xl pointer-events-auto">
          {(
            [
              ['exterior-360', 'EXTERIOR 360°'],
              ['side-profile', 'SIDE PROFILE'],
              ['rear-back', 'BACK & TAILGATE'],
              ['interior-cockpit', 'INTERIOR COCKPIT'],
            ] as [SequenceAngle, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleAngleSwitch(key)}
              className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors cursor-pointer ${
                activeAngle === key
                  ? 'bg-brand-red text-white font-bold shadow-md'
                  : 'text-silver hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Telemetry Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-black/85 backdrop-blur-md border border-white/10 text-silver font-mono text-[10px] uppercase tracking-widest shadow-2xl pointer-events-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
          <span>FRAME {currentFrameIndex + 1} / {totalFrames}</span>
        </div>
      </div>

      {/* ── DRAG VIEWPORT ── */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative w-full h-full flex items-center justify-center cursor-ew-resize overflow-hidden ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Active Frame Image */}
        <img
          key={currentSequence.frames[currentFrameIndex]}
          src={currentSequence.frames[currentFrameIndex]}
          alt={`${vehicleName} ${currentSequence.label}`}
          className="w-full h-full object-cover pointer-events-none transition-opacity duration-150 animate-fadeIn"
          draggable={false}
        />

        {/* Ambient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Drag Hint Overlay */}
        {!isDragging && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
            <div className="px-4 py-2 bg-black/80 backdrop-blur-md border border-white/15 text-silver font-mono text-xs uppercase tracking-widest flex items-center gap-2">
              <ChevronLeft size={14} className="text-brand-red" />
              <span>DRAG TO ROTATE 360°</span>
              <ChevronRight size={14} className="text-brand-red" />
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM SCRUBBER & PLAYBACK CONTROLS ── */}
      <div className="absolute bottom-4 inset-x-4 z-30 flex flex-col gap-2 pointer-events-none">
        {/* Scrubber and Frame Stepper */}
        <div className="flex items-center justify-between gap-4 p-2.5 bg-black/85 backdrop-blur-md border border-white/10 shadow-2xl pointer-events-auto">
          {/* Play/Pause Auto-Spin */}
          <button
            type="button"
            onClick={() => setIsAutoSpinning(!isAutoSpinning)}
            className="p-1.5 text-silver hover:text-white hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
            title={isAutoSpinning ? 'Pause rotation' : 'Start auto-spin'}
          >
            {isAutoSpinning ? <Pause size={14} /> : <Play size={14} />}
          </button>

          {/* Stepper Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevFrame}
              className="p-1 text-silver hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Previous frame"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={nextFrame}
              className="p-1 text-silver hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Next frame"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Interactive Frame Slider */}
          <div className="flex-1 flex items-center gap-2 mx-2">
            <input
              type="range"
              min={0}
              max={totalFrames - 1}
              value={currentFrameIndex}
              onChange={(e) => setCurrentFrameIndex(Number(e.target.value))}
              className="w-full accent-brand-red cursor-pointer"
            />
          </div>

          {/* Reset Frame */}
          <button
            type="button"
            onClick={() => setCurrentFrameIndex(0)}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-silver hover:text-white hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline">RESET</span>
          </button>
        </div>

        {/* User Sequence Drop-in Folder Notice */}
        <div className="flex items-center justify-between p-2 bg-charcoal/90 backdrop-blur-md border border-brand-red/30 text-[10px] font-mono text-silver pointer-events-auto">
          <div className="flex items-center gap-2">
            <FolderOpen size={13} className="text-brand-red shrink-0" />
            <span>
              <strong className="text-white">Video Sequence Integration Ready:</strong> Export frames to{' '}
              <code className="text-pearl bg-black/60 px-1 py-0.5 border border-white/10">
                /public/assets/vehicles/{vehicleId}/360/
              </code>
            </span>
          </div>
          <span className="text-brand-red hidden md:inline font-bold">READY FOR DROP-IN</span>
        </div>
      </div>
    </div>
  );
};
