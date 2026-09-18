import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'veloura_super_secure_jwt_secret_key_2026';

/**
 * Middleware to protect Admin Panel API routes.
 * Expects a Bearer token issued by POST /api/admin/login (role: 'admin').
 * This is fully separate from the customer auth flow/token and does not
 * touch the existing users table, JWTs, or customer sessions.
 */
export function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Admin token missing.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access only.' });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired admin session.' });
  }
}
