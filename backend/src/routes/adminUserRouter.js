import express from 'express';
import {
	adminGetUsers,
	adminGetUserById,
	adminCreateUser,
	adminUpdateUser,
	adminDeleteUser,
	adminUpdateUserRole,
} from '../controllers/adminUserController.js';

const router = express.Router();

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags: [Admin Users]
 *     summary: Lấy danh sách người dùng (có phân trang)
 *     description: Lấy danh sách những người dùng với khả năng tìm kiếm theo tên/email và lọc theo vai trò
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
 *         description: Số trang (bắt đầu từ 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *         example: 10
 *         description: Số bản ghi mỗi trang
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         example: "an"
 *         description: Từ khóa tìm kiếm theo tên (full_name) hoặc email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [customer, admin]
 *         example: "customer"
 *         description: Lọc theo vai trò (customer hoặc admin)
 *     responses:
 *       200:
 *         description: Danh sách người dùng lấy thành công
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
 *                       id:
 *                         type: integer
 *                         description: ID người dùng
 *                       full_name:
 *                         type: string
 *                         description: Họ và tên
 *                       email:
 *                         type: string
 *                         description: Địa chỉ email
 *                       role:
 *                         type: string
 *                         enum: [customer, admin]
 *                         description: Vai trò người dùng (customer, admin)
 *                       date_of_birth:
 *                         type: string
 *                         format: date
 *                         description: Ngày sinh (YYYY-MM-DD)
 *                       phone_number:
 *                         type: string
 *                         description: Số điện thoại
 *                       image_url:
 *                         type: string
 *                         description: URL ảnh đại diện
 *                 total:
 *                   type: integer
 *                   description: Tổng số bản ghi
 *                 page:
 *                   type: integer
 *                   description: Số trang hiện tại
 *                 limit:
 *                   type: integer
 *                   description: Số bản ghi mỗi trang
 *       401:
 *         description: Chưa xác thực (thiếu token hoặc token không hợp lệ)
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 */
router.get('/', adminGetUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     tags: [Admin Users]
 *     summary: Lấy chi tiết một người dùng
 *     description: Lấy thông tin chi tiết của một người dùng theo ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *         description: ID người dùng
 *     responses:
 *       200:
 *         description: Chi tiết người dùng lấy thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID người dùng
 *                 full_name:
 *                   type: string
 *                   description: Họ và tên
 *                 email:
 *                   type: string
 *                   description: Địa chỉ email
 *                 role:
 *                   type: string
 *                   enum: [user, admin]
 *                   description: Vai trò (user = customer, admin = admin)
 *                 date_of_birth:
 *                   type: string
 *                   format: date
 *                   description: Ngày sinh (YYYY-MM-DD)
 *                 phone_number:
 *                   type: string
 *                   description: Số điện thoại
 *                 image_url:
 *                   type: string
 *                   description: URL ảnh đại diện
 *               example:
 *                   id: 19
 *                   full_name: Đinh Văn T
 *                   email: "dinhvant@gmail.com"
 *                   role: "customer"
 *                   date_of_birth: "1999-12-24T17:00:00.000Z"
 *                   phone_number: "0931111111"
 *                   image_url: "images/pages/anonymous.png"
 *       401:
 *         description: Chưa xác thực (thiếu token hoặc token không hợp lệ)
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy người dùng với ID này
 *       500:
 *         description: Lỗi server
 */
router.get('/:id', adminGetUserById);

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     tags: [Admin Users]
 *     summary: Tạo người dùng mới
 *     description: Tạo một tài khoản người dùng mới với thông tin cơ bản
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - email
 *               - password
 *             properties:
 *               full_name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: Họ và tên (bắt buộc)
 *                 example: "Lê Thị A"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email (bắt buộc, phải hợp lệ, duy nhất)
 *                 example: "lethia@gmail.com.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Mật khẩu (bắt buộc, tối thiểu 6 ký tự, sẽ được hash bằng bcrypt)
 *                 example: "password123"
 *               phone_number:
 *                 type: string
 *                 pattern: "^[0-9]{9,11}$"
 *                 description: Số điện thoại (tùy chọn, 9-11 chữ số)
 *                 example: "01234567890"
 *               role:
 *                 type: string
 *                 enum: [customer, admin]
 *                 default: user
 *                 description: Vai trò người dùng (mặc định là 'customer')
 *                 example: "customer"
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 description: Ngày sinh (tùy chọn, định dạng YYYY-MM-DD)
 *                 example: "2001-01-15"
 *               image_url:
 *                 type: string
 *                 description: URL ảnh đại diện (tùy chọn)
 *                 example: "images/pages/anonymous.png"
 *     responses:
 *       201:
 *         description: Tạo người dùng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID người dùng vừa tạo
 *                 message:
 *                   type: string
 *                   example: "Người dùng đã được tạo"
 *       400:
 *         description: Dữ liệu không hợp lệ (tên trống, email sai định dạng, phone không đúng, password < 6 ký tự)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email không hợp lệ"
 *       401:
 *         description: Chưa xác thực (thiếu token hoặc token không hợp lệ)
 *       403:
 *         description: Không có quyền admin
 *       409:
 *         description: Email đã tồn tại trong hệ thống
 *       500:
 *         description: Lỗi server
 */
router.post('/', adminCreateUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     tags: [Admin Users]
 *     summary: Cập nhật thông tin người dùng
 *     description: Cập nhật các thông tin của người dùng (không cập nhật mật khẩu, dùng endpoint riêng). Chỉ cần gửi các field muốn thay đổi.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *         description: ID người dùng cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: Họ và tên (tùy chọn)
 *                 example: "Jane Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email (tùy chọn, phải duy nhất và hợp lệ)
 *                 example: "jane.doe@gamil.com"
 *               role:
 *                 type: string
 *                 enum: [customer, admin]
 *                 description: Vai trò người dùng (tùy chọn, dùng /users/{id}/role để thay đổi được khuyến nghị)
 *                 example: "customer"
 *               phone_number:
 *                 type: string
 *                 pattern: "^[0-9]{9,11}$"
 *                 description: Số điện thoại (tùy chọn, 9-11 chữ số)
 *                 example: "0987654321"
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 description: Ngày sinh (tùy chọn, định dạng YYYY-MM-DD)
 *                 example: "1985-05-15"
 *               image_url:
 *                 type: string
 *                 description: URL ảnh đại diện (tùy chọn)
 *                 example: "images/pages/anonymous.png"
 *     responses:
 *       200:
 *         description: Cập nhật người dùng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Người dùng đã được cập nhật"
 *       400:
 *         description: Dữ liệu không hợp lệ (email sai format, phone không đúng, tên trống)
 *       401:
 *         description: Chưa xác thực (thiếu token hoặc token không hợp lệ)
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy người dùng với ID này
 *       409:
 *         description: Email đã tồn tại trong hệ thống
 *       500:
 *         description: Lỗi server
 */
router.put('/:id', adminUpdateUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     tags: [Admin Users]
 *     summary: Xóa người dùng
 *     description: Xóa một người dùng khỏi hệ thống. Các đơn hàng của người dùng sẽ bị xóa theo (ON DELETE CASCADE)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *         description: ID người dùng cần xóa
 *     responses:
 *       200:
 *         description: Xóa người dùng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Người dùng đã được xóa"
 *       401:
 *         description: Chưa xác thực (thiếu token hoặc token không hợp lệ)
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy người dùng với ID này
 *       500:
 *         description: Lỗi server
 */
router.delete('/:id', adminDeleteUser);

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   patch:
 *     tags: [Admin Users]
 *     summary: Cập nhật vai trò của người dùng
 *     description: Thay đổi vai trò người dùng (user ↔ admin). Endpoint này chuyên dụng cho việc cập nhật role.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *         description: ID người dùng cần cập nhật vai trò
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [customer, admin]
 *                 description: Vai trò mới (customer hoặc admin)
 *                 example: "admin"
 *     responses:
 *       200:
 *         description: Cập nhật vai trò thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vai trò đã được cập nhật"
 *       400:
 *         description: Dữ liệu không hợp lệ (thiếu role hoặc role không trong enum)
 *       401:
 *         description: Chưa xác thực (thiếu token hoặc token không hợp lệ)
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy người dùng với ID này
 *       500:
 *         description: Lỗi server
 */
router.patch('/:id/role', adminUpdateUserRole);

export default router;
