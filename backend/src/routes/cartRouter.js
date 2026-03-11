import express from 'express';
import {
    getCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartCount
} from '../controllers/cartController.js';

const router = express.Router();

// Lấy số lượng items (specific route first)
router.get('/count', getCartCount);

// Lấy giỏ hàng
router.get('/', getCart);

// Thêm vào giỏ hàng
router.post('/', addToCart);

// Cập nhật số lượng
router.put('/update', updateQuantity);

// Xóa item (specific route before general)
router.delete('/:book_id', removeFromCart);

// Xóa toàn bộ (general route last)
router.delete('/', clearCart);

export default router;
