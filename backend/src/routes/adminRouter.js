// src/routes/adminRouter.js
import express from 'express';
import {
  adminGetUsers,
  adminGetUserById,
  adminCreateUser,
  adminUpdateUser,
  adminDeleteUser,
  adminToggleUserActive,
  adminUpdateUserRole,
  adminGetBooks,
  adminCreateBook,
  adminUpdateBook,
  adminDeleteBook,
  adminGetCategories,
  adminUploadBookImage,
  adminGetOrders,
  adminGetOrderById,
  adminUpdateOrderStatus,
  adminGetMetrics,
  adminGetOrderStatusChart,
  adminGetMonthlyRevenueChart,
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
router.post('/users', adminCreateUser);
router.put('/users/:id', adminUpdateUser);
router.delete('/users/:id', adminDeleteUser);
router.patch('/users/:id/toggle-active', adminToggleUserActive);
router.patch('/users/:id/role', adminUpdateUserRole);

// Books
router.get('/books', adminGetBooks);
router.get('/categories', adminGetCategories);
router.post('/books', adminCreateBook);
router.put('/books/:id', adminUpdateBook);
router.delete('/books/:id', adminDeleteBook);
router.post('/books/:id/image', adminUploadBookImage);

// Orders
router.get('/orders', adminGetOrders);
router.get('/orders/:id', adminGetOrderById);
router.patch('/orders/:id/status', adminUpdateOrderStatus);

// Metrics
router.get('/metrics', adminGetMetrics);
router.get('/order-status', adminGetOrderStatusChart);
router.get('/revenue-by-month', adminGetMonthlyRevenueChart);

export default router;
