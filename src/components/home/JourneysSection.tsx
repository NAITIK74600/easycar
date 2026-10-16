import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, Compass, ArrowRight, Mountain, Clock } from 'lucide-react';

interface SwissJourney {
  id: string;
  title: string;
  region: string;
  distance: string;
  duration: string;
  highlights: string;
  image: string;
  recommendedCar: string;
}

const SWISS_JOURNEYS: SwissJourney[] = [
  {
    id: 'chasseral-jura',
    title: 'Chasseral Summit Panorama Circuit',
    region: 'Biel/Bienne • Twann • Chasseral 1,607m',
    distance: '82 km',
    duration: '1h 45m',
    highlights: 'Panoramic vista across all Swiss Alps, winding Jura mountain curves, vineyard slopes of Lake Biel',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
    recommendedCar: 'Audi A5 Sportback S line',
  },
  {
    id: 'lakes-biel',
    title: 'Three Lakes Grand Tour',
    region: 'Pieterlen • Biel/Bienne • Neuchâtel • Murten',
    distance: '110 km',
    duration: '2h 10m',
    highlights: 'Lakeside vineyards, historic lakeside promenades, peaceful Swiss Jura foothills and medieval walls',
    image: 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=1200&q=80',
    recommendedCar: 'Audi A5 Sportback',
  },
  {
    id: 'pass-susten',
    title: 'Susten Pass Alpine Expedition',
    region: 'Bernese Oberland / Uri',
    distance: '165 km',
    duration: '3h 15m',
    highlights: 'Glacier canyon curves, 2,224m mountain pass summit, sweeping granite switchbacks',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    recommendedCar: 'Audi A3 Sportback',
  },
];

export const JourneysSection: React.FC = () => {
  return (
    <section className="relative w-full bg-obsidian section-spacing overflow-hidden border-t border-white/5">
      <div className="section-container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="label-technical text-accent text-xs block mb-2 font-mono">CHAPTER 06 / SWISS EXPEDITIONS</span>
            <h2 className="heading-section font-display">
              CURATED JOURNEYS. <br />
              <span className="text-silver">THE JURA & ALPS AS YOUR CANVAS.</span>
            </h2>
          </div>
          <div className="max-w-md">
            <p className="text-ash text-sm leading-relaxed">
              Depart from our Biel/Bienne or Pieterlen locations with full Swiss motorway vignette, pristine vehicle preparation, and curated routes.
            </p>
          </div>
        </div>

        {/* Swiss Hub Locations Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="card-dark p-6 border-l-2 border-l-accent">
            <div className="flex items-center gap-2 text-xs font-mono text-accent mb-2">
              <MapPin size={14} />
              <span>BIEL / BIENNE SHOWROOM</span>
            </div>
            <h3 className="text-xl font-bold font-display text-white mb-1">Easy Cars Biel Lounge</h3>
            <p className="text-xs text-silver font-mono mb-3">Zentralstrasse 4, 2502 Biel/Bienne</p>
            <p className="text-xs text-ash leading-relaxed">
              Central Biel location close to Biel/Bienne train station and Lake Biel. Rapid vehicle handovers and customer support.
            </p>
          </div>

          <div className="card-dark p-6 border-l-2 border-l-brand-red">
            <div className="flex items-center gap-2 text-xs font-mono text-brand-red mb-2">
              <MapPin size={14} />
              <span>PIETERLEN SERVICE HUB</span>
            </div>
            <h3 className="text-xl font-bold font-display text-white mb-1">Pieterlen Station Center</h3>
            <p className="text-xs text-silver font-mono mb-3">Hauptstrasse 12, 2542 Pieterlen</p>
            <p className="text-xs text-ash leading-relaxed">
              Convenient highway access to the A5 motorway and Swiss Jura passes. Flexible pickup & return for our Audi fleet.
            </p>
          </div>
        </div>

        {/* Curated Alpine Routes Grid */}
        <div className="mb-8">
          <span className="label-technical text-steel text-xs block mb-6">CURATED ALPINE PASS SUGGESTIONS</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SWISS_JOURNEYS.map((journey) => (
              <div
                key={journey.id}
                className="group card-dark overflow-hidden flex flex-col justify-between border border-white/10 hover:border-white/20 transition-all duration-500"
              >
                <div className="relative h-60 overflow-hidden bg-charcoal">
                  <img
                    src={journey.image}
                    alt={journey.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-black/30 pointer-events-none" />

                  <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 bg-black/75 backdrop-blur-md rounded border border-white/10 text-[10px] font-mono text-silver">
                    <Compass size={12} className="text-accent" />
                    <span>{journey.region}</span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-mono text-white">
                    <span className="flex items-center gap-1.5">
                      <Mountain size={13} className="text-accent" />
                      <span>{journey.distance}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} className="text-accent" />
                      <span>{journey.duration}</span>
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2 group-hover:text-accent transition-colors">
                      {journey.title}
                    </h4>
                    <p className="text-xs text-ash leading-relaxed mb-4">
                      {journey.highlights}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-silver text-[10px] uppercase">
                      IDEAL: <strong className="text-pearl">{journey.recommendedCar}</strong>
                    </span>
                    <Link
                      to="/booking"
                      className="text-accent hover:underline flex items-center gap-1"
                    >
                      <span>Book Trip</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
