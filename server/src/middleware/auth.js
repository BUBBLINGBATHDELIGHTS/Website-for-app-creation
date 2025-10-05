import { getUserFromToken } from '../lib/supabase.js';

function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer') return null;
  return token;
}

export function requireAuth(options = {}) {
  return async function authMiddleware(req, res, next) {
    try {
      const token = extractToken(req);
      if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const user = await getUserFromToken(token);
      if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const role = user?.app_metadata?.role || user?.user_metadata?.role || 'customer';

      if (options.allowedRoles && !options.allowedRoles.includes(role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      req.user = { ...user, role };
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function optionalAuth() {
  return async function optionalMiddleware(req, _res, next) {
    try {
      const token = extractToken(req);
      if (!token) {
        return next();
      }

      const user = await getUserFromToken(token);
      if (user) {
        req.user = {
          ...user,
          role: user?.app_metadata?.role || user?.user_metadata?.role || 'customer'
        };
      }
    } catch (error) {
      console.warn('Optional auth failed', error.message);
    }
    next();
  };
}
