import express from 'express';
import {
	adminGetCategories,
	adminCreateCategory,
	adminUpdateCategory,
	adminDeleteCategory,
	adminGetCategoryById,
} from '../controllers/adminCategoryController.js';

const router = express.Router();

/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     tags: [Admin Categories]
 *     summary: Lấy danh sách thể loại sách
 *     description: Lấy danh sách thể loại sách với khả năng tìm kiếm và phân trang
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
 *         description: Số thể loại mỗi trang
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         example: "Tiểu thuyết"
 *         description: Từ khóa tìm kiếm theo tên thể loại
 *     responses:
 *       200:
 *         description: Danh sách thể loại lấy thành công
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
 *                         example: 1
 *                       category_name:
 *                         type: string
 *                         example: "Tiểu thuyết"
 *                       book_count:
 *                         type: integer
 *                         description: Số sách trong thể loại này
 *                         example: 15
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page: 
 *                       type: integer
 *                       example: 1 
 *                     limit:
 *                       type: integer
 *                       example: 10  
 *                     total: 
 *                       type: integer
 *                       example: 1
 *                     totalPages: 
 *                       type: integer
 *                       example: 1  
 *                 sort:
 *                   type: object
 *                   properties:
 *                     sortBy: 
 *                       type: string
 *                       example: "category_name"
 *                     sortOrder:
 *                       type: string
 *                       example: "DESC"
 *       401:
 *         description: Chưa xác thực (thiếu token hoặc token không hợp lệ)
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 */
router.get('/', adminGetCategories);

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   get:
 *     tags: [Admin Categories]
 *     summary: Lấy chi tiết thể loại
 *     description: Lấy thông tin chi tiết của một thể loại kèm số sách
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *         description: ID thể loại
 *     responses:
 *       200:
 *         description: Chi tiết thể loại lấy thành công
 *         
 *       401:
 *         description: Chưa xác thực (thiếu token hoặc token không hợp lệ)
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy thể loại
 *       500:
 *         description: Lỗi server
 */
router.get('/:id', adminGetCategoryById);

/**
 * @swagger
 * /api/admin/categories:
 *   post:
 *     tags: [Admin Categories]
 *     summary: Tạo thể loại mới
 *     description: Tạo một thể loại sách mới
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_name
 *             properties:
 *               category_name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: Tên thể loại (bắt buộc, duy nhất)
 *                 example: "Khoa học viễn tưởng"
 *     responses:
 *       201:
 *         description: Tạo thể loại thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 8
 *                 message:
 *                   type: string
 *                   example: "Thể loại đã được tạo"
 *       400:
 *         description: Dữ liệu không hợp lệ (tên trống, etc)
 *       401:
 *         description: Chưa xác thực (thiếu token hoặc token không hợp lệ)
 *       403:
 *         description: Không có quyền admin
 *       409:
 *         description: Thể loại đã tồn tại
 *       500:
 *         description: Lỗi server
 */
router.post('/', adminCreateCategory);

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   put:
 *     tags: [Admin Categories]
 *     summary: Cập nhật thể loại
 *     description: Cập nhật tên của một thể loại sách
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *         description: ID thể loại
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryName
 *             properties:
 *               categoryName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: Tên thể loại mới
 *                 example: "Tiểu thuyết lịch sử"
 *     responses:
 *       200:
 *         description: Cập nhật thể loại thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cập nhật thể loại thành công"
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa xác thực (thiếu token hoặc token không hợp lệ)
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy thể loại
 *       409:
 *         description: Tên thể loại đã tồn tại
 *       500:
 *         description: Lỗi server
 */
router.put('/:id', adminUpdateCategory);

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   delete:
 *     tags: [Admin Categories]
 *     summary: Xóa thể loại
 *     description: Xóa một thể loại sách. Các sách thuộc thể loại này sẽ được xóa khỏi thể loại nhưng không bị xóa khỏi DB
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *         description: ID thể loại
 *     responses:
 *       200:
 *         description: Xóa thể loại thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Xóa thể loại thành công"
 *       401:
 *         description: Chưa xác thực (thiếu token hoặc token không hợp lệ)
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy thể loại
 *       500:
 *         description: Lỗi server
 */
router.delete('/:id', adminDeleteCategory);

export default router;
