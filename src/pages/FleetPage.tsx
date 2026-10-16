import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchVehicles } from '../api/client';
import { Vehicle } from '../types';
import { Users, Fuel, Gauge, ArrowRight, Search, ShieldCheck, Loader2 } from 'lucide-react';

export const FleetPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rate-asc' | 'rate-desc'>('rate-asc');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchVehicles();
        setVehicles(data);
      } catch (err) {
        console.error('Failed to load fleet vehicles:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categories = [
    { id: 'all', label: 'ALL VEHICLES' },
    { id: 'sedan', label: 'SEDAN / SPORTBACK' },
    { id: 'compact', label: 'COMPACT' },
  ];

  const filteredVehicles = vehicles
    .filter((v) => {
      const matchCategory = selectedCategory === 'all' || v.category.toLowerCase().includes(selectedCategory);
      const matchSearch =
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'rate-asc') return a.daily_rate - b.daily_rate;
      return b.daily_rate - a.daily_rate;
    });

  return (
    <div className="w-full min-h-screen bg-obsidian pt-32 pb-24 text-pearl">
      <div className="section-container">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <span className="label-technical text-accent text-xs block mb-2 font-mono">EASY CARS BIEL • OFFICIAL FLEET DIRECTORY</span>
          <h1 className="heading-hero text-4xl md:text-6xl text-white mb-4 font-display">
            OUR FLEET.
          </h1>
          <p className="text-ash text-base md:text-lg leading-relaxed">
            Every vehicle in our Swiss collection represents uncompromising German engineering, verified Swiss maintenance, pre-installed motorway vignette, and transparent daily rates starting from CHF 65/day.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 bg-charcoal border border-white/10 mb-10">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`py-2 px-4 text-xs font-mono tracking-wider uppercase transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === c.id
                    ? 'bg-accent text-obsidian font-bold'
                    : 'text-silver hover:text-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-silver" />
              <input
                type="text"
                placeholder="Search fleet model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-dark pl-9 py-2 text-xs font-mono"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="select-dark py-2 text-xs font-mono"
            >
              <option value="rate-asc">Price: Low to High</option>
              <option value="rate-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Vehicle Cards Grid */}
        {loading ? (
          <div className="py-24 flex items-center justify-center">
            <Loader2 className="animate-spin text-accent" size={36} />
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="py-24 text-center border border-white/10 p-12 bg-charcoal">
            <h3 className="text-xl font-bold text-white mb-2">No Vehicles Match Your Query</h3>
            <p className="text-xs font-mono text-silver mb-6">
              Try adjusting your category filter or search keywords.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="btn-outline text-xs font-mono py-2.5 px-6"
            >
              RESET FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="group card-dark border border-white/10 hover:border-white/20 overflow-hidden flex flex-col justify-between transition-all duration-500 shadow-xl"
              >
                {/* Visual Area */}
                <div className="relative h-72 md:h-80 overflow-hidden bg-obsidian">
                  <img
                    src={vehicle.images[0] || 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80'}
                    alt={vehicle.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-black/30 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-accent uppercase">
                      {vehicle.category}
                    </span>
                    <span className="px-2.5 py-1 bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-mono text-silver uppercase">
                      {vehicle.year}
                    </span>
                  </div>

                  {/* Daily Rate Floating Price */}
                  <div className="absolute bottom-4 left-4 z-10">
                    <span className="text-xs font-mono text-silver block uppercase text-[10px]">DAILY ALL-INCLUSIVE</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black font-display text-white">
                        {vehicle.currency} {vehicle.daily_rate}
                      </span>
                      <span className="text-[10px] font-mono text-silver">/ DAY</span>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 md:p-8 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-accent transition-colors">
                        {vehicle.name}
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                        <ShieldCheck size={14} />
                        <span>VERIFIED</span>
                      </div>
                    </div>

                    <p className="text-xs md:text-sm text-ash leading-relaxed mb-6">
                      {vehicle.description}
                    </p>

                    {/* Spec Metrics */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-obsidian border border-white/5 mb-6 text-xs font-mono text-center">
                      <div>
                        <span className="text-steel text-[10px] block">SEATS</span>
                        <span className="text-white font-bold">{vehicle.seats}</span>
                      </div>
                      <div className="border-x border-white/10">
                        <span className="text-steel text-[10px] block">GEARBOX</span>
                        <span className="text-white font-bold capitalize">{vehicle.transmission}</span>
                      </div>
                      <div>
                        <span className="text-steel text-[10px] block">ENGINE</span>
                        <span className="text-accent font-bold">{vehicle.engine || vehicle.fuel_type}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action CTAs */}
                  <div className="pt-6 border-t border-white/10 flex items-center justify-between gap-4">
                    <Link
                      to={`/fleet/${vehicle.slug}`}
                      className="btn-outline flex-1 py-3 text-xs font-mono tracking-wider flex items-center justify-center gap-2"
                    >
                      <span>SPECIFICATIONS</span>
                      <ArrowRight size={13} />
                    </Link>

                    <Link
                      to={`/booking?vehicle=${vehicle.slug}`}
                      className="btn-primary flex-1 py-3 text-xs font-mono tracking-wider flex items-center justify-center gap-2"
                    >
                      <span>BOOK NOW</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
