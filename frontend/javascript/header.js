// header.js - Dynamic Header Logic

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('currentUser')) || null;
    } catch (e) {
        return null;
    }
}

function handleLogout(e) {
    if (e) e.preventDefault();
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    window.location.href = './login.html';
}

function renderHeader() {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;

    const user = getCurrentUser();

    // Get current cart count
    let cartCount = 0;
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
    } catch (e) { }

    const cartBadgeStyle = cartCount > 0 ? 'inline-block' : 'none';

    let html = `
        <ul>
            <li><a href="./home.html"><i class="bi bi-house"></i> Trang Chủ</a></li>
            <li><a href="./book.html"><i class="bi bi-book"></i> Sách</a></li>
            <li><a href="./cart.html" class="cart-nav-link"><i class="bi bi-cart"></i> Giỏ Hàng <span id="cartBadge" class="cart-badge" style="display:${cartBadgeStyle};">${cartCount}</span></a></li>
    `;

    if (user) {
        const role = String(user.role || '').toLowerCase();
        let menuItems = '';

        if (role === 'admin') {
            menuItems = `
                <a href="./admin-dashboard.html" class="dropdown-item"><i class="bi bi-speedometer2"></i> Trang Quản Trị</a>
            `;
        } else {
            menuItems = `
                <a href="./order.html" class="dropdown-item"><i class="bi bi-bag-check"></i> Đơn Hàng Của Tôi</a>
            `;
        }

        html += `
            <li>
                <div class="nav-profile">
                    <button class="profile-btn" id="profileDropdownBtn">
                        <i class="bi bi-person-circle" style="font-size: 1.2rem;"></i>
                        <span class="profile-name">${user.name || user.username || user.email || 'User'}</span>
                        <i class="bi bi-chevron-down ms-1"></i>
                    </button>
                    <div class="profile-dropdown" id="profileDropdown" style="display:none; position:absolute; right:0; background:white; color:var(--text-dark); border-radius:8px; box-shadow:0 4px 15px rgba(0,0,0,0.1); width:200px; padding:10px 0; z-index:1000; margin-top:5px;">
                        ${menuItems}
                        <div style="height:1px; background:var(--border-color); margin:5px 0;"></div>
                        <a href="#" class="dropdown-item" id="logoutBtn" style="color:var(--danger, #ef4444);"><i class="bi bi-box-arrow-right"></i> Đăng Xuất</a>
                    </div>
                </div>
            </li>
        </ul>`;
    } else {
        html += `
            <li><a href="./login.html"><i class="bi bi-person"></i> Đăng Nhập</a></li>
        </ul>`;
    }

    navMenu.innerHTML = html;

    // Attach profile dropdown toggler
    const profileBtn = document.getElementById('profileDropdownBtn');
    const profileDropdown = document.getElementById('profileDropdown');

    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (profileDropdown.style.display === 'none') {
                profileDropdown.style.display = 'block';
            } else {
                profileDropdown.style.display = 'none';
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.style.display = 'none';
            }
        });
    }

    // Attach logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Update cart badge from API
async function updateCartBadgeFromAPI() {
    try {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || '';
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('http://localhost:5001/api/cart/count', { headers });
        if (response.ok) {
            const data = await response.json();
            const count = data.data || 0;
            const badge = document.getElementById('cartBadge');
            if (badge) {
                badge.textContent = count;
                badge.style.display = count > 0 ? 'inline-block' : 'none';
            }
        }
    } catch (e) {
        console.error('Error updating cart badge:', e);
    }
}

// Fallback: Monitor localStorage cart changes
function monitorCartChanges() {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        originalSetItem.call(this, key, value);
        if (key === 'cart') {
            updateCartBadgeFromAPI();
        }
    };
}

// Initial cart badge update
function updateCartBadge() {
    updateCartBadgeFromAPI();
}

document.addEventListener('DOMContentLoaded', () => {
    renderHeader();
    monitorCartChanges();
    // Initial badge update
    setTimeout(() => {
        updateCartBadgeFromAPI();
    }, 100);
});
