import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { calculateRentalTariff } from '../utils/pricing.js';
import { checkVehicleAvailability } from '../services/availabilityService.js';
import { sendNotificationEmail } from '../services/emailService.js';

export const bookingRoutes = Router();

function generateBookingRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'EC-';
  for (let i = 0; i < 6; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  return ref;
}

const bookingRequestSchema = z.object({
  vehicle_id: z.string().min(1),
  pickup_date: z.string().min(5),
  return_date: z.string().min(5),
  customer_name: z.string().min(2).max(100),
  customer_email: z.string().email(),
  customer_phone: z.string().min(6).max(30),
  customer_license: z.string().optional(),
  delivery_requested: z.boolean().optional(),
  delivery_address: z.string().optional(),
  delivery_postcode: z.string().optional(),
  delivery_preferred_time: z.string().optional(),
  delivery_instructions: z.string().optional(),
  chauffeur_requested: z.boolean().optional(),
  chauffeur_pickup_address: z.string().optional(),
  chauffeur_destination: z.string().optional(),
  chauffeur_service_type: z.string().optional(),
  chauffeur_passengers: z.number().optional(),
  chauffeur_estimated_duration: z.string().optional(),
  out_of_country_travel: z.boolean().optional(),
  travel_outside_switzerland: z.boolean().optional(),
  additional_driver_requested: z.boolean().optional(),
  additional_driver: z.boolean().optional(),
  customer_message: z.string().max(1000).optional(),
  notes: z.string().max(1000).optional(),
  payment_preference: z.preprocess((val) => (val === 'cash' ? 'cash_at_pickup' : val), z.enum(['online', 'cash_at_pickup'])),
  terms_accepted: z.boolean().refine((val) => val === true, {
    message: 'You must review and accept the official Swiss rental terms to submit a request',
  }),
  extras: z.array(z.string()).optional(),
});

// POST /api/bookings — Submit a new rental inquiry
bookingRoutes.post('/', async (req, res) => {
  try {
    const parsed = bookingRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const data = parsed.data;

    // 1. Fetch vehicle
    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ? OR slug = ?').get(data.vehicle_id, data.vehicle_id) as any;
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // 2. Validate dates
    const startMs = new Date(data.pickup_date).getTime();
    const endMs = new Date(data.return_date).getTime();
    if (isNaN(startMs) || isNaN(endMs) || endMs <= startMs) {
      return res.status(400).json({ error: 'Return date & time must be after pickup date & time' });
    }

    // 3. Availability check against confirmed reservations & blocks
    const availCheck = checkVehicleAvailability(vehicle.id, data.pickup_date, data.return_date);
    if (!availCheck.isAvailable) {
      return res.status(409).json({
        error: 'The vehicle is not available for the requested period.',
        reason: availCheck.conflictReason,
      });
    }

    // 4. Calculate tariff snapshot
    const tariff = calculateRentalTariff(vehicle.slug || vehicle.name, data.pickup_date, data.return_date);

    // 5. Calculate extras
    let extrasTotal = 0;
    const selectedExtras: string[] = data.extras || [];
    if (selectedExtras.length > 0) {
      const extraStmt = db.prepare('SELECT * FROM extras WHERE id = ? AND is_active = 1');
      for (const extraId of selectedExtras) {
        const extra = extraStmt.get(extraId) as any;
        if (extra) {
          if (extra.flat_rate) {
            extrasTotal += Number(extra.flat_rate);
          } else {
            extrasTotal += Number(extra.daily_rate) * tariff.totalDays;
          }
        }
      }
    }

    const baseRental = tariff.price ?? 0;
    const totalAmount = baseRental + extrasTotal;
    const bookingId = uuidv4();
    const bookingRef = generateBookingRef();
    const termsVersion = 'v1.0-CH-2026';
    const nowIso = new Date().toISOString();

    // 6. Insert booking with status: 'request_received'
    const locId = vehicle.location_id || 'loc-pieterlen-hub';
    const insertBooking = db.prepare(`
      INSERT INTO bookings (
        id, booking_ref, vehicle_id, pickup_location_id, return_location_id, pickup_date, return_date,
        customer_name, customer_email, customer_phone, customer_license,
        extras, daily_rate, total_days, total_hours, pricing_mode,
        base_rental_amount, included_mileage, extra_km_rate, security_deposit,
        deposit_status, delivery_requested, delivery_address, delivery_postcode,
        delivery_preferred_time, delivery_instructions, delivery_fee,
        chauffeur_requested, chauffeur_pickup_address, chauffeur_destination,
        chauffeur_service_type, chauffeur_passengers, chauffeur_estimated_duration,
        chauffeur_fee, out_of_country_travel, additional_driver_requested,
        customer_message, payment_preference, status, payment_status,
        subtotal, extras_total, tax_rate, tax_amount, total_amount, currency,
        terms_accepted, terms_accepted_at, terms_version,
        created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?
      )
    `);

    insertBooking.run(
      bookingId,
      bookingRef,
      vehicle.id,
      locId,
      locId,
      data.pickup_date,
      data.return_date,
      data.customer_name,
      data.customer_email,
      data.customer_phone,
      data.customer_license || null,
      JSON.stringify(selectedExtras),
      vehicle.daily_rate,
      tariff.totalDays,
      tariff.totalHours,
      tariff.pricingMode,
      baseRental,
      tariff.includedKm ?? 0,
      tariff.extraKmRate,
      tariff.securityDeposit,
      'not_collected',
      data.delivery_requested ? 1 : 0,
      data.delivery_address || null,
      data.delivery_postcode || null,
      data.delivery_preferred_time || null,
      data.delivery_instructions || null,
      0, // Delivery fee pending owner quote
      data.chauffeur_requested ? 1 : 0,
      data.chauffeur_pickup_address || null,
      data.chauffeur_destination || null,
      data.chauffeur_service_type || null,
      data.chauffeur_passengers || null,
      data.chauffeur_estimated_duration || null,
      0, // Chauffeur fee pending owner quote
      data.out_of_country_travel ? 1 : 0,
      data.additional_driver_requested ? 1 : 0,
      data.customer_message || null,
      data.payment_preference,
      'request_received',
      'unpaid',
      baseRental,
      extrasTotal,
      0,
      0,
      totalAmount,
      'CHF',
      1,
      nowIso,
      termsVersion,
      nowIso,
      nowIso
    );

    // 7. Insert audit log
    db.prepare(`
      INSERT INTO status_audit_logs (id, booking_id, previous_status, new_status, actor, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      uuidv4(),
      bookingId,
      null,
      'request_received',
      'customer',
      `Rental request submitted by ${data.customer_name} (${data.customer_email}). Duration: ${tariff.totalDays}d / ${tariff.totalHours}h.`
    );

    // 8. Send transactional emails
    // Customer acknowledgment
    await sendNotificationEmail({
      bookingId,
      recipient: data.customer_email,
      subject: `Rental Request Received — ${vehicle.name} (${bookingRef})`,
      type: 'request_received',
      bodyText: `Dear ${data.customer_name},\n\nYour rental request has been received. Your booking is not confirmed until the owner approves it.\n\nBooking Reference: ${bookingRef}\nVehicle: ${vehicle.name}\nPickup: ${data.pickup_date} (Pieterlen, Switzerland)\nReturn: ${data.return_date}\n\nAgreed Tariff: ${tariff.pricingMode === 'standard_package' ? `CHF ${baseRental} (includes ${tariff.includedKm} km)` : 'Individual quote required'}\nRefundable Security Deposit: CHF ${tariff.securityDeposit} (payable in cash at pickup)\nPayment Preference: ${data.payment_preference === 'online' ? 'Online Card/TWINT (upon owner approval)' : 'Cash at pickup'}\n\nOur team is reviewing your request and will respond shortly.\n\nEasy Cars Biel\nPieterlen, Switzerland`,
    });

    // Owner alert
    const contactEmailSetting = db.prepare('SELECT value FROM owner_settings WHERE key = ?').get('contact_email') as any;
    const ownerEmail = contactEmailSetting?.value || 'info@easycarsbiel.ch';
    await sendNotificationEmail({
      bookingId,
      recipient: ownerEmail,
      subject: `New Rental Inquiry — ${vehicle.name} (${bookingRef})`,
      type: 'request_received',
      bodyText: `New rental request submitted for ${vehicle.name}.\n\nReference: ${bookingRef}\nCustomer: ${data.customer_name} (${data.customer_phone}, ${data.customer_email})\nDates: ${data.pickup_date} to ${data.return_date} (${tariff.totalDays} days / ${tariff.totalHours}h)\nDelivery Requested: ${data.delivery_requested ? 'Yes' : 'No'}\nChauffeur Requested: ${data.chauffeur_requested ? 'Yes' : 'No'}\n\nPlease log in to the owner dashboard to approve, decline, or issue a customized quote.`,
    });

    return res.status(201).json({
      success: true,
      notice: 'Your rental request has been received. Your booking is not confirmed until the owner approves it.',
      booking: {
        id: bookingId,
        booking_ref: bookingRef,
        vehicle_name: vehicle.name,
        pickup_date: data.pickup_date,
        return_date: data.return_date,
        status: 'request_received',
        payment_status: 'unpaid',
        pricing_mode: tariff.pricingMode,
        base_rental_amount: baseRental,
        included_mileage: tariff.includedKm,
        security_deposit: tariff.securityDeposit,
        total_amount: totalAmount,
        total_price: totalAmount,
        currency: 'CHF',
      },
    });
  } catch (err: any) {
    console.error('Booking request error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error processing booking request' });
  }
});

// GET /api/bookings/:ref — Fetch booking details
bookingRoutes.get('/:ref', (req, res) => {
  const ref = req.params.ref;
  const booking = db.prepare(`
    SELECT b.*, v.name as vehicle_name, v.brand as vehicle_brand, v.model as vehicle_model,
           v.slug as vehicle_slug, v.images as vehicle_images, v.engine as vehicle_engine
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id = v.id
    WHERE b.booking_ref = ?
  `).get(ref) as any;

  if (!booking) {
    return res.status(404).json({ error: 'Booking reservation not found' });
  }

  // Parse extras
  let parsedExtras: string[] = [];
  try {
    parsedExtras = JSON.parse(booking.extras || '[]');
  } catch (e) {}

  // Parse images
  let images: string[] = [];
  try {
    images = JSON.parse(booking.vehicle_images || '[]');
  } catch (e) {}

  // Fetch inspection if available
  const inspection = db.prepare('SELECT * FROM inspections WHERE booking_id = ?').get(booking.id) as any;

  // Fetch audit logs
  const auditLogs = db.prepare('SELECT * FROM status_audit_logs WHERE booking_id = ? ORDER BY created_at ASC').all(booking.id);

  return res.json({
    booking: {
      ...booking,
      extras: parsedExtras,
      vehicle_images: images,
    },
    inspection: inspection || null,
    auditLogs: auditLogs || [],
  });
});

// POST /api/bookings/:ref/accept-quote — Customer accepts owner quote
bookingRoutes.post('/:ref/accept-quote', async (req, res) => {
  const ref = req.params.ref;
  const booking = db.prepare('SELECT * FROM bookings WHERE booking_ref = ?').get(ref) as any;

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  if (booking.status !== 'awaiting_customer_acceptance') {
    return res.status(400).json({ error: `Cannot accept quote in current status (${booking.status})` });
  }

  // Check if quote expired
  if (booking.quote_expires_at && new Date(booking.quote_expires_at).getTime() < Date.now()) {
    return res.status(400).json({ error: 'This quote has expired. Please request a quote extension.' });
  }

  const nowIso = new Date().toISOString();
  const nextStatus = booking.payment_preference === 'online' ? 'awaiting_payment' : 'confirmed';
  const paymentStatus = booking.payment_preference === 'online' ? 'payment_pending' : 'cash_due';

  db.prepare(`
    UPDATE bookings
    SET status = ?, payment_status = ?, quote_accepted_at = ?, updated_at = ?
    WHERE id = ?
  `).run(nextStatus, paymentStatus, nowIso, nowIso, booking.id);

  db.prepare(`
    INSERT INTO status_audit_logs (id, booking_id, previous_status, new_status, actor, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    uuidv4(),
    booking.id,
    'awaiting_customer_acceptance',
    nextStatus,
    'customer',
    `Customer accepted quote. Total payable: CHF ${booking.total_amount}.`
  );

  // Send email
  await sendNotificationEmail({
    bookingId: booking.id,
    recipient: booking.customer_email,
    subject: `Quote Accepted — Reservation ${booking.booking_ref}`,
    type: 'quote_accepted',
    bodyText: `Thank you for accepting the quote for reservation ${booking.booking_ref}.\n\nTotal Payable: CHF ${booking.total_amount}\nRefundable Deposit: CHF ${booking.security_deposit} (cash at pickup)\n\n${nextStatus === 'awaiting_payment' ? 'Please complete your online payment using the link provided in your portal.' : 'Your booking is now confirmed! Cash payment is due at vehicle handover.'}\n\nEasy Cars Biel`,
  });

  const updatedBooking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking.id) as any;
  return res.json({
    success: true,
    status: nextStatus,
    payment_status: paymentStatus,
    booking: {
      ...updatedBooking,
      total_price: updatedBooking.total_amount,
    },
    message: nextStatus === 'awaiting_payment'
      ? 'Quote accepted. Please proceed with online payment.'
      : 'Quote accepted. Your booking is confirmed with cash due at pickup.',
  });
});

// POST /api/bookings/:ref/simulate-payment — Online payment completion
bookingRoutes.post('/:ref/simulate-payment', async (req, res) => {
  const ref = req.params.ref;
  const booking = db.prepare('SELECT * FROM bookings WHERE booking_ref = ?').get(ref) as any;

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  if (booking.status !== 'confirmed' && booking.status !== 'awaiting_payment') {
    return res.status(400).json({ error: 'Payment cannot be processed before owner approval or quote acceptance' });
  }

  const nowIso = new Date().toISOString();
  const paymentId = uuidv4();
  const idempotencyKey = `PAY-${booking.booking_ref}-${Date.now()}`;

  // Record payment in payments table
  db.prepare(`
    INSERT INTO payments (id, booking_id, amount, currency, payment_method, provider, provider_transaction_id, status, idempotency_key)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    paymentId,
    booking.id,
    booking.total_amount,
    'CHF',
    'card',
    'simulated_secure_hosted',
    `TX-${Date.now()}`,
    'captured',
    idempotencyKey
  );

  // Update booking
  db.prepare(`
    UPDATE bookings
    SET status = 'confirmed', payment_status = 'paid', updated_at = ?
    WHERE id = ?
  `).run(nowIso, booking.id);

  // Audit log
  db.prepare(`
    INSERT INTO status_audit_logs (id, booking_id, previous_status, new_status, actor, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    uuidv4(),
    booking.id,
    booking.status,
    'confirmed',
    'payment_provider',
    `Online payment of CHF ${booking.total_amount} verified and captured.`
  );

  // Confirmation email
  await sendNotificationEmail({
    bookingId: booking.id,
    recipient: booking.customer_email,
    subject: `Booking Confirmed & Payment Received — ${booking.booking_ref}`,
    type: 'payment_confirmed',
    bodyText: `Dear ${booking.customer_name},\n\nYour online payment of CHF ${booking.total_amount} has been successfully verified. Your reservation is now officially confirmed!\n\nBooking Reference: ${booking.booking_ref}\nPickup Time: ${booking.pickup_date}\nPickup Location: Pieterlen Station Hub (Hauptstrasse 12, 2542 Pieterlen, Switzerland)\n\nImportant Reminder:\n- The refundable security deposit of CHF ${booking.security_deposit} is payable in cash at pickup.\n- Please bring your valid driving licence and official ID.\n- Fuel is excluded; return vehicle with full fuel tank.\n\nWe look forward to handing over your vehicle!\nEasy Cars Biel`,
  });

  return res.json({
    success: true,
    status: 'confirmed',
    payment_status: 'paid',
    message: 'Online payment successfully captured. Confirmation voucher issued.',
  });
});
