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
 *     summary: Lấy số lượng items trong giỏ hàng
 *     description: Trả về tổng số mặt hàng (items) hiện có trong giỏ hàng của người dùng
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy số lượng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                    type: boolean
 *                    example: true
 *                 count:
 *                   type: string
 *                   example: 5
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         description: Lỗi server
 */
router.get('/count', getCartCount);

/**
 * @swagger
 * /api/cart:
 *   get:
 *     tags: [Cart]
 *     summary: Lấy danh sách giỏ hàng
 *     description: Lấy tất cả items trong giỏ hàng của người dùng hiện tại
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy giỏ hàng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       cart_item_id:
 *                         type: integer
 *                         example: 10
 *                       user_id:
 *                         type: integer
 *                         example: 4   
 *                       book_id:
 *                         type: integer
 *                         example: 3
 *                       quantity:
 *                         type: integer
 *                         example: 2
 *                       name:
 *                         type: string
 *                         example: "The Great Gatsby"
 *                       author:
 *                         type: string
 *                         example: "Robert Edison"
 *                       price:
 *                         type: number
 *                         format: decimal
 *                         example: 12.99
 *                       image_url:
 *                         type: string
 *                         example: "images/books/10.png"
 *                       description:
 *                         type: string
 *                         example: "Giáo trình toán học dành cho sinh viên các trường đại học kỹ thuật, bao gồm các chương về giải tích, đại số tuyến tính và phương trình vi phân cơ bản."
 *                       categories:
 *                         type: array
 *                         example:
 *                           - name: "Khoa hoc"
 *                           - name: "Tham khao"
 *       401: 
 *         description: Chưa đăng nhập
 *       500:
 *         description: Lỗi server
 */
router.get('/', getCart);

/**
 * @swagger
 * /api/cart:
 *   post:
 *     tags: [Cart]
 *     summary: Thêm sách vào giỏ hàng
 *     description: Thêm một sách vào giỏ hàng với số lượng chỉ định. Nếu sách đã tồn tại, sẽ cập nhật số lượng
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - book_id
 *               - quantity
 *             properties:
 *               book_id:
 *                 type: integer
 *                 description: ID sách
 *                 example: 3
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Số lượng muốn thêm
 *                 example: 2
 *     responses:
 *       200:
 *         description: Thêm vào giỏ hàng thành công
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
 *                   example: "Thêm vào giỏ hàng thành công"
 *       400:
 *         description: Dữ liệu không hợp lệ (quantity < 1, etc)
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Sách không tồn tại
 *       500:
 *         description: Lỗi server
 */
router.post('/', addToCart);

/**
 * @swagger
 * /api/cart/update:
 *   put:
 *     tags: [Cart]
 *     summary: Cập nhật số lượng sách trong giỏ
 *     description: Cập nhật số lượng của một sách trong giỏ hàng. Nếu quantity = 0, sách sẽ bị xóa
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - book_id
 *               - quantity
 *             properties:
 *               book_id:
 *                 type: integer
 *                 description: ID sách
 *                 example: 3
 *               quantity:
 *                 type: integer
 *                 minimum: 0
 *                 description: Số lượng mới (0 để xóa sách khỏi giỏ)
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cập nhật thành công
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
 *                   example: "Cập nhật giỏ hàng thành công"
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Sách không tồn tại trong giỏ
 *       500:
 *         description: Lỗi server
 */
router.put('/update', updateQuantity);

/**
 * @swagger
 * /api/cart/{book_id}:
 *   delete:
 *     tags: [Cart]
 *     summary: Xóa sách khỏi giỏ hàng
 *     description: Xóa một sách cụ thể khỏi giỏ hàng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: book_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 3
 *         description: ID sách
 *     responses:
 *       200:
 *         description: Xóa thành công
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
 *                   example: "Xóa khỏi giỏ hàng thành công"
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Sách không tồn tại trong giỏ
 *       500:
 *         description: Lỗi server
 */
router.delete('/:book_id', removeFromCart);

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     tags: [Cart]
 *     summary: Xóa toàn bộ giỏ hàng
 *     description: Xóa tất cả items trong giỏ hàng của người dùng
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Xóa toàn bộ thành công
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
 *                   example: "Xóa toàn bộ giỏ hàng thành công"
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         description: Lỗi server
 */
router.delete('/', clearCart);

export default router;
