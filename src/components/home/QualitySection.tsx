import React from 'react';
import { InspectionData } from '../../types';
import { ShieldCheck, Check, Key, Wrench, Sparkles, AlertCircle } from 'lucide-react';

interface QualitySectionProps {
  inspection?: InspectionData;
}

export const QualitySection: React.FC<QualitySectionProps> = () => {
  return (
    <section className="relative w-full bg-obsidian section-spacing overflow-hidden border-t border-white/5">
      <div className="section-container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="label-technical text-brand-red text-xs block mb-2 font-mono">CHAPTER 02 / VEHICLE STANDARDS</span>
            <h2 className="heading-section font-display">
              EASY CARS STANDARDS. <br />
              <span className="text-silver">AUTHENTIC. VERIFIED. READY.</span>
            </h2>
          </div>
          <div className="max-w-md">
            <p className="text-ash text-sm leading-relaxed">
              At Easy Cars Biel, we ensure every vehicle is thoroughly cleaned, mechanically checked, and prepared for your journey across the Swiss Confederation.
            </p>
          </div>
        </div>

        {/* Quality Points Grid — Clean & Genuine */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1: Keyless 24/7 Access */}
          <div className="card-dark p-6 relative">
            <div className="w-10 h-10 bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red mb-4">
              <Key size={20} />
            </div>
            <h4 className="text-base font-bold text-white mb-2 font-display">24/7 Keyless Pickup</h4>
            <p className="text-xs text-ash leading-relaxed">
              Unlock and start your Audi A5 directly via smartphone Bluetooth at our designated Biel/Bienne and Pieterlen bays anytime day or night.
            </p>
          </div>

          {/* Card 2: Professional Cleanliness */}
          <div className="card-dark p-6 relative">
            <div className="w-10 h-10 bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red mb-4">
              <Sparkles size={20} />
            </div>
            <h4 className="text-base font-bold text-white mb-2 font-display">Sanitized Cabin</h4>
            <p className="text-xs text-ash leading-relaxed">
              Every interior is vacuumed, detailed, and sanitized before your rental. Upholstery, steering wheel, and screens are hand-cleaned.
            </p>
          </div>

          {/* Card 3: Tire & Brake Safety */}
          <div className="card-dark p-6 relative">
            <div className="w-10 h-10 bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red mb-4">
              <Wrench size={20} />
            </div>
            <h4 className="text-base font-bold text-white mb-2 font-display">Tire & Brake Safety</h4>
            <p className="text-xs text-ash leading-relaxed">
              Tires are inspected for legal tread depth (minimum 4mm for Swiss seasonal driving) and correct tire pressure before each handover.
            </p>
          </div>

          {/* Card 4: Swiss Highway Vignette */}
          <div className="card-dark p-6 relative">
            <div className="w-10 h-10 bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red mb-4">
              <ShieldCheck size={20} />
            </div>
            <h4 className="text-base font-bold text-white mb-2 font-display">Vignette & Insurance</h4>
            <p className="text-xs text-ash leading-relaxed">
              Official Swiss motorway vignette is attached. Statutory Swiss comprehensive insurance is included in every daily rate.
            </p>
          </div>
        </div>

        {/* Real Authentic Transparency Banner */}
        <div className="p-4 bg-charcoal/80 border border-white/10 flex items-start gap-3 text-xs font-mono text-silver">
          <AlertCircle size={16} className="text-brand-red flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block uppercase mb-0.5">DIRECT FROM EASY CARS BIEL</strong>
            <span>
              Real vehicle fleet managed locally at Zentralstrasse 4, 2502 Biel/Bienne and Hauptstrasse 12, 2542 Pieterlen. For questions or custom handover requests, contact us directly at +41 79 388 99 97.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
