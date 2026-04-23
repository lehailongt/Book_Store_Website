// home.js - Popular books carousel & add to cart

const API_BASE = 'http://localhost:5001/api';

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price);
}

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
        font-weight: 500;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transition = 'opacity 0.3s';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

function getToken() {
    return localStorage.getItem('accessToken') || localStorage.getItem('token') || '';
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
            throw new Error(data?.message || `Lỗi: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

function createBookCard(book) {
    const categoryBadges = book.categories && book.categories.length > 0
        ? book.categories.map(cat => `<span class="category-badge">${cat.name}</span>`).join('')
        : '<span class="category-badge">Khác</span>';

    let imageSrc = book.image_url;
    if (imageSrc && !imageSrc.startsWith('/') && !imageSrc.startsWith('http')) {
        imageSrc = '../' + imageSrc;
    }

    return `
        <div class="book-card-popular" data-book-id="${book.id}">
            <div class="book-cover-popular">
                ${imageSrc ? `<img src="${imageSrc}" alt="${book.name}" class="book-cover-img">` : '<i class="bi bi-book"></i>'}
            </div>
            <div class="book-info">
                <h4 class="book-title">${book.name}</h4>
                <p class="book-author">${book.author || 'Không rõ'}</p>
                <div class="book-categories">
                    ${categoryBadges}
                </div>
                <p class="book-price">${formatPrice(book.price)}đ</p>
                <button class="btn-add-to-cart" data-book-id="${book.id}" data-book-name="${book.name}" data-book-price="${book.price}" data-book-author="${book.author}">
                    <i class="bi bi-cart-plus"></i> Thêm Vào Giỏ
                </button>
            </div>
        </div>
    `;
}

async function loadPopularBooks() {
    try {
        const response = await fetch(`${API_BASE}/books/popular?limit=12`);
        
        if (!response.ok) {
            console.error('API Error:', response.status);
            // Fallback: load all books and sort by name
            loadPopularBooksFromAll();
            return;
        }

        const result = await response.json();
        
        if (!result.success || !result.data || result.data.length === 0) {
            console.warn('No popular books data, trying fallback');
            loadPopularBooksFromAll();
            return;
        }

        renderPopularBooks(result.data);
    } catch (error) {
        console.error('Error fetching popular books:', error);
        // Fallback: load all books
        loadPopularBooksFromAll();
    }
}

async function loadPopularBooksFromAll() {
    try {
        const response = await fetch(`${API_BASE}/books`);
        if (!response.ok) {
            console.error('Could not load books');
            return;
        }
        
        const result = await response.json();
        if (result.success && result.data && result.data.length > 0) {
            // Sort by name and take first 12
            const popular = result.data.slice(0, 12);
            renderPopularBooks(popular);
        }
    } catch (error) {
        console.error('Error in fallback:', error);
    }
}

function renderPopularBooks(books) {
    const container = document.getElementById('popularBooksContainer');
    if (!container) return;

    container.innerHTML = books.map(book => createBookCard(book)).join('');

    // Attach event listeners
    document.querySelectorAll('.btn-add-to-cart').forEach(btn => {
        btn.addEventListener('click', handleAddToCart);
    });

    // Add click event to book cards to navigate to detail
    document.querySelectorAll('.book-card-popular').forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't navigate if clicking the add to cart button
            if (e.target.closest('.btn-add-to-cart')) {
                return;
            }
            const bookId = card.dataset.bookId;
            window.location.href = `book-detail.html?id=${bookId}`;
        });
    });

    // Setup carousel navigation
    setupCarouselNavigation();
}

// Carousel Navigation
function setupCarouselNavigation() {
    const carousel = document.getElementById('popularBooksContainer');
    const prevBtn = document.getElementById('carouselPrevBtn');
    const nextBtn = document.getElementById('carouselNextBtn');

    if (!carousel || !prevBtn || !nextBtn) return;

    const scrollAmount = 250; // Width of one book card + gap

    // Arrow button click handlers
    prevBtn.addEventListener('click', () => {
        carousel.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    });

    nextBtn.addEventListener('click', () => {
        carousel.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });

    // Drag functionality
    let isDown = false;
    let startX;
    let scrollLeft;

    carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
        carousel.style.cursor = 'grabbing';
    });

    document.addEventListener('mouseleave', () => {
        isDown = false;
        carousel.style.cursor = 'grab';
    });

    document.addEventListener('mouseup', () => {
        isDown = false;
        carousel.style.cursor = 'grab';
    });

    carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 1; // Adjust sensitivity
        carousel.scrollLeft = scrollLeft - walk;
    });

    // Touch support for mobile
    carousel.addEventListener('touchstart', (e) => {
        isDown = true;
        startX = e.touches[0].pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    });

    document.addEventListener('touchend', () => {
        isDown = false;
    });

    carousel.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        const x = e.touches[0].pageX - carousel.offsetLeft;
        const walk = (x - startX) * 1;
        carousel.scrollLeft = scrollLeft - walk;
    });
}

async function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();

    const btn = e.currentTarget;
    const bookId = btn.dataset.bookId;

    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        showNotification('Vui lòng đăng nhập để thêm sách vào giỏ hàng', 'error');
        setTimeout(() => {
            window.location.href = './html/login.html';
        }, 1500);
        return;
    }

    try {
        const response = await fetchAPI(`${API_BASE}/cart`, {
            method: 'POST',
            body: JSON.stringify({ book_id: bookId, quantity: 1 })
        });
        showNotification('Đã thêm vào giỏ hàng!', 'success');
        // Update cart badge realtime - instant without page reload
        updateCartBadgeFromAPI();
    } catch (error) {
        showNotification('Lỗi thêm vào giỏ hàng', 'error');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    loadPopularBooks();
});