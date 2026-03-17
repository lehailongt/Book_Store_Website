import pool from '../config/database.js';

function toNumber(v, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
}

/**
 * Lấy danh sách thể loại với số lượng sách
 */
export async function adminGetCategories(req, res) {
  try {
    const page = toNumber(req.query.page, 1);
    const limit = toNumber(req.query.limit, 10);
    const offset = (page - 1) * limit;
    const keyword = (req.query.keyword || '').trim();
    const sortBy = (req.query.sortBy || 'category_name').toLowerCase();
    const sortOrder = (req.query.sortOrder || 'ASC').toUpperCase();

    // Validate sort columns
    const allowedSortColumns = ['category_id', 'category_name', 'book_count'];
    const finalSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'category_name';
    const finalSortOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const where = [];
    const params = [];

    if (keyword) {
      where.push('c.category_name LIKE ?');
      params.push(`%${keyword}%`);
    }

    let query = `
      SELECT 
        c.category_id,
        c.category_name,
        COUNT(bc.book_id) AS book_count
      FROM categories c
      LEFT JOIN bookcategories bc ON c.category_id = bc.category_id
    `;

    if (where.length > 0) {
      query += ' WHERE ' + where.join(' AND ');
    }

    query += ` GROUP BY c.category_id, c.category_name ORDER BY ${finalSortBy} ${finalSortOrder} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(DISTINCT c.category_id) AS total FROM categories c';
    if (keyword) {
      countQuery += ' WHERE c.category_name LIKE ?';
    }

    const countParams = keyword ? [`%${keyword}%`] : [];
    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    res.json({
      categories: rows,
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
    console.error('Error in adminGetCategories:', err);
    res.status(500).json({ message: 'Lỗi tải danh sách thể loại', error: err.message });
  }
}

/**
 * Tạo thể loại mới
 */
export async function adminCreateCategory(req, res) {
  try {
    const { categoryName } = req.body;

    if (!categoryName || !categoryName.trim()) {
      return res.status(400).json({ message: 'Tên thể loại không được để trống' });
    }

    const trimmedName = categoryName.trim();

    // Check if category already exists
    const [existing] = await pool.query(
      'SELECT category_id FROM categories WHERE category_name = ?',
      [trimmedName]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Thể loại này đã tồn tại' });
    }

    const [result] = await pool.query(
      'INSERT INTO categories (category_name) VALUES (?)',
      [trimmedName]
    );

    res.status(201).json({
      message: 'Thêm thể loại thành công',
      categoryId: result.insertId
    });
  } catch (err) {
    console.error('Error in adminCreateCategory:', err);
    res.status(500).json({ message: 'Lỗi thêm thể loại', error: err.message });
  }
}

/**
 * Cập nhật thể loại
 */
export async function adminUpdateCategory(req, res) {
  try {
    const categoryId = req.params.id;
    const { categoryName } = req.body;

    if (!categoryName || !categoryName.trim()) {
      return res.status(400).json({ message: 'Tên thể loại không được để trống' });
    }

    const trimmedName = categoryName.trim();

    // Check if category exists
    const [existing] = await pool.query(
      'SELECT category_id FROM categories WHERE category_id = ?',
      [categoryId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thể loại' });
    }

    // Check if new name already exists (and is not this category)
    const [duplicate] = await pool.query(
      'SELECT category_id FROM categories WHERE category_name = ? AND category_id != ?',
      [trimmedName, categoryId]
    );

    if (duplicate.length > 0) {
      return res.status(409).json({ message: 'Tên thể loại này đã tồn tại' });
    }

    await pool.query(
      'UPDATE categories SET category_name = ? WHERE category_id = ?',
      [trimmedName, categoryId]
    );

    res.json({ message: 'Cập nhật thể loại thành công' });
  } catch (err) {
    console.error('Error in adminUpdateCategory:', err);
    res.status(500).json({ message: 'Lỗi cập nhật thể loại', error: err.message });
  }
}

/**
 * Xóa thể loại
 */
export async function adminDeleteCategory(req, res) {
  try {
    const categoryId = req.params.id;

    // Check if category exists
    const [existing] = await pool.query(
      'SELECT category_id FROM categories WHERE category_id = ?',
      [categoryId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thể loại' });
    }

    // Get book count associated with this category
    const [bookCounts] = await pool.query(
      'SELECT COUNT(*) as book_count FROM bookcategories WHERE category_id = ?',
      [categoryId]
    );

    if (bookCounts[0].book_count > 0) {
      return res.status(400).json({
        message: 'Không thể xóa thể loại này vì nó còn chứa sách. Vui lòng xóa tất cả sách trước.',
        bookCount: bookCounts[0].book_count
      });
    }

    const [result] = await pool.query(
      'DELETE FROM categories WHERE category_id = ?',
      [categoryId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không thể xóa thể loại' });
    }

    res.json({ message: 'Xóa thể loại thành công' });
  } catch (err) {
    console.error('Error in adminDeleteCategory:', err);
    res.status(500).json({ message: 'Lỗi xóa thể loại', error: err.message });
  }
}

/**
 * Lấy chi tiết 1 thể loại
 */
export async function adminGetCategoryById(req, res) {
  try {
    const categoryId = req.params.id;

    const [rows] = await pool.query(
      `SELECT 
        c.category_id,
        c.category_name,
        COUNT(bc.book_id) AS book_count
      FROM categories c
      LEFT JOIN bookcategories bc ON c.category_id = bc.category_id
      WHERE c.category_id = ?
      GROUP BY c.category_id, c.category_name`,
      [categoryId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thể loại' });
    }

    res.json({
      category: rows[0]
    });
  } catch (err) {
    console.error('Error in adminGetCategoryById:', err);
    res.status(500).json({ message: 'Lỗi lấy thể loại', error: err.message });
  }
}
