import React, { useState } from 'react';
import { Camera, ChevronLeft, ChevronRight, X, Maximize2, ShieldCheck, Eye } from 'lucide-react';

interface PhotoItem {
  src: string;
  category: 'exterior' | 'interior' | 'details';
  caption: string;
}

export const RealVehicleGallery: React.FC = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<'a5' | 'a3'>('a5');
  const [activeCategory, setActiveCategory] = useState<'all' | 'exterior' | 'interior'>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const a5Photos: PhotoItem[] = [
    { src: '/vehicles/audi-a5/a5_01.jpeg', category: 'exterior', caption: 'Audi A5 Sportback S-Line Front Three-Quarter' },
    { src: '/vehicles/audi-a5/a5_02.jpeg', category: 'exterior', caption: 'Dynamic Profile & Daytona Grey Finish' },
    { src: '/vehicles/audi-a5/a5_03.jpeg', category: 'exterior', caption: 'Rear Sportback Profile with S-Line Diffuser' },
    { src: '/vehicles/audi-a5/a5_04.jpeg', category: 'exterior', caption: 'Singleframe Grille & LED Headlights' },
    { src: '/vehicles/audi-a5/a5_05.jpeg', category: 'interior', caption: 'Driver Virtual Cockpit & Multifunction Steering Wheel' },
    { src: '/vehicles/audi-a5/a5_06.jpeg', category: 'interior', caption: 'MMI Navigation Plus & Apple CarPlay Interface' },
    { src: '/vehicles/audi-a5/a5_07.jpeg', category: 'interior', caption: 'Heated S-Line Sports Seats with Massage Function' },
    { src: '/vehicles/audi-a5/a5_08.jpeg', category: 'interior', caption: 'Rear Passenger Cabin & Leather Upholstery' },
    { src: '/vehicles/audi-a5/a5_09.jpeg', category: 'exterior', caption: 'Sportback Panoramic Glass Sunroof' },
    { src: '/vehicles/audi-a5/a5_10.jpeg', category: 'details', caption: '19" S-Line Alloy Wheels & All-Season Tires' },
    { src: '/vehicles/audi-a5/a5_11.jpeg', category: 'details', caption: 'Quattro All-Wheel Drive Badge & Side Blades' },
    { src: '/vehicles/audi-a5/a5_12.jpeg', category: 'interior', caption: 'Centre Console with Automatic Tiptronic Selector' },
    { src: '/vehicles/audi-a5/a5_13.jpeg', category: 'interior', caption: 'Spacious 480L Fastback Luggage Compartment' },
    { src: '/vehicles/audi-a5/a5_14.jpeg', category: 'exterior', caption: 'Dual Chrome Exhaust Outlets & LED Taillights' },
    { src: '/vehicles/audi-a5/a5_15.jpeg', category: 'details', caption: '3.0 TDI V6 286 PS Engine Compartment' },
  ];

  const a3Photos: PhotoItem[] = [
    { src: '/vehicles/audi-a3/a3_01.jpeg', category: 'exterior', caption: 'Audi A3 Sportback 1.8 TFSI quattro Front View' },
    { src: '/vehicles/audi-a3/a3_02.jpeg', category: 'exterior', caption: 'Compact Sportback Side Silhouette' },
    { src: '/vehicles/audi-a3/a3_03.jpeg', category: 'exterior', caption: 'Rear Hatch & Quattro Badging' },
    { src: '/vehicles/audi-a3/a3_04.jpeg', category: 'interior', caption: 'Driver Cockpit with Manual 6-Speed Transmission' },
    { src: '/vehicles/audi-a3/a3_05.jpeg', category: 'interior', caption: 'Sport Seats with Seat Heating & Climate Control' },
    { src: '/vehicles/audi-a3/a3_06.jpeg', category: 'interior', caption: 'Dashboard Instruments & Audio Interface' },
    { src: '/vehicles/audi-a3/a3_07.jpeg', category: 'interior', caption: 'Rear Passenger Bench & ISOFIX Mounts' },
    { src: '/vehicles/audi-a3/a3_08.jpeg', category: 'exterior', caption: '5-Door Access & Tinted Rear Privacy Glass' },
    { src: '/vehicles/audi-a3/a3_09.jpeg', category: 'details', caption: 'Audi OEM Alloy Wheels with All-Weather Tires' },
    { src: '/vehicles/audi-a3/a3_10.jpeg', category: 'details', caption: '1.8 TFSI Turbo Petrol Engine' },
    { src: '/vehicles/audi-a3/a3_11.jpeg', category: 'exterior', caption: 'Rear Luggage Hold with Foldable Seats' },
  ];

  const currentList = selectedVehicle === 'a5' ? a5Photos : a3Photos;
  const filteredPhotos = activeCategory === 'all'
    ? currentList
    : currentList.filter(p => p.category === activeCategory);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length);
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length);
    }
  };

  return (
    <>
      <section id="real-gallery" className="relative w-full bg-charcoal/40 py-20 border-t border-white/5 select-none">
        <div className="section-container px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] text-brand-red tracking-[0.24em] uppercase mb-2">
                <ShieldCheck size={14} className="text-brand-red" />
                <span>100% AUTHENTIC VEHICLE PHOTOS</span>
              </div>
              <h2
                className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-wide uppercase leading-tight"
                style={{ fontFamily: "'Cinzel', Georgia, serif" }}
              >
                REAL FLEET GALLERY
              </h2>
            </div>
            <div className="max-w-md">
              <p className="text-silver text-xs sm:text-sm font-light leading-relaxed">
                Direct photographs of the exact vehicles available at Pieterlen & Biel/Bienne. Inspected, cleaned and prepared for your journey.
              </p>
            </div>
          </div>

          {/* Vehicle Switcher & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
            {/* Vehicle Tabs */}
            <div className="flex items-center gap-2 font-mono text-xs">
              <button
                onClick={() => {
                  setSelectedVehicle('a5');
                  setActiveCategory('all');
                }}
                className={`py-2.5 px-5 tracking-wider uppercase transition-all cursor-pointer ${
                  selectedVehicle === 'a5'
                    ? 'bg-brand-red text-white font-bold shadow-lg shadow-brand-red/20'
                    : 'bg-white/5 text-silver hover:text-white'
                }`}
              >
                Audi A5 Sportback (15 Photos)
              </button>
              <button
                onClick={() => {
                  setSelectedVehicle('a3');
                  setActiveCategory('all');
                }}
                className={`py-2.5 px-5 tracking-wider uppercase transition-all cursor-pointer ${
                  selectedVehicle === 'a3'
                    ? 'bg-brand-red text-white font-bold shadow-lg shadow-brand-red/20'
                    : 'bg-white/5 text-silver hover:text-white'
                }`}
              >
                Audi A3 Sportback (11 Photos)
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-silver">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3 py-1.5 border transition-colors cursor-pointer ${
                  activeCategory === 'all'
                    ? 'border-brand-red text-brand-red bg-brand-red/10'
                    : 'border-white/10 hover:border-white/30 text-silver'
                }`}
              >
                All ({currentList.length})
              </button>
              <button
                onClick={() => setActiveCategory('exterior')}
                className={`px-3 py-1.5 border transition-colors cursor-pointer ${
                  activeCategory === 'exterior'
                    ? 'border-brand-red text-brand-red bg-brand-red/10'
                    : 'border-white/10 hover:border-white/30 text-silver'
                }`}
              >
                Exterior
              </button>
              <button
                onClick={() => setActiveCategory('interior')}
                className={`px-3 py-1.5 border transition-colors cursor-pointer ${
                  activeCategory === 'interior'
                    ? 'border-brand-red text-brand-red bg-brand-red/10'
                    : 'border-white/10 hover:border-white/30 text-silver'
                }`}
              >
                Interior
              </button>
            </div>
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredPhotos.map((photo, idx) => (
              <div
                key={photo.src}
                onClick={() => openLightbox(idx)}
                className="group relative aspect-[4/3] bg-black overflow-hidden border border-white/10 hover:border-brand-red/50 cursor-pointer transition-all duration-300"
              >
                <img
                  src={photo.src}
                  alt={photo.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out brightness-[0.95]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <span className="font-mono text-[9px] text-brand-red uppercase tracking-wider">
                    {photo.category}
                  </span>
                  <span className="font-sans text-xs text-white font-medium truncate">
                    {photo.caption}
                  </span>
                </div>
                <div className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-sm text-silver opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── High Resolution Lightbox Modal ── */}
      {lightboxIndex !== null && filteredPhotos[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6 lg:p-8 animate-fadeIn"
        >
          {/* Header */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between max-w-6xl w-full mx-auto pb-4 border-b border-white/10"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-brand-red font-bold uppercase tracking-widest">
                {selectedVehicle === 'a5' ? 'AUDI A5 SPORTBACK' : 'AUDI A3 SPORTBACK'}
              </span>
              <span className="text-white/20">|</span>
              <span className="font-mono text-xs text-silver">
                Photo {lightboxIndex + 1} of {filteredPhotos.length}
              </span>
            </div>
            <button
              onClick={() => setLightboxIndex(null)}
              className="p-2 text-silver hover:text-white cursor-pointer"
              aria-label="Close photo"
            >
              <X size={22} />
            </button>
          </div>

          {/* Main Photo Viewport */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full mx-auto my-auto flex items-center justify-center max-h-[75vh]"
          >
            {/* Prev Button */}
            <button
              onClick={prevPhoto}
              className="absolute left-2 sm:-left-12 p-3 bg-black/60 hover:bg-brand-red text-white transition-colors cursor-pointer z-10"
              aria-label="Previous photo"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Image */}
            <img
              src={filteredPhotos[lightboxIndex].src}
              alt={filteredPhotos[lightboxIndex].caption}
              className="max-h-[72vh] max-w-full object-contain border border-white/10 shadow-2xl"
            />

            {/* Next Button */}
            <button
              onClick={nextPhoto}
              className="absolute right-2 sm:-right-12 p-3 bg-black/60 hover:bg-brand-red text-white transition-colors cursor-pointer z-10"
              aria-label="Next photo"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Caption Footer */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-6xl w-full mx-auto pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs"
          >
            <span className="text-pearl font-medium font-sans text-sm">
              {filteredPhotos[lightboxIndex].caption}
            </span>
            <span className="text-silver text-[11px]">
              Actual rental car at Pieterlen Station Hub • Canton Bern
            </span>
          </div>
        </div>
      )}
    </>
  );
};
