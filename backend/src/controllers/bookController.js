import BookModel from '../models/bookModel.js';

// Lấy tất cả sách
export const getAllBooks = async (request, response) => {
    try {
        const books = await BookModel.getAllBooks();
        response.status(200).json({
            success: true,
            message: 'Lấy danh sách sách thành công',
            data: books
        });
    } catch (error) {
        console.error('Error in getAllBooks:', error);
        response.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách sách',
            error: error.message
        });
    }
};

// Lấy tất cả thể loại
export const getAllCategories = async (request, response) => {
    try {
        const categories = await BookModel.getAllCategories();
        response.status(200).json({
            success: true,
            message: 'Lấy danh sách thể loại thành công',
            data: categories
        });
    } catch (error) {
        console.error('Error in getAllCategories:', error);
        response.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách thể loại',
            error: error.message
        });
    }
};

// Lấy sách theo category
export const getBooksByCategory = async (request, response) => {
    try {
        const { categoryName } = request.params;
        const books = await BookModel.getBooksByCategory(categoryName);
        response.status(200).json({
            success: true,
            message: 'Lấy sách theo thể loại thành công',
            data: books
        });
    } catch (error) {
        console.error('Error in getBooksByCategory:', error);
        response.status(500).json({
            success: false,
            message: 'Lỗi khi lấy sách theo thể loại',
            error: error.message
        });
    }
};

// Lấy sách theo ID
export const getBookById = async (request, response) => {
    try {
        const { id } = request.params;
        const book = await BookModel.getBookById(id);
        if (!book) {
            return response.status(404).json({
                success: false,
                message: 'Không tìm thấy sách'
            });
        }
        response.status(200).json({
            success: true,
            message: 'Lấy thông tin sách thành công',
            data: book
        });
    } catch (error) {
        console.error('Error in getBookById:', error);
        response.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin sách',
            error: error.message
        });
    }
};

// Tạo sách mới
export const createBook = async (request, response) => {
    try {
        const { name, author, price, description, image_url, publish_date } = request.body;
        
        if (!name || !author || !price) {
            return response.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp tên sách, tác giả và giá'
            });
        }

        const bookId = await BookModel.createBook({
            name,
            author,
            price,
            description,
            image_url,
            publish_date
        });

        response.status(201).json({
            success: true,
            message: 'Tạo sách thành công',
            data: { book_id: bookId }
        });
    } catch (error) {
        console.error('Error in createBook:', error);
        response.status(500).json({
            success: false,
            message: 'Lỗi khi tạo sách',
            error: error.message
        });
    }
};

// Cập nhật sách
export const updateBook = async (request, response) => {
    try {
        const { id } = request.params;
        const { name, author, price, description, image_url, publish_date } = request.body;

        const success = await BookModel.updateBook(id, {
            name,
            author,
            price,
            description,
            image_url,
            publish_date
        });

        if (!success) {
            return response.status(404).json({
                success: false,
                message: 'Không tìm thấy sách để cập nhật'
            });
        }

        response.status(200).json({
            success: true,
            message: 'Cập nhật sách thành công'
        });
    } catch (error) {
        console.error('Error in updateBook:', error);
        response.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật sách',
            error: error.message
        });
    }
};

// Xóa sách
export const deleteBook = async (request, response) => {
    try {
        const { id } = request.params;
        const success = await BookModel.deleteBook(id);

        if (!success) {
            return response.status(404).json({
                success: false,
                message: 'Không tìm thấy sách để xóa'
            });
        }

        response.status(200).json({
            success: true,
            message: 'Xóa sách thành công'
        });
    } catch (error) {
        console.error('Error in deleteBook:', error);
        response.status(500).json({
            success: false,
            message: 'Lỗi khi xóa sách',
            error: error.message
        });
    }
};