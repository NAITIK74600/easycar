import { Router } from 'express';
import db from '../db.js';

export const locationRoutes = Router();

locationRoutes.get('/', (_req, res) => {
  try {
    const locations = db.prepare('SELECT * FROM locations WHERE is_active = 1 ORDER BY name').all();
    const parsed = locations.map((l: any) => ({
      ...l,
      hours: JSON.parse(l.hours || '{}'),
    }));
    res.json({ locations: parsed });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

locationRoutes.get('/:id', (req, res) => {
  try {
    const location = db.prepare('SELECT * FROM locations WHERE id = ?').get(req.params.id) as any;
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    location.hours = JSON.parse(location.hours || '{}');
    res.json({ location });
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});
