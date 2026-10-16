import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Layers,
  Sparkles,
  Box,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ShieldCheck,
  ArrowRight,
  Play,
  Pause,
  MapPin,
  Check,
} from 'lucide-react';
import {
  ComponentHotspot,
  VehicleShowroomConfig,
  AUDI_A5_SHOWROOM_CONFIG,
  AUDI_A3_SHOWROOM_CONFIG,
} from '../../config/showroomHotspots';
import { Studio3DViewer } from './Studio3DViewer';
import { VehicleFrameSequence } from './VehicleFrameSequence';
import { AUDI_A5_HERO_SEQUENCE } from '../../config/vehicleSequences';
import { Vehicle } from '../../types';

interface AutomotiveInspectorProps {
  vehicle?: Vehicle | null;
  className?: string;
  defaultTab?: 'exterior' | 'interior' | 'sequence' | 'studio';
  onBookClick?: () => void;
}

export const AutomotiveInspector: React.FC<AutomotiveInspectorProps> = ({
  vehicle,
  className = '',
  defaultTab = 'exterior',
  onBookClick,
}) => {
  // Determine vehicle configuration
  const isA3 = vehicle?.slug === 'audi-a3-sportback' || vehicle?.id === 'veh-audi-a3';
  const config: VehicleShowroomConfig = isA3 ? AUDI_A3_SHOWROOM_CONFIG : AUDI_A5_SHOWROOM_CONFIG;

  // Authoritative published rental tariffs & deposit
  const vehiclePrice = isA3 ? '65' : '100';
  const vehicleDeposit = isA3 ? '300' : '500';
  const vehicleShortName = isA3 ? 'AUDI A3' : 'AUDI A5';
  const vehicleBookingSlug = isA3 ? 'audi-a3-sportback' : 'audi-a5-sportback';

  // 1. Active Navigation Mode Tab
  const [activeTab, setActiveTab] = useState<'exterior' | 'interior' | 'sequence' | 'studio'>(defaultTab);

  // 2. Active View Angles
  const [selectedExteriorViewIndex, setSelectedExteriorViewIndex] = useState<number>(0);
  const [selectedInteriorViewIndex, setSelectedInteriorViewIndex] = useState<number>(0);

  // Active view and hotspots
  const currentExteriorView = config.exteriorViews[selectedExteriorViewIndex] || config.exteriorViews[0];
  const currentInteriorView = config.interiorViews[selectedInteriorViewIndex] || config.interiorViews[0];
  const currentView = activeTab === 'exterior' ? currentExteriorView : currentInteriorView;
  const currentHotspots = currentView?.hotspots || [];

  // 3. Pan and Zoom Engine State
  const [scale, setScale] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOrigin, setDragOrigin] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // 4. Hotspot Selection & Inspection
  const [selectedHotspot, setSelectedHotspot] = useState<ComponentHotspot | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<ComponentHotspot | null>(null);

  // 5. Fullscreen Detail Lightbox Modal
  const [lightboxImage, setLightboxImage] = useState<{
    src: string;
    title: string;
    subtitle?: string;
    description?: string;
    specs?: Record<string, string>;
  } | null>(null);

  // 6. Timeline and Sequence Progress State
  const [sequenceProgress, setSequenceProgress] = useState<number>(28); // 0 to 100 percentage
  const [isPlayingSequence, setIsPlayingSequence] = useState<boolean>(false);

  // Viewport Container Ref
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Clamp pan so image edges never collapse into empty void
  const clampPan = useCallback(
    (targetX: number, targetY: number, targetScale: number) => {
      if (!containerRef.current || targetScale <= 1.0) {
        return { x: 0, y: 0 };
      }
      const rect = containerRef.current.getBoundingClientRect();
      const maxPanX = (rect.width * (targetScale - 1)) / 2;
      const maxPanY = (rect.height * (targetScale - 1)) / 2;

      return {
        x: Math.max(-maxPanX, Math.min(maxPanX, targetX)),
        y: Math.max(-maxPanY, Math.min(maxPanY, targetY)),
      };
    },
    []
  );

  // Reset viewport to pristine 1.0x full vehicle view
  const handleResetView = useCallback(() => {
    setIsTransitioning(true);
    setScale(1.0);
    setPan({ x: 0, y: 0 });
    setSelectedHotspot(null);
    setTimeout(() => setIsTransitioning(false), 450);
  }, []);

  // Zoom smoothly toward a specific hotspot
  const zoomToHotspot = useCallback(
    (spot: ComponentHotspot) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const targetScale = 2.15;

      // Normalized coordinates (0 to 100) -> (-0.5 to 0.5)
      const normX = spot.x / 100 - 0.5;
      const normY = spot.y / 100 - 0.5;

      // Base pan to center hotspot
      let targetPanX = -normX * rect.width * targetScale;
      const targetPanY = -normY * rect.height * targetScale;

      // On desktop, shift image slightly left so floating panel on the right never obscures the component
      if (rect.width >= 1024) {
        targetPanX -= rect.width * 0.16;
      }

      const clamped = clampPan(targetPanX, targetPanY, targetScale);

      setIsTransitioning(true);
      setScale(targetScale);
      setPan(clamped);
      setSelectedHotspot(spot);
      setTimeout(() => setIsTransitioning(false), 450);
    },
    [clampPan]
  );

  // Select a hotspot (switches view if the hotspot is on another angle)
  const handleSelectHotspot = (spot: ComponentHotspot) => {
    if (activeTab === 'exterior') {
      const viewIndex = config.exteriorViews.findIndex((v) =>
        v.hotspots.some((h) => h.id === spot.id)
      );
      if (viewIndex !== -1 && viewIndex !== selectedExteriorViewIndex) {
        setSelectedExteriorViewIndex(viewIndex);
      }
    } else if (activeTab === 'interior') {
      const viewIndex = config.interiorViews.findIndex((v) =>
        v.hotspots.some((h) => h.id === spot.id)
      );
      if (viewIndex !== -1 && viewIndex !== selectedInteriorViewIndex) {
        setSelectedInteriorViewIndex(viewIndex);
      }
    }

    if (selectedHotspot?.id === spot.id) {
      handleResetView();
    } else {
      zoomToHotspot(spot);
    }
  };

  // Next and Previous component navigation in the floating card
  const handleNavigateHotspot = (direction: 'prev' | 'next') => {
    if (!currentHotspots.length) return;
    const currentIndex = selectedHotspot
      ? currentHotspots.findIndex((h) => h.id === selectedHotspot.id)
      : -1;

    let nextIndex = 0;
    if (direction === 'next') {
      nextIndex = currentIndex < currentHotspots.length - 1 ? currentIndex + 1 : 0;
    } else {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : currentHotspots.length - 1;
    }

    const nextSpot = currentHotspots[nextIndex];
    if (nextSpot) {
      zoomToHotspot(nextSpot);
    }
  };

  // Step zoom in
  const handleZoomIn = () => {
    const nextScale = Math.min(3.2, Math.round((scale + 0.3) * 10) / 10);
    const clamped = clampPan(pan.x, pan.y, nextScale);
    setIsTransitioning(true);
    setScale(nextScale);
    setPan(clamped);
    setTimeout(() => setIsTransitioning(false), 250);
  };

  // Step zoom out
  const handleZoomOut = () => {
    const nextScale = Math.max(1.0, Math.round((scale - 0.3) * 10) / 10);
    if (nextScale <= 1.0) {
      handleResetView();
    } else {
      const clamped = clampPan(pan.x, pan.y, nextScale);
      setIsTransitioning(true);
      setScale(nextScale);
      setPan(clamped);
      setTimeout(() => setIsTransitioning(false), 250);
    }
  };

  // Pointer drag events for smooth panning when zoomed in
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (scale <= 1.0) return;
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) return;

    setIsDragging(true);
    setDragOrigin({ x: e.clientX, y: e.clientY });
    setPanStart({ x: pan.x, y: pan.y });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || scale <= 1.0) return;
    const dx = e.clientX - dragOrigin.x;
    const dy = e.clientY - dragOrigin.y;
    const nextPan = clampPan(panStart.x + dx, panStart.y + dy, scale);
    setPan(nextPan);
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

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (activeTab === 'studio') return;
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else if (e.deltaY > 0) {
      handleZoomOut();
    }
  };

  // Mode tab change
  const handleTabChange = (tab: 'exterior' | 'interior' | 'sequence' | 'studio') => {
    setActiveTab(tab);
    handleResetView();
  };

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxImage) {
        if (e.key === 'Escape') setLightboxImage(null);
        return;
      }
      if (selectedHotspot) {
        if (e.key === 'Escape') handleResetView();
        if (e.key === 'ArrowRight') handleNavigateHotspot('next');
        if (e.key === 'ArrowLeft') handleNavigateHotspot('prev');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedHotspot, lightboxImage, handleResetView, handleNavigateHotspot]);

  // Current selected component index
  const selectedIndex = selectedHotspot
    ? currentHotspots.findIndex((h) => h.id === selectedHotspot.id) + 1
    : 1;
  const totalCount = currentHotspots.length || 3;

  return (
    <div
      className={`relative w-full bg-[#080809] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden select-none ${className}`}
    >
      {/* ── 1. TOP MODE SELECTOR TABS (Reference Design Pill Bar) ── */}
      <div className="relative z-30 w-full pt-4 pb-2 px-4 sm:px-6 flex flex-col items-center gap-3 bg-gradient-to-b from-black/90 to-transparent">
        {/* Sleek Dark Capsule Pill */}
        <div
          role="tablist"
          className="flex items-center gap-1 sm:gap-2 p-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-sm shadow-2xl max-w-full overflow-x-auto scrollbar-none"
        >
          <button
            role="tab"
            aria-selected={activeTab === 'exterior'}
            onClick={() => handleTabChange('exterior')}
            className={`py-2 px-3.5 sm:px-5 font-mono text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'exterior'
                ? 'border-brand-red text-white font-bold bg-white/5 shadow-[0_2px_12px_rgba(225,29,42,0.3)]'
                : 'border-transparent text-silver hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <Compass
              size={13}
              className={activeTab === 'exterior' ? 'text-brand-red' : 'text-silver'}
            />
            <span>EXTERIOR EXPLORER</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'interior'}
            onClick={() => handleTabChange('interior')}
            className={`py-2 px-3.5 sm:px-5 font-mono text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'interior'
                ? 'border-brand-red text-white font-bold bg-white/5 shadow-[0_2px_12px_rgba(225,29,42,0.3)]'
                : 'border-transparent text-silver hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <Layers
              size={13}
              className={activeTab === 'interior' ? 'text-brand-red' : 'text-silver'}
            />
            <span>INTERIOR COCKPIT</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'sequence'}
            onClick={() => handleTabChange('sequence')}
            className={`py-2 px-3.5 sm:px-5 font-mono text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'sequence'
                ? 'border-brand-red text-white font-bold bg-white/5 shadow-[0_2px_12px_rgba(225,29,42,0.3)]'
                : 'border-transparent text-silver hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <Sparkles
              size={13}
              className={activeTab === 'sequence' ? 'text-brand-red' : 'text-silver'}
            />
            <span>CINEMATIC SEQUENCE</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'studio'}
            onClick={() => handleTabChange('studio')}
            className={`py-2 px-3.5 sm:px-5 font-mono text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'studio'
                ? 'border-brand-red text-white font-bold bg-white/5 shadow-[0_2px_12px_rgba(225,29,42,0.3)]'
                : 'border-transparent text-silver hover:text-white hover:bg-white/[0.02]'
            }`}
          >
            <Box
              size={13}
              className={activeTab === 'studio' ? 'text-brand-red' : 'text-silver'}
            />
            <span>360° STUDIO</span>
          </button>
        </div>

        {/* ── 2. VIEW ANGLE SELECTOR SUB-BAR (Reference Mockup) ── */}
        {(activeTab === 'exterior' || activeTab === 'interior') && (
          <div className="flex items-center gap-2 font-mono text-[10px] sm:text-[11px] pt-1">
            <span className="text-silver uppercase tracking-widest text-[9px] mr-1 hidden sm:inline">
              VIEW ANGLE:
            </span>
            {activeTab === 'exterior'
              ? config.exteriorViews.map((v, idx) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setSelectedExteriorViewIndex(idx);
                      handleResetView();
                    }}
                    className={`px-3 py-1 uppercase tracking-wider border transition-all cursor-pointer ${
                      selectedExteriorViewIndex === idx
                        ? 'border-brand-red text-white bg-black/60 font-bold shadow-[0_0_10px_rgba(225,29,42,0.25)]'
                        : 'border-white/10 text-silver hover:text-white bg-black/40'
                    }`}
                  >
                    {v.label}
                  </button>
                ))
              : config.interiorViews.map((v, idx) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setSelectedInteriorViewIndex(idx);
                      handleResetView();
                    }}
                    className={`px-3 py-1 uppercase tracking-wider border transition-all cursor-pointer ${
                      selectedInteriorViewIndex === idx
                        ? 'border-brand-red text-white bg-black/60 font-bold shadow-[0_0_10px_rgba(225,29,42,0.25)]'
                        : 'border-white/10 text-silver hover:text-white bg-black/40'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
          </div>
        )}
      </div>

      {/* ── 3. MAIN CINEMATIC VEHICLE VIEWPORT CANVAS ── */}
      <div className="relative w-full h-[540px] sm:h-[620px] lg:h-[720px] xl:h-[760px] bg-obsidian overflow-hidden">
        {/* Mode A: 457-Frame Cinematic Sequence */}
        {activeTab === 'sequence' && (
          <div className="w-full h-full flex flex-col justify-center bg-black">
            <VehicleFrameSequence
              config={AUDI_A5_HERO_SEQUENCE}
              className="w-full h-full"
              onBookClick={onBookClick}
            />
          </div>
        )}

        {/* Mode B: 3D Studio WebGL Turntable */}
        {activeTab === 'studio' && (
          <Studio3DViewer
            vehicleName={config.vehicleName}
            initialColor={isA3 ? '#111215' : '#2c2e33'}
            className="w-full h-full"
          />
        )}

        {/* Mode C: High-Fidelity Photographic Explorer Canvas */}
        {activeTab !== 'studio' && activeTab !== 'sequence' && (
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            className={`w-full h-full relative overflow-hidden ${
              scale > 1.0 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
            }`}
          >
            {/* Smooth Zoom & Pan Transform Plane */}
            <div
              className="w-full h-full relative origin-center"
              style={{
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${scale})`,
                transition: isDragging
                  ? 'none'
                  : isTransitioning
                  ? 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                  : 'transform 0.12s ease-out',
                willChange: 'transform',
              }}
            >
              {/* Primary High-Resolution Vehicle Photograph */}
              <img
                src={currentView.image}
                alt={`${config.vehicleName} ${currentView.label}`}
                className="w-full h-full object-cover object-center pointer-events-none select-none brightness-[1.02] contrast-[1.04]"
                draggable={false}
              />

              {/* Architectural Studio Lighting & Wet Ground Specular Reflection Emulation */}
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent pointer-events-none" />

              {/* ── Refined Animated Hotspot Markers (Reference Image Style) ── */}
              {currentHotspots.map((spot) => {
                const isSelected = selectedHotspot?.id === spot.id;
                const isHovered = hoveredHotspot?.id === spot.id;

                return (
                  <div
                    key={spot.id}
                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto"
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectHotspot(spot)}
                      onMouseEnter={() => setHoveredHotspot(spot)}
                      onMouseLeave={() => setHoveredHotspot(null)}
                      onFocus={() => setHoveredHotspot(spot)}
                      onBlur={() => setHoveredHotspot(null)}
                      aria-label={`Inspect ${spot.name}`}
                      className="group relative flex items-center justify-center cursor-pointer focus:outline-none"
                    >
                      {/* Outer concentric expanding ripple ring */}
                      <span
                        className={`absolute rounded-full transition-all duration-500 ${
                          isSelected
                            ? 'w-10 h-10 bg-brand-red/35 animate-ping'
                            : 'w-8 h-8 bg-brand-red/20 group-hover:scale-125'
                        }`}
                      />

                      {/* Concentric glowing red ring */}
                      <span
                        className={`w-6 h-6 rounded-full border border-brand-red flex items-center justify-center transition-all duration-300 shadow-[0_0_12px_rgba(225,29,42,0.8)] ${
                          isSelected
                            ? 'bg-brand-red/40 scale-110'
                            : 'bg-black/60 group-hover:bg-brand-red/30'
                        }`}
                      >
                        {/* Solid vibrant red center dot */}
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-red shadow-[0_0_8px_#e11d2a] transition-transform duration-200 group-hover:scale-110" />
                      </span>

                      {/* Hover Tooltip when not actively zoomed into it */}
                      {!isSelected && isHovered && (
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 z-40 whitespace-nowrap pointer-events-none animate-fadeIn">
                          <div className="px-3 py-1 bg-black/95 backdrop-blur-md border border-white/15 text-[10px] font-mono text-white shadow-2xl flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                            <span className="font-bold tracking-wider uppercase">{spot.name}</span>
                          </div>
                          <div className="w-2 h-2 bg-black/95 border-r border-b border-white/15 rotate-45 mx-auto -mt-1" />
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* ── 4. FLOATING COMPONENT DETAIL PANEL (Exact Reference Card) ── */}
            {selectedHotspot && (
              <div className="absolute top-6 right-6 lg:right-10 z-30 w-80 sm:w-96 max-w-[calc(100vw-3rem)] pointer-events-auto transition-all duration-300 animate-fadeIn">
                <div className="bg-black/85 backdrop-blur-xl border border-white/15 p-5 sm:p-6 shadow-[0_15px_50px_rgba(0,0,0,0.9)] text-left">
                  {/* Card Header: 01 / 03 & Arrow Navigation Controls */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                    <span className="font-mono text-xs font-bold text-brand-red tracking-widest">
                      {String(selectedIndex).padStart(2, '0')}{' '}
                      <span className="text-white/30">/</span>{' '}
                      {String(totalCount).padStart(2, '0')}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleNavigateHotspot('prev')}
                        className="p-1 text-silver hover:text-white transition-colors cursor-pointer"
                        title="Previous component"
                        aria-label="Previous component"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavigateHotspot('next')}
                        className="p-1 text-silver hover:text-white transition-colors cursor-pointer"
                        title="Next component"
                        aria-label="Next component"
                      >
                        <ChevronRight size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={handleResetView}
                        className="p-1 text-silver hover:text-brand-red transition-colors cursor-pointer ml-1"
                        title="Close detail panel"
                        aria-label="Close component detail"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Component Title (Cinzel Serif Luxury Typography) */}
                  <h3
                    className="text-white font-display text-xl sm:text-2xl font-bold uppercase tracking-wider leading-tight mb-3"
                    style={{ fontFamily: "'Cinzel', Georgia, serif" }}
                  >
                    {selectedHotspot.name}
                  </h3>

                  {/* High-Resolution Close-Up Photograph */}
                  {selectedHotspot.closeupImage && (
                    <div className="relative group overflow-hidden border border-white/10 mb-3.5 bg-black/50">
                      <img
                        src={selectedHotspot.closeupImage}
                        alt={selectedHotspot.name}
                        className="w-full h-36 sm:h-40 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setLightboxImage({
                            src: selectedHotspot.closeupImage,
                            title: selectedHotspot.name,
                            subtitle: selectedHotspot.subtitle,
                            description: selectedHotspot.description,
                            specs: selectedHotspot.verifiedSpecs,
                          })
                        }
                        className="absolute bottom-2 right-2 p-1.5 bg-black/80 backdrop-blur-sm border border-white/20 text-white hover:text-brand-red transition-colors cursor-pointer"
                        title="Fullscreen view"
                        aria-label="Expand photo"
                      >
                        <Maximize2 size={13} />
                      </button>
                    </div>
                  )}

                  {/* Verified Technical Description */}
                  <p className="text-pearl/80 text-xs sm:text-sm font-light leading-relaxed mb-4">
                    {selectedHotspot.description}
                  </p>

                  {/* Action Link: EXPLORE DETAIL ↗ */}
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxImage({
                        src: selectedHotspot.closeupImage,
                        title: selectedHotspot.name,
                        subtitle: selectedHotspot.subtitle,
                        description: selectedHotspot.description,
                        specs: selectedHotspot.verifiedSpecs,
                      })
                    }
                    className="inline-flex items-center gap-1.5 font-mono text-[11px] text-brand-red hover:text-white uppercase tracking-[0.2em] font-bold transition-colors cursor-pointer group"
                  >
                    <span>EXPLORE DETAIL</span>
                    <span className="text-sm leading-none transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      ↗
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 5. REFINED BOTTOM CONTROL STRIP (Reference Image Style) ── */}
        <div className="absolute bottom-4 left-4 right-4 z-30 pointer-events-none">
          <div className="flex flex-wrap items-center justify-between gap-3 py-2 px-4 bg-black/75 backdrop-blur-md border border-white/10 rounded-sm pointer-events-auto shadow-2xl">
            {/* Left: Play/Pause & Dynamic State Label */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'sequence') {
                    setIsPlayingSequence(!isPlayingSequence);
                  } else {
                    handleResetView();
                  }
                }}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-brand-red text-white transition-colors cursor-pointer"
                title={isPlayingSequence ? 'Pause' : 'Play'}
                aria-label={isPlayingSequence ? 'Pause' : 'Play'}
              >
                {isPlayingSequence ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
              </button>

              <span className="font-mono text-[10px] sm:text-[11px] text-silver tracking-widest uppercase font-bold">
                {activeTab === 'studio'
                  ? 'DRAG TO ROTATE • 360 VIEWPOINTS'
                  : activeTab === 'sequence'
                  ? 'CINEMATIC SEQUENCE • 457 FRAMES'
                  : selectedHotspot
                  ? `${selectedHotspot.name}`
                  : 'INSPECT VEHICLE • CLICK HOTSPOTS'}
              </span>
            </div>

            {/* Center: Precision Graduated Timeline Track with Ticks and Position Indicator */}
            <div className="flex-1 max-w-md mx-2 relative py-2 flex items-center cursor-pointer group">
              {/* Background Tick Marks Ruler */}
              <div className="w-full h-2 flex items-center justify-between px-1 opacity-40 group-hover:opacity-80 transition-opacity">
                {Array.from({ length: 41 }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-[1px] bg-white/40 ${
                      i % 5 === 0 ? 'h-2 bg-white/80' : 'h-1'
                    }`}
                  />
                ))}
              </div>

              {/* Slider Track with Red Indicator */}
              <input
                type="range"
                min={0}
                max={100}
                step={0.5}
                value={sequenceProgress}
                onChange={(e) => setSequenceProgress(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                aria-label="Timeline position"
              />

              {/* Active Red Position Indicator Dot */}
              <span
                style={{ left: `${sequenceProgress}%` }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-brand-red shadow-[0_0_10px_#e11d2a] pointer-events-none transition-all duration-75"
              />
            </div>

            {/* Right: Zoom & Reset Controls */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <div className="flex items-center bg-black/60 border border-white/10 px-1 py-0.5">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="px-2 py-1 text-silver hover:text-white transition-colors cursor-pointer"
                  title="Zoom Out"
                  aria-label="Zoom Out"
                >
                  <ZoomOut size={12} />
                </button>
                <span className="px-2 text-[10px] font-bold text-white tracking-wider">
                  {scale.toFixed(1)}x
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="px-2 py-1 text-silver hover:text-white transition-colors cursor-pointer"
                  title="Zoom In"
                  aria-label="Zoom In"
                >
                  <ZoomIn size={12} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleResetView}
                className="px-2.5 py-1.5 bg-black/60 border border-white/10 hover:border-white/30 text-silver hover:text-white text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reset View"
                aria-label="Reset View"
              >
                <RotateCcw size={11} />
                <span>RESET</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 6. VEHICLE HIGHLIGHTS STRIP (Directly Beneath Main Canvas) ── */}
      <div className="w-full bg-[#0d0e12] border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/10 font-mono">
        {/* Highlight 1: quattro AWD */}
        <div className="p-4 sm:p-5 flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-full bg-black/60 border border-white/10 flex items-center justify-center shrink-0">
            {/* Audi 4-Rings Emulation */}
            <div className="flex items-center -space-x-1">
              <span className="w-2.5 h-2.5 rounded-full border border-white/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full border border-white/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full border border-white/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full border border-white/80 inline-block" />
            </div>
          </div>
          <div>
            <span className="block text-white font-bold text-xs uppercase tracking-wider">
              {isA3 ? 'QUATTRO AWD' : 'QUATTRO AWD'}
            </span>
            <span className="block text-[10px] text-silver tracking-wider uppercase mt-0.5">
              CONFIDENCE IN EVERY DRIVE
            </span>
          </div>
        </div>

        {/* Highlight 2: Sportback Design */}
        <div className="p-4 sm:p-5 flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-full bg-black/60 border border-white/10 flex items-center justify-center shrink-0">
            <span className="w-3.5 h-3.5 border-t-2 border-r-2 border-white/80 rotate-[-45deg] inline-block" />
          </div>
          <div>
            <span className="block text-white font-bold text-xs uppercase tracking-wider">
              SPORTBACK DESIGN
            </span>
            <span className="block text-[10px] text-silver tracking-wider uppercase mt-0.5">
              DYNAMIC AND ELEGANT
            </span>
          </div>
        </div>

        {/* Highlight 3: Premium Interior */}
        <div className="p-4 sm:p-5 flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-full bg-black/60 border border-white/10 flex items-center justify-center shrink-0">
            <Layers size={15} className="text-white/80" />
          </div>
          <div>
            <span className="block text-white font-bold text-xs uppercase tracking-wider">
              PREMIUM INTERIOR
            </span>
            <span className="block text-[10px] text-silver tracking-wider uppercase mt-0.5">
              CRAFTED FOR COMFORT
            </span>
          </div>
        </div>

        {/* Highlight 4: Swiss Location & Booking CTA */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-full bg-black/60 border border-white/10 flex items-center justify-center shrink-0">
              <MapPin size={15} className="text-brand-red" />
            </div>
            <div>
              <span className="block text-white font-bold text-xs uppercase tracking-wider">
                PIETERLEN · SWITZERLAND
              </span>
              <span className="block text-[10px] text-silver tracking-wider uppercase mt-0.5">
                LOCAL PICKUP & PERSONAL SUPPORT
              </span>
            </div>
          </div>

          <Link
            to={`/booking?vehicle=${vehicleBookingSlug}`}
            onClick={onBookClick}
            className="hidden sm:inline-flex items-center gap-2 py-2 px-4 bg-brand-red hover:bg-brand-red-light text-white font-mono text-[11px] font-bold uppercase tracking-wider transition-all shadow-md shrink-0"
          >
            <span>RENT {vehicleShortName}</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* ── 7. FULLSCREEN HIGH-RESOLUTION COMPONENT LIGHTBOX MODAL ── */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8 animate-fadeIn">
          <div className="relative max-w-4xl w-full bg-[#0d0e12] border border-white/15 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 text-silver hover:text-white bg-white/5 border border-white/10 transition-colors cursor-pointer"
              title="Close modal"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="mb-4">
              <span className="font-mono text-[10px] text-brand-red uppercase tracking-[0.2em] font-bold block mb-1">
                VERIFIED VEHICLE SPECIFICATION
              </span>
              <h2
                className="text-white font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide"
                style={{ fontFamily: "'Cinzel', Georgia, serif" }}
              >
                {lightboxImage.title}
              </h2>
              {lightboxImage.subtitle && (
                <p className="font-mono text-silver text-xs mt-1">{lightboxImage.subtitle}</p>
              )}
            </div>

            {/* High-Resolution Photograph */}
            <div className="relative overflow-hidden border border-white/10 mb-6 bg-black">
              <img
                src={lightboxImage.src}
                alt={lightboxImage.title}
                className="w-full max-h-[480px] object-contain mx-auto"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/80 border border-white/10 font-mono text-[10px] text-silver uppercase tracking-widest">
                AUTHENTIC VEHICLE PHOTOGRAPH
              </div>
            </div>

            {/* Description */}
            {lightboxImage.description && (
              <p className="text-pearl/90 text-sm font-light leading-relaxed mb-6">
                {lightboxImage.description}
              </p>
            )}

            {/* Verified Specifications Grid */}
            {lightboxImage.specs && (
              <div className="pt-4 border-t border-white/10 mb-6">
                <span className="font-mono text-[10px] text-silver uppercase tracking-widest block mb-3 font-bold">
                  FACTORY ENGINEERING TELEMETRY
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(lightboxImage.specs).map(([specKey, specVal]) => (
                    <div
                      key={specKey}
                      className="p-2.5 bg-black/50 border border-white/5 flex items-center justify-between font-mono text-xs"
                    >
                      <span className="text-silver">{specKey}</span>
                      <span className="text-white font-bold">{specVal}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Bottom CTA */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10 font-mono text-xs">
              <div className="text-silver text-[11px]">
                Daily Rate: <strong className="text-white">CHF {vehiclePrice} / day</strong> · Deposit:{' '}
                <strong className="text-brand-red">CHF {vehicleDeposit}</strong>
              </div>

              <Link
                to={`/booking?vehicle=${vehicleBookingSlug}`}
                className="btn-primary py-2.5 px-6 font-mono text-xs uppercase tracking-wider flex items-center gap-2"
              >
                <span>RENT {vehicleShortName}</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
