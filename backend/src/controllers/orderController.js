import OrderModel from '../models/orderModel.js';
import CartModel from '../models/cartModel.js';
import BookModel from '../models/bookModel.js';
import jwt from 'jsonwebtoken';

function getTokenUserId(token) {
    if (!token) return null;
    try {
        const bearerToken = token.replace(/^Bearer\s+/i, '');
        const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
        return decoded.id;
    } catch (e) {
        console.error('Token decode error:', e.message);
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

        const { items, delivery_address } = request.body;

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

        // Calculate total_amount from items and book prices
        let total_amount = 0;
        const itemsWithPrices = [];

        for (const item of items) {
            if (!item.book_id || !item.quantity || item.quantity <= 0) {
                return response.status(400).json({
                    success: false,
                    message: 'Dữ liệu items không hợp lệ (book_id, quantity bắt buộc)'
                });
            }

            // Get book price from database
            const book = await BookModel.getBookById(item.book_id);
            if (!book) {
                return response.status(404).json({
                    success: false,
                    message: `Sách với ID ${item.book_id} không tồn tại`
                });
            }

            const itemTotal = book.price * item.quantity;
            total_amount += itemTotal;

            itemsWithPrices.push({
                book_id: item.book_id,
                quantity: item.quantity,
                price: book.price
            });
        }

        // Create order
        const orderId = await OrderModel.createOrder(userId, total_amount, delivery_address);

        // Add order details
        for (const item of itemsWithPrices) {
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
