import express from 'express';
import {
	adminGetBooks,
	adminCreateBook,
	adminUpdateBook,
	adminDeleteBook,
	adminGetCategories,
	adminUploadBookImage,
} from '../controllers/adminBookController.js';

const router = express.Router();

/**
 * @swagger
 * /api/admin/books:
 *   get:
 *     tags: [Admin Books]
 *     summary: Lấy danh sách sách
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
 *         description: Từ khóa tìm kiếm
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [book_id, price, publish_date]
 *           default: book_id
 *         description: Sắp xếp theo
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Thứ tự sắp xếp
 *     responses:
 *       200:
 *         description: Danh sách sách
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 books:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       book_id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       author:
 *                         type: string
 *                       price:
 *                         type: number
 *                       publish_date:
 *                         type: string
 *                         format: date
 *                       description:
 *                         type: string
 *                       image_url:
 *                         type: string
 *                       categories:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             category_id:
 *                               type: integer
 *                             name:
 *                               type: string
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
router.get('/', adminGetBooks);

/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     tags: [Admin Books]
 *     summary: Lấy danh sách thể loại sách
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách thể loại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category_id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *       401:
 *         description: Chưa xác thực
 *       403:
 *         description: Không có quyền admin
 */
router.get('/categories', adminGetCategories);

/**
 * @swagger
 * /api/admin/books:
 *   post:
 *     tags: [Admin Books]
 *     summary: Tạo sách mới
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 description: Tiêu đề sách
 *               author:
 *                 type: string
 *                 description: Tác giả
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 description: Giá sách
 *               publish_date:
 *                 type: string
 *                 format: date
 *                 description: Ngày xuất bản
 *               description:
 *                 type: string
 *                 description: Mô tả sách
 *               image_url:
 *                 type: string
 *                 description: URL ảnh bìa
 *               categories:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Danh sách ID thể loại
 *     responses:
 *       201:
 *         description: Sách đã được tạo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 book_id:
 *                   type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa xác thực
 *       403:
 *         description: Không có quyền admin
 */
router.post('/', adminCreateBook);

/**
 * @swagger
 * /api/admin/books/{id}:
 *   put:
 *     tags: [Admin Books]
 *     summary: Cập nhật thông tin sách
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID sách
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Tiêu đề sách
 *               author:
 *                 type: string
 *                 description: Tác giả
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 description: Giá sách
 *               publish_date:
 *                 type: string
 *                 format: date
 *                 description: Ngày xuất bản
 *               description:
 *                 type: string
 *                 description: Mô tả sách
 *               image_url:
 *                 type: string
 *                 description: URL ảnh bìa
 *               categories:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Danh sách ID thể loại
 *     responses:
 *       200:
 *         description: Sách đã được cập nhật
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
 *         description: Không tìm thấy sách
 */
router.put('/:id', adminUpdateBook);

/**
 * @swagger
 * /api/admin/books/{id}:
 *   delete:
 *     tags: [Admin Books]
 *     summary: Xóa sách
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID sách
 *     responses:
 *       200:
 *         description: Sách đã được xóa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Không thể xóa sách đang được sử dụng
 *       401:
 *         description: Chưa xác thực
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy sách
 */
router.delete('/:id', adminDeleteBook);

/**
 * @swagger
 * /api/admin/books/{id}/image:
 *   post:
 *     tags: [Admin Books]
 *     summary: Upload ảnh bìa sách
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID sách
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: File ảnh (PNG, JPG, JPEG)
 *     responses:
 *       200:
 *         description: Ảnh đã được upload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 image_url:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: File không hợp lệ
 *       401:
 *         description: Chưa xác thực
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy sách
 */
router.post('/:id/image', adminUploadBookImage);

export default router;
