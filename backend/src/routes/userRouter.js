// src/routes/userRouter.js
import express from 'express';
import UserController from '../controllers/userController.js';

const router = express.Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
// Thêm route để cập nhật thông tin người dùng
router.put('/users/:id', UserController.updateUser);

export default router;
