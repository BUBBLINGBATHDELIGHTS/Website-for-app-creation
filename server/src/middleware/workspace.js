import { getDb } from '../lib/database.js';

export function requireWorkspaceIdentity(options = {}) {
  const { allowedRoles } = options;

  return async function workspaceGuard(req, res, next) {
    try {
      const emailHeader = req.headers['x-workspace-email'];
      if (!emailHeader) {
        return res.status(401).json({ error: 'Workspace authorization required' });
      }

      const normalizedEmail = String(emailHeader).trim().toLowerCase();
      const allowedDomain = process.env.WORKSPACE_ACCESS_EMAIL_DOMAIN;

      if (allowedDomain && !normalizedEmail.endsWith(`@${allowedDomain}`)) {
        return res.status(403).json({ error: 'Workspace email domain rejected' });
      }
      const db = getDb();
      const record = await db('workspace_registrations').where({ email: normalizedEmail }).first();

      if (!record) {
        return res.status(403).json({ error: 'Workspace access not registered' });
      }

      if (record.status !== 'approved') {
        return res.status(403).json({ error: `Workspace access ${record.status}` });
      }

      if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
        const allowed = allowedRoles.includes(record.role) || (record.role === 'admin' && allowedRoles.includes('admin'));
        if (!allowed) {
          return res.status(403).json({ error: 'Insufficient workspace permissions' });
        }
      }

      req.workspaceIdentity = record;
      next();
    } catch (error) {
      next(error);
    }
  };
}
