import React from 'react';
import { InteriorExplorer } from '../cinematic/InteriorExplorer';
import { Compass, Sparkles } from 'lucide-react';

export const InteriorSection: React.FC = () => {
  return (
    <section className="relative w-full bg-charcoal section-spacing overflow-hidden border-t border-white/5">
      <div className="section-container mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="label-technical text-accent text-xs block mb-2 font-mono">CHAPTER 03 / INTERIOR SANCTUARY</span>
            <h2 className="heading-section font-display">
              ENTER THE INTERIOR. <br />
              <span className="text-silver">DIGITAL PRECISION & TACTILE CRAFT.</span>
            </h2>
          </div>
          <div className="max-w-md">
            <p className="text-ash text-sm leading-relaxed">
              Step inside the Audi A3 Sportback cabin. Explore interactive zones from the pilot-focused Virtual Cockpit to the modular 1,200L luggage hold.
            </p>
          </div>
        </div>
      </div>

      <div className="section-container">
        <InteriorExplorer />
      </div>
    </section>
  );
};
