// src/routes/adminRouter.js
import express from 'express';
import adminUserRouter from './adminUserRouter.js';
import adminBookRouter from './adminBookRouter.js';
import adminCategoryRouter from './adminCategoryRouter.js';
import adminOrderRouter from './adminOrderRouter.js';
import adminMetricRouter from './adminMetricRouter.js';
import { adminAuthMiddleware } from '../middlewares/adminAuthMiddleware.js';

const router = express.Router();

// Apply admin authentication middleware to all admin routes
router.use(adminAuthMiddleware);

router.use('/users', adminUserRouter);
router.use('/books', adminBookRouter);
router.use('/categories', adminCategoryRouter);
router.use('/orders', adminOrderRouter);
router.use('/metrics', adminMetricRouter);

export default router;
