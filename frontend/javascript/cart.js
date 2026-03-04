// cart.js

function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price);
}

function renderCart() {
    const cart = getCart();
    const tbody = document.getElementById('cartBody');
    tbody.innerHTML = '';

    if (cart.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Giỏ hàng trống</td></tr>';
        updateTotals();
        return;
    }

    cart.forEach(item => {
        const row = document.createElement('tr');
        const book = (window.booksData || []).find(b => b.id === item.id) || {};
        const isbn = book.isbn || item.id;

        row.innerHTML = `
            <td>
                <div class="item-info">
                    <div class="cover"><i class="bi bi-book"></i></div>
                    <div>
                        <div class="name">${item.name}</div>
                        <div class="isbn">ISBN ${isbn}</div>
                    </div>
                </div>
            </td>
            <td>
                <div class="qty-controls">
                    <button class="qty-btn qty-minus">-</button>
                    <input type="number" class="qty-input" value="${item.quantity}" min="1">
                    <button class="qty-btn qty-plus">+</button>
                </div>
            </td>
            <td>${formatPrice(item.price)}đ</td>
            <td>${formatPrice(item.price * item.quantity)}đ</td>
            <td><button class="remove-btn"><i class="bi bi-trash"></i></button></td>
        `;

        // quantity handlers
        row.querySelector('.qty-minus').addEventListener('click', () => {
            if (item.quantity > 1) {
                item.quantity--;
                saveCart(cart);
                renderCart();
            }
        });
        row.querySelector('.qty-plus').addEventListener('click', () => {
            item.quantity++;
            saveCart(cart);
            renderCart();
        });
        row.querySelector('.qty-input').addEventListener('change', e => {
            let val = parseInt(e.target.value) || 1;
            if (val < 1) val = 1;
            item.quantity = val;
            saveCart(cart);
            renderCart();
        });
        row.querySelector('.remove-btn').addEventListener('click', () => {
            const idx = cart.findIndex(i => i.id === item.id);
            if (idx > -1) {
                cart.splice(idx,1);
                saveCart(cart);
                renderCart();
            }
        });

        tbody.appendChild(row);
    });

    updateTotals();
}

function updateTotals() {
    const cart = getCart();
    let subtotal = cart.reduce((acc,i) => acc + i.price * i.quantity, 0);
    const tax = Math.round(subtotal * 0.1);
    let total = subtotal + tax;

    // coupon discount stored
    const applied = sessionStorage.getItem('cartCoupon') || '';
    if (applied === 'DISCOUNT10') {
        const discount = Math.round(total * 0.1);
        total -= discount;
    }

    document.getElementById('subTotal').textContent = formatPrice(subtotal);
    document.getElementById('taxAmount').textContent = formatPrice(tax);
    document.getElementById('totalAmount').textContent = formatPrice(total);
}

function applyCoupon() {
    const code = document.getElementById('couponInput').value.trim();
    if (code === 'DISCOUNT10') {
        sessionStorage.setItem('cartCoupon', code);
        alert('Mã giảm 10% đã áp dụng');
        updateTotals();
    } else {
        alert('Mã không hợp lệ');
    }
}

function attachHandlers() {
    document.getElementById('applyCoupon').addEventListener('click', applyCoupon);
    document.getElementById('checkoutBtn').addEventListener('click', () => {
        // simple validation
        const name = document.getElementById('shipName').value.trim();
        const address = document.getElementById('shipAddress').value.trim();
        const phone = document.getElementById('shipPhone').value.trim();
        if (!name || !address || !phone) {
            alert('Vui lòng điền đầy đủ thông tin giao hàng');
            return;
        }
        // save order in storage and navigate
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        const order = {
            id: Date.now().toString(),
            items: getCart(),
            shipping: {name,address,phone},
            payment: document.querySelector('input[name="payment"]:checked').value,
            total: document.getElementById('totalAmount').textContent,
            status: 'Pending',
            createdAt: new Date().toISOString(),
            user: currentUser // may be null for guest
        };
        // save lastOrder for confirmation
        localStorage.setItem('lastOrder', JSON.stringify(order));
        // persist into orders array for management
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        window.location.href = './order.html';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    attachHandlers();
});