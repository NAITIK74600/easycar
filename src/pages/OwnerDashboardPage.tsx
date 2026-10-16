import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchOwnerOverview,
  fetchOwnerBookings,
  approveBooking,
  declineBooking,
  issueCustomQuote,
  recordCashPayment,
  recordDepositAction,
  fetchCalendar,
  addCalendarBlock,
  removeCalendarBlock,
  saveInspection,
  fetchInspection,
  fetchOwnerSettings,
  updateOwnerSettings,
  fetchEmailLogs,
  fetchVehicles,
} from '../api/client';
import {
  Booking,
  OwnerOverview,
  AvailabilityBlock,
  EmailLog,
  Inspection,
  Vehicle,
} from '../types';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  Clock,
  Car,
  DollarSign,
  AlertCircle,
  Search,
  Filter,
  LogOut,
  Lock,
  Loader2,
  RefreshCw,
  Plus,
  Trash2,
  Check,
  Fuel,
  Gauge,
  Sliders,
  Mail,
  Banknote,
  Send,
  Eye,
} from 'lucide-react';

export const OwnerDashboardPage: React.FC = () => {
  const { user, isOwner, login, logout, token } = useAuth();

  // Login form state
  const [emailInput, setEmailInput] = useState('owner@easycarsbiel.ch');
  const [passInput, setPassInput] = useState('Password123!');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'calendar' | 'inspection' | 'settings' | 'emails'>('overview');

  // Overview state
  const [overview, setOverview] = useState<OwnerOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Calendar & blocks state
  const [calendarData, setCalendarData] = useState<{ bookings: any[]; blocks: AvailabilityBlock[] }>({ bookings: [], blocks: [] });
  const [newBlockVehicleId, setNewBlockVehicleId] = useState('');
  const [newBlockStart, setNewBlockStart] = useState('');
  const [newBlockEnd, setNewBlockEnd] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('Maintenance / Service');
  const [addingBlock, setAddingBlock] = useState(false);

  // Inspection modal state
  const [selectedBookingForInspection, setSelectedBookingForInspection] = useState<Booking | null>(null);
  const [inspectionData, setInspectionData] = useState<Partial<Inspection>>({});
  const [savingInspection, setSavingInspection] = useState(false);

  // Quote modal state
  const [quoteBooking, setQuoteBooking] = useState<Booking | null>(null);
  const [quoteBaseAmount, setQuoteBaseAmount] = useState<number>(0);
  const [quoteMileage, setQuoteMileage] = useState<number>(0);
  const [quoteDeliveryFee, setQuoteDeliveryFee] = useState<number>(0);
  const [quoteChauffeurFee, setQuoteChauffeurFee] = useState<number>(0);
  const [quoteSecurityDeposit, setQuoteSecurityDeposit] = useState<number>(500);
  const [quoteNotes, setQuoteNotes] = useState<string>('');
  const [issuingQuote, setIssuingQuote] = useState(false);

  // Decline modal state
  const [declineBookingTarget, setDeclineBookingTarget] = useState<Booking | null>(null);
  const [declineReason, setDeclineReason] = useState('Vehicle unavailable for requested period.');
  const [declining, setDeclining] = useState(false);

  // Deposit action state
  const [depositBookingTarget, setDepositBookingTarget] = useState<Booking | null>(null);
  const [depositAction, setDepositAction] = useState<'collect' | 'repay' | 'deduct'>('collect');
  const [depositReceiptRef, setDepositReceiptRef] = useState('');
  const [depositDeductionAmount, setDepositDeductionAmount] = useState<number>(0);
  const [depositNotes, setDepositNotes] = useState('');
  const [recordingDeposit, setRecordingDeposit] = useState(false);

  // Settings & Email logs state
  const [ownerSettings, setOwnerSettings] = useState<any>(null);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial data load when logged in
  const loadAllData = async () => {
    if (!token) return;
    try {
      setOverviewLoading(true);
      const [ov, bList, cal, sett, vList] = await Promise.all([
        fetchOwnerOverview(token),
        fetchOwnerBookings({}, token),
        fetchCalendar(token),
        fetchOwnerSettings(token),
        fetchVehicles(),
      ]);
      setOverview(ov);
      setBookings(bList);
      setCalendarData(cal);
      setOwnerSettings(sett);
      setVehicles(vList);
      if (vList.length > 0 && !newBlockVehicleId) {
        setNewBlockVehicleId(vList[0].id);
      }
    } catch (e: any) {
      console.error('Owner data loading error:', e);
    } finally {
      setOverviewLoading(false);
    }
  };

  useEffect(() => {
    if (isOwner && token) {
      loadAllData();
    }
  }, [isOwner, token]);

  // Load email logs if tab selected
  useEffect(() => {
    if (activeTab === 'emails' && token) {
      fetchEmailLogs(token).then(setEmailLogs).catch(console.error);
    }
  }, [activeTab, token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      setLoggingIn(true);
      await login(emailInput, passInput);
      showToast('Welcome back, Easy Cars Owner.');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleApprove = async (b: Booking) => {
    if (!window.confirm(`Approve booking #${b.booking_ref} for ${b.customer_name}?`)) return;
    try {
      await approveBooking(b.booking_ref, token);
      showToast(`Booking #${b.booking_ref} approved!`);
      loadAllData();
    } catch (e: any) {
      alert(`Approval failed: ${e.message}`);
    }
  };

  const handleConfirmDecline = async () => {
    if (!declineBookingTarget) return;
    try {
      setDeclining(true);
      await declineBooking(declineBookingTarget.booking_ref, declineReason, token);
      showToast(`Booking #${declineBookingTarget.booking_ref} has been declined.`);
      setDeclineBookingTarget(null);
      loadAllData();
    } catch (e: any) {
      alert(`Decline failed: ${e.message}`);
    } finally {
      setDeclining(false);
    }
  };

  const handleOpenQuoteModal = (b: Booking) => {
    setQuoteBooking(b);
    setQuoteBaseAmount(b.base_rental_amount || b.total_price || 150);
    setQuoteMileage(b.included_mileage || 200);
    setQuoteDeliveryFee(b.delivery_requested ? 50 : 0);
    setQuoteChauffeurFee(b.chauffeur_requested ? 150 : 0);
    setQuoteSecurityDeposit(b.security_deposit || (b.vehicle_slug?.includes('a5') ? 500 : 300));
    setQuoteNotes('');
  };

  const handleSubmitQuote = async () => {
    if (!quoteBooking) return;
    try {
      setIssuingQuote(true);
      await issueCustomQuote(
        quoteBooking.booking_ref,
        {
          base_rental_amount: Number(quoteBaseAmount),
          included_mileage: Number(quoteMileage),
          delivery_fee: Number(quoteDeliveryFee),
          chauffeur_fee: Number(quoteChauffeurFee),
          security_deposit: Number(quoteSecurityDeposit),
          notes: quoteNotes,
          expiry_hours: 48,
        },
        token
      );
      showToast(`Individual quote issued for #${quoteBooking.booking_ref}`);
      setQuoteBooking(null);
      loadAllData();
    } catch (e: any) {
      alert(`Quote issuance failed: ${e.message}`);
    } finally {
      setIssuingQuote(false);
    }
  };

  const handleRecordCash = async (b: Booking) => {
    if (!window.confirm(`Confirm receipt of cash rental payment for #${b.booking_ref}?`)) return;
    try {
      await recordCashPayment(b.booking_ref, token);
      showToast(`Cash payment recorded for #${b.booking_ref}`);
      loadAllData();
    } catch (e: any) {
      alert(`Payment recording failed: ${e.message}`);
    }
  };

  const handleDepositSubmit = async () => {
    if (!depositBookingTarget) return;
    try {
      setRecordingDeposit(true);
      await recordDepositAction(
        depositBookingTarget.booking_ref,
        {
          action: depositAction,
          receipt_ref: depositReceiptRef || undefined,
          notes: depositNotes || undefined,
          deduction_amount: depositAction === 'deduct' ? Number(depositDeductionAmount) : undefined,
        },
        token
      );
      showToast(`Deposit ${depositAction} recorded successfully.`);
      setDepositBookingTarget(null);
      loadAllData();
    } catch (e: any) {
      alert(`Deposit update failed: ${e.message}`);
    } finally {
      setRecordingDeposit(false);
    }
  };

  const handleOpenInspection = async (b: Booking) => {
    setSelectedBookingForInspection(b);
    try {
      const existing = await fetchInspection(b.booking_ref, token);
      if (existing) {
        setInspectionData(existing);
      } else {
        setInspectionData({
          booking_id: b.id,
          pickup_odometer: b.vehicle_slug?.includes('a5') ? 85200 : 124500,
          pickup_fuel_level: '100%',
          pickup_cleanliness: 'clean',
        });
      }
    } catch (e) {
      setInspectionData({});
    }
  };

  const handleSaveInspection = async () => {
    if (!selectedBookingForInspection) return;
    try {
      setSavingInspection(true);
      await saveInspection(selectedBookingForInspection.booking_ref, inspectionData, token);
      showToast(`Inspection record saved for #${selectedBookingForInspection.booking_ref}`);
      setSelectedBookingForInspection(null);
      loadAllData();
    } catch (e: any) {
      alert(`Failed to save inspection: ${e.message}`);
    } finally {
      setSavingInspection(false);
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockVehicleId || !newBlockStart || !newBlockEnd) {
      alert('Please fill in vehicle and start/end dates.');
      return;
    }
    try {
      setAddingBlock(true);
      await addCalendarBlock(
        {
          vehicle_id: newBlockVehicleId,
          start_date: newBlockStart,
          end_date: newBlockEnd,
          reason: newBlockReason,
        },
        token
      );
      showToast('Availability block created.');
      setNewBlockStart('');
      setNewBlockEnd('');
      const updatedCal = await fetchCalendar(token);
      setCalendarData(updatedCal);
    } catch (e: any) {
      alert(`Failed to add block: ${e.message}`);
    } finally {
      setAddingBlock(false);
    }
  };

  const handleRemoveBlock = async (id: string) => {
    if (!window.confirm('Delete this availability block?')) return;
    try {
      await removeCalendarBlock(id, token);
      showToast('Availability block removed.');
      const updatedCal = await fetchCalendar(token);
      setCalendarData(updatedCal);
    } catch (e: any) {
      alert(`Failed to delete block: ${e.message}`);
    }
  };

  // Filtered bookings list
  const filteredBookings = bookings.filter((b) => {
    if (statusFilter && b.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchRef = b.booking_ref?.toLowerCase().includes(q);
      const matchName = b.customer_name?.toLowerCase().includes(q);
      const matchPhone = b.customer_phone?.toLowerCase().includes(q);
      const matchVehicle = b.vehicle_name?.toLowerCase().includes(q);
      if (!matchRef && !matchName && !matchPhone && !matchVehicle) return false;
    }
    return true;
  });

  // If not logged in, render the luxury login portal
  if (!isOwner) {
    return (
      <div className="w-full min-h-screen bg-obsidian text-pearl pt-36 pb-24 flex items-center justify-center">
        <div className="w-full max-w-md mx-4 p-8 md:p-10 bg-charcoal border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-red/20 border border-brand-red flex items-center justify-center text-brand-red">
              <Lock size={20} />
            </div>
            <div>
              <span className="label-technical text-brand-red text-[10px] block">SECURITY CLEARANCE</span>
              <h2 className="font-display font-bold text-xl text-white">Owner Portal Login</h2>
            </div>
          </div>

          <p className="text-silver text-xs font-mono mb-6 leading-relaxed">
            Restricted access for Easy Cars Biel fleet managers. Authorize to review rental inquiries, issue quotes, and record vehicle inspections.
          </p>

          {authError && (
            <div className="p-3 mb-6 bg-red-950/60 border border-red-500/50 text-red-200 text-xs font-mono flex items-start gap-2">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label-technical text-silver text-[10px] block mb-1">OWNER USERNAME / EMAIL</label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                className="input-dark w-full text-xs font-mono"
              />
            </div>

            <div>
              <label className="label-technical text-silver text-[10px] block mb-1">PASSWORD</label>
              <input
                type="password"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                required
                className="input-dark w-full text-xs font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="btn-primary w-full py-3.5 text-xs font-mono tracking-widest flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
            >
              {loggingIn ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              <span>AUTHENTICATE PORTAL</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/5 text-[11px] font-mono text-ash flex items-center justify-between">
            <span>Official Fleet Admin</span>
            <span>Pieterlen Station</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-obsidian text-pearl pt-28 pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-charcoal border-l-4 border-brand-red border-white/20 shadow-2xl text-xs font-mono text-white flex items-center gap-3">
          <Check size={16} className="text-brand-red" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="section-container">
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="label-technical text-brand-red text-xs font-mono">
                PIETERLEN DISPATCH & FLEET PORTAL
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white mt-1">
              Easy Cars Biel Administration
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAllData}
              title="Refresh Registry"
              className="p-2.5 bg-charcoal border border-white/10 text-silver hover:text-white hover:border-white/30 transition-colors"
            >
              <RefreshCw size={15} />
            </button>

            <div className="px-3 py-1.5 bg-charcoal border border-white/10 text-xs font-mono text-silver hidden sm:block">
              User: <span className="text-white font-bold">{user?.name || 'Owner'}</span>
            </div>

            <button
              onClick={logout}
              className="p-2.5 bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-900/60 transition-colors flex items-center gap-1.5 text-xs font-mono"
            >
              <LogOut size={14} />
              <span>LOGOUT</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4 mb-8">
          {[
            { id: 'overview', label: 'OVERVIEW KPI', icon: Sliders },
            { id: 'bookings', label: 'REQUESTS & BOOKINGS', icon: FileText },
            { id: 'calendar', label: 'AVAILABILITY & BLOCKS', icon: Calendar },
            { id: 'emails', label: 'NOTIFICATION LOGS', icon: Mail },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-4 border text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-brand-red bg-brand-red text-white font-bold'
                    : 'border-white/10 bg-charcoal text-silver hover:text-white hover:border-white/30'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {overviewLoading ? (
              <div className="py-20 flex justify-center">
                <Loader2 className="animate-spin text-brand-red" size={32} />
              </div>
            ) : overview ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-5 bg-charcoal border border-white/10">
                    <span className="label-technical text-silver text-[10px] block mb-1">NEW REQUESTS</span>
                    <span className="text-3xl font-display font-black text-amber-400">
                      {overview.requests_received}
                    </span>
                    <span className="text-[10px] text-ash block mt-1">Awaiting owner approval</span>
                  </div>

                  <div className="p-5 bg-charcoal border border-white/10">
                    <span className="label-technical text-silver text-[10px] block mb-1">QUOTES PENDING</span>
                    <span className="text-3xl font-display font-black text-brand-red">
                      {overview.quotes_pending_acceptance}
                    </span>
                    <span className="text-[10px] text-ash block mt-1">Awaiting customer acceptance</span>
                  </div>

                  <div className="p-5 bg-charcoal border border-white/10">
                    <span className="label-technical text-silver text-[10px] block mb-1">CONFIRMED RENTALS</span>
                    <span className="text-3xl font-display font-black text-emerald-400">
                      {overview.confirmed_upcoming}
                    </span>
                    <span className="text-[10px] text-ash block mt-1">Scheduled Swiss journeys</span>
                  </div>

                  <div className="p-5 bg-charcoal border border-white/10">
                    <span className="label-technical text-silver text-[10px] block mb-1">CASH DUE AT PICKUP</span>
                    <span className="text-3xl font-display font-black text-white">
                      {overview.cash_due_at_pickup}
                    </span>
                    <span className="text-[10px] text-ash block mt-1">Cash payments to collect</span>
                  </div>
                </div>

                {/* Secondary KPI bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
                  <div className="p-4 bg-obsidian border border-white/5 flex items-center justify-between">
                    <span className="text-silver">Active Rentals:</span>
                    <strong className="text-white">{overview.active_rentals}</strong>
                  </div>
                  <div className="p-4 bg-obsidian border border-white/5 flex items-center justify-between">
                    <span className="text-silver">Pending Online Payments:</span>
                    <strong className="text-amber-400">{overview.payments_pending}</strong>
                  </div>
                  <div className="p-4 bg-obsidian border border-white/5 flex items-center justify-between">
                    <span className="text-silver">Deposits Repayment Pending:</span>
                    <strong className="text-white">{overview.deposits_repayment_pending}</strong>
                  </div>
                  <div className="p-4 bg-obsidian border border-white/5 flex items-center justify-between">
                    <span className="text-silver">Completed Returns:</span>
                    <strong className="text-emerald-400">{overview.completed_rentals}</strong>
                  </div>
                </div>

                {/* Recent Inquiries Quick Table */}
                <div className="p-6 bg-charcoal border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-white font-display">Recent Inquiries & Actions</h3>
                    <button
                      onClick={() => setActiveTab('bookings')}
                      className="text-xs font-mono text-brand-red hover:underline"
                    >
                      View All ({bookings.length})
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono text-left">
                      <thead className="bg-obsidian text-silver uppercase border-b border-white/10">
                        <tr>
                          <th className="p-3">Reference</th>
                          <th className="p-3">Vehicle</th>
                          <th className="p-3">Customer</th>
                          <th className="p-3">Dates</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Quick Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {bookings.slice(0, 5).map((b) => (
                          <tr key={b.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-3 font-bold text-brand-red">#{b.booking_ref}</td>
                            <td className="p-3 text-white">{b.vehicle_name}</td>
                            <td className="p-3 text-silver">
                              <div>{b.customer_name}</div>
                              <div className="text-[10px] text-ash">{b.customer_phone}</div>
                            </td>
                            <td className="p-3 text-silver">
                              {new Date(b.pickup_date).toLocaleDateString('de-CH')} → {new Date(b.return_date).toLocaleDateString('de-CH')}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 text-[10px] uppercase font-bold border ${
                                b.status === 'confirmed'
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : b.status === 'request_received'
                                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                  : b.status === 'awaiting_customer_acceptance'
                                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                                  : 'bg-white/5 text-silver border-white/10'
                              }`}>
                                {b.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {b.status === 'request_received' && (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleApprove(b)}
                                    className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/40 text-[10px]"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleOpenQuoteModal(b)}
                                    className="px-2.5 py-1 bg-brand-red/20 hover:bg-brand-red/40 text-brand-red border border-brand-red/40 text-[10px]"
                                  >
                                    Quote
                                  </button>
                                </div>
                              )}
                              {b.status === 'confirmed' && (
                                <button
                                  onClick={() => handleOpenInspection(b)}
                                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px]"
                                >
                                  Inspection
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* TAB 2: REQUESTS & BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="p-4 bg-charcoal border border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Search size={16} className="text-silver flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search reference, customer, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-dark text-xs font-mono w-full md:w-72"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <Filter size={16} className="text-silver flex-shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-dark text-xs font-mono w-full md:w-56"
                >
                  <option value="">All Statuses ({bookings.length})</option>
                  <option value="request_received">Request Received</option>
                  <option value="awaiting_customer_acceptance">Awaiting Quote Acceptance</option>
                  <option value="awaiting_payment">Awaiting Payment</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="rental_active">Rental Active</option>
                  <option value="completed">Completed</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
            </div>

            {/* Bookings Full Table */}
            <div className="p-6 bg-charcoal border border-white/10 overflow-x-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead className="bg-obsidian text-silver uppercase border-b border-white/10">
                  <tr>
                    <th className="p-3">Ref & Created</th>
                    <th className="p-3">Vehicle</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Schedule</th>
                    <th className="p-3">Tariff & Deposit</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Owner Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-mono">
                        <span className="font-bold text-brand-red block">#{b.booking_ref}</span>
                        <span className="text-[10px] text-ash">
                          {new Date(b.created_at).toLocaleDateString('de-CH')}
                        </span>
                      </td>

                      <td className="p-3 font-mono">
                        <strong className="text-white block">{b.vehicle_name}</strong>
                        <span className="text-[10px] text-silver">
                          {b.total_hours || 24}h • {b.included_mileage ? `${b.included_mileage} km` : 'Standard'}
                        </span>
                        {(b.delivery_requested || b.chauffeur_requested) && (
                          <div className="mt-1 flex gap-1">
                            {Boolean(b.delivery_requested) && (
                              <span className="text-[9px] px-1 bg-amber-500/20 text-amber-300 border border-amber-500/40">Delivery</span>
                            )}
                            {Boolean(b.chauffeur_requested) && (
                              <span className="text-[9px] px-1 bg-sky-500/20 text-sky-300 border border-sky-500/40">Chauffeur</span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="p-3 font-mono">
                        <div className="text-white font-bold">{b.customer_name}</div>
                        <div className="text-silver text-[11px]">{b.customer_phone}</div>
                        <div className="text-ash text-[10px]">{b.customer_email}</div>
                      </td>

                      <td className="p-3 font-mono text-silver">
                        <div><strong className="text-white">In:</strong> {new Date(b.pickup_date).toLocaleString('de-CH', { dateStyle: 'short', timeStyle: 'short' })}</div>
                        <div><strong className="text-white">Out:</strong> {new Date(b.return_date).toLocaleString('de-CH', { dateStyle: 'short', timeStyle: 'short' })}</div>
                      </td>

                      <td className="p-3 font-mono">
                        <div className="text-white font-bold">CHF {Number(b.total_price).toFixed(2)}</div>
                        <div className="text-[10px] text-ash">
                          Dep: CHF {b.security_deposit || (b.vehicle_slug?.includes('a5') ? 500 : 300)} ({b.deposit_status || 'not_collected'})
                        </div>
                        <div className="text-[10px] text-silver uppercase">
                          Pay: {b.payment_status}
                        </div>
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold border inline-block ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : b.status === 'request_received'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : b.status === 'awaiting_customer_acceptance'
                            ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                            : 'bg-white/5 text-silver border-white/10'
                        }`}>
                          {b.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="p-3 text-right space-y-1">
                        {/* Approval / Decline buttons */}
                        {b.status === 'request_received' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApprove(b)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleOpenQuoteModal(b)}
                              className="px-2 py-1 bg-brand-red hover:bg-red-700 text-white text-[10px] font-bold"
                            >
                              Quote
                            </button>
                            <button
                              onClick={() => setDeclineBookingTarget(b)}
                              className="px-2 py-1 bg-white/10 hover:bg-white/20 text-silver text-[10px]"
                            >
                              Decline
                            </button>
                          </div>
                        )}

                        {/* Payment & Deposit recording */}
                        <div className="flex items-center justify-end gap-1.5 pt-1">
                          {b.payment_status !== 'paid' && (
                            <button
                              onClick={() => handleRecordCash(b)}
                              title="Record cash rental payment"
                              className="px-2 py-0.5 bg-obsidian border border-white/10 hover:border-white/30 text-silver text-[10px]"
                            >
                              + Cash
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setDepositBookingTarget(b);
                              setDepositAction('collect');
                            }}
                            title="Manage security deposit"
                            className="px-2 py-0.5 bg-obsidian border border-white/10 hover:border-white/30 text-silver text-[10px]"
                          >
                            Deposit
                          </button>
                          <button
                            onClick={() => handleOpenInspection(b)}
                            title="Digital inspection checklist"
                            className="px-2 py-0.5 bg-obsidian border border-brand-red/40 hover:border-brand-red text-brand-red text-[10px]"
                          >
                            Inspection
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: AVAILABILITY & BLOCKS */}
        {activeTab === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Create Availability Block Form */}
            <div className="lg:col-span-5 p-6 bg-charcoal border border-white/10">
              <span className="label-technical text-brand-red text-[10px] block mb-1">CALENDAR OVERRIDE</span>
              <h3 className="text-lg font-bold text-white mb-4 font-display">Block Vehicle Dates</h3>
              <p className="text-silver text-xs font-mono mb-4 leading-relaxed">
                Manually block dates for scheduled maintenance, personal use, or offline bookings.
                Blocked periods are strictly barred from customer inquiries.
              </p>

              <form onSubmit={handleAddBlock} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="text-[10px] text-silver block mb-1">SELECT VEHICLE</label>
                  <select
                    value={newBlockVehicleId}
                    onChange={(e) => setNewBlockVehicleId(e.target.value)}
                    className="input-dark w-full"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-silver block mb-1">BLOCK START (DATE & TIME)</label>
                  <input
                    type="datetime-local"
                    value={newBlockStart}
                    onChange={(e) => setNewBlockStart(e.target.value)}
                    required
                    className="input-dark w-full"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-silver block mb-1">BLOCK END (DATE & TIME)</label>
                  <input
                    type="datetime-local"
                    value={newBlockEnd}
                    onChange={(e) => setNewBlockEnd(e.target.value)}
                    required
                    className="input-dark w-full"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-silver block mb-1">REASON / NOTES</label>
                  <input
                    type="text"
                    value={newBlockReason}
                    onChange={(e) => setNewBlockReason(e.target.value)}
                    placeholder="e.g. 60,000 km Service / Inspection"
                    className="input-dark w-full"
                  />
                </div>

                <button
                  type="submit"
                  disabled={addingBlock}
                  className="btn-primary w-full py-3 text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {addingBlock ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  <span>ADD AVAILABILITY BLOCK</span>
                </button>
              </form>
            </div>

            {/* List of Active Availability Blocks & Confirmed Bookings */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-6 bg-charcoal border border-white/10">
                <h3 className="text-base font-bold text-white mb-4 font-display">Active Availability Blocks</h3>
                {calendarData.blocks.length === 0 ? (
                  <p className="text-ash text-xs font-mono">No active availability blocks.</p>
                ) : (
                  <div className="space-y-3 font-mono text-xs">
                    {calendarData.blocks.map((b) => (
                      <div key={b.id} className="p-3 bg-obsidian border border-white/10 flex items-center justify-between">
                        <div>
                          <strong className="text-white block">{b.vehicle_name}</strong>
                          <span className="text-silver text-[11px]">
                            {new Date(b.start_date).toLocaleString('de-CH')} → {new Date(b.end_date).toLocaleString('de-CH')}
                          </span>
                          <span className="text-ash text-[10px] block mt-0.5">Reason: {b.reason}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveBlock(b.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 bg-charcoal border border-white/10">
                <h3 className="text-base font-bold text-white mb-4 font-display">Confirmed Bookings Schedule</h3>
                <div className="space-y-3 font-mono text-xs">
                  {calendarData.bookings.slice(0, 8).map((cb) => (
                    <div key={cb.booking_ref} className="p-3 bg-obsidian border border-emerald-500/20 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-brand-red font-bold">#{cb.booking_ref}</span>
                          <span className="text-white font-bold">{cb.vehicle_name}</span>
                        </div>
                        <span className="text-silver text-[11px]">
                          {new Date(cb.pickup_date).toLocaleString('de-CH')} → {new Date(cb.return_date).toLocaleString('de-CH')}
                        </span>
                        <div className="text-ash text-[10px]">Client: {cb.customer_name} ({cb.customer_phone})</div>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] uppercase font-bold border border-emerald-500/30">
                        CONFIRMED
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: NOTIFICATION LOGS */}
        {activeTab === 'emails' && (
          <div className="p-6 bg-charcoal border border-white/10 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white font-display">System Notification Audit Trail</h3>
              <span className="text-xs font-mono text-silver">{emailLogs.length} Records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead className="bg-obsidian text-silver uppercase border-b border-white/10">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Event Type</th>
                    <th className="p-3">Recipient</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {emailLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 text-silver">
                        {new Date(log.created_at).toLocaleString('de-CH')}
                      </td>
                      <td className="p-3 text-white font-bold uppercase">{log.event_type}</td>
                      <td className="p-3 text-silver">{log.recipient_email}</td>
                      <td className="p-3 text-white">{log.subject}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] uppercase font-bold border border-emerald-500/30">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: ISSUE INDIVIDUAL QUOTE */}
      {quoteBooking && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-charcoal border border-white/20 max-w-lg w-full p-6 md:p-8 font-mono text-xs text-pearl shadow-2xl">
            <h3 className="text-xl font-bold font-display text-white mb-2">
              Issue Individual Quote
            </h3>
            <p className="text-silver text-xs mb-4">
              Booking Ref: <strong className="text-brand-red">#{quoteBooking.booking_ref}</strong> ({quoteBooking.vehicle_name})
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[10px] text-silver block mb-1">BASE VEHICLE RENTAL AMOUNT (CHF) *</label>
                <input
                  type="number"
                  value={quoteBaseAmount}
                  onChange={(e) => setQuoteBaseAmount(Number(e.target.value))}
                  className="input-dark w-full"
                />
              </div>

              <div>
                <label className="text-[10px] text-silver block mb-1">INCLUDED MILEAGE (KM) *</label>
                <input
                  type="number"
                  value={quoteMileage}
                  onChange={(e) => setQuoteMileage(Number(e.target.value))}
                  className="input-dark w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-silver block mb-1">DELIVERY FEE (CHF)</label>
                  <input
                    type="number"
                    value={quoteDeliveryFee}
                    onChange={(e) => setQuoteDeliveryFee(Number(e.target.value))}
                    className="input-dark w-full"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-silver block mb-1">CHAUFFEUR FEE (CHF)</label>
                  <input
                    type="number"
                    value={quoteChauffeurFee}
                    onChange={(e) => setQuoteChauffeurFee(Number(e.target.value))}
                    className="input-dark w-full"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-silver block mb-1">SECURITY DEPOSIT (CASH AT PICKUP) *</label>
                <input
                  type="number"
                  value={quoteSecurityDeposit}
                  onChange={(e) => setQuoteSecurityDeposit(Number(e.target.value))}
                  className="input-dark w-full"
                />
              </div>

              <div>
                <label className="text-[10px] text-silver block mb-1">QUOTE EXPLANATION / NOTES</label>
                <textarea
                  rows={2}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  placeholder="Special weekend tariff, airport delivery fee included..."
                  className="input-dark w-full"
                />
              </div>

              <div className="p-3 bg-obsidian border border-white/10 flex justify-between items-baseline text-sm">
                <span className="text-white font-bold">TOTAL PAYABLE:</span>
                <span className="text-xl font-bold text-brand-red">
                  CHF {(Number(quoteBaseAmount) + Number(quoteDeliveryFee) + Number(quoteChauffeurFee)).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setQuoteBooking(null)}
                className="btn-secondary py-2 px-4 text-xs font-mono"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={issuingQuote}
                onClick={handleSubmitQuote}
                className="btn-primary py-2 px-6 text-xs font-mono tracking-widest flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {issuingQuote ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                <span>SEND QUOTE TO CUSTOMER</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DECLINE BOOKING */}
      {declineBookingTarget && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-charcoal border border-white/20 max-w-md w-full p-6 font-mono text-xs text-pearl shadow-2xl">
            <h3 className="text-lg font-bold font-display text-white mb-2">Decline Rental Request</h3>
            <p className="text-silver text-xs mb-4">
              Booking Ref: <strong className="text-brand-red">#{declineBookingTarget.booking_ref}</strong>
            </p>

            <div className="mb-4">
              <label className="text-[10px] text-silver block mb-1">REASON EXPLAINED TO CUSTOMER</label>
              <textarea
                rows={3}
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="input-dark w-full"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setDeclineBookingTarget(null)}
                className="btn-secondary py-2 px-4 text-xs"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={declining}
                onClick={handleConfirmDecline}
                className="py-2 px-5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2"
              >
                {declining ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                <span>CONFIRM DECLINE</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SECURITY DEPOSIT MANAGEMENT */}
      {depositBookingTarget && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-charcoal border border-white/20 max-w-md w-full p-6 font-mono text-xs text-pearl shadow-2xl">
            <h3 className="text-lg font-bold font-display text-white mb-2">Security Deposit Management</h3>
            <p className="text-silver text-xs mb-4">
              Booking: <strong className="text-brand-red">#{depositBookingTarget.booking_ref}</strong> •
              Deposit Tariff: <strong className="text-white">CHF {depositBookingTarget.security_deposit || 500}</strong>
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[10px] text-silver block mb-1">SELECT ACTION</label>
                <select
                  value={depositAction}
                  onChange={(e) => setDepositAction(e.target.value as any)}
                  className="input-dark w-full"
                >
                  <option value="collect">Record Cash Deposit Collected (At Pickup)</option>
                  <option value="repay">Record Cash Deposit Fully Repaid (At Return)</option>
                  <option value="deduct">Deduct Extra Charges / Fines From Deposit</option>
                </select>
              </div>

              {depositAction === 'collect' && (
                <div>
                  <label className="text-[10px] text-silver block mb-1">CASH RECEIPT NUMBER / REFERENCE</label>
                  <input
                    type="text"
                    placeholder="e.g. REC-2026-0042"
                    value={depositReceiptRef}
                    onChange={(e) => setDepositReceiptRef(e.target.value)}
                    className="input-dark w-full"
                  />
                </div>
              )}

              {depositAction === 'deduct' && (
                <div>
                  <label className="text-[10px] text-silver block mb-1">DEDUCTION AMOUNT (CHF) *</label>
                  <input
                    type="number"
                    value={depositDeductionAmount}
                    onChange={(e) => setDepositDeductionAmount(Number(e.target.value))}
                    className="input-dark w-full"
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] text-silver block mb-1">NOTES / JUSTIFICATION</label>
                <textarea
                  rows={2}
                  placeholder="Notes on condition, refuelling, or repayment"
                  value={depositNotes}
                  onChange={(e) => setDepositNotes(e.target.value)}
                  className="input-dark w-full"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setDepositBookingTarget(null)}
                className="btn-secondary py-2 px-4 text-xs"
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={recordingDeposit}
                onClick={handleDepositSubmit}
                className="btn-primary py-2 px-6 text-xs flex items-center gap-2"
              >
                {recordingDeposit ? <Loader2 size={14} className="animate-spin" /> : <Banknote size={14} />}
                <span>SAVE DEPOSIT ACTION</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DIGITAL INSPECTION REPORT */}
      {selectedBookingForInspection && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-charcoal border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 font-mono text-xs text-pearl shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <span className="label-technical text-brand-red text-[10px] block">VEHICLE HANDOVER AUDIT</span>
                <h3 className="text-xl font-bold font-display text-white">
                  Inspection Checklist (#{selectedBookingForInspection.booking_ref})
                </h3>
              </div>
              <button
                onClick={() => setSelectedBookingForInspection(null)}
                className="text-silver hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Pickup Inspection */}
              <div className="p-4 bg-obsidian border border-white/10 space-y-3">
                <h4 className="text-white font-bold uppercase text-[11px] pb-2 border-b border-white/10">
                  1. Pickup Handover Protocol
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-silver block mb-1">ODOMETER AT PICKUP (KM) *</label>
                    <input
                      type="number"
                      value={inspectionData.pickup_odometer || ''}
                      onChange={(e) => setInspectionData({ ...inspectionData, pickup_odometer: Number(e.target.value) })}
                      className="input-dark w-full"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-silver block mb-1">FUEL LEVEL AT PICKUP</label>
                    <select
                      value={inspectionData.pickup_fuel_level || '100%'}
                      onChange={(e) => setInspectionData({ ...inspectionData, pickup_fuel_level: e.target.value })}
                      className="input-dark w-full"
                    >
                      <option value="100%">100% (Full Tank)</option>
                      <option value="87.5%">7/8 Tank</option>
                      <option value="75%">3/4 Tank</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-silver block mb-1">PRE-EXISTING WEAR / SCRATCHES</label>
                  <input
                    type="text"
                    placeholder="Minor rim scratch right front..."
                    value={inspectionData.pickup_damage_notes || ''}
                    onChange={(e) => setInspectionData({ ...inspectionData, pickup_damage_notes: e.target.value })}
                    className="input-dark w-full"
                  />
                </div>
              </div>

              {/* Return Inspection */}
              <div className="p-4 bg-obsidian border border-white/10 space-y-3">
                <h4 className="text-white font-bold uppercase text-[11px] pb-2 border-b border-white/10">
                  2. Return Check-in Protocol
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-silver block mb-1">ODOMETER AT RETURN (KM)</label>
                    <input
                      type="number"
                      value={inspectionData.return_odometer || ''}
                      onChange={(e) => setInspectionData({ ...inspectionData, return_odometer: Number(e.target.value) })}
                      className="input-dark w-full"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-silver block mb-1">FUEL LEVEL AT RETURN</label>
                    <select
                      value={inspectionData.return_fuel_level || '100%'}
                      onChange={(e) => setInspectionData({ ...inspectionData, return_fuel_level: e.target.value })}
                      className="input-dark w-full"
                    >
                      <option value="100%">100% (Full Tank)</option>
                      <option value="75%">3/4 Tank (-CHF 50 + Fuel)</option>
                      <option value="50%">1/2 Tank (-CHF 50 + Fuel)</option>
                      <option value="25%">1/4 Tank (-CHF 50 + Fuel)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-silver block mb-1">NEW DAMAGES / CLEANLINESS</label>
                  <input
                    type="text"
                    placeholder="e.g. Heavy interior dirt (+CHF 50), or perfect condition"
                    value={inspectionData.return_damage_notes || ''}
                    onChange={(e) => setInspectionData({ ...inspectionData, return_damage_notes: e.target.value })}
                    className="input-dark w-full"
                  />
                </div>
              </div>

              {/* Auto calculated math preview */}
              {inspectionData.pickup_odometer && inspectionData.return_odometer && (
                <div className="p-4 bg-brand-red/10 border border-brand-red/30 space-y-2 font-mono text-xs">
                  <div className="flex justify-between text-silver">
                    <span>Distance Driven:</span>
                    <strong className="text-white">
                      {Math.max(0, inspectionData.return_odometer - inspectionData.pickup_odometer)} km
                    </strong>
                  </div>
                  <div className="flex justify-between text-silver">
                    <span>Included Mileage:</span>
                    <strong className="text-white">
                      {selectedBookingForInspection.included_mileage || 200} km
                    </strong>
                  </div>
                  <div className="flex justify-between text-brand-red font-bold pt-2 border-t border-brand-red/30">
                    <span>Extra Mileage Charge:</span>
                    <span>
                      CHF {Math.max(0, (inspectionData.return_odometer - inspectionData.pickup_odometer) - (selectedBookingForInspection.included_mileage || 200)) * (Number(selectedBookingForInspection.extra_km_rate) || 0.5)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-white/10 mt-6">
              <button
                type="button"
                onClick={() => setSelectedBookingForInspection(null)}
                className="btn-secondary py-2 px-4 text-xs font-mono"
              >
                CLOSE
              </button>
              <button
                type="button"
                disabled={savingInspection}
                onClick={handleSaveInspection}
                className="btn-primary py-2 px-6 text-xs font-mono tracking-widest flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {savingInspection ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                <span>SAVE INSPECTION DOSSIER</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
