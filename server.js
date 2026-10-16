import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Support numeric TCP ports and Unix sockets (used by Hostinger LiteSpeed/Passenger)
const rawPort = process.env.PORT || '3000';
const isSocket = isNaN(Number(rawPort));
const PORT = isSocket ? rawPort : Number(rawPort);

app.use(cors());
app.use(express.json());

// Health check endpoint for Hostinger load balancers & uptime checks
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// In-memory / persistent file storage for Hostinger
const DATA_FILE = path.join(__dirname, 'bookings_data.json');

function loadBookings() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading data file:', e);
  }
  return [];
}

function saveBookings(bookings) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving data file:', e);
  }
}

let BOOKINGS = loadBookings();

// Vehicles Data
const VEHICLES = [
  {
    id: 'veh-audi-a5',
    slug: 'audi-a5-sportback',
    name: 'Audi A5 Sportback 3.0 TDI quattro S-Line',
    brand: 'Audi',
    model: 'A5 Sportback 3.0 TDI quattro S-Line',
    year: 2018,
    category: 'sedan',
    daily_rate: 100,
    currency: 'CHF',
    seats: 5,
    doors: 5,
    transmission: 'automatic',
    fuel_type: 'diesel',
    engine: '3,0-Liter-V6-Turbodiesel',
    power: '286 PS (210 kW)',
    color: 'Daytona Grey Metallic',
    description: 'Audi A5 Sportback 3.0 TDI quattro S-Line (Baujahr 2018). Leistungsstarker 3,0-Liter-V6-Turbodiesel mit 286 PS, Automatikgetriebe und permanentem quattro-Allradantrieb. Ausgestattet mit Massagesitzen, Sportsitzen, Sitzheizung, Leder-/Stoff-Innenausstattung, Panorama-Glasdach, Apple CarPlay & Android Auto, Navigationssystem, Rückfahrkamera und Ganzjahresreifen. Standort Pieterlen, Schweiz. Kaution: CHF 500.',
    features: [
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
      'Ganzjahresreifen',
    ],
    specifications: {
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
          { period: '1 day / 24 hours', price: 100, km: 200 },
          { period: '3 days / 72 hours', price: 280, km: 600 },
          { period: '7 days', price: 600, km: 1200 },
          { period: '14 days', price: 1000, km: 1800 },
          { period: '30 days', price: 1590, km: 2500 },
        ],
        extra_km_price: 0.50,
        fuel_included: false,
        security_deposit: 500,
      },
    },
    images: [
      '/assets/vehicles/audi-a5/exterior/a5_01.jpeg',
      '/assets/vehicles/audi-a5/exterior/a5_02.jpeg',
      '/assets/vehicles/audi-a5/exterior/a5_03.jpeg',
      '/assets/vehicles/audi-a5/exterior/details/a5_04.jpeg',
      '/assets/vehicles/audi-a5/interior/a5_05.jpeg',
      '/assets/vehicles/audi-a5/interior/a5_06.jpeg',
      '/assets/vehicles/audi-a5/interior/a5_07.jpeg',
      '/assets/vehicles/audi-a5/interior/a5_08.jpeg',
      '/assets/vehicles/audi-a5/interior/a5_09.jpeg',
      '/assets/vehicles/audi-a5/exterior/details/a5_10.jpeg',
      '/assets/vehicles/audi-a5/exterior/details/a5_11.jpeg',
      '/assets/vehicles/audi-a5/interior/a5_12.jpeg',
      '/assets/vehicles/audi-a5/interior/a5_13.jpeg',
      '/assets/vehicles/audi-a5/exterior/details/a5_14.jpeg',
    ],
    interior_images: [
      '/assets/vehicles/audi-a5/interior/a5_05.jpeg',
      '/assets/vehicles/audi-a5/interior/a5_06.jpeg',
      '/assets/vehicles/audi-a5/interior/a5_07.jpeg',
      '/assets/vehicles/audi-a5/interior/a5_08.jpeg',
      '/assets/vehicles/audi-a5/interior/a5_09.jpeg',
      '/assets/vehicles/audi-a5/interior/a5_12.jpeg',
      '/assets/vehicles/audi-a5/interior/a5_13.jpeg',
    ],
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
    color: 'Ibis White Metallic',
    description: 'Audi A3 Sportback 1.8 TFSI quattro (Baujahr 2011). Dynamischer 1,8-Liter-TFSI-Turbobenziner mit 160 PS, 6-Gang-Handschaltung und permanentem quattro-Allradantrieb. Ausgestattet mit Sitzheizung, Klimaanlage, Alufelgen, Bluetooth-Freisprecheinrichtung, Parksensoren und Ganzjahresreifen. Wendig, zuverlässig und sparsam für Schweizer Bergstrecken und den Stadtverkehr. Standort Pieterlen, Schweiz. Kaution: CHF 500.',
    features: [
      '1.8 TFSI Turbobenziner (160 PS)',
      'quattro-Allradantrieb',
      '6-Gang-Schaltgetriebe',
      'Sitzheizung',
      'Klimaanlage',
      'Alufelgen mit Ganzjahresreifen',
      'Bluetooth-Freisprecheinrichtung',
      'Parksensoren hinten',
      'Elektrische Fensterheber',
      'Zentralverriegelung mit Funk',
      'ISOFIX-Kindersitzbefestigung',
    ],
    specifications: {
      baujahr: '2011',
      motor: '1,8-Liter-TFSI-Turbobenziner',
      leistung: '160 PS (118 kW)',
      kraftstoff: 'Benzin',
      getriebe: '6-Gang-Schaltgetriebe',
      antrieb: 'quattro-Allrad',
      sitzplaetze: '5',
      standort: 'Pieterlen, Schweiz',
      engine: '1.8L TFSI Turbo Petrol',
      power: '160 PS',
      drivetrain: 'quattro all-wheel drive',
      transmission: 'Manual 6-Speed',
      acceleration: '7.8 s (0–100 km/h)',
      fuel_consumption: '7.6 L/100 km',
      deposit: 500,
      extra_km_price: 0.35,
      pricing: {
        tiers: [
          { period: '1 day / 24 hours', price: 65, km: 150 },
          { period: '3 days / 72 hours', price: 180, km: 450 },
          { period: '7 days', price: 350, km: 1000 },
          { period: '14 days', price: 590, km: 1500 },
          { period: '30 days', price: 950, km: 2000 },
        ],
        extra_km_price: 0.35,
        fuel_included: false,
        security_deposit: 500,
      },
    },
    images: [
      '/assets/vehicles/audi-a3/exterior/a3_01.jpeg',
      '/assets/vehicles/audi-a3/exterior/a3_02.jpeg',
      '/assets/vehicles/audi-a3/exterior/a3_03.jpeg',
      '/assets/vehicles/audi-a3/interior/a3_04.jpeg',
      '/assets/vehicles/audi-a3/interior/a3_05.jpeg',
      '/assets/vehicles/audi-a3/interior/a3_06.jpeg',
      '/assets/vehicles/audi-a3/interior/a3_07.jpeg',
      '/assets/vehicles/audi-a3/exterior/a3_08.jpeg',
    ],
    interior_images: [
      '/assets/vehicles/audi-a3/interior/a3_04.jpeg',
      '/assets/vehicles/audi-a3/interior/a3_05.jpeg',
      '/assets/vehicles/audi-a3/interior/a3_06.jpeg',
      '/assets/vehicles/audi-a3/interior/a3_07.jpeg',
    ],
    security_deposit: 500,
    extra_km_rate: 0.35,
    is_available: 1,
    is_featured: 1,
  },
];

// Locations Data
const LOCATIONS = [
  {
    id: 'loc-pieterlen',
    name: 'Easy Cars — Pieterlen Station Hub',
    address: 'Hauptstrasse 12',
    city: 'Pieterlen',
    postal_code: '2542',
    country: 'Switzerland',
    latitude: 47.1753,
    longitude: 7.3386,
    phone: '+41 32 377 12 00',
    email: 'pieterlen@easycarsbiel.ch',
    hours: { mon_fri: '07:30–19:00', sat: '08:30–17:00', sun: 'By appointment' },
    is_active: 1,
  },
  {
    id: 'loc-biel',
    name: 'Easy Cars Biel — City Hub',
    address: 'Zentralstrasse 4',
    city: 'Biel/Bienne',
    postal_code: '2502',
    country: 'Switzerland',
    latitude: 47.1368,
    longitude: 7.2468,
    phone: '+41 79 388 99 97',
    email: 'info@easycarsbiel.ch',
    hours: { mon_fri: '08:00–18:30', sat: '09:00–16:00', sun: 'Keyless 24/7' },
    is_active: 1,
  },
];

// Extras Data
const EXTRAS = [
  { id: 'extra-driver', name: 'Additional Driver Registration', description: 'Authorize an additional registered driver', daily_rate: 10, flat_rate: null, category: 'service', is_active: 1 },
  { id: 'extra-seat', name: 'Child Safety Seat (ISOFIX)', description: 'Certified ergonomic protective child seat', daily_rate: 8, flat_rate: null, category: 'safety', is_active: 1 },
  { id: 'extra-chains', name: 'Winter Alpine Snow Chains', description: 'Certified pass snow chains for Swiss winter driving', daily_rate: 0, flat_rate: 25, category: 'equipment', is_active: 1 },
  { id: 'extra-crossborder', name: 'Cross-Border Travel Authorization', description: 'Written approval and documentation for transit outside Switzerland', daily_rate: 0, flat_rate: 35, category: 'service', is_active: 1 },
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.get('/api/vehicles', (req, res) => {
  let list = VEHICLES;
  if (req.query.category) list = list.filter(v => v.category === req.query.category);
  if (req.query.featured) list = list.filter(v => v.is_featured === 1);
  res.json({ vehicles: list });
});

app.get('/api/vehicles/:id', (req, res) => {
  const v = VEHICLES.find(x => x.id === req.params.id || x.slug === req.params.id);
  if (!v) return res.status(404).json({ error: 'Vehicle not found' });
  res.json({ vehicle: v });
});

app.get('/api/locations', (req, res) => {
  res.json({ locations: LOCATIONS });
});

app.get('/api/extras', (req, res) => {
  res.json({ extras: EXTRAS });
});

app.post('/api/quote/calculate', (req, res) => {
  const { vehicle_id, pickup_date, return_date, delivery_requested, chauffeur_requested } = req.body;
  const v = VEHICLES.find(x => x.id === vehicle_id || x.slug === vehicle_id) || VEHICLES[0];
  const dStart = new Date(pickup_date).getTime();
  const dEnd = new Date(return_date).getTime();
  const rentalDays = Math.max(1, Math.ceil(Math.max(24, (dEnd - dStart) / (1000 * 60 * 60)) / 24));

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

  const deliveryFee = delivery_requested ? 50 : 0;
  const chauffeurFee = chauffeur_requested ? 150 * rentalDays : 0;
  const totalAmount = rentalAmount + deliveryFee + chauffeurFee;

  res.json({
    rental_days: rentalDays,
    daily_rate: v.daily_rate,
    base_rental_amount: rentalAmount,
    delivery_fee: deliveryFee,
    chauffeur_fee: chauffeurFee,
    extras_total: 0,
    security_deposit: 500,
    total_amount: totalAmount,
    included_mileage: includedKm,
    extra_km_price: v.id.includes('a3') ? 0.35 : 0.50,
    currency: 'CHF',
  });
});

app.post('/api/bookings', (req, res) => {
  const body = req.body;
  const ref = `EC-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
  const v = VEHICLES.find(x => x.id === body.vehicle_id || x.slug === body.vehicle_id) || VEHICLES[0];

  const newBooking = {
    id: `b-${Date.now()}`,
    booking_ref: ref,
    vehicle_id: v.id,
    vehicle_name: v.name,
    customer_name: body.customer_name || 'Geschätzter Kunde',
    customer_email: body.customer_email || 'kunde@easycarsbiel.ch',
    customer_phone: body.customer_phone || '+41 79 388 99 97',
    pickup_date: body.pickup_date,
    return_date: body.return_date,
    pickup_location_name: 'Pieterlen Station Hub',
    pickup_address: 'Hauptstrasse 12, 2542 Pieterlen',
    extras: body.extras || [],
    daily_rate: v.daily_rate,
    total_days: 1,
    total_hours: 24,
    pricing_mode: 'standard_package',
    status: 'request_received',
    payment_status: 'unpaid',
    total_amount: 100,
    currency: 'CHF',
    base_rental_amount: 100,
    delivery_fee: 0,
    chauffeur_fee: 0,
    security_deposit: 500,
    deposit_status: 'not_collected',
    included_mileage: 200,
    extra_km_rate: 0.50,
    delivery_requested: body.delivery_requested ? 1 : 0,
    chauffeur_requested: body.chauffeur_requested ? 1 : 0,
    payment_preference: body.payment_preference || 'online',
    terms_accepted: 1,
    out_of_country_travel: 0,
    additional_driver_requested: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  BOOKINGS.unshift(newBooking);
  saveBookings(BOOKINGS);

  res.json({
    success: true,
    notice: 'Ihre Buchungsanfrage wurde erfolgreich übermittelt.',
    booking: newBooking,
  });
});

app.get('/api/bookings/:ref', (req, res) => {
  const b = BOOKINGS.find(x => x.booking_ref === req.params.ref || x.id === req.params.ref);
  if (!b) return res.status(404).json({ error: 'Booking not found' });
  res.json({ booking: b, inspection: null, auditLogs: [] });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    return res.json({
      token: `jwt-${Date.now()}`,
      user: { id: 'owner-1', email, name: 'Easy Cars Biel Management', role: 'owner' },
    });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

app.get('/api/owner/overview', (req, res) => {
  res.json({
    overview: {
      requests_received: BOOKINGS.filter(b => b.status === 'request_received').length,
      upcoming_confirmed: BOOKINGS.filter(b => b.status === 'confirmed').length,
      active_rentals: 2,
      completed_rentals: 5,
      cash_due: 0,
    },
  });
});

app.get('/api/owner/bookings', (req, res) => {
  res.json({ bookings: BOOKINGS });
});

app.post('/api/contact', (req, res) => {
  res.json({ success: true, message: 'Message sent successfully' });
});

// Serve frontend static assets from dist and public
const distPath = path.join(__dirname, 'dist');
const publicPath = path.join(__dirname, 'public');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) return next();
  const indexCandidates = [
    path.join(distPath, 'index.html'),
    path.join(publicPath, 'index.html'),
    path.join(__dirname, 'index.html'),
  ];
  for (const candidate of indexCandidates) {
    if (fs.existsSync(candidate)) {
      return res.sendFile(candidate);
    }
  }
  res.send('Easy Cars Biel platform is online.');
});

if (isSocket) {
  app.listen(PORT, () => {
    console.log(`Easy Cars Biel server running on socket: ${PORT}`);
  });
} else {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Easy Cars Biel server running on port: ${PORT}`);
  });
}

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
