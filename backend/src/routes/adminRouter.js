// src/routes/adminRouter.js
import express from 'express';
import {
  adminGetUsers,
  adminGetUserById,
  adminToggleUserActive,
  adminUpdateUserRole,
  adminGetOrders,
  adminGetOrderById,
  adminUpdateOrderStatus,
  adminGetMetrics,
} from '../controllers/adminController.js';

const router = express.Router();

// Very light auth: read token from header (base64url JSON) and require role=admin
router.use((req, res, next) => {
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
});

// Users
router.get('/users', adminGetUsers);
router.get('/users/:id', adminGetUserById);
router.patch('/users/:id/toggle-active', adminToggleUserActive);
router.patch('/users/:id/role', adminUpdateUserRole);

// Orders
router.get('/orders', adminGetOrders);
router.get('/orders/:id', adminGetOrderById);
router.patch('/orders/:id/status', adminUpdateOrderStatus);

// Metrics
router.get('/metrics', adminGetMetrics);

export default router;
