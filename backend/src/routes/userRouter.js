// src/routes/userRouter.js
import express from 'express';
import UserController from '../controllers/userController.js';

const router = express.Router();

/**
 * @swagger
 * /api/register:
 *   post:
 *     tags: [User]
 *     summary: Đăng ký tài khoản mới
 *     description: Tạo một tài khoản khách hàng mới. Role mặc định sẽ là 'customer'
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
 *                 example: "Trần Văn A"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Địa chỉ email (bắt buộc, duy nhất)
 *                 example: "tranvana@gmail.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Mật khẩu (bắt buộc, tối thiểu 6 ký tự)
 *                 example: "password123"
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 description: Ngày sinh (tùy chọn, YYYY-MM-DD)
 *                 example: "1990-03-15"
 *               phone_number:
 *                 type: string
 *                 description: Số điện thoại (tùy chọn)
 *                 example: "0912345678"
 *     responses:
 *       201:
 *         description: Đăng ký thành công
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
 *                   example: "Đăng ký thành công"
 *                 token:
 *                   type: string
 *                   description: JWT token để xác thực (base64url)
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                       example: 5
 *                     full_name:
 *                       type: string
 *                       example: "Trần Văn A"
 *                     email:
 *                       type: string
 *                       example: "tranvana@gmail.com"
 *                     role:
 *                       type: string
 *                       enum: [customer, admin]
 *                       description: Vai trò (customer hoặc admin)
 *                       example: "customer"
 *       400:
 *         description: Dữ liệu không hợp lệ (email sai format, password < 6 ký tự, etc)
 *       409:
 *         description: Email đã tồn tại
 *       500:
 *         description: Lỗi server
 */
router.post('/register', UserController.register);

/**
 * @swagger
 * /api/login:
 *   post:
 *     tags: [User]
 *     summary: Đăng nhập
 *     description: Đăng nhập bằng email và mật khẩu, nhận lại token để xác thực các API khác
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Địa chỉ email
 *                 example: "tranvana@gmail.com"
 *               password:
 *                 type: string
 *                 description: Mật khẩu
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
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
 *                   example: "Đăng nhập thành công"
 *                 token:
 *                   type: string
 *                   description: JWT token để xác thực (base64url, gửi kèm Authorization header)
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     full_name:
 *                       type: string
 *                       example: "Trần Văn A"
 *                     email:
 *                       type: string
 *                       example: "tran.van.a@gmail.com"
 *                     role:
 *                       type: string
 *                       enum: [customer, admin]
 *                       description: Vai trò (customer cho người dùng thường, admin cho quản lý)
 *                       example: "customer"
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Email hoặc mật khẩu không chính xác
 *       500:
 *         description: Lỗi server
 */
router.post('/login', UserController.login);

export default router;
