import express from 'express';
import { 
    createOrder, 
    getUserOrders, 
    getOrderDetails, 
    updateOrderStatus 
} from '../controllers/orderController.js';

const orderRouter = express.Router();

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Tạo đơn hàng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created
 */
orderRouter.post('/', createOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Lấy danh sách đơn hàng
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 */
orderRouter.get('/', getUserOrders);

/**
 * @swagger
 * /api/orders/{order_id}:
 *   get:
 *     tags: [Orders]
 *     summary: Lấy chi tiết đơn hàng
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
orderRouter.get('/:order_id', getOrderDetails);

/**
 * @swagger
 * /api/orders/{order_id}/status:
 *   put:
 *     tags: [Orders]
 *     summary: Cập nhật trạng thái đơn hàng
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated
 */
orderRouter.put('/:order_id/status', updateOrderStatus);

export default orderRouter;
