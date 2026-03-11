// API Configuration
const API_BASE = 'http://localhost:5001/api';

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

// State Management
const state = {
    allBooks: [],
    filteredBooks: [],
    allCategories: [],
    currentPage: 1,
    itemsPerPage: 12,
    currentView: 'grid',
    wishlist: JSON.parse(localStorage.getItem('wishlist')) || []
};

// DOM Elements
const searchNameInput = document.getElementById('searchName');
const searchBookIdInput = document.getElementById('searchBookId');
const searchAuthorInput = document.getElementById('searchAuthor');
const searchKeywordsInput = document.getElementById('searchKeywords');
const minPriceInput = document.getElementById('minPrice');
const maxPriceInput = document.getElementById('maxPrice');
const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
const applyFilterBtn = document.getElementById('applyFilter');
const resetFilterBtn = document.getElementById('resetFilter');
const sortBySelect = document.getElementById('sortBy');
const viewBtns = document.querySelectorAll('.view-btn');
const booksContainer = document.getElementById('booksContainer');
const paginationContainer = document.getElementById('paginationContainer');
const noResults = document.getElementById('noResults');
const totalBooksSpan = document.getElementById('totalBooks');

// Fetch data from API
async function fetchBooksData() {
    try {
        const response = await fetch(`${API_BASE}/books`);
        const result = await response.json();
        if (result.success) {
            window.booksData = result.data.map(book => ({
                id: book.id,
                name: book.name,
                author: book.author,
                price: parseInt(book.price),
                description: book.description || 'Không có mô tả',
                categories: book.categories || [],
                image_url: book.image_url,
                publish_date: book.publish_date,
                keywords: book.name.toLowerCase()
            }));
            state.allBooks = [...window.booksData];
            state.filteredBooks = [...window.booksData];
        }
    } catch (error) {
        console.error('Error fetching books:', error);
        showNotification('Lỗi khi tải danh sách sách', 'error');
    }
}

async function fetchCategoriesData() {
    try {
        const response = await fetch(`${API_BASE}/books/categories/all`);
        const result = await response.json();
        if (result.success) {
            state.allCategories = result.data;
            populateCategories();
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

function populateCategories() {
    const categoriesList = document.querySelector('.categories-list');
    if (!categoriesList) return;
    
    // Xóa các checkbox cũ
    const existingCheckboxes = categoriesList.querySelectorAll('.checkbox-item');
    existingCheckboxes.forEach(item => item.remove());
    
    // Thêm checkbox mới dựa trên danh sách từ API
    state.allCategories.forEach(category => {
        const label = document.createElement('label');
        label.className = 'checkbox-item';
        label.innerHTML = `
            <input type="checkbox" value="${category.name}" class="category-checkbox">
            <span>${category.name}</span>
        `;
        categoriesList.appendChild(label);
    });
    
    // Re-attach event listeners cho checkbox mới
    const newCheckboxes = document.querySelectorAll('.category-checkbox');
    newCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });
}

// Event Listeners
applyFilterBtn.addEventListener('click', applyFilters);
resetFilterBtn.addEventListener('click', resetFilters);
sortBySelect.addEventListener('change', applySorting);
viewBtns.forEach(btn => btn.addEventListener('click', changeView));

// Real-time search (update on input)
searchNameInput.addEventListener('input', applyFilters);
searchBookIdInput.addEventListener('input', applyFilters);
searchAuthorInput.addEventListener('input', applyFilters);
searchKeywordsInput.addEventListener('input', applyFilters);
minPriceInput.addEventListener('input', applyFilters);
maxPriceInput.addEventListener('input', applyFilters);

// Filter Logic
function applyFilters() {
    const searchName = searchNameInput.value.toLowerCase().trim();
    const searchBookId = searchBookIdInput.value.toLowerCase().trim();
    const searchAuthor = searchAuthorInput.value.toLowerCase().trim();
    const searchKeywords = searchKeywordsInput.value.toLowerCase().trim();
    const minPrice = parseInt(minPriceInput.value) || 0;
    const maxPrice = parseInt(maxPriceInput.value) || Infinity;
    
    const selectedCategories = Array.from(categoryCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    state.filteredBooks = state.allBooks.filter(book => {
        const matchName = book.name.toLowerCase().includes(searchName);
        const matchBookId = book.id.toString().toLowerCase().includes(searchBookId);
        const matchAuthor = book.author.toLowerCase().includes(searchAuthor);
        const matchKeywords = book.keywords.toLowerCase().includes(searchKeywords);
        const matchPrice = book.price >= minPrice && book.price <= maxPrice;
        
        // Check if book has any of the selected categories
        let matchCategory = selectedCategories.length === 0;
        if (!matchCategory && book.categories && book.categories.length > 0) {
            matchCategory = book.categories.some(cat => selectedCategories.includes(cat.name));
        }

        return matchName && matchBookId && matchAuthor && matchKeywords && matchPrice && matchCategory;
    });

    state.currentPage = 1;
    renderBooks();
    renderPagination();
    updateTotalBooks();
}

function resetFilters() {
    searchNameInput.value = '';
    searchBookIdInput.value = '';
    searchAuthorInput.value = '';
    searchKeywordsInput.value = '';
    minPriceInput.value = '0';
    maxPriceInput.value = '1000000';
    categoryCheckboxes.forEach(cb => cb.checked = false);
    sortBySelect.value = 'newest';
    
    state.filteredBooks = [...state.allBooks];
    state.currentPage = 1;
    renderBooks();
    renderPagination();
    updateTotalBooks();
}

// Sorting Logic
function applySorting() {
    const sortBy = sortBySelect.value;
    
    switch(sortBy) {
        case 'newest':
            // Keep original order
            break;
        case 'price-low':
            state.filteredBooks.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            state.filteredBooks.sort((a, b) => b.price - a.price);
            break;
        case 'popular':
            state.filteredBooks.sort((a, b) => b.reviews - a.reviews);
            break;
        case 'rating':
            state.filteredBooks.sort((a, b) => b.rating - a.rating);
            break;
    }
    
    state.currentPage = 1;
    renderBooks();
    renderPagination();
}

// View Toggle
function changeView(e) {
    const viewType = e.currentTarget.dataset.view;
    state.currentView = viewType;
    
    viewBtns.forEach(btn => btn.classList.remove('active'));
    e.currentTarget.classList.add('active');
    
    if (viewType === 'list') {
        booksContainer.classList.add('list-view');
    } else {
        booksContainer.classList.remove('list-view');
    }
}

// Render Books
function renderBooks() {
    booksContainer.innerHTML = '';
    
    if (state.filteredBooks.length === 0) {
        noResults.style.display = 'flex';
        return;
    }
    
    noResults.style.display = 'none';
    
    const startIdx = (state.currentPage - 1) * state.itemsPerPage;
    const endIdx = startIdx + state.itemsPerPage;
    const booksToDisplay = state.filteredBooks.slice(startIdx, endIdx);
    
    booksToDisplay.forEach(book => {
        const bookElement = createBookElement(book);
        booksContainer.appendChild(bookElement);
    });
}

function createBookElement(book) {
    const bookItem = document.createElement('div');
    bookItem.className = 'book-item';
    
    const isWishlisted = state.wishlist.includes(book.id);
    
    // Build category badges from array
    const categoryBadges = book.categories && book.categories.length > 0 
        ? book.categories.map(cat => `<span class="category-badge">${cat.name}</span>`).join('')
        : '<span class="category-badge">Khác</span>';
    
    bookItem.innerHTML = `
        <div class="book-cover">
            <img src="${book.image_url ? '../' + book.image_url : '../images/pages/sample-book.png'}" alt="${book.name}" onerror="this.src='../images/pages/sample-book.png'">
        </div>
        <div class="book-info">
            <h3 class="book-title">${book.name}</h3>
            <p class="book-author"><i class="bi bi-person"></i> ${book.author}</p>
            <div class="book-category">
                ${categoryBadges}
            </div>
            <p class="book-description">${book.description}</p>
            <div class="book-footer">
                <div>
                    <span class="book-price">${formatPrice(book.price)}đ</span>
                </div>
                <div class="book-actions">
                    <button class="btn-add-to-cart" data-book-id="${book.id}">
                        <i class="bi bi-cart-plus"></i> Giỏ
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const addToCartBtn = bookItem.querySelector('.btn-add-to-cart');
    addToCartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart(book);
    });

    // Click anywhere else on the card to view details
    bookItem.addEventListener('click', () => viewBookDetail(book));
    
    return bookItem;
}

// View detail helper
function viewBookDetail(book) {
    localStorage.setItem('selectedBook', JSON.stringify(book));
    window.location.href = './book-detail.html?id=' + encodeURIComponent(book.id);
}

// Wishlist Management
function toggleWishlist(bookId, btn) {
    const index = state.wishlist.indexOf(bookId);
    
    if (index > -1) {
        state.wishlist.splice(index, 1);
    } else {
        state.wishlist.push(bookId);
    }
    
    localStorage.setItem('wishlist', JSON.stringify(state.wishlist));
    
    btn.classList.toggle('active');
    const icon = btn.querySelector('i');
    icon.classList.toggle('bi-heart');
    icon.classList.toggle('bi-heart-fill');
}

// Add to Cart
async function addToCart(book) {
    // Kiểm tra xem user đã đăng nhập chưa
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        showNotification('Vui lòng đăng nhập để thêm sách vào giỏ hàng', 'error');
        setTimeout(() => {
            window.location.href = './login.html';
        }, 1500);
        return;
    }
    
    try {
        const response = await fetchAPI(`${API_BASE}/cart`, {
            method: 'POST',
            body: JSON.stringify({ book_id: book.id, quantity: 1 })
        });
        showNotification('Đã thêm vào giỏ hàng!');
        // Update cart badge realtime - instant without page reload
        updateCartBadgeFromAPI();
    } catch (error) {
        showNotification('Lỗi thêm vào giỏ hàng', 'error');
    }
}

// Pagination
function renderPagination() {
    paginationContainer.innerHTML = '';
    
    const totalPages = Math.ceil(state.filteredBooks.length / state.itemsPerPage);
    
    if (totalPages <= 1) {
        return;
    }
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.disabled = state.currentPage === 1;
    prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i>';
    prevBtn.addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            renderBooks();
            renderPagination();
            scrollToBooks();
        }
    });
    paginationContainer.appendChild(prevBtn);
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, state.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
        const firstBtn = document.createElement('button');
        firstBtn.className = 'pagination-btn';
        firstBtn.textContent = '1';
        firstBtn.addEventListener('click', () => goToPage(1));
        paginationContainer.appendChild(firstBtn);
        
        if (startPage > 2) {
            const dots = document.createElement('span');
            dots.className = 'pagination-info';
            dots.textContent = '...';
            paginationContainer.appendChild(dots);
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `pagination-btn ${i === state.currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => goToPage(i));
        paginationContainer.appendChild(pageBtn);
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement('span');
            dots.className = 'pagination-info';
            dots.textContent = '...';
            paginationContainer.appendChild(dots);
        }
        
        const lastBtn = document.createElement('button');
        lastBtn.className = 'pagination-btn';
        lastBtn.textContent = totalPages;
        lastBtn.addEventListener('click', () => goToPage(totalPages));
        paginationContainer.appendChild(lastBtn);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.disabled = state.currentPage === totalPages;
    nextBtn.innerHTML = '<i class="bi bi-chevron-right"></i>';
    nextBtn.addEventListener('click', () => {
        if (state.currentPage < totalPages) {
            state.currentPage++;
            renderBooks();
            renderPagination();
            scrollToBooks();
        }
    });
    paginationContainer.appendChild(nextBtn);
}

function goToPage(page) {
    state.currentPage = page;
    renderBooks();
    renderPagination();
    scrollToBooks();
}

function scrollToBooks() {
    booksContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Utility Functions
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price);
}

function updateTotalBooks() {
    totalBooksSpan.textContent = state.filteredBooks.length;
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
        animation: slideUp 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Fetch data từ API
    await fetchBooksData();
    await fetchCategoriesData();
    
    // Render books
    renderBooks();
    renderPagination();
    updateTotalBooks();
});
