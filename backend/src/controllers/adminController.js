// src/controllers/adminController.js
import pool from '../config/database.js';
import bcrypt from 'bcrypt';

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
    case 'pending':
      return 'Pending';
    case 'shipped':
      return 'Shipped';
    case 'delivered':
      return 'Completed';
    case 'cancelled':
      return 'Canceled';
    default:
      return 'Pending';
  }
}

function mapUiOrderStatusToDb(status) {
  const s = String(status || '').toLowerCase();
  switch (s) {
    case 'pending':
      return 'pending';
    case 'processing':
      // Không có trong DB; t��m map về 'pending'
      return 'pending';
    case 'shipped':
      return 'shipped';
    case 'completed':
      return 'delivered';
    case 'canceled':
    case 'cancelled':
      return 'cancelled';
    default:
      return 'pending';
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
    const { fullName, email, phone_number, role } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (họ tên, email)' });
    }

    const dbRole = mapUiRoleToDb(role);

    const [result] = await pool.query(
      'UPDATE users SET full_name = ?, email = ?, phone_number = ?, role = ? WHERE user_id = ?',
      [fullName, email, phone_number || null, dbRole, id]
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
    const { fullName, email, password, role, phone_number } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (họ tên, email, mật khẩu)' });
    }
    const dbRole = mapUiRoleToDb(role);
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password, role, phone_number) VALUES (?, ?, ?, ?, ?)',
      [fullName, email, hashedPassword, dbRole, phone_number || null]
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
      where.push('o.status = ?');
      params.push(mapUiOrderStatusToDb(status));
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
    const dbStatus = mapUiOrderStatusToDb(req.body.status);
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
    const [[{ totalOrders }]] = await pool.query('SELECT COUNT(*) AS totalOrders FROM orders');
    const [[{ revenue }]] = await pool.query('SELECT COALESCE(SUM(total_amount),0) AS revenue FROM orders');
    const [[{ newCustomers }]] = await pool.query(
      `SELECT COUNT(*) AS newCustomers FROM users WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`
    ).catch(() => [[{ newCustomers: 0 }]]); // nếu không có cột created_at thì trả 0
    const [[{ totalBooks }]] = await pool.query('SELECT COUNT(*) AS totalBooks FROM books');

    res.json({
      totalOrders: Number(totalOrders || 0),
      revenue: Number(revenue || 0),
      newCustomers: Number(newCustomers || 0),
      totalBooks: Number(totalBooks || 0),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi lấy metrics dashboard' });
  }
}
