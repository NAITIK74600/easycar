import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, X, Shield, Fuel, Gauge, Users, Calendar, Sparkles } from 'lucide-react';
import { A3_PACKAGES, A5_PACKAGES } from '../../utils/pricingEngine';

export const ExceptionalFleet: React.FC = () => {
  const [showPriceTable, setShowPriceTable] = useState<boolean>(false);
  const [selectedTableVehicle, setSelectedTableVehicle] = useState<'a5' | 'a3'>('a5');

  return (
    <>
      <section id="exceptional-fleet" className="relative w-full bg-obsidian py-20 border-t border-white/5 select-none">
        <div className="section-container px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="label-technical text-brand-red text-xs block mb-2 font-mono tracking-[0.24em]">
                OUR FLEET
              </span>
              <h2
                className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-wide uppercase leading-tight"
                style={{ fontFamily: "'Cinzel', Georgia, serif" }}
              >
                EXCEPTIONAL CARS
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowPriceTable(true)}
                className="btn-outline text-xs font-mono py-2.5 px-5 tracking-widest uppercase cursor-pointer"
              >
                PRICING MATRIX
              </button>
              <Link
                to="/fleet"
                className="inline-flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-silver hover:text-white transition-colors py-2.5"
              >
                <span>VIEW ALL VEHICLES</span>
                <ArrowRight size={14} className="text-brand-red" />
              </Link>
            </div>
          </div>

          {/* Editorial Vehicle Cards Grid (2 Vehicles) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ── CARD 1: AUDI A5 SPORTBACK ── */}
            <div className="bg-charcoal border border-white/10 overflow-hidden group hover:border-white/20 transition-all duration-500 flex flex-col justify-between">
              {/* Image Container with Real Photo */}
              <div className="relative aspect-[16/10] overflow-hidden bg-obsidian">
                <img
                  src="/vehicles/audi-a5/a5_01.jpeg"
                  alt="Audi A5 Sportback 3.0 TDI quattro S-Line - Real Photo"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md border border-white/15 px-3 py-1 font-mono text-[10px] text-brand-red uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
                  <span>15 REAL PHOTOS • S-LINE</span>
                </div>
                <div className="absolute bottom-4 right-4 bg-obsidian/90 backdrop-blur-md border border-white/15 px-3.5 py-1.5 font-mono text-right">
                  <span className="block text-[9px] text-silver uppercase tracking-wider">DAILY PACKAGE</span>
                  <span className="text-white font-bold text-sm tracking-wide">
                    CHF {A5_PACKAGES[1].price} <span className="text-silver font-normal text-xs">/ 24h</span>
                  </span>
                </div>
              </div>

              {/* Photo Thumbnail Strip */}
              <div className="grid grid-cols-4 gap-1 p-2 bg-black/60 border-b border-white/10">
                {['/vehicles/audi-a5/a5_02.jpeg', '/vehicles/audi-a5/a5_05.jpeg', '/vehicles/audi-a5/a5_06.jpeg', '/vehicles/audi-a5/a5_07.jpeg'].map((src, i) => (
                  <div key={i} className="aspect-[16/9] overflow-hidden bg-obsidian">
                    <img src={src} alt="Audi A5 Detail" className="w-full h-full object-cover hover:scale-110 transition-transform" />
                  </div>
                ))}
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-baseline justify-between mb-2">
                    <h3 className="font-display font-bold text-xl sm:text-2xl text-white tracking-wide uppercase">
                      Audi A5 Sportback
                    </h3>
                    <span className="font-mono text-xs text-brand-red font-bold">286 PS • quattro</span>
                  </div>
                  <p className="font-mono text-xs text-silver tracking-wider mb-6">
                    3.0 TDI V6 Turbodiesel • Automatik • S-Line Sportsitze & Panorama-Glasdach
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-3 gap-3 p-3 bg-obsidian/80 border border-white/5 font-mono text-xs mb-6">
                    <div>
                      <span className="text-silver block text-[9px] uppercase tracking-wider">INCL. MILEAGE</span>
                      <span className="text-white font-bold">{A5_PACKAGES[1].km} km</span>
                    </div>
                    <div>
                      <span className="text-silver block text-[9px] uppercase tracking-wider">EXTRA KM</span>
                      <span className="text-white font-bold">CHF 0.50/km</span>
                    </div>
                    <div>
                      <span className="text-silver block text-[9px] uppercase tracking-wider">DEPOSIT</span>
                      <span className="text-pearl font-bold">CHF 500</span>
                    </div>
                  </div>
                </div>

                {/* Card CTA Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <a
                    href="#real-gallery"
                    className="inline-flex items-center gap-2 font-mono text-xs font-bold text-white uppercase tracking-[0.16em] group-hover:text-brand-red transition-colors"
                  >
                    <span>VIEW 15 REAL PHOTOS</span>
                    <ArrowRight size={14} className="text-brand-red group-hover:translate-x-1 transition-transform" />
                  </a>

                  <Link
                    to="/booking?vehicle=audi-a5-sportback"
                    className="btn-primary text-xs py-2 px-5 font-mono tracking-wider"
                  >
                    <span>RESERVE</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* ── CARD 2: AUDI A3 SPORTBACK ── */}
            <div className="bg-charcoal border border-white/10 overflow-hidden group hover:border-white/20 transition-all duration-500 flex flex-col justify-between">
              {/* Image Container with Real Photo */}
              <div className="relative aspect-[16/10] overflow-hidden bg-obsidian">
                <img
                  src="/vehicles/audi-a3/a3_01.jpeg"
                  alt="Audi A3 Sportback 1.8 TFSI quattro - Real Photo"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md border border-white/15 px-3 py-1 font-mono text-[10px] text-white uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
                  <span>11 REAL PHOTOS • ALLRAD</span>
                </div>
                <div className="absolute bottom-4 right-4 bg-obsidian/90 backdrop-blur-md border border-white/15 px-3.5 py-1.5 font-mono text-right">
                  <span className="block text-[9px] text-silver uppercase tracking-wider">DAILY PACKAGE</span>
                  <span className="text-white font-bold text-sm tracking-wide">
                    CHF {A3_PACKAGES[1].price} <span className="text-silver font-normal text-xs">/ 24h</span>
                  </span>
                </div>
              </div>

              {/* Photo Thumbnail Strip */}
              <div className="grid grid-cols-4 gap-1 p-2 bg-black/60 border-b border-white/10">
                {['/vehicles/audi-a3/a3_02.jpeg', '/vehicles/audi-a3/a3_04.jpeg', '/vehicles/audi-a3/a3_05.jpeg', '/vehicles/audi-a3/a3_08.jpeg'].map((src, i) => (
                  <div key={i} className="aspect-[16/9] overflow-hidden bg-obsidian">
                    <img src={src} alt="Audi A3 Detail" className="w-full h-full object-cover hover:scale-110 transition-transform" />
                  </div>
                ))}
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-baseline justify-between mb-2">
                    <h3 className="font-display font-bold text-xl sm:text-2xl text-white tracking-wide uppercase">
                      Audi A3 Sportback
                    </h3>
                    <span className="font-mono text-xs text-brand-red font-bold">160 PS • quattro</span>
                  </div>
                  <p className="font-mono text-xs text-silver tracking-wider mb-6">
                    1.8 TFSI Turbobenziner • Manuelles Schaltgetriebe • Allradantrieb & Sitzheizung
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-3 gap-3 p-3 bg-obsidian/80 border border-white/5 font-mono text-xs mb-6">
                    <div>
                      <span className="text-silver block text-[9px] uppercase tracking-wider">INCL. MILEAGE</span>
                      <span className="text-white font-bold">{A3_PACKAGES[1].km} km</span>
                    </div>
                    <div>
                      <span className="text-silver block text-[9px] uppercase tracking-wider">EXTRA KM</span>
                      <span className="text-white font-bold">CHF 0.35/km</span>
                    </div>
                    <div>
                      <span className="text-silver block text-[9px] uppercase tracking-wider">DEPOSIT</span>
                      <span className="text-pearl font-bold">CHF 300</span>
                    </div>
                  </div>
                </div>

                {/* Card CTA Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <Link
                    to="/fleet/audi-a3-sportback"
                    className="inline-flex items-center gap-2 font-mono text-xs font-bold text-white uppercase tracking-[0.16em] group-hover:text-brand-red transition-colors"
                  >
                    <span>EXPLORE AUDI A3</span>
                    <ArrowRight size={14} className="text-brand-red group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/booking?vehicle=audi-a3-sportback"
                    className="btn-primary text-xs py-2 px-5 font-mono tracking-wider"
                  >
                    <span>RESERVE</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Official Swiss Price Matrix Modal ── */}
      {showPriceTable && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
        >
          <div className="bg-charcoal border border-white/15 max-w-3xl w-full p-6 sm:p-8 relative shadow-2xl">
            <button
              onClick={() => setShowPriceTable(false)}
              className="absolute top-6 right-6 text-silver hover:text-white p-2 cursor-pointer"
              aria-label="Close pricing table"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <span className="label-technical text-brand-red text-xs block mb-1">
                OFFICIAL SWISS CONDITIONS
              </span>
              <h3 className="font-display font-bold text-2xl text-white uppercase tracking-wider">
                TRANSPARENT RENTAL PACKAGES
              </h3>
              <p className="text-xs text-silver font-mono mt-1">
                All prices in CHF. Fuel is excluded. Refundable security deposit payable in cash at handover.
              </p>
            </div>

            {/* Vehicle Selector Tabs */}
            <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
              <button
                onClick={() => setSelectedTableVehicle('a5')}
                className={`py-2 px-5 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  selectedTableVehicle === 'a5'
                    ? 'bg-brand-red text-white font-bold'
                    : 'bg-white/5 text-silver hover:text-white'
                }`}
              >
                Audi A5 Sportback (286 PS)
              </button>
              <button
                onClick={() => setSelectedTableVehicle('a3')}
                className={`py-2 px-5 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  selectedTableVehicle === 'a3'
                    ? 'bg-brand-red text-white font-bold'
                    : 'bg-white/5 text-silver hover:text-white'
                }`}
              >
                Audi A3 Sportback (160 PS)
              </button>
            </div>

            {/* Pricing Table */}
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-xs text-left">
                <thead>
                  <tr className="border-b border-white/10 text-silver uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Rental Period</th>
                    <th className="py-3 px-4">Package Price</th>
                    <th className="py-3 px-4">Included Mileage</th>
                    <th className="py-3 px-4 text-right">Extra KM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-pearl">
                  {Object.values(selectedTableVehicle === 'a5' ? A5_PACKAGES : A3_PACKAGES).map((tier) => (
                    <tr key={tier.days} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4 font-bold text-white">{tier.label}</td>
                      <td className="py-3.5 px-4 text-brand-red font-bold">CHF {tier.price}</td>
                      <td className="py-3.5 px-4">{tier.km.toLocaleString()} km</td>
                      <td className="py-3.5 px-4 text-right text-silver">
                        CHF {selectedTableVehicle === 'a5' ? '0.50' : '0.35'}/km
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Bottom Note */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-silver">
              <span>Security Deposit: <strong>CHF {selectedTableVehicle === 'a5' ? '500' : '300'}</strong> (Refunded after inspection)</span>
              <Link
                to={`/booking?vehicle=audi-${selectedTableVehicle}-sportback`}
                onClick={() => setShowPriceTable(false)}
                className="btn-primary text-xs py-2 px-5 font-mono"
              >
                <span>BOOK THIS TIER</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
