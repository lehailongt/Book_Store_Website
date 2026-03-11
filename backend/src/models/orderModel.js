import pool from '../config/database.js';

export class OrderModel {
    // Tạo đơn hàng mới
    static async createOrder(userId, totalAmount, deliveryAddress) {
        try {
            const [result] = await pool.query(
                'INSERT INTO orders (user_id, total_amount, delivery_address, status) VALUES (?, ?, ?, ?)',
                [userId, totalAmount, deliveryAddress, 'shipped']
            );
            return result.insertId;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    // Thêm chi tiết đơn hàng
    static async addOrderDetail(orderId, bookId, quantity, price) {
        try {
            await pool.query(
                'INSERT INTO orderdetails (order_id, book_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, bookId, quantity, price]
            );
            return true;
        } catch (error) {
            console.error('Error adding order detail:', error);
            throw error;
        }
    }

    // Lấy đơn hàng của user
    static async getUserOrders(userId) {
        try {
            const [orders] = await pool.query(`
                SELECT 
                    o.order_id,
                    o.user_id,
                    o.total_amount,
                    o.status,
                    o.delivery_address,
                    o.created_at
                FROM orders o
                WHERE o.user_id = ?
                ORDER BY o.created_at DESC
            `, [userId]);
            return orders;
        } catch (error) {
            console.error('Error getting user orders:', error);
            throw error;
        }
    }

    // Lấy chi tiết đơn hàng
    static async getOrderDetails(orderId) {
        try {
            const [details] = await pool.query(`
                SELECT 
                    od.order_detail_id as id,
                    od.order_id,
                    od.book_id,
                    od.quantity,
                    od.price,
                    b.book_name as name,
                    b.author_name as author,
                    b.image_url
                FROM orderdetails od
                JOIN books b ON od.book_id = b.book_id
                WHERE od.order_id = ?
            `, [orderId]);
            return details;
        } catch (error) {
            console.error('Error getting order details:', error);
            throw error;
        }
    }

    // Cập nhật trạng thái đơn hàng
    static async updateOrderStatus(orderId, status) {
        try {
            await pool.query(
                'UPDATE orders SET status = ? WHERE order_id = ?',
                [status, orderId]
            );
            return true;
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }
}

export default OrderModel;
