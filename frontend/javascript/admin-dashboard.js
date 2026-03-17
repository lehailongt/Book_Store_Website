(function () {
  'use strict';

  const ADMIN_API_BASE = 'http://localhost:5001/api/admin';
  const ADMIN_API_METRICS = `${ADMIN_API_BASE}/metrics`;

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
    const res = await fetch(`${ADMIN_API_METRICS}${path}`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json().catch(() => null);
    if (!res.ok) { throw new Error((data && (data.message || data.error)) || `HTTP ${res.status}`); }
    return data;
  }

  function $(sel) { return document.querySelector(sel); }

  async function loadMetrics() {
    try {
      const response = await fetchAdmin('/');
      const m = response.data || response; // Handle both wrapped and unwrapped responses
      const formatMoney = (v) => `₫ ${Number(v || 0).toLocaleString('vi-VN')}`;
      
      // Update cards
      const card_revenue = $('#m-revenue');
      const card_users = $('#m-total-users');
      const card_books = $('#m-total-books');
      const card_sold = $('#m-total-books-sold');
      
      if (card_revenue) card_revenue.textContent = formatMoney(m.revenue);
      if (card_users) card_users.textContent = (m.totalUsers || 0).toLocaleString('vi-VN');
      if (card_books) card_books.textContent = (m.totalBooks || 0).toLocaleString('vi-VN');
      if (card_sold) card_sold.textContent = (m.totalBooksSold || 0).toLocaleString('vi-VN');
      
      return m;
    } catch (err) { console.error(err); return null; }
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

  let orderStatusChartInstance = null;
  async function loadOrderStatusChart() {
    try {
      const response = await fetchAdmin('/order-status');
      const data = response.data || response; // Handle both wrapped and unwrapped responses

      const ctx = document.getElementById('orderStatusChart');
      if (!ctx) return;

      if (orderStatusChartInstance) {
        orderStatusChartInstance.destroy();
      }

      // Calculate total orders from chart data
      const totalOrders = (data.data || []).reduce((sum, count) => sum + count, 0);
      
      // Display center text
      const countDisplay = document.getElementById('orderCountDisplay');
      const countText = document.getElementById('orderCount');
      if (countDisplay && countText) {
        countText.textContent = totalOrders.toLocaleString('vi-VN');
        countDisplay.style.display = 'block';
      }

      orderStatusChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: data.labels || [],
          datasets: [{
            data: data.data || [],
            backgroundColor: data.colors || ['#10b981', '#f59e0b', '#ef4444'],
            borderColor: '#fff',
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                font: { size: 14 }
              }
            }
          }
        }
      });

    } catch (error) {
      console.error('Error loading order status chart: ', error);
    }
  }

  let monthlyRevenueChartInstance = null;
  async function loadMonthlyRevenueChart(year) {
    try {
      const response = await fetchAdmin(`/revenue-by-month?year=${year}`);
      const data = response.data || response; // Handle both wrapped and unwrapped responses

      const ctx = document.getElementById('monthlyRevenueChart');
      if (!ctx) return;

      if (monthlyRevenueChartInstance) {
        monthlyRevenueChartInstance.destroy();
      }

      monthlyRevenueChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.labels || [],
          datasets: [{
            label: `Doanh thu năm ${year} (₫)`,
            data: data.data || [],
            backgroundColor: '#3b82f6',
            borderColor: '#1e40af',
            borderWidth: 1,
            borderRadius: 4,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => new Intl.NumberFormat('vi-VN').format(value)
              }
            }
          }
        }
      });

    } catch (error) {
      console.error('Error loading monthly revenue chart: ', error);
    }
  }

  async function init() {
    if (!ensureAdmin()) return;
    
    // Load order status chart first to calculate totalOrders
    await loadOrderStatusChart();
    
    // Load metrics cards
    await loadMetrics();
    
    // const currentYear = new Date().getFullYear();
    const currentYear = 2023;
    const yearFilter = document.getElementById('yearFilter');
    if (yearFilter) {
      yearFilter.value = String(currentYear);
    }
    await loadMonthlyRevenueChart(currentYear);

    if (yearFilter) {
      yearFilter.addEventListener('change', (e) => {
        loadMonthlyRevenueChart(e.target.value);
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
