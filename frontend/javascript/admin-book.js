(function () {
  'use strict';

  const ADMIN_API_BASE = 'http://localhost:5001/api/admin';
  const ADMIN_API_BOOKS = `${ADMIN_API_BASE}/books`;
  const PAGE_SIZE_DEFAULT = 10;

  function getToken() {
    return localStorage.getItem('accessToken') || localStorage.getItem('token') || '';
  }
  function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('currentUser') || 'null'); } catch { return null; }
  }
  function ensureAdmin() {
    const user = getCurrentUser();
    const token = getToken();
    if (!user || !token || String(user.role).toLowerCase() !== 'admin') {
      window.location.href = './login.html';
      return false;
    }
    return true;
  }

  const state = {
    loading: false,
    page: 1,
    limit: PAGE_SIZE_DEFAULT,
    total: 0,
    filters: { keyword: '', category: '', price: '' },
    rows: [],
    allRows: [],
    categories: [],
    sort: { sortBy: 'book_id', sortOrder: 'ASC' }
  };

  const els = {};
  function $(id) { return document.querySelector(id); }
  function cache() {
    els.keyword = $('#keyword');
    els.category = $('#category-filter');
    els.price = $('#price-filter');
    els.pageSize = $('#page-size');
    els.btnSearch = $('#btn-search');
    els.btnRefresh = $('#btn-refresh');
    els.table = $('#book-table');
    els.tbody = els.table ? els.table.querySelector('tbody') : null;
    els.pagination = $('#pagination');
    els.btnCreate = $('#btn-create-book');

    if (els.pageSize) {
      els.pageSize.value = '10';
      state.limit = 10;
    }
  }

  function getSelectedPageSize(totalRows = 0) {
    const selected = (els.pageSize && els.pageSize.value) || '10';
    if (selected === 'all') {
      return Math.max(1, Number(totalRows) || 1);
    }
    const n = Number(selected);
    return Number.isFinite(n) && n > 0 ? n : PAGE_SIZE_DEFAULT;
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }
  function renderLoading() { if (els.tbody) { els.tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Đang tải...</td></tr>'; } }
  function renderEmpty() { if (els.tbody) { els.tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Không có dữ liệu</td></tr>'; } }

  function renderCategories() {
    if (!els.category) return;
    const opts = ['<option value="">Tất cả danh mục</option>'].concat(
      state.categories.map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`)
    );
    els.category.innerHTML = opts.join('');
    // giữ nguyên filter nếu có
    if (state.filters.category) { els.category.value = state.filters.category; }
  }

  function getImagePath(imageUrl) {
    if (!imageUrl) return '../images/pages/sample-book.png';
    if (imageUrl.startsWith('/') || imageUrl.startsWith('http')) return imageUrl;
    return '../' + imageUrl;
  }

  function renderRows() {
    if (!els.tbody) return;
    if (!state.rows || state.rows.length === 0) { return renderEmpty(); }
    const startIndex = (state.page - 1) * state.limit;
    els.tbody.innerHTML = state.rows.map((b, i) => {
      const idx = startIndex + i + 1;
      const img = getImagePath(b.image_url);
      const categories = (b.categoryList || []).map(c => c.name).join(', ');
      const created = b.publish_date ? new Date(b.publish_date).toLocaleDateString('vi-VN') : '';
      return `
        <tr data-id="${escapeHtml(b.id || b.book_id || '')}">
          <td>${idx}</td>
          <td style="font-weight: 500;">#${escapeHtml(b.id || b.book_id || '')}</td>
          <td><img src="${escapeHtml(img)}" alt="book" style="width:40px;height:56px;object-fit:cover;border-radius:6px" onerror="this.src='../images/pages/sample-book.png'"/></td>
          <td>${escapeHtml(b.name || b.book_name || '')}</td>
          <td>${escapeHtml(b.author || b.author_name || '')}</td>
          <td>${escapeHtml(categories)}</td>
          <td>${Number(b.price || 0).toLocaleString('vi-VN')} đ</td>
          <td>${escapeHtml(created)}</td>
          <td>
            <button class="btn btn-link btn-edit" title="Sửa"><i class="bi bi-pencil-square"></i></button>
            <button class="btn btn-link btn-delete" title="Xóa"><i class="bi bi-trash3"></i></button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderPagination() {
    if (!els.pagination) return;
    const totalPages = Math.max(1, Math.ceil(state.total / state.limit));
    const page = Math.min(state.page, totalPages);
    const btn = (p, l, dis = false, act = false) => `<button class="page-btn${act ? ' active' : ''}" data-page="${p}" ${dis ? 'disabled' : ''}>${l}</button>`;
    let html = '';
    html += btn(Math.max(1, page - 1), '&laquo;', page <= 1);
    const windowSize = 5; let start = Math.max(1, page - Math.floor(windowSize / 2)); let end = Math.min(totalPages, start + windowSize - 1); if (end - start + 1 < windowSize) start = Math.max(1, end - windowSize + 1);
    for (let p = start; p <= end; p++) html += btn(p, String(p), false, p === page);
    html += btn(Math.min(totalPages, page + 1), '&raquo;', page >= totalPages);
    els.pagination.innerHTML = html;
  }

  async function fetchJSON(url, options = {}) {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => null);
    if (!res.ok) { throw new Error((data && (data.message || data.error)) || `HTTP ${res.status}`); }
    return data;
  }

  async function loadCategories() {
    try {
      const data = await fetchJSON(`${ADMIN_API_BOOKS}/categories`);
      state.categories = Array.isArray(data) ? data : (data && data.data) || [];
      renderCategories();
    } catch (err) { console.error(err); }
  }

  function applyClientFilters(rows) {
    let items = rows;
    const kw = state.filters.keyword.trim().toLowerCase();
    if (kw) { items = items.filter(b => `${b.name || ''} ${b.author || ''}`.toLowerCase().includes(kw)); }
    if (state.filters.category) {
      const cat = state.filters.category.toLowerCase();
      items = items.filter(b => {
        const catNames = (b.categoryList || []).map(c => c.name.toLowerCase());
        return catNames.some(name => name.includes(cat));
      });
    }
    if (state.filters.price) {
      const [minStr, maxStr] = state.filters.price.split('-');
      const min = parseInt(minStr) || 0;
      const max = parseInt(maxStr) || 999999999;
      items = items.filter(b => {
        const price = Number(b.price || 0);
        return price >= min && price <= max;
      });
    }
    return items;
  }

  function applySorting(rows) {
    if (!rows || rows.length === 0) return rows;
    const sorted = [...rows];
    sorted.sort((a, b) => {
      let aVal, bVal;
      if (state.sort.sortBy === 'book_id') {
        aVal = Number(a.id || a.book_id || 0);
        bVal = Number(b.id || b.book_id || 0);
      } else if (state.sort.sortBy === 'price') {
        aVal = Number(a.price || 0);
        bVal = Number(b.price || 0);
      } else if (state.sort.sortBy === 'publish_date') {
        aVal = new Date(a.publish_date || 0).getTime();
        bVal = new Date(b.publish_date || 0).getTime();
      } else {
        return 0;
      }
      if (state.sort.sortOrder === 'ASC') {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });
    return sorted;
  }

  function renderCurrentView() {
    const filtered = applyClientFilters(state.allRows || []);
    const sorted = applySorting(filtered);
    state.limit = getSelectedPageSize(sorted.length);
    state.total = sorted.length;
    const start = (state.page - 1) * state.limit;
    state.rows = sorted.slice(start, start + state.limit);

    renderRows();
    renderPagination();
    updateSortIndicators();
  }

  async function loadBooks({ page = 1, limit = state.limit } = {}) {
    if (state.loading) return; state.loading = true;
    state.page = page; state.limit = limit;
    renderLoading();
    try {
      console.log('Loading books from:', ADMIN_API_BOOKS);
      const params = new URLSearchParams({ page: 1, limit: 1000 });
      const url = `${ADMIN_API_BOOKS}?${params.toString()}`;
      console.log('Request URL:', url);
      
      const data = await fetchJSON(url);
      console.log('API Response:', data);
      
      const rows = Array.isArray(data) ? data : (data && data.data) || [];
      state.allRows = rows;
      console.log('Total rows from API:', rows.length);
      
      renderCurrentView();
      bindSortListeners();
    } catch (err) {
      console.error('Error loading books:', err);
      console.error('Error message:', err.message);
      console.error('Error details:', err);
      renderEmpty();
    } finally {
      state.loading = false;
    }
  }

  // ─── Form helpers ─────────────────────────────────────────
  function showErr(id, msg) { const el = document.getElementById(id); if (el) el.textContent = msg; }
  function clearErr(...ids) { ids.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = ''; }); }

  function renderCategorySelect(selectId, excludeIds = []) {
    const select = document.getElementById(selectId);
    if (!select) return;
    const exclude = excludeIds.map(id => String(id));
    const filtering = state.categories.filter(c => !exclude.includes(String(c.category_id)));
    select.innerHTML = '<option value="">-- Chọn thể loại --</option>' +
      filtering.map(c => `<option value="${c.category_id}">${escapeHtml(c.name)}</option>`).join('');
  }

  function renderCategoryTags(containerId, selectedIds = [], selectId = '', addBtnId = '') {
    const container = document.getElementById(containerId);
    if (!container) return;
    const categoryMap = Object.fromEntries(state.categories.map(c => [String(c.category_id), c.name]));
    container.innerHTML = selectedIds.map(id => `
      <span class="category-tag">
        ${escapeHtml(categoryMap[String(id)] || 'Unknown')}
        <button type="button" class="remove-btn" data-id="${escapeHtml(id)}" title="Xóa">×</button>
      </span>
    `).join('');
    
    // Bind remove button events
    container.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-id');
        selectedIds = selectedIds.filter(sid => String(sid) !== String(id));
        renderCategoryTags(containerId, selectedIds, selectId, addBtnId);
        if (selectId) renderCategorySelect(selectId, selectedIds);
      });
    });
  }

  function getSelectedCategoriesFromTags(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    return [...container.querySelectorAll('.category-tag')].map(tag => {
      const btn = tag.querySelector('.remove-btn');
      return btn ? parseInt(btn.getAttribute('data-id')) : null;
    }).filter(Boolean);
  }

  function setImagePreview(previewId, src) {
    const el = document.getElementById(previewId);
    if (!el) return;
    if (src) { el.src = src; el.style.display = 'block'; }
    else { el.src = ''; el.style.display = 'none'; }
  }

  function initSortHeaders() {
    const thead = document.querySelector('#book-table thead tr');
    if (!thead) return;

    const ths = thead.querySelectorAll('th');
    ths.forEach(th => {
      const columnName = th.textContent.trim().toLowerCase();
      if (columnName.includes('mã sách')) th.dataset.sortField = 'book_id';
      else if (columnName.includes('giá')) th.dataset.sortField = 'price';
      else if (columnName.includes('ngày xuất bản')) th.dataset.sortField = 'publish_date';
    });
  }

  function updateSortIndicators() {
    const thead = document.querySelector('#book-table thead tr');
    if (!thead) return;
    
    const ths = thead.querySelectorAll('th');
    ths.forEach(th => {
      // Remove old indicators
      const oldSpan = th.querySelector('.sort-indicator');
      if (oldSpan) oldSpan.remove();
      
      // Add new indicator if this is the current sort column
      const fieldName = th.dataset.sortField || null;
      
      if (fieldName === state.sort.sortBy) {
        const indicator = state.sort.sortOrder === 'ASC' ? '▲' : '▼';
        const span = document.createElement('span');
        span.className = 'sort-indicator';
        span.textContent = ' ' + indicator;
        span.style.marginLeft = '5px';
        span.style.color = '#3b82f6';
        span.style.fontSize = '12px';
        th.appendChild(span);
      }
    });
  }

  function bindSortListeners() {
    const thead = document.querySelector('#book-table thead tr');
    if (!thead) return;
    
    const ths = thead.querySelectorAll('th');
    ths.forEach(th => {
      const fieldName = th.dataset.sortField || null;
      
      if (fieldName) {
        if (th.dataset.sortBound === '1') return;
        th.dataset.sortBound = '1';
        th.style.cursor = 'pointer';
        th.addEventListener('click', () => {
          // Toggle sort order if clicking same column, else set to ASC
          if (state.sort.sortBy === fieldName) {
            state.sort.sortOrder = state.sort.sortOrder === 'ASC' ? 'DESC' : 'ASC';
          } else {
            state.sort.sortBy = fieldName;
            state.sort.sortOrder = 'ASC';
          }
          state.page = 1;
          loadBooks({ page: 1 });
        });
      }
    });
  }



  function bind() {
    if (els.btnSearch) {
      els.btnSearch.addEventListener('click', () => {
        state.page = 1;
        state.filters.keyword = (els.keyword && els.keyword.value) || '';
        state.filters.category = (els.category && els.category.value) || '';
        state.filters.price = (els.price && els.price.value) || '';
        loadBooks({ page: 1 });
      });
    }
    if (els.keyword) {
      els.keyword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          state.page = 1;
          state.filters.keyword = (els.keyword && els.keyword.value) || '';
          state.filters.category = (els.category && els.category.value) || '';
          state.filters.price = (els.price && els.price.value) || '';
          loadBooks({ page: 1 });
        }
      });
    }
    if (els.btnRefresh) {
      els.btnRefresh.addEventListener('click', () => {
        if (els.keyword) els.keyword.value = '';
        if (els.category) els.category.value = '';
        if (els.price) els.price.value = '';
        state.filters = { keyword: '', category: '', price: '' };
        state.page = 1;
        loadBooks({ page: 1 });
      });
    }
    if (els.pagination) {
      els.pagination.addEventListener('click', (e) => {
        const btn = e.target.closest('.page-btn'); if (!btn) return;
        const p = Number(btn.getAttribute('data-page')) || 1;
        if (p === state.page) return;
        state.page = p;
        renderCurrentView();
      });
    }
    if (els.pageSize) {
      els.pageSize.addEventListener('change', () => {
        state.page = 1;
        state.limit = getSelectedPageSize(state.allRows.length);
        renderCurrentView();
      });
    }
    if (els.table) {
      els.table.addEventListener('click', async (e) => {
        const tr = e.target.closest('tr[data-id]'); if (!tr) return;
        const id = tr.getAttribute('data-id');
        if (e.target.closest('.btn-edit')) {
          const book = state.rows.find(b => String(b.id || b.book_id) === String(id));
          if (!book) return;
          document.getElementById('eb-id').value = id;
          document.getElementById('eb-name').value = book.name || book.book_name || '';
          document.getElementById('eb-author').value = book.author || book.author_name || '';
          document.getElementById('eb-price').value = book.price || '';
          document.getElementById('eb-description').value = book.description || '';
          document.getElementById('eb-publish-date').value = book.publish_date
            ? String(book.publish_date).split('T')[0] : '';
          // Image preview
          setImagePreview('eb-image-preview', getImagePath(book.image_url));
          const ebFile = document.getElementById('eb-image-file');
          if (ebFile) ebFile.value = '';
          // Categories tags - use categoryList from response which has IDs
          let bookCatIds = [];
          if (book.categoryList && Array.isArray(book.categoryList)) {
            bookCatIds = book.categoryList.filter(cat => cat && cat.id).map(cat => cat.id);
          }
          renderCategoryTags('eb-categories-tags', bookCatIds);
          renderCategorySelect('eb-category-select', bookCatIds);
          // Bind add category button
          const addBtn = document.getElementById('eb-add-category-btn');
          const select = document.getElementById('eb-category-select');
          if (addBtn) {
            addBtn.onclick = (e) => {
              e.preventDefault();
              if (!select || !select.value) { alert('Chọn thể loại trước'); return; }
              const catId = parseInt(select.value);
              const current = getSelectedCategoriesFromTags('eb-categories-tags');
              if (current.includes(catId)) { alert('Thể loại này đã được chọn'); return; }
              current.push(catId);
              renderCategoryTags('eb-categories-tags', current, 'eb-category-select', 'eb-add-category-btn');
              renderCategorySelect('eb-category-select', current);
              select.value = '';
            };
          }
          // Clear old errors
          clearErr('eb-name-err', 'eb-author-err', 'eb-price-err', 'eb-categories-err');
          const editBookModal = document.getElementById('editBookModal');
          if (editBookModal) editBookModal.style.display = 'flex';
        } else if (e.target.closest('.btn-delete')) {
          if (confirm('Xác nhận xóa sách ID: ' + id + ' ?')) {
            try {
              const res = await fetch(`${ADMIN_API_BOOKS}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
              });
              const data = await res.json().catch(() => null);
              if (!res.ok) throw new Error((data && (data.message || data.error)) || 'Lỗi xóa sách');
              alert('Xóa sách thành công');
              loadBooks({ page: state.page });
            } catch (err) {
              alert(err.message || 'Lỗi xóa sách');
            }
          }
        }
      });
    }

    if (els.btnCreate) {
      els.btnCreate.addEventListener('click', () => {
        const createBookModal = document.getElementById('createBookModal');
        if (createBookModal) {
          const form = document.getElementById('create-book-form');
          if (form) form.reset();
          clearErr('cb-name-err', 'cb-author-err', 'cb-price-err', 'cb-categories-err');
          renderCategorySelect('cb-category-select');
          renderCategoryTags('cb-categories-tags', []);
          setImagePreview('cb-image-preview', '');
          
          // Bind add category button
          const addBtn = document.getElementById('cb-add-category-btn');
          const select = document.getElementById('cb-category-select');
          const tagsDiv = document.getElementById('cb-categories-tags');
          if (addBtn) {
            addBtn.onclick = (e) => {
              e.preventDefault();
              if (!select || !select.value) { alert('Chọn thể loại trước'); return; }
              const catId = parseInt(select.value);
              const current = getSelectedCategoriesFromTags('cb-categories-tags');
              if (current.includes(catId)) { alert('Thể loại này đã được chọn'); return; }
              current.push(catId);
              renderCategoryTags('cb-categories-tags', current, 'cb-category-select', 'cb-add-category-btn');
              renderCategorySelect('cb-category-select', current);
              select.value = '';
            };
          }
          
          createBookModal.style.display = 'flex';
        }
      });
    }

    const createBookForm = document.getElementById('create-book-form');
    if (createBookForm) {
      createBookForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameVal = document.getElementById('cb-name').value.trim();
        const authorVal = document.getElementById('cb-author').value.trim();
        const priceStr = document.getElementById('cb-price').value.trim();
        const price = parseFloat(priceStr);
        const desc = document.getElementById('cb-description').value.trim();
        const publishDate = document.getElementById('cb-publish-date').value;
        const categories = getSelectedCategoriesFromTags('cb-categories-tags');
        const fileInput = document.getElementById('cb-image-file');
        const file = fileInput && fileInput.files && fileInput.files[0];

        clearErr('cb-name-err', 'cb-author-err', 'cb-price-err', 'cb-categories-err');
        let valid = true;
        if (!nameVal) { showErr('cb-name-err', 'Tên sách không được để trống'); valid = false; }
        else if (nameVal.length > 50) { showErr('cb-name-err', 'Tên sách tối đa 50 ký tự'); valid = false; }
        if (!authorVal) { showErr('cb-author-err', 'Tên tác giả không được để trống'); valid = false; }
        else if (authorVal.length > 50) { showErr('cb-author-err', 'Tên tác giả tối đa 50 ký tự'); valid = false; }
        if (!priceStr || isNaN(price) || price <= 0) { showErr('cb-price-err', 'Giá phải là số thực dương'); valid = false; }
        if (categories.length === 0) { showErr('cb-categories-err', 'Vui lòng chọn ít nhất một thể loại'); valid = false; }
        if (!valid) return;

        const submitBtn = document.getElementById('cb-submit-btn');
        if (submitBtn) submitBtn.disabled = true;
        try {
          // First, create the book to get the ID
          const createRes = await fetch(ADMIN_API_BOOKS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ bookName: nameVal, authorName: authorVal, price, description: desc, publishDate: publishDate || null, imageUrl: null, categories })
          });
          const createData = await createRes.json().catch(() => null);
          if (!createRes.ok) throw new Error((createData && (createData.message || createData.error)) || 'Lỗi thêm sách');
          const bookId = createData.bookId;

          // If image file is selected, upload it
          let imageUrl = null;
          if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('bookId', bookId);
            
            const uploadRes = await fetch(`${ADMIN_API_BOOKS}/upload`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${getToken()}` },
              body: formData
            });
            const uploadData = await uploadRes.json().catch(() => null);
            if (!uploadRes.ok) throw new Error((uploadData && (uploadData.message || uploadData.error)) || 'Lỗi upload ảnh');
            imageUrl = uploadData.imageUrl;

            // Update book with image URL
            if (imageUrl) {
              await fetch(`${ADMIN_API_BOOKS}/${bookId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify({ bookName: nameVal, authorName: authorVal, price, description: desc, publishDate: publishDate || null, imageUrl, categories })
              });
            }
          }

          alert('Thêm sách thành công');
          document.getElementById('createBookModal').style.display = 'none';
          createBookForm.reset();
          renderCategorySelect('cb-category-select');
          renderCategoryTags('cb-categories-tags', []);
          setImagePreview('cb-image-preview', '');
          loadBooks({ page: 1 });
        } catch (err) {
          alert(err.message || 'Lỗi thêm sách');
        } finally {
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    }

    const editBookForm = document.getElementById('edit-book-form');
    if (editBookForm) {
      editBookForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('eb-id').value;
        const nameVal = document.getElementById('eb-name').value.trim();
        const authorVal = document.getElementById('eb-author').value.trim();
        const priceStr = document.getElementById('eb-price').value.trim();
        const price = parseFloat(priceStr);
        const desc = document.getElementById('eb-description').value.trim();
        const publishDate = document.getElementById('eb-publish-date').value;
        const categories = getSelectedCategoriesFromTags('eb-categories-tags');
        const fileInput = document.getElementById('eb-image-file');
        const file = fileInput && fileInput.files && fileInput.files[0];

        clearErr('eb-name-err', 'eb-author-err', 'eb-price-err', 'eb-categories-err');
        let valid = true;
        if (!nameVal) { showErr('eb-name-err', 'Tên sách không được để trống'); valid = false; }
        else if (nameVal.length > 50) { showErr('eb-name-err', 'Tên sách tối đa 50 ký tự'); valid = false; }
        if (!authorVal) { showErr('eb-author-err', 'Tên tác giả không được để trống'); valid = false; }
        else if (authorVal.length > 50) { showErr('eb-author-err', 'Tên tác giả tối đa 50 ký tự'); valid = false; }
        if (!priceStr || isNaN(price) || price <= 0) { showErr('eb-price-err', 'Giá phải là số thực dương'); valid = false; }
        if (categories.length === 0) { showErr('eb-categories-err', 'Vui lòng chọn ít nhất một thể loại'); valid = false; }
        if (!valid) return;

        const submitBtn = document.getElementById('eb-submit-btn');
        if (submitBtn) submitBtn.disabled = true;
        try {
          // Get current imageUrl from existing book
          const book = state.rows.find(b => String(b.id || b.book_id) === String(id));
          let imageUrl = (book && book.image_url) || null;

          // If image file is selected, upload it
          if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('bookId', id);
            
            const uploadRes = await fetch(`${ADMIN_API_BOOKS}/upload`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${getToken()}` },
              body: formData
            });
            const uploadData = await uploadRes.json().catch(() => null);
            if (!uploadRes.ok) throw new Error((uploadData && (uploadData.message || uploadData.error)) || 'Lỗi upload ảnh');
            imageUrl = uploadData.imageUrl;
          }

          const res = await fetch(`${ADMIN_API_BOOKS}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
            body: JSON.stringify({ bookName: nameVal, authorName: authorVal, price, description: desc, publishDate: publishDate || null, imageUrl, categories })
          });
          const data = await res.json().catch(() => null);
          if (!res.ok) throw new Error((data && (data.message || data.error)) || 'Lỗi cập nhật sách');

          alert('Cập nhật sách thành công');
          document.getElementById('editBookModal').style.display = 'none';
          editBookForm.reset();
          loadBooks({ page: state.page });
        } catch (err) {
          alert(err.message || 'Lỗi cập nhật sách');
        } finally {
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    }

    // Image preview handlers
    const cbImageFile = document.getElementById('cb-image-file');
    if (cbImageFile) {
      cbImageFile.addEventListener('change', () => {
        const file = cbImageFile.files && cbImageFile.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = ev => setImagePreview('cb-image-preview', ev.target.result);
          reader.readAsDataURL(file);
        } else {
          setImagePreview('cb-image-preview', '');
        }
      });
    }

    const ebImageFile = document.getElementById('eb-image-file');
    if (ebImageFile) {
      ebImageFile.addEventListener('change', () => {
        const file = ebImageFile.files && ebImageFile.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = ev => setImagePreview('eb-image-preview', ev.target.result);
          reader.readAsDataURL(file);
        } else {
          // Revert to original book image
          const id = document.getElementById('eb-id').value;
          const book = state.rows.find(b => String(b.id || b.book_id) === String(id));
          setImagePreview('eb-image-preview', getImagePath(book?.image_url));
        }
      });
    }
  }

  async function init() {
    if (!ensureAdmin()) return;
    cache();
    initSortHeaders();
    bind();
    await loadCategories();
    await loadBooks({ page: 1 });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

})();
