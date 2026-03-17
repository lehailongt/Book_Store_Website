import express from 'express';
import {
    getAllBooks,
    getAllCategories,
    getBookById,
    getPopularBooks
} from '../controllers/bookController.js';

const router = express.Router();

/**
 * @swagger
 * /api/books/categories/all:
 *   get:
 *     tags: [Books]
 *     summary: Lấy tất cả thể loại sách
 *     description: Lấy danh sách tất cả thể loại sách hiện có
 *     responses:
 *       200:
 *         description: Danh sách thể loại lấy thành công
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
 *                   example: "Lấy danh sách thể loại thành công"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Tiểu thuyết"
 *                       book_count:
 *                         type: integer
 *                         example: 3
 *       500:
 *         description: Lỗi server
 */
router.get("/categories/all", getAllCategories);

/**
 * @swagger
 * /api/books:
 *   get:
 *     tags: [Books]
 *     summary: Lấy danh sách sách (có phân trang)
 *     description: Lấy danh sách tất cả sách với khả năng phân trang
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         example: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         example: 12
 *         description: Số sách mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách sách lấy thành công
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
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Harry Potter and the Philosopher's Stone"
 *                       author:
 *                         type: string
 *                         example: "J.K. Rowling"
 *                       price:
 *                         type: number
 *                         format: decimal
 *                         example: 215.50
 *                       description:
 *                         type: string
 *                         example: "The first book in the Harry Potter series"
 *                       image_url:
 *                         type: string
 *                         example: "images/books/1.png"
 *                       publish_date:
 *                         type: string
 *                         format: date
 *                         example: "2026-03-16T17:00:00.000Z"
 *                       categories:
 *                         type: array
 *                         items: 
 *                           type: object
 *                           properties:
 *                              name: 
 *                                 type: string
 *                         example: 
 *                              - name: "Phiêu lưu"
 *                              - name: "Tình cảm"
 *                           
 *       500:
 *         description: Lỗi server
 */
router.get("/", getAllBooks);

/**
 * @swagger
 * /api/books/popular:
 *   get:
 *     tags: [Books]
 *     summary: Lấy sách phổ biến (top selling)
 *     description: Lấy danh sách sách bán chạy nhất với giới hạn số lượng
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         example: 12
 *         description: Số lượng sách muốn lấy
 *     responses:
 *       200:
 *         description: Danh sách sách phổ biến lấy thành công
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
 *                   example: "Lấy sách phổ biến thành công"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Harry Potter and the Philosopher's Stone"
 *                       author:
 *                         type: string
 *                         example: "J.K. Rowling"
 *                       price:
 *                         type: number
 *                         format: decimal
 *                         example: 215.50
 *                       description:
 *                         type: string
 *                         example: "The first book in the Harry Potter series"
 *                       image_url:
 *                         type: string
 *                         example: "images/books/1.png"
 *                       publish_date:
 *                         type: string
 *                         format: date
 *                         example: "2026-03-16T17:00:00.000Z"
 *       500:
 *         description: Lỗi server
 */
router.get("/popular", getPopularBooks);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     tags: [Books]
 *     summary: Lấy chi tiết sách
 *     description: Lấy thông tin chi tiết của một sách theo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *         description: ID sách
 *     responses:
 *       200:
 *         description: Chi tiết sách lấy thành công
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
 *                     book_id:
 *                       type: integer
 *                       example: 1
 *                     book_name:
 *                       type: string
 *                       example: "Harry Potter and the Philosopher's Stone"
 *                     author_name:
 *                       type: string
 *                       example: "J.K. Rowling"
 *                     price:
 *                       type: number
 *                       format: decimal
 *                       example: 15.99
 *                     publish_date:
 *                       type: string
 *                       format: date
 *                       example: "1998-06-26"
 *                     description:
 *                       type: string
 *                       example: "The first book in the Harry Potter series, following a young wizard's journey"
 *                     image_url:
 *                       type: string
 *                       example: "images/books/1.jpg"
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                       example:
 *                             - name: "phieu luu"
 *                             - name: "tring tham"
 *       404:
 *         description: Không tìm thấy sách
 *       500:
 *         description: Lỗi server
 */
router.get("/:id", getBookById);

export default router;