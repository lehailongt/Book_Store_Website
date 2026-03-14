import express from 'express';
import {
    getCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartCount
} from '../controllers/cartController.js';

const router = express.Router();

/**
 * @swagger
 * /api/cart/count:
 *   get:
 *     tags: [Cart]
 *     summary: Lấy số lượng items trong giỏ
 *     responses:
 *       200:
 *         description: Số lượng items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 */
router.get('/count', getCartCount);

/**
 * @swagger
 * /api/cart:
 *   get:
 *     tags: [Cart]
 *     summary: Lấy giỏ hàng
 *     responses:
 *       200:
 *         description: Chi tiết giỏ hàng
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
router.get('/', getCart);

/**
 * @swagger
 * /api/cart:
 *   post:
 *     tags: [Cart]
 *     summary: Thêm vào giỏ hàng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/', addToCart);

/**
 * @swagger
 * /api/cart/update:
 *   put:
 *     tags: [Cart]
 *     summary: Cập nhật số lượng
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
router.put('/update', updateQuantity);

/**
 * @swagger
 * /api/cart/{book_id}:
 *   delete:
 *     tags: [Cart]
 *     summary: Xóa item khỏi giỏ
 *     parameters:
 *       - in: path
 *         name: book_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/:book_id', removeFromCart);

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     tags: [Cart]
 *     summary: Xóa toàn bộ giỏ hàng
 *     responses:
 *       200:
 *         description: Cleared
 */
router.delete('/', clearCart);

export default router;
