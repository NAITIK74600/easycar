import React, { useRef } from 'react';
import { CinematicHero } from '../components/home/CinematicHero';
import { VehicleBookingBar } from '../components/home/VehicleBookingBar';
import { TrustStrip } from '../components/home/TrustStrip';
import { VehicleShowcasePanels } from '../components/home/VehicleShowcasePanels';
import { ExceptionalFleet } from '../components/home/ExceptionalFleet';
import { RealVehicleGallery } from '../components/home/RealVehicleGallery';
import { RentalTransparency } from '../components/home/RentalTransparency';
import { AdditionalServices } from '../components/home/AdditionalServices';
import { QuickBookingSection } from '../components/home/QuickBookingSection';

export const HomePage: React.FC = () => {
  const bookingSectionRef = useRef<HTMLDivElement | null>(null);

  const scrollToBooking = () => {
    bookingSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToFleet = () => {
    const fleetEl = document.getElementById('exceptional-fleet');
    fleetEl?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="w-full bg-obsidian text-pearl overflow-x-hidden">
      {/* 1. Cinematic Hero Section with Master Visual (hf_20261015_195744_725e4105-b360-4701-8f78-1d2719e1fdb7.mp4) */}
      <CinematicHero
        onRentClick={scrollToBooking}
        onFleetClick={scrollToFleet}
      />

      {/* 2. Interactive Horizontal Booking Bar docked over hero base */}
      <VehicleBookingBar />

      {/* 3. Trust and Service Information Strip (6 items) */}
      <TrustStrip />

      {/* 4. Split Editorial Vehicle & Interior Showcase Panels (01/02 & 02/02) */}
      <VehicleShowcasePanels />

      {/* 5. Exceptional Cars — Fleet Section (Audi A5 & Audi A3 with Pricing Matrix) */}
      <ExceptionalFleet />

      {/* 6. Real Vehicle Photography Gallery (15 photos for Audi A5 & 11 photos for Audi A3) */}
      <RealVehicleGallery />

      {/* 7. Rental Transparency (6-Step Workflow & Swiss Policies) */}
      <RentalTransparency />

      {/* 8. Optional Services (Delivery & Chauffeur with "Price on request") */}
      <AdditionalServices />

      {/* 9. Full Instant Reservation System (Connected to Backend API) */}
      <div ref={bookingSectionRef} id="quick-booking">
        <QuickBookingSection />
      </div>
    </main>
  );
};
