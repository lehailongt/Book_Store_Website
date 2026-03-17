import pool from '../config/database.js';

class CartModel {
    // Lấy giỏ hàng của user
    static async getCart(userId) {
        try {
            const [items] = await pool.query(`
                SELECT 
                    ci.cart_item_id,
                    ci.user_id,
                    ci.book_id,
                    ci.quantity,
                    b.book_name as name,
                    b.author_name as author,
                    b.price,
                    b.image_url,
                    b.description,
                    GROUP_CONCAT(c.category_name) as categories
                FROM cartitems ci
                JOIN books b ON ci.book_id = b.book_id
                LEFT JOIN bookcategories bc ON b.book_id = bc.book_id
                LEFT JOIN categories c ON bc.category_id = c.category_id
                WHERE ci.user_id = ?
                GROUP BY ci.cart_item_id, ci.user_id, ci.book_id, ci.quantity, b.book_name, b.author_name, b.price, b.image_url, b.description
                ORDER BY ci.cart_item_id DESC
            `, [userId]);
            
            return items.map(item => ({
                ...item,
                categories: item.categories 
                    ? item.categories.split(',').map(cat => ({ name: cat.trim() }))
                    : []
            }));
        } catch (error) {
            console.error('Error getting cart:', error);
            throw error;
        }
    }

    // Thêm hoặc cập nhật item trong giỏ hàng
    static async addToCart(userId, bookId, quantity) {
        try {
            const normalizedUserId = Number(userId);
            const normalizedBookId = Number(bookId);
            const normalizedQuantity = Number(quantity);

            const [existing] = await pool.query(
                'SELECT * FROM cartitems WHERE user_id = ? AND book_id = ?',
                [normalizedUserId, normalizedBookId]
            );

            if (existing.length > 0) {
                // Cập nhật số lượng nếu sách đã có trong giỏ
                const newQuantity = existing[0].quantity + normalizedQuantity;
                await pool.query(
                    'UPDATE cartitems SET quantity = ? WHERE user_id = ? AND book_id = ?',
                    [newQuantity, normalizedUserId, normalizedBookId]
                );
            } else {
                // Thêm item mới vào giỏ
                await pool.query(
                    'INSERT INTO cartitems (user_id, book_id, quantity) VALUES (?, ?, ?)',
                    [normalizedUserId, normalizedBookId, normalizedQuantity]
                );
            }
            return true;
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    }

    // Cập nhật số lượng item
    static async updateQuantity(userId, bookId, quantity) {
        try {
            const normalizedUserId = Number(userId);
            const normalizedBookId = Number(bookId);
            const normalizedQuantity = Number(quantity);

            if (normalizedQuantity <= 0) {
                return this.removeFromCart(userId, bookId);
            }
            await pool.query(
                'UPDATE cartitems SET quantity = ? WHERE user_id = ? AND book_id = ?',
                [normalizedQuantity, normalizedUserId, normalizedBookId]
            );
            return true;
        } catch (error) {
            console.error('Error updating cart quantity:', error);
            throw error;
        }
    }

    // Xóa item khỏi giỏ
    static async removeFromCart(userId, bookId) {
        try {
            const normalizedUserId = Number(userId);
            const normalizedBookId = Number(bookId);
            await pool.query(
                'DELETE FROM cartitems WHERE user_id = ? AND book_id = ?',
                [normalizedUserId, normalizedBookId]
            );
            return true;
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw error;
        }
    }

    // Xóa toàn bộ giỏ hàng
    static async clearCart(userId) {
        try {
            await pool.query('DELETE FROM cartitems WHERE user_id = ?', [userId]);
            return true;
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw error;
        }
    }

    // Lấy tổng số lượng items trong giỏ
    static async getCartCount(userId) {
        try {
            const [result] = await pool.query(
                'SELECT SUM(quantity) as total FROM cartitems WHERE user_id = ?',
                [userId]
            );
            return result[0]?.total || 0;
        } catch (error) {
            console.error('Error getting cart count:', error);
            throw error;
        }
    }
}

export default CartModel;
