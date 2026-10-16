import React, { useState } from 'react';
import { Hotspot } from '../../types';
import { X, CheckCircle, Maximize2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface VehicleHotspotsProps {
  hotspots?: Hotspot[];
  activeHotspotId?: string | null;
  onSelectHotspot?: (hotspot: Hotspot | null) => void;
  onOpenCloseup?: (hotspot: Hotspot) => void;
  isZoomed?: boolean;
  onResetZoom?: () => void;
}

export const AUDI_A5_EXTERIOR_HOTSPOTS: Hotspot[] = [
  {
    id: 'singleframe-grille',
    title: 'Hexagonal Singleframe Grille',
    subtitle: '3.0 TDI V6 Thermal Dynamics',
    description: 'Sculpted honeycomb architecture with titanium chrome optics and Quattro badging, directing cooling airflow to the 286 PS turbodiesel intercoolers.',
    x: 17.5,
    y: 71.0,
    detailImage: '/assets/vehicles/audi-a5/exterior/details/a5_04.jpeg',
  },
  {
    id: 'headlights',
    title: 'Digital Matrix LED Headlights',
    subtitle: 'Pixel-Precise Adaptive High Beam',
    description: 'Dynamic light staging with signature daytime running lights and anti-dazzle high-beam masking for crystal clear night visibility on Swiss mountain passes.',
    x: 39.5,
    y: 64.0,
    detailImage: '/assets/vehicles/audi-a5/exterior/details/a5_04.jpeg',
  },
  {
    id: 'fender-arch',
    title: 'S-Line Front Fender & Flared Arches',
    subtitle: 'Lightweight Aluminum Construction',
    description: 'Distinctive sculpted wheel arch housing the widened track, adorned with authentic Audi S-Line chrome and matte titanium wing emblem.',
    x: 58.0,
    y: 51.0,
    detailImage: '/assets/vehicles/audi-a5/exterior/details/a5_11.jpeg',
  },
  {
    id: 'wheels',
    title: '19" S-Line Sport Alloy Wheels',
    subtitle: 'quattro Dynamic All-Weather Grip',
    description: '19-inch bi-color turbine alloy rims with certified Swiss high-tread all-season compound, calibrated for wet alpine serpentines and highway precision.',
    x: 59.5,
    y: 76.5,
    detailImage: '/assets/vehicles/audi-a5/exterior/details/a5_10.jpeg',
  },
  {
    id: 'mirrors',
    title: 'Aerodynamic Side Mirrors',
    subtitle: 'Heated & Power Folding with LED Signals',
    description: 'Aero-sculpted exterior mirrors with integrated sweeping LED direction indicators, automatic dimming, and electric defogging heating elements.',
    x: 72.0,
    y: 35.5,
    detailImage: '/assets/vehicles/audi-a5/exterior/details/a5_11.jpeg',
  },
  {
    id: 'side-profile',
    title: 'Tornado Line & Frameless Doors',
    subtitle: 'Aerodynamic Coupé Silhouette',
    description: 'Continuous sharp shoulder crease flowing from headlights to the muscular rear haunches, paired with acoustic double-glazed frameless windows for optimal wind noise suppression.',
    x: 82.5,
    y: 53.0,
    detailImage: '/assets/vehicles/audi-a5/exterior/a5_02.jpeg',
  },
];

export const VehicleHotspots: React.FC<VehicleHotspotsProps> = ({
  hotspots = AUDI_A5_EXTERIOR_HOTSPOTS,
  activeHotspotId,
  onSelectHotspot,
  onOpenCloseup,
  isZoomed = false,
  onResetZoom,
}) => {
  const [internalActiveId, setInternalActiveId] = useState<string | null>(null);
  const activeId = activeHotspotId !== undefined ? activeHotspotId : internalActiveId;
  const activeSpot = hotspots.find((h) => h.id === activeId) || null;

  const handleSelect = (spot: Hotspot) => {
    const next = activeId === spot.id ? null : spot;
    setInternalActiveId(next ? next.id : null);
    if (onSelectHotspot) {
      onSelectHotspot(next);
    }
  };

  const handleClose = () => {
    setInternalActiveId(null);
    if (onSelectHotspot) onSelectHotspot(null);
    if (onResetZoom) onResetZoom();
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* Top Zoom Indicator & Reset Control */}
      {isZoomed && activeSpot && (
        <div className="absolute top-4 right-4 pointer-events-auto z-30 flex items-center gap-2 animate-fadeIn">
          <div className="bg-black/85 backdrop-blur-md border border-brand-red/50 px-3.5 py-1.5 font-mono text-xs text-white flex items-center gap-2 shadow-2xl">
            <span className="w-2 h-2 rounded-full bg-brand-red animate-ping" />
            <span className="font-bold text-[11px] uppercase tracking-wider">
              2.5X ZOOM: {activeSpot.title}
            </span>
          </div>

          <button
            onClick={handleClose}
            className="bg-black/85 hover:bg-brand-red text-white backdrop-blur-md border border-white/20 p-1.5 px-3 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-xl"
            title="Reset Zoom to 1.0x"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">RESET VIEW</span>
          </button>
        </div>
      )}

      {/* Interactive Hotspot Pins */}
      {hotspots.map((spot, index) => {
        const isSelected = activeId === spot.id;
        return (
          <div
            key={spot.id}
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-opacity duration-300 ${
              isZoomed && !isSelected ? 'opacity-40 hover:opacity-100 scale-90' : 'opacity-100'
            }`}
          >
            <button
              onClick={() => handleSelect(spot)}
              aria-label={`Inspect ${spot.title}`}
              className="relative flex items-center justify-center w-8 h-8 rounded-full group cursor-pointer focus:outline-none"
            >
              {/* Outer pulsing ring */}
              <span
                className={`absolute inset-0 rounded-full transition-transform duration-500 ${
                  isSelected
                    ? 'bg-brand-red/50 scale-150 animate-ping'
                    : 'bg-white/20 group-hover:bg-brand-red/40 group-hover:scale-125'
                }`}
              />

              {/* Core numbered button */}
              <span
                className={`relative flex items-center justify-center w-7 h-7 rounded-full border transition-all duration-300 shadow-xl ${
                  isSelected
                    ? 'bg-brand-red text-white border-white scale-125 shadow-brand-red/80'
                    : 'bg-obsidian/95 text-pearl border-white/60 group-hover:border-brand-red group-hover:bg-brand-red group-hover:text-white'
                }`}
              >
                <span className="font-mono text-[11px] font-black">{index + 1}</span>
              </span>

              {/* Hover label hint */}
              {!isSelected && (
                <span className="absolute left-full ml-2.5 px-2.5 py-1 bg-black/90 backdrop-blur-md border border-white/15 text-[10px] font-mono uppercase tracking-wider text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl z-40">
                  {spot.title}
                </span>
              )}
            </button>
          </div>
        );
      })}

      {/* Active Component Inspection Card */}
      {activeSpot && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-[420px] pointer-events-auto animate-fadeIn z-30">
          <div className="bg-charcoal/95 backdrop-blur-2xl border border-brand-red/40 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] relative">
            {/* Top Red Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-red via-brand-red-light to-transparent" />

            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <span className="label-technical text-brand-red text-[10px] block font-mono">
                  {activeSpot.subtitle || 'INSPECTED SPECIFICATION'}
                </span>
                <h4 className="text-lg font-bold text-white tracking-tight font-display mt-0.5">
                  {activeSpot.title}
                </h4>
              </div>
              <button
                onClick={handleClose}
                className="text-silver hover:text-white p-1 transition-colors cursor-pointer"
                aria-label="Close detail modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Thumbnail Preview if available */}
            {activeSpot.detailImage && (
              <div
                onClick={() => onOpenCloseup && onOpenCloseup(activeSpot)}
                className="relative aspect-[16/9] w-full bg-black mb-3 border border-white/10 overflow-hidden cursor-pointer group/thumb"
                title="Click to view full-size component closeup"
              >
                <img
                  src={activeSpot.detailImage}
                  alt={activeSpot.title}
                  className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-2.5">
                  <span className="font-mono text-[10px] text-brand-red uppercase font-bold flex items-center gap-1">
                    <ZoomIn size={12} />
                    <span>INSPECT COMPONENT</span>
                  </span>
                  <span className="p-1 bg-black/60 text-white">
                    <Maximize2 size={12} />
                  </span>
                </div>
              </div>
            )}

            <p className="text-xs text-ash leading-relaxed mb-4 font-sans">
              {activeSpot.description}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
                <CheckCircle size={13} />
                <span>OFFICIAL SPECIFICATION</span>
              </span>

              {activeSpot.detailImage && onOpenCloseup && (
                <button
                  type="button"
                  onClick={() => onOpenCloseup(activeSpot)}
                  className="text-xs font-mono text-brand-red hover:text-white font-bold tracking-wider uppercase transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>FULLSCREEN CLOSEUP</span>
                  <Maximize2 size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
