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

// Lấy giỏ hàng của user hiện tại
export const getCart = async (request, response) => {
    try {
        const token = request.headers.authorization;
        const userId = getTokenUserId(token);

        if (!userId) {
            return response.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập'
            });
        }

        const items = await CartModel.getCart(userId);
        response.status(200).json({
            success: true,
            message: 'Lấy giỏ hàng thành công',
            data: items,
            count: items.length
        });
    } catch (error) {
        console.error('Error in getCart:', error);
        response.status(500).json({
            success: false,
            message: 'Lỗi khi lấy giỏ hàng',
            error: error.message
        });
    }
};

// Thêm sách vào giỏ hàng
export const addToCart = async (request, response) => {
    try {
        const token = request.headers.authorization;
        const userId = getTokenUserId(token);

        if (!userId) {
            return response.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập'
            });
        }

        const { book_id, quantity = 1 } = request.body;
        const normalizedBookId = Number(book_id);
        const normalizedQuantity = Number(quantity);

        if (!Number.isInteger(normalizedBookId) || normalizedBookId <= 0) {
            return response.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp book_id'
            });
        }

        if (!Number.isInteger(normalizedQuantity) || normalizedQuantity <= 0) {
            return response.status(400).json({
                success: false,
                message: 'Số lượng không hợp lệ'
            });
        }

        await CartModel.addToCart(userId, normalizedBookId, normalizedQuantity);
        response.status(200).json({
            success: true,
            message: 'Thêm vào giỏ hàng thành công'
        });
    } catch (error) {
        console.error('Error in addToCart:', error);
        response.status(500).json({
            success: false,
            message: 'Lỗi khi thêm vào giỏ hàng',
            error: error.message
        });
    }
};

// Cập nhật số lượng
export const updateQuantity = async (request, response) => {
    try {
        const token = request.headers.authorization;
        const userId = getTokenUserId(token);

        if (!userId) {
            return response.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập'
            });
        }

        const { book_id, quantity } = request.body;
        const normalizedBookId = Number(book_id);
        const normalizedQuantity = Number(quantity);

        if (!Number.isInteger(normalizedBookId) || normalizedBookId <= 0 || quantity === undefined) {
            return response.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp book_id và quantity'
            });
        }

        if (!Number.isInteger(normalizedQuantity) || normalizedQuantity < 0) {
            return response.status(400).json({
                success: false,
                message: 'Số lượng không hợp lệ'
            });
        }

        await CartModel.updateQuantity(userId, normalizedBookId, normalizedQuantity);
        response.status(200).json({
            success: true,
            message: 'Cập nhật số lượng thành công'
        });
    } catch (error) {
        console.error('Error in updateQuantity:', error);
        response.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật số lượng',
            error: error.message
        });
    }
};

// Xóa sách khỏi giỏ hàng
export const removeFromCart = async (request, response) => {
    try {
        const token = request.headers.authorization;
        const userId = getTokenUserId(token);
        
        console.log('Delete request - Token:', token);
        console.log('Delete request - UserId:', userId);

        if (!userId) {
            return response.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập'
            });
        }

        const { book_id } = request.params;
        const normalizedBookId = Number(book_id);
        console.log('Delete request - Book ID:', book_id);

        if (!Number.isInteger(normalizedBookId) || normalizedBookId <= 0) {
            return response.status(400).json({
                success: false,
                message: 'book_id không hợp lệ'
            });
        }

        await CartModel.removeFromCart(userId, normalizedBookId);
        console.log('Successfully deleted book:', normalizedBookId, 'for user:', userId);
        
        response.status(200).json({
            success: true,
            message: 'Xóa khỏi giỏ hàng thành công'
        });
    } catch (error) {
        console.error('Error in removeFromCart:', error);
        response.status(500).json({
            success: false,
            message: 'Lỗi khi xóa khỏi giỏ hàng',
            error: error.message
        });
    }
};

// Xóa toàn bộ giỏ hàng
export const clearCart = async (request, response) => {
    try {
        const token = request.headers.authorization;
        const userId = getTokenUserId(token);

        if (!userId) {
            return response.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập'
            });
        }

        await CartModel.clearCart(userId);
        response.status(200).json({
            success: true,
            message: 'Xóa toàn bộ giỏ hàng thành công'
        });
    } catch (error) {
        console.error('Error in clearCart:', error);
        response.status(500).json({
            success: false,
            message: 'Lỗi khi xóa giỏ hàng',
            error: error.message
        });
    }
};

// Lấy số lượng items trong giỏ
export const getCartCount = async (request, response) => {
    try {
        const token = request.headers.authorization;
        const userId = getTokenUserId(token);

        if (!userId) {
            return response.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập'
            });
        }

        const count = await CartModel.getCartCount(userId);
        response.status(200).json({
            success: true,
            data: count
        });
    } catch (error) {
        console.error('Error in getCartCount:', error);
        response.status(500).json({
            success: false,
            message: 'Lỗi khi lấy số lượng giỏ hàng',
            error: error.message
        });
    }
};
