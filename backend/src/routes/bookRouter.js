import express from 'express';
import { 
    getAllBooks, 
    getAllCategories,
    getBooksByCategory,
    getBookById,
    getPopularBooks,
    createBook, 
    updateBook, 
    deleteBook 
} from '../controllers/bookController.js';

const router = express.Router();

// Lấy tất cả thể loại (đặt trước để không bị confuse với /:id)
router.get("/categories/all", getAllCategories);

// Lấy sách phổ biến (đặt trước /:id)
router.get("/popular", getPopularBooks);

// Lấy sách theo thể loại
router.get("/category/:categoryName", getBooksByCategory);

// Lấy sách theo ID
router.get("/:id", getBookById);

// Lấy tất cả sách
router.get("/", getAllBooks);

// Tạo sách mới
router.post("/", createBook);

// Cập nhật sách
router.put("/:id", updateBook);

// Xóa sách
router.delete("/:id", deleteBook);

export default router;