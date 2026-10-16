import React, { useState } from 'react';
import { Compass, Volume2, ShieldCheck, Sparkles, Sliders, Maximize2 } from 'lucide-react';

interface InteriorZone {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  features: string[];
  specs: { label: string; value: string }[];
}

const INTERIOR_ZONES: InteriorZone[] = [
  {
    id: 'cockpit',
    name: 'Driver Cockpit',
    tagline: 'Driver-Centric Ergonomics',
    description: 'The cockpit wraps intuitively around the pilot. Featuring the 12.3-inch Audi Virtual Cockpit Plus high-resolution digital display with classic, sport, and dynamic view modes.',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1800&q=85',
    features: ['12.3" Full HD Virtual Display', 'Alcantara Sport Steering Wheel', 'Shift-by-Wire Compact Selector', 'Direct Alpine Nav Routing'],
    specs: [
      { label: 'Screen Resolution', value: '1920 x 720 px' },
      { label: 'HUD Brightness', value: '12,000 cd/m²' },
      { label: 'Latency', value: '< 16 ms' },
    ],
  },
  {
    id: 'dashboard',
    name: 'Architecture & MMI',
    tagline: 'Acoustic & Tactile Precision',
    description: 'Horizontal architecture with black-panel glass finish, integrated 10.1-inch central touch display with acoustic haptic feedback and natural language voice control.',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1800&q=85',
    features: ['10.1" MMI Touch Display', 'Dual-Zone Digital Climate Panel', 'Carbon Inlay Trim Facets', 'Air Quality Ionizer System'],
    specs: [
      { label: 'Interface', value: 'MIB 3 Processing Unit' },
      { label: 'Audio Latency', value: 'Dolby Atmos Spatial' },
      { label: 'Connectivity', value: '5G LTE eSIM Standard' },
    ],
  },
  {
    id: 'steering-wheel',
    name: 'Multifunction Wheel',
    tagline: 'Direct Tactile Feedback',
    description: '3-spoke leather-trimmed multifunction steering wheel with flat bottom, electroplated shift paddles, and capacitive hands-on detection for adaptive cruise assist.',
    image: 'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1800&q=85',
    features: ['Capacitive Hands-On Sensor', 'Integrated View & Voice Keys', 'S tronic Aluminium Shift Paddles', 'Heated Rim Function'],
    specs: [
      { label: 'Wheel Diameter', value: '370 mm' },
      { label: 'Sensor Polling', value: '100 Hz' },
      { label: 'Paddles Material', value: 'Cast Aluminum' },
    ],
  },
  {
    id: 'center-console',
    name: 'Center Console',
    tagline: 'Monolithic Geometric Minimalism',
    description: 'Floating console bridge with newly styled compact gear selector, dual USB-C rapid charging ports (45W Power Delivery), and wireless induction charging compartment.',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1800&q=85',
    features: ['Shift-by-Wire Rocker', '45W USB-C Dual Ports', 'Qi Wireless Fast Charger', 'Frameless Cup Holder Modules'],
    specs: [
      { label: 'Wireless Charge', value: '15W Fast Qi' },
      { label: 'Storage Volume', value: '4.8 Litres' },
      { label: 'Finish', value: 'Anodized Dark Chrome' },
    ],
  },
  {
    id: 'front-seats',
    name: 'Front Sport Seats',
    tagline: 'Contoured Lateral Support',
    description: 'Sculpted sport seats with pronounced side bolsters, integrated head restraints, 4-way electric lumbar adjustment, and breathable micro-perforated upholstery.',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1800&q=85',
    features: ['4-Way Power Lumbar', 'Extendable Thigh Support', '3-Stage Seat Heating', 'Recycled Dinamica Microfibre'],
    specs: [
      { label: 'Adjustment Points', value: '8-Way Ergonomic' },
      { label: 'Heating Elements', value: 'Carbon-Mesh Rapid' },
      { label: 'Side Bolsters', value: '+35mm Lateral Grip' },
    ],
  },
  {
    id: 'rear-seats',
    name: 'Rear Passenger Lounge',
    tagline: 'First-Class Legroom',
    description: 'Generous 3-seat rear bench with 40:20:40 split-folding capability, ISOFIX child seat anchor points on both outer seats, and dedicated rear ventilation console.',
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1800&q=85',
    features: ['40:20:40 Split Fold', 'Dual ISOFIX Mount Points', 'Rear USB-C Hub', 'Foldable Center Armrest'],
    specs: [
      { label: 'Legroom', value: '890 mm' },
      { label: 'Headroom', value: '955 mm' },
      { label: 'ISOFIX Slots', value: '2 x TopTether Ready' },
    ],
  },
  {
    id: 'storage',
    name: 'Cabin Storage & Details',
    tagline: 'Clever Alpine Travel Utilities',
    description: 'Concealed compartment under the front passenger seat, spacious door pockets accommodating 1.5L bottles, and illuminated glove box with chiller duct.',
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1800&q=85',
    features: ['Air-Conditioned Glove Compartment', '1.5L Bottle Door Pockets', 'Under-Seat Security Tray', 'Fleece-Lined Eyewear Case'],
    specs: [
      { label: 'Total Pockets', value: '8 Compartments' },
      { label: 'Door Volume', value: '2 x 3.2 Litres' },
      { label: 'Chiller Airflow', value: 'Sub-10°C Cooling' },
    ],
  },
  {
    id: 'trunk',
    name: 'Luggage Compartment',
    tagline: 'Flat Loading Floor',
    description: 'Level loading threshold with 380 litres capacity expanding to 1,200 litres when rear seats are folded. Features variable luggage floor height, securing net, and 12V socket.',
    image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1800&q=85',
    features: ['Two-Stage Height Adjustable Floor', 'Lateral Luggage Net & Hooks', '12V Power Socket in Cargo Bay', 'Luggage Cover Compartment'],
    specs: [
      { label: 'Standard Capacity', value: '380 Litres' },
      { label: 'Max Folded Volume', value: '1,200 Litres' },
      { label: 'Loading Width', value: '1,000 mm' },
    ],
  },
];

export const InteriorExplorer: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<InteriorZone>(INTERIOR_ZONES[0]);

  return (
    <div className="w-full bg-charcoal border border-white/10 rounded-none overflow-hidden shadow-2xl">
      {/* Zone selection tab bar */}
      <div className="flex items-center overflow-x-auto border-b border-white/10 bg-obsidian px-4 md:px-8 no-scrollbar">
        {INTERIOR_ZONES.map((zone) => {
          const isActive = selectedZone.id === zone.id;
          return (
            <button
              key={zone.id}
              onClick={() => setSelectedZone(zone)}
              className={`py-4 px-4 md:px-6 text-xs md:text-sm font-mono uppercase tracking-wider whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                isActive
                  ? 'border-accent text-white bg-charcoal/50 font-bold'
                  : 'border-transparent text-silver hover:text-pearl hover:border-white/20'
              }`}
            >
              {zone.name}
            </button>
          );
        })}
      </div>

      {/* Main visual exploration area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
        {/* Large visual view */}
        <div className="lg:col-span-8 relative min-h-[380px] lg:min-h-full overflow-hidden bg-obsidian">
          <img
            key={selectedZone.id}
            src={selectedZone.image}
            alt={selectedZone.name}
            className="w-full h-full object-cover animate-fade-in transition-all duration-700"
          />
          {/* Subtle gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-black/30 pointer-events-none" />

          {/* Floating perspective badge */}
          <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-black/75 backdrop-blur-md border border-white/10 text-xs font-mono text-pearl">
            <Compass size={14} className="text-accent" />
            <span className="uppercase tracking-widest">{selectedZone.name} — PERSPECTIVE</span>
          </div>

          <div className="absolute bottom-6 left-6 right-6 lg:hidden">
            <span className="label-technical text-accent text-[10px]">{selectedZone.tagline}</span>
            <h3 className="text-xl font-bold text-white mt-1">{selectedZone.name}</h3>
          </div>
        </div>

        {/* Detailed architectural specifications panel */}
        <div className="lg:col-span-4 p-6 md:p-8 flex flex-col justify-between bg-charcoal/90 border-t lg:border-t-0 lg:border-l border-white/10">
          <div>
            <div className="hidden lg:block mb-6">
              <span className="label-technical text-accent text-xs">{selectedZone.tagline}</span>
              <h3 className="heading-subsection text-white mt-1">{selectedZone.name}</h3>
            </div>

            <p className="text-ash text-sm leading-relaxed mb-6">
              {selectedZone.description}
            </p>

            {/* Key features checklist */}
            <div className="mb-6">
              <span className="label-technical text-[10px] text-steel block mb-3">KEY APPOINTMENTS</span>
              <ul className="space-y-2.5">
                {selectedZone.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-xs text-pearl">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Technical telemetry specs */}
          <div className="pt-6 border-t border-white/10">
            <span className="label-technical text-[10px] text-steel block mb-3">ENGINEERING SPECIFICATIONS</span>
            <div className="grid grid-cols-2 gap-3">
              {selectedZone.specs.map((s, idx) => (
                <div key={idx} className="p-2.5 bg-obsidian/60 border border-white/5">
                  <span className="text-[10px] font-mono text-silver block uppercase">{s.label}</span>
                  <span className="text-xs font-mono font-bold text-white block mt-0.5">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
