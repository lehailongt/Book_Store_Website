import pool from '../config/database.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BOOK_IMAGES_DIR = path.join(__dirname, '../../../frontend/images/books');

const _bookImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(BOOK_IMAGES_DIR)) fs.mkdirSync(BOOK_IMAGES_DIR, { recursive: true });
    cb(null, BOOK_IMAGES_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.params.id}.png`);
  }
});

const _uploadBookImage = multer({
  storage: _bookImageStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Chỉ chấp nhận file ảnh'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('image');

function toNumber(v, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
}

export async function adminGetBooks(req, res) {
  try {
    const page = toNumber(req.query.page, 1);
    const limit = toNumber(req.query.limit, 100);
    const offset = (page - 1) * limit;
    const keyword = (req.query.keyword || '').trim();
    const categoryFilter = (req.query.category || '').trim().toLowerCase();
    const sortBy = (req.query.sortBy || 'book_id').toLowerCase(); // book_id, price, publish_date
    const sortOrder = (req.query.sortOrder || 'ASC').toUpperCase(); // ASC or DESC

    // Validate sort columns
    const allowedSortColumns = ['book_id', 'price', 'publish_date', 'book_name', 'author_name'];
    const finalSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'book_id';
    const finalSortOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const where = [];
    const params = [];

    if (keyword) {
      where.push('(b.book_name LIKE ? OR b.author_name LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    let query = `
      SELECT DISTINCT
        b.book_id,
        b.book_name AS name,
        b.author_name AS author,
        b.price,
        b.description,
        b.publish_date,
        b.image_url,
        GROUP_CONCAT(c.category_name SEPARATOR ', ') AS categories
      FROM books b
      LEFT JOIN bookcategories bc ON b.book_id = bc.book_id
      LEFT JOIN categories c ON bc.category_id = c.category_id
    `;

    if (where.length > 0) {
      query += ' WHERE ' + where.join(' AND ');
    }

    query += ` GROUP BY b.book_id ORDER BY b.${finalSortBy} ${finalSortOrder} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(DISTINCT b.book_id) AS total FROM books b';
    if (where.length > 0) {
      countQuery += ' WHERE ' + where.join(' AND ');
    }
    const [countResult] = await pool.query(countQuery, params.slice(0, -2));
    const total = countResult[0]?.total || 0;

    res.json({
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      sort: {
        sortBy: finalSortBy,
        sortOrder: finalSortOrder
      }
    });
  } catch (err) {
    console.error('Error in adminGetBooks:', err);
    res.status(500).json({ message: 'Lỗi tải danh sách sách', error: err.message });
  }
}

export async function adminCreateBook(req, res) {
  try {
    const { bookName, authorName, price, description, publishDate, imageUrl, categories } = req.body;
    if (!bookName || !authorName || price == null) {
      return res.status(400).json({ message: 'Thiếu thông tin sách bắt buộc (tên sách, tác giả, giá)' });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
      const [result] = await connection.query(
        'INSERT INTO books (book_name, author_name, price, description, publish_date, image_url) VALUES (?, ?, ?, ?, ?, ?)',
        [bookName, authorName, price, description || null, publishDate || null, imageUrl || null]
      );
      const newBookId = result.insertId;

      if (Array.isArray(categories) && categories.length > 0) {
        for (const catName of categories) {
          const [catRows] = await connection.query('SELECT category_id FROM categories WHERE category_name = ?', [catName]);
          let catId;
          if (catRows.length > 0) {
            catId = catRows[0].category_id;
          } else {
            const [ins] = await connection.query('INSERT INTO categories (category_name) VALUES (?)', [catName]);
            catId = ins.insertId;
          }
          await connection.query('INSERT INTO bookcategories (book_id, category_id) VALUES (?, ?)', [newBookId, catId]);
        }
      }

      await connection.commit();
      connection.release();
      res.status(201).json({ message: 'Thêm sách thành công', bookId: newBookId });
    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi thêm sách' });
  }
}

export async function adminUpdateBook(req, res) {
  try {
    const id = req.params.id;
    const { bookName, authorName, price, description, publishDate, imageUrl, categories } = req.body;
    if (!bookName || !authorName || price == null) {
      return res.status(400).json({ message: 'Thiếu thông tin sách bắt buộc (tên sách, tác giả, giá)' });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();
    try {
      const [r] = await connection.query(
        'UPDATE books SET book_name = ?, author_name = ?, price = ?, description = ?, publish_date = ?, image_url = ? WHERE book_id = ?',
        [bookName, authorName, price, description || null, publishDate || null, imageUrl || null, id]
      );

      if (!r.affectedRows) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ message: 'Không tìm thấy sách' });
      }

      // Update categories
      await connection.query('DELETE FROM bookcategories WHERE book_id = ?', [id]);
      if (Array.isArray(categories) && categories.length > 0) {
        for (const catName of categories) {
          const [catRows] = await connection.query('SELECT category_id FROM categories WHERE category_name = ?', [catName]);
          let catId;
          if (catRows.length > 0) {
            catId = catRows[0].category_id;
          } else {
            const [ins] = await connection.query('INSERT INTO categories (category_name) VALUES (?)', [catName]);
            catId = ins.insertId;
          }
          await connection.query('INSERT INTO bookcategories (book_id, category_id) VALUES (?, ?)', [id, catId]);
        }
      }

      await connection.commit();
      connection.release();
      res.json({ message: 'Cập nhật sách thành công' });
    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi cập nhật sách' });
  }
}

export async function adminDeleteBook(req, res) {
  try {
    const id = req.params.id;

    // Check if book is referenced in orders or carts
    const [orderCheck] = await pool.query('SELECT COUNT(*) as count FROM orderdetails WHERE book_id = ?', [id]);
    const [cartCheck] = await pool.query('SELECT COUNT(*) as count FROM cartitems WHERE book_id = ?', [id]);

    if (orderCheck[0].count > 0 || cartCheck[0].count > 0) {
      return res.status(400).json({ message: 'Không thể xóa sách đang được sử dụng trong đơn hàng hoặc giỏ hàng' });
    }

    const [result] = await pool.query('DELETE FROM books WHERE book_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }

    res.json({ message: 'Xóa sách thành công' });
  } catch (err) {
    console.error('Error in adminDeleteBook:', err);
    res.status(500).json({ message: 'Lỗi xóa sách' });
  }
}

export async function adminGetCategories(req, res) {
  try {
    const [rows] = await pool.query('SELECT category_id, category_name AS name, description FROM categories ORDER BY category_name');
    res.json({ categories: rows });
  } catch (err) {
    console.error('Error in adminGetCategories:', err);
    res.status(500).json({ message: 'Lỗi tải danh sách thể loại' });
  }
}

export async function adminUploadBookImage(req, res) {
  try {
    const { id } = req.params;

    // Check if book exists
    const [bookCheck] = await pool.query('SELECT book_id FROM books WHERE book_id = ?', [id]);
    if (bookCheck.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sách' });
    }

    _uploadBookImage(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ message: err.message || 'Lỗi upload ảnh' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'Không có file được upload' });
      }

      const imageUrl = `/images/books/${req.file.filename}`;
      await pool.query('UPDATE books SET image_url = ? WHERE book_id = ?', [imageUrl, id]);

      res.json({
        message: 'Upload ảnh thành công',
        image_url: imageUrl
      });
    });
  } catch (err) {
    console.error('Error in adminUploadBookImage:', err);
    res.status(500).json({ message: 'Lỗi upload ảnh' });
  }
}