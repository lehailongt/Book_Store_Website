(function () {
  'use strict';

  const ADMIN_API_BASE = 'http://localhost:5001/api/admin';
  const ADMIN_API_CATEGORIES = `${ADMIN_API_BASE}/categories`;
  const PAGE_SIZE_DEFAULT = 10;

  function getToken() {
    return localStorage.getItem('accessToken') || localStorage.getItem('token') || '';
  }

  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('currentUser') || 'null');
    } catch {
      return null;
    }
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
    keyword: '',
    rows: [],
    currentEditId: null,
    sort: { sortBy: 'category_name', sortOrder: 'ASC' }
  };

  const els = {};

  function $(selector) {
    return document.querySelector(selector);
  }

  function $$(selector) {
    return document.querySelectorAll(selector);
  }

  function cacheElements() {
    els.keyword = $('#keyword');
    els.btnSearch = $('#btn-search');
    els.pageSize = $('#page-size');
    els.table = $('#category-table');
    els.tbody = els.table ? els.table.querySelector('tbody') : null;
    els.btnCreate = $('#btn-create-category');
    els.pagePrev = $('#page-prev');
    els.pageNext = $('#page-next');
    els.pageInfo = $('#page-info');

    // Modal elements
    els.categoryModal = $('#categoryModal');
    els.modalTitle = $('#modalTitle');
    els.categoryForm = $('#categoryForm');
    els.categoryName = $('#categoryName');
    els.closeModal = $('#closeModal');
    els.cancelBtn = $('#cancelBtn');
    els.submitBtn = $('#submitBtn');

    // Delete Modal elements
    els.deleteModal = $('#deleteModal');
    els.deleteMessage = $('#deleteMessage');
    els.closeDeleteModal = $('#closeDeleteModal');
    els.cancelDeleteBtn = $('#cancelDeleteBtn');
    els.confirmDeleteBtn = $('#confirmDeleteBtn');

    if (els.pageSize) {
      els.pageSize.value = PAGE_SIZE_DEFAULT;
      state.limit = PAGE_SIZE_DEFAULT;
    }
  }

  function addEventListeners() {
    if (els.btnSearch) els.btnSearch.addEventListener('click', handleSearch);
    if (els.keyword) els.keyword.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSearch();
    });
    if (els.pageSize) els.pageSize.addEventListener('change', handlePageSizeChange);
    if (els.btnCreate) els.btnCreate.addEventListener('click', handleCreateClick);
    if (els.pagePrev) els.pagePrev.addEventListener('click', handlePrevPage);
    if (els.pageNext) els.pageNext.addEventListener('click', handleNextPage);

    // Modal events
    if (els.closeModal) els.closeModal.addEventListener('click', closeModal);
    if (els.cancelBtn) els.cancelBtn.addEventListener('click', closeModal);
    if (els.submitBtn) els.submitBtn.addEventListener('click', handleSubmit);

    if (els.closeDeleteModal) els.closeDeleteModal.addEventListener('click', closeDeleteModal);
    if (els.cancelDeleteBtn) els.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    if (els.confirmDeleteBtn) els.confirmDeleteBtn.addEventListener('click', handleConfirmDelete);

    // Close modal when clicking outside
    if (els.categoryModal) {
      els.categoryModal.addEventListener('click', (e) => {
        if (e.target === els.categoryModal) closeModal();
      });
    }

    if (els.deleteModal) {
      els.deleteModal.addEventListener('click', (e) => {
        if (e.target === els.deleteModal) closeDeleteModal();
      });
    }
  }

  function showToast(message, type = 'success') {
    alert(message);
  }

  function escapeHtml(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderLoading() {
    if (els.tbody) {
      els.tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">Đang tải...</td></tr>';
    }
  }

  function renderEmpty() {
    if (els.tbody) {
      els.tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">Không có danh mục nào</td></tr>';
    }
  }

  function renderRows() {
    if (!els.tbody) return;
    if (!state.rows || state.rows.length === 0) {
      return renderEmpty();
    }

    const startIndex = (state.page - 1) * state.limit;
    els.tbody.innerHTML = state.rows.map((cat, i) => {
      const idx = startIndex + i + 1;
      const id = escapeHtml(cat.category_id);
      const name = escapeHtml(cat.category_name);
      const bookCount = cat.book_count || 0;

      return `
        <tr data-id="${id}">
          <td>${idx}</td>
          <td>#${id}</td>
          <td><strong>${name}</strong></td>
          <td>
            <span class="book-count-badge">
              <i class="bi bi-book"></i> ${bookCount} sách
            </span>
          </td>
          <td>
            <div class="table-actions">
              <button class="action-btn btn-edit" onclick="editCategory(${id})" title="Chỉnh sửa">
                <i class="bi bi-pencil"></i> Sửa
              </button>
              <button class="action-btn btn-delete" onclick="deleteCategory(${id})" title="Xóa">
                <i class="bi bi-trash"></i> Xóa
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function updatePagination() {
    const totalPages = Math.ceil(state.total / state.limit);
    if (els.pageInfo) {
      els.pageInfo.textContent = `Trang ${state.page} / ${totalPages}`;
    }
    if (els.pagePrev) els.pagePrev.disabled = state.page <= 1;
    if (els.pageNext) els.pageNext.disabled = state.page >= totalPages;
  }

  function initSortHeaders() {
    const thead = document.querySelector('#category-table thead tr');
    if (!thead) return;

    const ths = thead.querySelectorAll('th[data-sort-field]');
    ths.forEach(th => {
      th.style.cursor = 'pointer';
      th.style.userSelect = 'none';
    });
  }

  function updateSortIndicators() {
    const thead = document.querySelector('#category-table thead tr');
    if (!thead) return;

    const ths = thead.querySelectorAll('th[data-sort-field]');
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
        span.style.color = '#6366f1';
        span.style.fontSize = '12px';
        th.appendChild(span);
      }
    });
  }

  function bindSortListeners() {
    const thead = document.querySelector('#category-table thead tr');
    if (!thead) return;

    const ths = thead.querySelectorAll('th[data-sort-field]');
    ths.forEach(th => {
      const fieldName = th.dataset.sortField || null;

      if (fieldName) {
        if (th.dataset.sortBound === '1') return;
        th.dataset.sortBound = '1';
        th.addEventListener('click', () => {
          // Toggle sort order if clicking same column, else set to ASC
          if (state.sort.sortBy === fieldName) {
            state.sort.sortOrder = state.sort.sortOrder === 'ASC' ? 'DESC' : 'ASC';
          } else {
            state.sort.sortBy = fieldName;
            state.sort.sortOrder = 'ASC';
          }
          state.page = 1;
          fetchCategories();
        });
      }
    });
  }

  async function fetchCategories() {
    try {
      renderLoading();
      state.loading = true;

      const token = getToken();
      const params = new URLSearchParams({
        page: state.page,
        limit: state.limit,
        keyword: state.keyword,
        sortBy: state.sort.sortBy,
        sortOrder: state.sort.sortOrder
      });

      const response = await fetch(`${ADMIN_API_CATEGORIES}?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = './login.html';
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      state.rows = result.categories || [];
      state.total = result.pagination?.total || 0;
      state.page = result.pagination?.page || 1;
      state.limit = result.pagination?.limit || PAGE_SIZE_DEFAULT;

      renderRows();
      updatePagination();
      updateSortIndicators();
      bindSortListeners();
    } catch (err) {
      console.error('Error fetching categories:', err);
      renderEmpty();
      showToast('Lỗi tải danh mục: ' + err.message, 'error');
    } finally {
      state.loading = false;
    }
  }

  function handleSearch() {
    state.keyword = (els.keyword?.value || '').trim();
    state.page = 1;
    fetchCategories();
  }

  function handlePageSizeChange() {
    state.limit = parseInt(els.pageSize?.value || PAGE_SIZE_DEFAULT);
    state.page = 1;
    fetchCategories();
  }

  function handlePrevPage() {
    if (state.page > 1) {
      state.page--;
      fetchCategories();
      window.scrollTo(0, 0);
    }
  }

  function handleNextPage() {
    const totalPages = Math.ceil(state.total / state.limit);
    if (state.page < totalPages) {
      state.page++;
      fetchCategories();
      window.scrollTo(0, 0);
    }
  }

  function handleCreateClick() {
    els.modalTitle.textContent = 'Thêm Danh Mục';
    els.categoryForm.reset();
    state.currentEditId = null;
    openModal();
  }

  function openModal() {
    if (els.categoryModal) {
      els.categoryModal.classList.add('active');
      els.categoryName?.focus();
    }
  }

  function closeModal() {
    if (els.categoryModal) {
      els.categoryModal.classList.remove('active');
    }
    els.categoryForm?.reset();
    state.currentEditId = null;
  }

  function closeDeleteModal() {
    if (els.deleteModal) {
      els.deleteModal.classList.remove('active');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const categoryName = (els.categoryName?.value || '').trim();
    if (!categoryName) {
      showToast('Vui lòng nhập tên danh mục', 'error');
      els.categoryName?.focus();
      return;
    }

    try {
      const token = getToken();
      const isEdit = state.currentEditId !== null;
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit
        ? `${ADMIN_API_CATEGORIES}/${state.currentEditId}`
        : ADMIN_API_CATEGORIES;

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ categoryName })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP ${response.status}`);
      }

      showToast(
        isEdit ? 'Cập nhật danh mục thành công' : 'Thêm danh mục thành công',
        'success'
      );
      closeModal();
      state.page = 1;
      fetchCategories();
    } catch (err) {
      console.error('Error submitting category:', err);
      showToast('Lỗi: ' + err.message, 'error');
    }
  }

  window.editCategory = async function (id) {
    try {
      const token = getToken();
      const response = await fetch(`${ADMIN_API_CATEGORIES}/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Không thể tải danh mục');
      }

      const result = await response.json();
      const category = result.category;

      els.modalTitle.textContent = 'Chỉnh Sửa Danh Mục';
      els.categoryName.value = category.category_name;
      state.currentEditId = id;
      openModal();
    } catch (err) {
      console.error('Error loading category:', err);
      showToast('Lỗi: ' + err.message, 'error');
    }
  };

  window.deleteCategory = function (id) {
    const category = state.rows.find(c => c.category_id === id);
    if (!category) return;

    const categoryName = escapeHtml(category.category_name);
    const bookCount = category.book_count || 0;

    let message = `Xác nhận xóa danh mục "<strong>${categoryName}</strong>"?`;
    if (bookCount > 0) {
      message = `Không thể xóa danh mục "<strong>${categoryName}</strong>" vì nó còn chứa <strong>${bookCount}</strong> sách.`;
      els.deleteMessage.innerHTML = message;
      els.confirmDeleteBtn.style.display = 'none';
      if (els.deleteModal) els.deleteModal.classList.add('active');
      return;
    }

    els.deleteMessage.innerHTML = message;
    els.confirmDeleteBtn.style.display = 'block';
    state.deleteId = id;

    if (els.deleteModal) {
      els.deleteModal.classList.add('active');
    }
  };

  async function handleConfirmDelete() {
    const id = state.deleteId;
    if (!id) return;

    try {
      const token = getToken();
      const response = await fetch(`${ADMIN_API_CATEGORIES}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP ${response.status}`);
      }

      showToast('Xóa danh mục thành công', 'success');
      closeDeleteModal();
      state.page = 1;
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      showToast('Lỗi: ' + err.message, 'error');
    }
  }

  function init() {
    if (!ensureAdmin()) return;
    cacheElements();
    addEventListeners();
    initSortHeaders();
    fetchCategories();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
