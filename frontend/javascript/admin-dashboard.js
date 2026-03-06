(function () {
  'use strict';

  const ADMIN_API_BASE = 'http://localhost:5001/api/admin';

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

  async function fetchAdmin(path) {
    const token = getToken();
    const res = await fetch(`${ADMIN_API_BASE}${path}`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json().catch(() => null);
    if (!res.ok) { throw new Error((data && (data.message || data.error)) || `HTTP ${res.status}`); }
    return data;
  }

  function $(sel) { return document.querySelector(sel); }

  async function loadMetrics() {
    try {
      const m = await fetchAdmin('/metrics');
      const formatMoney = (v) => `₫ ${Number(v || 0).toLocaleString('vi-VN')}`;
      const cards = [
        { el: '#m-total-orders', val: (m.totalOrders || 0).toLocaleString('vi-VN') },
        { el: '#m-revenue', val: formatMoney(m.revenue) },
        { el: '#m-new-customers', val: (m.newCustomers || 0).toLocaleString('vi-VN') },
        { el: '#m-total-books', val: (m.totalBooks || 0).toLocaleString('vi-VN') },
      ];
      cards.forEach(c => { const e = $(c.el); if (e) e.textContent = c.val; });
    } catch (err) { console.error(err); }
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  // Removed loadRecentOrders

  function getStatusClass(status) {
    switch (String(status).toLowerCase()) {
      case 'completed': return 'badge-success';
      case 'shipped':
      case 'processing': return 'badge-warning';
      case 'canceled': return 'badge-danger';
      default: return 'badge-info';
    }
  }

  let revenueChartInstance = null;
  async function loadRevenueChart(filter) {
    try {
      // Logic for fetching API:
      // const data = await fetchAdmin(`/metrics/revenue?filter=${filter}`);

      const ctx = document.getElementById('revenueChart');
      if (!ctx) return;

      let labels = [];
      let amounts = [];

      // Generate mock data based on filter
      if (filter === 'day') {
        labels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
        amounts = [120, 300, 450, 700, 500, 200];
      } else if (filter === 'week') {
        labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        amounts = [1500, 2300, 1800, 3200, 2800, 4000, 5100];
      } else if (filter === 'month') {
        labels = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'];
        amounts = [12000, 15000, 14000, 21000];
      }

      if (revenueChartInstance) {
        revenueChartInstance.destroy();
      }

      revenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Doanh thu (Nghìn VNĐ)',
            data: amounts,
            borderColor: '#1e3a8a',
            backgroundColor: 'rgba(30, 58, 138, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });

    } catch (error) {
      console.error('Error loading chart: ', error);
    }
  }

  function init() {
    if (!ensureAdmin()) return;
    loadMetrics();

    const chartFilter = document.getElementById('revenueFilter');
    if (chartFilter) {
      loadRevenueChart(chartFilter.value);
      chartFilter.addEventListener('change', (e) => {
        loadRevenueChart(e.target.value);
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
