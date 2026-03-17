import express from 'express';
import {
    createOrder,
    getUserOrders,
    getOrderDetails
} from '../controllers/orderController.js';

const orderRouter = express.Router();

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Tạo đơn hàng mới
 *     description: Tạo một đơn hàng từ các items trong giỏ hàng. Backend sẽ tự động lấy giá từ database và tính tổng tiền. Sau khi tạo, giỏ hàng sẽ bị làm trống
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - delivery_address
 *             properties:
 *               items:
 *                 type: array
 *                 description: Danh sách sách trong đơn hàng (chỉ cần book_id và quantity, giá sẽ được lấy từ database)
 *                 items:
 *                   type: object
 *                   required:
 *                     - book_id
 *                     - quantity
 *                   properties:
 *                     book_id:
 *                       type: integer
 *                       description: ID sách
 *                       example: 3
 *                     quantity:
 *                       type: integer
 *                       description: Số lượng
 *                       example: 2
 *               delivery_address:
 *                 type: string
 *                 description: Địa chỉ giao hàng
 *                 example: "123 Đường Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh"
 *     responses:
 *       201:
 *         description: Tạo đơn hàng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Tạo đơn hàng thành công"
 *                 data:
 *                   type: object
 *                   properties:
 *                     order_id:
 *                       type: integer
 *                       example: 42
 *       400:
 *         description: Yêu cầu không hợp lệ (items không hợp lệ, giỏ hàng trống, thiếu địa chỉ, v.v.)
 *       404:
 *         description: Sách không tồn tại trong danh sách items
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         description: Lỗi server
 */
orderRouter.post('/', createOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Lấy danh sách đơn hàng của người dùng
 *     description: Lấy tất cả các đơn hàng của người dùng hiện tại
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Lấy danh sách đơn hàng thành công"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       order_id:
 *                         type: integer
 *                         example: 42
 *                       user_id:
 *                         type: integer
 *                         example: 10
 *                       total_amount:
 *                         type: string
 *                         example: "100.00"
 *                       status:
 *                         type: string
 *                         enum: [shipped, delivered, cancel]
 *                         description: shipped = Đang giao, delivered = Đã giao, cancel = Đã hủy
 *                         example: "shipped"
 *                       delivery_address:
 *                         type: string
 *                         example: "123 Đường Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-03-15T10:30:00Z"
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         description: Lỗi server
 */
orderRouter.get('/', getUserOrders);

/**
 * @swagger
 * /api/orders/{order_id}:
 *   get:
 *     tags: [Orders]
 *     summary: Lấy chi tiết đơn hàng
 *     description: Lấy thông tin chi tiết của một đơn hàng kèm danh sách sách trong đơn hàng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 42
 *         description: ID của đơn hàng
 *     responses:
 *       200:
 *         description: Lấy chi tiết thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Lấy chi tiết đơn hàng thành công"
 *                 data:
 *                   type: object
 *                   properties:
 *                     order_details:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 103
 *                           order_id:
 *                             type: integer
 *                             example: 42
 *                           book_id:
 *                             type: integer
 *                             example: 6
 *                           quantity:
 *                             type: integer
 *                             example: 3
 *                           price:
 *                             type: string
 *                             format: decimal
 *                             example: "250000.00"
 *                           name:
 *                             type: string
 *                             example: "Chiến tranh và hòa bình"
 *                           author:
 *                             type: string
 *                             example: "Lev Tolstoy"
 *                           image_url:
 *                             type: string
 *                             example: "images/books/6.png"
 *       400:
 *         description: Dữ liệu không hợp lệ (thiếu order_id)
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền truy cập đơn hàng này (không phải chủ đơn hàng)
 *       404:
 *         description: Không tìm thấy đơn hàng
 *       500:
 *         description: Lỗi server
 */
orderRouter.get('/:order_id', getOrderDetails);

export default orderRouter;
