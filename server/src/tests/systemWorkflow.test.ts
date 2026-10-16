import assert from 'node:assert';
import { calculateRentalTariff } from '../utils/pricing.js';

const API_BASE = 'http://localhost:3001/api';

function tariffForDays(vehicle: string, days: number) {
  const start = new Date('2026-06-01T10:00:00Z');
  const end = new Date(start.getTime() + days * 24 * 3600 * 1000);
  return calculateRentalTariff(vehicle, start.toISOString(), end.toISOString());
}

async function runTests() {
  console.log('\n======================================================');
  console.log('EASY CARS BIEL — COMPREHENSIVE AUTOMATION TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    total++;
    try {
      const res = fn();
      if (res instanceof Promise) {
        return res
          .then(() => {
            console.log(`  ✓ PASS: ${name}`);
            passed++;
          })
          .catch((err) => {
            console.error(`  ✗ FAIL: ${name}`);
            console.error('    Error:', err.message);
          });
      } else {
        console.log(`  ✓ PASS: ${name}`);
        passed++;
      }
    } catch (err: any) {
      console.error(`  ✗ FAIL: ${name}`);
      console.error('    Error:', err.message);
    }
  }

  // ==========================================
  // SECTION 1: PRICING TESTS
  // ==========================================
  console.log('--- 1. Vehicle Catalogue & Published Pricing Rules ---');

  // Audi A3 Packages
  test('A3 1 day / 24 hours: CHF 65, 150 km, dep CHF 300, extra CHF 0.35/km', () => {
    const res = tariffForDays('audi-a3-sportback', 1);
    assert.strictEqual(res.isSupportedDuration, true);
    assert.strictEqual(res.price, 65);
    assert.strictEqual(res.includedKm, 150);
    assert.strictEqual(res.extraKmRate, 0.35);
    assert.strictEqual(res.securityDeposit, 300);
  });

  test('A3 3 days / 72 hours: CHF 180, 450 km', () => {
    const res = tariffForDays('audi-a3-sportback', 3);
    assert.strictEqual(res.isSupportedDuration, true);
    assert.strictEqual(res.price, 180);
    assert.strictEqual(res.includedKm, 450);
  });

  test('A3 7 days: CHF 350, 1,000 km', () => {
    const res = tariffForDays('audi-a3-sportback', 7);
    assert.strictEqual(res.isSupportedDuration, true);
    assert.strictEqual(res.price, 350);
    assert.strictEqual(res.includedKm, 1000);
  });

  test('A3 14 days: CHF 590, 1,500 km', () => {
    const res = tariffForDays('audi-a3-sportback', 14);
    assert.strictEqual(res.isSupportedDuration, true);
    assert.strictEqual(res.price, 590);
    assert.strictEqual(res.includedKm, 1500);
  });

  test('A3 30 days: CHF 950, 2,000 km', () => {
    const res = tariffForDays('audi-a3-sportback', 30);
    assert.strictEqual(res.isSupportedDuration, true);
    assert.strictEqual(res.price, 950);
    assert.strictEqual(res.includedKm, 2000);
  });

  // Audi A5 Packages
  test('A5 1 day / 24 hours: CHF 110, 200 km, dep CHF 500, extra CHF 0.50/km', () => {
    const res = tariffForDays('audi-a5-sportback', 1);
    assert.strictEqual(res.isSupportedDuration, true);
    assert.strictEqual(res.price, 110);
    assert.strictEqual(res.includedKm, 200);
    assert.strictEqual(res.extraKmRate, 0.50);
    assert.strictEqual(res.securityDeposit, 500);
  });

  test('A5 3 days / 72 hours: CHF 300, 600 km', () => {
    const res = tariffForDays('audi-a5-sportback', 3);
    assert.strictEqual(res.isSupportedDuration, true);
    assert.strictEqual(res.price, 300);
    assert.strictEqual(res.includedKm, 600);
  });

  test('A5 7 days: CHF 690, 1,200 km', () => {
    const res = tariffForDays('audi-a5-sportback', 7);
    assert.strictEqual(res.isSupportedDuration, true);
    assert.strictEqual(res.price, 690);
    assert.strictEqual(res.includedKm, 1200);
  });

  test('A5 14 days: CHF 1,190, 1,800 km', () => {
    const res = tariffForDays('audi-a5-sportback', 14);
    assert.strictEqual(res.isSupportedDuration, true);
    assert.strictEqual(res.price, 1190);
    assert.strictEqual(res.includedKm, 1800);
  });

  test('A5 30 days: CHF 1,790, 2,500 km', () => {
    const res = tariffForDays('audi-a5-sportback', 30);
    assert.strictEqual(res.isSupportedDuration, true);
    assert.strictEqual(res.price, 1790);
    assert.strictEqual(res.includedKm, 2500);
  });

  // Unsupported Durations
  test('Unsupported durations (2, 5, 10, >30 days) return "individual_quote"', () => {
    for (const d of [2, 5, 10, 45]) {
      const res = tariffForDays('audi-a5-sportback', d);
      assert.strictEqual(res.isSupportedDuration, false, `Duration ${d} should not be a standard package`);
      assert.strictEqual(res.pricingMode, 'individual_quote');
      assert.strictEqual(res.price, null);
    }
  });

  // ==========================================
  // SECTION 2: LIVE API & WORKFLOW TESTS
  // ==========================================
  console.log('\n--- 2. End-to-End API Booking & Owner Workflows ---');

  let ownerToken = '';
  let vehicleA5Id = '';
  let vehicleA3Id = '';

  await test('POST /api/auth/login authenticates owner', async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@easycarsbiel.ch', password: 'Password123!' }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.token, 'Should return JWT token');
    ownerToken = data.token;
  });

  await test('GET /api/vehicles returns seeded Audi fleet', async () => {
    const res = await fetch(`${API_BASE}/vehicles`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.vehicles.length >= 2, 'Should return at least 2 vehicles');
    const a5 = data.vehicles.find((v: any) => v.slug.includes('a5'));
    const a3 = data.vehicles.find((v: any) => v.slug.includes('a3'));
    assert.ok(a5, 'Audi A5 exists');
    assert.ok(a3, 'Audi A3 exists');
    vehicleA5Id = a5.id;
    vehicleA3Id = a3.id;
  });

  // Test standard 1-day inquiry submission
  // Test standard 1-day inquiry submission
  let createdRef = '';
  const offset1 = 100 + Math.floor(Math.random() * 500);
  const start1 = new Date(Date.now() + 86400000 * offset1);
  const end1 = new Date(start1.getTime() + 86400000);

  await test('POST /api/bookings creates unconfirmed inquiry', async () => {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicle_id: vehicleA5Id,
        pickup_date: start1.toISOString(),
        return_date: end1.toISOString(),
        customer_name: 'Max Frisch',
        customer_email: 'max.frisch@swisscom.ch',
        customer_phone: '+41 79 555 44 33',
        payment_preference: 'cash',
        terms_accepted: true,
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data.booking);
    assert.strictEqual(data.booking.status, 'request_received');
    assert.strictEqual(data.booking.total_price, 110);
    assert.strictEqual(data.booking.security_deposit, 500);
    assert.ok(data.notice.includes('not confirmed until the owner approves it'));
    createdRef = data.booking.booking_ref;
  });

  await test('Unapproved request does NOT block availability', async () => {
    const checkRes = await fetch(`${API_BASE}/quote/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicle_id: vehicleA5Id,
        pickup_date: start1.toISOString(),
        return_date: end1.toISOString(),
      }),
    });
    assert.strictEqual(checkRes.status, 200);
    const data = await checkRes.json();
    assert.strictEqual(data.available, true, 'Vehicle should still be available before approval');
  });

  await test('Owner approves request -> Booking confirms and blocks calendar', async () => {
    const res = await fetch(`${API_BASE}/owner/bookings/${createdRef}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.booking.status, 'confirmed');

    // Recheck availability for that period: should now be FALSE
    const checkRes = await fetch(`${API_BASE}/quote/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicle_id: vehicleA5Id,
        pickup_date: start1.toISOString(),
        return_date: end1.toISOString(),
      }),
    });
    const checkData = await checkRes.json();
    assert.strictEqual(checkData.available, false, 'Vehicle should now be blocked by confirmed booking');
  });

  await test('Double booking prevention: overlapping request is rejected on submission', async () => {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicle_id: vehicleA5Id,
        pickup_date: start1.toISOString(),
        return_date: end1.toISOString(),
        customer_name: 'Concurrent Booker',
        customer_email: 'double@booker.ch',
        customer_phone: '+41 79 111 22 33',
        payment_preference: 'cash',
        terms_accepted: true,
      }),
    });
    assert.strictEqual(res.status, 409, 'Must reject overlapping reservation with 409 Conflict');
  });

  // Individual Quote workflow for non-standard duration
  let customQuoteRef = '';
  const offset2 = offset1 + 20;
  const start2 = new Date(Date.now() + 86400000 * offset2);
  const end2 = new Date(start2.getTime() + 86400000 * 5); // 5 days (non-standard)

  await test('Non-standard duration (5 days) triggers quote workflow', async () => {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicle_id: vehicleA3Id,
        pickup_date: start2.toISOString(),
        return_date: end2.toISOString(),
        customer_name: 'Elena Rossi',
        customer_email: 'elena.rossi@ticino.ch',
        customer_phone: '+41 79 888 77 66',
        payment_preference: 'cash',
        terms_accepted: true,
        delivery_requested: true,
        delivery_address: 'Seestrasse 10, Biel',
      }),
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.booking.pricing_mode, 'individual_quote');
    customQuoteRef = data.booking.booking_ref;
  });

  await test('Owner issues individual quote with custom rate and delivery fee', async () => {
    const res = await fetch(`${API_BASE}/owner/bookings/${customQuoteRef}/issue-quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        base_rental_amount: 280,
        included_mileage: 700,
        delivery_fee: 40,
        security_deposit: 300,
        notes: 'Custom 5-day package + delivery',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.booking.status, 'awaiting_customer_acceptance');
    assert.strictEqual(data.booking.total_price, 320); // 280 + 40
  });

  await test('Customer accepts quote -> Booking confirms', async () => {
    const res = await fetch(`${API_BASE}/bookings/${customQuoteRef}/accept-quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.booking.status, 'confirmed');
  });

  await test('Digital Inspection & Extra KM Calculation', async () => {
    const res = await fetch(`${API_BASE}/owner/inspections/${customQuoteRef}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        pickup_odometer: 125000,
        pickup_fuel_level: '100%',
        pickup_cleanliness: 'clean',
        return_odometer: 125850, // 850 km driven; included is 700 km -> 150 extra km!
        return_fuel_level: '100%',
        return_cleanliness: 'clean',
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.inspection.actual_distance_km, 850);
    assert.strictEqual(data.inspection.additional_km, 150);
    // 150 km * CHF 0.35 = CHF 52.50
    assert.strictEqual(data.inspection.additional_km_charge, 52.5);
  });

  await test('Owner records deposit collection and full repayment', async () => {
    // Collect
    const colRes = await fetch(`${API_BASE}/owner/bookings/${customQuoteRef}/record-deposit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        action: 'collect',
        receipt_ref: 'CH-DEP-2026-991',
        notes: 'CHF 300 cash collected at Pieterlen Station',
      }),
    });
    assert.strictEqual(colRes.status, 200);
    const colData = await colRes.json();
    assert.strictEqual(colData.booking.deposit_status, 'collected');

    // Repay
    const repRes = await fetch(`${API_BASE}/owner/bookings/${customQuoteRef}/record-deposit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        action: 'repay',
        notes: 'Deposit repaid in cash after inspection',
      }),
    });
    assert.strictEqual(repRes.status, 200);
    const repData = await repRes.json();
    assert.strictEqual(repData.booking.deposit_status, 'repaid');
  });

  console.log('\n======================================================');
  console.log(`TEST SUMMARY: ${passed} / ${total} TESTS PASSED`);
  console.log('======================================================\n');

  if (passed === total) {
    console.log('ALL CRITICAL REQUIREMENTS VERIFIED SUCCESSFULLY!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
