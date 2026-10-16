import React from 'react';
import { VehicleHotspots } from '../cinematic/VehicleHotspots';
import { CinematicSequence } from '../cinematic/CinematicSequence';
import { CINEMATIC_SEQUENCES } from '../../config/cinematicSequences';
import { Eye, Layers, Sparkles } from 'lucide-react';
import { Hotspot } from '../../types';

const AUDI_A5_EXTERIOR_HOTSPOTS: Hotspot[] = [
  {
    id: 'front-design',
    title: 'S line Singleframe Grille',
    subtitle: 'Titanium Black Honeycomb Architecture',
    description: 'Wider and flatter Singleframe grille with matte titanium honeycomb inserts and integrated matte aluminum air inlets for high-speed downforce.',
    x: 24,
    y: 58,
  },
  {
    id: 'headlights',
    title: 'Matrix LED & Dynamic Indicators',
    subtitle: 'High-Definition Audi Laser Light',
    description: 'Precision daytime running light signature with dynamic light staging sequence when unlocking in dark alpine terrain.',
    x: 35,
    y: 48,
  },
  {
    id: 'wheels',
    title: '19" 5-Arm Cavo Flow-Formed Alloys',
    subtitle: 'Pirelli P Zero Performance Compound',
    description: 'Lightweight forged alloy wheels with 7.2mm verified tread depth, offering supreme lateral acceleration and wet road braking margins.',
    x: 28,
    y: 72,
  },
  {
    id: 'side-profile',
    title: 'Frameless Coupe Architecture',
    subtitle: 'Signature Wave-Design Shoulder Line',
    description: 'Classic 4-door Sportback silhouette with frameless side glass, sweeping roofline, and muscular flared quattro wheel arches.',
    x: 58,
    y: 52,
  },
  {
    id: 'rear-design',
    title: 'Aerodynamic Fastback Tailgate',
    subtitle: 'S line Integrated Diffuser & Dual Exhaust',
    description: 'Electric sweeping liftback tailgate revealing 465L of luggage volume, flanked by LED rear lights with dynamic animation.',
    x: 82,
    y: 54,
  },
];

export const ExteriorSection: React.FC = () => {
  const exteriorSeq = CINEMATIC_SEQUENCES['audi-exterior'];

  return (
    <section id="exterior-chapter" className="relative w-full bg-charcoal section-spacing overflow-hidden border-t border-white/5">
      <div className="section-container mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="label-technical text-accent text-xs block mb-2">CHAPTER 01 / EXTERIOR EXPLORATION</span>
            <h2 className="heading-section font-display">
              AUDI A5 SPORTBACK. <br />
              <span className="text-silver">COUPÉ SILHOUETTE. QUATTRO AGILITY.</span>
            </h2>
          </div>
          <div className="max-w-md">
            <p className="text-ash text-sm leading-relaxed">
              Explore the signature exterior features of our Easy Cars Biel flagship. Select any node to inspect the frameless coupe architecture and S line aerodynamic styling.
            </p>
          </div>
        </div>
      </div>

      {/* Main visual exploration viewport */}
      <div className="section-container">
        <div className="relative w-full h-[520px] md:h-[680px] bg-obsidian border border-white/10 overflow-hidden shadow-2xl">
          {/* Base Cinematic Vehicle Visual */}
          <CinematicSequence
            sequenceId={exteriorSeq.sequenceId}
            directory={exteriorSeq.directory}
            totalFrames={exteriorSeq.totalFrames}
            namingConvention={exteriorSeq.namingConvention}
            poster={exteriorSeq.poster}
            className="w-full h-full object-cover"
          />

          {/* Interactive detail hotspots for Audi A5 */}
          <VehicleHotspots hotspots={AUDI_A5_EXTERIOR_HOTSPOTS} />

          {/* HUD Badge */}
          <div className="absolute top-6 left-6 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 bg-black/70 backdrop-blur-md border border-white/10 text-xs font-mono text-silver">
            <Layers size={14} className="text-accent" />
            <span className="uppercase tracking-widest text-[10px]">
              EASY CARS BIEL — AUDI A5 SPORTBACK S LINE
            </span>
          </div>
        </div>

        {/* Technical Footer Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10 text-xs font-mono">
          <div>
            <span className="text-steel block text-[10px] uppercase">COAT FINISH</span>
            <span className="text-white font-bold">Daytona Grey Pearl</span>
          </div>
          <div>
            <span className="text-steel block text-[10px] uppercase">DRIVETRAIN</span>
            <span className="text-accent font-bold">quattro All-Wheel Drive</span>
          </div>
          <div>
            <span className="text-steel block text-[10px] uppercase">LIGHTING MATRIX</span>
            <span className="text-white font-bold">Matrix LED Optics</span>
          </div>
          <div>
            <span className="text-steel block text-[10px] uppercase">WHEEL ALLOCATION</span>
            <span className="text-white font-bold">19" S line Cavo Alloys</span>
          </div>
        </div>
      </div>
    </section>
  );
};
