import express from 'express';
import {
  adminGetOrders,
  adminGetOrderById,
  adminUpdateOrderStatus,
} from '../controllers/adminOrderController.js';

const router = express.Router();

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     tags: [Admin Orders]
 *     summary: Lấy danh sách đơn hàng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số item mỗi trang
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm (tên khách hàng hoặc ID đơn hàng)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, shipped, delivered, cancelled]
 *         description: Lọc theo trạng thái
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày bắt đầu (YYYY-MM-DD)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày kết thúc (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       order_id:
 *                         type: integer
 *                       customer_name:
 *                         type: string
 *                       total_amount:
 *                         type: number
 *                       status:
 *                         type: string
 *                       status_badge:
 *                         type: string
 *                       order_date:
 *                         type: string
 *                         format: date-time
 *                       items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             book_title:
 *                               type: string
 *                             quantity:
 *                               type: integer
 *                             price:
 *                               type: number
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       401:
 *         description: Chưa xác thực
 *       403:
 *         description: Không có quyền admin
 */
router.get('/', adminGetOrders);

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   get:
 *     tags: [Admin Orders]
 *     summary: Lấy chi tiết đơn hàng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID đơn hàng
 *     responses:
 *       200:
 *         description: Chi tiết đơn hàng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order_id:
 *                   type: integer
 *                 customer_name:
 *                   type: string
 *                 customer_email:
 *                   type: string
 *                 total_amount:
 *                   type: number
 *                 status:
 *                   type: string
 *                 status_badge:
 *                   type: string
 *                 order_date:
 *                   type: string
 *                   format: date-time
 *                 shipping_address:
 *                   type: string
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       book_id:
 *                         type: integer
 *                       book_title:
 *                         type: string
 *                       quantity:
 *                         type: integer
 *                       price:
 *                         type: number
 *                       subtotal:
 *                         type: number
 *       401:
 *         description: Chưa xác thực
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy đơn hàng
 */
router.get('/:id', adminGetOrderById);

/**
 * @swagger
 * /api/admin/orders/{id}/status:
 *   patch:
 *     tags: [Admin Orders]
 *     summary: Cập nhật trạng thái đơn hàng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID đơn hàng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, shipped, delivered, cancelled]
 *                 description: Trạng thái mới
 *     responses:
 *       200:
 *         description: Trạng thái đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa xác thực
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy đơn hàng
 */
router.patch('/:id/status', adminUpdateOrderStatus);

export default router;
