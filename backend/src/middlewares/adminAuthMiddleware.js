/**
 * Admin authentication middleware
 * Validates JWT token
 * Requires role='admin' in the token payload
 */
import jwt from 'jsonwebtoken';

export function adminAuthMiddleware(req, res, next) {
  const h = req.headers['authorization'] || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  if (!m) return res.status(401).json({ message: 'Thiếu token' });

  try {
    const token = m[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload || String(payload.role).toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền admin' });
    }
    req.admin = payload;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
}