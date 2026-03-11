import express from 'express';
import { 
    createOrder, 
    getUserOrders, 
    getOrderDetails, 
    updateOrderStatus 
} from '../controllers/orderController.js';

const orderRouter = express.Router();

// POST /api/orders - Tạo đơn hàng
orderRouter.post('/', createOrder);

// GET /api/orders - Lấy danh sách đơn hàng của user
orderRouter.get('/', getUserOrders);

// GET /api/orders/:order_id - Lấy chi tiết đơn hàng
orderRouter.get('/:order_id', getOrderDetails);

// PUT /api/orders/:order_id/status - Cập nhật trạng thái đơn hàng
orderRouter.put('/:order_id/status', updateOrderStatus);

export default orderRouter;
