// home.js - Handle add to cart for home page

document.addEventListener('DOMContentLoaded', () => {
    const homeBooks = [
        {
            id: 'B001',
            name: 'Đắc Nhân Tâm',
            author: 'Dale Carnegie',
            price: 45000,
            originalPrice: 60000,
            category: 'self-help'
        },
        {
            id: 'B002',
            name: '1984',
            author: 'George Orwell',
            price: 55000,
            originalPrice: 70000,
            category: 'fiction'
        },
        {
            id: 'B003',
            name: 'Tư Duy Hệ Thống',
            author: 'Donella H. Meadows',
            price: 65000,
            originalPrice: 85000,
            category: 'education'
        },
        {
            id: 'B004',
            name: 'Thói Quen Nguyên Tử',
            author: 'James Clear',
            price: 48000,
            originalPrice: 60000,
            category: 'self-help'
        }
    ];

    const addCartButtons = document.querySelectorAll('.btn-add-cart');
    
    addCartButtons.forEach((btn, index) => {
        if (index < homeBooks.length) {
            const book = homeBooks[index];
            
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Kiểm tra xem user đã đăng nhập chưa
                const currentUser = localStorage.getItem('currentUser');
                if (!currentUser) {
                    showNotification('Vui lòng đăng nhập để thêm sách vào giỏ hàng', 'error');
                    setTimeout(() => {
                        window.location.href = './html/login.html';
                    }, 1500);
                    return;
                }
                
                // Thêm vào giỏ hàng
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                const existingItem = cart.find(item => item.id === book.id);
                
                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    cart.push({
                        id: book.id,
                        name: book.name,
                        author: book.author,
                        price: book.price,
                        quantity: 1
                    });
                }
                
                localStorage.setItem('cart', JSON.stringify(cart));
                showNotification('Đã thêm vào giỏ hàng!', 'success');
            });
        }
    });
});

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const bgColor = type === 'error' 
        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideUp 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
