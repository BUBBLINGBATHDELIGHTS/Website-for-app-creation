import { Router } from 'express';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { getDb } from '../lib/database.js';

const router = Router();

const registrationSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  role: z.enum(['admin', 'employee'])
});

const validateSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  role: z.enum(['admin', 'employee']).optional()
});

router.post('/registrations', async (req, res, next) => {
  try {
    const payload = registrationSchema.parse(req.body);
    const db = getDb();

    const existing = await db('workspace_registrations').where({ email: payload.email }).first();

    if (existing) {
      const updated = await db('workspace_registrations')
        .where({ email: payload.email })
        .update({ role: payload.role, status: existing.status, updated_at: db.fn.now() }, '*');
      return res.json({ status: existing.status, registration: updated[0] });
    }

    const [record] = await db('workspace_registrations').insert(
      {
        id: randomUUID(),
        email: payload.email,
        role: payload.role,
        status: 'pending'
      },
      '*'
    );

    res.status(201).json({ status: 'pending', registration: record });
  } catch (error) {
    next(error);
  }
});

router.post('/validate', async (req, res, next) => {
  try {
    const payload = validateSchema.parse(req.body);
    const db = getDb();

    const record = await db('workspace_registrations').where({ email: payload.email }).first();

    if (!record) {
      return res
        .status(404)
        .json({ allowed: false, reason: 'not_registered', message: 'Email not registered. Submit an access request.' });
    }

    if (record.status !== 'approved') {
      const message =
        record.status === 'pending'
          ? 'Registration pending. Leadership will approve or reject the request.'
          : 'Workspace access revoked. Contact leadership to restore permissions.';
      return res.status(403).json({ allowed: false, reason: record.status, message });
    }

    if (payload.role && record.role !== payload.role && record.role !== 'admin') {
      return res.status(403).json({ allowed: false, reason: 'role_mismatch', message: 'Approved for a different portal.' });
    }

    res.json({ allowed: true, registration: record });
  } catch (error) {
    next(error);
  }
});

export default router;
