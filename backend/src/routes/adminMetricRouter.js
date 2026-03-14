import express from 'express';
import {
  adminGetMetrics,
  adminGetOrderStatusChart,
  adminGetMonthlyRevenueChart,
} from '../controllers/adminMetricController.js';

const router = express.Router();

/**
 * @swagger
 * /api/admin/metrics:
 *   get:
 *     tags: [Admin Metrics]
 *     summary: Lấy thống kê tổng quan hệ thống
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê hệ thống
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalOrders:
 *                   type: integer
 *                   description: Tổng số đơn hàng đã giao
 *                 revenue:
 *                   type: number
 *                   description: Tổng doanh thu từ đơn hàng đã giao
 *                 totalUsers:
 *                   type: integer
 *                   description: Tổng số người dùng
 *                 totalBooks:
 *                   type: integer
 *                   description: Tổng số sách
 *                 totalBooksSold:
 *                   type: integer
 *                   description: Tổng số sách đã bán
 *       401:
 *         description: Chưa xác thực
 *       403:
 *         description: Không có quyền admin
 */
router.get('/', adminGetMetrics);

/**
 * @swagger
 * /api/admin/order-status:
 *   get:
 *     tags: [Admin Metrics]
 *     summary: Lấy dữ liệu biểu đồ trạng thái đơn hàng
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dữ liệu biểu đồ trạng thái đơn hàng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 labels:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Nhãn trạng thái (Đã giao, Đang giao, Đã hủy)
 *                 data:
 *                   type: array
 *                   items:
 *                     type: integer
 *                   description: Số lượng đơn hàng theo trạng thái
 *                 colors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Màu sắc cho biểu đồ
 *       401:
 *         description: Chưa xác thực
 *       403:
 *         description: Không có quyền admin
 */
router.get('/order-status', adminGetOrderStatusChart);

/**
 * @swagger
 * /api/admin/revenue-by-month:
 *   get:
 *     tags: [Admin Metrics]
 *     summary: Lấy dữ liệu biểu đồ doanh thu theo tháng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           default: 2024
 *         description: Năm cần thống kê
 *     responses:
 *       200:
 *         description: Dữ liệu biểu đồ doanh thu theo tháng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 labels:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Nhãn tháng (Tháng 1, Tháng 2, ...)
 *                 data:
 *                   type: array
 *                   items:
 *                     type: number
 *                   description: Doanh thu theo tháng
 *                 year:
 *                   type: integer
 *                   description: Năm được thống kê
 *       401:
 *         description: Chưa xác thực
 *       403:
 *         description: Không có quyền admin
 */
router.get('/revenue-by-month', adminGetMonthlyRevenueChart);

export default router;
