import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import { requireOwner } from '../middleware/auth.js';
import { checkVehicleAvailability } from '../services/availabilityService.js';
import { sendNotificationEmail } from '../services/emailService.js';

export const ownerRoutes = Router();

// Protect all owner routes
ownerRoutes.use(requireOwner);

// 1. GET /api/owner/overview
ownerRoutes.get('/overview', (req, res) => {
  const getCount = (query: string, ...params: any[]) => {
    const row = db.prepare(query).get(...params) as any;
    return row ? Number(row.count) : 0;
  };

  const overview = {
    new_requests: getCount("SELECT COUNT(*) as count FROM bookings WHERE status = 'request_received'"),
    under_review: getCount("SELECT COUNT(*) as count FROM bookings WHERE status = 'under_review'"),
    awaiting_acceptance: getCount("SELECT COUNT(*) as count FROM bookings WHERE status = 'awaiting_customer_acceptance'"),
    upcoming_confirmed: getCount("SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'"),
    active_rentals: getCount("SELECT COUNT(*) as count FROM bookings WHERE status = 'rental_active'"),
    pending_online_payments: getCount("SELECT COUNT(*) as count FROM bookings WHERE payment_status = 'payment_pending'"),
    cash_due: getCount("SELECT COUNT(*) as count FROM bookings WHERE payment_status = 'cash_due'"),
    deposits_pending_repayment: getCount("SELECT COUNT(*) as count FROM bookings WHERE deposit_status IN ('collected', 'repayment_pending')"),
    completed_rentals: getCount("SELECT COUNT(*) as count FROM bookings WHERE status = 'completed'"),
  };

  return res.json({ overview });
});

// 2. GET /api/owner/bookings
ownerRoutes.get('/bookings', (req, res) => {
  const { status, vehicle_id, search } = req.query;

  let query = `
    SELECT b.*, v.name as vehicle_name, v.brand as vehicle_brand, v.model as vehicle_model, v.slug as vehicle_slug
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id = v.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (status && status !== 'all') {
    query += ' AND b.status = ?';
    params.push(status);
  }
  if (vehicle_id && vehicle_id !== 'all') {
    query += ' AND (b.vehicle_id = ? OR v.slug = ?)';
    params.push(vehicle_id, vehicle_id);
  }
  if (search) {
    query += ' AND (b.booking_ref LIKE ? OR b.customer_name LIKE ? OR b.customer_email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY b.created_at DESC';

  const bookings = db.prepare(query).all(...params) as any[];

  return res.json({ bookings });
});

// 3. POST /api/owner/bookings/:ref/approve
ownerRoutes.post('/bookings/:ref/approve', async (req, res) => {
  const ref = req.params.ref;
  const booking = db.prepare('SELECT * FROM bookings WHERE booking_ref = ?').get(ref) as any;

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  if (booking.status !== 'request_received' && booking.status !== 'under_review') {
    return res.status(400).json({ error: `Cannot approve booking in current status (${booking.status})` });
  }

  // Atomic recheck of availability on server
  const avail = checkVehicleAvailability(booking.vehicle_id, booking.pickup_date, booking.return_date, booking.id);
  if (!avail.isAvailable) {
    return res.status(409).json({
      error: 'Cannot approve request: vehicle already has an overlapping confirmed booking or block.',
      reason: avail.conflictReason,
    });
  }

  const nowIso = new Date().toISOString();
  const nextStatus = booking.payment_preference === 'online' ? 'awaiting_payment' : 'confirmed';
  const paymentStatus = booking.payment_preference === 'online' ? 'payment_pending' : 'cash_due';

  db.prepare(`
    UPDATE bookings
    SET status = ?, payment_status = ?, updated_at = ?
    WHERE id = ?
  `).run(nextStatus, paymentStatus, nowIso, booking.id);

  // Audit log
  db.prepare(`
    INSERT INTO status_audit_logs (id, booking_id, previous_status, new_status, actor, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    uuidv4(),
    booking.id,
    booking.status,
    nextStatus,
    req.user?.name || 'Owner',
    `Booking approved by owner. Proceeding to ${nextStatus}.`
  );

  // Email notification
  await sendNotificationEmail({
    bookingId: booking.id,
    recipient: booking.customer_email,
    subject: `Rental Request Approved — ${booking.booking_ref}`,
    type: 'request_approved',
    bodyText: `Dear ${booking.customer_name},\n\nGreat news! Your rental request for reservation ${booking.booking_ref} has been approved by the vehicle owner.\n\nRental Period: ${booking.pickup_date} to ${booking.return_date}\nTotal Amount: CHF ${booking.total_amount}\nSecurity Deposit: CHF ${booking.security_deposit} (payable in cash at pickup)\n\n${nextStatus === 'awaiting_payment' ? 'Please complete your online payment using your personal booking portal.' : 'Your reservation is confirmed! Cash payment for the rental and deposit will be collected at vehicle handover.'}\n\nEasy Cars Biel\nPieterlen, Switzerland`,
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
  });
});

// 4. POST /api/owner/bookings/:ref/decline
ownerRoutes.post('/bookings/:ref/decline', async (req, res) => {
  const ref = req.params.ref;
  const { reason } = req.body;

  const booking = db.prepare('SELECT * FROM bookings WHERE booking_ref = ?').get(ref) as any;
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const nowIso = new Date().toISOString();

  db.prepare(`
    UPDATE bookings
    SET status = 'declined', owner_notes = ?, updated_at = ?
    WHERE id = ?
  `).run(reason || 'Request declined by owner due to scheduling constraints', nowIso, booking.id);

  // Audit log
  db.prepare(`
    INSERT INTO status_audit_logs (id, booking_id, previous_status, new_status, actor, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    uuidv4(),
    booking.id,
    booking.status,
    'declined',
    req.user?.name || 'Owner',
    `Request declined: ${reason || 'No specific reason provided'}`
  );

  // Email notification
  await sendNotificationEmail({
    bookingId: booking.id,
    recipient: booking.customer_email,
    subject: `Rental Request Update — ${booking.booking_ref}`,
    type: 'request_declined',
    bodyText: `Dear ${booking.customer_name},\n\nWe regret to inform you that your rental request for reservation ${booking.booking_ref} could not be accepted for the requested dates.\n\nReason: ${reason || 'The vehicle is not available due to scheduling or maintenance reasons.'}\n\nPlease check our vehicle catalogue for alternative dates or contact us directly.\n\nEasy Cars Biel`,
  });

  return res.json({ success: true, status: 'declined' });
});

// 5. POST /api/owner/bookings/:ref/issue-quote
ownerRoutes.post('/bookings/:ref/issue-quote', async (req, res) => {
  const ref = req.params.ref;
  const quoteSchema = z.object({
    base_rental_amount: z.number().min(0),
    included_mileage: z.number().min(0),
    delivery_fee: z.number().min(0).optional(),
    chauffeur_fee: z.number().min(0).optional(),
    security_deposit: z.number().min(0).optional(),
    notes: z.string().optional(),
    expiry_hours: z.number().min(1).max(168).default(48),
  });

  const parsed = quoteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid quote parameters', details: parsed.error.format() });
  }

  const booking = db.prepare('SELECT * FROM bookings WHERE booking_ref = ?').get(ref) as any;
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const data = parsed.data;
  const deliveryFee = data.delivery_fee || 0;
  const chauffeurFee = data.chauffeur_fee || 0;
  const deposit = data.security_deposit !== undefined ? data.security_deposit : booking.security_deposit;
  const totalAmount = data.base_rental_amount + deliveryFee + chauffeurFee;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + data.expiry_hours * 60 * 60 * 1000).toISOString();
  const nowIso = now.toISOString();

  db.prepare(`
    UPDATE bookings
    SET base_rental_amount = ?,
        included_mileage = ?,
        delivery_fee = ?,
        chauffeur_fee = ?,
        security_deposit = ?,
        total_amount = ?,
        owner_notes = ?,
        pricing_mode = 'individual_quote',
        status = 'awaiting_customer_acceptance',
        quote_issued_at = ?,
        quote_expires_at = ?,
        updated_at = ?
    WHERE id = ?
  `).run(
    data.base_rental_amount,
    data.included_mileage,
    deliveryFee,
    chauffeurFee,
    deposit,
    totalAmount,
    data.notes || null,
    nowIso,
    expiresAt,
    nowIso,
    booking.id
  );

  // Audit log
  db.prepare(`
    INSERT INTO status_audit_logs (id, booking_id, previous_status, new_status, actor, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    uuidv4(),
    booking.id,
    booking.status,
    'awaiting_customer_acceptance',
    req.user?.name || 'Owner',
    `Individual quote issued: Rental CHF ${data.base_rental_amount}, Delivery CHF ${deliveryFee}, Chauffeur CHF ${chauffeurFee}. Total CHF ${totalAmount}. Expiry: ${expiresAt}.`
  );

  // Email quote to customer
  await sendNotificationEmail({
    bookingId: booking.id,
    recipient: booking.customer_email,
    subject: `Custom Rental Quote Issued — ${booking.booking_ref}`,
    type: 'quote_issued',
    bodyText: `Dear ${booking.customer_name},\n\nAn individual quote has been prepared for your rental request (${booking.booking_ref}).\n\nItemized Quote:\n- Vehicle Rental: CHF ${data.base_rental_amount.toFixed(2)} (includes ${data.included_mileage} km)\n${deliveryFee > 0 ? `- Delivery Service Fee: CHF ${deliveryFee.toFixed(2)}\n` : ''}${chauffeurFee > 0 ? `- Chauffeur Service Fee: CHF ${chauffeurFee.toFixed(2)}\n` : ''}- Refundable Security Deposit: CHF ${deposit.toFixed(2)} (cash at pickup)\n----------------------------------------\nTotal Payable before Handover: CHF ${totalAmount.toFixed(2)}\n\nThis quote expires on: ${new Date(expiresAt).toLocaleString('de-CH')}.\n\nPlease open your reservation link to review and accept the quote.\n\nEasy Cars Biel`,
  });

  const updatedBooking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking.id) as any;
  return res.json({
    success: true,
    status: 'awaiting_customer_acceptance',
    total_amount: totalAmount,
    total_price: totalAmount,
    quote_expires_at: expiresAt,
    booking: {
      ...updatedBooking,
      total_price: totalAmount,
    },
  });
});

// 6. POST /api/owner/bookings/:ref/record-cash-payment
ownerRoutes.post('/bookings/:ref/record-cash-payment', (req, res) => {
  const ref = req.params.ref;
  const booking = db.prepare('SELECT * FROM bookings WHERE booking_ref = ?').get(ref) as any;

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const nowIso = new Date().toISOString();

  db.prepare(`
    UPDATE bookings
    SET payment_status = 'paid', status = 'confirmed', updated_at = ?
    WHERE id = ?
  `).run(nowIso, booking.id);

  db.prepare(`
    INSERT INTO payments (id, booking_id, amount, currency, payment_method, provider, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    uuidv4(),
    booking.id,
    booking.total_amount,
    'CHF',
    'cash',
    'cash_on_site_receipt',
    'captured'
  );

  db.prepare(`
    INSERT INTO status_audit_logs (id, booking_id, previous_status, new_status, actor, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    uuidv4(),
    booking.id,
    booking.status,
    'confirmed',
    req.user?.name || 'Owner',
    `Cash payment of CHF ${booking.total_amount} collected at pickup.`
  );

  return res.json({ success: true, payment_status: 'paid', status: 'confirmed' });
});

// 7. POST /api/owner/bookings/:ref/record-deposit
ownerRoutes.post('/bookings/:ref/record-deposit', (req, res) => {
  const ref = req.params.ref;
  const { action, receipt_ref, notes, deduction_amount } = req.body;

  const booking = db.prepare('SELECT * FROM bookings WHERE booking_ref = ?').get(ref) as any;
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const nowIso = new Date().toISOString();
  let newDepositStatus = booking.deposit_status;

  if (action === 'collect') {
    newDepositStatus = 'collected';
    db.prepare(`
      UPDATE bookings
      SET deposit_status = 'collected', deposit_receipt_ref = ?, updated_at = ?
      WHERE id = ?
    `).run(receipt_ref || `DEP-${Date.now()}`, nowIso, booking.id);
  } else if (action === 'repay') {
    newDepositStatus = 'repaid';
    db.prepare(`
      UPDATE bookings
      SET deposit_status = 'repaid', deposit_repayment_notes = ?, updated_at = ?
      WHERE id = ?
    `).run(notes || 'Deposit fully refunded in cash/bank transfer', nowIso, booking.id);
  } else if (action === 'deduct') {
    newDepositStatus = 'partially_deducted';
    db.prepare(`
      UPDATE bookings
      SET deposit_status = 'partially_deducted', deposit_repayment_notes = ?, updated_at = ?
      WHERE id = ?
    `).run(`Deduction CHF ${deduction_amount}: ${notes}`, nowIso, booking.id);
  }

  db.prepare(`
    INSERT INTO status_audit_logs (id, booking_id, previous_status, new_status, actor, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    uuidv4(),
    booking.id,
    booking.status,
    booking.status,
    req.user?.name || 'Owner',
    `Deposit status updated to ${newDepositStatus}. Receipt/Notes: ${receipt_ref || notes || ''}`
  );

  const updatedBooking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking.id) as any;
  return res.json({ success: true, deposit_status: newDepositStatus, booking: updatedBooking });
});

// 8. GET & POST Inspections
ownerRoutes.get('/inspections/:bookingRef', (req, res) => {
  const booking = db.prepare('SELECT id FROM bookings WHERE booking_ref = ?').get(req.params.bookingRef) as any;
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const inspection = db.prepare('SELECT * FROM inspections WHERE booking_id = ?').get(booking.id) as any;
  return res.json({ inspection: inspection || null });
});

ownerRoutes.post('/inspections/:bookingRef', (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE booking_ref = ?').get(req.params.bookingRef) as any;
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const {
    stage, // 'pickup' | 'return'
    odometer,
    fuel_level,
    cleanliness,
    damage_notes,
    photos,
    keys_handled,
    pickup_odometer,
    return_odometer,
    pickup_fuel_level,
    return_fuel_level,
    pickup_cleanliness,
    return_cleanliness,
    pickup_damage_notes,
    return_damage_notes,
  } = req.body;

  let existing = db.prepare('SELECT * FROM inspections WHERE booking_id = ?').get(booking.id) as any;
  const nowIso = new Date().toISOString();

  if (!existing) {
    const inspectionId = uuidv4();
    db.prepare(`
      INSERT INTO inspections (id, booking_id, vehicle_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(inspectionId, booking.id, booking.vehicle_id, nowIso, nowIso);
    existing = db.prepare('SELECT * FROM inspections WHERE id = ?').get(inspectionId);
  }

  // Handle combined or specific payload
  if (pickup_odometer !== undefined && return_odometer !== undefined) {
    const pickupOdo = Number(pickup_odometer) || 0;
    const returnOdo = Number(return_odometer) || pickupOdo;
    const actualKm = Math.max(0, returnOdo - pickupOdo);
    const extraKm = Math.max(0, actualKm - (booking.included_mileage || 0));
    const extraKmRate = booking.extra_km_rate || (booking.vehicle_slug?.includes('a5') ? 0.5 : 0.35);
    const extraKmCharge = Math.round(extraKm * extraKmRate * 100) / 100;

    const fuelSurcharge = (return_fuel_level && return_fuel_level !== '100%' && return_fuel_level !== 'full') ? 50 + 60 : 0;
    const cleaningSurcharge = (return_cleanliness && return_cleanliness === 'dirty') ? 50 : 0;
    const totalDeductions = extraKmCharge + fuelSurcharge + cleaningSurcharge;
    const refundAmount = Math.max(0, (booking.security_deposit || 0) - totalDeductions);

    db.prepare(`
      UPDATE inspections
      SET pickup_odometer = ?,
          pickup_fuel_level = ?,
          pickup_cleanliness = ?,
          pickup_existing_damage = ?,
          pickup_owner_ack = 1,
          pickup_customer_ack = 1,
          pickup_recorded_at = COALESCE(pickup_recorded_at, ?),
          return_odometer = ?,
          return_fuel_level = ?,
          return_cleanliness = ?,
          return_new_damage = ?,
          return_owner_ack = 1,
          return_customer_ack = 1,
          return_recorded_at = ?,
          actual_distance_km = ?,
          additional_km = ?,
          additional_km_charge = ?,
          fuel_surcharge = ?,
          cleaning_surcharge = ?,
          deposit_deductions_total = ?,
          deposit_refund_amount = ?,
          updated_at = ?
      WHERE id = ?
    `).run(
      pickupOdo,
      pickup_fuel_level || '100%',
      pickup_cleanliness || 'clean',
      pickup_damage_notes || null,
      nowIso,
      returnOdo,
      return_fuel_level || '100%',
      return_cleanliness || 'clean',
      return_damage_notes || null,
      nowIso,
      actualKm,
      extraKm,
      extraKmCharge,
      fuelSurcharge,
      cleaningSurcharge,
      totalDeductions,
      refundAmount,
      nowIso,
      existing.id
    );

    db.prepare("UPDATE bookings SET status = 'completed', updated_at = ? WHERE id = ?").run(nowIso, booking.id);
  } else if (stage === 'pickup') {
    db.prepare(`
      UPDATE inspections
      SET pickup_odometer = ?,
          pickup_fuel_level = ?,
          pickup_cleanliness = ?,
          pickup_existing_damage = ?,
          pickup_photos = ?,
          pickup_keys_handed_over = ?,
          pickup_owner_ack = 1,
          pickup_customer_ack = 1,
          pickup_recorded_at = ?,
          updated_at = ?
      WHERE id = ?
    `).run(
      odometer || 0,
      fuel_level || 'full',
      cleanliness || 'clean',
      damage_notes || null,
      JSON.stringify(photos || []),
      keys_handled ? 1 : 0,
      nowIso,
      nowIso,
      existing.id
    );

    db.prepare("UPDATE bookings SET status = 'rental_active', updated_at = ? WHERE id = ?").run(nowIso, booking.id);
  } else if (stage === 'return') {
    const pickupOdo = existing.pickup_odometer || 0;
    const returnOdo = Number(odometer) || pickupOdo;
    const actualKm = Math.max(0, returnOdo - pickupOdo);
    const extraKm = Math.max(0, actualKm - (booking.included_mileage || 0));
    const extraKmRate = booking.extra_km_rate || (booking.vehicle_slug?.includes('a5') ? 0.5 : 0.35);
    const extraKmCharge = Math.round(extraKm * extraKmRate * 100) / 100;

    const fuelSurcharge = (fuel_level && fuel_level !== 'full' && fuel_level !== '100%') ? 50 + 60 : 0;
    const cleaningSurcharge = (cleanliness && cleanliness === 'dirty') ? 50 : 0;
    const totalDeductions = extraKmCharge + fuelSurcharge + cleaningSurcharge;
    const refundAmount = Math.max(0, (booking.security_deposit || 0) - totalDeductions);

    db.prepare(`
      UPDATE inspections
      SET return_odometer = ?,
          return_fuel_level = ?,
          return_cleanliness = ?,
          return_new_damage = ?,
          return_photos = ?,
          return_keys_returned = ?,
          return_owner_ack = 1,
          return_customer_ack = 1,
          return_recorded_at = ?,
          actual_distance_km = ?,
          additional_km = ?,
          additional_km_charge = ?,
          fuel_surcharge = ?,
          cleaning_surcharge = ?,
          deposit_deductions_total = ?,
          deposit_refund_amount = ?,
          updated_at = ?
      WHERE id = ?
    `).run(
      returnOdo,
      fuel_level || 'full',
      cleanliness || 'clean',
      damage_notes || null,
      JSON.stringify(photos || []),
      keys_handled ? 1 : 0,
      nowIso,
      actualKm,
      extraKm,
      extraKmCharge,
      fuelSurcharge,
      cleaningSurcharge,
      totalDeductions,
      refundAmount,
      nowIso,
      existing.id
    );

    db.prepare("UPDATE bookings SET status = 'completed', updated_at = ? WHERE id = ?").run(nowIso, booking.id);
  }

  const updatedInspection = db.prepare('SELECT * FROM inspections WHERE id = ?').get(existing.id);
  return res.json({ success: true, inspection: updatedInspection });
});

// 9. GET & POST Calendar Blocks
ownerRoutes.get('/calendar', (req, res) => {
  const confirmedBookings = db.prepare(`
    SELECT b.id, b.booking_ref, b.vehicle_id, b.pickup_date, b.return_date, b.customer_name, b.status,
           v.name as vehicle_name, v.slug as vehicle_slug
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id = v.id
    WHERE b.status IN ('confirmed', 'rental_active')
  `).all();

  const blocks = db.prepare(`
    SELECT blk.*, v.name as vehicle_name, v.slug as vehicle_slug
    FROM availability_blocks blk
    JOIN vehicles v ON blk.vehicle_id = v.id
  `).all();

  return res.json({ bookings: confirmedBookings, blocks });
});

ownerRoutes.post('/calendar/blocks', (req, res) => {
  const { vehicle_id, start_date, end_date, reason, notes } = req.body;
  if (!vehicle_id || !start_date || !end_date) {
    return res.status(400).json({ error: 'vehicle_id, start_date, and end_date are required' });
  }

  const blockId = uuidv4();
  db.prepare(`
    INSERT INTO availability_blocks (id, vehicle_id, start_date, end_date, reason, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(blockId, vehicle_id, start_date, end_date, reason || 'maintenance', notes || null);

  return res.status(201).json({ success: true, blockId });
});

ownerRoutes.delete('/calendar/blocks/:id', (req, res) => {
  db.prepare('DELETE FROM availability_blocks WHERE id = ?').run(req.params.id);
  return res.json({ success: true });
});

// 10. GET & PUT Owner Settings
ownerRoutes.get('/settings', (req, res) => {
  const rows = db.prepare('SELECT * FROM owner_settings').all() as Array<{ key: string; value: string; description: string }>;
  const settings: Record<string, string> = {};
  for (const r of rows) {
    settings[r.key] = r.value;
  }
  return res.json({ settings });
});

ownerRoutes.put('/settings', (req, res) => {
  const updates = req.body;
  const updateStmt = db.prepare(`
    INSERT INTO owner_settings (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
  `);

  for (const [key, val] of Object.entries(updates)) {
    updateStmt.run(key, String(val));
  }

  return res.json({ success: true });
});

// 11. GET Email delivery logs
ownerRoutes.get('/email-logs', (req, res) => {
  const logs = db.prepare('SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 50').all();
  return res.json({ logs });
});
