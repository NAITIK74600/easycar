import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Vehicle, Location, Extra } from '../../types';
import { fetchVehicles, fetchExtras, createRentalRequest, calculateServerQuote } from '../../api/client';
import { Calendar, MapPin, Car, Shield, CheckCircle2, AlertCircle, ArrowRight, Loader2, Info, Clock, Truck, UserCheck, AlertTriangle } from 'lucide-react';
import { evaluateRentalPricing } from '../../utils/pricingEngine';

export const QuickBookingSection: React.FC = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('veh-audi-a5');
  const [pickupDate, setPickupDate] = useState<string>('');
  const [returnDate, setReturnDate] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerLicense, setCustomerLicense] = useState<string>('');
  const [customerMessage, setCustomerMessage] = useState<string>('');
  const [paymentPreference, setPaymentPreference] = useState<'online' | 'cash_at_pickup'>('online');
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);

  // Additional services
  const [deliveryRequested, setDeliveryRequested] = useState<boolean>(false);
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [deliveryPostcode, setDeliveryPostcode] = useState<string>('');
  const [deliveryInstructions, setDeliveryInstructions] = useState<string>('');

  const [chauffeurRequested, setChauffeurRequested] = useState<boolean>(false);
  const [chauffeurPickupAddress, setChauffeurPickupAddress] = useState<string>('');
  const [chauffeurDestination, setChauffeurDestination] = useState<string>('');
  const [chauffeurServiceType, setChauffeurServiceType] = useState<string>('one_way');
  const [chauffeurPassengers, setChauffeurPassengers] = useState<number>(1);
  const [chauffeurDuration, setChauffeurDuration] = useState<string>('2 hours');

  const [outOfCountryTravel, setOutOfCountryTravel] = useState<boolean>(false);
  const [additionalDriver, setAdditionalDriver] = useState<boolean>(false);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  // Default dates: tomorrow at 10:00 to 24 hours later at 10:00 (1 standard day)
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const endDate = new Date(tomorrow);
    endDate.setDate(endDate.getDate() + 1); // 1 standard 24h package by default

    const formatForInput = (d: Date) => {
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setPickupDate(formatForInput(tomorrow));
    setReturnDate(formatForInput(endDate));
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [vList, eList] = await Promise.all([
          fetchVehicles(),
          fetchExtras(),
        ]);
        setVehicles(vList);
        setExtras(eList);
        if (vList.length > 0) setSelectedVehicleId(vList[0].id);
      } catch (err: any) {
        setError(err.message || 'Failed to load booking configurations');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  // Calculate duration in days & hours
  const calculateDuration = () => {
    if (!pickupDate || !returnDate) return { days: 1, hours: 24 };
    const start = new Date(pickupDate).getTime();
    const end = new Date(returnDate).getTime();
    if (isNaN(start) || isNaN(end) || end <= start) return { days: 1, hours: 24 };
    const diffHours = (end - start) / (1000 * 60 * 60);
    const days = Math.max(1, Math.ceil(diffHours / 24));
    return { days, hours: Math.round(diffHours * 10) / 10 };
  };

  const { days, hours } = calculateDuration();
  const pricingEval = evaluateRentalPricing(selectedVehicle?.slug || selectedVehicle?.id || '', days);

  // Extras total
  const extrasTotal = selectedExtras.reduce((acc, extraId) => {
    const extra = extras.find((e) => e.id === extraId);
    if (!extra) return acc;
    return acc + (extra.flat_rate ? Number(extra.flat_rate) : Number(extra.daily_rate) * days);
  }, 0);

  const baseRental = pricingEval.price ?? 0;
  const grandTotal = baseRental + extrasTotal;

  // Duration presets: 1, 3, 7, 14, 30 days
  const selectDurationPreset = (numDays: number) => {
    const start = pickupDate ? new Date(pickupDate) : new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + numDays);
    const pad = (n: number) => String(n).padStart(2, '0');
    setReturnDate(`${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(end.getHours())}:${pad(end.getMinutes())}`);
  };

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedVehicle) {
      setError('Please select a vehicle.');
      return;
    }
    if (!customerName || !customerEmail || !customerPhone) {
      setError('Full name, email address, and telephone number are required.');
      return;
    }
    if (!termsAccepted) {
      setError('You must accept the Swiss rental terms and cancellation policies before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await createRentalRequest({
        vehicle_id: selectedVehicle.id,
        pickup_date: pickupDate,
        return_date: returnDate,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_license: customerLicense || undefined,
        delivery_requested: deliveryRequested,
        delivery_address: deliveryRequested ? deliveryAddress : undefined,
        delivery_postcode: deliveryRequested ? deliveryPostcode : undefined,
        delivery_instructions: deliveryRequested ? deliveryInstructions : undefined,
        chauffeur_requested: chauffeurRequested,
        chauffeur_pickup_address: chauffeurRequested ? chauffeurPickupAddress : undefined,
        chauffeur_destination: chauffeurRequested ? chauffeurDestination : undefined,
        chauffeur_service_type: chauffeurRequested ? chauffeurServiceType : undefined,
        chauffeur_passengers: chauffeurRequested ? chauffeurPassengers : undefined,
        chauffeur_estimated_duration: chauffeurRequested ? chauffeurDuration : undefined,
        out_of_country_travel: outOfCountryTravel,
        additional_driver_requested: additionalDriver,
        customer_message: customerMessage || undefined,
        payment_preference: paymentPreference,
        terms_accepted: termsAccepted,
        extras: selectedExtras,
      });

      // Redirect to confirmed reservation receipt
      navigate(`/booking/confirmation/${res.booking.booking_ref}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit rental request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reservation-portal" className="relative w-full bg-charcoal section-spacing overflow-hidden border-t border-white/5">
      <div className="section-container">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <span className="label-technical text-brand-red text-xs block mb-2 font-mono">
            OFFICIAL RENTAL INQUIRY • PIETERLEN, SWITZERLAND
          </span>
          <h2 className="heading-section text-white font-display">
            REQUEST YOUR VEHICLE.
          </h2>
          <p className="text-ash text-sm md:text-base leading-relaxed mt-2">
            Every request is manually reviewed and approved by the vehicle owner. Select your preferred vehicle and period to check real-time availability.
          </p>
        </div>

        {error && (
          <div className="p-4 mb-8 bg-red-950/80 border border-brand-red flex items-start gap-3 text-red-200 text-xs font-mono">
            <AlertCircle size={18} className="text-brand-red flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block uppercase font-bold mb-0.5">Reservation Validation Issue</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-24 flex items-center justify-center">
            <Loader2 className="animate-spin text-brand-red" size={36} />
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 8 Cols: Booking Configuration Steps */}
            <div className="lg:col-span-8 space-y-8">
              {/* Step 1: Vehicle Selection */}
              <div className="bg-obsidian border border-white/10 p-6 md:p-8">
                <span className="label-technical text-brand-red text-[10px] block mb-2 font-mono">STEP 1 OF 3</span>
                <h3 className="text-xl font-bold text-white mb-6 font-display">Select Vehicle</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vehicles.map((v) => {
                    const isSelected = selectedVehicleId === v.id;
                    const isA5 = v.slug.includes('a5');
                    return (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVehicleId(v.id)}
                        className={`p-4 border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-charcoal border-brand-red shadow-lg shadow-brand-red/10'
                            : 'bg-charcoal/40 border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-4 h-4 rounded-full border mt-1 flex items-center justify-center ${
                            isSelected ? 'border-brand-red bg-brand-red' : 'border-white/30'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-brand-red uppercase font-bold block">
                              {isA5 ? 'Audi A5 • V6 TDI quattro (286 PS)' : 'Audi A3 • 1.8 TFSI quattro (160 PS)'}
                            </span>
                            <h4 className="text-sm font-bold text-white">{v.name}</h4>
                            <span className="text-[11px] font-mono text-silver capitalize">
                              {v.transmission} • {v.category} • Deposit CHF {isA5 ? '500' : '300'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right border-t border-white/5 pt-2 flex items-baseline justify-between">
                          <span className="text-[10px] font-mono text-silver">From</span>
                          <div>
                            <span className="text-base font-bold font-display text-white">
                              CHF {isA5 ? '110' : '65'}
                            </span>
                            <span className="text-[10px] font-mono text-silver"> / 24H</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Rental Duration & Published Packages */}
              <div className="bg-obsidian border border-white/10 p-6 md:p-8">
                <span className="label-technical text-brand-red text-[10px] block mb-2 font-mono">STEP 2 OF 3</span>
                <h3 className="text-xl font-bold text-white mb-6 font-display">Rental Period & Handover Times</h3>

                {/* Duration Presets */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="label-technical text-silver text-[10px] block font-mono">
                      AGREED 24-HOUR PACKAGES
                    </label>
                    <span className="text-[10px] font-mono text-brand-red">
                      {pricingEval.isSupportedDuration
                        ? `${pricingEval.matchedPackage?.label} active`
                        : `${days} days (${hours}h) — Individual quote required`}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { d: 1, label: '1 Day / 24h', km: selectedVehicle?.slug.includes('a5') ? '200 km' : '150 km' },
                      { d: 3, label: '3 Days / 72h', km: selectedVehicle?.slug.includes('a5') ? '600 km' : '450 km' },
                      { d: 7, label: '7 Days', km: selectedVehicle?.slug.includes('a5') ? '1,200 km' : '1,000 km' },
                      { d: 14, label: '14 Days', km: selectedVehicle?.slug.includes('a5') ? '1,800 km' : '1,500 km' },
                      { d: 30, label: '30 Days', km: selectedVehicle?.slug.includes('a5') ? '2,500 km' : '2,000 km' },
                    ].map((preset) => {
                      const isActive = days === preset.d;
                      return (
                        <button
                          key={preset.d}
                          type="button"
                          onClick={() => selectDurationPreset(preset.d)}
                          className={`p-2.5 text-left border cursor-pointer transition-all ${
                            isActive
                              ? 'bg-brand-red text-white border-brand-red font-bold shadow-md shadow-brand-red/20'
                              : 'bg-charcoal text-silver border-white/5 hover:border-white/20 hover:text-white'
                          }`}
                        >
                          <span className="block text-[11px] font-mono uppercase">{preset.label}</span>
                          <span className={`block text-[9px] font-mono ${isActive ? 'text-white/80' : 'text-ash'}`}>
                            {preset.km}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label-technical text-silver text-[10px] block mb-2 font-mono">
                      PICKUP DATE & TIME (PIETERLEN)
                    </label>
                    <input
                      type="datetime-local"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      required
                      className="input-dark font-mono text-xs w-full"
                    />
                  </div>

                  <div>
                    <label className="label-technical text-silver text-[10px] block mb-2 font-mono">
                      RETURN DATE & TIME
                    </label>
                    <input
                      type="datetime-local"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      required
                      className="input-dark font-mono text-xs w-full"
                    />
                  </div>
                </div>

                {/* Duration Status Banner */}
                <div className={`mt-5 p-4 border text-xs font-mono ${
                  pricingEval.isSupportedDuration
                    ? 'bg-charcoal border-white/10'
                    : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                }`}>
                  {pricingEval.isSupportedDuration ? (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-silver block text-[10px] uppercase">PUBLISHED PACKAGE</span>
                        <strong className="text-white text-sm">
                          CHF {pricingEval.price} (includes {pricingEval.includedKm?.toLocaleString()} km)
                        </strong>
                      </div>
                      <div>
                        <span className="text-silver block text-[10px] uppercase">ADDITIONAL KILOMETRES</span>
                        <strong className="text-brand-red text-sm">CHF {pricingEval.extraKmRate.toFixed(2)} / km</strong>
                      </div>
                      <div>
                        <span className="text-silver block text-[10px] uppercase">REFUNDABLE DEPOSIT</span>
                        <strong className="text-emerald-400 text-sm">CHF {pricingEval.securityDeposit} (Cash)</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-amber-300 uppercase">Individual Quote Required</strong>
                        <p className="text-[11px] text-amber-200/80 leading-relaxed mt-0.5">
                          The requested period ({days} days / {hours} hours) falls outside our standard packages (1, 3, 7, 14, 30 days). Submit your request and the vehicle owner will issue a custom quote.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Optional Services & Customer Details */}
              <div className="bg-obsidian border border-white/10 p-6 md:p-8 space-y-6">
                <span className="label-technical text-brand-red text-[10px] block mb-2 font-mono">STEP 3 OF 3</span>
                <h3 className="text-xl font-bold text-white mb-6 font-display">Optional Services & Details</h3>

                {/* Delivery Service Accordion */}
                <div className="border border-white/10 p-4 bg-charcoal">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setDeliveryRequested(!deliveryRequested)}>
                    <div className="flex items-center gap-3">
                      <Truck size={18} className={deliveryRequested ? 'text-brand-red' : 'text-silver'} />
                      <div>
                        <strong className="text-sm text-white block">Vehicle Delivery Service</strong>
                        <span className="text-[11px] font-mono text-silver">Delivery to your residence or private address</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-white/5 text-silver">Price on request</span>
                      <input type="checkbox" checked={deliveryRequested} onChange={() => {}} className="accent-brand-red" />
                    </div>
                  </div>

                  {deliveryRequested && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-3 font-mono text-xs">
                      <div>
                        <label className="text-[10px] text-silver block mb-1">DELIVERY STREET ADDRESS</label>
                        <input
                          type="text"
                          placeholder="e.g. Bahnhofstrasse 10"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="input-dark w-full"
                          required={deliveryRequested}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-silver block mb-1">POSTCODE / CITY</label>
                          <input
                            type="text"
                            placeholder="e.g. 2500 Biel"
                            value={deliveryPostcode}
                            onChange={(e) => setDeliveryPostcode(e.target.value)}
                            className="input-dark w-full"
                            required={deliveryRequested}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-silver block mb-1">OPTIONAL INSTRUCTIONS</label>
                          <input
                            type="text"
                            placeholder="e.g. Gate code, concierge"
                            value={deliveryInstructions}
                            onChange={(e) => setDeliveryInstructions(e.target.value)}
                            className="input-dark w-full"
                          />
                        </div>
                      </div>
                      <span className="text-[10px] text-ash block">
                        • Delivery fee will be itemized by the owner in your customized quote.
                      </span>
                    </div>
                  )}
                </div>

                {/* Chauffeur Service Accordion */}
                <div className="border border-white/10 p-4 bg-charcoal">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setChauffeurRequested(!chauffeurRequested)}>
                    <div className="flex items-center gap-3">
                      <UserCheck size={18} className={chauffeurRequested ? 'text-brand-red' : 'text-silver'} />
                      <div>
                        <strong className="text-sm text-white block">Professional Chauffeur Service</strong>
                        <span className="text-[11px] font-mono text-silver">Chauffeured transit for business or events</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-white/5 text-silver">Price on request</span>
                      <input type="checkbox" checked={chauffeurRequested} onChange={() => {}} className="accent-brand-red" />
                    </div>
                  </div>

                  {chauffeurRequested && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-3 font-mono text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-silver block mb-1">PICKUP LOCATION</label>
                          <input
                            type="text"
                            placeholder="e.g. Zurich Airport (ZRH)"
                            value={chauffeurPickupAddress}
                            onChange={(e) => setChauffeurPickupAddress(e.target.value)}
                            className="input-dark w-full"
                            required={chauffeurRequested}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-silver block mb-1">DESTINATION</label>
                          <input
                            type="text"
                            placeholder="e.g. Gstaad Palace"
                            value={chauffeurDestination}
                            onChange={(e) => setChauffeurDestination(e.target.value)}
                            className="input-dark w-full"
                            required={chauffeurRequested}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] text-silver block mb-1">SERVICE TYPE</label>
                          <select
                            value={chauffeurServiceType}
                            onChange={(e) => setChauffeurServiceType(e.target.value)}
                            className="select-dark w-full text-xs"
                          >
                            <option value="one_way">One-Way Transfer</option>
                            <option value="return_trip">Round Trip</option>
                            <option value="hourly">Hourly As Directed</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-silver block mb-1">PASSENGERS</label>
                          <input
                            type="number"
                            min={1}
                            max={4}
                            value={chauffeurPassengers}
                            onChange={(e) => setChauffeurPassengers(parseInt(e.target.value) || 1)}
                            className="input-dark w-full text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-silver block mb-1">ESTIMATED DURATION</label>
                          <input
                            type="text"
                            value={chauffeurDuration}
                            onChange={(e) => setChauffeurDuration(e.target.value)}
                            className="input-dark w-full text-xs"
                          />
                        </div>
                      </div>
                      <span className="text-[10px] text-ash block">
                        • Subject to driver scheduling and confirmation. Chauffeur rate will be added to the complete quote.
                      </span>
                    </div>
                  )}
                </div>

                {/* Additional Travel Checkboxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <label className="p-3 bg-charcoal border border-white/5 flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={outOfCountryTravel}
                      onChange={(e) => setOutOfCountryTravel(e.target.checked)}
                      className="accent-brand-red"
                    />
                    <div>
                      <span className="text-white block font-bold">Cross-Border Travel</span>
                      <span className="text-[10px] text-silver">Planned journey outside Switzerland</span>
                    </div>
                  </label>

                  <label className="p-3 bg-charcoal border border-white/5 flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={additionalDriver}
                      onChange={(e) => setAdditionalDriver(e.target.checked)}
                      className="accent-brand-red"
                    />
                    <div>
                      <span className="text-white block font-bold">Additional Driver</span>
                      <span className="text-[10px] text-silver">Register a second authorized driver</span>
                    </div>
                  </label>
                </div>

                {/* Contact Information Fields */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h4 className="text-sm font-bold text-white uppercase font-mono">Primary Driver Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label-technical text-silver text-[10px] block mb-1 font-mono">FULL NAME *</label>
                      <input
                        type="text"
                        placeholder="Jean-Luc Bernois"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                        className="input-dark w-full font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="label-technical text-silver text-[10px] block mb-1 font-mono">EMAIL ADDRESS *</label>
                      <input
                        type="email"
                        placeholder="jeanluc@bluewin.ch"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        required
                        className="input-dark w-full font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="label-technical text-silver text-[10px] block mb-1 font-mono">MOBILE TELEPHONE *</label>
                      <input
                        type="tel"
                        placeholder="+41 79 123 45 67"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        required
                        className="input-dark w-full font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label-technical text-silver text-[10px] block mb-1 font-mono">
                      OPTIONAL MESSAGE / SPECIAL TIMING REQUEST
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Arriving on train from Bern at 10:15; key handover at Pieterlen Station."
                      value={customerMessage}
                      onChange={(e) => setCustomerMessage(e.target.value)}
                      className="input-dark w-full text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Payment Preference */}
                <div className="pt-4 border-t border-white/5">
                  <label className="label-technical text-silver text-[10px] block mb-2 font-mono">
                    PAYMENT PREFERENCE *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <label className={`p-3 border cursor-pointer flex items-center gap-3 ${
                      paymentPreference === 'online' ? 'bg-charcoal border-brand-red' : 'bg-charcoal/40 border-white/5'
                    }`}>
                      <input
                        type="radio"
                        name="payment_pref"
                        value="online"
                        checked={paymentPreference === 'online'}
                        onChange={() => setPaymentPreference('online')}
                        className="accent-brand-red"
                      />
                      <div>
                        <strong className="text-white block">Online Payment (Card / TWINT)</strong>
                        <span className="text-[10px] text-silver">Pay online after owner approves request</span>
                      </div>
                    </label>

                    <label className={`p-3 border cursor-pointer flex items-center gap-3 ${
                      paymentPreference === 'cash_at_pickup' ? 'bg-charcoal border-brand-red' : 'bg-charcoal/40 border-white/5'
                    }`}>
                      <input
                        type="radio"
                        name="payment_pref"
                        value="cash_at_pickup"
                        checked={paymentPreference === 'cash_at_pickup'}
                        onChange={() => setPaymentPreference('cash_at_pickup')}
                        className="accent-brand-red"
                      />
                      <div>
                        <strong className="text-white block">Cash at Handover</strong>
                        <span className="text-[10px] text-silver">Full rental + deposit payable in cash at pickup</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Mandatory Terms Acceptance Checkbox (Initially Unticked) */}
                <div className="p-4 bg-obsidian border border-brand-red/30 space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer text-xs font-mono">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      required
                      className="mt-0.5 accent-brand-red w-4 h-4 cursor-pointer"
                    />
                    <div className="text-pearl leading-relaxed">
                      <strong className="text-white">I accept the binding Swiss Rental Terms & Policies *</strong>
                      <span className="block text-[11px] text-silver mt-1">
                        I understand that: (1) My request is subject to manual owner approval; (2) Refundable security deposit (CHF {pricingEval.securityDeposit}) is payable in cash before vehicle handover; (3) Fuel is excluded and vehicle must be returned with a full fuel tank; (4) Confirmed bookings are subject to 100% cancellation charges.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Live Price Breakdown Dossier */}
            <div className="lg:col-span-4">
              <div className="bg-obsidian border border-white/10 p-6 md:p-8 sticky top-28 shadow-2xl">
                <span className="label-technical text-brand-red text-[10px] block mb-2 font-mono">RESERVATION DOSSIER</span>
                <h3 className="text-xl font-bold text-white mb-6 font-display">Tariff Overview</h3>

                {selectedVehicle && (
                  <div className="pb-6 mb-6 border-b border-white/10">
                    <img
                      src={selectedVehicle.images[0]}
                      alt={selectedVehicle.name}
                      className="w-full h-36 object-cover mb-3 border border-white/5"
                    />
                    <h4 className="font-bold text-white text-base">{selectedVehicle.name}</h4>
                    <div className="flex items-center justify-between text-xs font-mono text-silver mt-1">
                      <span>{days} {days === 1 ? 'Day' : 'Days'} ({hours}h duration)</span>
                      <span className="text-brand-red font-bold">
                        {pricingEval.isSupportedDuration ? `${pricingEval.includedKm} km incl.` : 'Custom km'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-3 font-mono text-xs mb-6">
                  <div className="flex justify-between text-silver">
                    <span>Base Vehicle Rental</span>
                    <span className="text-white font-bold">
                      {pricingEval.isSupportedDuration ? `CHF ${baseRental.toFixed(2)}` : 'Pending Quote'}
                    </span>
                  </div>

                  {deliveryRequested && (
                    <div className="flex justify-between text-silver">
                      <span>Delivery Service Fee</span>
                      <span className="text-amber-400 font-bold">Price on request</span>
                    </div>
                  )}

                  {chauffeurRequested && (
                    <div className="flex justify-between text-silver">
                      <span>Chauffeur Service Fee</span>
                      <span className="text-amber-400 font-bold">Price on request</span>
                    </div>
                  )}

                  {extrasTotal > 0 && (
                    <div className="flex justify-between text-silver">
                      <span>Selected Equipment ({selectedExtras.length})</span>
                      <span className="text-white font-bold">CHF {extrasTotal.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-white/10 flex justify-between items-baseline">
                    <span className="text-white font-bold uppercase text-sm">ESTIMATED PAYABLE</span>
                    <span className="text-2xl font-black font-display text-brand-red">
                      {pricingEval.isSupportedDuration ? `CHF ${grandTotal.toFixed(2)}` : 'On Request'}
                    </span>
                  </div>
                </div>

                {/* Refundable Deposit Separate Strip */}
                <div className="p-3 bg-charcoal border border-white/5 text-[11px] font-mono text-silver mb-4 space-y-1">
                  <div className="flex justify-between items-center text-emerald-400 font-bold">
                    <span>REFUNDABLE SECURITY DEPOSIT</span>
                    <span>CHF {pricingEval.securityDeposit}.00</span>
                  </div>
                  <span className="text-[10px] text-ash block">
                    Payable in cash at pickup. Kept strictly separate from rental charges and returned upon inspection.
                  </span>
                </div>

                {/* Status Notice */}
                <div className="p-3 bg-charcoal/60 border border-white/5 text-[10px] font-mono text-silver mb-6">
                  <div className="flex items-center gap-1.5 text-brand-red mb-1 font-bold uppercase">
                    <Clock size={13} />
                    <span>MANUAL OWNER APPROVAL</span>
                  </div>
                  <span>Your booking is not confirmed until the owner approves it. No upfront payment is charged today.</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full py-4 text-xs font-mono tracking-widest flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={15} />
                      <span>SUBMITTING INQUIRY...</span>
                    </>
                  ) : (
                    <>
                      <span>SUBMIT RENTAL REQUEST</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
