import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CinematicSequence } from '../cinematic/CinematicSequence';
import { CINEMATIC_SEQUENCES } from '../../config/cinematicSequences';
import { ArrowDown, ArrowRight, ShieldCheck, Key } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const HeroReveal: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const sublineRef = useRef<HTMLParagraphElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const specsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        headlineRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, delay: 0.1 }
      )
        .fromTo(
          sublineRef.current,
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          '-=0.6'
        )
        .fromTo(
          actionsRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7 },
          '-=0.4'
        )
        .fromTo(
          specsRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.8 },
          '-=0.3'
        );

      if (containerRef.current) {
        gsap.to(headlineRef.current, {
          yPercent: -35,
          opacity: 0.25,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const heroSequence = CINEMATIC_SEQUENCES['audi-hero'];

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-obsidian pt-28 pb-10"
    >
      {/* Background Visual Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <CinematicSequence
          sequenceId={heroSequence.sequenceId}
          directory={heroSequence.directory}
          totalFrames={heroSequence.totalFrames}
          namingConvention={heroSequence.namingConvention}
          poster={heroSequence.poster}
          className="w-full h-full opacity-60 scale-105"
          scrollTriggered={false}
          autoplay={false}
        />

        {/* Cinematic Atmospheric Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/60 to-black/75 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-obsidian/45 to-obsidian pointer-events-none" />

        {/* Ambient Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-brand-red/10 blur-[140px] rounded-full pointer-events-none" />
      </div>

      {/* Main Content Area */}
      <div className="section-container relative z-10 my-auto py-8">
        <div className="max-w-4xl">
          {/* Official Logo Brand Badge */}
          <div className="inline-flex items-center gap-3 p-1.5 pr-4 bg-charcoal/90 border border-white/15 backdrop-blur-xl rounded-none mb-6">
            <div className="h-8 w-auto bg-white p-1 rounded-sm shadow-sm">
              <img src="/easy-car.jpeg" alt="Easy Cars Biel" className="h-full w-auto object-contain" />
            </div>
            <span className="label-technical text-white text-[10px] tracking-[0.16em]">
              WWW.EASYCARSBIEL.CH • BIEL/BIENNE & PIETERLEN
            </span>
          </div>

          {/* Master Luxury Headline */}
          <h1
            ref={headlineRef}
            className="heading-hero mb-6 tracking-wide"
          >
            DRIVE <br />
            <span className="text-white hover:text-brand-red transition-colors duration-500">
              DIFFERENT.
            </span>
          </h1>

          {/* Supporting Text */}
          <p
            ref={sublineRef}
            className="body-large text-pearl max-w-xl mb-10 text-base md:text-lg font-light leading-relaxed"
          >
            Experience our flagship <strong>Audi A5 Sportback</strong> in Biel/Bienne and Pieterlen. Pristine German engineering, transparent Swiss rates, and instant 24/7 keyless smartphone departure.
          </p>

          {/* Action CTAs */}
          <div
            ref={actionsRef}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
          >
            <Link
              to="/booking?vehicle=audi-a5-sportback"
              className="btn-primary flex items-center justify-center gap-3 py-4 px-8 text-xs font-mono tracking-widest"
            >
              <span>RENT AUDI A5 SPORTBACK</span>
              <ArrowRight size={15} />
            </Link>

            <Link
              to="/fleet"
              className="btn-outline flex items-center justify-center gap-3 py-4 px-8 text-xs font-mono tracking-widest"
            >
              <span>EXPLORE THE FLEET</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Real Verified Telemetry Strip */}
      <div
        ref={specsRef}
        className="section-container relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-white/10"
      >
        <div className="flex flex-wrap items-center gap-6 text-xs font-mono">
          <div>
            <span className="text-silver block text-[10px] uppercase">FLAGSHIP MODEL</span>
            <span className="text-white font-bold">AUDI A5 SPORTBACK S LINE</span>
          </div>
          <div className="hidden sm:block h-6 w-px bg-white/10" />
          <div>
            <span className="text-silver block text-[10px] uppercase">LOCATION HUBS</span>
            <span className="text-pearl">BIEL/BIENNE & PIETERLEN (BE)</span>
          </div>
          <div className="hidden sm:block h-6 w-px bg-white/10" />
          <div>
            <span className="text-silver block text-[10px] uppercase">ALL-INCLUSIVE RATE</span>
            <span className="text-brand-red font-bold">CHF 74 / DAY</span>
          </div>
        </div>

        <a
          href="#exterior-chapter"
          className="flex items-center gap-2 text-xs font-mono text-silver hover:text-white transition-colors"
        >
          <span className="uppercase tracking-widest text-[10px]">EXPLORE AUDI A5</span>
          <ArrowDown size={14} className="text-brand-red animate-bounce" />
        </a>
      </div>
    </section>
  );
};
