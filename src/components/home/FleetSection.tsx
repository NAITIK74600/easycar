import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Vehicle } from '../../types';
import { CurtainTransition } from '../cinematic/CurtainTransition';
import { ArrowRight, Users, Fuel, Gauge, Shield, Calendar, ArrowUpRight } from 'lucide-react';

interface FleetSectionProps {
  vehicles: Vehicle[];
}

export const FleetSection: React.FC<FleetSectionProps> = ({ vehicles }) => {
  const [selectedVehicleIndex, setSelectedVehicleIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [targetIndex, setTargetIndex] = useState<number>(0);

  const activeVehicle = vehicles[selectedVehicleIndex] || vehicles[0];

  const handleSwitchVehicle = (index: number) => {
    if (index === selectedVehicleIndex || isTransitioning) return;
    setTargetIndex(index);
    setIsTransitioning(true);
  };

  const handleCurtainMidpoint = () => {
    setSelectedVehicleIndex(targetIndex);
  };

  const handleCurtainComplete = () => {
    setIsTransitioning(false);
  };

  if (!vehicles || vehicles.length === 0) {
    return null;
  }

  return (
    <section id="fleet-showroom" className="relative w-full bg-charcoal section-spacing overflow-hidden border-t border-white/5">
      {/* Curtain Transition Overlay */}
      <CurtainTransition
        isTransitioning={isTransitioning}
        onMidpoint={handleCurtainMidpoint}
        onComplete={handleCurtainComplete}
        label={`TRANSITIONING TO ${vehicles[targetIndex]?.name.toUpperCase()}`}
      />

      <div className="section-container mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="label-technical text-accent text-xs block mb-2 font-mono">CHAPTER 05 / SPATIAL FLEET GALLERY</span>
            <h2 className="heading-section font-display">
              THE SWISS FLEET. <br />
              <span className="text-silver">INDIVIDUAL MASTERPIECES.</span>
            </h2>
          </div>
          <div>
            <Link
              to="/fleet"
              className="btn-outline text-xs font-mono tracking-widest py-3 px-6 flex items-center gap-2"
            >
              <span>EXPLORE ALL {vehicles.length} VEHICLES</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      <div className="section-container">
        {/* Vehicle Identity Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {vehicles.map((v, idx) => {
            const isSelected = selectedVehicleIndex === idx;
            return (
              <button
                key={v.id}
                onClick={() => handleSwitchVehicle(idx)}
                className={`py-3 px-6 text-xs font-mono uppercase tracking-wider transition-all border whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-accent text-obsidian border-accent font-bold shadow-lg'
                    : 'bg-obsidian/60 text-silver border-white/10 hover:border-white/30 hover:text-white'
                }`}
              >
                <span>{v.brand} {v.model}</span>
                <span className="ml-3 text-[10px] opacity-75 font-normal">
                  CHF {v.daily_rate}/d
                </span>
              </button>
            );
          })}
        </div>

        {/* Cinematic Main Stage for Selected Vehicle */}
        {activeVehicle && (
          <div className="grid grid-cols-1 lg:grid-cols-12 bg-obsidian border border-white/10 overflow-hidden shadow-2xl">
            {/* Left Large Vehicle Showcase Visual */}
            <div className="lg:col-span-8 relative min-h-[420px] lg:min-h-[580px] bg-charcoal overflow-hidden group">
              <img
                src={activeVehicle.images[0] || 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1600&q=80'}
                alt={activeVehicle.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-black/30 pointer-events-none" />

              {/* Floating Verified Badge */}
              <div className="absolute top-6 left-6 z-10 flex items-center gap-2 px-3.5 py-1.5 bg-black/80 backdrop-blur-md border border-white/10 text-xs font-mono text-pearl">
                <Shield size={14} className="text-accent" />
                <span className="uppercase tracking-widest text-[10px]">
                  {activeVehicle.location_city ? `${activeVehicle.location_city.toUpperCase()} HUB` : 'SWISS FLEET'}
                </span>
              </div>

              {/* Price Tag Overlay */}
              <div className="absolute bottom-6 left-6 z-10">
                <span className="label-technical text-accent text-[10px] block mb-1">ALL-INCLUSIVE DAILY RATE</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-5xl font-black text-white font-display tracking-tight">
                    {activeVehicle.currency} {activeVehicle.daily_rate}
                  </span>
                  <span className="text-xs font-mono text-silver">/ DAY</span>
                </div>
              </div>
            </div>

            {/* Right Vehicle Specification & Action Dossier */}
            <div className="lg:col-span-4 p-6 md:p-8 flex flex-col justify-between bg-charcoal/80 border-t lg:border-t-0 lg:border-l border-white/10">
              <div>
                <div className="mb-6">
                  <span className="label-technical text-accent text-xs block mb-1">
                    {activeVehicle.category.toUpperCase()} • {activeVehicle.year} MODEL
                  </span>
                  <h3 className="heading-subsection text-white text-2xl md:text-3xl">
                    {activeVehicle.name}
                  </h3>
                </div>

                <p className="text-xs md:text-sm text-ash leading-relaxed mb-6">
                  {activeVehicle.description}
                </p>

                {/* Key Spec Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3 bg-obsidian/70 border border-white/5">
                    <span className="flex items-center gap-1.5 text-[10px] font-mono text-silver uppercase mb-1">
                      <Users size={12} className="text-accent" /> SEATING
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      {activeVehicle.seats} PASSENGERS
                    </span>
                  </div>

                  <div className="p-3 bg-obsidian/70 border border-white/5">
                    <span className="flex items-center gap-1.5 text-[10px] font-mono text-silver uppercase mb-1">
                      <Gauge size={12} className="text-accent" /> GEARBOX
                    </span>
                    <span className="text-xs font-mono font-bold text-white capitalize">
                      {activeVehicle.transmission}
                    </span>
                  </div>

                  <div className="p-3 bg-obsidian/70 border border-white/5">
                    <span className="flex items-center gap-1.5 text-[10px] font-mono text-silver uppercase mb-1">
                      <Fuel size={12} className="text-accent" /> PROPULSION
                    </span>
                    <span className="text-xs font-mono font-bold text-white capitalize">
                      {activeVehicle.fuel_type}
                    </span>
                  </div>

                  <div className="p-3 bg-obsidian/70 border border-white/5">
                    <span className="flex items-center gap-1.5 text-[10px] font-mono text-silver uppercase mb-1">
                      <Calendar size={12} className="text-accent" /> STATUS
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      INSTANT BOOKING
                    </span>
                  </div>
                </div>

                {/* Highlight Features */}
                <div className="mb-6">
                  <span className="label-technical text-[10px] text-steel block mb-2">INCLUDED EQUIPMENT</span>
                  <ul className="space-y-1.5">
                    {activeVehicle.features.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-pearl">
                        <span className="w-1 h-1 rounded-full bg-accent" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  to={`/fleet/${activeVehicle.slug}`}
                  className="btn-outline w-full py-3.5 text-xs font-mono tracking-wider flex items-center justify-center gap-2"
                >
                  <span>VIEW DETAILS</span>
                  <ArrowRight size={14} />
                </Link>

                <Link
                  to={`/booking?vehicle=${activeVehicle.slug}`}
                  className="btn-primary w-full py-3.5 text-xs font-mono tracking-wider flex items-center justify-center gap-2"
                >
                  <span>BOOK NOW</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
