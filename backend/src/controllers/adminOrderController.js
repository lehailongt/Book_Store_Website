import pool from '../config/database.js';

function toNumber(v, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : def;
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
      `SELECT o.order_id, o.total_amount, o.status, o.created_at, o.delivery_address, u.full_name, u.email, u.phone_number
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
      orderId: o.order_id,
      customerName: o.full_name,
      customerPhone: o.phone_number || '',
      totalAmount: Number(o.total_amount || 0),
      status: mapDbOrderStatusToUi(o.status),
      deliveryAddress: o.delivery_address,
      createdAt: o.created_at,
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
      `SELECT o.order_id, o.total_amount, o.status, o.created_at, o.delivery_address,
              u.full_name, u.email, u.phone_number
       FROM orders o JOIN users u ON u.user_id = o.user_id
       WHERE o.order_id = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    const o = rows[0];

    const [items] = await pool.query(
      `SELECT od.order_detail_id, od.quantity, od.price,
              b.book_id, b.book_name
       FROM orderdetails od JOIN books b ON b.book_id = od.book_id
       WHERE od.order_id = ?`,
      [id]
    );

    res.json({
      orderId: o.order_id,
      status: mapDbOrderStatusToUi(o.status),
      totalAmount: Number(o.total_amount || 0),
      createdAt: o.created_at,
      deliveryAddress: o.delivery_address,
      customerName: o.full_name,
      customerPhone: o.phone_number || '',
      customerEmail: o.email,
      items: items.map((it) => ({
        orderDetailId: it.order_detail_id,
        bookId: it.book_id,
        bookName: it.book_name,
        quantity: it.quantity,
        unitPrice: Number(it.price || 0),
      })),
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
