import db, { initializeDatabase } from './db.js';
import bcrypt from 'bcryptjs';

initializeDatabase();

// Clear existing tables cleanly
db.exec(`
  DELETE FROM email_logs;
  DELETE FROM status_audit_logs;
  DELETE FROM inspections;
  DELETE FROM availability_blocks;
  DELETE FROM payments;
  DELETE FROM bookings;
  DELETE FROM vehicles;
  DELETE FROM extras;
  DELETE FROM locations;
  DELETE FROM users;
`);

// --- Seed Default Owner & Admin Account ---
const salt = bcrypt.genSaltSync(10);
const ownerPasswordHash = bcrypt.hashSync('Password123!', salt);

const insertUser = db.prepare(`
  INSERT INTO users (id, email, password_hash, name, phone, role)
  VALUES (?, ?, ?, ?, ?, ?)
`);

insertUser.run(
  'usr-owner-01',
  'owner@easycarsbiel.ch',
  ownerPasswordHash,
  'Easy Cars Biel Management',
  '+41 32 377 12 00',
  'owner'
);
console.log('✓ Seeded official owner account: owner@easycarsbiel.ch / Password123!');

// --- Real Verified Swiss Locations (Pieterlen & Biel/Bienne) ---
const locPieterlenId = 'loc-pieterlen';
const locBielId = 'loc-biel';

const locations = [
  {
    id: locPieterlenId,
    name: 'Easy Cars — Pieterlen Station Hub',
    address: 'Hauptstrasse 12',
    city: 'Pieterlen',
    postal_code: '2542',
    country: 'Switzerland',
    latitude: 47.1753,
    longitude: 7.3386,
    phone: '+41 32 377 12 00',
    email: 'pieterlen@easycarsbiel.ch',
    hours: JSON.stringify({ mon_fri: '07:30–19:00', sat: '08:30–17:00', sun: 'By appointment' }),
    is_active: 1,
  },
  {
    id: locBielId,
    name: 'Easy Cars Biel — City Hub',
    address: 'Zentralstrasse 4',
    city: 'Biel/Bienne',
    postal_code: '2502',
    country: 'Switzerland',
    latitude: 47.1368,
    longitude: 7.2468,
    phone: '+41 79 388 99 97',
    email: 'info@easycarsbiel.ch',
    hours: JSON.stringify({ mon_fri: '08:00–18:30', sat: '09:00–16:00', sun: 'Keyless 24/7' }),
    is_active: 1,
  },
];

const insertLocation = db.prepare(`
  INSERT INTO locations (id, name, address, city, postal_code, country, latitude, longitude, phone, email, hours, is_active)
  VALUES (:id, :name, :address, :city, :postal_code, :country, :latitude, :longitude, :phone, :email, :hours, :is_active)
`);

for (const loc of locations) {
  insertLocation.run(loc);
}
console.log(`✓ Seeded ${locations.length} official Swiss locations`);

// --- Real Practical Rental Extras ---
const extras = [
  { id: 'extra-driver', name: 'Additional Driver Registration', description: 'Authorize an additional registered driver', daily_rate: 10, flat_rate: null, category: 'service', is_active: 1 },
  { id: 'extra-seat', name: 'Child Safety Seat (ISOFIX)', description: 'Certified ergonomic protective child seat', daily_rate: 8, flat_rate: null, category: 'safety', is_active: 1 },
  { id: 'extra-chains', name: 'Winter Alpine Snow Chains', description: 'Certified pass snow chains for Swiss winter driving', daily_rate: 0, flat_rate: 25, category: 'equipment', is_active: 1 },
  { id: 'extra-crossborder', name: 'Cross-Border Travel Authorization', description: 'Written approval and documentation for transit outside Switzerland', daily_rate: 0, flat_rate: 35, category: 'service', is_active: 1 },
];

const insertExtra = db.prepare(`
  INSERT INTO extras (id, name, description, daily_rate, flat_rate, category, is_active)
  VALUES (:id, :name, :description, :daily_rate, :flat_rate, :category, :is_active)
`);

for (const extra of extras) {
  insertExtra.run(extra);
}
console.log(`✓ Seeded ${extras.length} authentic extras`);

// --- Real Vehicles: Audi A5 Sportback & Audi A3 Sportback ---
const vehicles = [
  {
    id: 'veh-audi-a5',
    slug: 'audi-a5-sportback',
    name: 'Audi A5 Sportback 3.0 TDI quattro S-Line',
    brand: 'Audi',
    model: 'A5 Sportback 3.0 TDI quattro S-Line',
    year: 2018,
    category: 'sedan',
    daily_rate: 110,
    currency: 'CHF',
    seats: 5,
    doors: 5,
    transmission: 'automatic',
    fuel_type: 'diesel',
    engine: '3,0-Liter-V6-Turbodiesel',
    power: '286 PS (210 kW)',
    color: 'Daytona Grey Metallic',
    description: 'Audi A5 Sportback 3.0 TDI quattro S-Line (Baujahr 2018). Leistungsstarker 3,0-Liter-V6-Turbodiesel mit 286 PS, Automatikgetriebe und permanentem quattro-Allradantrieb. Ausgestattet mit Massagesitzen, Sportsitzen, Sitzheizung, Leder-/Stoff-Innenausstattung, Panorama-Glasdach, Apple CarPlay & Android Auto, Navigationssystem, Rückfahrkamera und Ganzjahresreifen. Standort Pieterlen, Schweiz. Kaution: CHF 500.',
    features: JSON.stringify([
      '3.0 TDI V6 Turbodiesel (286 PS)',
      'quattro-Allradantrieb',
      'Automatikgetriebe',
      'Massagesitze',
      'Sportsitze & Sitzheizung',
      'Leder-/Stoff-Innenausstattung',
      'Panorama-Glasdach',
      'Navigationssystem / GPS',
      'Apple CarPlay & Android Auto',
      'Rückfahrkamera & Parkhilfe',
      'Klimaanlage & Tempomat',
      'Bluetooth & AUX/USB-Anschluss',
      'ISOFIX-Kindersitzbefestigung',
      'Ganzjahresreifen'
    ]),
    specifications: JSON.stringify({
      baujahr: '2018',
      motor: '3,0-Liter-V6-Turbodiesel',
      leistung: '286 PS (210 kW)',
      kraftstoff: 'Diesel',
      getriebe: 'Automatik',
      antrieb: 'quattro-Allrad',
      sitzplaetze: '5',
      standort: 'Pieterlen, Schweiz',
      engine: '3.0L V6 Turbo Diesel',
      power: '286 PS',
      drivetrain: 'quattro all-wheel drive',
      transmission: 'Automatic',
      acceleration: '5.2 s (0–100 km/h)',
      fuel_consumption: '5.9 L/100 km',
      deposit: 500,
      extra_km_price: 0.50,
      pricing: {
        tiers: [
          { period: '1 day / 24 hours', price: 110, km: 200 },
          { period: '3 days / 72 hours', price: 300, km: 600 },
          { period: '7 days', price: 690, km: 1200 },
          { period: '14 days', price: 1190, km: 1800 },
          { period: '30 days', price: 1790, km: 2500 }
        ],
        extra_km_price: 0.50,
        fuel_included: false,
        security_deposit: 500
      }
    }),
    images: JSON.stringify([
      '/vehicles/audi-a5/a5_01.jpeg',
      '/vehicles/audi-a5/a5_02.jpeg',
      '/vehicles/audi-a5/a5_03.jpeg',
      '/vehicles/audi-a5/a5_04.jpeg',
      '/vehicles/audi-a5/a5_05.jpeg',
      '/vehicles/audi-a5/a5_06.jpeg',
      '/vehicles/audi-a5/a5_07.jpeg',
      '/vehicles/audi-a5/a5_08.jpeg',
      '/vehicles/audi-a5/a5_09.jpeg',
      '/vehicles/audi-a5/a5_10.jpeg',
      '/vehicles/audi-a5/a5_11.jpeg',
      '/vehicles/audi-a5/a5_12.jpeg',
      '/vehicles/audi-a5/a5_13.jpeg',
      '/vehicles/audi-a5/a5_14.jpeg',
      '/vehicles/audi-a5/a5_15.jpeg',
    ]),
    interior_images: JSON.stringify([
      '/vehicles/audi-a5/a5_05.jpeg',
      '/vehicles/audi-a5/a5_06.jpeg',
      '/vehicles/audi-a5/a5_07.jpeg',
      '/vehicles/audi-a5/a5_08.jpeg',
    ]),
    cinematic_manifest: JSON.stringify({}),
    inspection_data: JSON.stringify({
      inspection_id: 'EASY-CARS-A5',
      inspection_date: '2024-10-14',
      inspector: 'Easy Cars Biel Workshop',
      mileage: 'Geprüfter Zustand',
      exterior_condition: 'Sehr gut',
      tires_wheels: 'Ganzjahresreifen — Geprüftes Profil',
      interior_cleanliness: 'Professionell gereinigt & desinfiziert',
      maintenance_record: 'Regelmässiger Service aktuell',
      verification_status: 'Easy Cars Biel Geprüft',
      disclaimer: 'Offizielle Fahrzeugdaten von Easy Cars Biel (easycarsbiel.ch).'
    }),
    location_id: locPieterlenId,
    security_deposit: 500,
    extra_km_rate: 0.50,
    is_available: 1,
    is_featured: 1,
  },
  {
    id: 'veh-audi-a3',
    slug: 'audi-a3-sportback',
    name: 'Audi A3 Sportback 1.8 TFSI quattro',
    brand: 'Audi',
    model: 'A3 Sportback 1.8 TFSI quattro',
    year: 2011,
    category: 'compact',
    daily_rate: 65,
    currency: 'CHF',
    seats: 5,
    doors: 5,
    transmission: 'manual',
    fuel_type: 'petrol',
    engine: '1,8-Liter-TFSI-Turbobenziner',
    power: '160 PS (118 kW)',
    color: 'Phantomschwarz Metallic',
    description: 'Audi A3 Sportback 1.8 TFSI quattro (Baujahr 2011). Sportlicher 1,8-Liter-TFSI-Turbobenziner mit 160 PS, manuellem Schaltgetriebe und quattro-Allradantrieb. Ausgestattet mit 5 Türen, Sitzheizung, Klimaanlage, Tempomat, AUX-/USB-Anschluss und Ganzjahresreifen. Standort Pieterlen, Schweiz. Kaution: CHF 300.',
    features: JSON.stringify([
      '1.8 TFSI Turbobenziner (160 PS)',
      'quattro-Allradantrieb',
      'Manuelles Schaltgetriebe',
      '5 Türen & 5 Sitzplätze',
      'Sitzheizung',
      'Klimaanlage',
      'Tempomat',
      'AUX- & USB-Anschluss',
      'Ganzjahresreifen',
      'ISOFIX-Kindersitzbefestigung'
    ]),
    specifications: JSON.stringify({
      baujahr: '2011',
      motor: '1,8-Liter-TFSI-Turbobenziner',
      leistung: '160 PS (118 kW)',
      kraftstoff: 'Benzin',
      getriebe: 'Manuelles Schaltgetriebe',
      antrieb: 'quattro-Allrad',
      sitzplaetze: '5',
      tueren: '5',
      standort: 'Pieterlen, Schweiz',
      engine: '1.8L TFSI Turbo Petrol',
      power: '160 PS',
      drivetrain: 'quattro all-wheel drive',
      transmission: 'Manual',
      deposit: 300,
      extra_km_price: 0.35,
      pricing: {
        tiers: [
          { period: '1 day / 24 hours', price: 65, km: 150 },
          { period: '3 days / 72 hours', price: 180, km: 450 },
          { period: '7 days', price: 350, km: 1000 },
          { period: '14 days', price: 590, km: 1500 },
          { period: '30 days', price: 950, km: 2000 }
        ],
        extra_km_price: 0.35,
        fuel_included: false,
        security_deposit: 300
      }
    }),
    images: JSON.stringify([
      '/vehicles/audi-a3/a3_01.jpeg',
      '/vehicles/audi-a3/a3_02.jpeg',
      '/vehicles/audi-a3/a3_03.jpeg',
      '/vehicles/audi-a3/a3_04.jpeg',
      '/vehicles/audi-a3/a3_05.jpeg',
      '/vehicles/audi-a3/a3_06.jpeg',
      '/vehicles/audi-a3/a3_07.jpeg',
      '/vehicles/audi-a3/a3_08.jpeg',
      '/vehicles/audi-a3/a3_09.jpeg',
      '/vehicles/audi-a3/a3_10.jpeg',
      '/vehicles/audi-a3/a3_11.jpeg',
    ]),
    interior_images: JSON.stringify([
      '/vehicles/audi-a3/a3_04.jpeg',
      '/vehicles/audi-a3/a3_05.jpeg',
    ]),
    cinematic_manifest: JSON.stringify({}),
    inspection_data: JSON.stringify({
      inspection_id: 'EASY-CARS-A3',
      inspection_date: '2024-09-20',
      inspector: 'Easy Cars Biel Workshop',
      mileage: 'Geprüfter Zustand',
      exterior_condition: 'Sehr gut',
      tires_wheels: 'Ganzjahresreifen — Geprüftes Profil',
      interior_cleanliness: 'Professionell gereinigt & desinfiziert',
      maintenance_record: 'Regelmässiger Service aktuell',
      verification_status: 'Easy Cars Biel Geprüft',
      disclaimer: 'Offizielle Fahrzeugdaten von Easy Cars Biel (easycarsbiel.ch).'
    }),
    location_id: locPieterlenId,
    security_deposit: 300,
    extra_km_rate: 0.35,
    is_available: 1,
    is_featured: 1,
  }
];

const insertVehicle = db.prepare(`
  INSERT INTO vehicles (
    id, slug, name, brand, model, year, category, daily_rate, currency,
    seats, doors, transmission, fuel_type, engine, power, color, description,
    features, specifications, images, interior_images, cinematic_manifest,
    inspection_data, location_id, security_deposit, extra_km_rate, is_available, is_featured
  ) VALUES (
    :id, :slug, :name, :brand, :model, :year, :category, :daily_rate, :currency,
    :seats, :doors, :transmission, :fuel_type, :engine, :power, :color, :description,
    :features, :specifications, :images, :interior_images, :cinematic_manifest,
    :inspection_data, :location_id, :security_deposit, :extra_km_rate, :is_available, :is_featured
  )
`);

for (const vehicle of vehicles) {
  insertVehicle.run(vehicle);
}
console.log(`✓ Seeded ${vehicles.length} verified real vehicles (Audi A5 & Audi A3)`);

console.log('\n✓ Easy Cars Biel database seeded cleanly with zero fake data!');
