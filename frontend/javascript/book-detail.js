// Helper to parse query string
function getQueryParams() {
    const params = {};
    const query = window.location.search.substring(1);
    query.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        if (key) params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
    return params;
}

function loadBookData() {
    let book = null;
    const stored = localStorage.getItem('selectedBook');
    if (stored) {
        try {
            book = JSON.parse(stored);
        } catch (e) {
            console.error('Invalid selectedBook in storage');
        }
    }
    
    if (!book) {
        const params = getQueryParams();
        if (params.id && window.booksData) {
            book = window.booksData.find(b => b.id === params.id);
        }
    }
    return book;
}

function renderBook(book) {
    if (!book) {
        document.querySelector('.detail-main').innerHTML = '<p>Không tìm thấy sách.</p>';
        return;
    }
    
    // fill info
    document.querySelector('.title').textContent = book.name;
    document.querySelector('.author').textContent = book.author;
    document.querySelector('.rating .rating-value').textContent = book.rating;
    document.querySelector('.rating .reviews-count').textContent = book.reviews;
    document.querySelector('.price').textContent = formatPrice(book.price) + 'đ';
    if (book.originalPrice && book.originalPrice > book.price) {
        document.querySelector('.original-price').textContent = formatPrice(book.originalPrice) + 'đ';
    }
    document.querySelector('.short-desc').textContent = book.description;
    
    // details
    document.querySelector('.detail-title').textContent = book.name;
    document.querySelector('.detail-author').textContent = book.author;
    document.querySelector('.detail-isbn').textContent = book.isbn || book.id;
    document.querySelector('.detail-language').textContent = book.language || 'Tiếng Việt';
    document.querySelector('.detail-format').textContent = book.format || 'Bìa mềm';
    document.querySelector('.detail-published').textContent = book.published || '';
    document.querySelector('.detail-publisher').textContent = book.publisher || '';
    
    // wishlist state
    const wishBtn = document.getElementById('wishBtn');
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    if (wishlist.includes(book.id)) {
        wishBtn.classList.add('active');
        wishBtn.querySelector('i').classList.replace('bi-heart','bi-heart-fill');
    }
    wishBtn.addEventListener('click', () => {
        toggleWishlist(book.id, wishBtn);
    });

    // quantity buttons
    const qtyInput = document.getElementById('qtyInput');
    document.getElementById('qtyMinus').addEventListener('click', () => {
        if (qtyInput.value > 1) qtyInput.value--;
    });
    document.getElementById('qtyPlus').addEventListener('click', () => {
        qtyInput.value++;
    });

    // buy button
    document.getElementById('buyBtn').addEventListener('click', () => {
        addToCart(book, parseInt(qtyInput.value));
    });

    renderRelated(book);
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price);
}

function toggleWishlist(bookId, btn) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const idx = wishlist.indexOf(bookId);
    if (idx > -1) {
        wishlist.splice(idx,1);
        btn.classList.remove('active');
        btn.querySelector('i').classList.replace('bi-heart-fill','bi-heart');
    } else {
        wishlist.push(bookId);
        btn.classList.add('active');
        btn.querySelector('i').classList.replace('bi-heart','bi-heart-fill');
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function addToCart(book, quantity=1) {
    // Kiểm tra xem user đã đăng nhập chưa
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        showNotification('Vui lòng đăng nhập để thêm sách vào giỏ hàng', 'error');
        setTimeout(() => {
            window.location.href = './login.html';
        }, 1500);
        return;
    }
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item.id === book.id);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            id: book.id,
            name: book.name,
            author: book.author,
            price: book.price,
            quantity: quantity
        });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    showNotification('Đã thêm vào giỏ hàng!');
}

function showNotification(msg, type = 'success') {
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
    notification.textContent = msg;
    document.body.appendChild(notification);
    setTimeout(()=>notification.remove(),3000);
}

function renderRelated(book) {
    const container = document.getElementById('relatedBooks');
    container.innerHTML = '';
    if (!window.booksData) return;
    const related = window.booksData.filter(b => (b.category === book.category || b.author === book.author) && b.id !== book.id).slice(0,4);
    related.forEach(b => {
        const el = document.createElement('div');
        el.className = 'book-item';
        el.innerHTML = `
            <div class="book-cover"><i class="bi bi-book"></i></div>
            <div class="book-info">
                <h4 class="book-title">${b.name}</h4>
                <p class="book-author">${b.author}</p>
            </div>
        `;
        el.addEventListener('click', () => {
            localStorage.setItem('selectedBook', JSON.stringify(b));
            window.location.href = './book-detail.html?id=' + encodeURIComponent(b.id);
        });
        container.appendChild(el);
    });
}

// initialize
document.addEventListener('DOMContentLoaded', () => {
    const book = loadBookData();
    renderBook(book);
});