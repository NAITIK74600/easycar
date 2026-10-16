import { Router } from 'express';
import db from '../db.js';

export const extrasRoutes = Router();

extrasRoutes.get('/', (_req, res) => {
  try {
    const extras = db.prepare('SELECT * FROM extras WHERE is_active = 1 ORDER BY category, name').all();
    res.json({ extras });
  } catch (error) {
    console.error('Error fetching extras:', error);
    res.status(500).json({ error: 'Failed to fetch extras' });
  }
});
