// cart.js

const API_CART = '/api/cart';
const API_CHECKOUT = '/api/checkout';

function getToken() {
    return localStorage.getItem('accessToken') || localStorage.getItem('token') || '';
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconClass = 'bi-check-circle';
    if (type === 'error') iconClass = 'bi-x-circle';
    if (type === 'warning') iconClass = 'bi-exclamation-triangle';

    toast.innerHTML = `
        <i class="bi ${iconClass} toast-icon"></i>
        <span class="toast-msg">${message}</span>
    `;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3s
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price);
}

let cartItems = [];

async function fetchCartAPI(url, options = {}) {
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
            if (response.status === 401) {
                showToast('Vui lòng đăng nhập để tiếp tục', 'error');
                setTimeout(() => window.location.href = './login.html', 1500);
            } else if (response.status === 400 || response.status === 404 || response.status === 500) {
                showToast(errorMsg, 'error');
            } else {
                showToast(errorMsg, 'error');
            }
            throw new Error(errorMsg);
        }
        return data; // Assume data is the payload or { items: [] }
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

async function loadCartData() {
    showLoading(true);
    try {
        // Fallback or mock if API doesn't exist
        const data = await fetchCartAPI(API_CART, { method: 'GET' }).catch(() => null);

        // Mocking for testing if API is unreachable
        if (!data) {
            cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        } else {
            cartItems = data.items || data || [];
        }

        renderCart();
    } catch (error) {
        showToast('Không thể tải giỏ hàng', 'error');
        renderCart(); // Render empty
    } finally {
        showLoading(false);
    }
}

async function updateQuantity(id, quantity) {
    if (quantity < 1) return;
    showLoading(true);
    try {
        await fetchCartAPI(`${API_CART}/update`, {
            method: 'PUT',
            body: JSON.stringify({ id, quantity })
        }).catch(err => {
            // Mock local update if API fails
            const item = cartItems.find(i => i.id === id);
            if (item) {
                item.quantity = quantity;
                localStorage.setItem('cart', JSON.stringify(cartItems));
            }
        });
        showToast('Cập nhật số lượng thành công', 'success');
        await loadCartData();
    } catch (error) {
        // Error already handled in fetchCartAPI
    } finally {
        showLoading(false);
    }
}

let itemToDelete = null;
function confirmRemoveItem(id) {
    itemToDelete = id;
    const modal = document.getElementById('confirmModal');
    if (modal) modal.style.display = 'flex';
}

function closeConfirmModal() {
    itemToDelete = null;
    const modal = document.getElementById('confirmModal');
    if (modal) modal.style.display = 'none';
}

async function executeRemoveItem() {
    if (!itemToDelete) return;
    closeConfirmModal();
    showLoading(true);
    try {
        await fetchCartAPI(`${API_CART}/remove/${encodeURIComponent(itemToDelete)}`, {
            method: 'DELETE'
        }).catch(err => {
            // Mock local remove if API fails
            cartItems = cartItems.filter(i => i.id !== itemToDelete);
            localStorage.setItem('cart', JSON.stringify(cartItems));
        });
        showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'success');
        await loadCartData();
    } catch (error) {
        // Handled
    } finally {
        showLoading(false);
    }
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    const count = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
    if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

function renderCart() {
    updateCartBadge();
    const tbody = document.getElementById('cartBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!cartItems || cartItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 40px;">Giỏ hàng của bạn đang trống.</td></tr>';
        updateTotals();
        return;
    }

    cartItems.forEach(item => {
        const row = document.createElement('tr');
        const book = (window.booksData || []).find(b => b.id === (item.id || item.bookId)) || {};
        const isbn = book.isbn || item.isbn || item.id || 'N/A';
        const name = item.name || item.title || 'Sách không tên';
        const price = item.price || 0;
        const qty = item.quantity || 1;

        row.innerHTML = `
            <td data-label="Sản phẩm">
                <div class="item-info">
                    <div class="cover"><i class="bi bi-book"></i></div>
                    <div>
                        <div class="name">${name}</div>
                        <div class="isbn">ISBN ${isbn}</div>
                    </div>
                </div>
            </td>
            <td data-label="Số lượng">
                <div class="qty-controls">
                    <button class="qty-btn qty-minus">-</button>
                    <input type="number" class="qty-input" value="${qty}" min="1">
                    <button class="qty-btn qty-plus">+</button>
                </div>
            </td>
            <td data-label="Giá">${formatPrice(price)}đ</td>
            <td data-label="Tổng">${formatPrice(price * qty)}đ</td>
            <td data-label="Thao tác"><button class="remove-btn" title="Xóa"><i class="bi bi-trash"></i></button></td>
        `;

        // Event Listeners
        row.querySelector('.qty-minus').addEventListener('click', () => {
            if (qty > 1) updateQuantity(item.id, qty - 1);
        });
        row.querySelector('.qty-plus').addEventListener('click', () => {
            // Validation: Có thể check số lượng tồn kho (stock) tại đây nếu có data
            const stock = item.stock || 99;
            if (qty < stock) {
                updateQuantity(item.id, qty + 1);
            } else {
                showToast('Vượt quá số lượng tồn kho', 'warning');
            }
        });
        row.querySelector('.qty-input').addEventListener('change', e => {
            let val = parseInt(e.target.value) || 1;
            const stock = item.stock || 99;
            if (val < 1) val = 1;
            if (val > stock) {
                val = stock;
                showToast('Vượt quá số lượng tồn kho, đã điều chỉnh về mức tối đa', 'warning');
            }
            updateQuantity(item.id, val);
        });
        row.querySelector('.remove-btn').addEventListener('click', () => {
            confirmRemoveItem(item.id);
        });

        tbody.appendChild(row);
    });

    updateTotals();
}

function updateTotals() {
    const total = cartItems.reduce((acc, i) => acc + (i.price || 0) * (i.quantity || 1), 0);

    const totalAmountEl = document.getElementById('totalAmount');
    if (totalAmountEl) totalAmountEl.textContent = `${formatPrice(total)}đ`;
}

async function handleCheckout() {
    if (!cartItems || cartItems.length === 0) {
        showToast('Giỏ hàng trống. Vui lòng thêm sản phẩm.', 'warning');
        return;
    }

    const address = document.getElementById('shipAddress')?.value.trim();

    if (!address) {
        showToast('Vui lòng điền nơi nhận hàng.', 'warning');
        return;
    }

    const paymentInput = document.querySelector('input[name="payment"]:checked');
    const payment = paymentInput ? paymentInput.value : 'cod';

    const orderPayload = {
        items: cartItems,
        shipping: { address },
        payment,
        totalAmount: cartItems.reduce((acc, i) => acc + (i.price || 0) * (i.quantity || 1), 0)
    };

    showLoading(true);
    try {
        await fetchCartAPI(API_CHECKOUT, {
            method: 'POST',
            body: JSON.stringify(orderPayload)
        }).catch(err => {
            // Mock Success 
            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
            const mockOrder = {
                id: Date.now().toString(),
                ...orderPayload,
                status: 'Pending',
                createdAt: new Date().toISOString()
            };
            orders.push(mockOrder);
            localStorage.setItem('orders', JSON.stringify(orders));
            localStorage.setItem('lastOrder', JSON.stringify(mockOrder));
            localStorage.removeItem('cart'); // Clear mock cart
        });

        showToast('Đặt hàng thành công! Đang chuyển hướng...', 'success');
        setTimeout(() => {
            window.location.href = './order.html';
        }, 1500);
    } catch (error) {
        // Error already handled
    } finally {
        showLoading(false);
    }
}

function attachHandlers() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', handleCheckout);

    const btnCancelModal = document.getElementById('btnCancelModal');
    if (btnCancelModal) btnCancelModal.addEventListener('click', closeConfirmModal);

    const btnConfirmModal = document.getElementById('btnConfirmModal');
    if (btnConfirmModal) btnConfirmModal.addEventListener('click', executeRemoveItem);
}

document.addEventListener('DOMContentLoaded', () => {
    attachHandlers();
    loadCartData();
});