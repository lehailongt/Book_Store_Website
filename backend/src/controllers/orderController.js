import OrderModel from '../models/orderModel.js';
import CartModel from '../models/cartModel.js';

function getTokenUserId(token) {
    if (!token) return null;
    try {
        const decoded = Buffer.from(token.replace('Bearer ', ''), 'base64').toString('utf-8');
        const parsed = JSON.parse(decoded);
        return parsed.id;
    } catch (e) {
        return null;
    }
}

// Tạo đơn hàng
export const createOrder = async (request, response) => {
    try {
        const token = request.headers.authorization;
        const userId = getTokenUserId(token);

        if (!userId) {
            return response.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập'
            });
        }

        const { items, delivery_address, total_amount } = request.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return response.status(400).json({
                success: false,
                message: 'Giỏ hàng trống'
            });
        }

        if (!delivery_address) {
            return response.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp địa chỉ giao hàng'
            });
        }

        // Create order
        const orderId = await OrderModel.createOrder(userId, total_amount, delivery_address);

        // Add order details
        for (const item of items) {
            await OrderModel.addOrderDetail(orderId, item.book_id, item.quantity, item.price);
        }

        // Clear cart
        await CartModel.clearCart(userId);

        response.status(201).json({
            success: true,
            message: 'Tạo đơn hàng thành công',
            data: { order_id: orderId }
        });
    } catch (error) {
        console.error('Error in createOrder:', error);
        response.status(500).json({
            success: false,
            message: 'Lỗi khi tạo đơn hàng',
            error: error.message
        });
    }
};

// Lấy đơn hàng của user
export const getUserOrders = async (request, response) => {
    try {
        const token = request.headers.authorization;
        const userId = getTokenUserId(token);

        if (!userId) {
            return response.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập'
            });
        }

        const orders = await OrderModel.getUserOrders(userId);
        response.status(200).json({
            success: true,
            message: 'Lấy danh sách đơn hàng thành công',
            data: orders
        });
    } catch (error) {
        console.error('Error in getUserOrders:', error);
        response.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách đơn hàng',
            error: error.message
        });
    }
};

// Lấy chi tiết đơn hàng
export const getOrderDetails = async (request, response) => {
    try {
        const token = request.headers.authorization;
        const userId = getTokenUserId(token);

        if (!userId) {
            return response.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập'
            });
        }

        const { order_id } = request.params;

        if (!order_id) {
            return response.status(400).json({
                success: false,
                message: 'Vui lòng nhập order_id'
            });
        }

        const details = await OrderModel.getOrderDetails(order_id);
        response.status(200).json({
            success: true,
            message: 'Lấy chi tiết đơn hàng thành công',
            data: {
                order_details: details
            }
        });
    } catch (error) {
        console.error('Error in getOrderDetails:', error);
        response.status(500).json({
            success: false,
            message: 'Lỗi khi lấy chi tiết đơn hàng',
            error: error.message
        });
    }
};

// Cập nhật trạng thái đơn hàng (admin only)
export const updateOrderStatus = async (request, response) => {
    try {
        const token = request.headers.authorization;
        const userId = getTokenUserId(token);

        if (!userId) {
            return response.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập'
            });
        }

        const { order_id } = request.params;
        const { status } = request.body;

        if (!order_id || !status) {
            return response.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp order_id và status'
            });
        }

        await OrderModel.updateOrderStatus(order_id, status);
        response.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái đơn hàng thành công'
        });
    } catch (error) {
        console.error('Error in updateOrderStatus:', error);
        response.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật trạng thái đơn hàng',
            error: error.message
        });
    }
};
