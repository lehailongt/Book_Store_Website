/**
 * Admin authentication middleware
 * Validates Bearer token with base64url encoded JSON payload
 * Requires role='admin' in the token payload
 */
export function adminAuthMiddleware(req, res, next) {
  const h = req.headers['authorization'] || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  if (!m) return res.status(401).json({ message: 'Thiếu token' });

  try {
    const json = Buffer.from(m[1], 'base64url').toString('utf8');
    const payload = JSON.parse(json);
    if (!payload || String(payload.role).toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền admin' });
    }
    req.admin = payload;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
}