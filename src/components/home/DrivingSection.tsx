import React, { useState } from 'react';
import { CinematicSequence } from '../cinematic/CinematicSequence';
import { CINEMATIC_SEQUENCES } from '../../config/cinematicSequences';
import { Gauge, Compass, Wind, Zap, Play } from 'lucide-react';

interface DriveMode {
  id: string;
  name: string;
  damping: string;
  steering: string;
  throttle: string;
  description: string;
}

const DRIVE_MODES: DriveMode[] = [
  {
    id: 'dynamic',
    name: 'DYNAMIC',
    damping: 'Tuned Stiff',
    steering: 'Direct Alpine 14.1:1',
    throttle: 'Instant Sport Response',
    description: 'Sharpened throttle map, heightened shift thresholds on the 7-speed S tronic, and immediate steering torque for winding Swiss pass roads.',
  },
  {
    id: 'comfort',
    name: 'COMFORT',
    damping: 'Adaptive Pliancy',
    steering: 'Speed-Sensitive Light',
    throttle: 'Gradual Acoustic Glide',
    description: 'Seamless motorway long-distance cruising along the A1/A6 autobahns with dampened acoustic cabin resonance and gentle gear changes.',
  },
  {
    id: 'efficiency',
    name: 'EFFICIENCY',
    damping: 'Standard Aerodynamic',
    steering: 'Standard Balanced',
    throttle: 'Coasting Freewheel Enabled',
    description: 'Utilizes 48V mild hybrid coasting with internal combustion disengagement between 55 and 160 km/h to maximize fuel economy.',
  },
  {
    id: 'individual',
    name: 'INDIVIDUAL',
    damping: 'Custom Preset',
    steering: 'Sport Calibrated',
    throttle: 'Dynamic Mapping',
    description: 'Personalized driver profile tailored to exact driver preference across suspension dampers and steering resistance.',
  },
];

export const DrivingSection: React.FC = () => {
  const [activeMode, setActiveMode] = useState<DriveMode>(DRIVE_MODES[0]);
  const drivingSeq = CINEMATIC_SEQUENCES['driving'];

  return (
    <section className="relative w-full bg-obsidian section-spacing overflow-hidden border-t border-white/5">
      <div className="section-container mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="label-technical text-accent text-xs block mb-2 font-mono">CHAPTER 04 / DYNAMICS ON ROAD</span>
            <h2 className="heading-section font-display">
              ALPINE TRACTION. <br />
              <span className="text-silver">EFFORTLESS VELOCITY.</span>
            </h2>
          </div>
          <div className="max-w-md">
            <p className="text-ash text-sm leading-relaxed">
              Equipped with Audi Drive Select. Seamlessly transition vehicle character from relaxed Swiss highway cruising to razor-sharp alpine climbing.
            </p>
          </div>
        </div>
      </div>

      {/* Cinematic Viewport Container */}
      <div className="section-container">
        <div className="relative w-full h-[500px] md:h-[650px] bg-charcoal border border-white/10 overflow-hidden shadow-2xl">
          {/* Base cinematic visual sequence */}
          <CinematicSequence
            sequenceId={drivingSeq.sequenceId}
            directory={drivingSeq.directory}
            totalFrames={drivingSeq.totalFrames}
            namingConvention={drivingSeq.namingConvention}
            poster={drivingSeq.poster}
            className="w-full h-full object-cover"
          />

          {/* Vignette & Speed Blur Effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-black/30 to-black/50 pointer-events-none" />

          {/* Mode Selector HUD Overlay */}
          <div className="absolute top-6 left-6 right-6 md:right-auto md:w-96 z-20">
            <div className="bg-obsidian/85 backdrop-blur-xl border border-white/15 p-6 shadow-2xl">
              <span className="label-technical text-accent text-[10px] block mb-2">
                AUDI DRIVE SELECT PROTOCOL
              </span>

              {/* Mode Buttons */}
              <div className="grid grid-cols-4 gap-1.5 mb-4 p-1 bg-charcoal border border-white/10">
                {DRIVE_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setActiveMode(mode)}
                    className={`py-2 text-[10px] font-mono font-bold tracking-wider uppercase transition-all ${
                      activeMode.id === mode.id
                        ? 'bg-accent text-obsidian shadow'
                        : 'text-silver hover:text-white'
                    }`}
                  >
                    {mode.name}
                  </button>
                ))}
              </div>

              <h4 className="text-base font-bold text-white mb-1.5">{activeMode.name} MODE ENGAGED</h4>
              <p className="text-xs text-ash leading-relaxed mb-4">{activeMode.description}</p>

              {/* Telemetry Stats */}
              <div className="space-y-2 pt-3 border-t border-white/10 text-[11px] font-mono">
                <div className="flex justify-between">
                  <span className="text-silver">STEERING RESISTANCE</span>
                  <span className="text-white font-bold">{activeMode.steering}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-silver">THROTTLE RESPONSE</span>
                  <span className="text-accent font-bold">{activeMode.throttle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-silver">DAMPER COMPLIANCE</span>
                  <span className="text-white font-bold">{activeMode.damping}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Driving HUD Telemetry Bottom Bar */}
          <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-wrap items-center justify-between gap-4 p-4 bg-obsidian/80 backdrop-blur-md border border-white/10 text-xs font-mono">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-silver text-[10px] block">POWER OUTPUT</span>
                <span className="text-white font-bold">150 PS / 110 kW</span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <span className="text-silver text-[10px] block">ACCELERATION</span>
                <span className="text-accent font-bold">8.4s (0–100 km/h)</span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <span className="text-silver text-[10px] block">MAX VELOCITY</span>
                <span className="text-white font-bold">224 km/h</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-silver text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE TELEMETRY CALIBRATION</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
