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
 *     summary: Lấy danh sách đơn hàng (có phân trang)
 *     description: Lấy danh sách đơn hàng với khả năng tìm kiếm, lọc trạng thái và lọc theo ngày
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         example: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *         example: 10
 *         description: Số đơn hàng mỗi trang
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         example: "An"
 *         description: Từ khóa tìm kiếm (tên khách hàng hoặc ID đơn hàng)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [shipped, delivered, cancel]
 *         example: "shipped"
 *         description: Lọc theo trạng thái (shipped = Đang giao, delivered = Đã giao, cancel = Đã hủy)
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         example: "2020-01-01"
 *         description: Ngày bắt đầu (YYYY-MM-DD)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         example: "2024-12-31"
 *         description: Ngày kết thúc (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng lấy thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 total:
 *                   type: integer
 *                   example: 156
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       orderId:
 *                         type: integer
 *                         example: 114
 *                       customerName:
 *                         type: string
 *                         example: "Huỳnh Văn C1"
 *                       totalAmount:
 *                         type: number
 *                         format: decimal
 *                         example: 345000
 *                       status:
 *                         type: string
 *                         example: "Đang giao"
 *                         description: Trạng thái đơn hàng (Đang giao, Đã giao, Đã hủy)
 *                       deliveryAddress:
 *                         type: string
 *                         example: "123 Đường Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-05-22T07:40:00.000Z"
 *       401:
 *         description: Chưa xác thực (thiếu token hoặc token không hợp lệ)
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 */
router.get('/', adminGetOrders);

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   get:
 *     tags: [Admin Orders]
 *     summary: Lấy chi tiết đơn hàng
 *     description: Lấy thông tin chi tiết của một đơn hàng kèm danh sách sách trong đơn
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 42
 *         description: ID đơn hàng
 *     responses:
 *       200:
 *         description: Chi tiết đơn hàng lấy thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderId:
 *                   type: integer
 *                   example: 114
 *                 status:
 *                   type: string
 *                   example: "Đang giao"
 *                 totalAmount:
 *                   type: number
 *                   format: decimal
 *                   example: 345000
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-05-22T07:40:00.000Z"
 *                 deliveryAddress:
 *                   type: string
 *                   example: "123 Đường Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh"
 *                 customerName:
 *                   type: string
 *                   example: "Huỳnh Văn C1"
 *                 customerEmail:
 *                   type: string
 *                   example: "customer@gmail.com"
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       orderDetailId:
 *                         type: integer
 *                         example: 125
 *                       bookId:
 *                         type: integer
 *                         example: 3
 *                       bookName:
 *                         type: string
 *                         example: "Lý Tưởng Lớn"
 *                       quantity:
 *                         type: integer
 *                         example: 2
 *                       unitPrice:
 *                         type: number
 *                         format: decimal
 *                         example: 125000
 *       401:
 *         description: Chưa xác thực (thiếu token hoặc token không hợp lệ)
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy đơn hàng
 *       500:
 *         description: Lỗi server
 */
router.get('/:id', adminGetOrderById);

/**
 * @swagger
 * /api/admin/orders/{id}/status:
 *   patch:
 *     tags: [Admin Orders]
 *     summary: Cập nhật trạng thái đơn hàng
 *     description: Thay đổi trạng thái của một đơn hàng (shipped → delivered → cancel)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 42
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
 *                 enum: [shipped, delivered, cancel]
 *                 description: Trạng thái mới (shipped = Đang giao, delivered = Đã giao, cancel = Đã hủy)
 *                 example: "delivered"
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cập nhật trạng thái đơn hàng thành công"
 *       400:
 *         description: Dữ liệu không hợp lệ (status không hợp lệ)
 *       401:
 *         description: Chưa xác thực (thiếu token hoặc token không hợp lệ)
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy đơn hàng
 *       500:
 *         description: Lỗi server
 */
router.patch('/:id/status', adminUpdateOrderStatus);

export default router;
