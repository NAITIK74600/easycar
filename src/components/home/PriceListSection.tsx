import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Info, ArrowRight, ShieldAlert, Sparkles, Clock, AlertCircle } from 'lucide-react';

interface PricingRow {
  period: string;
  price: number;
  km: string;
  effectivePerDay: string;
}

interface VehiclePricing {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  dailyRate: number;
  extraKmRate: string;
  deposit: number;
  rows: PricingRow[];
}

const PRICING_DATA: VehiclePricing[] = [
  {
    id: 'audi-a5-sportback',
    name: 'Audi A5 Sportback 3.0 TDI quattro S-Line',
    badge: 'FLAGSHIP • 286 PS • V6 DIESEL QUATTRO',
    tagline: '2018 Model • Massagesitze, Panoramadach, quattro-Allrad, Apple CarPlay',
    dailyRate: 110,
    extraKmRate: 'CHF 0.50 / km',
    deposit: 500,
    rows: [
      { period: '1 day / 24 hours', price: 110, km: '200 km', effectivePerDay: 'CHF 110.00 / day' },
      { period: '3 days / 72 hours', price: 300, km: '600 km', effectivePerDay: 'CHF 100.00 / day' },
      { period: '7 days', price: 690, km: '1,200 km', effectivePerDay: 'CHF 98.57 / day' },
      { period: '14 days', price: 1190, km: '1,800 km', effectivePerDay: 'CHF 85.00 / day' },
      { period: '30 days', price: 1790, km: '2,500 km', effectivePerDay: 'CHF 59.67 / day' },
    ],
  },
  {
    id: 'audi-a3-sportback',
    name: 'Audi A3 Sportback 1.8 TFSI quattro',
    badge: 'COMPACT • 160 PS • MANUAL QUATTRO',
    tagline: '2011 Model • 5 Türen, Sitzheizung, Klimaanlage, Tempomat, Ganzjahresreifen',
    dailyRate: 65,
    extraKmRate: 'CHF 0.35 / km',
    deposit: 300,
    rows: [
      { period: '1 day / 24 hours', price: 65, km: '150 km', effectivePerDay: 'CHF 65.00 / day' },
      { period: '3 days / 72 hours', price: 180, km: '450 km', effectivePerDay: 'CHF 60.00 / day' },
      { period: '7 days', price: 350, km: '1,000 km', effectivePerDay: 'CHF 50.00 / day' },
      { period: '14 days', price: 590, km: '1,500 km', effectivePerDay: 'CHF 42.14 / day' },
      { period: '30 days', price: 950, km: '2,000 km', effectivePerDay: 'CHF 31.67 / day' },
    ],
  },
];

export const PriceListSection: React.FC = () => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('audi-a5-sportback');

  const activeData = PRICING_DATA.find((v) => v.id === selectedVehicleId) || PRICING_DATA[0];

  return (
    <section id="pricing-matrix" className="relative w-full bg-obsidian section-spacing overflow-hidden border-t border-white/5">
      <div className="section-container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="label-technical text-brand-red text-xs block mb-2 font-mono">
              OFFICIAL TARIFF DOSSIER • PIETERLEN, SWITZERLAND
            </span>
            <h2 className="heading-section font-display">
              TRANSPARENT TARIFFS. <br />
              <span className="text-silver">INCLUDED MILEAGE PACKAGES.</span>
            </h2>
          </div>
          <div className="max-w-md">
            <p className="text-ash text-sm leading-relaxed">
              Official Swiss pricing based strictly on agreed 24-hour packages. Motorway vignette, statutory insurance, and local Swiss service included.
            </p>
          </div>
        </div>

        {/* Vehicle Switcher Tabs */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {PRICING_DATA.map((v) => {
            const isSelected = selectedVehicleId === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setSelectedVehicleId(v.id)}
                className={`py-3.5 px-6 font-mono text-xs uppercase tracking-wider transition-all border cursor-pointer whitespace-nowrap flex items-center gap-3 ${
                  isSelected
                    ? 'bg-brand-red text-white border-brand-red font-bold shadow-lg shadow-brand-red/20'
                    : 'bg-charcoal text-silver border-white/10 hover:border-white/30 hover:text-white'
                }`}
              >
                <span>{v.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-none font-normal ${isSelected ? 'bg-black/30 text-white' : 'bg-white/10 text-pearl'}`}>
                  FROM CHF {v.dailyRate} / 24H
                </span>
              </button>
            );
          })}
        </div>

        {/* Pricing Dossier Table Container */}
        <div className="bg-charcoal border border-white/10 overflow-hidden shadow-2xl mb-8">
          {/* Active Model Header Bar */}
          <div className="p-6 bg-graphite border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-brand-red/20 border border-brand-red/40 text-brand-red text-[10px] font-mono uppercase font-bold">
                  {activeData.badge}
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase font-bold">
                  REFUNDABLE DEPOSIT: CHF {activeData.deposit}
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold font-display text-white">
                {activeData.name}
              </h3>
              <p className="text-xs font-mono text-ash mt-1">
                {activeData.tagline}
              </p>
            </div>

            <div className="text-left md:text-right">
              <span className="text-[10px] font-mono text-silver uppercase block">BASE 24H PACKAGE</span>
              <div className="flex items-baseline gap-1 md:justify-end">
                <span className="text-3xl md:text-4xl font-black font-display text-white">
                  CHF {activeData.dailyRate}
                </span>
                <span className="text-xs font-mono text-silver">/ 24H</span>
              </div>
            </div>
          </div>

          {/* Pricing Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-obsidian/70 text-silver text-[11px] uppercase tracking-wider">
                  <th className="py-4 px-6">Rental Duration</th>
                  <th className="py-4 px-6">Total Price</th>
                  <th className="py-4 px-6">Included Mileage</th>
                  <th className="py-4 px-6 hidden sm:table-cell">Effective Daily Rate</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activeData.rows.map((row, idx) => (
                  <tr
                    key={row.period}
                    className={`transition-colors hover:bg-white/[0.03] ${
                      idx === 0 ? 'bg-brand-red/[0.04]' : ''
                    }`}
                  >
                    <td className="py-4 px-6 font-bold text-white flex items-center gap-2">
                      {idx === 0 && <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />}
                      <span>{row.period}</span>
                    </td>
                    <td className="py-4 px-6 text-brand-red font-black text-sm">
                      CHF {row.price}
                    </td>
                    <td className="py-4 px-6 text-pearl">
                      {row.km}
                    </td>
                    <td className="py-4 px-6 text-silver hidden sm:table-cell">
                      {row.effectivePerDay}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/booking?vehicle=${activeData.id}`}
                        className="inline-flex items-center gap-1.5 py-1.5 px-3.5 bg-obsidian hover:bg-brand-red text-white border border-white/10 hover:border-brand-red text-[10px] tracking-wider transition-all cursor-pointer"
                      >
                        <span>REQUEST</span>
                        <ArrowRight size={11} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Additional Terms Strip */}
          <div className="p-6 bg-obsidian/90 border-t border-white/10 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-charcoal border border-white/5">
              <span className="text-silver block text-[10px] uppercase mb-0.5">ADDITIONAL KILOMETRES</span>
              <strong className="text-brand-red text-sm">{activeData.extraKmRate}</strong>
            </div>

            <div className="p-3 bg-charcoal border border-white/5">
              <span className="text-silver block text-[10px] uppercase mb-0.5">SECURITY DEPOSIT</span>
              <strong className="text-emerald-400 text-sm">CHF {activeData.deposit} in Cash</strong>
              <span className="text-[10px] text-ash block mt-0.5">Separate from rental charges</span>
            </div>

            <div className="p-3 bg-charcoal border border-white/5">
              <span className="text-silver block text-[10px] uppercase mb-0.5">FUEL POLICY</span>
              <strong className="text-white text-sm">Fuel Excluded</strong>
              <span className="text-[10px] text-ash block mt-0.5">Full-to-full return required</span>
            </div>

            <div className="p-3 bg-charcoal border border-white/5">
              <span className="text-silver block text-[10px] uppercase mb-0.5">UNSUPPORTED DURATIONS</span>
              <strong className="text-white text-sm">Individual Quote</strong>
              <span className="text-[10px] text-ash block mt-0.5">For 2, 5, 10 or &gt;30 days</span>
            </div>
          </div>
        </div>

        {/* Policy & Rules Footnote */}
        <div className="p-4 bg-charcoal/60 border border-white/10 flex items-start gap-3 text-xs font-mono text-silver">
          <Info size={16} className="text-brand-red flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-white uppercase block">IMPORTANT TARIFF POLICIES</strong>
            <p className="text-ash leading-relaxed">
              • All rental inquiries are subject to manual owner approval before becoming binding reservations.
            </p>
            <p className="text-ash leading-relaxed">
              • For unsupported durations (e.g., 2, 4, 5, 10 days, or &gt;30 days), an individual quote is issued following request review.
            </p>
            <p className="text-ash leading-relaxed">
              • The refundable security deposit (CHF 300 for Audi A3 / CHF 500 for Audi A5) is payable in cash at pickup and held under contractual terms.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
