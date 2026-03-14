import express from 'express';
import {
	adminGetUsers,
	adminGetUserById,
	adminCreateUser,
	adminUpdateUser,
	adminDeleteUser,
	adminToggleUserActive,
	adminUpdateUserRole,
} from '../controllers/adminUserController.js';

const router = express.Router();

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags: [Admin Users]
 *     summary: Lấy danh sách người dùng
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
 *         description: Từ khóa tìm kiếm (tên hoặc email)
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *         description: Lọc theo vai trò
 *     responses:
 *       200:
 *         description: Danh sách người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       full_name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                       date_of_birth:
 *                         type: string
 *                         format: date
 *                       phone_number:
 *                         type: string
 *                       image_url:
 *                         type: string
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
router.get('/', adminGetUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     tags: [Admin Users]
 *     summary: Lấy chi tiết người dùng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID người dùng
 *     responses:
 *       200:
 *         description: Chi tiết người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 full_name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                 date_of_birth:
 *                   type: string
 *                   format: date
 *                 phone_number:
 *                   type: string
 *                 image_url:
 *                   type: string
 *       401:
 *         description: Chưa xác thực
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy người dùng
 */
router.get('/:id', adminGetUserById);

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     tags: [Admin Users]
 *     summary: Tạo người dùng mới
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
 *                 description: Họ và tên
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Mật khẩu
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 default: user
 *                 description: Vai trò
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 description: Ngày sinh
 *               phone_number:
 *                 type: string
 *                 description: Số điện thoại
 *               image_url:
 *                 type: string
 *                 description: URL ảnh đại diện
 *     responses:
 *       201:
 *         description: Người dùng đã được tạo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa xác thực
 *       403:
 *         description: Không có quyền admin
 *       409:
 *         description: Email đã tồn tại
 */
router.post('/', adminCreateUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     tags: [Admin Users]
 *     summary: Cập nhật thông tin người dùng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID người dùng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 description: Họ và tên
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 description: Vai trò
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 description: Ngày sinh
 *               phone_number:
 *                 type: string
 *                 description: Số điện thoại
 *               image_url:
 *                 type: string
 *                 description: URL ảnh đại diện
 *     responses:
 *       200:
 *         description: Người dùng đã được cập nhật
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
 *         description: Không tìm thấy người dùng
 *       409:
 *         description: Email đã tồn tại
 */
router.put('/:id', adminUpdateUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     tags: [Admin Users]
 *     summary: Xóa người dùng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID người dùng
 *     responses:
 *       200:
 *         description: Người dùng đã được xóa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Chưa xác thực
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy người dùng
 */
router.delete('/:id', adminDeleteUser);

/**
 * @swagger
 * /api/admin/users/{id}/toggle-active:
 *   patch:
 *     tags: [Admin Users]
 *     summary: Chuyển đổi trạng thái active/inactive của người dùng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID người dùng
 *     responses:
 *       200:
 *         description: Trạng thái đã được chuyển đổi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Chưa xác thực
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy người dùng
 */
router.patch('/:id/toggle-active', adminToggleUserActive);

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   patch:
 *     tags: [Admin Users]
 *     summary: Cập nhật vai trò của người dùng
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID người dùng
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
 *                 enum: [user, admin]
 *                 description: Vai trò mới
 *     responses:
 *       200:
 *         description: Vai trò đã được cập nhật
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
 *         description: Không tìm thấy người dùng
 */
router.patch('/:id/role', adminUpdateUserRole);

export default router;
