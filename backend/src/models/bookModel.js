import pool from '../config/database.js';

class BookModel {
    // Helper: Transform categories string to array
    static transformCategoriesToArray(book) {
        if (!book) return null;
        return {
            ...book,
            categories: book.categories 
                ? book.categories.split(',').map(cat => ({ name: cat.trim() }))
                : []
        };
    }

    // Lấy tất cả sách
    static async getAllBooks() {
        try {
            const [books] = await pool.query(`
                SELECT 
                    b.book_id as id,
                    b.book_name as name,
                    b.author_name as author,
                    b.price,
                    b.description,
                    b.image_url,
                    b.publish_date,
                    GROUP_CONCAT(c.category_name) as categories
                FROM books b
                LEFT JOIN bookcategories bc ON b.book_id = bc.book_id
                LEFT JOIN categories c ON bc.category_id = c.category_id
                GROUP BY b.book_id
                ORDER BY b.book_id DESC
            `);
            return books.map(book => this.transformCategoriesToArray(book));
        } catch (error) {
            console.error('Error getting all books:', error);
            throw error;
        }
    }

    // Lấy sách theo ID
    static async getBookById(bookId) {
        try {
            const [books] = await pool.query(`
                SELECT 
                    b.book_id as id,
                    b.book_name as name,
                    b.author_name as author,
                    b.price,
                    b.description,
                    b.image_url,
                    b.publish_date,
                    GROUP_CONCAT(c.category_name) as categories
                FROM books b
                LEFT JOIN bookcategories bc ON b.book_id = bc.book_id
                LEFT JOIN categories c ON bc.category_id = c.category_id
                WHERE b.book_id = ?
                GROUP BY b.book_id
            `, [bookId]);
            const book = books[0] || null;
            return book ? this.transformCategoriesToArray(book) : null;
        } catch (error) {
            console.error('Error getting book by ID:', error);
            throw error;
        }
    }

    // Lấy sách theo category
    static async getBooksByCategory(categoryName) {
        try {
            const [books] = await pool.query(`
                SELECT 
                    b.book_id as id,
                    b.book_name as name,
                    b.author_name as author,
                    b.price,
                    b.description,
                    b.image_url,
                    b.publish_date,
                    GROUP_CONCAT(c.category_name) as categories
                FROM books b
                LEFT JOIN bookcategories bc ON b.book_id = bc.book_id
                LEFT JOIN categories c ON bc.category_id = c.category_id
                WHERE FIND_IN_SET(?, GROUP_CONCAT(c.category_name)) > 0
                GROUP BY b.book_id
                ORDER BY b.book_id DESC
            `, [categoryName]);
            return books.map(book => this.transformCategoriesToArray(book));
        } catch (error) {
            console.error('Error getting books by category:', error);
            throw error;
        }
    }

    // Lấy tất cả thể loại
    static async getAllCategories() {
        try {
            const [categories] = await pool.query(`
                SELECT 
                    c.category_id as id,
                    c.category_name as name,
                    COUNT(bc.book_id) as book_count
                FROM categories c
                LEFT JOIN bookcategories bc ON c.category_id = bc.category_id
                GROUP BY c.category_id
                ORDER BY c.category_name ASC
            `);
            return categories;
        } catch (error) {
            console.error('Error getting categories:', error);
            throw error;
        }
    }

    // Thêm sách mới
    static async createBook(bookData) {
        const { name, author, price, description, image_url, publish_date } = bookData;
        try {
            const [result] = await pool.query(`
                INSERT INTO books (book_name, author_name, price, description, image_url, publish_date)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [name, author, price, description, image_url, publish_date]);
            return result.insertId;
        } catch (error) {
            console.error('Error creating book:', error);
            throw error;
        }
    }

    // Cập nhật sách
    static async updateBook(bookId, bookData) {
        const { name, author, price, description, image_url, publish_date } = bookData;
        try {
            await pool.query(`
                UPDATE books 
                SET book_name = ?, author_name = ?, price = ?, description = ?, image_url = ?, publish_date = ?
                WHERE book_id = ?
            `, [name, author, price, description, image_url, publish_date, bookId]);
            return true;
        } catch (error) {
            console.error('Error updating book:', error);
            throw error;
        }
    }

    // Xóa sách
    static async deleteBook(bookId) {
        try {
            await pool.query('DELETE FROM books WHERE book_id = ?', [bookId]);
            return true;
        } catch (error) {
            console.error('Error deleting book:', error);
            throw error;
        }
    }

    // Gán category cho sách
    static async addCategoryToBook(bookId, categoryId) {
        try {
            await pool.query(`
                INSERT IGNORE INTO bookcategories (book_id, category_id)
                VALUES (?, ?)
            `, [bookId, categoryId]);
            return true;
        } catch (error) {
            console.error('Error adding category to book:', error);
            throw error;
        }
    }

    // Xóa category khỏi sách
    static async removeCategoryFromBook(bookId, categoryId) {
        try {
            await pool.query(`
                DELETE FROM bookcategories 
                WHERE book_id = ? AND category_id = ?
            `, [bookId, categoryId]);
            return true;
        } catch (error) {
            console.error('Error removing category from book:', error);
            throw error;
        }
    }

    // Lấy sách phổ biến (top books by quantity sold - chỉ đơn hàng delivered/shipped)
    static async getPopularBooks(limit = 10) {
        try {
            const [books] = await pool.query(`
                SELECT 
                    b.book_id as id,
                    b.book_name as name,
                    b.author_name as author,
                    b.price,
                    b.description,
                    b.image_url,
                    b.publish_date,
                    COALESCE(cat.categories, '') as categories,
                    COALESCE(sales.total_sold, 0) as total_sold
                FROM books b
                LEFT JOIN (
                    SELECT 
                        bc.book_id,
                        GROUP_CONCAT(DISTINCT c.category_name ORDER BY c.category_name SEPARATOR ',') as categories
                    FROM bookcategories bc
                    INNER JOIN categories c ON bc.category_id = c.category_id
                    GROUP BY bc.book_id
                ) cat ON b.book_id = cat.book_id
                LEFT JOIN (
                    SELECT 
                        od.book_id,
                        SUM(od.quantity) as total_sold
                    FROM orderdetails od
                    INNER JOIN orders o ON od.order_id = o.order_id
                    WHERE o.status IN ('delivered', 'shipped')
                    GROUP BY od.book_id
                ) sales ON b.book_id = sales.book_id
                ORDER BY total_sold DESC, b.book_id DESC
                LIMIT ?
            `, [limit]);
            return books.map(book => this.transformCategoriesToArray(book));
        } catch (error) {
            console.error('Error getting popular books:', error);
            throw error;
        }
    }
}

export default BookModel;
