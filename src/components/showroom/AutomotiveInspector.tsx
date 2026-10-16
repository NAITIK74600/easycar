import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sparkles,
  ShieldCheck,
  Compass,
  Info,
  Box,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  ComponentHotspot,
  VehicleShowroomConfig,
  AUDI_A5_SHOWROOM_CONFIG,
  AUDI_A3_SHOWROOM_CONFIG,
} from '../../config/showroomHotspots';
import { Studio3DViewer } from './Studio3DViewer';
import { Interactive360SequenceViewer } from './Interactive360SequenceViewer';
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
  // Determine showroom configuration based on vehicle
  const config: VehicleShowroomConfig =
    vehicle?.slug === 'audi-a3-sportback' || vehicle?.id === 'veh-audi-a3'
      ? AUDI_A3_SHOWROOM_CONFIG
      : AUDI_A5_SHOWROOM_CONFIG;

  // Active top-level mode
  const [activeTab, setActiveTab] = useState<'exterior' | 'interior' | 'sequence' | 'studio'>(defaultTab);

  // Active view angle within exterior or interior
  const [selectedExteriorViewIndex, setSelectedExteriorViewIndex] = useState<number>(0);
  const [selectedInteriorViewIndex, setSelectedInteriorViewIndex] = useState<number>(0);

  // Active view configuration
  const currentExteriorView = config.exteriorViews[selectedExteriorViewIndex] || config.exteriorViews[0];
  const currentInteriorView = config.interiorViews[selectedInteriorViewIndex] || config.interiorViews[0];

  const currentView = activeTab === 'exterior' ? currentExteriorView : currentInteriorView;
  const currentHotspots = currentView?.hotspots || [];

  // Pan and Zoom engine state
  const [scale, setScale] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOrigin, setDragOrigin] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Selected hotspot and hovered hotspot
  const [selectedHotspot, setSelectedHotspot] = useState<ComponentHotspot | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<ComponentHotspot | null>(null);

  // Fullscreen high-resolution lightbox modal
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string; subtitle?: string } | null>(null);

  // Container reference for measuring viewport dimensions
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Clamp pan so the image edges never collapse into void
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

  // Reset viewport to full vehicle view
  const handleResetView = useCallback(() => {
    setIsTransitioning(true);
    setScale(1.0);
    setPan({ x: 0, y: 0 });
    setSelectedHotspot(null);
    setTimeout(() => setIsTransitioning(false), 500);
  }, []);

  // Zoom into specific hotspot coordinates smoothly
  const zoomToHotspot = useCallback(
    (spot: ComponentHotspot) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const targetScale = 2.45;

      // Calculate center offset of the hotspot relative to unscaled center
      // spot.x and spot.y are percentage coordinates 0-100
      const normX = spot.x / 100 - 0.5; // -0.5 to +0.5
      const normY = spot.y / 100 - 0.5; // -0.5 to +0.5

      // Base pan to bring the hotspot precisely to center
      let targetPanX = -normX * rect.width * targetScale;
      const targetPanY = -normY * rect.height * targetScale;

      // Smart offset: prevent docked info panel from obscuring the component
      // If hotspot is on the right (x > 50), panel will dock on left.
      // So bias the view slightly rightwards (+120px) so the component stays in open space.
      if (rect.width >= 768) {
        if (spot.x > 50) {
          targetPanX += rect.width * 0.12;
        } else {
          targetPanX -= rect.width * 0.12;
        }
      }

      const clamped = clampPan(targetPanX, targetPanY, targetScale);

      setIsTransitioning(true);
      setScale(targetScale);
      setPan(clamped);
      setSelectedHotspot(spot);
      setTimeout(() => setIsTransitioning(false), 500);
    },
    [clampPan]
  );

  // Handle hotspot click
  const handleSelectHotspot = (spot: ComponentHotspot) => {
    // If the hotspot belongs to a different view image in this tab, switch to that view first!
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

  // Previous and next component navigation within the active view
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

  // Zoom In button
  const handleZoomIn = () => {
    const nextScale = Math.min(3.5, Math.round((scale + 0.4) * 10) / 10);
    const clamped = clampPan(pan.x, pan.y, nextScale);
    setIsTransitioning(true);
    setScale(nextScale);
    setPan(clamped);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Zoom Out button
  const handleZoomOut = () => {
    const nextScale = Math.max(1.0, Math.round((scale - 0.4) * 10) / 10);
    if (nextScale <= 1.0) {
      handleResetView();
    } else {
      const clamped = clampPan(pan.x, pan.y, nextScale);
      setIsTransitioning(true);
      setScale(nextScale);
      setPan(clamped);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  // Pointer Drag events for mouse and touch
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (scale <= 1.0) return;
    // Don't initiate drag if clicking a button or hotspot pin
    if ((e.target as HTMLElement).closest('button')) return;

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

  // Wheel zoom handling
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (activeTab === 'studio') return;
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else if (e.deltaY > 0) {
      handleZoomOut();
    }
  };

  // Keyboard navigation
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

  // When switching tabs, reset view and clear selection
  const handleTabChange = (tab: 'exterior' | 'interior' | 'sequence' | 'studio') => {
    setActiveTab(tab);
    handleResetView();
  };

  // Determine smart placement of the docked info card so it NEVER obscures the selected area
  // If spot.x > 50, dock to LEFT; if spot.x <= 50, dock to RIGHT.
  const isDockedLeft = selectedHotspot ? selectedHotspot.x > 50 : false;

  return (
    <div className={`relative w-full bg-charcoal border border-white/10 shadow-2xl overflow-hidden ${className}`}>
      {/* ── TOP HEADER / TAB NAVIGATION ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-obsidian border-b border-white/10">
        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-xs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'exterior'}
            onClick={() => handleTabChange('exterior')}
            className={`py-2 px-3.5 sm:px-5 uppercase tracking-wider border cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === 'exterior'
                ? 'bg-brand-red text-white border-brand-red font-bold shadow-[0_0_12px_rgba(237,28,46,0.35)]'
                : 'bg-charcoal text-silver border-white/10 hover:text-white hover:border-white/25'
            }`}
          >
            <Compass size={13} className={activeTab === 'exterior' ? 'text-white' : 'text-brand-red'} />
            <span>EXTERIOR EXPLORER</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'interior'}
            onClick={() => handleTabChange('interior')}
            className={`py-2 px-3.5 sm:px-5 uppercase tracking-wider border cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === 'interior'
                ? 'bg-brand-red text-white border-brand-red font-bold shadow-[0_0_12px_rgba(237,28,46,0.35)]'
                : 'bg-charcoal text-silver border-white/10 hover:text-white hover:border-white/25'
            }`}
          >
            <Layers size={13} className={activeTab === 'interior' ? 'text-white' : 'text-brand-red'} />
            <span>INTERIOR COCKPIT</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'sequence'}
            onClick={() => handleTabChange('sequence')}
            className={`py-2 px-3.5 sm:px-5 uppercase tracking-wider border cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === 'sequence'
                ? 'bg-brand-red text-white border-brand-red font-bold shadow-[0_0_12px_rgba(237,28,46,0.35)]'
                : 'bg-charcoal text-silver border-white/10 hover:text-white hover:border-white/25'
            }`}
          >
            <Sparkles size={13} className={activeTab === 'sequence' ? 'text-white' : 'text-brand-red'} />
            <span>CINEMATIC SEQUENCE</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'studio'}
            onClick={() => handleTabChange('studio')}
            className={`py-2 px-3.5 sm:px-5 uppercase tracking-wider border cursor-pointer transition-all flex items-center gap-2 ${
              activeTab === 'studio'
                ? 'bg-brand-red text-white border-brand-red font-bold shadow-[0_0_12px_rgba(237,28,46,0.35)]'
                : 'bg-charcoal text-silver border-white/10 hover:text-white hover:border-white/25'
            }`}
          >
            <Box size={13} className={activeTab === 'studio' ? 'text-white' : 'text-brand-red'} />
            <span>3D STUDIO</span>
          </button>
        </div>

        {/* View Angle Switcher (Only for Photographic Explorer Modes) */}
        {activeTab !== 'studio' && activeTab !== 'sequence' && (
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="text-silver uppercase tracking-widest text-[9px] mr-1 hidden lg:inline">
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
                    className={`px-3 py-1.5 uppercase tracking-wider border cursor-pointer transition-colors ${
                      selectedExteriorViewIndex === idx
                        ? 'border-brand-red text-white bg-white/5 font-bold'
                        : 'border-white/10 text-silver hover:text-white'
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
                    className={`px-3 py-1.5 uppercase tracking-wider border cursor-pointer transition-colors ${
                      selectedInteriorViewIndex === idx
                        ? 'border-brand-red text-white bg-white/5 font-bold'
                        : 'border-white/10 text-silver hover:text-white'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
          </div>
        )}
      </div>

      {/* ── MAIN INSPECTION VIEWPORT ── */}
      <div className="relative w-full h-[520px] md:h-[680px] bg-obsidian overflow-hidden select-none">
        {/* 1. 457-Frame Camera Sequence Mode */}
        {activeTab === 'sequence' && (
          <div className="w-full h-full flex flex-col justify-center bg-black">
            <VehicleFrameSequence
              config={AUDI_A5_HERO_SEQUENCE}
              className="w-full h-full"
              onBookClick={onBookClick}
            />
          </div>
        )}

        {/* 2. 3D WebGL Studio Mode */}
        {activeTab === 'studio' && (
          <Studio3DViewer
            vehicleName={config.vehicleName}
            initialColor={vehicle?.slug === 'audi-a3-sportback' ? '#111215' : '#2c2e33'}
            className="w-full h-full"
          />
        )}

        {/* 3. Photographic Inspection Canvas (Exterior & Interior) */}
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
            {/* Transform Canvas Layer (Scales & Pans Image + Hotspots in exact lockstep) */}
            <div
              className="w-full h-full relative origin-center"
              style={{
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${scale})`,
                transition: isDragging
                  ? 'none'
                  : isTransitioning
                  ? 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)'
                  : 'transform 0.15s ease-out',
                willChange: 'transform',
              }}
            >
              {/* Primary High-Resolution Base Photograph */}
              <img
                src={currentView.image}
                alt={`${config.vehicleName} ${currentView.label}`}
                className="w-full h-full object-cover pointer-events-none select-none"
                draggable={false}
              />

              {/* Interactive Hotspot Nodes */}
              {currentHotspots.map((spot) => {
                const isSelected = selectedHotspot?.id === spot.id;
                const isHovered = hoveredHotspot?.id === spot.id;

                return (
                  <div
                    key={spot.id}
                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto"
                  >
                    {/* Hotspot Target Button */}
                    <button
                      type="button"
                      onClick={() => handleSelectHotspot(spot)}
                      onMouseEnter={() => setHoveredHotspot(spot)}
                      onMouseLeave={() => setHoveredHotspot(null)}
                      onFocus={() => setHoveredHotspot(spot)}
                      onBlur={() => setHoveredHotspot(null)}
                      aria-label={`Inspect ${spot.name}: ${spot.subtitle}`}
                      className="group relative flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2 focus:ring-offset-black"
                    >
                      {/* Outer Pulse Rings */}
                      <span
                        className={`absolute rounded-full transition-all duration-300 ${
                          isSelected
                            ? 'w-9 h-9 bg-brand-red/30 animate-ping'
                            : 'w-7 h-7 bg-brand-red/20 group-hover:scale-125'
                        }`}
                      />
                      <span
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-brand-red border-white scale-110 shadow-[0_0_15px_rgba(237,28,46,0.9)]'
                            : 'bg-black/75 border-brand-red/90 group-hover:bg-brand-red group-hover:border-white shadow-lg'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full transition-colors ${
                            isSelected ? 'bg-white' : 'bg-brand-red group-hover:bg-white'
                          }`}
                        />
                      </span>

                      {/* Hover Tooltip (When not actively zoomed into it) */}
                      {!isSelected && isHovered && (
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 z-40 whitespace-nowrap pointer-events-none animate-fadeIn">
                          <div className="px-3 py-1 bg-black/90 backdrop-blur-md border-l-2 border-l-brand-red border-y border-r border-white/10 shadow-2xl text-[11px] font-mono text-white flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                            <span className="font-semibold tracking-wide">{spot.name}</span>
                          </div>
                          {/* Tooltip caret */}
                          <div className="w-2 h-2 bg-black/90 border-r border-b border-white/10 rotate-45 mx-auto -mt-1" />
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Viewport Vignette Overlay (Pointer events none) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25 pointer-events-none" />

            {/* ── TOP HUD CONTROLS BAR ── */}
            <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
              {/* Active Inspection HUD Status */}
              <div className="flex items-center gap-2 p-2 bg-black/80 backdrop-blur-md border border-white/10 font-mono text-xs text-silver shadow-xl pointer-events-auto">
                <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                <span className="text-[10px] uppercase tracking-widest text-white font-bold">
                  {selectedHotspot ? selectedHotspot.name : currentView.label}
                </span>
                {scale > 1.0 && (
                  <span className="text-[10px] text-brand-red font-bold ml-1 pl-2 border-l border-white/10">
                    {scale.toFixed(1)}X ZOOM
                  </span>
                )}
              </div>

              {/* Floating Zoom and Pan Controls */}
              <div className="flex items-center gap-1.5 p-1 bg-black/80 backdrop-blur-md border border-white/10 shadow-xl pointer-events-auto">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Zoom In (+)"
                  className="p-1.5 text-silver hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Zoom In"
                >
                  <ZoomIn size={15} />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Zoom Out (-)"
                  className="p-1.5 text-silver hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Zoom Out"
                >
                  <ZoomOut size={15} />
                </button>
                <button
                  type="button"
                  onClick={handleResetView}
                  title="Reset Zoom to 1.0x Full View"
                  className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-silver hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Reset View"
                >
                  <RotateCcw size={13} />
                  <span className="hidden sm:inline">1.0X RESET</span>
                </button>
              </div>
            </div>

            {/* ── DOCKED SMART INFORMATION PANEL (Non-Obscuring) ── */}
            {selectedHotspot && (
              <div
                className={`absolute top-16 md:top-20 z-40 max-w-[360px] md:max-w-[400px] w-full transition-all duration-300 animate-fadeIn pointer-events-auto ${
                  isDockedLeft ? 'left-4 sm:left-6' : 'right-4 sm:right-6'
                }`}
              >
                <div className="bg-charcoal/95 backdrop-blur-xl border border-white/15 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.85)] max-h-[520px] overflow-y-auto">
                  {/* Panel Header */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10 mb-3">
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-brand-red font-bold block mb-1">
                        VERIFIED COMPONENT SPECIFICATION
                      </span>
                      <h4 className="font-display text-white text-base md:text-lg font-bold leading-tight">
                        {selectedHotspot.name}
                      </h4>
                      <p className="font-mono text-silver text-[11px] mt-0.5">
                        {selectedHotspot.subtitle}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetView}
                      className="p-1.5 text-silver hover:text-white hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                      title="Close inspection panel"
                      aria-label="Close component panel"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* High-Resolution Verified Close-Up Photography */}
                  {selectedHotspot.closeupImage && (
                    <div className="relative group mb-3 overflow-hidden border border-white/10 bg-obsidian">
                      <img
                        src={selectedHotspot.closeupImage}
                        alt={selectedHotspot.name}
                        loading="lazy"
                        className="w-full h-40 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setLightboxImage({
                            src: selectedHotspot.closeupImage,
                            title: selectedHotspot.name,
                            subtitle: selectedHotspot.subtitle,
                          })
                        }
                        className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/80 backdrop-blur-sm border border-white/15 text-[10px] font-mono text-white flex items-center gap-1.5 hover:bg-brand-red hover:border-brand-red transition-all cursor-pointer shadow-lg"
                      >
                        <Maximize2 size={11} />
                        <span>EXPAND DETAIL</span>
                      </button>
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/75 border border-white/10 text-[9px] font-mono text-silver tracking-widest uppercase">
                        REAL VEHICLE PHOTO
                      </div>
                    </div>
                  )}

                  {/* Technical Description */}
                  <p className="text-ash text-xs leading-relaxed font-light mb-4">
                    {selectedHotspot.description}
                  </p>

                  {/* Verified Technical Specifications Matrix */}
                  {selectedHotspot.verifiedSpecs && (
                    <div className="mb-4 pt-3 border-t border-white/10">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-silver block mb-2 font-bold">
                        FACTORY TELEMETRY & ATTRIBUTES
                      </span>
                      <div className="space-y-1.5">
                        {Object.entries(selectedHotspot.verifiedSpecs).map(([specKey, specVal]) => (
                          <div
                            key={specKey}
                            className="flex items-center justify-between text-[11px] font-mono p-1.5 bg-obsidian/70 border border-white/5"
                          >
                            <span className="text-silver">{specKey}</span>
                            <span className="text-white font-semibold text-right">{specVal}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Booking-Related Note */}
                  {selectedHotspot.bookingNote && (
                    <div className="mb-4 p-2.5 bg-brand-red/10 border-l-2 border-l-brand-red border border-white/5 flex items-start gap-2">
                      <ShieldCheck size={14} className="text-brand-red shrink-0 mt-0.5" />
                      <p className="text-[11px] font-mono text-pearl leading-snug">
                        {selectedHotspot.bookingNote}
                      </p>
                    </div>
                  )}

                  {/* Panel Footer: Previous / Next Component & Full View Reset */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/10 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleNavigateHotspot('prev')}
                        className="px-2.5 py-1.5 bg-obsidian border border-white/10 text-silver hover:text-white hover:border-white/30 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Inspect previous component"
                        aria-label="Previous component"
                      >
                        <ChevronLeft size={13} />
                        <span>PREV</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavigateHotspot('next')}
                        className="px-2.5 py-1.5 bg-obsidian border border-white/10 text-silver hover:text-white hover:border-white/30 flex items-center gap-1 cursor-pointer transition-colors"
                        title="Inspect next component"
                        aria-label="Next component"
                      >
                        <span>NEXT</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetView}
                      className="px-3 py-1.5 text-[10px] text-brand-red hover:text-white hover:underline uppercase tracking-wider font-bold cursor-pointer"
                    >
                      FULL VIEW
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Left Quick Hotspot Strip (Visible when not zoomed into a single spot) */}
            {!selectedHotspot && (
              <div className="absolute bottom-4 left-4 right-4 z-30 pointer-events-none">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pointer-events-auto">
                  <span className="text-[10px] font-mono text-silver uppercase tracking-wider px-2 py-1 bg-black/80 backdrop-blur-sm border border-white/10 shrink-0 hidden md:inline">
                    SELECT COMPONENT TO INSPECT:
                  </span>
                  {currentHotspots.map((spot) => (
                    <button
                      key={spot.id}
                      type="button"
                      onClick={() => handleSelectHotspot(spot)}
                      className="px-3 py-1 bg-black/80 backdrop-blur-md border border-white/10 text-silver hover:text-white hover:border-brand-red text-[11px] font-mono whitespace-nowrap transition-colors cursor-pointer shrink-0"
                    >
                      {spot.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── FOOTER SPECIFICATION & CALL TO ACTION STRIP ── */}
      <div className="p-4 bg-obsidian border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs font-mono text-silver">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
            <span className="text-white font-bold">{config.vehicleName}</span>
          </div>
          <span className="text-white/20">|</span>
          <span className="text-[11px]">Pieterlen / Biel-Bienne, Switzerland</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetView}
            className="px-4 py-2 border border-white/10 text-silver hover:text-white font-mono text-xs uppercase tracking-wider cursor-pointer transition-colors"
          >
            RESET INSPECTOR
          </button>
          {onBookClick ? (
            <button
              type="button"
              onClick={onBookClick}
              className="btn-primary py-2 px-6 font-mono text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <span>RESERVE THIS VEHICLE</span>
              <ArrowRight size={13} />
            </button>
          ) : (
            <a
              href={`/booking?vehicle=${vehicle?.slug || 'audi-a5-sportback'}`}
              className="btn-primary py-2 px-6 font-mono text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <span>RESERVE THIS VEHICLE</span>
              <ArrowRight size={13} />
            </a>
          )}
        </div>
      </div>

      {/* ── FULLSCREEN HIGH-RESOLUTION LIGHTBOX MODAL ── */}
      {lightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6 lg:p-8 animate-fadeIn"
        >
          {/* Lightbox Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 max-w-6xl w-full mx-auto">
            <div>
              <span className="font-mono text-xs text-brand-red tracking-widest uppercase font-bold block mb-0.5">
                HIGH RESOLUTION COMPONENT PHOTOGRAPH
              </span>
              <h3 className="font-display text-white text-xl sm:text-2xl font-bold">
                {lightboxImage.title}
              </h3>
              {lightboxImage.subtitle && (
                <p className="font-mono text-silver text-xs">{lightboxImage.subtitle}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="p-2 text-silver hover:text-white border border-white/10 bg-charcoal hover:border-white/30 transition-colors cursor-pointer"
              aria-label="Close fullscreen view"
            >
              <X size={20} />
            </button>
          </div>

          {/* Lightbox Image Viewport */}
          <div className="my-auto max-w-5xl max-h-[75vh] w-full mx-auto flex items-center justify-center p-2">
            <img
              src={lightboxImage.src}
              alt={lightboxImage.title}
              className="max-h-[72vh] max-w-full object-contain border border-white/10 shadow-2xl"
            />
          </div>

          {/* Lightbox Footer */}
          <div className="max-w-6xl w-full mx-auto pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-silver">
            <span>Verified Easy Cars Biel fleet asset</span>
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="text-white hover:text-brand-red underline cursor-pointer"
            >
              Press ESC or click to return
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
