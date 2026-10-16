import { Router } from 'express';
import { z } from 'zod';
import db from '../db.js';
import { calculateRentalTariff } from '../utils/pricing.js';
import { checkVehicleAvailability } from '../services/availabilityService.js';

export const quoteRoutes = Router();

const quoteRequestSchema = z.object({
  vehicle_id: z.string().min(1),
  pickup_date: z.string().min(5),
  return_date: z.string().min(5),
  delivery_requested: z.boolean().optional(),
  chauffeur_requested: z.boolean().optional(),
});

quoteRoutes.post('/calculate', (req, res) => {
  const parsed = quoteRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid parameters for quote calculation' });
  }

  const { vehicle_id, pickup_date, return_date, delivery_requested, chauffeur_requested } = parsed.data;

  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ? OR slug = ?').get(vehicle_id, vehicle_id) as any;
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  // 1. Authoritative Tariff Calculation
  const tariff = calculateRentalTariff(vehicle.slug || vehicle.name, pickup_date, return_date);

  // 2. Real-time Availability Check
  const availability = checkVehicleAvailability(vehicle.id, pickup_date, return_date);

  return res.json({
    available: availability.isAvailable,
    base_rental_amount: tariff.price,
    included_mileage: tariff.includedKm,
    extra_km_rate: tariff.extraKmRate,
    security_deposit: tariff.securityDeposit,
    pricing_mode: tariff.pricingMode,
    vehicle: {
      id: vehicle.id,
      name: vehicle.name,
      slug: vehicle.slug,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      image: JSON.parse(vehicle.images || '[]')[0] || '',
    },
    tariff,
    availability,
    services: {
      delivery: {
        requested: Boolean(delivery_requested),
        feeNote: delivery_requested ? 'Price on request (will be itemized in owner quote)' : null,
      },
      chauffeur: {
        requested: Boolean(chauffeur_requested),
        feeNote: chauffeur_requested ? 'Price on request (fulfilment subject to owner confirmation)' : null,
      },
    },
    deposit: {
      amount: tariff.securityDeposit,
      currency: 'CHF',
      timing: 'Payable in cash at pickup before keys are handed over',
      refundable: true,
    },
  });
});
