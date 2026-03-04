// Form Validation and Handling for Sell Book Form

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('sellBookForm');
    const inputs = form.querySelectorAll('.form-control');

    // Add validation to all inputs
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', function() {
            if (this.classList.contains('is-invalid')) {
                validateField.call(this);
            }
        });
    });

    // Form submit handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate all fields
        let isValid = true;
        inputs.forEach(input => {
            if (!validateField.call(input)) {
                isValid = false;
            }
        });

        if (isValid) {
            submitForm();
        }
    });

    // Reset button handler
    const resetBtn = document.querySelector('.btn-secondary');
    resetBtn.addEventListener('click', function() {
        form.reset();
        inputs.forEach(input => {
            input.classList.remove('is-invalid');
            const errorDiv = input.parentElement.querySelector('.error');
            if (errorDiv) errorDiv.classList.remove('show');
        });
    });
});

// Validation function
function validateField() {
    const field = this;
    const value = field.value.trim();
    const fieldName = field.name;
    const errorDiv = field.parentElement.querySelector('.error');
    let isValid = true;
    let errorMessage = '';

    // Remove previous error styling
    field.classList.remove('is-invalid');
    if (errorDiv) errorDiv.classList.remove('show');

    // Required field check
    if (!value) {
        isValid = false;
        errorMessage = 'Trường này không được bỏ trống';
    }

    // Type-specific validation
    if (isValid) {
        switch (fieldName) {
            case 'bookTitle':
                if (value.length < 3) {
                    isValid = false;
                    errorMessage = 'Tên sách phải có ít nhất 3 ký tự';
                }
                break;

            case 'author':
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Tên tác giả phải có ít nhất 2 ký tự';
                }
                break;

            case 'publicationYear':
                const year = parseInt(value);
                if (year < 1900 || year > new Date().getFullYear()) {
                    isValid = false;
                    errorMessage = 'Năm xuất bản không hợp lệ';
                }
                break;

            case 'pages':
                const pages = parseInt(value);
                if (pages < 1 || pages > 5000) {
                    isValid = false;
                    errorMessage = 'Số trang không hợp lệ (1-5000)';
                }
                break;

            case 'price':
                const price = parseInt(value);
                if (price < 0 || price > 1000000000) {
                    isValid = false;
                    errorMessage = 'Giá bán không hợp lệ';
                }
                if (price === 0) {
                    isValid = false;
                    errorMessage = 'Giá bán phải lớn hơn 0';
                }
                break;

            case 'sellerPhone':
                const phoneRegex = /^0\d{9}$/;
                if (!phoneRegex.test(value) && value.length > 0) {
                    isValid = false;
                    errorMessage = 'Số điện thoại phải bắt đầu bằng 0 và có 10 chữ số';
                }
                break;

            case 'image':
                const file = field.files[0];
                if (!file) {
                    isValid = false;
                    errorMessage = 'Vui lòng chọn ảnh sách';
                } else {
                    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
                    if (!validTypes.includes(file.type)) {
                        isValid = false;
                        errorMessage = 'Chỉ chấp nhận ảnh JPG, PNG, GIF';
                    }
                    if (file.size > 5 * 1024 * 1024) { // 5MB
                        isValid = false;
                        errorMessage = 'Kích thước ảnh không được vượt quá 5MB';
                    }
                }
                break;
        }
    }

    // Show error if invalid
    if (!isValid) {
        field.classList.add('is-invalid');
        if (errorDiv) {
            errorDiv.textContent = errorMessage;
            errorDiv.classList.add('show');
        }
    }

    return isValid;
}

// Form submit handler
function submitForm() {
    const form = document.getElementById('sellBookForm');
    const formData = new FormData(form);

    // Display loading message
    console.log('Form data ready to send:');
    console.log({
        bookTitle: formData.get('bookTitle'),
        author: formData.get('author'),
        category: formData.get('category'),
        publicationYear: formData.get('publicationYear'),
        pages: formData.get('pages'),
        condition: formData.get('condition'),
        price: formData.get('price'),
        description: formData.get('description'),
        sellerName: formData.get('sellerName'),
        sellerPhone: formData.get('sellerPhone')
    });

    // Show success message
    showSuccessMessage('Đăng bán sách thành công! Sách của bạn đã được lưu.');

    // Reset form
    setTimeout(() => {
        form.reset();
        document.querySelectorAll('.form-control').forEach(input => {
            input.classList.remove('is-invalid');
        });
    }, 1500);

    // In a real application, you would send this to the server:
    // fetch('/api/sell-book', {
    //     method: 'POST',
    //     body: formData
    // })
    // .then(response => response.json())
    // .then(data => {
    //     showSuccessMessage('Đăng bán sách thành công!');
    //     form.reset();
    // })
    // .catch(error => {
    //     showErrorMessage('Có lỗi xảy ra. Vui lòng thử lại.');
    //     console.error('Error:', error);
    // });
}

// Success message display
function showSuccessMessage(message) {
    const form = document.getElementById('sellBookForm');
    let successDiv = document.querySelector('.success-message');
    
    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        form.parentElement.insertBefore(successDiv, form);
    }
    
    successDiv.textContent = message;
    successDiv.classList.add('show');
    
    setTimeout(() => {
        successDiv.classList.remove('show');
    }, 4000);
}

// Error message display
function showErrorMessage(message) {
    const form = document.getElementById('sellBookForm');
    let errorDiv = document.querySelector('.error-message');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = 'background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: none; border: 1px solid #f5c6cb;';
        form.parentElement.insertBefore(errorDiv, form);
    }
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 4000);
}

// Preview image before upload (optional enhancement)
document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('image');
    
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    // You can use this to show a preview
                    console.log('Image selected:', file.name);
                };
                reader.readAsDataURL(file);
            }
        });
    }
});
