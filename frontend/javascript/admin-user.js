(function () {
  'use strict';

  //=========================
  // Configuration
  //=========================
  const ADMIN_API_BASE = 'http://localhost:5001/api/admin';
  const PAGE_SIZE_DEFAULT = 10;

  // Try to read token and current user from localStorage
  function getToken() {
    return (
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      ''
    );
  }

  function getCurrentUser() {
    const keys = ['currentUser', 'user', 'profile'];
    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      try {
        const obj = JSON.parse(raw);
        if (obj && typeof obj === 'object') return obj;
      } catch (e) {
        // ignore
      }
    }
    return null;
  }

  function ensureAdmin() {
    const token = getToken();
    const user = getCurrentUser();
    if (!token || !user || String(user.role).toLowerCase() !== 'admin') {
      // Redirect to login if not admin
      window.location.href = './login.html';
      return false;
    }
    return true;
  }

  //=========================
  // Helpers
  //=========================
  async function fetchAdmin(path, options = {}) {
    const url = `${ADMIN_API_BASE}${path}`;
    const token = getToken();

    const headers = Object.assign(
      {
        'Content-Type': 'application/json',
      },
      options.headers || {}
    );

    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, {
      ...options,
      headers,
    });

    // Try to parse JSON body even for non-2xx for clearer error
    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      // ignore non-json
    }

    if (!res.ok) {
      const message = (data && (data.message || data.error)) || `HTTP ${res.status}`;
      throw new Error(message);
    }

    return data;
  }

  function formatDate(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleString('vi-VN');
    } catch {
      return String(iso);
    }
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function debounce(fn, wait = 400) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.textContent = (type === 'error' ? '❌ Lỗi: ' : '✅ Thành công: ') + message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.color = '#fff';
    toast.style.fontWeight = 'bold';
    toast.style.zIndex = '9999';
    toast.style.transition = 'all 0.3s';
    toast.style.background = type === 'error' ? '#ef4444' : '#10b981';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  //=========================
  // State
  //=========================
  const state = {
    loading: false,
    page: 1,
    limit: PAGE_SIZE_DEFAULT,
    total: 0,
    filters: {
      keyword: '',
      role: '',
      status: '', // 'active' | 'locked' | ''
    },
    rows: [],
  };

  //=========================
  // DOM Elements
  //=========================
  const els = {};

  function cacheElements() {
    els.keyword = document.getElementById('keyword');
    els.role = document.getElementById('role');
    els.status = document.getElementById('status');
    els.btnSearch = document.getElementById('btn-search');
    els.btnRefresh = document.getElementById('btn-refresh');
    els.table = document.getElementById('user-table');
    els.tbody = els.table ? els.table.querySelector('tbody') : null;
    els.pagination = document.getElementById('pagination');

    els.modal = document.getElementById('editUserModal');
    if (els.modal) {
      els.detailId = document.getElementById('eu-id');
      els.detailName = document.getElementById('eu-fullname');
      els.detailEmail = document.getElementById('eu-email');
      els.detailPhone = document.getElementById('eu-phone');
      els.detailRole = document.getElementById('eu-role');
    }
  }

  //=========================
  // Rendering
  //=========================
  function renderLoading() {
    if (!els.tbody) return;
    els.tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center;">Đang tải...</td>
      </tr>
    `;
  }

  function renderEmpty() {
    if (!els.tbody) return;
    els.tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center;">Không có dữ liệu</td>
      </tr>
    `;
  }

  function renderRows() {
    if (!els.tbody) return;
    if (!state.rows || state.rows.length === 0) {
      renderEmpty();
      return;
    }

    const startIndex = (state.page - 1) * state.limit;
    const indexOffset = startIndex;

    els.tbody.innerHTML = state.rows
      .map((u, i) => {
        const idx = indexOffset + i + 1;
        const name = escapeHtml(u.name || u.fullName || u.username || '');
        const email = escapeHtml(u.email || '');
        const role = escapeHtml(u.role || 'user');

        const isCustomer = role === 'user' || role === 'customer';
        const isAdmin = role === 'admin';

        const roleSelectHtml = `
          <select class="input role-select" data-id="${escapeHtml(u.id || u._id || '')}" style="padding: 3px 6px; font-size: 13px; border-radius: 4px; border: 1px solid #d1d5db; outline: none; background: #fff; cursor: pointer;">
            <option value="customer" ${isCustomer ? 'selected' : ''}>Customer</option>
            <option value="admin" ${isAdmin ? 'selected' : ''}>Admin</option>
          </select>
        `;

        return `
          <tr data-id="${escapeHtml(u.id || u._id || '')}">
            <td>${idx}</td>
            <td style="font-weight: 500;">#${escapeHtml(u.id || u._id || '')}</td>
            <td>${name}</td>
            <td>${email}</td>
            <td>${escapeHtml(u.phone_number || '')}</td>
            <td>${roleSelectHtml}</td>
            <td>
              <button class="btn btn-link btn-edit" title="Chỉnh sửa người dùng"><i class="bi bi-pencil-square"></i></button>
              <button class="btn btn-link btn-delete" title="Xóa người dùng" style="color: #ef4444;"><i class="bi bi-trash3"></i></button>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  function renderPagination() {
    if (!els.pagination) return;

    const totalPages = Math.max(1, Math.ceil(state.total / state.limit));
    const page = Math.min(state.page, totalPages);

    const btn = (p, label, disabled = false, active = false) => {
      return `<button class="page-btn${active ? ' active' : ''}" data-page="${p}" ${disabled ? 'disabled' : ''}>${label}</button>`;
    };

    let html = '';
    html += btn(Math.max(1, page - 1), '&laquo;', page <= 1);

    // Simple pagination window
    const windowSize = 5;
    let start = Math.max(1, page - Math.floor(windowSize / 2));
    let end = Math.min(totalPages, start + windowSize - 1);
    if (end - start + 1 < windowSize) {
      start = Math.max(1, end - windowSize + 1);
    }

    for (let p = start; p <= end; p++) {
      html += btn(p, String(p), false, p === page);
    }

    html += btn(Math.min(totalPages, page + 1), '&raquo;', page >= totalPages);

    els.pagination.innerHTML = html;
  }

  //=========================
  // Modal
  //=========================
  function openModal() {
    if (!els.modal) return;
    els.modal.style.display = 'flex';
  }

  function closeModal() {
    if (!els.modal) return;
    els.modal.style.display = 'none';
  }

  function fillDetail(user) {
    if (!els.modal) return;
    els.detailId.value = user.id || user._id || '';
    els.detailName.value = user.name || user.full_name || user.fullName || '';
    els.detailEmail.value = user.email || '';
    els.detailPhone.value = user.phone_number || '';

    // map DB to UI options 
    const isCustomer = user.role === 'customer' || user.role === 'user';
    els.detailRole.value = isCustomer ? 'customer' : 'admin';
  }

  // Hiển thị modal chỉnh sửa và điền thông tin
  function showEditUserModal(user) {
    const modal = document.getElementById('edit-user-modal');
    const form = document.getElementById('edit-user-form');
    if (!modal || !form) return;

    // Điền thông tin
    form.full_name.value = user.full_name || '';
    form.email.value = user.email || '';
    form.phone_number.value = user.phone_number || '';
    form.date_of_birth.value = user.date_of_birth ? user.date_of_birth.split('T')[0] : '';
    form.password.value = '';
    form.role.value = user.role || 'customer';
    form.dataset.id = user.user_id || user.id || '';

    modal.classList.remove('hidden');
  }

  // Đóng modal chỉnh sửa
  function closeEditUserModal() {
    const modal = document.getElementById('edit-user-modal');
    if (modal) modal.classList.add('hidden');
  }

  // Gắn sự kiện cho nút đóng modal
  document.getElementById('close-edit-modal')?.addEventListener('click', closeEditUserModal);

  // Gắn sự kiện submit form chỉnh sửa
  document.getElementById('edit-user-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const form = e.target;
    const userId = form.dataset.id;
    const userData = {
      full_name: form.full_name.value,
      email: form.email.value,
      phone_number: form.phone_number.value,
      date_of_birth: form.date_of_birth.value,
      password: form.password.value,
      role: form.role.value
    };
    await updateUser(userId, userData);
    closeEditUserModal();
    // Sau khi cập nhật, reload lại danh sách
    loadUsers();
  });

  // Gắn sự kiện cho nút chỉnh sửa
  document.querySelector('.table-wrap')?.addEventListener('click', function(e) {
    if (e.target.closest('.btn-edit')) {
      const tr = e.target.closest('tr');
      const userId = tr?.getAttribute('data-id');
      const user = state.rows.find(u => String(u.id || u.user_id) === String(userId));
      if (user) showEditUserModal(user);
    }
  });

  //=========================
  // Data loading
  //=========================
  async function loadUsers({ page = 1, limit = state.limit } = {}) {
    if (state.loading) return;
    state.loading = true;
    state.page = page;
    state.limit = limit;

    renderLoading();

    const params = new URLSearchParams();
    if (state.filters.keyword) params.set('keyword', state.filters.keyword.trim());
    if (state.filters.role) params.set('role', state.filters.role);
    if (state.filters.status) params.set('status', state.filters.status);
    params.set('page', String(state.page));
    params.set('limit', String(state.limit));

    try {
      const data = await fetchAdmin(`/users?${params.toString()}`, {
        method: 'GET',
      });

      // Expect either { data, total, page, limit } or array
      let rows = [];
      let total = 0;

      if (Array.isArray(data)) {
        rows = data;
        total = data.length;
      } else if (data && typeof data === 'object') {
        rows = data.data || data.items || data.results || [];
        total = data.total != null ? Number(data.total) : rows.length;
        // If server paginates, keep page and limit from server if provided
        if (data.page) state.page = Number(data.page) || state.page;
        if (data.limit) state.limit = Number(data.limit) || state.limit;
      }

      state.rows = rows;
      state.total = total;

      renderRows();
      renderPagination();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Tải danh sách người dùng thất bại', 'error');
      renderEmpty();
    } finally {
      state.loading = false;
    }
  }

  //=========================
  // Actions
  //=========================
  async function deleteUser(userId) {
    if (!userId) return;
    if (!confirm('Bạn có chắc muốn XÓA người dùng này?')) return;

    try {
      await fetchAdmin(`/users/${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      });
      showToast('Xóa người dùng thành công', 'info');
      await loadUsers({ page: state.page });
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Xóa người dùng thất bại', 'error');
    }
  }

  async function changeRole(userId, newRole) {
    if (!userId || !newRole) return;

    try {
      const res = await fetch(`${ADMIN_API_BASE}/users/${encodeURIComponent(userId)}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error((data && data.message) || 'Lỗi cập nhật vai trò');

      showToast('Cập nhật vai trò thành công', 'info');
      // No need to reload all users fully, just keep UX smooth - we can reload to sync completely
      await loadUsers({ page: state.page });
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Cập nhật vai trò thất bại', 'error');
    }
  }

  async function viewDetail(userId) {
    if (!userId) return;
    try {
      const user = await fetchAdmin(`/users/${encodeURIComponent(userId)}`, {
        method: 'GET',
      });
      fillDetail(user && user.data ? user.data : user);
      openModal();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Tải chi tiết người dùng thất bại', 'error');
    }
  }

  //=========================
  // Update User Information
  //=========================
  async function updateUser(userId, userData) {
    try {
      const response = await fetch(`${ADMIN_API_BASE}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update user');
      }

      const result = await response.json();
      alert('Cập nhật thông tin thành công!');
      return result;
    } catch (error) {
      console.error('Error updating user:', error);
      alert(`Lỗi: ${error.message}`);
    }
  }

  //=========================
  // Event bindings
  //=========================
  function bindEvents() {
    if (els.btnSearch) {
      els.btnSearch.addEventListener('click', () => {
        state.page = 1;
        state.filters.keyword = (els.keyword.value || '').trim();
        state.filters.role = els.role.value || '';
        state.filters.status = els.status.value || '';
        loadUsers({ page: 1 });
      });
    }

    if (els.btnRefresh) {
      els.btnRefresh.addEventListener('click', () => {
        els.keyword.value = '';
        els.role.value = '';
        els.status.value = '';
        state.filters = { keyword: '', role: '', status: '' };
        state.page = 1;
        loadUsers({ page: 1 });
      });
    }

    if (els.keyword) {
      els.keyword.addEventListener(
        'input',
        debounce(() => {
          state.page = 1;
          state.filters.keyword = (els.keyword.value || '').trim();
          loadUsers({ page: 1 });
        }, 500)
      );
    }

    if (els.role) {
      els.role.addEventListener('change', () => {
        state.page = 1;
        state.filters.role = els.role.value || '';
        loadUsers({ page: 1 });
      });
    }

    if (els.status) {
      els.status.addEventListener('change', () => {
        state.page = 1;
        state.filters.status = els.status.value || '';
        loadUsers({ page: 1 });
      });
    }

    if (els.pagination) {
      els.pagination.addEventListener('click', (e) => {
        const btn = e.target.closest('.page-btn');
        if (!btn) return;
        const page = Number(btn.getAttribute('data-page')) || 1;
        if (page === state.page) return;
        loadUsers({ page });
      });
    }

    if (els.table) {
      els.table.addEventListener('change', (e) => {
        if (e.target.classList.contains('role-select')) {
          const userId = e.target.getAttribute('data-id');
          const newRole = e.target.value;
          changeRole(userId, newRole);
        }
      });

      els.table.addEventListener('click', (e) => {
        const btnEdit = e.target.closest('.btn-edit');
        const btnDelete = e.target.closest('.btn-delete');
        const tr = e.target.closest('tr[data-id]');
        if (!tr) return;
        const userId = tr.getAttribute('data-id');

        if (btnEdit) {
          viewDetail(userId);
        } else if (btnDelete) {
          deleteUser(userId);
        }
      });
    }

    if (els.modal) {
      els.modal.addEventListener('click', (e) => {
        if (e.target.matches('[data-close]') || e.target === els.modal) {
          closeModal();
        }
      });
    }

    const btnCreateUser = document.getElementById('btn-create-user');
    const createUserModal = document.getElementById('createUserModal');
    const createUserForm = document.getElementById('create-user-form');

    if (btnCreateUser && createUserModal) {
      btnCreateUser.addEventListener('click', () => {
        createUserModal.style.display = 'flex';
      });
    }

    if (createUserForm) {
      createUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = {
          fullName: document.getElementById('cu-fullname').value,
          email: document.getElementById('cu-email').value,
          phone_number: document.getElementById('cu-phone').value,
          password: document.getElementById('cu-password').value,
          role: document.getElementById('cu-role').value
        };
        try {
          await fetchAdmin('/users', { method: 'POST', body: JSON.stringify(body) });
          showToast('Thêm người dùng thành công', 'info');
          createUserModal.style.display = 'none';
          createUserForm.reset();
          loadUsers({ page: 1 });
        } catch (err) {
          alert(err.message || 'Lỗi thêm người dùng');
        }
      });
    }

    const editUserForm = document.getElementById('edit-user-form');
    if (editUserForm) {
      editUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = document.getElementById('eu-id').value;
        const body = {
          fullName: document.getElementById('eu-fullname').value,
          email: document.getElementById('eu-email').value,
          phone_number: document.getElementById('eu-phone').value,
          role: document.getElementById('eu-role').value
        };
        try {
          await fetchAdmin(`/users/${encodeURIComponent(userId)}`, {
            method: 'PUT',
            body: JSON.stringify(body)
          });
          showToast('Cập nhật người dùng thành công', 'info');
          closeModal();
          loadUsers({ page: state.page });
        } catch (err) {
          alert(err.message || 'Lỗi cập nhật người dùng');
        }
      });
    }
  }

  //=========================
  // Init
  //=========================
  function init() {
    if (!ensureAdmin()) return;
    cacheElements();
    bindEvents();
    loadUsers({ page: 1 });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
