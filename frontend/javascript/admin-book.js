(function(){
  'use strict';

  const API_BASE = 'http://localhost:5001/api/books';
  const PAGE_SIZE_DEFAULT = 10;

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

  const state = {
    loading:false,
    page:1,
    limit:PAGE_SIZE_DEFAULT,
    total:0,
    filters:{ keyword:'', category:'' },
    rows:[],
    categories:[],
  };

  const els = {};
  function $(id){ return document.getElementById(id); }
  function cache(){
    els.keyword = $('#keyword');
    els.category = $('#category-filter');
    els.btnSearch = $('#btn-search');
    els.btnRefresh = $('#btn-refresh');
    els.table = $('#book-table');
    els.tbody = els.table ? els.table.querySelector('tbody'):null;
    els.pagination = $('#pagination');
    els.btnCreate = $('#btn-create-book');
  }

  function escapeHtml(str){
    if(str==null) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }
  function renderLoading(){ if(els.tbody){ els.tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Đang tải...</td></tr>'; } }
  function renderEmpty(){ if(els.tbody){ els.tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Không có dữ liệu</td></tr>'; } }

  function renderCategories(){
    if(!els.category) return;
    const opts = ['<option value="">Tất cả danh mục</option>'].concat(
      state.categories.map(c=>`<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`) 
    );
    els.category.innerHTML = opts.join('');
    // giữ nguyên filter nếu có
    if(state.filters.category){ els.category.value = state.filters.category; }
  }

  function renderRows(){
    if(!els.tbody) return;
    if(!state.rows || state.rows.length===0){ return renderEmpty(); }
    const startIndex = (state.page-1)*state.limit;
    els.tbody.innerHTML = state.rows.map((b,i)=>{
      const idx = startIndex + i + 1;
      const img = b.image_url || '../images/pages/sample-book.png';
      const categories = (b.categories||'').split(',').filter(Boolean).join(', ');
      const created = b.publish_date ? new Date(b.publish_date).toLocaleDateString('vi-VN') : '';
      return `
        <tr data-id="${escapeHtml(b.id)}">
          <td>${idx}</td>
          <td><img src="${escapeHtml(img)}" alt="book" style="width:40px;height:56px;object-fit:cover;border-radius:6px" onerror="this.src='../images/pages/sample-book.png'"/></td>
          <td>${escapeHtml(b.name)}</td>
          <td>${escapeHtml(categories)}</td>
          <td>${Number(b.price||0).toLocaleString('vi-VN')} đ</td>
          <td>${escapeHtml(b.stock!=null? b.stock: (b.quantity!=null? b.quantity: '—'))}</td>
          <td>${escapeHtml(created)}</td>
          <td>
            <button class="btn btn-link btn-edit" title="Sửa"><i class="bi bi-pencil-square"></i></button>
            <button class="btn btn-link btn-delete" title="Xóa"><i class="bi bi-trash3"></i></button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderPagination(){
    if(!els.pagination) return;
    const totalPages = Math.max(1, Math.ceil(state.total/state.limit));
    const page = Math.min(state.page, totalPages);
    const btn = (p,l,dis=false,act=false)=>`<button class="page-btn${act?' active':''}" data-page="${p}" ${dis?'disabled':''}>${l}</button>`;
    let html = '';
    html += btn(Math.max(1,page-1),'&laquo;', page<=1);
    const windowSize=5; let start=Math.max(1,page-Math.floor(windowSize/2)); let end=Math.min(totalPages,start+windowSize-1); if(end-start+1<windowSize) start=Math.max(1,end-windowSize+1);
    for(let p=start;p<=end;p++) html+=btn(p,String(p),false,p===page);
    html += btn(Math.min(totalPages,page+1),'&raquo;', page>=totalPages);
    els.pagination.innerHTML = html;
  }

  async function fetchJSON(url, options={}){
    const res = await fetch(url, options);
    const data = await res.json().catch(()=>null);
    if(!res.ok){ throw new Error((data && (data.message||data.error)) || `HTTP ${res.status}`); }
    return data;
  }

  async function loadCategories(){
    try{
      const data = await fetchJSON(`${API_BASE}/categories/all`);
      state.categories = Array.isArray(data) ? data : (data && data.data) || [];
      renderCategories();
    }catch(err){ console.error(err); }
  }

  function applyClientFilters(rows){
    let items = rows;
    const kw = state.filters.keyword.trim().toLowerCase();
    if(kw){ items = items.filter(b=> `${b.name||''} ${b.author||''}`.toLowerCase().includes(kw)); }
    if(state.filters.category){
      const cat = state.filters.category.toLowerCase();
      items = items.filter(b=> String(b.categories||'').toLowerCase().split(',').map(s=>s.trim()).includes(cat));
    }
    return items;
  }

  async function loadBooks({page=1, limit=state.limit}={}){
    if(state.loading) return; state.loading = true;
    state.page = page; state.limit = limit;
    renderLoading();
    try{
      const data = await fetchJSON(API_BASE);
      const rows = Array.isArray(data) ? data : (data && data.data) || [];
      // tạm thời filter + paginate ở client vì API chưa có query page/limit
      const filtered = applyClientFilters(rows);
      state.total = filtered.length;
      const start = (state.page-1)*state.limit;
      state.rows = filtered.slice(start, start+state.limit);
      renderRows();
      renderPagination();
    }catch(err){
      console.error(err);
      renderEmpty();
    }finally{
      state.loading = false;
    }
  }

  function bind(){
    if(els.btnSearch){
      els.btnSearch.addEventListener('click',()=>{
        state.page = 1;
        state.filters.keyword = (els.keyword && els.keyword.value) || '';
        state.filters.category = (els.category && els.category.value) || '';
        loadBooks({page:1});
      });
    }
    if(els.btnRefresh){
      els.btnRefresh.addEventListener('click',()=>{
        if(els.keyword) els.keyword.value = '';
        if(els.category) els.category.value = '';
        state.filters = { keyword:'', category:'' };
        state.page = 1;
        loadBooks({page:1});
      });
    }
    if(els.pagination){
      els.pagination.addEventListener('click', (e)=>{
        const btn = e.target.closest('.page-btn'); if(!btn) return;
        const p = Number(btn.getAttribute('data-page'))||1;
        if(p===state.page) return; loadBooks({page:p});
      });
    }
    if(els.table){
      els.table.addEventListener('click', (e)=>{
        const tr = e.target.closest('tr[data-id]'); if(!tr) return;
        const id = tr.getAttribute('data-id');
        if(e.target.closest('.btn-edit')){
          alert('Chức năng sửa sách demo – ID: '+id);
        }else if(e.target.closest('.btn-delete')){
          if(confirm('Xác nhận xóa sách ID: '+id+' ?')){
            // TODO: gọi API DELETE khi backend sẵn sàng
            alert('Demo xóa sách – chưa kết nối API');
          }
        }
      });
    }
  }

  async function init(){
    if(!ensureAdmin()) return;
    cache();
    bind();
    await loadCategories();
    await loadBooks({page:1});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();

})();
