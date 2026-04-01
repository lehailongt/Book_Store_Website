import pool from '../config/database.js';
import bcrypt from 'bcrypt';

function toNumber(v, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
}

// Validation functions
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ''));
}

function validatePhone(phone) {
  return !phone || /^[0-9]{9,11}$/.test(String(phone || ''));
}

function validatePassword(password) {
  return password && String(password).length >= 6;
}

function validateUser(data, isCreate = true) {
  if (!data.full_name || String(data.full_name).trim() === '') {
    return 'Họ và tên không được để trống';
  }
  if (!validateEmail(data.email)) {
    return 'Email không hợp lệ';
  }
  if (!validatePhone(data.phone_number)) {
    return 'Số điện thoại phải là 9-11 chữ số';
  }
  if (isCreate && !validatePassword(data.password)) {
    return 'Mật khẩu phải có ít nhất 6 ký tự';
  }
  return null;
}

function mapDbUserRoleToUi(role) {
  return String(role) === 'customer' ? 'customer' : String(role || 'customer');
}

function mapUiRoleToDb(role) {
  const r = String(role || '').toLowerCase();
  if (r === 'admin') return 'admin';
  return 'customer';
}

export async function adminGetUsers(req, res) {
  try {
    const page = toNumber(req.query.page, 1);
    const limit = toNumber(req.query.limit, 10);
    const offset = (page - 1) * limit;
    const keyword = (req.query.keyword || '').trim();
    const searchType = (req.query.searchType || 'all').trim().toLowerCase();
    const role = (req.query.role || '').trim().toLowerCase();

    const where = [];
    const params = [];

    if (keyword) {
      switch (searchType) {
        case 'name':
          where.push('u.full_name LIKE ?');
          params.push(`%${keyword}%`);
          break;
        case 'email':
          where.push('u.email LIKE ?');
          params.push(`%${keyword}%`);
          break;
        case 'phone':
          where.push('u.phone_number LIKE ?');
          params.push(`%${keyword}%`);
          break;
        case 'all':
        default:
          where.push('(u.full_name LIKE ? OR u.email LIKE ? OR u.phone_number LIKE ?)');
          params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
          break;
      }
    }
    if (role) {
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

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM users u ${whereSql}`,
      params
    );

    const users = rows.map(u => ({
      ...u,
      role: mapDbUserRoleToUi(u.role)
    }));

    res.json({
      data: users,
      total: countRows[0].total,
      page,
      limit
    });
  } catch (e) {
    console.error('adminGetUsers error:', e);
    res.status(500).json({ message: 'Lỗi server' });
  }
}

export async function adminGetUserById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT user_id AS id, full_name, email, role, date_of_birth, phone_number, image_url FROM users WHERE user_id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    const user = {
      ...rows[0],
      role: mapDbUserRoleToUi(rows[0].role)
    };
    res.json(user);
  } catch (e) {
    console.error('adminGetUserById error:', e);
    res.status(500).json({ message: 'Lỗi server' });
  }
}

export async function adminCreateUser(req, res) {
  try {
    const { full_name, email, password, role, date_of_birth, phone_number, image_url } = req.body;

    // Validate input
    const error = validateUser({ full_name, email, password, phone_number }, true);
    if (error) {
      return res.status(400).json({ message: error });
    }

    // Check email uniqueness
    const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email đã tồn tại' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const dbRole = mapUiRoleToDb(role);

    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password, role, date_of_birth, phone_number, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [full_name, email, hashedPassword, dbRole, date_of_birth || null, phone_number || null, image_url || null]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Người dùng đã được tạo'
    });
  } catch (e) {
    console.error('adminCreateUser error:', e);
    res.status(500).json({ message: 'Lỗi server' });
  }
}

export async function adminUpdateUser(req, res) {
  try {
    const { id } = req.params;
    const { full_name, email, role, date_of_birth, phone_number, image_url } = req.body;
    const error = validateUser({ full_name, email, phone_number }, false);
    if (error) {
      return res.status(400).json({ message: error });
    }

    // 
    // Check if user exists
    const [existing] = await pool.query('SELECT user_id FROM users WHERE user_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Check email uniqueness if email is being changed
    if (email) {
      const [emailCheck] = await pool.query('SELECT user_id FROM users WHERE email = ? AND user_id != ?', [email, id]);
      if (emailCheck.length > 0) {
        return res.status(409).json({ message: 'Email đã tồn tại' });
      }
    }

    const dbRole = role ? mapUiRoleToDb(role) : undefined;

    await pool.query(
      'UPDATE users SET full_name = ?, email = ?, role = ?, date_of_birth = ?, phone_number = ?, image_url = ? WHERE user_id = ?',
      [full_name || null, email || null, dbRole || null, date_of_birth || null, phone_number || null, image_url || null, id]
    );

    res.json({ message: 'Người dùng đã được cập nhật' });
  } catch (e) {
    console.error('adminUpdateUser error:', e);
    res.status(500).json({ message: 'Lỗi server' });
  }
}

export async function adminDeleteUser(req, res) {
  try {
    const { id } = req.params;

    // Check if user exists
    const [existing] = await pool.query('SELECT user_id FROM users WHERE user_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    await pool.query('DELETE FROM users WHERE user_id = ?', [id]);
    res.json({ message: 'Người dùng đã được xóa' });
  } catch (e) {
    console.error('adminDeleteUser error:', e);
    res.status(500).json({ message: 'Lỗi server' });
  }
}

export async function adminUpdateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: 'Thiếu vai trò' });
    }

    // Check if user exists
    const [existing] = await pool.query('SELECT user_id FROM users WHERE user_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const dbRole = mapUiRoleToDb(role);

    await pool.query('UPDATE users SET role = ? WHERE user_id = ?', [dbRole, id]);
    res.json({ message: 'Vai trò đã được cập nhật' });
  } catch (e) {
    console.error('adminUpdateUserRole error:', e);
    res.status(500).json({ message: 'Lỗi server' });
  }
}
