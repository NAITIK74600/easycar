import db from '../db.js';

export interface AvailabilityCheckResult {
  isAvailable: boolean;
  conflictReason?: string;
  conflictingBookingRef?: string;
}

export function checkVehicleAvailability(
  vehicleId: string,
  pickupDateStr: string,
  returnDateStr: string,
  excludeBookingId?: string
): AvailabilityCheckResult {
  const reqStart = new Date(pickupDateStr).getTime();
  const reqEnd = new Date(returnDateStr).getTime();

  if (isNaN(reqStart) || isNaN(reqEnd) || reqEnd <= reqStart) {
    return { isAvailable: false, conflictReason: 'Invalid rental date interval' };
  }

  // Fetch preparation buffer minutes from owner settings
  const bufferSetting = db.prepare('SELECT value FROM owner_settings WHERE key = ?').get('preparation_buffer_minutes') as any;
  const bufferMs = (bufferSetting ? parseInt(bufferSetting.value, 10) : 120) * 60 * 1000;

  // 1. Check against Confirmed & Active bookings
  const bookingsQuery = `
    SELECT id, booking_ref, pickup_date, return_date, status
    FROM bookings
    WHERE vehicle_id = ?
      AND status IN ('confirmed', 'rental_active')
      ${excludeBookingId ? 'AND id != ?' : ''}
  `;

  const existingBookings = (excludeBookingId
    ? db.prepare(bookingsQuery).all(vehicleId, excludeBookingId)
    : db.prepare(bookingsQuery).all(vehicleId)) as Array<{
    id: string;
    booking_ref: string;
    pickup_date: string;
    return_date: string;
    status: string;
  }>;

  for (const b of existingBookings) {
    const existingStart = new Date(b.pickup_date).getTime();
    const existingEnd = new Date(b.return_date).getTime();

    // With buffer applied: [existingStart - buffer, existingEnd + buffer]
    const bufferedStart = existingStart - bufferMs;
    const bufferedEnd = existingEnd + bufferMs;

    // Overlap condition: reqStart < bufferedEnd && reqEnd > bufferedStart
    if (reqStart < bufferedEnd && reqEnd > bufferedStart) {
      return {
        isAvailable: false,
        conflictReason: `Vehicle has a confirmed reservation (${b.booking_ref}) overlapping this period (including ${Math.round(bufferMs / 60000)} min preparation buffer).`,
        conflictingBookingRef: b.booking_ref,
      };
    }
  }

  // 2. Check against Owner Availability Blocks (maintenance, personal use, external)
  const blocks = db.prepare(`
    SELECT id, reason, start_date, end_date, notes
    FROM availability_blocks
    WHERE vehicle_id = ?
  `).all(vehicleId) as Array<{
    id: string;
    reason: string;
    start_date: string;
    end_date: string;
    notes: string;
  }>;

  for (const blk of blocks) {
    const blkStart = new Date(blk.start_date).getTime();
    const blkEnd = new Date(blk.end_date).getTime();

    if (reqStart < blkEnd && reqEnd > blkStart) {
      return {
        isAvailable: false,
        conflictReason: `Vehicle is blocked for ${blk.reason} (${blk.notes || 'Scheduled maintenance/personal use'}).`,
      };
    }
  }

  return { isAvailable: true };
}
