import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = process.env.DB_PATH || './data/drive-different.db';

// Ensure directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode & foreign keys
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

function addColumnIfNotExists(table: string, columnDef: string, columnName: string): void {
  try {
    const tableInfo = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
    const exists = tableInfo.some((col) => col.name === columnName);
    if (!exists) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${columnDef};`);
    }
  } catch (err) {
    // Column might already exist or table doesn't exist yet
  }
}

export function initializeDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'renter', -- renter, owner, admin
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      postal_code TEXT,
      country TEXT NOT NULL DEFAULT 'Switzerland',
      latitude REAL,
      longitude REAL,
      phone TEXT,
      email TEXT,
      hours TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      category TEXT NOT NULL,
      daily_rate REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'CHF',
      seats INTEGER NOT NULL,
      doors INTEGER NOT NULL DEFAULT 4,
      transmission TEXT NOT NULL DEFAULT 'automatic',
      fuel_type TEXT NOT NULL DEFAULT 'petrol',
      engine TEXT,
      power TEXT,
      color TEXT,
      description TEXT,
      features TEXT,
      specifications TEXT,
      images TEXT,
      interior_images TEXT,
      cinematic_manifest TEXT,
      inspection_data TEXT,
      location_id TEXT,
      security_deposit REAL NOT NULL DEFAULT 300,
      extra_km_rate REAL NOT NULL DEFAULT 0.35,
      is_available INTEGER NOT NULL DEFAULT 1,
      is_featured INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (location_id) REFERENCES locations(id)
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      booking_ref TEXT UNIQUE NOT NULL,
      vehicle_id TEXT NOT NULL,
      pickup_location_id TEXT,
      return_location_id TEXT,
      pickup_date TEXT NOT NULL,
      return_date TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_license TEXT,
      extras TEXT,
      daily_rate REAL NOT NULL,
      total_days INTEGER NOT NULL,
      total_hours REAL NOT NULL,
      pricing_mode TEXT NOT NULL DEFAULT 'standard_package', -- 'standard_package' | 'individual_quote'
      base_rental_amount REAL NOT NULL,
      included_mileage INTEGER NOT NULL,
      extra_km_rate REAL NOT NULL,
      security_deposit REAL NOT NULL,
      deposit_status TEXT NOT NULL DEFAULT 'not_collected', -- 'not_collected', 'collected', 'partially_deducted', 'repayment_pending', 'repaid', 'under_review'
      deposit_receipt_ref TEXT,
      deposit_repayment_notes TEXT,
      delivery_requested INTEGER NOT NULL DEFAULT 0,
      delivery_address TEXT,
      delivery_postcode TEXT,
      delivery_preferred_time TEXT,
      delivery_instructions TEXT,
      delivery_fee REAL NOT NULL DEFAULT 0,
      chauffeur_requested INTEGER NOT NULL DEFAULT 0,
      chauffeur_pickup_address TEXT,
      chauffeur_destination TEXT,
      chauffeur_service_type TEXT,
      chauffeur_passengers INTEGER,
      chauffeur_estimated_duration TEXT,
      chauffeur_fee REAL NOT NULL DEFAULT 0,
      out_of_country_travel INTEGER NOT NULL DEFAULT 0,
      additional_driver_requested INTEGER NOT NULL DEFAULT 0,
      customer_message TEXT,
      payment_preference TEXT NOT NULL DEFAULT 'online', -- 'online', 'cash_at_pickup'
      status TEXT NOT NULL DEFAULT 'request_received', -- 'request_received', 'under_review', 'awaiting_customer_acceptance', 'confirmed', 'declined', 'cancelled', 'rental_active', 'completed'
      payment_status TEXT NOT NULL DEFAULT 'unpaid', -- 'unpaid', 'payment_pending', 'paid', 'cash_due', 'refunded', 'partially_refunded'
      total_amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'CHF',
      terms_accepted INTEGER NOT NULL DEFAULT 0,
      terms_accepted_at TEXT,
      terms_version TEXT DEFAULT 'v1.0-CH-2026',
      owner_notes TEXT,
      quote_expires_at TEXT,
      quote_issued_at TEXT,
      quote_accepted_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
    );

    CREATE TABLE IF NOT EXISTS inspections (
      id TEXT PRIMARY KEY,
      booking_id TEXT UNIQUE NOT NULL,
      vehicle_id TEXT NOT NULL,
      pickup_odometer REAL,
      pickup_fuel_level TEXT DEFAULT 'full',
      pickup_cleanliness TEXT DEFAULT 'clean',
      pickup_existing_damage TEXT,
      pickup_photos TEXT, -- JSON array
      pickup_keys_handed_over INTEGER DEFAULT 0,
      pickup_customer_ack INTEGER DEFAULT 0,
      pickup_owner_ack INTEGER DEFAULT 0,
      pickup_recorded_at TEXT,
      return_odometer REAL,
      return_fuel_level TEXT DEFAULT 'full',
      return_cleanliness TEXT DEFAULT 'clean',
      return_new_damage TEXT,
      return_photos TEXT, -- JSON array
      return_keys_returned INTEGER DEFAULT 0,
      return_customer_ack INTEGER DEFAULT 0,
      return_owner_ack INTEGER DEFAULT 0,
      return_recorded_at TEXT,
      actual_distance_km REAL DEFAULT 0,
      additional_km REAL DEFAULT 0,
      additional_km_charge REAL DEFAULT 0,
      fuel_surcharge REAL DEFAULT 0,
      cleaning_surcharge REAL DEFAULT 0,
      damage_charges REAL DEFAULT 0,
      deposit_deductions_total REAL DEFAULT 0,
      deposit_refund_amount REAL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (booking_id) REFERENCES bookings(id),
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
    );

    CREATE TABLE IF NOT EXISTS availability_blocks (
      id TEXT PRIMARY KEY,
      vehicle_id TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      reason TEXT NOT NULL DEFAULT 'maintenance', -- 'maintenance', 'personal_use', 'external_booking', 'buffer'
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
    );

    CREATE TABLE IF NOT EXISTS email_logs (
      id TEXT PRIMARY KEY,
      booking_id TEXT,
      recipient TEXT NOT NULL,
      subject TEXT NOT NULL,
      type TEXT NOT NULL,
      body_preview TEXT,
      status TEXT NOT NULL DEFAULT 'delivered',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS status_audit_logs (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      previous_status TEXT,
      new_status TEXT NOT NULL,
      actor TEXT NOT NULL DEFAULT 'owner',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (booking_id) REFERENCES bookings(id)
    );

    CREATE TABLE IF NOT EXISTS owner_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'CHF',
      payment_method TEXT NOT NULL DEFAULT 'card', -- card, twint, cash
      provider TEXT NOT NULL DEFAULT 'simulated',
      provider_transaction_id TEXT,
      status TEXT NOT NULL DEFAULT 'captured',
      idempotency_key TEXT UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (booking_id) REFERENCES bookings(id)
    );

    CREATE TABLE IF NOT EXISTS extras (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      daily_rate REAL NOT NULL,
      flat_rate REAL,
      category TEXT NOT NULL DEFAULT 'equipment',
      is_active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'unread',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_vehicles_slug ON vehicles(slug);
    CREATE INDEX IF NOT EXISTS idx_bookings_vehicle ON bookings(vehicle_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(pickup_date, return_date);
    CREATE INDEX IF NOT EXISTS idx_bookings_ref ON bookings(booking_ref);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
    CREATE INDEX IF NOT EXISTS idx_avail_blocks_vehicle ON availability_blocks(vehicle_id, start_date, end_date);
    CREATE INDEX IF NOT EXISTS idx_email_logs_booking ON email_logs(booking_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_booking ON status_audit_logs(booking_id);
  `);

  // Non-destructive additions to vehicles table
  addColumnIfNotExists('vehicles', 'security_deposit REAL NOT NULL DEFAULT 300', 'security_deposit');
  addColumnIfNotExists('vehicles', 'extra_km_rate REAL NOT NULL DEFAULT 0.35', 'extra_km_rate');

  // Non-destructive additions to bookings table
  addColumnIfNotExists('bookings', 'total_hours REAL NOT NULL DEFAULT 24', 'total_hours');
  addColumnIfNotExists('bookings', "pricing_mode TEXT NOT NULL DEFAULT 'standard_package'", 'pricing_mode');
  addColumnIfNotExists('bookings', 'base_rental_amount REAL NOT NULL DEFAULT 0', 'base_rental_amount');
  addColumnIfNotExists('bookings', 'included_mileage INTEGER NOT NULL DEFAULT 150', 'included_mileage');
  addColumnIfNotExists('bookings', 'extra_km_rate REAL NOT NULL DEFAULT 0.35', 'extra_km_rate');
  addColumnIfNotExists('bookings', 'security_deposit REAL NOT NULL DEFAULT 300', 'security_deposit');
  addColumnIfNotExists('bookings', "deposit_status TEXT NOT NULL DEFAULT 'not_collected'", 'deposit_status');
  addColumnIfNotExists('bookings', 'deposit_receipt_ref TEXT', 'deposit_receipt_ref');
  addColumnIfNotExists('bookings', 'deposit_repayment_notes TEXT', 'deposit_repayment_notes');
  addColumnIfNotExists('bookings', 'delivery_requested INTEGER NOT NULL DEFAULT 0', 'delivery_requested');
  addColumnIfNotExists('bookings', 'delivery_address TEXT', 'delivery_address');
  addColumnIfNotExists('bookings', 'delivery_postcode TEXT', 'delivery_postcode');
  addColumnIfNotExists('bookings', 'delivery_preferred_time TEXT', 'delivery_preferred_time');
  addColumnIfNotExists('bookings', 'delivery_instructions TEXT', 'delivery_instructions');
  addColumnIfNotExists('bookings', 'delivery_fee REAL NOT NULL DEFAULT 0', 'delivery_fee');
  addColumnIfNotExists('bookings', 'chauffeur_requested INTEGER NOT NULL DEFAULT 0', 'chauffeur_requested');
  addColumnIfNotExists('bookings', 'chauffeur_pickup_address TEXT', 'chauffeur_pickup_address');
  addColumnIfNotExists('bookings', 'chauffeur_destination TEXT', 'chauffeur_destination');
  addColumnIfNotExists('bookings', 'chauffeur_service_type TEXT', 'chauffeur_service_type');
  addColumnIfNotExists('bookings', 'chauffeur_passengers INTEGER', 'chauffeur_passengers');
  addColumnIfNotExists('bookings', 'chauffeur_estimated_duration TEXT', 'chauffeur_estimated_duration');
  addColumnIfNotExists('bookings', 'chauffeur_fee REAL NOT NULL DEFAULT 0', 'chauffeur_fee');
  addColumnIfNotExists('bookings', 'out_of_country_travel INTEGER NOT NULL DEFAULT 0', 'out_of_country_travel');
  addColumnIfNotExists('bookings', 'additional_driver_requested INTEGER NOT NULL DEFAULT 0', 'additional_driver_requested');
  addColumnIfNotExists('bookings', 'customer_message TEXT', 'customer_message');
  addColumnIfNotExists('bookings', "payment_preference TEXT NOT NULL DEFAULT 'online'", 'payment_preference');
  addColumnIfNotExists('bookings', 'terms_accepted INTEGER NOT NULL DEFAULT 0', 'terms_accepted');
  addColumnIfNotExists('bookings', 'terms_accepted_at TEXT', 'terms_accepted_at');
  addColumnIfNotExists('bookings', "terms_version TEXT DEFAULT 'v1.0-CH-2026'", 'terms_version');
  addColumnIfNotExists('bookings', 'owner_notes TEXT', 'owner_notes');
  addColumnIfNotExists('bookings', 'quote_expires_at TEXT', 'quote_expires_at');
  addColumnIfNotExists('bookings', 'quote_issued_at TEXT', 'quote_issued_at');
  addColumnIfNotExists('bookings', 'quote_accepted_at TEXT', 'quote_accepted_at');

  // Seed default owner settings
  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO owner_settings (key, value, description)
    VALUES (?, ?, ?)
  `);
  insertSetting.run('pickup_address', 'Pieterlen, Switzerland (Exact address provided upon confirmed booking)', 'Official vehicle pickup and return location');
  insertSetting.run('operating_hours', 'Mon–Fri: 08:00–18:30, Sat: 09:00–16:00, Sun: By Appointment', 'Operating schedule for handover');
  insertSetting.run('preparation_buffer_minutes', '120', 'Mandatory turnaround buffer between rentals in minutes');
  insertSetting.run('delivery_service_enabled', '1', 'Whether delivery service inquiries are accepted');
  insertSetting.run('chauffeur_service_enabled', '0', 'Whether chauffeur fulfilment is enabled (disabled pending insurance)');
  insertSetting.run('payment_deadline_hours', '24', 'Hours customer has to complete online payment once quote is approved');
  insertSetting.run('terms_version', 'v1.0-CH-2026', 'Active rental terms policy version');
  insertSetting.run('contact_email', 'info@easycarsbiel.ch', 'Owner primary notification email');
  insertSetting.run('contact_phone', '+41 32 377 12 00', 'Owner telephone line');
}

export default db;
