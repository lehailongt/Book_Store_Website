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
 *     summary: Lấy thống kê dashboard cho admin
 *     description: Lấy 4 chỉ số quan trọng chính cho dashboard (tổng đơn hàng, doanh thu, tổng sách, sách đã bán). Tất cả chỉ số chỉ tính từ đơn hàng đã giao (delivered)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê dashboard lấy thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     revenue:
 *                       type: number
 *                       format: decimal
 *                       description: Tổng doanh thu (từ đơn hàng delivered)
 *                       example: 12450.75
 *                     totalBooks:
 *                       type: integer
 *                       description: Tổng số sách trong hệ thống
 *                       example: 250
 *                     totalBooksSold:
 *                       type: integer
 *                       description: Tổng số sách đã bán (từ đơn hàng delivered)
 *                       example: 385
 *                     totalUsers:
 *                       type: integer
 *                       description: Tổng số đơn hàng đã giao (delivered)
 *                       example: 26
 *       401:
 *         description: Chưa xác thực (thiếu token hoặc token không hợp lệ)
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 */
router.get('/', adminGetMetrics);

/**
 * @swagger
 * /api/admin/metrics/order-status:
 *   get:
 *     tags: [Admin Metrics]
 *     summary: Lấy dữ liệu biểu đồ trạng thái đơn hàng
 *     description: Lấy số lượng đơn hàng theo từng trạng thái (shipped, delivered, cancel) để vẽ biểu đồ
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dữ liệu biểu đồ lấy thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     labels:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Nhãn trạng thái rõ ràng (Đang giao, Đã giao)
 *                       example: ["Đang giao", "Đã giao"]
 *                     data:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       description: Số lượng đơn hàng theo từng trạng thái (tương ứng với labels)
 *                       example: [25, 120]
 *                     colors:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Màu sắc hex cho biểu đồ
 *                       example: ["#f59e0b", "#10b981"]
 *       401:
 *         description: Chưa xác thực (thiếu token hoặc token không hợp lệ)
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 */
router.get('/order-status', adminGetOrderStatusChart);

/**
 * @swagger
 * /api/admin/metrics/revenue-by-month:
 *   get:
 *     tags: [Admin Metrics]
 *     summary: Lấy dữ liệu biểu đồ doanh thu theo tháng
 *     description: Lấy doanh thu theo từng tháng trong năm để vẽ biểu đồ (chỉ tính từ đơn hàng delivered)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           default: 2024
 *           minimum: 2020
 *           maximum: 2099
 *         example: 2024
 *         description: Năm cần thống kê
 *     responses:
 *       200:
 *         description: Dữ liệu biểu đồ doanh thu lấy thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     labels:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Tên tháng (Tháng 1, Tháng 2, ...)
 *                       example: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"]
 *                     data:
 *                       type: array
 *                       items:
 *                         type: number
 *                         format: decimal
 *                       description: Doanh thu (VND) của từng tháng
 *                       example: [1200.50, 1850.75, 2100.00, 1950.25, 2450.00, 2100.75, 1800.25, 2200.50, 2050.75, 2300.00, 1950.50, 2650.00]
 *                     year:
 *                       type: integer
 *                       description: Năm được thống kê
 *                       example: 2024
 *       401:
 *         description: Chưa xác thực (thiếu token hoặc token không hợp lệ)
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 */
router.get('/revenue-by-month', adminGetMonthlyRevenueChart);

export default router;
