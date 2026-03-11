// API base URL
const API_BASE = 'http://localhost:5001/api';

// Helper to get query parameters
function getQueryParams() {
    const params = {};
    const query = window.location.search.substring(1);
    query.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        if (key) params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
    return params;
}

// Get token for API calls
function getToken() {
    return localStorage.getItem('accessToken') || localStorage.getItem('token') || '';
}

// Fetch with auth header
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

// Fetch book details from API
async function fetchBookDetails(bookId) {
    try {
        const response = await fetch(`${API_BASE}/books/${bookId}`);
        if (!response.ok) {
            throw new Error('Không tìm thấy sách');
        }
        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error fetching book details:', error);
        return null;
    }
}

// Fetch all books for related books
async function fetchAllBooks() {
    try {
        const response = await fetch(`${API_BASE}/books`);
        if (!response.ok) {
            throw new Error('Không thể tải danh sách sách');
        }
        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error fetching books:', error);
        return [];
    }
}

// Render book details
function renderBook(book) {
    if (!book) {
        document.querySelector('.detail-main').innerHTML = '<div style="text-align: center; padding: 50px;"><h2>Không tìm thấy sách</h2><p>Sách bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p><a href="./book.html" class="btn btn-primary">Quay lại trang sách</a></div>';
        return;
    }

    // Set page title
    document.title = `${book.name} - BookStore`;

    // Book image - fix relative path
    const bookImage = document.getElementById('bookImage');
    let imageSrc = book.image_url;
    if (imageSrc && !imageSrc.startsWith('/') && !imageSrc.startsWith('http')) {
        imageSrc = '../' + imageSrc;
    }
    bookImage.src = imageSrc || '../images/pages/sample-book.png';
    bookImage.alt = book.name;

    // Book info
    document.getElementById('bookTitle').textContent = book.name;
    document.getElementById('bookAuthor').textContent = `Tác giả: ${book.author}`;
    document.getElementById('bookPrice').textContent = formatPrice(book.price) + 'đ';

    // Categories
    const categoriesContainer = document.getElementById('bookCategories');
    if (book.categories && book.categories.length > 0) {
        categoriesContainer.innerHTML = book.categories.map(cat =>
            `<span class="category-badge">${cat.name}</span>`
        ).join('');
    } else {
        categoriesContainer.innerHTML = '';
    }

    // Description
    document.getElementById('bookDescription').textContent = book.description || 'Không có mô tả.';

    // Details table
    document.getElementById('detailTitle').textContent = book.name;
    document.getElementById('detailAuthor').textContent = book.author;
    document.getElementById('detailPrice').textContent = formatPrice(book.price) + 'đ';
    document.getElementById('detailPublishDate').textContent = book.publish_date ? new Date(book.publish_date).toLocaleDateString('vi-VN') : 'Chưa cập nhật';
    
    // Handle categories array
    const categoriesText = book.categories && book.categories.length > 0
        ? book.categories.map(cat => cat.name).join(', ')
        : 'Chưa phân loại';
    document.getElementById('detailCategories').textContent = categoriesText;

    // Setup quantity controls
    setupQuantityControls();

    // Setup add to cart
    setupAddToCart(book);
}

// Setup quantity increment/decrement
function setupQuantityControls() {
    const qtyInput = document.getElementById('qtyInput');
    const qtyMinus = document.getElementById('qtyMinus');
    const qtyPlus = document.getElementById('qtyPlus');

    qtyMinus.addEventListener('click', () => {
        const currentValue = parseInt(qtyInput.value);
        if (currentValue > 1) {
            qtyInput.value = currentValue - 1;
        }
    });

    qtyPlus.addEventListener('click', () => {
        const currentValue = parseInt(qtyInput.value);
        if (currentValue < 99) {
            qtyInput.value = currentValue + 1;
        }
    });

    qtyInput.addEventListener('input', () => {
        let value = parseInt(qtyInput.value);
        if (isNaN(value) || value < 1) {
            value = 1;
        } else if (value > 99) {
            value = 99;
        }
        qtyInput.value = value;
    });
}

// Setup add to cart functionality - using API
async function setupAddToCart(book) {
    const addToCartBtn = document.getElementById('addToCartBtn');

    addToCartBtn.addEventListener('click', async () => {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            showNotification('Vui lòng đăng nhập để thêm sách vào giỏ hàng', 'error');
            setTimeout(() => {
                window.location.href = './login.html';
            }, 1500);
            return;
        }

        const qtyInput = document.getElementById('qtyInput');
        const quantity = parseInt(qtyInput.value);

        try {
            const response = await fetchAPI(`${API_BASE}/cart`, {
                method: 'POST',
                body: JSON.stringify({ book_id: book.id, quantity: quantity })
            });

            showNotification(`Đã thêm ${quantity} cuốn "${book.name}" vào giỏ hàng!`);
            
            // Update cart badge realtime
            updateCartBadgeFromAPI();
            
            // Reset quantity
            qtyInput.value = 1;
        } catch (error) {
            showNotification('Lỗi thêm vào giỏ hàng: ' + error.message, 'error');
        }
    });
}

// Render related books - single row carousel
async function renderRelatedBooks(currentBook) {
    const container = document.getElementById('relatedBooks');

    try {
        const allBooks = await fetchAllBooks();
        
        // Get current book categories
        const currentCategories = currentBook.categories ? currentBook.categories.map(c => c.name) : [];
        
        // Filter related books: same category OR same author
        const related = allBooks
            .filter(book => {
                if (book.id === currentBook.id) return false;
                
                // Check if same author
                if (book.author === currentBook.author) return true;
                
                // Check if books share at least one category
                if (book.categories && book.categories.length > 0) {
                    const bookCategories = book.categories.map(c => c.name);
                    return currentCategories.some(cat => bookCategories.includes(cat));
                }
                
                return false;
            })
            .slice(0, 12);

        if (related.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 20px;">Không có sách liên quan.</p>';
            return;
        }

        // Render as carousel row (CSS handles styling)
        container.classList.add('related-books');
        
        container.innerHTML = related.map(book => {
            const categoryBadges = book.categories && book.categories.length > 0
                ? book.categories.map(cat => `<span class="category-badge">${cat.name}</span>`).join('')
                : '<span class="category-badge">Khác</span>';
            
            let imageSrc = book.image_url;
            if (imageSrc && !imageSrc.startsWith('/') && !imageSrc.startsWith('http')) {
                imageSrc = '../' + imageSrc;
            }

            return `
                <div class="related-book-card" data-book-id="${book.id}">
                    <div class="book-cover-popular">
                        ${imageSrc ? `<img src="${imageSrc}" alt="${book.name}" class="related-book-img">` : '<i class="bi bi-book"></i>'}
                    </div>
                    <div class="book-info">
                        <h4 class="book-title">${book.name}</h4>
                        <p class="book-author">${book.author || 'Không rõ'}</p>
                        <div class="book-categories">
                            ${categoryBadges}
                        </div>
                        <p class="book-price">${formatPrice(book.price)}đ</p>
                    </div>
                </div>
            `;
        }).join('');

        // Add click handlers
        document.querySelectorAll('.related-book-card').forEach(card => {
            card.addEventListener('click', () => {
                const bookId = card.dataset.bookId;
                window.location.href = `./book-detail.html?id=${bookId}`;
            });
        });

    } catch (error) {
        console.error('Error rendering related books:', error);
        container.innerHTML = '<p style="text-align: center; padding: 20px;">Không thể tải sách liên quan.</p>';
    }
}

// Render books by the same author
async function renderBooksByAuthor(currentBook) {
    const container = document.getElementById('authorBooks');
    
    try {
        const allBooks = await fetchAllBooks();
        
        // Filter books by same author only
        const authorBooks = allBooks
            .filter(book => {
                if (book.id === currentBook.id) return false;
                return book.author === currentBook.author;
            })
            .slice(0, 12);

        if (authorBooks.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 20px;">Không có sách khác từ tác giả này.</p>';
            return;
        }

        // Render as carousel row (CSS handles styling)
        container.classList.add('author-books');
        
        container.innerHTML = authorBooks.map(book => {
            const categoryBadges = book.categories && book.categories.length > 0
                ? book.categories.map(cat => `<span class="category-badge">${cat.name}</span>`).join('')
                : '<span class="category-badge">Khác</span>';
            
            let imageSrc = book.image_url;
            if (imageSrc && !imageSrc.startsWith('/') && !imageSrc.startsWith('http')) {
                imageSrc = '../' + imageSrc;
            }

            return `
                <div class="author-book-card" data-book-id="${book.id}">
                    <div class="book-cover-popular">
                        ${imageSrc ? `<img src="${imageSrc}" alt="${book.name}" class="author-book-img">` : '<i class="bi bi-book"></i>'}
                    </div>
                    <div class="book-info">
                        <h4 class="book-title">${book.name}</h4>
                        <p class="book-author">${book.author || 'Không rõ'}</p>
                        <div class="book-categories">
                            ${categoryBadges}
                        </div>
                        <p class="book-price">${formatPrice(book.price)}đ</p>
                    </div>
                </div>
            `;
        }).join('');

        // Add click handlers
        document.querySelectorAll('.author-book-card').forEach(card => {
            card.addEventListener('click', () => {
                const bookId = card.dataset.bookId;
                window.location.href = `./book-detail.html?id=${bookId}`;
            });
        });

    } catch (error) {
        console.error('Error rendering author books:', error);
        container.innerHTML = '<p style="text-align: center; padding: 20px;">Không thể tải sách của tác giả.</p>';
    }
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price);
}

// Show notification  
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

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    const params = getQueryParams();
    const bookId = params.id;

    if (!bookId) {
        document.querySelector('.detail-main').innerHTML = '<div style="text-align: center; padding: 50px;"><h2>Thiếu thông tin sách</h2><p>Vui lòng chọn một cuốn sách để xem chi tiết.</p><a href="./book.html" class="btn btn-primary">Xem tất cả sách</a></div>';
        return;
    }

    // Show loading
    document.querySelector('.detail-main').innerHTML = '<div style="text-align: center; padding: 50px;"><h2>Đang tải...</h2></div>';

    // Fetch book details
    const book = await fetchBookDetails(bookId);

    if (book) {
        // Re-render the page with book data
        document.querySelector('.detail-main').innerHTML = `
            <div class="detail-container">
                <div class="book-image">
                    <img id="bookImage" src="" alt="Book Cover" onerror="this.src='../images/pages/default-book.png'">
                </div>
                <div class="book-info">
                    <h1 id="bookTitle"></h1>
                    <p class="author" id="bookAuthor"></p>
                    <div class="price-section">
                        <span class="price" id="bookPrice"></span>
                    </div>
                    <div class="categories" id="bookCategories"></div>
                    <div class="quantity">
                        <button class="qty-btn" id="qtyMinus">-</button>
                        <input type="number" id="qtyInput" value="1" min="1" max="99">
                        <button class="qty-btn" id="qtyPlus">+</button>
                    </div>
                    <div class="actions">
                        <button class="btn btn-primary" id="addToCartBtn">
                            <i class="bi bi-cart-plus"></i> Thêm vào giỏ hàng
                        </button>
                    </div>
                    <div class="description">
                        <h3>Mô tả</h3>
                        <p id="bookDescription"></p>
                    </div>
                </div>
            </div>

            <div class="book-details">
                <h3>Thông Tin Chi Tiết</h3>
                <table>
                    <tr>
                        <td>Tiêu đề</td>
                        <td id="detailTitle"></td>
                    </tr>
                    <tr>
                        <td>Tác giả</td>
                        <td id="detailAuthor"></td>
                    </tr>
                    <tr>
                        <td>Giá</td>
                        <td id="detailPrice"></td>
                    </tr>
                    <tr>
                        <td>Ngày xuất bản</td>
                        <td id="detailPublishDate"></td>
                    </tr>
                    <tr>
                        <td>Thể loại</td>
                        <td id="detailCategories"></td>
                    </tr>
                </table>
            </div>

            <div class="related-section">
                <h3>Sách Liên Quan</h3>
                <div class="related-books" id="relatedBooks">
                    <p>Đang tải...</p>
                </div>
            </div>

            <div class="author-books-section">
                <h3>Sách Cùng Tác Giả</h3>
                <div class="author-books" id="authorBooks">
                    <p>Đang tải...</p>
                </div>
            </div>
        `;

        renderBook(book);
        renderRelatedBooks(book);
        renderBooksByAuthor(book);
    } else {
        document.querySelector('.detail-main').innerHTML = '<div style="text-align: center; padding: 50px;"><h2>Không tìm thấy sách</h2><p>Sách bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p><a href="./book.html" class="btn btn-primary">Quay lại trang sách</a></div>';
    }
});