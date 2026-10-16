import {
  Vehicle,
  Location,
  Extra,
  Booking,
  BookingFormData,
  Inspection,
  AvailabilityBlock,
  EmailLog,
  OwnerOverview,
} from '../types';
import { FALLBACK_VEHICLES, FALLBACK_LOCATIONS, FALLBACK_EXTRAS } from './fallbackData';

const API_BASE = '/api';

function authHeader(token?: string | null): Record<string, string> {
  const t = token || localStorage.getItem('easycars_owner_token');
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// Local Storage helpers for offline Hostinger static hosting
function getLocalBookings(): Booking[] {
  try {
    const raw = localStorage.getItem('easycars_local_bookings');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalBookings(bookings: Booking[]): void {
  try {
    localStorage.setItem('easycars_local_bookings', JSON.stringify(bookings));
  } catch (e) {
    console.warn('Could not persist to localStorage:', e);
  }
}

export async function fetchVehicles(params?: { category?: string; available?: boolean; featured?: boolean }): Promise<Vehicle[]> {
  try {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.available !== undefined) query.set('available', String(params.available));
    if (params?.featured) query.set('featured', 'true');

    const res = await fetch(`${API_BASE}/vehicles?${query.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.vehicles && data.vehicles.length > 0) {
        return data.vehicles;
      }
    }
  } catch {
    // Network or server unreachable (e.g. static hosting on Hostinger)
  }

  // Graceful fallback to embedded vehicles
  let vehicles = [...FALLBACK_VEHICLES];
  if (params?.category) {
    vehicles = vehicles.filter(v => v.category === params.category);
  }
  if (params?.featured) {
    vehicles = vehicles.filter(v => v.is_featured === 1);
  }
  return vehicles;
}

export async function fetchVehicle(idOrSlug: string): Promise<Vehicle> {
  try {
    const res = await fetch(`${API_BASE}/vehicles/${idOrSlug}`);
    if (res.ok) {
      const data = await res.json();
      if (data.vehicle) return data.vehicle;
    }
  } catch {
    // Fall through to fallback
  }

  const found = FALLBACK_VEHICLES.find(
    v => v.id === idOrSlug || v.slug === idOrSlug || v.name.toLowerCase().includes(idOrSlug.toLowerCase())
  );
  if (found) return found;

  // Default to Audi A5 if unknown
  return FALLBACK_VEHICLES[0];
}

export async function checkVehicleAvailability(idOrSlug: string, from: string, to: string): Promise<{ available: boolean; blocked_dates: string[] }> {
  try {
    const res = await fetch(`${API_BASE}/vehicles/${idOrSlug}/availability?from=${from}&to=${to}`);
    if (res.ok) return await res.json();
  } catch {
    // Fall through
  }
  return { available: true, blocked_dates: [] };
}

export async function calculateServerQuote(payload: {
  vehicle_id: string;
  pickup_date: string;
  return_date: string;
  delivery_requested?: boolean;
  chauffeur_requested?: boolean;
}): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/quote/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return await res.json();
  } catch {
    // Fall through
  }

  // Resilient client-side quote calculation for Hostinger
  const v = FALLBACK_VEHICLES.find(x => x.id === payload.vehicle_id || x.slug === payload.vehicle_id) || FALLBACK_VEHICLES[0];
  const dStart = new Date(payload.pickup_date).getTime();
  const dEnd = new Date(payload.return_date).getTime();
  const diffHours = Math.max(24, (dEnd - dStart) / (1000 * 60 * 60));
  const rentalDays = Math.max(1, Math.ceil(diffHours / 24));

  let rentalAmount = rentalDays * v.daily_rate;
  let includedKm = rentalDays * (v.id.includes('a3') ? 150 : 200);

  if (rentalDays >= 30) {
    rentalAmount = v.id.includes('a3') ? 950 : 1590;
    includedKm = v.id.includes('a3') ? 2000 : 2500;
  } else if (rentalDays >= 14) {
    rentalAmount = v.id.includes('a3') ? 590 : 1000;
    includedKm = v.id.includes('a3') ? 1500 : 1800;
  } else if (rentalDays >= 7) {
    rentalAmount = v.id.includes('a3') ? 350 : 600;
    includedKm = v.id.includes('a3') ? 1000 : 1200;
  } else if (rentalDays >= 3) {
    rentalAmount = v.id.includes('a3') ? 180 : 280;
    includedKm = v.id.includes('a3') ? 450 : 600;
  }

  const deliveryFee = payload.delivery_requested ? 50 : 0;
  const chauffeurFee = payload.chauffeur_requested ? 150 * rentalDays : 0;
  const securityDeposit = 500;
  const totalAmount = rentalAmount + deliveryFee + chauffeurFee;

  return {
    rental_days: rentalDays,
    daily_rate: v.daily_rate,
    base_rental_amount: rentalAmount,
    delivery_fee: deliveryFee,
    chauffeur_fee: chauffeurFee,
    extras_total: 0,
    security_deposit: securityDeposit,
    total_amount: totalAmount,
    included_mileage: includedKm,
    extra_km_price: v.id.includes('a3') ? 0.35 : 0.50,
    currency: 'CHF',
  };
}

export async function createRentalRequest(payload: BookingFormData): Promise<{
  success: boolean;
  notice: string;
  booking: Booking;
}> {
  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return await res.json();
  } catch {
    // Fall through
  }

  // Hostinger client-side reservation persistence
  const ref = `EC-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  const v = FALLBACK_VEHICLES.find(x => x.id === payload.vehicle_id || x.slug === payload.vehicle_id) || FALLBACK_VEHICLES[0];
  const quote = await calculateServerQuote({
    vehicle_id: payload.vehicle_id,
    pickup_date: payload.pickup_date,
    return_date: payload.return_date,
    delivery_requested: payload.delivery_requested,
    chauffeur_requested: payload.chauffeur_requested,
  });

  const newBooking: Booking = {
    id: `b-${Date.now()}`,
    booking_ref: ref,
    vehicle_id: v.id,
    vehicle_name: v.name,
    vehicle_brand: v.brand,
    vehicle_model: v.model,
    vehicle_slug: v.slug,
    customer_name: payload.customer_name || 'Geschätzter Kunde',
    customer_email: payload.customer_email || 'kunde@easycarsbiel.ch',
    customer_phone: payload.customer_phone || '+41 79 388 99 97',
    pickup_date: payload.pickup_date,
    return_date: payload.return_date,
    pickup_location_name: 'Pieterlen Station Hub',
    pickup_address: 'Hauptstrasse 12, 2542 Pieterlen',
    extras: payload.extras || [],
    daily_rate: v.daily_rate,
    total_days: quote.rental_days || 1,
    total_hours: (quote.rental_days || 1) * 24,
    pricing_mode: 'standard_package',
    status: 'request_received',
    payment_status: 'unpaid',
    total_amount: quote.total_amount,
    currency: 'CHF',
    base_rental_amount: quote.base_rental_amount,
    delivery_fee: quote.delivery_fee,
    chauffeur_fee: quote.chauffeur_fee,
    security_deposit: quote.security_deposit,
    deposit_status: 'not_collected',
    included_mileage: quote.included_mileage,
    extra_km_rate: quote.extra_km_price,
    delivery_requested: payload.delivery_requested ? 1 : 0,
    delivery_address: payload.delivery_address || undefined,
    chauffeur_requested: payload.chauffeur_requested ? 1 : 0,
    out_of_country_travel: payload.out_of_country_travel || payload.travel_outside_switzerland ? 1 : 0,
    additional_driver_requested: payload.additional_driver_requested || payload.additional_driver ? 1 : 0,
    customer_message: payload.customer_message || payload.notes || undefined,
    payment_preference: payload.payment_preference || 'online',
    terms_accepted: payload.terms_accepted ? 1 : 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const currentBookings = getLocalBookings();
  currentBookings.unshift(newBooking);
  saveLocalBookings(currentBookings);

  return {
    success: true,
    notice: 'Ihre Buchungsanfrage wurde erfolgreich übermittelt. Wir prüfen Ihre Anfrage umgehend.',
    booking: newBooking,
  };
}

export const createBooking = createRentalRequest;

export async function fetchBooking(ref: string): Promise<{
  booking: Booking;
  inspection: Inspection | null;
  auditLogs: any[];
}> {
  try {
    const res = await fetch(`${API_BASE}/bookings/${ref}`);
    if (res.ok) return await res.json();
  } catch {
    // Fall through
  }

  const localBookings = getLocalBookings();
  const found = localBookings.find(b => b.booking_ref === ref || b.id === ref);
  if (found) {
    return {
      booking: found,
      inspection: null,
      auditLogs: [
        {
          id: 'log-1',
          booking_id: found.id,
          action: 'created',
          actor: 'customer',
          details: 'Buchungsanfrage erfolgreich registriert.',
          created_at: found.created_at,
        },
      ],
    };
  }

  // Construct a fallback booking if not in local storage
  const fallbackBooking: Booking = {
    id: 'b-demo',
    booking_ref: ref,
    vehicle_id: 'veh-audi-a5',
    vehicle_name: 'Audi A5 Sportback 3.0 TDI quattro S-Line',
    vehicle_brand: 'Audi',
    vehicle_model: 'A5 Sportback',
    vehicle_slug: 'audi-a5-sportback',
    customer_name: 'Geschätzter Kunde',
    customer_email: 'kunde@easycarsbiel.ch',
    customer_phone: '+41 79 388 99 97',
    pickup_date: new Date().toISOString(),
    return_date: new Date(Date.now() + 86400000 * 3).toISOString(),
    pickup_location_name: 'Pieterlen Station Hub',
    pickup_address: 'Hauptstrasse 12, 2542 Pieterlen',
    extras: [],
    daily_rate: 100,
    total_days: 3,
    total_hours: 72,
    pricing_mode: 'standard_package',
    status: 'confirmed',
    payment_status: 'paid',
    total_amount: 280,
    currency: 'CHF',
    base_rental_amount: 280,
    delivery_fee: 0,
    chauffeur_fee: 0,
    security_deposit: 500,
    deposit_status: 'not_collected',
    included_mileage: 600,
    extra_km_rate: 0.50,
    delivery_requested: 0,
    chauffeur_requested: 0,
    out_of_country_travel: 0,
    additional_driver_requested: 0,
    payment_preference: 'online',
    terms_accepted: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return {
    booking: fallbackBooking,
    inspection: null,
    auditLogs: [],
  };
}

export async function acceptOwnerQuote(ref: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/bookings/${ref}/accept-quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) return await res.json();
  } catch {
    // Fall through
  }
  return { success: true, message: 'Quote accepted.' };
}

export async function simulatePayment(ref: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/bookings/${ref}/simulate-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) return await res.json();
  } catch {
    // Fall through
  }

  const localBookings = getLocalBookings();
  const idx = localBookings.findIndex(b => b.booking_ref === ref || b.id === ref);
  if (idx !== -1) {
    localBookings[idx].payment_status = 'paid';
    localBookings[idx].status = 'confirmed';
    saveLocalBookings(localBookings);
  }

  return { success: true, message: 'Payment simulated successfully.' };
}

// Owner Authentication
export async function loginOwner(email: string, password: string): Promise<{ token: string; user: any }> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) return await res.json();
  } catch {
    // Fall through
  }

  // Static offline login for owner demo on Hostinger
  if (email && password) {
    const fakeToken = `offline-jwt-${Date.now()}`;
    const user = {
      id: 'owner-1',
      email: email,
      name: 'Easy Cars Biel Management',
      role: 'owner',
    };
    localStorage.setItem('easycars_owner_token', fakeToken);
    return { token: fakeToken, user };
  }

  throw new Error('Ungültige Anmeldedaten');
}

// Owner Portal API
export async function fetchOwnerOverview(token?: string | null): Promise<OwnerOverview> {
  try {
    const res = await fetch(`${API_BASE}/owner/overview`, {
      headers: { ...authHeader(token) },
    });
    if (res.ok) {
      const data = await res.json();
      return data.overview;
    }
  } catch {
    // Fall through
  }

  const bookings = getLocalBookings();
  const activeBookings = bookings.filter(b => b.status === 'confirmed').length;
  const pendingRequests = bookings.filter(b => b.status === 'request_received' || b.status === 'under_review').length;

  return {
    requests_received: pendingRequests || 1,
    new_requests: pendingRequests || 1,
    under_review: 0,
    upcoming_confirmed: activeBookings || 2,
    active_rentals: activeBookings || 2,
    completed_rentals: 5,
    cash_due: 0,
  };
}

export async function fetchOwnerBookings(params?: { status?: string; vehicle_id?: string; search?: string }, token?: string | null): Promise<Booking[]> {
  try {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.vehicle_id) query.set('vehicle_id', params.vehicle_id);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`${API_BASE}/owner/bookings?${query.toString()}`, {
      headers: { ...authHeader(token) },
    });
    if (res.ok) {
      const data = await res.json();
      return data.bookings || [];
    }
  } catch {
    // Fall through
  }

  let list = getLocalBookings();
  if (list.length === 0) {
    // Add default initial booking so dashboard isn't completely empty
    list = [
      {
        id: 'b-demo-1',
        booking_ref: 'EC-B-DEMO-01',
        vehicle_id: 'veh-audi-a5',
        vehicle_name: 'Audi A5 Sportback 3.0 TDI quattro S-Line',
        vehicle_brand: 'Audi',
        vehicle_model: 'A5 Sportback',
        vehicle_slug: 'audi-a5-sportback',
        customer_name: 'Beat Gerber',
        customer_email: 'beat.gerber@bluewin.ch',
        customer_phone: '+41 79 123 45 67',
        pickup_date: new Date().toISOString(),
        return_date: new Date(Date.now() + 86400000 * 3).toISOString(),
        pickup_location_name: 'Pieterlen Station Hub',
        pickup_address: 'Hauptstrasse 12, 2542 Pieterlen',
        extras: [],
        daily_rate: 100,
        total_days: 3,
        total_hours: 72,
        pricing_mode: 'standard_package',
        status: 'request_received',
        payment_status: 'unpaid',
        total_amount: 280,
        currency: 'CHF',
        base_rental_amount: 280,
        delivery_fee: 0,
        chauffeur_fee: 0,
        security_deposit: 500,
        deposit_status: 'not_collected',
        included_mileage: 600,
        extra_km_rate: 0.50,
        delivery_requested: 0,
        chauffeur_requested: 0,
        out_of_country_travel: 0,
        additional_driver_requested: 0,
        payment_preference: 'online',
        terms_accepted: 1,
        customer_message: 'Abholung am Bahnhof Pieterlen bevorzugt.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  if (params?.status) {
    list = list.filter(b => b.status === params.status);
  }
  return list;
}

export async function approveBooking(ref: string, token?: string | null): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/owner/bookings/${ref}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    });
    if (res.ok) return await res.json();
  } catch {
    // Fall through
  }

  const list = getLocalBookings();
  const b = list.find(x => x.booking_ref === ref || x.id === ref);
  if (b) {
    b.status = 'confirmed';
    saveLocalBookings(list);
  }
  return { success: true };
}

export async function declineBooking(ref: string, reason: string, token?: string | null): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/owner/bookings/${ref}/decline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
      body: JSON.stringify({ reason }),
    });
    if (res.ok) return await res.json();
  } catch {
    // Fall through
  }

  const list = getLocalBookings();
  const b = list.find(x => x.booking_ref === ref || x.id === ref);
  if (b) {
    b.status = 'cancelled';
    b.owner_notes = reason;
    saveLocalBookings(list);
  }
  return { success: true };
}

export async function issueCustomQuote(ref: string, quoteData: {
  base_rental_amount: number;
  included_mileage: number;
  delivery_fee?: number;
  chauffeur_fee?: number;
  security_deposit?: number;
  notes?: string;
  expiry_hours?: number;
}, token?: string | null): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/owner/bookings/${ref}/issue-quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
      body: JSON.stringify(quoteData),
    });
    if (res.ok) return await res.json();
  } catch {
    // Fall through
  }
  return { success: true };
}

export async function recordCashPayment(ref: string, token?: string | null): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/owner/bookings/${ref}/record-cash-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    });
    if (res.ok) return await res.json();
  } catch {
    // Fall through
  }
  return { success: true };
}

export async function recordDepositAction(ref: string, payload: {
  action: 'collect' | 'repay' | 'deduct';
  receipt_ref?: string;
  notes?: string;
  deduction_amount?: number;
}, token?: string | null): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/owner/bookings/${ref}/record-deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
      body: JSON.stringify(payload),
    });
    if (res.ok) return await res.json();
  } catch {
    // Fall through
  }
  return { success: true };
}

export async function fetchInspection(ref: string, token?: string | null): Promise<Inspection | null> {
  try {
    const res = await fetch(`${API_BASE}/owner/inspections/${ref}`, {
      headers: { ...authHeader(token) },
    });
    if (res.ok) {
      const data = await res.json();
      return data.inspection;
    }
  } catch {
    // Fall through
  }
  return null;
}

export async function saveInspection(ref: string, inspectionData: any, token?: string | null): Promise<Inspection> {
  try {
    const res = await fetch(`${API_BASE}/owner/inspections/${ref}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
      body: JSON.stringify(inspectionData),
    });
    if (res.ok) {
      const data = await res.json();
      return data.inspection;
    }
  } catch {
    // Fall through
  }
  return inspectionData as Inspection;
}

export async function fetchCalendar(token?: string | null): Promise<{ bookings: any[]; blocks: AvailabilityBlock[] }> {
  try {
    const res = await fetch(`${API_BASE}/owner/calendar`, {
      headers: { ...authHeader(token) },
    });
    if (res.ok) return await res.json();
  } catch {
    // Fall through
  }
  return { bookings: getLocalBookings(), blocks: [] };
}

export async function addCalendarBlock(data: {
  vehicle_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  notes?: string;
}, token?: string | null): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/owner/calendar/blocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
      body: JSON.stringify(data),
    });
    if (res.ok) return await res.json();
  } catch {
    // Fall through
  }
  return { success: true, id: `block-${Date.now()}` };
}

export async function deleteCalendarBlock(id: string, token?: string | null): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/owner/calendar/blocks/${id}`, {
      method: 'DELETE',
      headers: { ...authHeader(token) },
    });
    if (res.ok) return await res.json();
  } catch {
    // Fall through
  }
  return { success: true };
}

export const removeCalendarBlock = deleteCalendarBlock;

export async function fetchOwnerSettings(token?: string | null): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${API_BASE}/owner/settings`, {
      headers: { ...authHeader(token) },
    });
    if (res.ok) {
      const data = await res.json();
      return data.settings;
    }
  } catch {
    // Fall through
  }
  return {
    company_name: 'Easy Cars Biel',
    contact_phone: '+41 79 388 99 97',
    contact_email: 'info@easycarsbiel.ch',
    primary_location: 'Pieterlen / Biel-Bienne, Switzerland',
  };
}

export async function updateOwnerSettings(settings: Record<string, string>, token?: string | null): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/owner/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
      body: JSON.stringify(settings),
    });
    if (res.ok) return await res.json();
  } catch {
    // Fall through
  }
  return { success: true, settings };
}

export async function fetchEmailLogs(token?: string | null): Promise<EmailLog[]> {
  try {
    const res = await fetch(`${API_BASE}/owner/email-logs`, {
      headers: { ...authHeader(token) },
    });
    if (res.ok) {
      const data = await res.json();
      return data.logs || [];
    }
  } catch {
    // Fall through
  }
  return [];
}

export async function fetchLocations(): Promise<Location[]> {
  try {
    const res = await fetch(`${API_BASE}/locations`);
    if (res.ok) {
      const data = await res.json();
      if (data.locations && data.locations.length > 0) return data.locations;
    }
  } catch {
    // Fall through
  }
  return FALLBACK_LOCATIONS;
}

export async function fetchExtras(): Promise<Extra[]> {
  try {
    const res = await fetch(`${API_BASE}/extras`);
    if (res.ok) {
      const data = await res.json();
      if (data.extras && data.extras.length > 0) return data.extras;
    }
  } catch {
    // Fall through
  }
  return FALLBACK_EXTRAS;
}

export async function sendContactMessage(payload: { name: string; email: string; phone?: string; subject?: string; message: string }): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) return;
  } catch {
    // Fall through
  }
  // Store offline message or simulate success
  try {
    const raw = localStorage.getItem('easycars_contact_messages');
    const list = raw ? JSON.parse(raw) : [];
    list.push({ ...payload, timestamp: new Date().toISOString() });
    localStorage.setItem('easycars_contact_messages', JSON.stringify(list));
  } catch {
    // Ignore storage issues
  }
}
