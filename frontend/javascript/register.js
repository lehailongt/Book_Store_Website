const form = document.getElementById('registerForm');
const emailInput = document.querySelector('#email');
const phoneInput = document.querySelector('#phone');
const fullnameInput = document.querySelector('#fullname');
const dateInput = document.querySelector('#date');
const passwordInput = document.querySelector('#password');
const password2Input = document.querySelector('#password2');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    validateInputs();
});

const setError = (element, message) => {
    const formGroup = element.closest('.form-group');
    const errorDisplay = formGroup.querySelector('.error');
    
    errorDisplay.innerText = message;
    element.classList.add('is-invalid');
    errorDisplay.classList.add('show');
}

const setSuccess = element => {
    const formGroup = element.closest('.form-group');
    const errorDisplay = formGroup.querySelector('.error');
    errorDisplay.innerText = '';
    element.classList.remove('is-invalid');
    errorDisplay.classList.remove('show');
}

const isValidEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

const isValidPhone = (phone) => {
    const re = /^0\d{9}$/;
    return re.test(String(phone));
}

const validateInputs = () => {
    const emailValue = emailInput.value.trim();
    const phoneValue = phoneInput.value.trim();
    const fullnameValue = fullnameInput.value.trim();
    const dateValue = dateInput.value.trim();
    const passwordValue = passwordInput.value.trim();
    const password2Value = password2Input.value.trim();

    let isValid = true;

    if(emailValue === '') {
        setError(emailInput, 'Email không được để trống');
        isValid = false;
    } else if (!isValidEmail(emailValue)) {
        setError(emailInput, 'Email không hợp lệ');
        isValid = false;
    } else {
        setSuccess(emailInput);
    }

    if(phoneValue === '') {
        setError(phoneInput, 'Số điện thoại không được để trống');
        isValid = false;
    } else if (!isValidPhone(phoneValue)) {
        setError(phoneInput, 'Số điện thoại phải bắt đầu bằng 0 và có 10 chữ số');
        isValid = false;
    } else {
        setSuccess(phoneInput);
    }

    if(fullnameValue === '') {
        setError(fullnameInput, 'Họ và tên không được để trống');
        isValid = false;
    } else if (fullnameValue.length < 3) {
        setError(fullnameInput, 'Họ và tên phải có ít nhất 3 ký tự');
        isValid = false;
    } else {
        setSuccess(fullnameInput);
    }

    if(dateValue === '') {
        setError(dateInput, 'Ngày sinh không được để trống');
        isValid = false;
    } else {
        setSuccess(dateInput);
    }

    if(passwordValue === '') {
        setError(passwordInput, 'Mật khẩu không được để trống');
        isValid = false;
    } else if (passwordValue.length < 8 ) {
        setError(passwordInput, 'Mật khẩu phải có ít nhất 8 ký tự');
        isValid = false;
    } else {
        setSuccess(passwordInput);
    }

    if(password2Value === '') {
        setError(password2Input, 'Vui lòng xác nhận mật khẩu');
        isValid = false;
    } else if (password2Value !== passwordValue) {
        setError(password2Input, 'Mật khẩu không khớp');
        isValid = false;
    } else {
        setSuccess(password2Input);
    }

    if(isValid) {
        // perform API call to register user
        const payload = {
            full_name: fullnameValue,
            email: emailValue,
            password: passwordValue,
            date_of_birth: dateValue,
            phone_number: phoneValue
        };
        console.log('Register payload', payload);
        const API_BASE = 'http://localhost:5001/api';
        fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(r => r.json().then(data => ({ status: r.status, body: data })))
        .then(({status, body}) => {
            if (status === 201) {
                showSuccessMessage('Đăng ký thành công!');
                form.reset();
                [emailInput, phoneInput, fullnameInput, dateInput, passwordInput, password2Input].forEach(input => {
                    input.classList.remove('is-invalid');
                });
                setTimeout(() => {
                    window.location.href = './login.html';
                }, 1500);
            } else {
                showErrorMessage(body.message || 'Đăng ký thất bại');
            }
        })
        .catch(err => {
            console.error(err);
            showErrorMessage('Lỗi khi kết nối tới server');
        });
    }
}

const showSuccessMessage = (message) => {
    const form = document.getElementById('registerForm');
    let successDiv = document.querySelector('.success-message');
    
    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = 'background-color: #d4edda; color: #155724; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #c3e6cb;';
        form.parentElement.insertBefore(successDiv, form);
    }
    
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 5000);
}

const showErrorMessage = (message) => {
    const form = document.getElementById('registerForm');
    let errorDiv = document.querySelector('.error-message');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = 'background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #f5c6cb;';
        form.parentElement.insertBefore(errorDiv, form);
    }
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}