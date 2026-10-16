import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, X, Maximize2, Shield, Sparkles, Sliders, Eye } from 'lucide-react';

export const VehicleShowcasePanels: React.FC = () => {
  const [interiorModalOpen, setInteriorModalOpen] = useState<boolean>(false);
  const [selectedHotspot, setSelectedHotspot] = useState<number | null>(null);

  const interiorFeatures = [
    {
      id: 1,
      name: 'Audi Virtual Cockpit',
      desc: '12.3-inch high-resolution digital instrument cluster with navigation map view and S-Line telemetry.',
      coords: 'top-[36%] left-[38%]',
    },
    {
      id: 2,
      name: 'S-Line Sport Leather Steering Wheel',
      desc: 'Multifunction flat-bottom leather sport steering wheel with shift paddles and tactile controls.',
      coords: 'top-[62%] left-[43%]',
    },
    {
      id: 3,
      name: 'MMI Navigation Plus & Apple CarPlay',
      desc: 'High-definition touchscreen display with real-time Swiss GPS, Bluetooth, AUX/USB and smartphone mirroring.',
      coords: 'top-[34%] left-[68%]',
    },
    {
      id: 4,
      name: 'Driver Massage & Sports Seats',
      desc: 'Ergonomic heated sports seats with pneumatic lumbar support and integrated multi-program massage functions.',
      coords: 'top-[78%] left-[76%]',
    },
  ];

  return (
    <>
      <section className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-20 select-none">
        {/* Two-Column Split Editorial Panels matching the Reference Image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* ── PANEL 1: AUDI A5 PERFORMANCE MEETS COMFORT ── */}
          <div className="relative group bg-charcoal border border-white/10 overflow-hidden min-h-[520px] lg:min-h-[600px] flex flex-col justify-between p-6 sm:p-8 lg:p-10 transition-all duration-500 hover:border-white/20">
            {/* Background Image: Rear Three-Quarter Audi A5 */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src="/assets/cinematic/audi_a5_rear.jpg"
                alt="Audi A5 Sportback rear three-quarter view with red neon reflection on wet tarmac"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out brightness-[0.88]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/60 to-black/70 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-obsidian/80 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Top Label & Counter */}
            <div className="relative z-10 flex items-center justify-between text-silver font-mono text-xs">
              <span className="text-[10px] tracking-[0.24em] uppercase text-silver">
                AUDI A5 SPORTBACK
              </span>
              <span className="text-[11px] font-bold tracking-widest text-silver">
                01 <span className="text-white/30">/</span> 02
              </span>
            </div>

            {/* Middle Content */}
            <div className="relative z-10 my-auto max-w-md py-8">
              <h3
                className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-white tracking-wide uppercase leading-tight mb-4"
                style={{ fontFamily: "'Cinzel', Georgia, serif" }}
              >
                PERFORMANCE <br />
                <span className="text-pearl">MEETS COMFORT</span>
              </h3>
              <p className="text-ash text-xs sm:text-sm font-light leading-relaxed mb-6">
                A perfect blend of sportiness and elegance. The Audi A5 Sportback delivers an unforgettable driving experience across Swiss passes and urban centres.
              </p>
              <Link
                to="/fleet/audi-a5-sportback"
                className="inline-flex items-center gap-2 font-mono text-xs font-bold text-white uppercase tracking-[0.18em] group-hover:text-brand-red transition-colors"
              >
                <span>VIEW DETAILS</span>
                <ArrowRight size={14} className="text-brand-red group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Bottom Technical Specifications Strip (Verified Data) */}
            <div className="relative z-10 pt-4 border-t border-white/10 grid grid-cols-4 gap-2 font-mono text-center">
              <div className="p-1">
                <span className="block text-white font-bold text-xs sm:text-sm tracking-wider">
                  286 PS
                </span>
                <span className="block text-[8px] sm:text-[9px] text-silver tracking-[0.2em] uppercase mt-0.5">
                  POWER
                </span>
              </div>
              <div className="p-1 border-l border-white/10">
                <span className="block text-white font-bold text-xs sm:text-sm tracking-wider">
                  quattro
                </span>
                <span className="block text-[8px] sm:text-[9px] text-silver tracking-[0.2em] uppercase mt-0.5">
                  DRIVE
                </span>
              </div>
              <div className="p-1 border-l border-white/10">
                <span className="block text-white font-bold text-xs sm:text-sm tracking-wider">
                  S-Line
                </span>
                <span className="block text-[8px] sm:text-[9px] text-silver tracking-[0.2em] uppercase mt-0.5">
                  DESIGN
                </span>
              </div>
              <div className="p-1 border-l border-white/10">
                <span className="block text-white font-bold text-xs sm:text-sm tracking-wider">
                  3.0 TDI
                </span>
                <span className="block text-[8px] sm:text-[9px] text-silver tracking-[0.2em] uppercase mt-0.5">
                  EFFICIENCY
                </span>
              </div>
            </div>
          </div>

          {/* ── PANEL 2: AUDI COCKPIT CRAFTED FOR EVERY DRIVE ── */}
          <div className="relative group bg-charcoal border border-white/10 overflow-hidden min-h-[520px] lg:min-h-[600px] flex flex-col justify-between p-6 sm:p-8 lg:p-10 transition-all duration-500 hover:border-white/20">
            {/* Background Image: Audi Interior Virtual Cockpit */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src="/assets/cinematic/audi_interior.jpg"
                alt="Audi Virtual Cockpit and S-Line Sport Interior"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out brightness-[0.88]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/60 to-black/70 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-obsidian/80 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Top Label & Counter */}
            <div className="relative z-10 flex items-center justify-between text-silver font-mono text-xs">
              <span className="text-[10px] tracking-[0.24em] uppercase text-silver">
                EXPLORE THE INTERIOR
              </span>
              <span className="text-[11px] font-bold tracking-widest text-silver">
                02 <span className="text-white/30">/</span> 02
              </span>
            </div>

            {/* Middle Content */}
            <div className="relative z-10 my-auto max-w-md py-8">
              <h3
                className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-white tracking-wide uppercase leading-tight mb-4"
                style={{ fontFamily: "'Cinzel', Georgia, serif" }}
              >
                CRAFTED FOR <br />
                <span className="text-pearl">EVERY DRIVE</span>
              </h3>
              <p className="text-ash text-xs sm:text-sm font-light leading-relaxed mb-6">
                Premium materials, modern technology and a driver-focused cockpit designed for comfort and control. Massagesitze, panoramic roof, and virtual instrumentation.
              </p>
              <button
                type="button"
                onClick={() => setInteriorModalOpen(true)}
                className="inline-flex items-center gap-2 font-mono text-xs font-bold text-white uppercase tracking-[0.18em] group-hover:text-brand-red transition-colors cursor-pointer"
              >
                <span>VIEW INTERIOR</span>
                <ArrowRight size={14} className="text-brand-red group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Bottom Quick Feature Highlights */}
            <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between font-mono text-xs text-silver">
              <span className="flex items-center gap-2">
                <Sparkles size={13} className="text-brand-red" />
                <span className="text-[10px] uppercase tracking-wider text-pearl">
                  Virtual Cockpit • Massagesitze • Apple CarPlay
                </span>
              </span>
              <button
                onClick={() => setInteriorModalOpen(true)}
                className="text-[10px] uppercase tracking-widest text-silver hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <Maximize2 size={12} />
                <span>EXPAND</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── High-Resolution Interior Lightbox & Interactive Hotspot Modal ── */}
      {interiorModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6 lg:p-8 animate-fadeIn"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 max-w-7xl w-full mx-auto">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-brand-red tracking-[0.2em] uppercase font-bold">
                AUDI COCKPIT EXPLORER
              </span>
              <span className="text-white/20">|</span>
              <span className="font-mono text-xs text-silver hidden sm:inline">
                Driver-focused ergonomics & S-Line luxury specification
              </span>
            </div>
            <button
              onClick={() => setInteriorModalOpen(false)}
              className="p-2 text-silver hover:text-white hover:bg-white/10 rounded-sm transition-colors cursor-pointer"
              aria-label="Close interior modal"
            >
              <X size={22} />
            </button>
          </div>

          {/* Modal Main Viewport */}
          <div className="relative max-w-6xl w-full mx-auto my-auto aspect-[16/9] max-h-[75vh] rounded-none overflow-hidden border border-white/15 bg-charcoal shadow-2xl">
            <img
              src="/assets/cinematic/audi_interior.jpg"
              alt="Audi Virtual Cockpit High Resolution View"
              className="w-full h-full object-cover"
            />

            {/* Interactive Hotspots */}
            {interiorFeatures.map((feat) => {
              const isSelected = selectedHotspot === feat.id;
              return (
                <div
                  key={feat.id}
                  className={`absolute ${feat.coords} -translate-x-1/2 -translate-y-1/2 z-20`}
                >
                  <button
                    onClick={() => setSelectedHotspot(isSelected ? null : feat.id)}
                    className="relative group p-2 cursor-pointer focus:outline-none"
                    aria-label={`Inspect ${feat.name}`}
                  >
                    <span className="animate-ping absolute inset-0 rounded-full bg-brand-red opacity-70" />
                    <span className="relative flex items-center justify-center w-7 h-7 rounded-full bg-brand-red text-white text-[11px] font-mono font-bold shadow-lg">
                      {feat.id}
                    </span>
                  </button>

                  {/* Hotspot Popover Detail */}
                  {isSelected && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 bg-charcoal/95 backdrop-blur-xl border border-brand-red/40 p-3.5 shadow-2xl z-30 font-mono text-left animate-fadeIn">
                      <div className="flex items-center justify-between text-brand-red text-[10px] font-bold uppercase tracking-wider mb-1">
                        <span>FEATURE {feat.id}</span>
                        <X
                          size={12}
                          className="cursor-pointer hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedHotspot(null);
                          }}
                        />
                      </div>
                      <h4 className="text-white text-xs font-bold mb-1">{feat.name}</h4>
                      <p className="text-silver text-[11px] leading-relaxed font-sans">{feat.desc}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Modal Footer / Hotspot Navigation */}
          <div className="max-w-7xl w-full mx-auto pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-2 text-silver">
              <Eye size={14} className="text-brand-red" />
              <span>Click on the numbered pulses to inspect interior cockpit systems.</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/booking?vehicle=audi-a5-sportback"
                className="btn-primary text-xs py-2 px-5 font-mono"
              >
                <span>BOOK AUDI A5</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
