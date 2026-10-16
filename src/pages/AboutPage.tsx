import React from 'react';
import { ShieldCheck, Award, Compass, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-obsidian text-pearl pt-32 pb-24">
      <div className="section-container">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <span className="label-technical text-accent text-xs block mb-2 font-mono">EASY CARS BIEL • www.easycarsbiel.ch</span>
          <h1 className="heading-hero text-4xl md:text-6xl text-white mb-6 font-display">
            DRIVE EXCELLENCE.
          </h1>
          <p className="text-ash text-base md:text-lg leading-relaxed">
            Easy Cars Biel delivers premium German automobile rental in Biel/Bienne and the Bernese Seeland region. Featuring the flagship Audi A5 Sportback and Audi A3 Sportback with transparent pricing and personal Swiss service.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="p-8 bg-charcoal border border-white/10">
            <div className="w-12 h-12 bg-accent/15 border border-accent/40 flex items-center justify-center text-accent mb-6">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Diagnostic Transparency</h3>
            <p className="text-xs md:text-sm text-ash leading-relaxed">
              We never make unsubstantiated safety claims. Every vehicle in our partner registry displays verified OBD-II diagnostic health metrics, certified tread measurements, and authorized service history.
            </p>
          </div>

          <div className="p-8 bg-charcoal border border-white/10">
            <div className="w-12 h-12 bg-accent/15 border border-accent/40 flex items-center justify-center text-accent mb-6">
              <Award size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Pristine Preparation</h3>
            <p className="text-xs md:text-sm text-ash leading-relaxed">
              Each cockpit undergoes hospital-grade ozone sterilization and steam detailing prior to dispatch. Upholstery is hand-conditioned to factory showroom condition.
            </p>
          </div>

          <div className="p-8 bg-charcoal border border-white/10">
            <div className="w-12 h-12 bg-accent/15 border border-accent/40 flex items-center justify-center text-accent mb-6">
              <Compass size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Alpine Pass Ready</h3>
            <p className="text-xs md:text-sm text-ash leading-relaxed">
              All Swiss fleet models feature high-grip performance tires, mandatory high-altitude safety equipment, pre-installed motorway vignettes, and topological offline navigation.
            </p>
          </div>
        </div>

        {/* Rental Requirements & Legal Notice */}
        <div className="p-8 md:p-12 bg-charcoal border border-white/10 mb-12">
          <span className="label-technical text-accent text-xs block mb-2">COMPLIANCE PROTOCOL</span>
          <h2 className="heading-subsection text-2xl text-white mb-6">
            Swiss Rental Conditions & Requirements
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-mono text-ash">
            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase text-[11px] text-pearl">DRIVER ELIGIBILITY</h4>
              <p>• Valid original driver's licence held for minimum 12 months.</p>
              <p>• Minimum age 20 years for compact executive class; 23 years for performance SUV class.</p>
              <p>• International Driving Permit (IDP) required for non-Latin script licences.</p>
            </div>

            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase text-[11px] text-pearl">INSURANCE & DEPOSITS</h4>
              <p>• Swiss Statutory Third Party Liability & Comprehensive Collision Damage included.</p>
              <p>• Standard deductible applies; optional Comprehensive Shield reduces excess to zero.</p>
              <p>• In development mode, security deposits are simulated with zero card pre-authorization.</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link to="/fleet" className="btn-primary py-4 px-10 text-xs font-mono tracking-widest inline-flex items-center gap-2">
            <span>EXPLORE OUR CURATED FLEET</span>
            <Sparkles size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};
