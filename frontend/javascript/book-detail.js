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

    // Book image - Updated path for images/books/{id}.png
    const bookImage = document.getElementById('bookImage');
    bookImage.src = book.image_url ? `../${book.image_url}` : '../images/pages/sample-book.png';
    bookImage.alt = book.name;

    // Book info
    document.getElementById('bookTitle').textContent = book.name;
    document.getElementById('bookAuthor').textContent = `Tác giả: ${book.author}`;
    document.getElementById('bookPrice').textContent = formatPrice(book.price);

    // Categories
    const categoriesContainer = document.getElementById('bookCategories');
    if (book.categories) {
        const categories = book.categories.split(',');
        categoriesContainer.innerHTML = categories.map(cat =>
            `<span>${cat.trim()}</span>`
        ).join('');
    } else {
        categoriesContainer.innerHTML = '';
    }

    // Description
    document.getElementById('bookDescription').textContent = book.description || 'Không có mô tả.';

    // Details table
    document.getElementById('detailTitle').textContent = book.name;
    document.getElementById('detailAuthor').textContent = book.author;
    document.getElementById('detailPrice').textContent = formatPrice(book.price);
    document.getElementById('detailPublishDate').textContent = book.publish_date ? new Date(book.publish_date).toLocaleDateString('vi-VN') : 'Chưa cập nhật';
    document.getElementById('detailCategories').textContent = book.categories || 'Chưa phân loại';

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

// Setup add to cart functionality
function setupAddToCart(book) {
    const addToCartBtn = document.getElementById('addToCartBtn');

    addToCartBtn.addEventListener('click', () => {
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
                image_url: book.image_url,
                quantity: quantity
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        showNotification(`Đã thêm ${quantity} cuốn "${book.name}" vào giỏ hàng!`);

        // Update cart count in header if available
        updateCartCount();
    });
}

// Render related books
async function renderRelatedBooks(currentBook) {
    const container = document.getElementById('relatedBooks');

    try {
        const allBooks = await fetchAllBooks();
        
        // Get current book categories as array
        const currentCategories = currentBook.categories ? currentBook.categories.split(',').map(c => c.trim()) : [];
        
        const related = allBooks
            .filter(book => {
                if (book.id === currentBook.id) return false;
                
                // Check if books share at least one category
                const bookCategories = book.categories ? book.categories.split(',').map(c => c.trim()) : [];
                const hasCommonCategory = currentCategories.some(cat => bookCategories.includes(cat));
                
                return hasCommonCategory;
            })
            .slice(0, 4);

        if (related.length === 0) {
            container.innerHTML = '<p>Không có sách liên quan.</p>';
            return;
        }

        container.innerHTML = related.map(book => `
            <div class="book-item" onclick="goToBookDetail(${book.id})">
                <div class="book-cover">
                    <img src="${book.image_url ? `../${book.image_url}` : '../images/pages/sample-book.png'}"
                         alt="${book.name}"
                         onerror="this.src='../images/pages/sample-book.png'">
                </div>
                <div class="book-info">
                    <h4 class="book-title">${book.name}</h4>
                    <p class="book-author">${book.author}</p>
                    <p class="book-price">${formatPrice(book.price)}</p>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error rendering related books:', error);
        container.innerHTML = '<p>Không thể tải sách liên quan.</p>';
    }
}

// Navigate to book detail
function goToBookDetail(bookId) {
    window.location.href = `./book-detail.html?id=${bookId}`;
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Update cart count (if header has cart count element)
function updateCartCount() {
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
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
                        <button class="btn btn-outline-secondary" id="wishBtn">
                            <i class="bi bi-heart"></i>
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
        `;

        renderBook(book);
        renderRelatedBooks(book);
    } else {
        document.querySelector('.detail-main').innerHTML = '<div style="text-align: center; padding: 50px;"><h2>Không tìm thấy sách</h2><p>Sách bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p><a href="./book.html" class="btn btn-primary">Quay lại trang sách</a></div>';
    }
});