// src/controllers/adminController.js
import pool from '../config/database.js';
import bcrypt from 'bcrypt';
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

// Helpers
function toNumber(v, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
}

function mapDbUserRoleToUi(role) {
  // DB: 'admin' | 'customer' ; UI expects 'admin' | 'user'
  return String(role) === 'customer' ? 'user' : String(role || 'user');
}

function mapUiRoleToDb(role) {
  const r = String(role || '').toLowerCase();
  if (r === 'user' || r === 'customer') return 'customer';
  if (r === 'admin') return 'admin';
  return 'customer';
}

function mapDbOrderStatusToUi(status) {
  const s = String(status || '').toLowerCase();
  switch (s) {
    case 'delivered':
      return 'Đã giao';
    case 'cancelled':
      return 'Đã hủy';
    case 'pending':
    case 'shipped':
    default:
      return 'Đang giao';
  }
}

function mapUiOrderStatusToDb(status, action = 'filter') {
  const s = String(status || '').toLowerCase();
  switch (s) {
    case 'đã giao':
    case 'completed':
    case 'delivered':
      return action === 'filter' ? ['delivered'] : 'delivered';
    case 'hủy':
    case 'đã hủy':
    case 'canceled':
    case 'cancelled':
      return action === 'filter' ? ['cancelled'] : 'cancelled';
    case 'đang giao':
    case 'pending':
    case 'shipped':
    default:
      return action === 'filter' ? ['pending', 'shipped'] : 'pending';
  }
}

// Users
export async function adminGetUsers(req, res) {
  try {
    const page = toNumber(req.query.page, 1);
    const limit = toNumber(req.query.limit, 10);
    const offset = (page - 1) * limit;
    const keyword = (req.query.keyword || '').trim();
    const role = (req.query.role || '').trim().toLowerCase(); // 'admin' | 'user'

    const where = [];
    const params = [];

    if (keyword) {
      where.push('(u.full_name LIKE ? OR u.email LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (role) {
      // map UI role -> DB role
      where.push('u.role = ?');
      params.push(mapUiRoleToDb(role));
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT u.user_id AS id, u.full_name, u.email, u.role, u.date_of_birth, u.phone_number, u.image_url, u.user_id
       FROM users u
       ${whereSql}
       ORDER BY u.user_id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM users u ${whereSql}`,
      params
    );

    const data = rows.map((u) => ({
      id: u.id,
      name: u.full_name,
      email: u.email,
      role: mapDbUserRoleToUi(u.role),
      date_of_birth: u.date_of_birth,
      phone_number: u.phone_number,
      avatar: u.image_url || null,
      isActive: true, // schema chưa có cột trạng thái; tạm coi luôn active
      createdAt: null,
      updatedAt: null,
    }));

    res.json({ page, limit, total: Number(total), data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi tải danh sách người dùng' });
  }
}

export async function adminGetUserById(req, res) {
  try {
    const id = req.params.id;
    const [rows] = await pool.query(
      `SELECT u.user_id AS id, u.full_name, u.email, u.role, u.date_of_birth, u.phone_number, u.image_url
       FROM users u WHERE u.user_id = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy user' });
    const u = rows[0];
    res.json({
      id: u.id,
      name: u.full_name,
      email: u.email,
      role: mapDbUserRoleToUi(u.role),
      date_of_birth: u.date_of_birth,
      phone_number: u.phone_number,
      avatar: u.image_url || null,
      isActive: true,
      createdAt: null,
      updatedAt: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi tải chi tiết người dùng' });
  }
}

export async function adminUpdateUser(req, res) {
  try {
    const id = req.params.id;
    const { fullName, email, phone_number, role, date_of_birth } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (họ tên, email)' });
    }

    const dbRole = mapUiRoleToDb(role);

    const [result] = await pool.query(
      'UPDATE users SET full_name = ?, email = ?, phone_number = ?, role = ?, date_of_birth = ? WHERE user_id = ?',
      [fullName, email, phone_number || null, dbRole, date_of_birth || null, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    res.json({ message: 'Cập nhật tài khoản thành công' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email đã tồn tại ở tài khoản khác' });
    }
    console.error(err);
    res.status(500).json({ message: 'Lỗi cập nhật người dùng' });
  }
}

export async function adminDeleteUser(req, res) {
  try {
    const id = req.params.id;
    const [result] = await pool.query('DELETE FROM users WHERE user_id = ?', [id]);

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }

    res.json({ message: 'Xóa người dùng thành công' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'Không thể xóa vì người dùng này đã có đơn hàng' });
    }
    console.error(err);
    res.status(500).json({ message: 'Lỗi xóa người dùng' });
  }
}

export async function adminToggleUserActive(req, res) {
  try {
    // Schema không có cột trạng thái; phản hồi thành công giả lập
    res.json({ message: 'Cập nhật trạng thái thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi cập nhật trạng thái' });
  }
}

export async function adminUpdateUserRole(req, res) {
  try {
    const id = req.params.id;
    const role = mapUiRoleToDb(req.body.role);
    const [r] = await pool.query('UPDATE users SET role = ? WHERE user_id = ?', [role, id]);
    if (!r.affectedRows) return res.status(404).json({ message: 'Không tìm thấy user' });
    res.json({ message: 'Cập nhật vai trò thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi cập nhật vai trò' });
  }
}

export async function adminCreateUser(req, res) {
  try {
    const { fullName, email, password, role, phone_number, date_of_birth } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (họ tên, email, mật khẩu)' });
    }
    const dbRole = mapUiRoleToDb(role);
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password, role, phone_number, date_of_birth) VALUES (?, ?, ?, ?, ?, ?)',
      [fullName, email, hashedPassword, dbRole, phone_number || null, date_of_birth || null]
    );
    res.status(201).json({ message: 'Thêm người dùng thành công', userId: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }
    console.error(err);
    res.status(500).json({ message: 'Lỗi thêm người dùng' });
  }
}

// Get all books for admin panel
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

export async function adminGetCategories(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT category_id, category_name AS name FROM categories ORDER BY category_name ASC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi tải danh sách thể loại' });
  }
}

export async function adminUploadBookImage(req, res) {
  _uploadBookImage(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: 'Không có file ảnh' });
    res.json({ imageUrl: `images/books/${req.params.id}.png` });
  });
}

export async function adminDeleteBook(req, res) {
  try {
    const id = req.params.id;
    const [r] = await pool.query('DELETE FROM books WHERE book_id = ?', [id]);
    if (!r.affectedRows) return res.status(404).json({ message: 'Không tìm thấy sách' });
    res.json({ message: 'Xóa sách thành công' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'Không thể xóa vì sách đã có trong đơn hàng hoặc giỏ hàng' });
    }
    console.error(err);
    res.status(500).json({ message: 'Lỗi xóa sách' });
  }
}

// Orders
export async function adminGetOrders(req, res) {
  try {
    const page = toNumber(req.query.page, 1);
    const limit = toNumber(req.query.limit, 10);
    const offset = (page - 1) * limit;
    const keyword = (req.query.keyword || '').trim();
    const status = (req.query.status || '').trim(); // UI status
    const from = req.query.from ? new Date(req.query.from) : null;
    const to = req.query.to ? new Date(req.query.to) : null;

    const where = [];
    const params = [];

    if (keyword) {
      where.push('(o.order_id LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    if (status) {
      const dbStatuses = mapUiOrderStatusToDb(status, 'filter');
      where.push(`o.status IN (${dbStatuses.map(() => '?').join(',')})`);
      params.push(...dbStatuses);
    }
    if (from) {
      where.push('o.created_at >= ?');
      params.push(from);
    }
    if (to) {
      where.push('o.created_at <= ?');
      params.push(to);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT o.order_id AS id, o.total_amount, o.status, o.created_at, u.full_name, u.email
       FROM orders o
       JOIN users u ON u.user_id = o.user_id
       ${whereSql}
       ORDER BY o.order_id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM orders o JOIN users u ON u.user_id = o.user_id ${whereSql}`,
      params
    );

    const data = rows.map((o) => ({
      id: o.id,
      code: String(o.id),
      customerName: o.full_name,
      totalAmount: Number(o.total_amount || 0),
      status: mapDbOrderStatusToUi(o.status),
      createdAt: o.created_at,
      shippingService: 'Standard',
      trackingCode: '',
    }));

    res.json({ page, limit, total: Number(total), data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi tải danh sách đơn hàng' });
  }
}

export async function adminGetOrderById(req, res) {
  try {
    const id = req.params.id;
    const [rows] = await pool.query(
      `SELECT o.order_id AS id, o.total_amount, o.status, o.created_at, o.delivery_address,
              u.full_name, u.email
       FROM orders o JOIN users u ON u.user_id = o.user_id
       WHERE o.order_id = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    const o = rows[0];

    const [items] = await pool.query(
      `SELECT od.order_detail_id AS id, od.quantity, od.price AS unit_price,
              b.book_id AS book_id, b.book_name AS title
       FROM orderdetails od JOIN books b ON b.book_id = od.book_id
       WHERE od.order_id = ?`,
      [id]
    );

    res.json({
      id: o.id,
      code: String(o.id),
      status: mapDbOrderStatusToUi(o.status),
      totalAmount: Number(o.total_amount || 0),
      createdAt: o.created_at,
      address: { line1: o.delivery_address },
      customer: { name: o.full_name, email: o.email },
      items: items.map((it) => ({
        id: it.id,
        quantity: it.quantity,
        unitPrice: Number(it.unit_price || 0),
        title: it.title,
      })),
      payment: 'COD',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi tải chi tiết đơn hàng' });
  }
}

export async function adminUpdateOrderStatus(req, res) {
  try {
    const id = req.params.id;
    const dbStatus = mapUiOrderStatusToDb(req.body.status, 'update');
    const [r] = await pool.query('UPDATE orders SET status = ? WHERE order_id = ?', [dbStatus, id]);
    if (!r.affectedRows) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    res.json({ message: 'Cập nhật trạng thái đơn hàng thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi cập nhật trạng thái đơn hàng' });
  }
}

// Metrics
export async function adminGetMetrics(req, res) {
  try {
    // Total orders (delivered only)
    const [[{ totalOrders }]] = await pool.query('SELECT COUNT(*) AS totalOrders FROM orders WHERE status = "delivered"');
    
    // Revenue (sum of delivered orders)
    const [[{ revenue }]] = await pool.query('SELECT COALESCE(SUM(total_amount),0) AS revenue FROM orders WHERE status = "delivered"');
    
    // Total users
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users WHERE role = "customer"');
    
    // Total books in stock
    const [[{ totalBooks }]] = await pool.query('SELECT COUNT(*) AS totalBooks FROM books');
    
    // Total books sold (sum of quantities from orderdetails where order.status='delivered')
    const [[{ totalBooksSold }]] = await pool.query(`
      SELECT COALESCE(SUM(od.quantity), 0) AS totalBooksSold
      FROM orderdetails od
      JOIN orders o ON od.order_id = o.order_id
      WHERE o.status = 'delivered'
    `);

    res.json({
      totalOrders: Number(totalOrders || 0),
      revenue: Number(revenue || 0),
      totalUsers: Number(totalUsers || 0),
      totalBooks: Number(totalBooks || 0),
      totalBooksSold: Number(totalBooksSold || 0),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi lấy metrics dashboard' });
  }
}

// Order status distribution (for pie chart)
export async function adminGetOrderStatusChart(req, res) {
  try {
    const query = `
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
    `;
    const [rows] = await pool.query(query);
    
    // Map database status to UI status
    const statusMap = {
      'delivered': { label: 'Đã giao', color: '#10b981' },
      'pending': { label: 'Đang giao', color: '#f59e0b' },
      'shipped': { label: 'Đang giao', color: '#f59e0b' },
      'cancelled': { label: 'Đã hủy', color: '#ef4444' }
    };
    
    const aggregated = {};
    rows.forEach(row => {
      const ui = statusMap[row.status];
      if (ui) {
        if (!aggregated[ui.label]) {
          aggregated[ui.label] = { count: 0, color: ui.color };
        }
        aggregated[ui.label].count += row.count;
      }
    });
    
    const labels = Object.keys(aggregated);
    const data = labels.map(l => aggregated[l].count);
    const colors = labels.map(l => aggregated[l].color);
    
    res.json({ labels, data, colors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi lấy dữ liệu trạng thái đơn hàng' });
  }
}

// Monthly revenue chart (with year filter)
export async function adminGetMonthlyRevenueChart(req, res) {
  try {
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    
    const query = `
      SELECT MONTH(created_at) as month, COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      WHERE YEAR(created_at) = ?
      AND status = 'delivered'
      GROUP BY MONTH(created_at)
      ORDER BY month ASC
    `;
    
    const [rows] = await pool.query(query, [year]);
    
    const labels = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    
    const data = new Array(12).fill(0);
    rows.forEach(row => {
      data[row.month - 1] = Number(row.revenue || 0);
    });
    
    res.json({ labels, data, year });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi lấy dữ liệu doanh thu theo tháng' });
  }
}
