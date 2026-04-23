import pool from '../config/database.js';

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
      SELECT 
        b.book_id,
        b.book_name AS name,
        b.author_name AS author,
        b.price,
        b.description,
        b.publish_date,
        b.image_url,
        JSON_ARRAYAGG(JSON_OBJECT('id', bc.category_id, 'name', c.category_name)) AS categoryList
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

    // Clean up categoryList - remove null entries
    rows.forEach(row => {
      if (row.categoryList && Array.isArray(row.categoryList)) {
        row.categoryList = row.categoryList.filter(cat => cat && cat.id && cat.name);
      } else {
        row.categoryList = [];
      }
    });

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
        for (const catId of categories) {
          const catIdNum = parseInt(catId);
          if (Number.isFinite(catIdNum) && catIdNum > 0) {
            await connection.query('INSERT INTO bookcategories (book_id, category_id) VALUES (?, ?)', [newBookId, catIdNum]);
          }
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
        for (const catId of categories) {
          const catIdNum = parseInt(catId);
          if (Number.isFinite(catIdNum) && catIdNum > 0) {
            await connection.query('INSERT INTO bookcategories (book_id, category_id) VALUES (?, ?)', [id, catIdNum]);
          }
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
    const [rows] = await pool.query('SELECT category_id, category_name AS name FROM categories ORDER BY category_name');
    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    console.error('Error in adminGetCategories:', err);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi tải danh sách thể loại' 
    });
  }
}

export async function adminGetBookById(req, res) {
  try {
    const id = req.params.id;
    
    // Get book info
    const [bookRows] = await pool.query(`
      SELECT 
        b.book_id,
        b.book_name AS name,
        b.author_name AS author,
        b.price,
        b.description,
        b.publish_date,
        b.image_url
      FROM books b
      WHERE b.book_id = ?
    `, [id]);
    
    if (bookRows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy sách' 
      });
    }
    
    const book = bookRows[0];
    
    // Get categories for this book
    const [catRows] = await pool.query(`
      SELECT bc.category_id AS id, c.category_name AS name
      FROM bookcategories bc
      JOIN categories c ON bc.category_id = c.category_id
      WHERE bc.book_id = ?
    `, [id]);
    
    book.categoryList = catRows || [];
    
    res.json({
      success: true,
      data: book
    });
  } catch (err) {
    console.error('Error in adminGetBookById:', err);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi tải chi tiết sách' 
    });
  }
}

export async function adminUploadBookImage(req, res) {
  try {
    const { bookId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file được upload' });
    }
    
    if (!bookId) {
      return res.status(400).json({ message: 'Thiếu bookId' });
    }

    const fs = await import('fs').then(m => m.promises);
    const path = await import('path');
    const uploadDir = path.join(path.dirname(req.file.path), '..');
    
    // Rename file to {bookId}.png
    const oldPath = req.file.path;
    const newFilename = `${bookId}.png`;
    const newPath = path.join(path.dirname(oldPath), newFilename);
    
    // Remove old file if exists
    try {
      await fs.unlink(newPath);
    } catch (e) {
      // File doesn't exist, that's fine
    }
    
    // Rename the uploaded file
    await fs.rename(oldPath, newPath);
    
    const imageUrl = `images/books/${newFilename}`;
    
    res.json({ 
      message: 'Upload ảnh sách thành công',
      imageUrl 
    });
  } catch (err) {
    console.error('Error in adminUploadBookImage:', err);
    res.status(500).json({ message: 'Lỗi upload ảnh sách: ' + err.message });
  }
}