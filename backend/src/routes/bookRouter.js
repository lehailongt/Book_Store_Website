import express from 'express';
import { 
    getAllBooks, 
    getAllCategories,
    getBooksByCategory,
    getBookById,
    getPopularBooks,
    createBook, 
    updateBook, 
    deleteBook 
} from '../controllers/bookController.js';

const router = express.Router();

/**
 * @swagger
 * /api/books/categories/all:
 *   get:
 *     tags: [Books]
 *     summary: Lấy tất cả thể loại sách
 *     responses:
 *       200:
 *         description: Danh sách thể loại
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
router.get("/categories/all", getAllCategories);

/**
 * @swagger
 * /api/books/popular:
 *   get:
 *     tags: [Books]
 *     summary: Lấy sách phổ biến
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/popular", getPopularBooks);

/**
 * @swagger
 * /api/books/category/{categoryName}:
 *   get:
 *     tags: [Books]
 *     summary: Lấy sách theo thể loại
 *     parameters:
 *       - in: path
 *         name: categoryName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/category/:categoryName", getBooksByCategory);

/**
 * @swagger
 * /api/books:
 *   get:
 *     tags: [Books]
 *     summary: Lấy tất cả sách
 *     responses:
 *       200:
 *         description: Danh sách sách
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
router.get("/", getAllBooks);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     tags: [Books]
 *     summary: Lấy chi tiết sách
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/:id", getBookById);

/**
 * @swagger
 * /api/books:
 *   post:
 *     tags: [Books]
 *     summary: Tạo sách mới
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
router.post("/", createBook);

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     tags: [Books]
 *     summary: Cập nhật sách
 *     parameters:
 *       - in: path
 *         name: id
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
router.put("/:id", updateBook);

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     tags: [Books]
 *     summary: Xóa sách
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete("/:id", deleteBook);

export default router;