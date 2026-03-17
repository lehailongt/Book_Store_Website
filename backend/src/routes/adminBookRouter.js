import express from 'express';
import {
	adminGetBooks,
	adminCreateBook,
	adminUpdateBook,
	adminDeleteBook,
	adminGetCategories,
} from '../controllers/adminBookController.js';

const router = express.Router();

/**
 * @swagger
 * /api/admin/books:
 *   get:
 *     tags: [Admin Books]
 *     summary: Lấy danh sách sách (có phân trang)
 *     description: Lấy danh sách sách quản lý với khả năng tìm kiếm, sắp xếp và phân trang
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
 *         description: Số sách mỗi trang
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         example: "Harry Potter"
 *         description: Từ khóa tìm kiếm theo tên sách hoặc tác giả
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [book_id, price, publish_date]
 *           default: book_id
 *         example: "price"
 *         description: Sắp xếp theo trường nào
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         example: "DESC"
 *         description: Thứ tự sắp xếp (ASC = tăng dần, DESC = giảm dần)
 *     responses:
 *       200:
 *         description: Danh sách sách lấy thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       book_id:
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
 *                         example: 15.99
 *                       description:
 *                         type: string
 *                         example: "The first book in the Harry Potter series"
 *                       publish_date:
 *                         type: string
 *                         format: date
 *                         example: "2020-10-30T17:00:00.000Z"
 *                       image_url:
 *                         type: string
 *                         example: "images/books/1.png"
 *                       categoryList:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 1
 *                             name:
 *                               type: string
 *                               example: "Văn học nước ngoài"
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
 *                       example: "price"
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
router.get('/', adminGetBooks);

/**
 * @swagger
 * /api/admin/books/categories:
 *   get:
 *     tags: [Admin Books]
 *     summary: Lấy danh sách thể loại sách
 *     description: Lấy tất cả thể loại sách để dùng trong form tạo/cập nhật sách
 *     security:
 *       - bearerAuth: []
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category_id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Văn học nước ngoài"
 *     example:
 *       value:
 *         success: true
 *         data:
 *           - category_id: 1
 *             name: "Văn học nước ngoài"
 *           - category_id: 2
 *             name: "Thiếu nhi"
 *       401:
 *         description: Chưa xác thực (thiếu token hoặc token không hợp lệ)
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 */
router.get('/categories', adminGetCategories);

/**
 * @swagger
 * /api/admin/books:
 *   post:
 *     tags: [Admin Books]
 *     summary: Tạo sách mới
 *     description: Tạo một cuốn sách mới với các thông tin cơ bản và danh sách thể loại
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookName
 *               - authorName
 *               - price
 *             properties:
 *               bookName:
 *                 type: string
 *                 minLength: 1
 *                 description: Tiêu đề sách (bắt buộc)
 *                 example: "Harry Potter and the Philosopher's Stone"
 *               authorName:
 *                 type: string
 *                 minLength: 1
 *                 description: Tác giả (bắt buộc)
 *                 example: "J.K. Rowling"
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 description: Giá sách (bắt buộc)
 *                 example: 29.99
 *               publishDate:
 *                 type: string
 *                 format: date
 *                 description: Ngày xuất bản (tùy chọn)
 *                 example: "1997-06-26"
 *               description:
 *                 type: string
 *                 description: Mô tả sách (tùy chọn)
 *                 example: "A young wizard's adventure begins at Hogwarts."
 *               imageUrl:
 *                 type: string
 *                 description: URL ảnh bìa (tùy chọn)
 *                 example: "images/books/40.png"
 *               categories:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Danh sách ID thể loại (tùy chọn)
 *                 example: [1, 2]
 *     responses:
 *       201:
 *         description: Sách đã được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Thêm sách thành công"
 *                 bookId:
 *                   type: integer
 *                   example: 31
 *       400:
 *         description: Dữ liệu không hợp lệ (tên trống, giá sai, v.v.)
 *       401:
 *         description: Chưa xác thực (thiếu token hoặc token không hợp lệ)
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 */
router.post('/', adminCreateBook);

/**
 * @swagger
 * /api/admin/books/{id}:
 *   put:
 *     tags: [Admin Books]
 *     summary: Cập nhật thông tin sách
 *     description: Cập nhật các thông tin của sách. Chỉ cần gửi các field muốn thay đổi.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *         description: ID sách cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookName:
 *                 type: string
 *                 description: Tiêu đề sách (tùy chọn)
 *                 example: "Harry Potter and the Chamber of Secrets"
 *               authorName:
 *                 type: string
 *                 description: Tác giả (tùy chọn)
 *                 example: "J.K. Rowling"
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 description: Giá sách (tùy chọn)
 *                 example: 34.99
 *               publishDate:
 *                 type: string
 *                 format: date
 *                 description: Ngày xuất bản (tùy chọn)
 *                 example: "1998-07-02"
 *               description:
 *                 type: string
 *                 description: Mô tả sách (tùy chọn)
 *                 example: "The second year at Hogwarts brings new mysteries."
 *               imageUrl:
 *                 type: string
 *                 description: URL ảnh bìa (tùy chọn)
 *                 example: "images/books/40.png"
 *               categories:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Danh sách ID thể loại (tùy chọn)
 *                 example: [1, 3]
 *     responses:
 *       200:
 *         description: Sách đã được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cập nhật sách thành công"
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc không có field nào để cập nhật
 *       401:
 *         description: Chưa xác thực (thiếu token hoặc token không hợp lệ)
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy sách với ID này
 *       500:
 *         description: Lỗi server
 */
router.put('/:id', adminUpdateBook);

/**
 * @swagger
 * /api/admin/books/{id}:
 *   delete:
 *     tags: [Admin Books]
 *     summary: Xóa sách
 *     description: Xóa một sách khỏi hệ thống. Chỉ có thể xóa sách nếu nó không được sử dụng trong bất kỳ đơn hàng hoặc giỏ hàng nào.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *         description: ID sách cần xóa
 *     responses:
 *       200:
 *         description: Sách đã được xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Xóa sách thành công"
 *       400:
 *         description: Không thể xóa sách đang được sử dụng trong đơn hàng hoặc giỏ hàng
 *       401:
 *         description: Chưa xác thực (thiếu token hoặc token không hợp lệ)
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy sách với ID này
 *       500:
 *         description: Lỗi server
 */
router.delete('/:id', adminDeleteBook);

export default router;
