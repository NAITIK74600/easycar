import React from 'react';
import { Gem, MapPin, ShieldCheck, Calendar, Disc, Headphones } from 'lucide-react';

interface TrustItem {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

export const TrustStrip: React.FC = () => {
  const items: TrustItem[] = [
    {
      icon: <Gem size={16} className="text-white/80" />,
      title: 'PREMIUM VEHICLES',
      subtitle: 'Audi A3 & A5',
    },
    {
      icon: <MapPin size={16} className="text-white/80" />,
      title: 'LOCAL PICKUP',
      subtitle: 'Pieterlen, Switzerland',
    },
    {
      icon: <ShieldCheck size={16} className="text-white/80" />,
      title: 'TRANSPARENT PRICING',
      subtitle: 'No hidden fees',
    },
    {
      icon: <Calendar size={16} className="text-white/80" />,
      title: 'FLEXIBLE RENTAL PERIODS',
      subtitle: '1 to 30+ days',
    },
    {
      icon: <Disc size={16} className="text-white/80" />,
      title: 'OPTIONAL SERVICES',
      subtitle: 'Delivery & Chauffeur',
    },
    {
      icon: <Headphones size={16} className="text-white/80" />,
      title: 'PERSONAL SUPPORT',
      subtitle: 'Direct owner contact',
    },
  ];

  return (
    <section className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-16 select-none">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border-y border-white/10 bg-black/40 backdrop-blur-sm divide-y md:divide-y-0 md:divide-x divide-white/10 py-3 lg:py-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 px-3 py-2.5 lg:px-4 group transition-colors hover:bg-white/[0.02]"
          >
            <div className="text-silver group-hover:text-brand-red transition-colors shrink-0">
              {item.icon}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-mono text-[10px] md:text-[11px] font-bold text-white tracking-[0.14em] uppercase truncate">
                {item.title}
              </span>
              <span className="font-mono text-[9px] text-silver truncate">
                {item.subtitle}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
