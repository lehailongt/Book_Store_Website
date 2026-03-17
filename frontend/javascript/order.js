// order.js - quản lý đơn hàng cho người dùng đã đăng nhập

const API_BASE = 'http://localhost:5001/api';
const API_ORDERS = `${API_BASE}/orders`;

function getToken() {
    return localStorage.getItem('accessToken') || localStorage.getItem('token') || '';
}

function formatPrice(price) {
    if (price == null) return '0';
    return new Intl.NumberFormat('vi-VN').format(typeof price === 'number' ? price : parseFloat(String(price).replace(/[^0-9.-]+/g, '')) || 0);
}

function shortId(id) {
    return id ? String(id).slice(-6) : '';
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('currentUser')) || null;
    } catch (e) {
        return null;
    }
}

async function fetchOrdersAPI(url, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, { ...options, headers });
        let data = null;
        try {
            data = await response.json();
        } catch (e) { }

        if (!response.ok) {
            const errorMsg = data?.message || data?.error || `Lỗi HTTP: ${response.status}`;
            throw new Error(errorMsg);
        }
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

function renderOrderDetails(order) {
    let html = '<div class="order-details" style="text-align: left; padding: 15px; background: #f9f9f9; border-radius: 8px; margin-top: 10px;">';
    html += '<h4>Sản phẩm</h4><ul style="padding-left: 20px;">';

    const items = order.items || order.order_details || [];
    items.forEach(item => {
        const name = item.name || item.book_name || 'Sản phẩm';
        const price = item.price || 0;
        const qty = item.quantity || 1;
        html += `<li style="margin-bottom: 5px;">${name} x ${qty} - ${formatPrice(price * qty)}đ</li>`;
    });

    html += '</ul>';

    const total = order.total_amount || 0;
    html += `<p style="margin-top: 10px;"><strong>Tổng thanh toán:</strong> ${formatPrice(total)}đ</p>`;

    html += '<hr style="margin: 15px 0;">';
    html += '<h4>Thông tin giao hàng</h4>';
    const addr = order.delivery_address || 'Chưa cập nhật';
    html += `<p>${addr}</p>`;

    const status = order.status || 'shipped';
    html += `<p><strong>Trạng thái:</strong> ${status}</p>`;
    html += '</div>';

    return html;
}

async function renderOrdersForUser() {
    const user = getCurrentUser();
    const msgEl = document.getElementById('orderMessage');
    const tbody = document.getElementById('ordersBody');
    const noOrders = document.getElementById('noOrders');

    if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Đang tải dữ liệu...</td></tr>';

    if (!user) {
        msgEl.innerHTML = 'Vui lòng <a href="./login.html">đăng nhập</a> để quản lý đơn hàng.';
        document.getElementById('ordersContainer').style.display = 'none';
        return;
    }

    msgEl.textContent = `Xin chào ${user.name || user.username || user.email}. Dưới đây là các đơn hàng của bạn.`;
    document.getElementById('ordersContainer').style.display = 'block';

    try {
        let orders = [];
        const res = await fetchOrdersAPI(API_ORDERS).catch(() => null);

        // Mock fallback if backend fails
        if (!res) {
            console.log("Using LocalStorage Falback due to API failure");
            const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
            orders = allOrders.filter(o => o.user && o.user.email === user.email);
        } else {
            orders = Array.isArray(res) ? res : (res.data || res.items || []);
        }

        if (!orders || orders.length === 0) {
            if (tbody) tbody.innerHTML = '';
            noOrders.style.display = 'block';
            return;
        }

        noOrders.style.display = 'none';

        // Sort newest first
        orders.sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));

        if (tbody) tbody.innerHTML = '';

        orders.forEach(order => {
            const tr = document.createElement('tr');
            const dateStr = new Date(order.created_at || order.createdAt).toLocaleString('vi-VN');
            const status = order.status || 'shipped';

            let statusBadge = 'info';
            const sLower = String(status).toLowerCase();
            if (sLower === 'pending') statusBadge = 'warning';
            if (sLower === 'shipped') statusBadge = 'primary';
            if (sLower === 'delivered') statusBadge = 'success';
            if (sLower === 'cancelled') statusBadge = 'danger';

            const total = order.total_amount || 0;

            tr.innerHTML = `
                <td>#${shortId(order.order_id)}</td>
                <td>${dateStr}</td>
                <td>${formatPrice(total)}đ</td>
                <td><span class="badge badge-${statusBadge}">${status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-btn" style="padding: 4px 8px; font-size: 12px;">Xem</button>
                </td>
            `;

            // details row
            const detailsRow = document.createElement('tr');
            const detailsCell = document.createElement('td');
            detailsCell.colSpan = 5;
            detailsCell.style.display = 'none';
            detailsRow.appendChild(detailsCell);

            tr.querySelector('.view-btn').addEventListener('click', async () => {
                if (detailsCell.style.display === 'none') {
                    // Try fetch detail if items not present
                    if (!order.items && !order.order_details) {
                        detailsCell.innerHTML = '<div style="text-align:center; padding: 10px;">Đang tải chi tiết...</div>';
                        detailsCell.style.display = 'table-cell';
                        try {
                            const detailData = await fetchOrdersAPI(`${API_ORDERS}/${order.order_id}`);
                            const fullOrderData = detailData.data || detailData;
                            const fullOrder = {
                                ...order,
                                items: fullOrderData.order_details || []
                            };
                            detailsCell.innerHTML = renderOrderDetails(fullOrder);
                        } catch (e) {
                            detailsCell.innerHTML = '<div style="color:red; text-align:center;">Lỗi tải chi tiết</div>';
                        }
                    } else {
                        detailsCell.innerHTML = renderOrderDetails(order);
                        detailsCell.style.display = 'table-cell';
                    }
                } else {
                    detailsCell.style.display = 'none';
                }
            });

            tbody.appendChild(tr);
            tbody.appendChild(detailsRow);
        });

    } catch (err) {
        if (tbody) tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Lỗi tải dữ liệu: ${err.message}</td></tr>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // try to clear cart if lastOrder is processed
    try {
        const last = JSON.parse(localStorage.getItem('lastOrder'));
        if (last) {
            localStorage.removeItem('cart');
            localStorage.removeItem('lastOrder');
        }
    } catch (e) { }

    renderOrdersForUser();
});