(function () {
  'use strict';

  const ADMIN_API_BASE = 'http://localhost:5001/api/admin';
  const PAGE_SIZE_DEFAULT = 10;

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
      } catch (e) { }
    }
    return null;
  }

  function ensureAdmin() {
    const token = getToken();
    const user = getCurrentUser();
    if (!token || !user || String(user.role).toLowerCase() !== 'admin') {
      window.location.href = './login.html';
      return false;
    }
    return true;
  }

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

    const res = await fetch(url, { ...options, headers });

    let data = null;
    try {
      data = await res.json();
    } catch { }

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
    console[type === 'error' ? 'error' : 'log'](message);
  }

  const state = {
    loading: false,
    page: 1,
    limit: PAGE_SIZE_DEFAULT,
    total: 0,
    filters: {
      keyword: '',
      status: '', // Pending, Processing, Shipped, Completed, Canceled
      from: '',
      to: '',
    },
    rows: [],
    allRows: [],
    sort: { sortBy: 'order_id', sortOrder: 'ASC' },
  };

  const els = {};

  function cacheElements() {
    els.keyword = document.getElementById('keyword');
    els.pageSize = document.getElementById('page-size');
    els.status = document.getElementById('status');
    els.from = document.getElementById('from-date');
    els.to = document.getElementById('to-date');
    els.btnSearch = document.getElementById('btn-search');
    els.btnRefresh = document.getElementById('btn-refresh');
    els.table = document.getElementById('order-table');
    els.tbody = els.table ? els.table.querySelector('tbody') : null;
    els.pagination = document.getElementById('pagination');

    els.modal = document.getElementById('order-detail-modal');
    if (els.modal) {
      els.modalClose = els.modal.querySelector('[data-close]');
      els.detailId = document.getElementById('detail-id');
      els.detailCustomer = document.getElementById('detail-customer');
      els.detailStatus = document.getElementById('detail-status');
      els.detailTotal = document.getElementById('detail-total');
      els.detailCreated = document.getElementById('detail-createdAt');
      els.detailItems = document.getElementById('detail-items');
      els.detailAddress = document.getElementById('detail-address');
      els.detailPayment = document.getElementById('detail-payment');
    }

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

  function initSortHeaders() {
    const thead = document.querySelector('#order-table thead tr');
    if (!thead) return;

    const ths = thead.querySelectorAll('th');
    ths.forEach((th) => {
      const name = th.textContent.trim().toLowerCase();
      if (name.includes('mã đơn')) th.dataset.sortField = 'order_id';
      else if (name.includes('tổng tiền')) th.dataset.sortField = 'total_amount';
      else if (name.includes('ngày tạo')) th.dataset.sortField = 'created_at';
    });
  }

  function updateSortIndicators() {
    const thead = document.querySelector('#order-table thead tr');
    if (!thead) return;

    const ths = thead.querySelectorAll('th');
    ths.forEach((th) => {
      const oldSpan = th.querySelector('.sort-indicator');
      if (oldSpan) oldSpan.remove();

      const fieldName = th.dataset.sortField || '';
      if (fieldName !== state.sort.sortBy) return;

      const indicator = state.sort.sortOrder === 'ASC' ? '▲' : '▼';
      const span = document.createElement('span');
      span.className = 'sort-indicator';
      span.textContent = ` ${indicator}`;
      span.style.marginLeft = '5px';
      span.style.color = '#3b82f6';
      span.style.fontSize = '12px';
      th.appendChild(span);
    });
  }

  function bindSortListeners() {
    const thead = document.querySelector('#order-table thead tr');
    if (!thead) return;

    const ths = thead.querySelectorAll('th');
    ths.forEach((th) => {
      const fieldName = th.dataset.sortField || '';
      if (!fieldName) return;
      if (th.dataset.sortBound === '1') return;

      th.dataset.sortBound = '1';
      th.style.cursor = 'pointer';
      th.addEventListener('click', () => {
        if (state.sort.sortBy === fieldName) {
          state.sort.sortOrder = state.sort.sortOrder === 'ASC' ? 'DESC' : 'ASC';
        } else {
          state.sort.sortBy = fieldName;
          state.sort.sortOrder = 'ASC';
        }
        state.page = 1;
        renderCurrentView();
      });
    });
  }

  function applyClientSort(rows) {
    if (!Array.isArray(rows) || rows.length === 0) return [];
    const sorted = [...rows];
    const factor = state.sort.sortOrder === 'ASC' ? 1 : -1;

    sorted.sort((a, b) => {
      if (state.sort.sortBy === 'order_id') {
        const aid = String(a.code || a.id || a._id || '');
        const bid = String(b.code || b.id || b._id || '');
        return aid.localeCompare(bid, 'vi', { numeric: true }) * factor;
      }

      if (state.sort.sortBy === 'total_amount') {
        const at = Number(a.totalAmount != null ? a.totalAmount : a.total) || 0;
        const bt = Number(b.totalAmount != null ? b.totalAmount : b.total) || 0;
        return (at - bt) * factor;
      }

      if (state.sort.sortBy === 'created_at') {
        const ad = new Date(a.createdAt || a.created_at || 0).getTime() || 0;
        const bd = new Date(b.createdAt || b.created_at || 0).getTime() || 0;
        return (ad - bd) * factor;
      }

      return 0;
    });

    return sorted;
  }

  function renderCurrentView() {
    const sorted = applyClientSort(state.allRows || []);
    state.limit = getSelectedPageSize(sorted.length);
    state.total = sorted.length;
    const start = (state.page - 1) * state.limit;
    state.rows = sorted.slice(start, start + state.limit);

    renderRows();
    renderPagination();
    updateSortIndicators();
  }

  function statusBadge(status) {
    const s = String(status || '').toLowerCase();
    const map = {
      'đang giao': 'badge-warning',
      'đã giao': 'badge-success',
      'đã hủy': 'badge-danger',
    };
    const cls = map[s] || 'badge-secondary';
    return `<span class="badge ${cls}">${escapeHtml(status || '')}</span>`;
  }

  function renderRows() {
    if (!els.tbody) return;
    if (!state.rows || state.rows.length === 0) {
      renderEmpty();
      return;
    }
    const startIndex = (state.page - 1) * state.limit;

    els.tbody.innerHTML = state.rows
      .map((o, i) => {
        const idx = startIndex + i + 1;
        const id = o.id || o._id || '';
        const code = o.code || id.slice(-8);
        const customer = (o.customer && (o.customer.name || o.customer.email)) || o.customerName || o.userName || 'N/A';
        const total = (o.totalAmount != null ? o.totalAmount : o.total) || 0;
        const status = o.status || 'Pending';
        const createdAt = formatDate(o.createdAt || o.created_at);

        let nextActions = '';
        const s = String(status).toLowerCase();
        if (s === 'đang giao') {
          nextActions = `
            <button class="btn btn-link btn-status" data-next="Đã giao" title="Xác nhận đã giao"><i class="bi bi-check2-circle"></i></button>
            <button class="btn btn-link btn-cancel" title="Hủy đơn"><i class="bi bi-x-circle"></i></button>
          `;
        }

        return `
          <tr data-id="${escapeHtml(id)}">
            <td>${idx}</td>
            <td style="font-weight: 500;">#${escapeHtml(code)}</td>
            <td>${escapeHtml(customer)}</td>
            <td>${Number(total).toLocaleString('vi-VN')} đ</td>
            <td>${statusBadge(status)}</td>
            <td>${createdAt}</td>
            <td>
              <button class="btn btn-link btn-view" title="Xem chi tiết"><i class="bi bi-eye"></i></button>
              ${nextActions}
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

    const windowSize = 5;
    let start = Math.max(1, page - Math.floor(windowSize / 2));
    let end = Math.min(totalPages, start + windowSize - 1);
    if (end - start + 1 < windowSize) start = Math.max(1, end - windowSize + 1);
    for (let p = start; p <= end; p++) html += btn(p, String(p), false, p === page);

    html += btn(Math.min(totalPages, page + 1), '&raquo;', page >= totalPages);

    els.pagination.innerHTML = html;
  }

  function openModal() {
    if (!els.modal) return;
    els.modal.style.display = 'flex';
  }

  function closeModal() {
    if (!els.modal) return;
    els.modal.style.display = 'none';
  }

  function fillDetail(order) {
    if (!els.modal) return;

    const id = order.id || order._id || '';
    const code = order.code || id.slice(-8);
    els.detailId.textContent = `#${code}`;
    const customer = (order.customer && (order.customer.name || order.customer.email)) || order.customerName || order.userName || 'N/A';
    els.detailCustomer.textContent = customer;
    els.detailStatus.innerHTML = statusBadge(order.status || 'Pending');
    els.detailTotal.textContent = `${Number(order.totalAmount != null ? order.totalAmount : order.total || 0).toLocaleString('vi-VN')} đ`;
    els.detailCreated.textContent = formatDate(order.createdAt || order.created_at);

    // Items
    const items = order.items || order.orderItems || [];
    els.detailItems.innerHTML = items
      .map((it) => {
        const title = (it.book && (it.book.title || it.book.name)) || it.title || it.name || 'Sản phẩm';
        const price = it.price != null ? it.price : it.unitPrice || 0;
        const qty = it.quantity != null ? it.quantity : it.qty || 1;
        return `<li>${escapeHtml(title)} - ${Number(price).toLocaleString('vi-VN')} đ x ${qty}</li>`;
      })
      .join('');

    // Address
    const addr = order.address || order.shippingAddress || {};
    const fullAddr = [addr.line1, addr.line2, addr.ward, addr.district, addr.province]
      .filter(Boolean)
      .join(', ');
    els.detailAddress.textContent = fullAddr || '—';

    // Payment
    const payment = order.payment || order.paymentMethod || 'COD';
    els.detailPayment.textContent = payment;
  }

  async function loadOrders({ page = 1, limit = state.limit } = {}) {
    if (state.loading) return;
    state.loading = true;
    state.page = page;
    state.limit = limit;
    renderLoading();

    const params = new URLSearchParams();
    if (state.filters.keyword) params.set('keyword', state.filters.keyword.trim());
    if (state.filters.status) params.set('status', state.filters.status);
    if (state.filters.from) params.set('from', state.filters.from);
    if (state.filters.to) params.set('to', state.filters.to);
    params.set('page', '1');
    params.set('limit', '1000');

    try {
      const data = await fetchAdmin(`/orders?${params.toString()}`, { method: 'GET' });
      let rows = [];
      let total = 0;

      if (Array.isArray(data)) {
        rows = data;
        total = data.length;
      } else if (data && typeof data === 'object') {
        rows = data.data || data.items || data.results || [];
        total = data.total != null ? Number(data.total) : rows.length;
        if (data.page) state.page = Number(data.page) || state.page;
        if (data.limit) state.limit = Number(data.limit) || state.limit;
      }

      state.allRows = rows;
      state.total = total;
      renderCurrentView();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Tải danh sách đơn hàng thất bại', 'error');
      renderEmpty();
    } finally {
      state.loading = false;
    }
  }

  let pendingConfirmAction = null;

  function showConfirmModal(message, actionCallback) {
    const modal = document.getElementById('confirmModal');
    const msgEl = document.getElementById('confirmMessage');
    if (!modal || !msgEl) {
      if (confirm(message)) actionCallback();
      return;
    }
    msgEl.textContent = message;
    pendingConfirmAction = actionCallback;
    modal.style.display = 'flex';
  }

  function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) modal.style.display = 'none';
    pendingConfirmAction = null;
  }

  function updateStatus(orderId, next) {
    if (!orderId || !next) return;
    showConfirmModal(`Xác nhận cập nhật trạng thái đơn sang: ${next}?`, async () => {
      try {
        await fetchAdmin(`/orders/${encodeURIComponent(orderId)}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: next }),
        });
        showToast('Cập nhật trạng thái thành công', 'info');
        await loadOrders({ page: state.page });
      } catch (err) {
        console.error(err);
        showToast(err.message || 'Cập nhật trạng thái thất bại', 'error');
      }
    });
  }

  function cancelOrder(orderId) {
    if (!orderId) return;
    showConfirmModal('Xác nhận hủy đơn hàng này?', async () => {
      try {
        await fetchAdmin(`/orders/${encodeURIComponent(orderId)}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'Đã hủy' }),
        });
        showToast('Đã hủy đơn hàng', 'info');
        await loadOrders({ page: state.page });
      } catch (err) {
        console.error(err);
        showToast(err.message || 'Hủy đơn thất bại', 'error');
      }
    });
  }

  async function viewDetail(orderId) {
    if (!orderId) return;
    try {
      const data = await fetchAdmin(`/orders/${encodeURIComponent(orderId)}`, { method: 'GET' });
      const order = data && data.data ? data.data : data;
      fillDetail(order);
      openModal();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Tải chi tiết đơn thất bại', 'error');
    }
  }

  function bindEvents() {
    if (els.btnSearch) {
      els.btnSearch.addEventListener('click', () => {
        state.page = 1;
        state.filters.keyword = (els.keyword.value || '').trim();
        state.filters.status = els.status.value || '';
        state.filters.from = els.from.value || '';
        state.filters.to = els.to.value || '';
        loadOrders({ page: 1 });
      });
    }

    if (els.btnRefresh) {
      els.btnRefresh.addEventListener('click', () => {
        els.keyword.value = '';
        els.status.value = '';
        els.from.value = '';
        els.to.value = '';
        state.filters = { keyword: '', status: '', from: '', to: '' };
        state.page = 1;
        loadOrders({ page: 1 });
      });
    }

    if (els.keyword) {
      els.keyword.addEventListener(
        'input',
        debounce(() => {
          state.page = 1;
          state.filters.keyword = (els.keyword.value || '').trim();
          loadOrders({ page: 1 });
        }, 500)
      );
    }

    if (els.status) {
      els.status.addEventListener('change', () => {
        state.page = 1;
        state.filters.status = els.status.value || '';
        loadOrders({ page: 1 });
      });
    }

    if (els.from) {
      els.from.addEventListener('change', () => {
        state.page = 1;
        state.filters.from = els.from.value || '';
        loadOrders({ page: 1 });
      });
    }

    if (els.to) {
      els.to.addEventListener('change', () => {
        state.page = 1;
        state.filters.to = els.to.value || '';
        loadOrders({ page: 1 });
      });
    }

    if (els.pagination) {
      els.pagination.addEventListener('click', (e) => {
        const btn = e.target.closest('.page-btn');
        if (!btn) return;
        const page = Number(btn.getAttribute('data-page')) || 1;
        if (page === state.page) return;
        state.page = page;
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
      els.table.addEventListener('click', (e) => {
        const tr = e.target.closest('tr[data-id]');
        if (!tr) return;
        const orderId = tr.getAttribute('data-id');
        if (e.target.closest('.btn-view')) {
          viewDetail(orderId);
        } else if (e.target.closest('.btn-status')) {
          const next = e.target.closest('.btn-status').getAttribute('data-next');
          updateStatus(orderId, next);
        } else if (e.target.closest('.btn-cancel')) {
          cancelOrder(orderId);
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

    const btnCancelModal = document.getElementById('btnCancelModal');
    if (btnCancelModal) btnCancelModal.addEventListener('click', closeConfirmModal);

    const btnConfirmModal = document.getElementById('btnConfirmModal');
    if (btnConfirmModal) btnConfirmModal.addEventListener('click', () => {
      if (pendingConfirmAction) pendingConfirmAction();
      closeConfirmModal();
    });
  }

  function init() {
    if (!ensureAdmin()) return;
    cacheElements();
    initSortHeaders();
    bindSortListeners();
    bindEvents();
    loadOrders({ page: 1 });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
