(function(){
  'use strict';

  const ADMIN_API_BASE = '/api/admin';

  function getToken(){
    return localStorage.getItem('accessToken') || localStorage.getItem('token') || '';
  }
  function getCurrentUser(){
    try{ return JSON.parse(localStorage.getItem('currentUser')||'null'); }catch{ return null; }
  }
  function ensureAdmin(){
    const user = getCurrentUser();
    const token = getToken();
    if(!user || !token || String(user.role).toLowerCase() !== 'admin'){
      window.location.href = './login.html';
      return false;
    }
    return true;
  }

  async function fetchAdmin(path){
    const token = getToken();
    const res = await fetch(`${ADMIN_API_BASE}${path}`, { headers:{ 'Authorization': `Bearer ${token}` } });
    const data = await res.json().catch(()=>null);
    if(!res.ok){ throw new Error((data && (data.message||data.error))||`HTTP ${res.status}`); }
    return data;
  }

  function $(sel){ return document.querySelector(sel); }

  async function loadMetrics(){
    try{
      const m = await fetchAdmin('/metrics');
      const formatMoney = (v)=> `₫ ${Number(v||0).toLocaleString('vi-VN')}`;
      const cards = [
        { el: '#m-total-orders', val: (m.totalOrders||0).toLocaleString('vi-VN') },
        { el: '#m-revenue', val: formatMoney(m.revenue) },
        { el: '#m-new-customers', val: (m.newCustomers||0).toLocaleString('vi-VN') },
        { el: '#m-total-books', val: (m.totalBooks||0).toLocaleString('vi-VN') },
      ];
      cards.forEach(c=>{ const e = $(c.el); if(e) e.textContent = c.val; });
    }catch(err){ console.error(err); }
  }

  function escapeHtml(str){
    if(str==null) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }

  async function loadRecentOrders(){
    try{
      const q = new URLSearchParams({ page:'1', limit:'10' }).toString();
      const data = await fetchAdmin(`/orders?${q}`);
      const rows = Array.isArray(data) ? data : (data && data.data) || [];
      const tbody = document.querySelector('#recent-orders');
      if(!tbody) return;
      tbody.innerHTML = rows.map(o=>{
        return `
          <tr>
            <td>${escapeHtml(o.id)}</td>
            <td>${escapeHtml(o.code || o.id)}</td>
            <td><span class="badge">${escapeHtml(o.status || '')}</span></td>
            <td>${escapeHtml(o.items || o.item || 1)}</td>
            <td>${escapeHtml(o.customerName || '')}</td>
            <td><span class="dot" style="background:#6b7280;margin-right:8px"></span>${escapeHtml(o.shippingService || 'Standard')}</td>
            <td>${escapeHtml(o.trackingCode || '')}</td>
          </tr>
        `;
      }).join('');
    }catch(err){ console.error(err); }
  }

  function init(){
    if(!ensureAdmin()) return;
    loadMetrics();
    loadRecentOrders();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
