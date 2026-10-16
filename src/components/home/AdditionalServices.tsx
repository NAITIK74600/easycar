import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, UserCheck, ArrowRight, X, Clock, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

export const AdditionalServices: React.FC = () => {
  const navigate = useNavigate();
  const [modalService, setModalService] = useState<'delivery' | 'chauffeur' | null>(null);
  const [serviceAddress, setServiceAddress] = useState<string>('');
  const [serviceDate, setServiceDate] = useState<string>('');
  const [serviceNotes, setServiceNotes] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      // Redirect to booking with query param
      navigate(`/booking?service=${modalService}&address=${encodeURIComponent(serviceAddress)}`);
    }, 1200);
  };

  return (
    <>
      <section className="relative w-full bg-obsidian py-20 border-t border-white/5 select-none">
        <div className="section-container px-4 sm:px-6 lg:px-8">
          {/* Section Heading */}
          <div className="max-w-3xl mb-12">
            <span className="label-technical text-brand-red text-xs block mb-2 font-mono tracking-[0.24em]">
              OPTIONAL UPGRADES
            </span>
            <h2
              className="font-display font-black text-3xl sm:text-4xl text-white tracking-wide uppercase leading-tight mb-4"
              style={{ fontFamily: "'Cinzel', Georgia, serif" }}
            >
              BESPOKE SERVICES
            </h2>
            <p className="text-silver text-sm sm:text-base font-light leading-relaxed">
              Tailored logistical support for business executives, airport arrivals and private events across the Canton of Bern and Northwestern Switzerland.
            </p>
          </div>

          {/* Two Editorial Service Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ── PANEL 1: VEHICLE DELIVERY ── */}
            <div className="bg-charcoal border border-white/10 p-8 sm:p-10 flex flex-col justify-between hover:border-white/20 transition-all duration-300">
              <div>
                <div className="w-12 h-12 rounded-sm bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red mb-6">
                  <Truck size={24} />
                </div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-white tracking-wide uppercase">
                    Vehicle Delivery
                  </h3>
                  <span className="font-mono text-xs font-bold text-brand-red tracking-wider uppercase px-2.5 py-1 bg-brand-red/10 border border-brand-red/20">
                    Price on request
                  </span>
                </div>
                <p className="text-ash text-sm font-light leading-relaxed mb-6">
                  “Request delivery to your preferred address.” Have your Audi A5 or A3 delivered directly to your home, office, hotel or train station in Pieterlen, Biel/Bienne, Bern, or Solothurn.
                </p>
                <div className="text-xs font-mono text-silver space-y-2 border-y border-white/5 py-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                    <span>Individual Swiss kilometer fee calculated upon request</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                    <span>Includes vehicle handover inspection at delivery point</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setModalService('delivery');
                }}
                className="btn-outline text-xs font-mono py-3 px-6 tracking-widest uppercase flex items-center justify-between cursor-pointer group hover:bg-brand-red hover:text-white hover:border-brand-red"
              >
                <span>REQUEST DELIVERY QUOTE</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* ── PANEL 2: CHAUFFEUR SERVICE ── */}
            <div className="bg-charcoal border border-white/10 p-8 sm:p-10 flex flex-col justify-between hover:border-white/20 transition-all duration-300">
              <div>
                <div className="w-12 h-12 rounded-sm bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red mb-6">
                  <UserCheck size={24} />
                </div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-white tracking-wide uppercase">
                    Chauffeur Service
                  </h3>
                  <span className="font-mono text-xs font-bold text-brand-red tracking-wider uppercase px-2.5 py-1 bg-brand-red/10 border border-brand-red/20">
                    Price on request
                  </span>
                </div>
                <p className="text-ash text-sm font-light leading-relaxed mb-6">
                  “Request a vehicle with a chauffeur for your journey.” Professional, discreet driver service for business transfers, diplomatic visits, and special occasions.
                </p>
                <div className="text-xs font-mono text-silver space-y-2 border-y border-white/5 py-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                    <span>Certified Swiss driver with bilingual German / French / English</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                    <span>Subject to owner review & official vehicle capacity authorization</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setModalService('chauffeur');
                }}
                className="btn-outline text-xs font-mono py-3 px-6 tracking-widest uppercase flex items-center justify-between cursor-pointer group hover:bg-brand-red hover:text-white hover:border-brand-red"
              >
                <span>REQUEST CHAUFFEUR QUOTE</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Service Request Inquiry Modal */}
      {modalService && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
        >
          <div className="bg-charcoal border border-white/15 max-w-lg w-full p-6 sm:p-8 relative shadow-2xl">
            <button
              onClick={() => setModalService(null)}
              className="absolute top-6 right-6 text-silver hover:text-white p-2 cursor-pointer"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <span className="label-technical text-brand-red text-xs block mb-1">
                PRICE ON REQUEST
              </span>
              <h3 className="font-display font-bold text-xl text-white uppercase tracking-wider">
                {modalService === 'delivery' ? 'VEHICLE DELIVERY INQUIRY' : 'CHAUFFEUR SERVICE INQUIRY'}
              </h3>
              <p className="text-xs text-silver font-mono mt-1">
                Provide your preferred location and schedule. The owner will respond with a non-binding individual quote.
              </p>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-3 font-mono">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle size={28} />
                </div>
                <h4 className="text-white font-bold text-sm">INQUIRY RECEIVED</h4>
                <p className="text-xs text-silver">
                  Redirecting to rental form to complete your schedule details...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-silver text-[10px] uppercase tracking-wider mb-1">
                    {modalService === 'delivery' ? 'DELIVERY DESTINATION / ADDRESS' : 'PICKUP LOCATION / ITINERARY'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bahnhofstrasse 10, Biel/Bienne or Bern Airport"
                    value={serviceAddress}
                    onChange={(e) => setServiceAddress(e.target.value)}
                    className="w-full bg-obsidian border border-white/10 p-3 text-white focus:outline-none focus:border-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-silver text-[10px] uppercase tracking-wider mb-1">
                    PREFERRED DATE & TIME
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="w-full bg-obsidian border border-white/10 p-3 text-white focus:outline-none focus:border-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-silver text-[10px] uppercase tracking-wider mb-1">
                    ADDITIONAL SPECIFICATIONS
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Luggage requirements, flight numbers, or special instructions"
                    value={serviceNotes}
                    onChange={(e) => setServiceNotes(e.target.value)}
                    className="w-full bg-obsidian border border-white/10 p-3 text-white focus:outline-none focus:border-brand-red"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full btn-primary py-3.5 text-xs font-mono tracking-widest uppercase cursor-pointer"
                  >
                    CONTINUE TO BOOKING REQUEST
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
