// cart.js - Cart Management

const API_BASE = 'http://localhost:5001/api';
const API_CART = `${API_BASE}/cart`;

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
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price);
}

let cartItems = [];
const paginationState = {
    currentPage: 1,
    itemsPerPage: 5
};

function findItemIndexByBookId(bookId) {
    const targetId = String(bookId);
    return cartItems.findIndex(item => String(item.book_id) === targetId);
}

async function fetchAPI(url, options = {}) {
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
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            const errorMsg = data?.message || `Lỗi: ${response.status}`;
            if (response.status === 401) {
                showToast('Vui lòng đăng nhập để tiếp tục', 'error');
                setTimeout(() => window.location.href = './login.html', 1500);
            }
            throw new Error(errorMsg);
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

async function loadCartData() {
    showLoading(true);
    try {
        const result = await fetchAPI(API_CART);
        cartItems = result.data || [];
        if (!Array.isArray(cartItems)) cartItems = [];
    } catch (error) {
        showToast('Lỗi tải giỏ hàng', 'error');
        cartItems = [];
    }
    renderCart();
    showLoading(false);
}

async function updateQuantity(bookId, quantity) {
    const normalizedBookId = Number(bookId);
    const normalizedQty = Number(quantity);
    if (!Number.isInteger(normalizedBookId) || normalizedBookId <= 0 || !Number.isInteger(normalizedQty) || normalizedQty < 1) return;

    const idx = findItemIndexByBookId(normalizedBookId);
    if (idx < 0) return;
    const oldQty = Number(cartItems[idx].quantity || 1);

    // Optimistic update: refresh UI immediately without reloading all cart data.
    cartItems[idx].quantity = normalizedQty;
    renderCart();

    try {
        await fetchAPI(`${API_CART}/update`, {
            method: 'PUT',
            body: JSON.stringify({ book_id: normalizedBookId, quantity: normalizedQty })
        });
        showToast('Cập nhật số lượng', 'success');
        // Update badge from header
        if (typeof window.updateCartBadgeFromAPI === 'function') {
            await window.updateCartBadgeFromAPI();
        }
    } catch (error) {
        cartItems[idx].quantity = oldQty;
        renderCart();
        showToast('Lỗi cập nhật: ' + error.message, 'error');
    }
}

let itemToDelete = null;
function confirmRemoveItem(bookId) {
    console.log('Confirm remove - Book ID:', bookId);
    itemToDelete = bookId;
    const modal = document.getElementById('confirmModal');
    console.log('Modal element:', modal);
    if (modal) {
        modal.style.display = 'flex';
        console.log('Modal displayed');
    } else {
        console.error('Modal not found in DOM');
    }
}

function closeConfirmModal() {
    itemToDelete = null;
    const modal = document.getElementById('confirmModal');
    if (modal) modal.style.display = 'none';
}

async function executeRemoveItem() {
    const normalizedBookId = Number(itemToDelete);
    if (!Number.isInteger(normalizedBookId) || normalizedBookId <= 0) {
        console.warn('No item selected for deletion');
        return;
    }
    
    closeConfirmModal();

    const idx = findItemIndexByBookId(normalizedBookId);
    const removedItem = idx >= 0 ? cartItems[idx] : null;
    if (idx >= 0) {
        cartItems.splice(idx, 1);
        renderCart();
    }

    console.log('Deleting item:', normalizedBookId);
    console.log('API URL:', `${API_CART}/${normalizedBookId}`);
    
    try {
        const response = await fetchAPI(`${API_CART}/${normalizedBookId}`, {
            method: 'DELETE'
        });
        
        console.log('Delete response:', response);
        showToast('Đã xóa khỏi giỏ hàng', 'success');

        // Update badge from header
        if (typeof window.updateCartBadgeFromAPI === 'function') {
            await window.updateCartBadgeFromAPI();
        }
    } catch (error) {
        if (removedItem) {
            cartItems.splice(Math.max(0, idx), 0, removedItem);
            renderCart();
        }
        console.error('Delete error:', error);
        showToast('Lỗi xóa: ' + error.message, 'error');
    }
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    const count = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-block' : 'none';
}

function renderPagination() {
    const container = document.getElementById('cartPagination');
    if (!container) return;

    const totalPages = Math.max(1, Math.ceil(cartItems.length / paginationState.itemsPerPage));
    if (paginationState.currentPage > totalPages) paginationState.currentPage = totalPages;

    if (cartItems.length === 0 || totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    const btn = (page, label, disabled = false, active = false) => {
        return `<button class="cart-page-btn${active ? ' active' : ''}" data-page="${page}" ${disabled ? 'disabled' : ''}>${label}</button>`;
    };

    let html = '';
    html += btn(Math.max(1, paginationState.currentPage - 1), '«', paginationState.currentPage <= 1);

    const windowSize = 5;
    let start = Math.max(1, paginationState.currentPage - Math.floor(windowSize / 2));
    let end = Math.min(totalPages, start + windowSize - 1);
    if (end - start + 1 < windowSize) start = Math.max(1, end - windowSize + 1);

    for (let p = start; p <= end; p++) {
        html += btn(p, String(p), false, p === paginationState.currentPage);
    }

    html += btn(Math.min(totalPages, paginationState.currentPage + 1), '»', paginationState.currentPage >= totalPages);
    container.innerHTML = html;
}

function renderCart() {
    updateCartBadge();
    const tbody = document.getElementById('cartBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!cartItems || cartItems.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-cart">
                    <div><i class="bi bi-cart-x"></i></div>
                    <div>Giỏ hàng của bạn đang trống</div>
                </td>
            </tr>
        `;
        updateTotals();
        renderPagination();
        return;
    }

    const totalPages = Math.max(1, Math.ceil(cartItems.length / paginationState.itemsPerPage));
    if (paginationState.currentPage > totalPages) paginationState.currentPage = totalPages;

    const start = (paginationState.currentPage - 1) * paginationState.itemsPerPage;
    const end = start + paginationState.itemsPerPage;
    const pageItems = cartItems.slice(start, end);

    pageItems.forEach(item => {
        const bookId = Number(item.book_id);
        const qty = item.quantity || 1;
        const price = item.price || 0;

        if (!Number.isInteger(bookId) || bookId <= 0) return;

        const row = document.createElement('tr');
        
        // Book image
        let imageSrc = item.image_url;
        if (imageSrc && !imageSrc.startsWith('/') && !imageSrc.startsWith('http')) {
            imageSrc = '../' + imageSrc;
        }

        const imageHTML = imageSrc 
            ? `<img src="${imageSrc}" alt="Book" class="book-image">`
            : '<i class="bi bi-book"></i>';

        row.innerHTML = `
            <td class="col-id"><span class="book-id">${bookId}</span></td>
            <td class="col-image">${imageHTML}</td>
            <td class="col-name">${item.name || 'Tên không tìm thấy'}</td>
            <td class="col-author">${item.author || 'Không rõ'}</td>
            <td class="col-qty">
                <div class="qty-controls">
                    <button class="qty-btn qty-minus">−</button>
                    <input type="number" class="qty-input" value="${qty}" min="1">
                    <button class="qty-btn qty-plus">+</button>
                </div>
            </td>
            <td class="col-price price">${formatPrice(price)}đ</td>
            <td class="col-total total">${formatPrice(price * qty)}đ</td>
            <td class="col-action">
                <button class="delete-btn" title="Xóa"><i class="bi bi-trash"></i></button>
            </td>
        `;

        // Event handlers
        row.querySelector('.qty-minus').addEventListener('click', () => {
            if (qty > 1) updateQuantity(bookId, qty - 1);
        });
        row.querySelector('.qty-plus').addEventListener('click', () => {
            updateQuantity(bookId, qty + 1);
        });
        row.querySelector('.qty-input').addEventListener('change', e => {
            let val = parseInt(e.target.value) || 1;
            if (val < 1) val = 1;
            e.target.value = val;
            updateQuantity(bookId, val);
        });
        row.querySelector('.delete-btn').addEventListener('click', () => {
            confirmRemoveItem(bookId);
        });

        tbody.appendChild(row);
    });

    updateTotals();
    renderPagination();
}

function updateTotals() {
    const total = cartItems.reduce((acc, item) => {
        const price = item.price || 0;
        return acc + price * (item.quantity || 1);
    }, 0);

    const totalEl = document.getElementById('totalAmount');
    if (totalEl) totalEl.textContent = `${formatPrice(total)}đ`;
}

async function handleCheckout() {
    if (!cartItems || cartItems.length === 0) {
        showToast('Giỏ hàng trống!', 'warning');
        return;
    }

    const address = document.getElementById('shipAddress')?.value.trim();
    if (!address) {
        showToast('Vui lòng nhập địa chỉ giao hàng!', 'warning');
        return;
    }

    const totalAmount = cartItems.reduce((acc, item) => {
        const price = item.price || 0;
        return acc + price * (item.quantity || 1);
    }, 0);

    showLoading(true);
    try {
        const orderItems = cartItems.map(item => ({
            book_id: item.book_id,
            quantity: item.quantity,
            price: item.price
        }));

        const response = await fetchAPI(`${API_BASE}/orders`, {
            method: 'POST',
            body: JSON.stringify({
                items: orderItems,
                delivery_address: address,
                total_amount: totalAmount
            })
        });

        if (response.success) {
            await fetchAPI(API_CART, { method: 'DELETE' });
            // Update badge from header
            if (typeof window.updateCartBadgeFromAPI === 'function') {
                await window.updateCartBadgeFromAPI();
            }
            showToast('Đặt hàng thành công!', 'success');
            setTimeout(() => window.location.href = './order.html', 1500);
        }
    } catch (error) {
        showToast('Lỗi đặt hàng', 'error');
    } finally {
        showLoading(false);
    }
}

function attachHandlers() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', handleCheckout);

    const btnCancel = document.getElementById('btnCancelModal');
    if (btnCancel) btnCancel.addEventListener('click', closeConfirmModal);

    const btnConfirm = document.getElementById('btnConfirmModal');
    if (btnConfirm) btnConfirm.addEventListener('click', executeRemoveItem);

    const pagination = document.getElementById('cartPagination');
    if (pagination) {
        pagination.addEventListener('click', (e) => {
            const btn = e.target.closest('.cart-page-btn');
            if (!btn) return;
            const page = Number(btn.getAttribute('data-page')) || 1;
            if (page === paginationState.currentPage) return;
            paginationState.currentPage = page;
            renderCart();
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadCartData();
    attachHandlers();
});