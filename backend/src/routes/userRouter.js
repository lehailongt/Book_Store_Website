// src/routes/userRouter.js
import express from 'express';
import UserController from '../controllers/userController.js';

const router = express.Router();

/**
 * @swagger
 * /api/register:
 *   post:
 *     tags: [Users]
 *     summary: Đăng ký tài khoản
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
router.post('/register', UserController.register);

/**
 * @swagger
 * /api/login:
 *   post:
 *     tags: [Users]
 *     summary: Đăng nhập
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
router.post('/login', UserController.login);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Cập nhật thông tin người dùng
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
router.put('/:id', UserController.updateUser);

export default router;
