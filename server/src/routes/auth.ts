import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import db from '../db.js';
import { generateToken, requireAuth } from '../middleware/auth.js';

export const authRoutes = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRoutes.post('/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Valid email and password are required' });
  }

  const { email, password } = parsed.data;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

authRoutes.get('/me', requireAuth, (req, res) => {
  return res.json({ user: req.user });
});
