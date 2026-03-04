// order.js - quản lý đơn hàng cho người dùng đã đăng nhập

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(typeof price === 'number' ? price : parseFloat(String(price).replace(/[^0-9.-]+/g, '')) || 0);
}

function shortId(id) {
    return id ? String(id).slice(-6) : '';
}

function loadOrders() {
    return JSON.parse(localStorage.getItem('orders') || '[]');
}

function saveOrders(orders) {
    localStorage.setItem('orders', JSON.stringify(orders));
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('currentUser')) || null;
    } catch (e) {
        return null;
    }
}

function renderOrderDetails(order) {
    let html = '<div class="order-details">';
    html += '<h4>Items</h4><ul>';
    (order.items || []).forEach(item => {
        html += `<li>${item.name} x ${item.quantity} - ${formatPrice(item.price * item.quantity)}đ</li>`;
    });
    html += '</ul>';
    html += `<p><strong>Tổng:</strong> ${order.total}</p>`;
    html += '<h4>Thông tin giao hàng</h4>';
    html += `<p>${order.shipping.name} - ${order.shipping.phone}<br>${order.shipping.address}</p>`;
    html += `<p><strong>Thanh toán:</strong> ${order.payment}</p>`;
    html += '</div>';
    return html;
}

function renderOrdersForUser() {
    const user = getCurrentUser();
    const msgEl = document.getElementById('orderMessage');
    const tbody = document.getElementById('ordersBody');
    const noOrders = document.getElementById('noOrders');
    tbody.innerHTML = '';
    if (!user) {
        msgEl.innerHTML = 'Vui lòng <a href="./login.html">đăng nhập</a> để quản lý đơn hàng.';
        document.getElementById('ordersContainer').style.display = 'none';
        return;
    }
    msgEl.textContent = `Xin chào ${user.name || user.email}. Dưới đây là các đơn hàng của bạn.`;
    document.getElementById('ordersContainer').style.display = 'block';

    const orders = loadOrders().filter(o => (o.user && o.user.email) === user.email);
    if (!orders || orders.length === 0) {
        noOrders.style.display = 'block';
        return;
    }
    noOrders.style.display = 'none';

    orders.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    orders.forEach(order => {
        const tr = document.createElement('tr');
        const date = new Date(order.createdAt);
        const dateStr = date.toLocaleString();
        tr.innerHTML = `
            <td>#${shortId(order.id)}</td>
            <td>${dateStr}</td>
            <td>${order.total}</td>
            <td><span class="badge bg-${order.status === 'Pending' ? 'warning' : order.status === 'Delivered' ? 'success' : order.status === 'Canceled' ? 'secondary' : 'info'}">${order.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary view-btn">Xem</button>
                <button class="btn btn-sm btn-outline-danger cancel-btn">Hủy</button>
            </td>
        `;

        // details row
        const detailsRow = document.createElement('tr');
        const detailsCell = document.createElement('td');
        detailsCell.colSpan = 5;
        detailsCell.style.display = 'none';
        detailsCell.innerHTML = renderOrderDetails(order);
        detailsRow.appendChild(detailsCell);

        tr.querySelector('.view-btn').addEventListener('click', () => {
            if (detailsCell.style.display === 'none') {
                detailsCell.style.display = 'table-cell';
            } else {
                detailsCell.style.display = 'none';
            }
        });

        const cancelBtn = tr.querySelector('.cancel-btn');
        if (order.status === 'Delivered' || order.status === 'Canceled') {
            cancelBtn.disabled = true;
        }
        cancelBtn.addEventListener('click', () => {
            if (order.status === 'Delivered' || order.status === 'Canceled') return;
            if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
            const all = loadOrders();
            const idx = all.findIndex(o => o.id === order.id);
            if (idx > -1) {
                all[idx].status = 'Canceled';
                saveOrders(all);
                renderOrdersForUser();
            }
        });

        tbody.appendChild(tr);
        tbody.appendChild(detailsRow);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // if lastOrder exists and belongs to current user, clear cart
    try {
        const last = JSON.parse(localStorage.getItem('lastOrder'));
        const user = getCurrentUser();
        if (last) {
            if (!last.user || (user && last.user.email === user.email)) {
                localStorage.removeItem('cart');
            }
        }
    } catch (e) {}

    renderOrdersForUser();
});