import { Router } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';

export const contactRoutes = Router();

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(10).max(2000),
});

contactRoutes.post('/', (req, res) => {
  try {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const data = parsed.data;
    const id = uuidv4();

    db.prepare(`
      INSERT INTO contact_messages (id, name, email, phone, subject, message)
      VALUES (@id, @name, @email, @phone, @subject, @message)
    `).run({
      id,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject || null,
      message: data.message,
    });

    res.status(201).json({ success: true, message: 'Message received. We will get back to you shortly.' });
  } catch (error) {
    console.error('Error saving contact message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});
