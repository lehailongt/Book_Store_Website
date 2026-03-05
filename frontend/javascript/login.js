const email = document.getElementById('email');
const password = document.getElementById('password');
const loginForm = document.getElementById('loginForm');
const loginButton = document.getElementById('login-button');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validation
    if (!email.value.trim()) {
        showError('Email không được để trống');
        return;
    }
    
    if (!password.value.trim()) {
        showError('Mật khẩu không được để trống');
        return;
    }
    
    // Disable button during request
    loginButton.disabled = true;
    loginButton.innerHTML = '<i class="bi bi-arrow-repeat"></i> Đang tiến hành...';
    
    try {
        const emailValue = email.value;
        const passwordValue = password.value;   
        const API_BASE = 'http://localhost:5001/api';
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {  
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: emailValue, password: passwordValue })
        });
        const data = await response.json();
        if (response.ok) {
            // Lưu thông tin user
            if (data.user) {
                localStorage.setItem('currentUser', JSON.stringify(data.user));
            } else {
                const user = { email: emailValue, name: data.name || '' };
                localStorage.setItem('currentUser', JSON.stringify(user));
            }
            // Lưu token để trang admin sử dụng
            if (data.token) {
                localStorage.setItem('accessToken', data.token);
                localStorage.setItem('token', data.token);
            }

            showSuccess(data.message || 'Đăng nhập thành công!');

            // Chuyển hướng theo role (đường dẫn tương đối từ login.html)
            const role = (data.user && (data.user.role || data.user.Role)) ? String(data.user.role || data.user.Role).toLowerCase() : '';
            const target = role === 'admin' ? './admin-user.html' : './home.html';

            setTimeout(() => {
                window.location.href = target;
            }, 600);
        } else {
            showError(data.message || 'Đăng nhập thất bại');
        }
    } catch (error) {
        showError('Có lỗi xảy ra. Vui lòng thử lại.');
        console.error('Error:', error);
    } finally {
        loginButton.disabled = false;
        loginButton.innerHTML = '<i class="bi bi-check-circle"></i> Đăng Nhập';
    }
});

const showError = (message) => {
    let errorDiv = document.querySelector('.error-message');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = 'background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #f5c6cb; display: none;';
        loginForm.parentElement.insertBefore(errorDiv, loginForm);
    }
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

const showSuccess = (message) => {
    let successDiv = document.querySelector('.success-message');
    
    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = 'background-color: #d4edda; color: #155724; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #c3e6cb;';
        loginForm.parentElement.insertBefore(successDiv, loginForm);
    }
    
    successDiv.textContent = message;
    successDiv.style.display = 'block';
}
