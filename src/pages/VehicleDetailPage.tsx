import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchVehicle, checkVehicleAvailability } from '../api/client';
import { Vehicle } from '../types';
import { AutomotiveInspector } from '../components/showroom/AutomotiveInspector';
import {
  ShieldCheck,
  Calendar,
  Users,
  Fuel,
  Gauge,
  Check,
  ChevronDown,
  ArrowRight,
  MapPin,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export const VehicleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Availability check states
  const [checkStartDate, setCheckStartDate] = useState<string>('');
  const [checkEndDate, setCheckEndDate] = useState<string>('');
  const [availabilityResult, setAvailabilityResult] = useState<{ available: boolean } | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState<boolean>(false);

  // FAQ Accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      try {
        setLoading(true);
        const data = await fetchVehicle(slug);
        setVehicle(data);
      } catch (err: any) {
        setError(err.message || 'Vehicle not found');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const handleCheckAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !checkStartDate || !checkEndDate) return;
    try {
      setCheckingAvailability(true);
      const res = await checkVehicleAvailability(slug, checkStartDate, checkEndDate);
      setAvailabilityResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const FAQS = [
    {
      q: 'What are the Swiss driver requirements?',
      a: 'Drivers must hold a valid Class B national or international driving licence for a minimum of 1 year. Minimum age is 20 for compact models and 23 for high-performance and SUV models.',
    },
    {
      q: 'How does vehicle pickup and return work?',
      a: 'Upon verified booking confirmation, your vehicle is prepared for pickup at our Biel/Bienne or Pieterlen locations. Convenient handover, key handover, and vehicle orientation are handled seamlessly by our team.',
    },
    {
      q: 'Is Swiss highway vignette and border passage included?',
      a: 'All vehicles come factory equipped with the official Swiss motorway toll vignette. European cross-border passes for France, Germany, Italy, and Austria can be added with a single click during checkout.',
    },
    {
      q: 'What is the deposit and insurance excess?',
      a: 'Comprehensive insurance is included with all rentals. Zero-excess coverage (Comprehensive Shield) is available to eliminate financial liability for damage or theft during your journey.',
    },
  ];

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-obsidian flex items-center justify-center pt-24 text-pearl">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="w-full min-h-screen bg-obsidian flex flex-col items-center justify-center pt-24 text-pearl px-6 text-center">
        <AlertCircle size={48} className="text-accent mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">Vehicle Not Found</h2>
        <p className="text-ash mb-6">The requested vehicle record does not exist or has been archived.</p>
        <Link to="/fleet" className="btn-primary py-3 px-6 text-xs font-mono">
          RETURN TO FLEET
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-obsidian text-pearl pt-28 pb-24">
      <div className="section-container">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs font-mono text-silver mb-8">
          <Link to="/" className="hover:text-white transition-colors">HOME</Link>
          <span>/</span>
          <Link to="/fleet" className="hover:text-white transition-colors">FLEET</Link>
          <span>/</span>
          <span className="text-accent uppercase font-bold">{vehicle.name}</span>
        </div>

        {/* Hero Title & Primary Metric Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/10 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="label-technical text-accent text-xs">
                {vehicle.brand.toUpperCase()} • {vehicle.year} SPECIFICATION
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-mono text-[10px] uppercase">
                READY FOR DEPARTURE
              </span>
            </div>
            <h1 className="heading-hero text-3xl md:text-5xl lg:text-6xl text-white font-display">
              {vehicle.name}
            </h1>
          </div>

          <div className="flex items-end gap-6">
            <div>
              <span className="label-technical text-silver text-[10px] block">STARTING RATE</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl lg:text-5xl font-black font-display text-white">
                  {vehicle.currency} {vehicle.daily_rate}
                </span>
                <span className="text-xs font-mono text-silver">/ DAY</span>
              </div>
            </div>

            <Link
              to={`/booking?vehicle=${vehicle.slug}`}
              className="btn-primary py-4 px-8 text-xs font-mono tracking-widest flex items-center gap-2"
            >
              <span>RESERVE VEHICLE</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Interactive Automotive Inspection Showroom Experience */}
        <div className="mb-14">
          <AutomotiveInspector vehicle={vehicle} />
        </div>

        {/* Specifications Matrix & Live Availability Checker */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          {/* Left 8 Cols: Full Specification Table */}
          <div className="lg:col-span-8 space-y-10">
            <div>
              <span className="label-technical text-accent text-xs block mb-2">TECHNICAL DOSSIER</span>
              <h2 className="heading-subsection text-2xl md:text-3xl text-white mb-6">
                Engineering Specifications
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {Object.entries(vehicle.specifications || {}).map(([key, val]) => {
                  if (typeof val === 'object' || key === 'pricing') return null;
                  return (
                    <div key={key} className="p-4 bg-charcoal border border-white/5">
                      <span className="text-[10px] font-mono text-silver uppercase block mb-1">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm font-mono font-bold text-white block">
                        {String(val)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Verified Pricing & Mileage Tier Matrix */}
              <div className="p-6 bg-charcoal border border-white/10 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="label-technical text-brand-red text-xs block font-mono">
                    OFFICIAL RENTAL TIERS & MILEAGE
                  </span>
                  <span className="text-[10px] font-mono text-silver">
                    EXTRA KM: <strong className="text-brand-red">{vehicle.slug.includes('a5') ? 'CHF 0.50 / km' : 'CHF 0.35 / km'}</strong>
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-silver text-[10px] uppercase">
                        <th className="py-2.5 px-3">Rental Period</th>
                        <th className="py-2.5 px-3">Total Price</th>
                        <th className="py-2.5 px-3">Included Mileage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-[11px]">
                      {(vehicle.slug.includes('a5')
                        ? [
                            { period: '1 day / 24 hours', price: 'CHF 100', km: '200 km (Owner-Approved)' },
                            { period: '3 days / 72 hours', price: 'CHF 280', km: '600 km' },
                            { period: '7 days', price: 'CHF 600', km: '1,200 km' },
                            { period: '14 days', price: 'CHF 1,000', km: '1,800 km' },
                            { period: '30 days', price: 'CHF 1,590', km: '2,500 km' },
                          ]
                        : [
                            { period: '1 day / 24 hours', price: 'CHF 65', km: '150 km' },
                            { period: '3 days / 72 hours', price: 'CHF 180', km: '450 km' },
                            { period: '7 days', price: 'CHF 350', km: '1,000 km' },
                            { period: '14 days', price: 'CHF 590', km: '1,500 km' },
                            { period: '30 days', price: 'CHF 950', km: '2,000 km' },
                          ]
                      ).map((tier) => (
                        <tr key={tier.period} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3 font-bold text-white">{tier.period}</td>
                          <td className="py-2.5 px-3 text-brand-red font-black">{tier.price}</td>
                          <td className="py-2.5 px-3 text-silver">{tier.km}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-[10px] font-mono text-steel mt-4 border-t border-white/5 pt-3">
                  • Fuel is not included (Treibstoff nicht inbegriffen). Mileage allowances apply to the entire rental period.
                </p>
              </div>
            </div>

            {/* Included Features */}
            <div>
              <span className="label-technical text-accent text-xs block mb-2">EQUIPMENT ALLOCATION</span>
              <h3 className="heading-subsection text-xl md:text-2xl text-white mb-4">
                Factory Appointments & Technology
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {vehicle.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-charcoal/50 border border-white/5 text-xs text-pearl">
                    <Check size={14} className="text-accent flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Availability Calendar Check & Location Details */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Availability Form */}
            <div className="p-6 md:p-8 bg-charcoal border border-white/10 shadow-xl">
              <span className="label-technical text-accent text-[10px] block mb-2">REAL-TIME INVENTORY</span>
              <h3 className="text-lg font-bold text-white mb-4">Check Date Availability</h3>

              <form onSubmit={handleCheckAvailability} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="text-silver block mb-1">FROM DATE</label>
                  <input
                    type="date"
                    value={checkStartDate}
                    onChange={(e) => setCheckStartDate(e.target.value)}
                    required
                    className="input-dark py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="text-silver block mb-1">TO DATE</label>
                  <input
                    type="date"
                    value={checkEndDate}
                    onChange={(e) => setCheckEndDate(e.target.value)}
                    required
                    className="input-dark py-2 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={checkingAvailability}
                  className="btn-outline w-full py-3 text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  {checkingAvailability ? <Loader2 size={14} className="animate-spin" /> : <Calendar size={14} className="text-accent" />}
                  <span>VERIFY DATES</span>
                </button>
              </form>

              {availabilityResult && (
                <div className={`mt-4 p-3 border text-xs font-mono ${
                  availabilityResult.available
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-red-950/40 border-red-500/50 text-red-300'
                }`}>
                  {availabilityResult.available ? (
                    <span className="flex items-center gap-1.5 font-bold">
                      <Check size={14} /> VEHICLE IS AVAILABLE FOR SELECTED DATES
                    </span>
                  ) : (
                    <span>Vehicle has conflicting reservations for those dates.</span>
                  )}
                </div>
              )}
            </div>

            {/* Swiss Hub Badge */}
            <div className="p-6 bg-charcoal border border-white/10 text-xs font-mono">
              <span className="label-technical text-silver text-[10px] block mb-2">DEPARTURE HUB</span>
              <h4 className="text-sm font-bold text-white mb-1">{vehicle.location_name || 'Pieterlen Hub'}</h4>
              <p className="text-ash mb-4">{vehicle.location_address || 'Hauptstrasse 12'}, {vehicle.location_city || 'Pieterlen'}</p>
              <div className="flex items-center gap-2 text-accent text-[11px]">
                <ShieldCheck size={14} />
                <span>KEYLESS AUTOMATED DISPATCH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions Accordion */}
        <div className="max-w-3xl mx-auto pt-8 border-t border-white/10">
          <span className="label-technical text-accent text-xs block mb-2 text-center">CLIENT BRIEFING</span>
          <h2 className="heading-subsection text-2xl text-white text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="border border-white/10 bg-charcoal overflow-hidden">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between text-sm font-bold text-white hover:text-accent transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-accent' : 'text-silver'}`} />
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 text-xs text-ash leading-relaxed font-mono border-t border-white/5">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>


    </div>
  );
};
