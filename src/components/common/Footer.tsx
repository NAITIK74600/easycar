import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ShieldCheck, MapPin, Mail, Phone, Key } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-charcoal border-t border-white/10 text-pearl relative z-10">
      <div className="section-container py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Column with Official Logo */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-auto bg-white p-1 rounded-sm shadow-md">
                  <img src="/easy-car.jpeg" alt="Easy Cars Biel" className="h-full w-auto object-contain" />
                </div>
                <div>
                  <span className="font-display font-black text-xl tracking-[0.08em] text-white uppercase block leading-none">
                    EASY CARS <span className="text-brand-red font-sans">BIEL</span>
                  </span>
                  <span className="font-mono text-[10px] text-silver tracking-[0.2em] block mt-1">
                    WWW.EASYCARSBIEL.CH
                  </span>
                </div>
              </div>
            </Link>
            <p className="text-ash text-sm leading-relaxed max-w-sm mb-6">
              Official premium car rental in Biel/Bienne & Pieterlen. Experience our flagship Audi A5 Sportback with 24/7 keyless smartphone check-in, transparent Swiss daily pricing, and verified vehicle preparation.
            </p>
            <div className="flex items-center gap-2.5 text-xs font-mono text-silver">
              <ShieldCheck size={16} className="text-brand-red flex-shrink-0" />
              <span>AUTHENTIC LOCAL CAR RENTAL IN CANTON BERN</span>
            </div>
          </div>

          {/* Real Fleet Column */}
          <div>
            <h4 className="label-technical text-brand-red text-xs mb-4">OUR FLEET</h4>
            <ul className="space-y-3 text-xs font-mono">
              <li>
                <Link to="/fleet/audi-a5-sportback" className="text-white font-bold hover:text-brand-red transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                  <span>Audi A5 3.0 TDI quattro (CHF 100/d)</span>
                </Link>
              </li>
              <li>
                <Link to="/fleet/audi-a3-sportback" className="text-ash hover:text-white transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-silver" />
                  <span>Audi A3 1.8 TFSI quattro (CHF 65/d)</span>
                </Link>
              </li>
              <li className="pt-2">
                <Link to="/fleet" className="text-brand-red hover:underline flex items-center gap-1 font-bold">
                  <span>Browse Fleet Directory</span>
                  <ArrowUpRight size={12} />
                </Link>
              </li>
            </ul>
          </div>

          {/* Real Swiss Locations */}
          <div>
            <h4 className="label-technical text-brand-red text-xs mb-4">OUR HUBS</h4>
            <ul className="space-y-3 text-xs font-mono text-ash">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-brand-red mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-white block">Biel/Bienne Showroom</strong>
                  <span>Zentralstrasse 4, 2502 Biel</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-silver mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-pearl block">Pieterlen Station</strong>
                  <span>Hauptstrasse 12, 2542 Pieterlen</span>
                </div>
              </li>
              <li className="flex items-center gap-2 text-brand-red text-[11px] pt-1">
                <Key size={13} />
                <span>24/7 Keyless Mobile Dispatch</span>
              </li>
            </ul>
          </div>

          {/* Direct Concierge Contact */}
          <div>
            <h4 className="label-technical text-brand-red text-xs mb-4">CONTACT & BOOKING</h4>
            <ul className="space-y-2.5 text-xs font-mono text-ash">
              <li className="flex items-center gap-2">
                <Phone size={13} className="text-brand-red" />
                <a href="tel:+41793889997" className="text-white font-bold hover:text-brand-red">
                  +41 79 388 99 97
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={13} className="text-silver" />
                <a href="tel:+41323771200" className="hover:text-white">
                  +41 32 377 12 00
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={13} className="text-silver" />
                <a href="mailto:info@easycarsbiel.ch" className="hover:text-white">
                  info@easycarsbiel.ch
                </a>
              </li>
              <li className="pt-2">
                <Link to="/contact" className="text-white hover:text-brand-red transition-colors flex items-center gap-1 font-bold">
                  <span>Send Direct Message</span>
                  <ArrowUpRight size={12} />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="separator mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-steel">
          <div>
            © {new Date().getFullYear()} EASY CARS BIEL • WWW.EASYCARSBIEL.CH. ALL RIGHTS RESERVED.
          </div>
          <div className="flex flex-wrap items-center gap-6 text-[11px]">
            <Link to="/about#terms" className="hover:text-silver transition-colors">
              Rental Terms
            </Link>
            <Link to="/about#cancellation" className="hover:text-silver transition-colors">
              Cancellation Policy
            </Link>
            <Link to="/about#privacy" className="hover:text-silver transition-colors">
              Privacy Policy
            </Link>
            <Link to="/contact" className="hover:text-silver transition-colors">
              Contact
            </Link>
            <Link to="/owner" className="text-brand-red hover:underline font-bold transition-colors">
              Owner Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
