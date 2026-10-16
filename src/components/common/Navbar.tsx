import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, ShieldCheck, Phone, Lock } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'FLEET', to: '/fleet' },
    { label: 'AUDI A5', to: '/fleet/audi-a5-sportback' },
    { label: 'AUDI A3', to: '/fleet/audi-a3-sportback' },
    { label: 'HUBS', to: '/locations' },
    { label: 'ABOUT', to: '/about' },
    { label: 'CONTACT', to: '/contact' },
    { label: 'OWNER', to: '/owner' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled
            ? 'bg-obsidian/95 backdrop-blur-xl border-b border-white/10 py-3 shadow-2xl'
            : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent py-5'
        }`}
      >
        <div className="section-container flex items-center justify-between">
          {/* Official Easy Cars Biel Logo Image */}
          <Link
            to="/"
            className="flex items-center gap-3.5 group text-decoration-none focus:outline-none"
            aria-label="Easy Cars Biel Homepage"
          >
            <div className="h-10 md:h-12 w-auto bg-white p-1 rounded-sm shadow-md transition-transform duration-300 group-hover:scale-105 flex items-center justify-center">
              <img
                src="/easy-car.jpeg"
                alt="Easy Cars Biel Logo"
                className="h-full w-auto object-contain"
              />
            </div>

            <div className="flex flex-col">
              <span className="font-display font-black text-sm md:text-base tracking-[0.08em] text-white uppercase leading-none group-hover:text-brand-red transition-colors">
                EASY CARS <span className="text-brand-red font-sans font-black">BIEL</span>
              </span>
              <span className="font-mono text-[9px] text-silver tracking-[0.2em] uppercase mt-0.5">
                WWW.EASYCARSBIEL.CH
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links with Luxury Typography */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-xs font-mono tracking-[0.16em] uppercase transition-all duration-300 relative py-1 ${
                    isActive
                      ? 'text-brand-red font-bold'
                      : 'text-silver hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-red" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Header Action & Direct Contact */}
          <div className="hidden md:flex items-center gap-5">
            <a
              href="tel:+41793889997"
              className="flex items-center gap-2 text-xs font-mono text-silver hover:text-white transition-colors"
            >
              <Phone size={13} className="text-brand-red" />
              <span>+41 79 388 99 97</span>
            </a>

            <Link
              to="/booking?vehicle=audi-a5-sportback"
              className="btn-primary text-xs py-2.5 px-5 font-mono tracking-widest flex items-center gap-2"
            >
              <span>RENT AUDI A5</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="lg:hidden text-pearl hover:text-white p-2 focus:outline-none"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div
        className={`fixed inset-0 z-50 bg-obsidian/98 backdrop-blur-3xl transition-all duration-500 lg:hidden flex flex-col justify-between p-8 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
            <div className="h-10 w-auto bg-white p-1 rounded-sm">
              <img src="/easy-car.jpeg" alt="Easy Cars Biel Logo" className="h-full w-auto object-contain" />
            </div>
            <span className="font-display font-extrabold text-base tracking-[0.08em] text-white uppercase">
              EASY CARS BIEL
            </span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close mobile menu"
            className="text-silver hover:text-white p-2"
          >
            <X size={26} />
          </button>
        </div>

        <nav className="flex flex-col gap-6 my-auto">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className="font-display text-2xl font-bold tracking-wider text-pearl hover:text-brand-red transition-colors flex items-center justify-between"
            >
              <span>{link.label}</span>
              <ArrowRight size={18} className="text-brand-red" />
            </Link>
          ))}
          <Link
            to="/booking?vehicle=audi-a5-sportback"
            onClick={() => setMobileMenuOpen(false)}
            className="font-display text-2xl font-bold tracking-wider text-brand-red flex items-center justify-between"
          >
            <span>RESERVE AUDI A5</span>
            <ArrowRight size={18} />
          </Link>
        </nav>

        <div className="pt-6 border-t border-white/10 flex flex-col gap-3 font-mono text-xs text-silver">
          <div className="flex items-center gap-2 text-brand-red">
            <ShieldCheck size={16} />
            <span>WWW.EASYCARSBIEL.CH</span>
          </div>
          <p>Zentralstrasse 4, 2502 Biel/Bienne & Hauptstrasse 12, 2542 Pieterlen</p>
          <p>Direct: +41 79 388 99 97 • info@easycarsbiel.ch</p>
        </div>
      </div>
    </>
  );
};
