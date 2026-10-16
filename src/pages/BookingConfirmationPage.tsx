import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchBooking, acceptOwnerQuote, simulatePayment } from '../api/client';
import { Booking, Inspection } from '../types';
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Key,
  Printer,
  ArrowRight,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Clock,
  Banknote,
  CreditCard,
  FileText,
  Truck,
  UserCheck,
  Fuel,
  Gauge
} from 'lucide-react';

export const BookingConfirmationPage: React.FC = () => {
  const { ref } = useParams<{ ref: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadData = async () => {
    if (!ref) return;
    try {
      setLoading(true);
      const res = await fetchBooking(ref);
      setBooking(res.booking);
      setInspection(res.inspection);
      setAuditLogs(res.auditLogs || []);
    } catch (err: any) {
      setError(err.message || 'Booking reservation record could not be found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [ref]);

  const handleAcceptQuote = async () => {
    if (!ref) return;
    try {
      setActionLoading(true);
      await acceptOwnerQuote(ref);
      setActionSuccess('Quote accepted successfully! Your booking is now binding.');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to accept quote.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!ref) return;
    try {
      setActionLoading(true);
      await simulatePayment(ref);
      setActionSuccess('Online payment verified successfully! Booking confirmed.');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Payment simulation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-obsidian flex items-center justify-center pt-24 text-pearl">
        <Loader2 className="animate-spin text-brand-red" size={36} />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="w-full min-h-screen bg-obsidian flex flex-col items-center justify-center pt-24 text-pearl px-6 text-center">
        <AlertCircle size={44} className="text-brand-red mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2 font-display">Booking Record Not Located</h2>
        <p className="text-ash mb-6 font-mono text-xs">Reference #{ref} could not be verified in the Swiss fleet registry.</p>
        <Link to="/" className="btn-primary py-3 px-6 text-xs font-mono">
          RETURN TO HOMEPAGE
        </Link>
      </div>
    );
  }

  const isConfirmed = booking.status === 'confirmed' || booking.status === 'rental_active' || booking.status === 'completed';
  const isPendingApproval = booking.status === 'request_received' || booking.status === 'under_review';
  const isAwaitingQuote = booking.status === 'awaiting_customer_acceptance';
  const isAwaitingPayment = booking.status === 'awaiting_payment';
  const isDeclined = booking.status === 'declined' || booking.status === 'cancelled';

  return (
    <div className="w-full min-h-screen bg-obsidian text-pearl pt-32 pb-24">
      <div className="section-container max-w-4xl">
        {/* Top Notification Status Bar */}
        <div className="mb-6">
          {isPendingApproval && (
            <div className="p-5 bg-charcoal border-l-4 border-amber-500 border-white/10 shadow-xl flex items-start gap-4">
              <Clock size={24} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-bold text-sm uppercase font-mono tracking-wider">
                  Request Received — Awaiting Owner Approval
                </h3>
                <p className="text-silver text-xs font-mono mt-1 leading-relaxed">
                  "Your rental request has been received. Your booking is not confirmed until the owner approves it."
                  Our team in Pieterlen is reviewing vehicle availability and scheduling. You will receive an email update shortly.
                </p>
              </div>
            </div>
          )}

          {isAwaitingQuote && (
            <div className="p-5 bg-charcoal border-l-4 border-accent border-white/10 shadow-xl flex items-start gap-4">
              <FileText size={24} className="text-brand-red flex-shrink-0 mt-0.5" />
              <div className="flex-grow">
                <h3 className="text-white font-bold text-sm uppercase font-mono tracking-wider">
                  Individual Quote Issued by Owner — Action Required
                </h3>
                <p className="text-silver text-xs font-mono mt-1 leading-relaxed">
                  The owner has calculated an individual quote for your rental request. Please review the itemized quote below and accept the agreed terms to confirm your reservation.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={handleAcceptQuote}
                    disabled={actionLoading}
                    className="btn-primary py-2.5 px-6 text-xs font-mono tracking-widest flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    <span>ACCEPT QUOTE & CONFIRM</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {isAwaitingPayment && (
            <div className="p-5 bg-charcoal border-l-4 border-emerald-500 border-white/10 shadow-xl flex items-start gap-4">
              <CreditCard size={24} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="flex-grow">
                <h3 className="text-white font-bold text-sm uppercase font-mono tracking-wider">
                  Owner Approved — Ready for Payment
                </h3>
                <p className="text-silver text-xs font-mono mt-1 leading-relaxed">
                  Your request has been officially approved by Easy Cars Biel! Complete the secure online payment to finalize your booking, or confirm cash at pickup.
                </p>
                {booking.payment_preference === 'online' && (
                  <div className="mt-4">
                    <button
                      onClick={handleSimulatePayment}
                      disabled={actionLoading}
                      className="btn-primary py-2.5 px-6 text-xs font-mono tracking-widest flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                      <span>SIMULATE ONLINE PAYMENT (CHF {Number(booking.total_price).toFixed(2)})</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {isConfirmed && (
            <div className="p-5 bg-charcoal border-l-4 border-emerald-500 border-white/10 shadow-xl flex items-start gap-4">
              <CheckCircle2 size={24} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-bold text-sm uppercase font-mono tracking-wider">
                  Booking Confirmed & Bound
                </h3>
                <p className="text-silver text-xs font-mono mt-1 leading-relaxed">
                  Your booking is fully confirmed. Please present your driving licence and refundable security deposit (CHF {booking.security_deposit || (booking.vehicle_slug?.includes('a5') ? 500 : 300)} cash) at vehicle handover.
                </p>
              </div>
            </div>
          )}

          {isDeclined && (
            <div className="p-5 bg-charcoal border-l-4 border-red-500 border-white/10 shadow-xl flex items-start gap-4">
              <AlertCircle size={24} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-bold text-sm uppercase font-mono tracking-wider">
                  Booking {booking.status === 'declined' ? 'Declined' : 'Cancelled'}
                </h3>
                <p className="text-silver text-xs font-mono mt-1 leading-relaxed">
                  {booking.owner_notes || 'This request could not be fulfilled for the selected dates. Please contact us for alternate dates.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {actionSuccess && (
          <div className="p-4 mb-6 bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-mono">
            {actionSuccess}
          </div>
        )}

        {/* Main Booking Card */}
        <div className="p-8 md:p-12 bg-charcoal border border-white/10 shadow-2xl mb-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10 mb-8">
            <div>
              <span className="label-technical text-brand-red text-xs block mb-1">
                EASY CARS BIEL • RESERVATION DOSSIER
              </span>
              <h1 className="text-2xl md:text-3xl font-bold font-display text-white">
                {booking.vehicle_name}
              </h1>
              <p className="text-silver font-mono text-xs mt-1">
                Status: <span className="text-white uppercase font-bold">{booking.status.replace(/_/g, ' ')}</span> •
                Payment: <span className="text-white uppercase font-bold">{booking.payment_status.replace(/_/g, ' ')}</span>
              </p>
            </div>

            <div className="text-left md:text-right">
              <span className="label-technical text-silver text-[10px] block">BOOKING REFERENCE</span>
              <span className="text-2xl md:text-3xl font-mono font-black text-brand-red tracking-widest">
                {booking.booking_ref}
              </span>
            </div>
          </div>

          {/* Core Booking Itinerary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Vehicle & Hub */}
            <div className="space-y-4">
              <h4 className="label-technical text-brand-red text-xs">VEHICLE & LOCATION</h4>
              <div className="p-4 bg-obsidian border border-white/5 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-silver">Vehicle Model</span>
                  <span className="text-white font-bold">{booking.vehicle_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-silver">Pickup Hub</span>
                  <span className="text-white">Pieterlen Hub, Hauptstrasse 12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-silver">Included Mileage</span>
                  <span className="text-white font-bold">{booking.included_mileage ? `${booking.included_mileage.toLocaleString()} km` : 'Standard'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-silver">Extra Kilometre Rate</span>
                  <span className="text-white font-bold">CHF {Number(booking.extra_km_rate || 0.5).toFixed(2)}/km</span>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-4">
              <h4 className="label-technical text-brand-red text-xs">RESERVATION HOLDER</h4>
              <div className="p-4 bg-obsidian border border-white/5 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-silver">Driver Name</span>
                  <span className="text-white font-bold">{booking.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-silver">Email</span>
                  <span className="text-white">{booking.customer_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-silver">Phone</span>
                  <span className="text-white">{booking.customer_phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-silver">Payment Preference</span>
                  <span className="text-white uppercase">{booking.payment_preference === 'cash' ? 'Cash at Pickup' : 'Online Payment'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-white/10 font-mono text-xs">
            <div className="p-4 bg-obsidian border border-white/5">
              <span className="label-technical text-silver text-[10px] block mb-1">PICKUP TIME</span>
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Calendar size={15} className="text-brand-red" />
                <span>{new Date(booking.pickup_date).toLocaleString('de-CH', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
            </div>
            <div className="p-4 bg-obsidian border border-white/5">
              <span className="label-technical text-silver text-[10px] block mb-1">RETURN TIME</span>
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Calendar size={15} className="text-brand-red" />
                <span>{new Date(booking.return_date).toLocaleString('de-CH', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
            </div>
          </div>

          {/* Itemized Price Dossier per Section 7 */}
          <div className="mb-8">
            <h4 className="label-technical text-brand-red text-xs mb-3">ITEMIZED QUOTE BREAKDOWN</h4>
            <div className="p-6 bg-obsidian border border-white/10 space-y-3 font-mono text-xs">
              <div className="flex justify-between text-silver">
                <span>Vehicle Rental ({booking.total_hours || 24}h)</span>
                <span className="text-white font-bold">CHF {Number(booking.base_rental_amount || booking.total_price).toFixed(2)}</span>
              </div>

              {Boolean(booking.delivery_requested) && (
                <div className="flex justify-between text-silver">
                  <span>Delivery Service ({booking.delivery_address || 'Requested'})</span>
                  <span className="text-white font-bold">
                    {booking.delivery_fee ? `CHF ${Number(booking.delivery_fee).toFixed(2)}` : 'Price on request'}
                  </span>
                </div>
              )}

              {Boolean(booking.chauffeur_requested) && (
                <div className="flex justify-between text-silver">
                  <span>Chauffeur Service ({booking.chauffeur_details || 'Requested'})</span>
                  <span className="text-white font-bold">
                    {booking.chauffeur_fee ? `CHF ${Number(booking.chauffeur_fee).toFixed(2)}` : 'Price on request'}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-white/10 flex justify-between items-baseline text-sm">
                <span className="text-white font-bold uppercase">Rental & Service Total</span>
                <span className="text-xl font-bold font-display text-brand-red">
                  CHF {Number(booking.total_price).toFixed(2)}
                </span>
              </div>

              {/* Deposit separated clearly from fees */}
              <div className="pt-3 mt-3 border-t border-dashed border-white/10 flex justify-between items-center text-xs">
                <div>
                  <span className="text-white font-bold block">Refundable Security Deposit (Cash at Pickup)</span>
                  <span className="text-[10px] text-ash">Separate from rental charges. Refunded upon satisfactory return.</span>
                </div>
                <span className="text-white font-bold text-sm">
                  CHF {Number(booking.security_deposit || (booking.vehicle_slug?.includes('a5') ? 500 : 300)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Digital Inspection Report (If Conducted) */}
          {inspection && (
            <div className="p-6 bg-obsidian border border-brand-red/40 mb-8 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Gauge size={16} className="text-brand-red" />
                  <span>DIGITAL INSPECTION RECORD</span>
                </div>
                <span className="text-[10px] text-silver uppercase">
                  Conducted by Pieterlen Station
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div>
                  <span className="text-[10px] text-silver block">PICKUP ODOMETER</span>
                  <strong className="text-white">{inspection.pickup_odometer ? `${inspection.pickup_odometer.toLocaleString()} km` : 'Pending'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-silver block">RETURN ODOMETER</span>
                  <strong className="text-white">{inspection.return_odometer ? `${inspection.return_odometer.toLocaleString()} km` : 'Pending'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-silver block">FUEL (PICKUP / RETURN)</span>
                  <strong className="text-white">{inspection.pickup_fuel_level || '100%'} / {inspection.return_fuel_level || 'Pending'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-silver block">ADDITIONAL KM CHARGE</span>
                  <strong className="text-brand-red">CHF {Number(inspection.extra_km_charge || 0).toFixed(2)}</strong>
                </div>
              </div>

              {inspection.return_damage_notes && (
                <div className="p-3 bg-charcoal border border-white/10 text-[11px] text-silver">
                  <strong className="text-white block mb-0.5">Condition / Damage Notes:</strong>
                  {inspection.return_damage_notes}
                </div>
              )}
            </div>
          )}

          {/* Actions & Print */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
            <button
              onClick={() => window.print()}
              className="btn-secondary py-3 px-6 text-xs font-mono tracking-wider flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Printer size={15} />
              <span>PRINT DOSSIER</span>
            </button>

            <Link
              to="/fleet"
              className="text-xs font-mono text-silver hover:text-white transition-colors flex items-center gap-2"
            >
              <span>EXPLORE VEHICLE FLEET</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Swiss Legal Disclaimer Note */}
        <div className="text-[11px] font-mono text-ash text-center leading-relaxed">
          Easy Cars Biel • Pieterlen Hub (Hauptstrasse 12, 2542 Pieterlen, Switzerland) • Direct: +41 79 388 99 97 • info@easycarsbiel.ch
        </div>
      </div>
    </div>
  );
};
