import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, MapPin, Calendar, Clock, ArrowRight, ShieldCheck, AlertCircle, Info } from 'lucide-react';
import { evaluateRentalPricing } from '../../utils/pricingEngine';

export const VehicleBookingBar: React.FC = () => {
  const navigate = useNavigate();

  // Selected vehicle: 'audi-a5' or 'audi-a3'
  const [vehicle, setVehicle] = useState<'audi-a5-sportback' | 'audi-a3-sportback'>('audi-a5-sportback');
  const [pickupLocation, setPickupLocation] = useState<string>('Pieterlen, Switzerland');

  // Dates & Times: default tomorrow 10:00 to 24h later 10:00 (1 day package)
  const defaultDates = useMemo(() => {
    const pickup = new Date();
    pickup.setDate(pickup.getDate() + 1);
    pickup.setHours(10, 0, 0, 0);

    const dropoff = new Date(pickup);
    dropoff.setDate(dropoff.getDate() + 1); // 24 hours later

    const toDateInput = (d: Date) => {
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    };

    return {
      pDate: toDateInput(pickup),
      pTime: '10:00',
      rDate: toDateInput(dropoff),
      rTime: '10:00',
    };
  }, []);

  const [pickupDate, setPickupDate] = useState<string>(defaultDates.pDate);
  const [pickupTime, setPickupTime] = useState<string>(defaultDates.pTime);
  const [returnDate, setReturnDate] = useState<string>(defaultDates.rDate);
  const [returnTime, setReturnTime] = useState<string>(defaultDates.rTime);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Time calculation & Swiss pricing tier evaluation
  const { totalHours, totalDays, isValid, durationLabel } = useMemo(() => {
    if (!pickupDate || !returnDate || !pickupTime || !returnTime) {
      return { totalHours: 0, totalDays: 0, isValid: false, durationLabel: 'Incomplete' };
    }

    const start = new Date(`${pickupDate}T${pickupTime}`).getTime();
    const end = new Date(`${returnDate}T${returnTime}`).getTime();

    if (isNaN(start) || isNaN(end) || end <= start) {
      return { totalHours: 0, totalDays: 0, isValid: false, durationLabel: 'Invalid range' };
    }

    const diffHours = (end - start) / (1000 * 60 * 60);
    const days = Math.max(1, Math.ceil(diffHours / 24));

    return {
      totalHours: Math.round(diffHours * 10) / 10,
      totalDays: days,
      isValid: true,
      durationLabel: `${diffHours.toFixed(0)} Hours (${days} ${days === 1 ? 'Day' : 'Days'})`,
    };
  }, [pickupDate, pickupTime, returnDate, returnTime]);

  const pricing = useMemo(() => {
    return evaluateRentalPricing(vehicle, totalDays);
  }, [vehicle, totalDays]);

  const handleCheckAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setErrorMessage('Return date & time must be strictly after pickup date & time.');
      return;
    }

    setErrorMessage(null);

    // Format ISO timestamps and redirect to booking page
    const startIso = new Date(`${pickupDate}T${pickupTime}`).toISOString();
    const endIso = new Date(`${returnDate}T${returnTime}`).toISOString();

    navigate(
      `/booking?vehicle=${vehicle}&pickup=${encodeURIComponent(startIso)}&return=${encodeURIComponent(endIso)}&location=${encodeURIComponent(pickupLocation)}`
    );
  };

  return (
    <div className="relative z-20 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 -mt-6 lg:-mt-10 mb-8 select-none">
      <form
        onSubmit={handleCheckAvailability}
        className="bg-charcoal/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-2 lg:p-3 transition-all"
      >
        {/* Horizontal Booking Bar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-2 lg:gap-0 items-stretch divide-y md:divide-y-0 lg:divide-x divide-white/10">
          {/* 1. Vehicle Selection */}
          <div className="lg:col-span-3 p-3 flex items-center gap-3.5 group hover:bg-white/[0.02] transition-colors">
            <div className="w-8 h-8 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center text-silver group-hover:text-brand-red group-hover:border-brand-red/30 transition-colors shrink-0">
              <Car size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <label htmlFor="vehicle-select" className="block font-mono text-[9px] uppercase tracking-[0.2em] text-silver mb-1">
                SELECT VEHICLE
              </label>
              <select
                id="vehicle-select"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value as any)}
                className="w-full bg-transparent text-white font-medium text-xs sm:text-sm focus:outline-none cursor-pointer appearance-none truncate pr-4"
              >
                <option value="audi-a5-sportback" className="bg-charcoal text-white">
                  Audi A5 Sportback (286 PS)
                </option>
                <option value="audi-a3-sportback" className="bg-charcoal text-white">
                  Audi A3 Sportback (160 PS)
                </option>
              </select>
            </div>
          </div>

          {/* 2. Pickup Location */}
          <div className="lg:col-span-2 p-3 flex items-center gap-3.5 group hover:bg-white/[0.02] transition-colors">
            <div className="w-8 h-8 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center text-silver group-hover:text-brand-red group-hover:border-brand-red/30 transition-colors shrink-0">
              <MapPin size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <label htmlFor="location-select" className="block font-mono text-[9px] uppercase tracking-[0.2em] text-silver mb-1">
                PICKUP LOCATION
              </label>
              <select
                id="location-select"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="w-full bg-transparent text-white font-medium text-xs sm:text-sm focus:outline-none cursor-pointer appearance-none truncate"
              >
                <option value="Pieterlen, Switzerland" className="bg-charcoal text-white">
                  Pieterlen, Switzerland
                </option>
                <option value="Biel/Bienne Hub" className="bg-charcoal text-white">
                  Biel/Bienne Hub
                </option>
              </select>
            </div>
          </div>

          {/* 3. Pickup Date & Time */}
          <div className="lg:col-span-2 p-3 flex items-center gap-3.5 group hover:bg-white/[0.02] transition-colors">
            <div className="w-8 h-8 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center text-silver group-hover:text-brand-red group-hover:border-brand-red/30 transition-colors shrink-0">
              <Calendar size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <label htmlFor="pickup-date-input" className="block font-mono text-[9px] uppercase tracking-[0.2em] text-silver mb-1">
                PICKUP DATE
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  id="pickup-date-input"
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="bg-transparent text-white text-xs sm:text-sm font-medium focus:outline-none w-[115px] cursor-pointer"
                />
                <input
                  aria-label="Pickup time"
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="bg-transparent text-silver hover:text-white text-xs font-mono focus:outline-none w-[60px] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 4. Return Date & Time */}
          <div className="lg:col-span-2 p-3 flex items-center gap-3.5 group hover:bg-white/[0.02] transition-colors">
            <div className="w-8 h-8 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center text-silver group-hover:text-brand-red group-hover:border-brand-red/30 transition-colors shrink-0">
              <Clock size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <label htmlFor="return-date-input" className="block font-mono text-[9px] uppercase tracking-[0.2em] text-silver mb-1">
                RETURN DATE
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  id="return-date-input"
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="bg-transparent text-white text-xs sm:text-sm font-medium focus:outline-none w-[115px] cursor-pointer"
                />
                <input
                  aria-label="Return time"
                  type="time"
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  className="bg-transparent text-silver hover:text-white text-xs font-mono focus:outline-none w-[60px] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 5. Primary Check Availability CTA Button */}
          <div className="lg:col-span-3 p-2 flex items-center justify-end">
            <button
              type="submit"
              className="w-full h-full min-h-[50px] bg-brand-red hover:bg-brand-red-light text-white font-mono text-xs sm:text-sm font-bold tracking-[0.14em] uppercase py-3.5 px-6 flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-brand-red/30 cursor-pointer"
            >
              <span>CHECK AVAILABILITY</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Live Calculation Feedback Strip */}
        <div className="px-3 pt-2.5 pb-1 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 font-mono text-[11px]">
          {isValid ? (
            <div className="flex flex-wrap items-center gap-4 text-silver">
              <span className="flex items-center gap-1.5 text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Duration: <strong>{durationLabel}</strong></span>
              </span>

              <span className="text-white/20">|</span>

              {pricing.isSupportedDuration && pricing.price ? (
                <span className="text-pearl">
                  Official Swiss Tariff:{' '}
                  <strong className="text-brand-red font-bold text-xs">
                    CHF {pricing.price}
                  </strong>{' '}
                  ({pricing.includedKm} km included)
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1">
                  <Info size={12} />
                  <span>Custom duration: Individual quote required</span>
                </span>
              )}

              <span className="text-white/20 hidden sm:inline">|</span>

              <span className="text-silver hidden sm:inline">
                Refundable Deposit:{' '}
                <strong className="text-pearl font-mono">
                  CHF {pricing.securityDeposit}
                </strong>
              </span>

              <span className="text-white/20 hidden sm:inline">|</span>

              <span className="text-silver hidden md:inline">
                Extra: CHF {pricing.extraKmRate.toFixed(2)}/km
              </span>
            </div>
          ) : (
            <div className="text-brand-red flex items-center gap-2">
              <AlertCircle size={13} />
              <span>{errorMessage || 'Please specify valid pickup and return dates.'}</span>
            </div>
          )}

          <div className="text-silver text-[10px] tracking-wider uppercase ml-auto">
            <span>Direct Swiss Owner Reservation • No Hidden Fees</span>
          </div>
        </div>
      </form>
    </div>
  );
};
