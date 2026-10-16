import React, { useState, useEffect } from 'react';
import { fetchLocations } from '../api/client';
import { Location } from '../types';
import { MapPin, Phone, Mail, Clock, Key, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchLocations().then(setLocations).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full min-h-screen bg-obsidian text-pearl pt-32 pb-24">
      <div className="section-container">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <span className="label-technical text-accent text-xs block mb-2 font-mono">EASY CARS BIEL • SWISS LOCATIONS</span>
          <h1 className="heading-hero text-3xl md:text-5xl text-white mb-4 font-display">
            OUR LOCATIONS.
          </h1>
          <p className="text-ash text-sm md:text-base leading-relaxed">
            Convenient pickup and return points in Biel/Bienne and Pieterlen with direct highway access, seamless vehicle handovers, and dedicated support.
          </p>
        </div>

        {loading ? (
          <div className="py-24 flex items-center justify-center">
            <Loader2 className="animate-spin text-accent" size={36} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl gap-8">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="card-dark border border-white/10 hover:border-white/20 p-8 flex flex-col justify-between transition-all duration-300 shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="label-technical text-accent text-[10px]">
                      {loc.country.toUpperCase()} HUB
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                      <Key size={12} /> KEYLESS 24/7
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">{loc.name}</h3>

                  <div className="space-y-4 font-mono text-xs text-ash my-6">
                    <div className="flex items-start gap-2.5">
                      <MapPin size={15} className="text-accent flex-shrink-0 mt-0.5" />
                      <span>{loc.address}, {loc.postal_code} {loc.city}</span>
                    </div>

                    {loc.phone && (
                      <div className="flex items-center gap-2.5">
                        <Phone size={15} className="text-silver flex-shrink-0" />
                        <a href={`tel:${loc.phone}`} className="hover:text-white transition-colors">
                          {loc.phone}
                        </a>
                      </div>
                    )}

                    {loc.email && (
                      <div className="flex items-center gap-2.5">
                        <Mail size={15} className="text-silver flex-shrink-0" />
                        <a href={`mailto:${loc.email}`} className="hover:text-white transition-colors">
                          {loc.email}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Hours */}
                  {loc.hours && (
                    <div className="pt-4 border-t border-white/10 mb-6 font-mono text-xs">
                      <span className="text-[10px] text-steel uppercase block mb-2">LOUNGE HOURS</span>
                      <div className="space-y-1 text-silver text-[11px]">
                        {Object.entries(loc.hours).map(([day, hrs]) => (
                          <div key={day} className="flex justify-between">
                            <span className="capitalize">{day.replace('_', '–')}:</span>
                            <span className="text-pearl">{hrs}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to="/booking"
                  className="btn-outline w-full py-3 text-xs font-mono tracking-wider flex items-center justify-center gap-2"
                >
                  <span>RESERVE AT THIS HUB</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
