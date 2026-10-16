import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchVehicles, createRentalRequest, calculateServerQuote } from '../api/client';
import { Vehicle } from '../types';
import {
  Calendar,
  Car,
  Shield,
  Check,
  AlertCircle,
  ArrowRight,
  Loader2,
  Info,
  Clock,
  Sparkles,
  MapPin,
  HelpCircle,
  Banknote,
  CreditCard,
  Truck,
  UserCheck
} from 'lucide-react';
import { calculateRentalTariff } from '../utils/pricingEngine';

const STANDARD_PACKAGES = [
  { days: 1, hours: 24, label: '1 Day / 24h' },
  { days: 3, hours: 72, label: '3 Days / 72h' },
  { days: 7, hours: 168, label: '7 Days' },
  { days: 14, hours: 336, label: '14 Days' },
  { days: 30, hours: 720, label: '30 Days' },
];

export const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form inputs
  const [vehicleId, setVehicleId] = useState<string>('');
  const [pickupDate, setPickupDate] = useState<string>('');
  const [returnDate, setReturnDate] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [paymentPreference, setPaymentPreference] = useState<'online' | 'cash'>('cash');
  const [notes, setNotes] = useState<string>('');

  // Additional fields per specs
  const [crossBorder, setCrossBorder] = useState<boolean>(false);
  const [additionalDriver, setAdditionalDriver] = useState<boolean>(false);

  // Delivery service request
  const [deliveryRequested, setDeliveryRequested] = useState<boolean>(false);
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [deliveryPostcode, setDeliveryPostcode] = useState<string>('');
  const [deliveryInstructions, setDeliveryInstructions] = useState<string>('');

  // Chauffeur service request
  const [chauffeurRequested, setChauffeurRequested] = useState<boolean>(false);
  const [chauffeurPickup, setChauffeurPickup] = useState<string>('');
  const [chauffeurDestination, setChauffeurDestination] = useState<string>('');
  const [chauffeurPassengers, setChauffeurPassengers] = useState<number>(1);
  const [chauffeurTripType, setChauffeurTripType] = useState<string>('one_way');

  // Terms acceptance: MUST BE INITIALLY UNTICKED
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [termsModalOpen, setTermsModalOpen] = useState<boolean>(false);

  // Server quote snapshot
  const [serverQuote, setServerQuote] = useState<any>(null);
  const [calculatingQuote, setCalculatingQuote] = useState<boolean>(false);

  // Initialize dates: default to 1 day / 24 hours from tomorrow 10:00
  useEffect(() => {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(10, 0, 0, 0);

    const end = new Date(start);
    end.setHours(end.getHours() + 24);

    const pad = (n: number) => String(n).padStart(2, '0');
    setPickupDate(`${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}T${pad(start.getHours())}:${pad(start.getMinutes())}`);
    setReturnDate(`${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(end.getHours())}:${pad(end.getMinutes())}`);
  }, []);

  // Fetch vehicles
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const vData = await fetchVehicles();
        setVehicles(vData);

        const initialSlug = searchParams.get('vehicle');
        const match = vData.find((v) => v.slug === initialSlug || v.id === initialSlug);
        if (match) {
          setVehicleId(match.id);
        } else if (vData.length > 0) {
          setVehicleId(vData[0].id);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to initialize booking');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [searchParams]);

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId) || vehicles[0];

  // Calculate pricing client-side as immediate feedback
  const clientTariff = selectedVehicle && pickupDate && returnDate
    ? calculateRentalTariff(
        selectedVehicle.slug || selectedVehicle.id,
        new Date(pickupDate),
        new Date(returnDate)
      )
    : null;

  // Sync with server quote API for authoritative snapshot
  useEffect(() => {
    let active = true;
    if (!selectedVehicle || !pickupDate || !returnDate) return;

    async function syncQuote() {
      try {
        setCalculatingQuote(true);
        const quote = await calculateServerQuote({
          vehicle_id: selectedVehicle.id,
          pickup_date: pickupDate,
          return_date: returnDate,
          delivery_requested: deliveryRequested,
          chauffeur_requested: chauffeurRequested,
        });
        if (active) {
          setServerQuote(quote);
        }
      } catch (e) {
        // Fallback to client tariff if server call fails
        if (active) setServerQuote(null);
      } finally {
        if (active) setCalculatingQuote(false);
      }
    }

    const timer = setTimeout(syncQuote, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [selectedVehicle?.id, pickupDate, returnDate, deliveryRequested, chauffeurRequested]);

  // Handle standard package selection
  const selectPackagePreset = (hours: number) => {
    const start = pickupDate ? new Date(pickupDate) : new Date();
    const end = new Date(start.getTime() + hours * 3600 * 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    setReturnDate(`${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(end.getHours())}:${pad(end.getMinutes())}`);
  };

  const currentHours = clientTariff?.hours || 24;
  const isIndividualQuote = serverQuote
    ? serverQuote.pricing_mode === 'individual_quote'
    : clientTariff?.isIndividualQuote;

  const depositAmount = serverQuote?.security_deposit || clientTariff?.deposit || (selectedVehicle?.slug.includes('a5') ? 500 : 300);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!vehicleId) {
      setError('Please choose a vehicle.');
      return;
    }
    if (!pickupDate || !returnDate) {
      setError('Please select valid pickup and return dates and times.');
      return;
    }
    if (new Date(returnDate) <= new Date(pickupDate)) {
      setError('Return date and time must be after pickup date and time.');
      return;
    }
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError('Full name, email address, and mobile phone number are required.');
      return;
    }
    if (!termsAccepted) {
      setError('You must read and accept the Swiss Rental Terms & Cancellation Policy before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await createRentalRequest({
        vehicle_id: vehicleId,
        pickup_date: pickupDate,
        return_date: returnDate,
        customer_name: name.trim(),
        customer_email: email.trim(),
        customer_phone: phone.trim(),
        payment_preference: paymentPreference,
        terms_accepted: termsAccepted,
        travel_outside_switzerland: crossBorder,
        additional_driver: additionalDriver,
        notes: notes.trim() || undefined,
        delivery_requested: deliveryRequested,
        delivery_address: deliveryRequested ? `${deliveryAddress}, ${deliveryPostcode}` : undefined,
        delivery_instructions: deliveryRequested ? deliveryInstructions : undefined,
        chauffeur_requested: chauffeurRequested,
        chauffeur_details: chauffeurRequested
          ? `From: ${chauffeurPickup} | To: ${chauffeurDestination} | Passengers: ${chauffeurPassengers} | Service: ${chauffeurTripType}`
          : undefined,
      });

      navigate(`/booking/confirmation/${res.booking.booking_ref}`);
    } catch (err: any) {
      setError(err.message || 'Rental request submission failed. Please try again or call +41 79 388 99 97.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-obsidian text-pearl pt-32 pb-24">
      <div className="section-container">
        {/* Header */}
        <div className="max-w-3xl mb-10">
          <span className="label-technical text-brand-red text-xs block mb-2 font-mono">
            EASY CARS BIEL • RESERVATION INQUIRY
          </span>
          <h1 className="heading-hero text-3xl md:text-5xl text-white mb-4 font-display">
            REQUEST A VEHICLE.
          </h1>
          <p className="text-ash text-sm md:text-base leading-relaxed">
            Configure your rental package for our Audi fleet based in Pieterlen, Switzerland.
            All requests are reviewed directly by the owner before confirmation. No advance payment is charged until approved.
          </p>
        </div>

        {/* Notice of Approval Workflow */}
        <div className="p-4 bg-charcoal border-l-4 border-brand-red border-white/10 mb-8 flex items-start gap-3 text-xs font-mono text-silver">
          <Info size={18} className="text-brand-red flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block uppercase mb-0.5">Transparent Rental Process</strong>
            <span>
              Your booking is not confirmed immediately upon submission. The owner will review your dates, schedule, and requested services.
              Once approved, you will receive payment or cash-at-handover instructions.
            </span>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-8 bg-red-950/70 border border-red-500 flex items-start gap-3 text-red-200 text-xs font-mono">
            <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block uppercase">Validation Error</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-24 flex items-center justify-center">
            <Loader2 className="animate-spin text-brand-red" size={36} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Form Details */}
            <div className="lg:col-span-8 space-y-8">
              {/* Step 1: Vehicle Selection */}
              <div className="p-6 md:p-8 bg-charcoal border border-white/10">
                <span className="label-technical text-brand-red text-[10px] block mb-1">STEP 01</span>
                <h3 className="text-lg font-bold text-white mb-4 font-display">Select Your Vehicle</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {vehicles.map((v) => {
                    const isSelected = vehicleId === v.id;
                    const isA5 = v.slug.includes('a5');
                    return (
                      <div
                        key={v.id}
                        onClick={() => setVehicleId(v.id)}
                        className={`p-4 border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-brand-red bg-brand-red/10 shadow-lg'
                            : 'border-white/10 bg-obsidian/60 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-display font-bold text-white text-base">{v.name}</span>
                          {isSelected && <Check size={16} className="text-brand-red" />}
                        </div>
                        <p className="text-xs text-silver font-mono mb-3">
                          {isA5 ? '2018 • 286 PS • 3.0 TDI quattro • Automatik' : '2011 • 160 PS • 1.8 TFSI quattro • Manual'}
                        </p>
                        <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs font-mono">
                          <span className="text-silver">From</span>
                          <span className="text-white font-bold">{isA5 ? 'CHF 110 / 24h' : 'CHF 65 / 24h'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Rental Dates and Standard Packages */}
              <div className="p-6 md:p-8 bg-charcoal border border-white/10">
                <span className="label-technical text-brand-red text-[10px] block mb-1">STEP 02</span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <h3 className="text-lg font-bold text-white font-display">Rental Schedule & Duration</h3>
                  <span className="text-xs font-mono text-silver">24h = 1 Rental Day • Fuel Excluded</span>
                </div>

                {/* Package Quick Selectors */}
                <div className="mb-6">
                  <label className="label-technical text-silver text-[10px] block mb-2">
                    OFFICIAL SWISS TARIFF PACKAGES (RECOMMENDED)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {STANDARD_PACKAGES.map((pkg) => {
                      const isMatch = Math.round(currentHours) === pkg.hours;
                      return (
                        <button
                          key={pkg.hours}
                          type="button"
                          onClick={() => selectPackagePreset(pkg.hours)}
                          className={`py-2 px-3 border text-xs font-mono text-center transition-all ${
                            isMatch
                              ? 'border-brand-red bg-brand-red text-white font-bold'
                              : 'border-white/10 bg-obsidian hover:border-white/30 text-silver'
                          }`}
                        >
                          <span className="block">{pkg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Date Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="label-technical text-silver text-[10px] block mb-1">
                      PICKUP DATE & TIME (PIETERLEN HUB) *
                    </label>
                    <input
                      type="datetime-local"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      required
                      className="input-dark w-full text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="label-technical text-silver text-[10px] block mb-1">
                      RETURN DATE & TIME (PIETERLEN HUB) *
                    </label>
                    <input
                      type="datetime-local"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      required
                      className="input-dark w-full text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Duration & Package Feedback */}
                <div className="p-3 bg-obsidian border border-white/5 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-brand-red" />
                    <span className="text-silver">Requested Duration:</span>
                    <strong className="text-white">{Math.round(currentHours)} hours</strong>
                  </div>
                  <div>
                    {isIndividualQuote ? (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 font-bold text-[11px] uppercase border border-amber-500/30">
                        Individual quote required
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold text-[11px] uppercase border border-emerald-500/30">
                        Standard Package Applied
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 3: Optional Vehicle Services */}
              <div className="p-6 md:p-8 bg-charcoal border border-white/10 space-y-6">
                <span className="label-technical text-brand-red text-[10px] block mb-1">STEP 03</span>
                <h3 className="text-lg font-bold text-white font-display">Optional Bespoke Services</h3>

                {/* Delivery Service Accordion */}
                <div className="border border-white/10 p-4 bg-obsidian/70">
                  <label className="flex items-center justify-between cursor-pointer mb-3">
                    <div className="flex items-center gap-3">
                      <Truck size={18} className="text-brand-red" />
                      <div>
                        <span className="font-bold text-white text-sm block">Vehicle Delivery Service</span>
                        <span className="text-xs font-mono text-silver">Direct delivery to your residence, hotel or airport</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono px-2 py-0.5 bg-white/5 text-silver border border-white/10">
                        Price on request
                      </span>
                      <input
                        type="checkbox"
                        checked={deliveryRequested}
                        onChange={(e) => setDeliveryRequested(e.target.checked)}
                        className="w-4 h-4 accent-brand-red cursor-pointer"
                      />
                    </div>
                  </label>

                  {deliveryRequested && (
                    <div className="pt-4 border-t border-white/10 space-y-3 font-mono text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-[10px] text-silver block mb-1">DELIVERY STREET & NUMBER *</label>
                          <input
                            type="text"
                            placeholder="e.g. Bahnhofstrasse 45"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            required={deliveryRequested}
                            className="input-dark w-full"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-silver block mb-1">POSTCODE & CITY *</label>
                          <input
                            type="text"
                            placeholder="e.g. 2502 Biel"
                            value={deliveryPostcode}
                            onChange={(e) => setDeliveryPostcode(e.target.value)}
                            required={deliveryRequested}
                            className="input-dark w-full"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-silver block mb-1">DELIVERY INSTRUCTIONS (OPTIONAL)</label>
                        <input
                          type="text"
                          placeholder="Gate code, concierge contact, preferred delivery window"
                          value={deliveryInstructions}
                          onChange={(e) => setDeliveryInstructions(e.target.value)}
                          className="input-dark w-full"
                        />
                      </div>
                      <p className="text-[10px] text-ash">
                        * Delivery fee will be individually calculated by the owner and added to your quote for acceptance.
                      </p>
                    </div>
                  )}
                </div>

                {/* Chauffeur Service Accordion */}
                <div className="border border-white/10 p-4 bg-obsidian/70">
                  <label className="flex items-center justify-between cursor-pointer mb-3">
                    <div className="flex items-center gap-3">
                      <UserCheck size={18} className="text-brand-red" />
                      <div>
                        <span className="font-bold text-white text-sm block">Chauffeur Service</span>
                        <span className="text-xs font-mono text-silver">Professional driver with the vehicle</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono px-2 py-0.5 bg-white/5 text-silver border border-white/10">
                        Price on request
                      </span>
                      <input
                        type="checkbox"
                        checked={chauffeurRequested}
                        onChange={(e) => setChauffeurRequested(e.target.checked)}
                        className="w-4 h-4 accent-brand-red cursor-pointer"
                      />
                    </div>
                  </label>

                  {chauffeurRequested && (
                    <div className="pt-4 border-t border-white/10 space-y-3 font-mono text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-silver block mb-1">PICKUP ADDRESS *</label>
                          <input
                            type="text"
                            placeholder="Pickup address"
                            value={chauffeurPickup}
                            onChange={(e) => setChauffeurPickup(e.target.value)}
                            required={chauffeurRequested}
                            className="input-dark w-full"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-silver block mb-1">DESTINATION *</label>
                          <input
                            type="text"
                            placeholder="Destination or area"
                            value={chauffeurDestination}
                            onChange={(e) => setChauffeurDestination(e.target.value)}
                            required={chauffeurRequested}
                            className="input-dark w-full"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-silver block mb-1">PASSENGERS</label>
                          <select
                            value={chauffeurPassengers}
                            onChange={(e) => setChauffeurPassengers(Number(e.target.value))}
                            className="input-dark w-full text-xs"
                          >
                            <option value={1}>1 Passenger</option>
                            <option value={2}>2 Passengers</option>
                            <option value={3}>3 Passengers</option>
                            <option value={4}>4 Passengers (Max)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-silver block mb-1">SERVICE TYPE</label>
                          <select
                            value={chauffeurTripType}
                            onChange={(e) => setChauffeurTripType(e.target.value)}
                            className="input-dark w-full text-xs"
                          >
                            <option value="one_way">One-way Transfer</option>
                            <option value="round_trip">Round Trip</option>
                            <option value="hourly">Hourly As Directed</option>
                          </select>
                        </div>
                      </div>
                      <p className="text-[10px] text-ash">
                        * Chauffeur service is subject to owner authorization and driver availability. Quote will specify rate.
                      </p>
                    </div>
                  )}
                </div>

                {/* Checkboxes: Cross-border and Additional Driver */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <label className="flex items-start gap-3 p-3 bg-obsidian border border-white/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={crossBorder}
                      onChange={(e) => setCrossBorder(e.target.checked)}
                      className="w-4 h-4 accent-brand-red mt-0.5 cursor-pointer"
                    />
                    <div className="text-xs font-mono">
                      <span className="text-white font-bold block">Travel Outside Switzerland</span>
                      <span className="text-silver text-[11px]">Requires prior written owner authorization.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-obsidian border border-white/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={additionalDriver}
                      onChange={(e) => setAdditionalDriver(e.target.checked)}
                      className="w-4 h-4 accent-brand-red mt-0.5 cursor-pointer"
                    />
                    <div className="text-xs font-mono">
                      <span className="text-white font-bold block">Additional Driver</span>
                      <span className="text-silver text-[11px]">Must present valid licence at handover.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Step 4: Contact & Payment Preference */}
              <div className="p-6 md:p-8 bg-charcoal border border-white/10">
                <span className="label-technical text-brand-red text-[10px] block mb-1">STEP 04</span>
                <h3 className="text-lg font-bold text-white mb-6 font-display">Contact & Payment Preference</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="label-technical text-silver text-[10px] block mb-1">FULL NAME *</label>
                    <input
                      type="text"
                      placeholder="e.g. Marc Dubois"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="input-dark w-full text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="label-technical text-silver text-[10px] block mb-1">EMAIL ADDRESS *</label>
                    <input
                      type="email"
                      placeholder="marc.dubois@sunrise.ch"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="input-dark w-full text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="label-technical text-silver text-[10px] block mb-1">MOBILE PHONE (CH/INT) *</label>
                    <input
                      type="tel"
                      placeholder="+41 79 123 45 67"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="input-dark w-full text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Payment Preference */}
                <div className="mb-6">
                  <label className="label-technical text-silver text-[10px] block mb-2">
                    PREFERRED PAYMENT METHOD (AFTER OWNER APPROVAL)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label
                      onClick={() => setPaymentPreference('cash')}
                      className={`p-4 border cursor-pointer flex items-start gap-3 transition-all ${
                        paymentPreference === 'cash'
                          ? 'border-brand-red bg-brand-red/10'
                          : 'border-white/10 bg-obsidian hover:border-white/20'
                      }`}
                    >
                      <Banknote size={20} className="text-brand-red flex-shrink-0 mt-0.5" />
                      <div className="text-xs font-mono">
                        <span className="text-white font-bold block mb-1">Cash at Pickup</span>
                        <span className="text-silver text-[11px] block leading-relaxed">
                          Pay rental fee and security deposit in Swiss Francs (CHF) before key handover.
                        </span>
                      </div>
                    </label>

                    <label
                      onClick={() => setPaymentPreference('online')}
                      className={`p-4 border cursor-pointer flex items-start gap-3 transition-all ${
                        paymentPreference === 'online'
                          ? 'border-brand-red bg-brand-red/10'
                          : 'border-white/10 bg-obsidian hover:border-white/20'
                      }`}
                    >
                      <CreditCard size={20} className="text-brand-red flex-shrink-0 mt-0.5" />
                      <div className="text-xs font-mono">
                        <span className="text-white font-bold block mb-1">Online Payment</span>
                        <span className="text-silver text-[11px] block leading-relaxed">
                          Secure online checkout for rental fees once approved. Security deposit paid in cash at pickup.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="label-technical text-silver text-[10px] block mb-1">
                    SPECIAL REQUESTS OR ITINERARY NOTES
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Arriving by train at Biel/Bienne station; specific pickup time request."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input-dark w-full text-xs font-mono"
                  />
                </div>
              </div>

              {/* Step 5: Terms Acceptance (UNTICKED BY DEFAULT) */}
              <div className="p-6 md:p-8 bg-charcoal border border-brand-red/40">
                <span className="label-technical text-brand-red text-[10px] block mb-1">FINAL REQUIREMENT</span>
                <h3 className="text-lg font-bold text-white mb-3 font-display">Swiss Rental Terms & Policy</h3>

                <div className="p-4 bg-obsidian border border-white/10 mb-4 text-xs font-mono text-silver leading-relaxed space-y-2">
                  <div className="flex justify-between text-white font-bold pb-2 border-b border-white/10">
                    <span>SECURITY DEPOSIT (REFUNDABLE)</span>
                    <span className="text-brand-red font-mono">CHF {depositAmount} (CASH AT PICKUP)</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-silver pt-1">
                    <li>Payable in cash at pickup before keys are handed over. Receipt issued on site.</li>
                    <li>Vehicle must be returned full fuel and clean (missing fuel: cost + CHF 50; dirty: CHF 50).</li>
                    <li>Binding cancellation: 100% rental charge applies upon confirmed reservation.</li>
                    <li>Travel outside Switzerland requires prior written authorization.</li>
                  </ul>
                  <button
                    type="button"
                    onClick={() => setTermsModalOpen(true)}
                    className="text-brand-red hover:underline text-[11px] pt-1 block"
                  >
                    View Complete Swiss Rental Terms & Conditions (Version 2026.1)
                  </button>
                </div>

                {/* MANDATORY INITIALLY UNTICKED CHECKBOX */}
                <label className="flex items-start gap-3 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    id="terms-acceptance-checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    required
                    className="w-5 h-5 accent-brand-red mt-0.5 cursor-pointer flex-shrink-0"
                  />
                  <span className="text-xs font-mono text-white leading-relaxed">
                    I have read, understood, and accept the applicable Swiss Rental Terms, Security Deposit Policy (CHF {depositAmount} cash at pickup), and 100% Cancellation Charge Policy.
                  </span>
                </label>
              </div>
            </div>

            {/* Right Column: Authoritative Pricing Summary Dossier */}
            <div className="lg:col-span-4">
              <div className="p-6 md:p-8 bg-charcoal border border-white/10 sticky top-28 shadow-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="label-technical text-brand-red text-[10px] block">RENTAL QUOTE DOSSIER</span>
                  {calculatingQuote && <Loader2 size={12} className="animate-spin text-brand-red" />}
                </div>
                <h3 className="text-lg font-bold text-white mb-4 font-display">Tariff Breakdown</h3>

                {selectedVehicle && (
                  <div className="pb-4 mb-4 border-b border-white/10">
                    <img
                      src={selectedVehicle.images[0]}
                      alt={selectedVehicle.name}
                      className="w-full h-32 object-cover mb-3 rounded-sm"
                    />
                    <h4 className="font-bold text-white text-base font-display">{selectedVehicle.name}</h4>
                    <p className="text-xs font-mono text-silver">
                      Hub: Pieterlen, Switzerland
                    </p>
                  </div>
                )}

                <div className="space-y-3 font-mono text-xs mb-6">
                  <div className="flex justify-between text-silver">
                    <span>Duration</span>
                    <span className="text-white font-bold">{Math.round(currentHours)} Hours ({clientTariff?.days || 1}d)</span>
                  </div>

                  <div className="flex justify-between text-silver">
                    <span>Vehicle Rental</span>
                    <span className="text-white font-bold">
                      {isIndividualQuote ? (
                        <span className="text-amber-400">Quote Required</span>
                      ) : (
                        `CHF ${(serverQuote?.base_rental_amount || clientTariff?.price || 0).toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-silver">
                    <span>Included Mileage</span>
                    <span className="text-white font-bold">
                      {isIndividualQuote
                        ? 'Custom by Owner'
                        : `${(serverQuote?.included_mileage || clientTariff?.includedKm || 0).toLocaleString()} km`}
                    </span>
                  </div>

                  <div className="flex justify-between text-silver">
                    <span>Extra Km Tariff</span>
                    <span className="text-white font-bold">
                      CHF {(serverQuote?.extra_km_rate || clientTariff?.extraKmRate || 0.5).toFixed(2)} / km
                    </span>
                  </div>

                  {deliveryRequested && (
                    <div className="flex justify-between text-silver pt-2 border-t border-white/5">
                      <span>Delivery Service</span>
                      <span className="text-amber-400 font-bold">Price on request</span>
                    </div>
                  )}

                  {chauffeurRequested && (
                    <div className="flex justify-between text-silver pt-2 border-t border-white/5">
                      <span>Chauffeur Service</span>
                      <span className="text-amber-400 font-bold">Price on request</span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-white/10 flex justify-between items-baseline">
                    <span className="text-white font-bold uppercase text-xs">Estimated Rental</span>
                    <span className="text-xl font-black font-display text-brand-red">
                      {isIndividualQuote ? (
                        <span className="text-amber-400 text-sm">Individual quote required</span>
                      ) : (
                        `CHF ${(serverQuote?.base_rental_amount || clientTariff?.price || 0).toFixed(2)}`
                      )}
                    </span>
                  </div>

                  {/* Security Deposit Callout */}
                  <div className="p-3 bg-obsidian border border-white/10 mt-4 text-xs font-mono">
                    <div className="flex justify-between items-center text-white">
                      <span className="font-bold">Refundable Deposit</span>
                      <span className="font-bold text-brand-red">CHF {depositAmount}</span>
                    </div>
                    <span className="text-[10px] text-silver block mt-1">
                      Payable in cash at vehicle handover. Refunded upon return per inspection.
                    </span>
                  </div>
                </div>

                {/* Submission CTA */}
                <button
                  type="submit"
                  disabled={submitting || !termsAccepted}
                  className="btn-primary w-full py-4 text-xs font-mono tracking-widest flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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

                <p className="text-[10px] font-mono text-ash text-center mt-3 leading-relaxed">
                  * By clicking submit, your inquiry will be transmitted to the owner in Pieterlen. You will not be charged now.
                </p>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Terms Modal */}
      {termsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-charcoal border border-white/20 max-w-2xl max-h-[85vh] overflow-y-auto p-6 md:p-8 text-pearl font-mono text-xs">
            <h2 className="text-xl font-bold font-display text-white mb-4">
              SWISS RENTAL TERMS & CONDITIONS (V2026.1)
            </h2>
            <div className="space-y-4 text-silver text-[11px] leading-relaxed">
              <div>
                <h4 className="text-white font-bold mb-1">1. PARTIES AND HUBS</h4>
                <p>Easy Cars Biel / Pieterlen Hub operates vehicle rental services for the Audi A3 and Audi A5 fleet. Operating address: Hauptstrasse 12, 2542 Pieterlen, Switzerland.</p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">2. SECURITY DEPOSIT</h4>
                <p>A refundable security deposit (CHF 300 for Audi A3, CHF 500 for Audi A5) is mandatory and payable in cash at handover. The deposit may be retained for up to 60 days to resolve documented fines or damages.</p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">3. CANCELLATION POLICY</h4>
                <p>Confirmed reservations are binding. In case of customer cancellation after owner approval and confirmation, 100% of the rental fee remains payable.</p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">4. FUEL AND CLEANING</h4>
                <p>Vehicles must be returned full-to-full. Missing fuel is charged at actual refuelling costs plus CHF 50 administrative fee. Heavy soiling requires a CHF 50 cleaning charge.</p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">5. TERRITORIAL RESTRICTION</h4>
                <p>Vehicle use is strictly within Switzerland unless prior written approval has been granted by the owner for cross-border transit.</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setTermsModalOpen(false)}
                className="btn-primary py-2 px-6 text-xs font-mono"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
