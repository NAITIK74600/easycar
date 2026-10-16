import { Router } from 'express';
import db from '../db.js';

export const vehicleRoutes = Router();

// GET /api/vehicles — list all vehicles
vehicleRoutes.get('/', (req, res) => {
  try {
    const { category, available, featured } = req.query;

    let query = 'SELECT * FROM vehicles WHERE 1=1';
    const params: (string | number)[] = [];

    if (category) {
      query += ' AND category = ?';
      params.push(String(category));
    }

    if (available !== undefined) {
      query += ' AND is_available = ?';
      params.push(available === 'true' ? 1 : 0);
    }

    if (featured === 'true') {
      query += ' AND is_featured = 1';
    }

    query += ' ORDER BY is_featured DESC, daily_rate ASC';

    const stmt = db.prepare(query);
    const vehicles = (stmt.all(...params) || []) as any[];

    // Parse JSON fields
    const parsed = vehicles.map((v) => ({
      ...v,
      features: JSON.parse(v.features || '[]'),
      specifications: JSON.parse(v.specifications || '{}'),
      images: JSON.parse(v.images || '[]'),
      interior_images: JSON.parse(v.interior_images || '[]'),
      cinematic_manifest: JSON.parse(v.cinematic_manifest || '{}'),
      inspection_data: JSON.parse(v.inspection_data || '{}'),
    }));

    res.json({ vehicles: parsed, total: parsed.length });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// GET /api/vehicles/:idOrSlug — get vehicle by ID or slug
vehicleRoutes.get('/:idOrSlug', (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const stmt = db.prepare(`
      SELECT v.*, l.name as location_name, l.city as location_city, l.address as location_address
      FROM vehicles v
      LEFT JOIN locations l ON v.location_id = l.id
      WHERE v.id = ? OR v.slug = ?
    `);

    const vehicle = stmt.get(idOrSlug, idOrSlug) as any;

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const parsed = {
      ...vehicle,
      features: JSON.parse(vehicle.features || '[]'),
      specifications: JSON.parse(vehicle.specifications || '{}'),
      images: JSON.parse(vehicle.images || '[]'),
      interior_images: JSON.parse(vehicle.interior_images || '[]'),
      cinematic_manifest: JSON.parse(vehicle.cinematic_manifest || '{}'),
      inspection_data: JSON.parse(vehicle.inspection_data || '{}'),
    };

    res.json({ vehicle: parsed });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
});

// GET /api/vehicles/:id/availability — check availability for a vehicle
vehicleRoutes.get('/:id/availability', (req, res) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'from and to dates are required (YYYY-MM-DD)' });
    }

    const conflictStmt = db.prepare(`
      SELECT COUNT(*) as count FROM bookings
      WHERE vehicle_id = (SELECT id FROM vehicles WHERE id = ? OR slug = ?)
      AND status NOT IN ('cancelled', 'rejected')
      AND pickup_date < ?
      AND return_date > ?
    `);
    const conflict = conflictStmt.get(id, id, String(to), String(from)) as any;
    const isAvailable = (conflict?.count || 0) === 0;

    const blockedStmt = db.prepare(`
      SELECT DISTINCT date FROM availability
      WHERE vehicle_id = (SELECT id FROM vehicles WHERE id = ? OR slug = ?)
      AND date >= ? AND date <= ?
      AND is_available = 0
    `);
    const blockedDates = (blockedStmt.all(id, id, String(from), String(to)) || []) as any[];

    res.json({
      available: isAvailable,
      blocked_dates: blockedDates.map((d) => d.date),
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
});
