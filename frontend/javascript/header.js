// header.js - Quản lý header động dựa trên login state

function initializeHeader() {
    const navMenu = document.querySelector('.nav-menu ul');
    if (!navMenu) return;

    // Kiểm tra xem user đã đăng nhập chưa
    const currentUser = localStorage.getItem('currentUser');
    
    // Tìm link đăng nhập
    const loginLink = Array.from(navMenu.querySelectorAll('li a')).find(a => 
        a.textContent.includes('Đăng Nhập') || a.href.includes('login.html')
    );
    
    if (!loginLink) return;
    
    const loginLi = loginLink.parentElement;
    
    if (currentUser) {
        // User đã đăng nhập - thay thế link đăng nhập bằng dropdown profile
        const user = JSON.parse(currentUser);
        
        loginLi.innerHTML = `
            <div class="nav-profile">
                <button class="profile-btn" id="profileBtn">
                    <img src="${user.image_url || 'https://via.placeholder.com/40'}" alt="Profile" class="profile-img">
                    <span class="profile-name">${user.name || user.email || 'Người dùng'}</span>
                    <i class="bi bi-chevron-down"></i>
                </button>
                <div class="profile-dropdown" id="profileDropdown">
                    <a href="${user.order_page || './order.html'}" class="dropdown-item">
                        <i class="bi bi-bag"></i> Đơn Hàng
                    </a>
                    <a href="./profile.html" class="dropdown-item" style="display: none;">
                        <i class="bi bi-person"></i> Hồ Sơ
                    </a>
                    <a href="#" class="dropdown-item" id="logoutBtn">
                        <i class="bi bi-box-arrow-right"></i> Đăng Xuất
                    </a>
                </div>
            </div>
        `;
        
        // Thêm event listeners cho profile dropdown
        const profileBtn = document.getElementById('profileBtn');
        const profileDropdown = document.getElementById('profileDropdown');
        
        if (profileBtn && profileDropdown) {
            profileBtn.addEventListener('click', () => {
                profileDropdown.classList.toggle('show');
            });
            
            // Đóng dropdown khi click bên ngoài
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.nav-profile')) {
                    profileDropdown.classList.remove('show');
                }
            });
        }
        
        // Xử lý đăng xuất
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                window.location.href = './home.html';
            });
        }
        
        // Thêm link "Đơn Hàng" vào menu nếu chưa có
        const orderLink = Array.from(navMenu.querySelectorAll('li a')).find(a =>
            a.textContent.includes('Đơn Hàng') || a.href.includes('order.html')
        );
        
        if (!orderLink) {
            const orderLi = document.createElement('li');
            orderLi.innerHTML = `<a href="./order.html"><i class="bi bi-bag"></i> Đơn Hàng</a>`;
            // Thêm trước phần profile
            navMenu.insertBefore(orderLi, loginLi);
        }
    } else {
        // User chưa đăng nhập - kiểm tra xem Order link có tồn tại không
        const orderLink = Array.from(navMenu.querySelectorAll('li a')).find(a =>
            a.textContent.includes('Đơn Hàng') || a.href.includes('order.html')
        );
        
        if (orderLink) {
            orderLink.parentElement.remove();
        }
    }
}

// Gọi hàm khi DOM load
document.addEventListener('DOMContentLoaded', initializeHeader);
