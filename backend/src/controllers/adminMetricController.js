import pool from '../config/database.js';

export async function adminGetMetrics(req, res) {
  try {
    // Revenue (sum of delivered orders)
    const [[{ revenue }]] = await pool.query('SELECT COALESCE(SUM(total_amount),0) AS revenue FROM orders WHERE status = "delivered"');

    // Total books in stock
    const [[{ totalBooks }]] = await pool.query('SELECT COUNT(*) AS totalBooks FROM books');

    // Total books sold (sum of quantities from orderdetails where order.status='delivered')
    const [[{ totalBooksSold }]] = await pool.query(`
      SELECT COALESCE(SUM(od.quantity), 0) AS totalBooksSold
      FROM orderdetails od
      JOIN orders o ON od.order_id = o.order_id
      WHERE o.status = 'delivered'
    `);

    // Total users
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');

    res.json({
      success: true,
      data: {
        revenue: Number(revenue || 0),
        totalBooks: Number(totalBooks || 0),
        totalBooksSold: Number(totalBooksSold || 0),
        totalUsers: Number(totalUsers || 0),
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi lấy metrics dashboard' 
    });
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
      'shipped': { label: 'Đang giao', color: '#f59e0b' },
      'canceled': { label: 'Đã hủy', color: '#ef4444' }
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

    res.json({ 
      success: true, 
      data: { labels, data, colors } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi lấy dữ liệu trạng thái đơn hàng' 
    });
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

    res.json({ 
      success: true,
      data: { labels, data, year } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi lấy dữ liệu doanh thu theo tháng' });
  }
}