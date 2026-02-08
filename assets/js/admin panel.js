// ═══════════════════════════════════════════════════════════════
// ADMIN PANEL (GPT‑5 FINAL + FIXED SHEET + REVIEWS + AUTO CLOSE)
// File: assets/js/admin panel.js
// ═══════════════════════════════════════════════════════════════

/* ========== Global state bootstrapping ========== */

state.reviews = Array.isArray(state.reviews) ? state.reviews : [];
state.adminReviewsSelectedProductId = state.adminReviewsSelectedProductId || null;

state.supportFilter = state.supportFilter || { status: '', priority: '', view: 'all' };
state.adminSupportSelectedTicketId = state.adminSupportSelectedTicketId || null;
state.supportQuickReplies = Array.isArray(state.supportQuickReplies)
  ? state.supportQuickReplies
  : [
      { id: 'qr1', label: 'تشکر از تماس', text: 'سلام، ممنون از پیام شما. درخواست شما در حال بررسی است.' },
      { id: 'qr2', label: 'اطلاع از پیگیری', text: 'درخواست شما ثبت شد و به زودی نتیجه را اطلاع می‌دهیم.' }
    ];

state.orderFilter = state.orderFilter || { status: '' };
state.adminTab = state.adminTab || 'dashboard';

state.categoryModal = state.categoryModal || null;

/* ========== Bottom sheet local state (no re-render on drag) ========== */

let sheetState = {
  open: false,
  dragging: false,
  startY: 0,
  startTranslate: 0,
  height: 0
};

function getSheetElements() {
  const sheet = document.querySelector('.admin-sheet');
  const backdrop = document.querySelector('.admin-sheet-backdrop');
  const trigger = document.querySelector('.admin-sheet-trigger');
  return { sheet, backdrop, trigger };
}

function sheetToggle(forceOpen) {
  const { sheet, backdrop, trigger } = getSheetElements();
  if (!sheet || !backdrop || !trigger) return;

  const nextOpen =
    typeof forceOpen === 'boolean'
      ? forceOpen
      : !sheetState.open;

  sheetState.open = nextOpen;
  sheetState.dragging = false;

  sheet.classList.toggle('sheet-open', nextOpen);
  backdrop.classList.toggle('sheet-open', nextOpen);
  trigger.classList.toggle('hidden-trigger', nextOpen);

  sheet.style.transform = '';
}

function sheetDragStart(e) {
  const { sheet } = getSheetElements();
  if (!sheet) return;

  const target = e.target;
  if (!target.closest('.admin-sheet-handle')) return;

  const isTouch = e.type === 'touchstart';
  const clientY = isTouch ? e.touches[0].clientY : e.clientY;

  sheetState.dragging = true;
  sheetState.startY = clientY;
  sheetState.height = Math.min(window.innerHeight * 0.5, 480);
  sheetState.startTranslate = sheetState.open ? 0 : sheetState.height;

  if (!isTouch) {
    window.addEventListener('mousemove', sheetDragMove);
    window.addEventListener('mouseup', sheetDragEnd);
  } else {
    window.addEventListener('touchmove', sheetDragMove, { passive: false });
    window.addEventListener('touchend', sheetDragEnd);
    window.addEventListener('touchcancel', sheetDragEnd);
  }
}

function sheetDragMove(e) {
  if (!sheetState.dragging) return;
  const { sheet } = getSheetElements();
  if (!sheet) return;

  const isTouch = e.type === 'touchmove';
  const clientY = isTouch ? e.touches[0].clientY : e.clientY;

  if (isTouch) e.preventDefault();

  const dy = clientY - sheetState.startY;
  let translate = sheetState.startTranslate + dy;
  if (translate < 0) translate = 0;
  if (translate > sheetState.height) translate = sheetState.height;

  const percent = (translate / sheetState.height) * 100;
  sheet.style.transform = `translateY(${percent}%)`;
}

function sheetDragEnd() {
  if (!sheetState.dragging) return;
  sheetState.dragging = false;

  const { sheet } = getSheetElements();
  if (!sheet) return;

  const match = /translateY\(([-\d.]+)%\)/.exec(sheet.style.transform || '');
  const percent = match ? parseFloat(match[1]) : (sheetState.open ? 0 : 100);

  const shouldOpen = percent < 50;
  sheetToggle(shouldOpen);

  window.removeEventListener('mousemove', sheetDragMove);
  window.removeEventListener('mouseup', sheetDragEnd);
  window.removeEventListener('touchmove', sheetDragMove);
  window.removeEventListener('touchend', sheetDragEnd);
  window.removeEventListener('touchcancel', sheetDragEnd);
}

/* ========== Root admin panel renderer ========== */

function renderAdminPanel() {
  const tabs = [
    { id: 'dashboard', icon: '📊', label: 'داشبورد' },
    { id: 'products', icon: '📦', label: 'محصولات' },
    { id: 'orders', icon: '🛒', label: 'سفارشات' },
    { id: 'categories', icon: '🗂️', label: 'دسته‌بندی‌ها' },
    { id: 'reviews', icon: '📝', label: 'نظرات' },
    { id: 'support', icon: '💬', label: 'پشتیبانی' }
  ];

  const pendingReviewsCount = (state.reviews || []).filter(r => r.status === 'pending').length;

  return `
    <div class="flex flex-col lg:flex-row min-h-screen">
      <!-- Sidebar (Desktop) -->
      <aside class="hidden lg:flex w-72 glass-dark border-l border-white/5 flex-col fixed right-0 top-0 h-screen overflow-y-auto">
        <div class="p-6 border-b border-white/5">
          <div class="flex items-center gap-3">
            <span class="text-3xl">⚙️</span>
            <div>
              <h1 class="font-black text-lg">پنل مدیریت</h1>
              <p class="text-xs text-white/60">مدیریت فروشگاه</p>
            </div>
          </div>
        </div>
        <nav class="flex-1 p-4">
          ${tabs
            .map(
              tab => `
            <button 
              onclick="state.adminTab='${tab.id}'; render()"
              class="sidebar-item w-full text-right px-5 py-4 flex items-center justify-between text-sm ${state.adminTab === tab.id ? 'active' : ''}" type="button"
            >
              <div class="flex items-center gap-3">
                <span class="relative text-xl">
                  ${tab.icon}
                  ${
                    tab.id === 'reviews' && pendingReviewsCount > 0
                      ? `<span class="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                          ${pendingReviewsCount}
                         </span>`
                      : ''
                  }
                </span>
                <span class="font-medium">${tab.label}</span>
              </div>
            </button>
          `
            )
            .join('')}
        </nav>
        <div class="p-4 border-t border-white/5 space-y-2">
          <button onclick="goTo('home')" class="w-full btn-ghost py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium" type="button">🏠 مشاهده سایت</button>
          <button onclick="logout()" class="w-full bg-rose-500/10 text-rose-400 py-3 rounded-xl hover:bg-rose-500/20 flex items-center justify-center gap-2 text-sm font-medium transition-all" type="button">🚪 خروج</button>
        </div>
      </aside>

      <!-- Mobile Header -->
      <header class="lg:hidden glass-dark border-b border-white/5 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl">⚙️</span>
            <h1 class="font-bold">پنل مدیریت</h1>
          </div>
          <div class="flex gap-2">
            <button onclick="goTo('home')" class="p-2 glass rounded-xl text-sm" type="button">🏠</button>
            <button onclick="logout()" class="p-2 glass rounded-xl text-rose-400 text-sm" type="button">🚪</button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 p-4 lg:p-8 overflow-auto overflow-x-hidden pb-24 lg:pb-8 lg:mr-72 mr-0">
        ${state.adminTab === 'dashboard' ? (typeof renderAdminDashboard === 'function' ? renderAdminDashboard() : '') : ''}
        ${state.adminTab === 'products' ? (typeof renderAdminProductsEditor === 'function' ? renderAdminProductsEditor() : '') : ''}
        ${state.adminTab === 'orders' ? renderAdminOrdersSafe() : ''}
        ${state.adminTab === 'categories' ? renderAdminCategoriesEditor() : ''}
        ${state.adminTab === 'reviews' ? renderAdminReviews() : ''}
        ${state.adminTab === 'support' ? renderAdminSupportSafe() : ''}
      </main>

      <!-- Mobile Bottom Sheet Trigger -->
      <button
        type="button"
        class="admin-sheet-trigger lg:hidden ${sheetState.open ? 'hidden-trigger' : ''}"
        onclick="sheetToggle(true)"
      >
        <span class="icon">⬆️</span>
        <span>بخش‌های پنل مدیریت</span>
      </button>

      <!-- Mobile Bottom Sheet Backdrop -->
      <div 
        class="admin-sheet-backdrop lg:hidden ${sheetState.open ? 'sheet-open' : ''}"
        onclick="sheetToggle(false)"
      ></div>

      <!-- Mobile Bottom Sheet (Tabs) -->
      <div 
        class="admin-sheet lg:hidden ${sheetState.open ? 'sheet-open' : ''}"
      >
        <div class="admin-sheet-header" onmousedown="sheetDragStart(event)" ontouchstart="sheetDragStart(event)">
          <div class="admin-sheet-handle"></div>
          <div class="admin-sheet-toggle-icon" onclick="sheetToggle()">
            ▲
          </div>
        </div>
        <div class="admin-sheet-body">
          <div class="admin-sheet-tabs">
            ${tabs
              .map(tab => `
                <button
                  type="button"
                  class="admin-sheet-tab-btn ${state.adminTab === tab.id ? 'active' : ''}"
                  onclick="state.adminTab='${tab.id}'; sheetToggle(false); render()"
                >
                  <span>
                    <span class="tab-icon">${tab.icon}</span>
                    <span>${tab.label}</span>
                  </span>
                  ${
                    tab.id === 'reviews' && pendingReviewsCount > 0
                      ? `<span class="admin-sheet-tab-badge">${pendingReviewsCount}</span>`
                      : ''
                  }
                </button>
              `)
              .join('')}
          </div>
        </div>
      </div>

      ${renderCategoryModal()}
    </div>
  `;
}

/* ========== Helper wrapper to align legacy select to new API ========== */

function updateOrderStatus(order, nextStatus) {
  if (!order || !order.id) return;
  updateOrder(order.id, { status: nextStatus });
}

/* ========== Categories: modal-based CRUD + product assignment ========== */

function openCategoryModal(mode, id = null) {
  if (mode === 'add') {
    state.categoryModal = {
      mode: 'add',
      id: null,
      title: '',
      selectedProducts: []
    };
  } else {
    state.categories = Array.isArray(state.categories) ? state.categories : [];
    state.products = Array.isArray(state.products) ? state.products : [];

    const cat = state.categories.find(c => c.id === id);
    if (!cat) return;

    const selectedProducts = state.products.filter(p => p.category === id).map(p => p.id);

    state.categoryModal = {
      mode: 'edit',
      id,
      title: cat.title,
      selectedProducts
    };
  }
  render();
}

function closeCategoryModal() {
  state.categoryModal = null;
  render();
}

function saveCategoryModal() {
  const m = state.categoryModal;
  if (!m) return;

  const title = (m.title || '').trim();
  if (!title) {
    toast('نام دسته‌بندی الزامی است', 'warning');
    return;
  }

  state.categories = Array.isArray(state.categories) ? state.categories : [];
  state.products = Array.isArray(state.products) ? state.products : [];

  if (m.mode === 'add') {
    const id = utils.generateId();
    state.categories.push({ id, title });

    state.products.forEach(p => {
      if (m.selectedProducts.includes(p.id)) {
        p.category = id;
      }
    });

    toast('دسته‌بندی اضافه شد', 'success');
  } else {
    const cat = state.categories.find(c => c.id === m.id);
    if (!cat) return;

    cat.title = title;

    state.products.forEach(p => {
      if (p.category === m.id) p.category = '';
    });

    state.products.forEach(p => {
      if (m.selectedProducts.includes(p.id)) {
        p.category = m.id;
      }
    });

    toast('دسته‌بندی بروزرسانی شد', 'success');
  }

  closeCategoryModal();
}

function deleteCategoryWithConfirm(id) {
  state.categories = Array.isArray(state.categories) ? state.categories : [];
  state.products = Array.isArray(state.products) ? state.products : [];

  const cat = state.categories.find(c => c.id === id);
  if (!cat) return;

  state.categoryModal = null;

  state.confirmModal = {
    type: 'delete-category',
    title: 'حذف دسته',
    message: `آیا از حذف «${cat.title}» مطمئن هستید؟`,
    icon: '🗑️',
    confirmText: 'حذف',
    confirmClass: 'btn-danger',
    onConfirm: () => {
      state.categories = state.categories.filter(c => c.id !== id);
      state.products.forEach(p => {
        if (p.category === id) p.category = '';
      });
      state.confirmModal = null;
      render();
    }
  };
  render();
}

function renderCategoryModal() {
  const m = state.categoryModal;
  if (!m) return '';

  state.products = Array.isArray(state.products) ? state.products : [];

  const uncategorized = state.products.filter(p => !p.category || p.category === m.id);

  return `
    <div class="fixed inset-0 z-[200] flex items-center justify-center p-4 modal-overlay">
      <div class="glass-strong rounded-3xl p-6 lg:p-8 max-w-lg w-full max-h-[90%] overflow-y-auto animate-scale">

        <h2 class="text-xl font-black mb-6">
          ${m.mode === 'add' ? '➕ دسته‌بندی جدید' : '✏️ ویرایش دسته‌بندی'}
        </h2>

        <div class="space-y-5">

          <div>
            <label class="block text-sm text-white/70 mb-2">نام دسته *</label>
            <input 
              type="text"
              class="w-full input-style"
              value="${m.title}"
              oninput="state.categoryModal.title=this.value"
              placeholder="نام دسته را وارد کنید"
            >
          </div>

          <div>
            <label class="block text-sm text-white/70 mb-2">محصولات بدون دسته</label>
            <div class="flex gap-3 overflow-x-auto pb-2">
              ${
                uncategorized.length === 0
                  ? `<p class="text-white/40 text-sm">محصول بدون دسته وجود ندارد</p>`
                  : uncategorized
                      .map(
                        p => `
                    <label class="glass rounded-xl p-3 flex-shrink-0 w-40 cursor-pointer hover:bg-white/10 transition">
                      <div class="w-full h-24 bg-white/5 rounded-lg overflow-hidden mb-2">
                        ${
                          p.image || p.main_image
                            ? `<img src="${p.image || p.main_image}" class="w-full h-full object-cover">`
                            : `<div class="w-full h-full flex items-center justify-center text-3xl">📦</div>`
                        }
                      </div>

                      <div class="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          class="w-4 h-4"
                          ${m.selectedProducts.includes(p.id) ? 'checked' : ''}
                          onchange="
                            if(this.checked){
                              if(!state.categoryModal.selectedProducts.includes('${p.id}')){
                                state.categoryModal.selectedProducts.push('${p.id}');
                              }
                            } else {
                              state.categoryModal.selectedProducts = state.categoryModal.selectedProducts.filter(x => x !== '${p.id}');
                            }
                            render();
                          "
                        >
                        <span class="text-xs line-clamp-2">${p.title}</span>
                      </div>
                    </label>
                  `
                      )
                      .join('')
              }
            </div>
          </div>

        </div>

        <div class="flex gap-4 mt-8">
          ${
            m.mode === 'edit'
              ? `<button 
                  type="button" 
                  onclick="deleteCategoryWithConfirm('${m.id}')"
                  class="flex-1 btn-danger py-4 rounded-xl font-semibold"
                >
                  حذف دسته
                </button>`
              : ''
          }

          <button 
            type="button" 
            onclick="closeCategoryModal()"
            class="flex-1 btn-ghost py-4 rounded-xl font-semibold"
          >
            انصراف
          </button>

          <button 
            type="button" 
            onclick="saveCategoryModal()"
            class="flex-1 btn-primary py-4 rounded-xl font-semibold"
          >
            ثبت
          </button>
        </div>

      </div>
    </div>
  `;
}

function renderAdminCategoriesEditor() {
  state.categories = Array.isArray(state.categories) ? state.categories : [];

  return `
    <div class="animate-fade">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl lg:text-3xl font-black">مدیریت دسته‌بندی‌ها (${state.categories.length})</h1>
        <button class="btn-primary px-5 py-3 rounded-xl font-semibold text-sm" type="button" onclick="openCategoryModal('add')">
          افزودن دسته
        </button>
      </div>

      <div class="grid gap-3">
        ${state.categories
          .map(
            (c, i) => `
          <div class="glass rounded-xl p-4 flex items-center justify-between animate-fade" style="animation-delay:${i *
            0.05}s">
            <div>
              <div class="font-semibold">${c.title}</div>
              <div class="text-xs text-white/40">${c.id}</div>
            </div>
            <div class="flex gap-2">
              <button class="p-2 glass rounded-xl" type="button" onclick="openCategoryModal('edit', '${c.id}')">✏️</button>
              <button class="p-2 glass rounded-xl text-rose-400 hover:bg-rose-500/20" type="button" onclick="deleteCategoryWithConfirm('${c.id}')">🗑️</button>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

/* ========== Reviews: product-based moderation + like/dislike ========== */

function normalizeReview(r) {
  if (!r) return null;
  r.status = r.status || 'pending';
  r.likes = typeof r.likes === 'number' ? r.likes : parseInt(r.likes || '0', 10) || 0;
  r.dislikes = typeof r.dislikes === 'number' ? r.dislikes : parseInt(r.dislikes || '0', 10) || 0;
  return r;
}

function getReviewProductId(r) {
  return r.product_id || r.productId || r.product || 'unknown';
}

function getReviewProductTitle(r) {
  return r.product_title || r.productTitle || r.product_name || 'محصول بدون نام';
}

function setReviewStatus(id, status) {
  state.reviews = Array.isArray(state.reviews) ? state.reviews : [];
  const r = state.reviews.find(x => x.id === id);
  if (!r) return;
  r.status = status;
  render();
}

function reactToReview(id, reaction) {
  state.reviews = Array.isArray(state.reviews) ? state.reviews : [];
  const r = state.reviews.find(x => x.id === id);
  if (!r) return;

  normalizeReview(r);

  const prev = r._adminReaction || null;

  if (reaction === 'like') {
    if (prev === 'like') {
      r.likes = Math.max(0, r.likes - 1);
      r._adminReaction = null;
    } else {
      if (prev === 'dislike') r.dislikes = Math.max(0, r.dislikes - 1);
      r.likes += 1;
      r._adminReaction = 'like';
    }
  } else if (reaction === 'dislike') {
    if (prev === 'dislike') {
      r.dislikes = Math.max(0, r.dislikes - 1);
      r._adminReaction = null;
    } else {
      if (prev === 'like') r.likes = Math.max(0, r.likes - 1);
      r.dislikes += 1;
      r._adminReaction = 'dislike';
    }
  }

  render();
}

function renderAdminReviews() {
  state.reviews = Array.isArray(state.reviews) ? state.reviews.map(normalizeReview) : [];

  const byProduct = {};
  state.reviews.forEach(r => {
    const pid = getReviewProductId(r);
    if (!byProduct[pid]) {
      byProduct[pid] = {
        id: pid,
        title: getReviewProductTitle(r),
        reviews: []
      };
    }
    byProduct[pid].reviews.push(r);
  });

  const productIds = Object.keys(byProduct);
  if (!state.adminReviewsSelectedProductId && productIds.length > 0) {
    state.adminReviewsSelectedProductId = productIds[0];
  }

  const activeProductId = state.adminReviewsSelectedProductId;
  const activeProduct = activeProductId ? byProduct[activeProductId] : null;
  const activeReviews = activeProduct ? activeProduct.reviews : [];

  const pendingCount = state.reviews.filter(r => r.status === 'pending').length;

  return `
    <div class="animate-fade">
      <div class="flex flex-col lg:flex-row gap-6">
        
        <!-- Products list -->
        <aside class="lg:w-72 glass rounded-2xl p-4 h-max max-h-[70vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-sm font-bold flex items-center gap-2">
              <span>📝</span>
              <span>محصولات با نظر</span>
            </h2>
            ${
              pendingCount > 0
                ? `<span class="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">در انتظار: ${pendingCount}</span>`
                : ''
            }
          </div>
          ${
            productIds.length === 0
              ? `<p class="text-xs text-white/60">هنوز نظری ثبت نشده است.</p>`
              : productIds
                  .map(pid => {
                    const p = byProduct[pid];
                    const pPending = p.reviews.filter(r => r.status === 'pending').length;
                    return `
                      <button
                        type="button"
                        class="w-full text-right px-3 py-2 rounded-xl text-xs mb-1 flex items-center justify-between ${activeProductId === pid ? 'bg-white/10' : 'glass hover:bg-white/10'}"
                        onclick="state.adminReviewsSelectedProductId='${pid}'; render()"
                      >
                        <span class="line-clamp-1">${p.title}</span>
                        <span class="flex items-center gap-1 text-[10px] text-white/60">
                          <span>${p.reviews.length} نظر</span>
                          ${
                            pPending > 0
                              ? `<span class="px-1.5 py-0.5 rounded-full bg-rose-500/30 text-rose-100">${pPending}</span>`
                              : ''
                          }
                        </span>
                      </button>
                    `;
                  })
                  .join('')
          }
        </aside>

        <!-- Reviews list -->
        <section class="flex-1">
          ${
            !activeProduct
              ? `<div class="glass rounded-2xl p-10 text-center text-sm text-white/60">
                  محصولی برای نمایش نظرات انتخاب نشده است.
                </div>`
              : `
            <div class="flex items-center justify-between mb-4">
              <div>
                <h1 class="text-xl lg:text-2xl font-black mb-1">نظرات محصول</h1>
                <p class="text-xs text-white/60 line-clamp-1">${activeProduct.title}</p>
              </div>
              <div class="text-xs text-white/60">
                <span>کل نظرات: ${activeReviews.length}</span>
              </div>
            </div>

            ${
              activeReviews.length === 0
                ? `<div class="glass rounded-2xl p-10 text-center text-sm text-white/60">
                    برای این محصول نظری ثبت نشده است.
                  </div>`
                : `
              <div class="space-y-3 max-h-[70vh] overflow-y-auto">
                ${activeReviews
                  .map(r => {
                    const created = r.created_at || r.createdAt || '';
                    const rating = typeof r.rating === 'number' ? r.rating : parseInt(r.rating || '0', 10) || 0;
                    const stars = '★★★★★'.slice(0, Math.max(0, Math.min(5, rating)));
                    const emptyStars = '☆☆☆☆☆'.slice(stars.length);
                    return `
                      <div class="glass rounded-2xl p-4 text-sm">
                        <div class="flex items-center justify-between mb-2">
                          <div>
                            <div class="font-semibold text-sm">${r.user_name || r.userName || 'کاربر ناشناس'}</div>
                            <div class="text-[11px] text-white/50">${utils.formatDateTime(created)}</div>
                          </div>
                          <div class="text-xs text-amber-300 font-mono">
                            <span class="text-base">${stars}<span class="text-white/20">${emptyStars}</span></span>
                            ${rating ? `<span class="ml-1 text-[11px] text-white/60">(${rating}/5)</span>` : ''}
                          </div>
                        </div>

                        <p class="text-sm text-white/80 whitespace-pre-line mb-3">${r.text || r.comment || ''}</p>

                        <div class="flex items-center justify-between gap-3">
                          <div class="flex items-center gap-2 text-[11px]">
                            <button
                              type="button"
                              class="px-2 py-1 rounded-lg flex items-center gap-1 ${r._adminReaction === 'like' ? 'bg-emerald-500/20 text-emerald-300' : 'glass text-white/70 hover:bg-white/10'}"
                              onclick="reactToReview('${r.id}', 'like')"
                            >
                              👍 <span>${r.likes}</span>
                            </button>
                            <button
                              type="button"
                              class="px-2 py-1 rounded-lg flex items-center gap-1 ${r._adminReaction === 'dislike' ? 'bg-rose-500/20 text-rose-300' : 'glass text-white/70 hover:bg-white/10'}"
                              onclick="reactToReview('${r.id}', 'dislike')"
                            >
                              👎 <span>${r.dislikes}</span>
                            </button>
                          </div>

                          <div class="flex items-center gap-2 text-[11px]">
                            <span class="px-2 py-1 rounded-lg bg-white/5 text-white/70">
                              ${
                                r.status === 'approved'
                                  ? '✅ تایید شده'
                                  : r.status === 'rejected'
                                  ? '⛔ رد شده'
                                  : '⏳ در انتظار'
                              }
                            </span>
                            <button
                              type="button"
                              class="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30"
                              onclick="setReviewStatus('${r.id}', 'approved')"
                            >
                              تایید
                            </button>
                            <button
                              type="button"
                              class="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-200 hover:bg-rose-500/30"
                              onclick="setReviewStatus('${r.id}', 'rejected')"
                            >
                              رد
                            </button>
                          </div>
                        </div>
                      </div>
                    `;
                  })
                  .join('')}
              </div>
            `
            }
          `
          }
        </section>

      </div>
    </div>
  `;
}

/* ========== Orders: safe render ========== */

function renderAdminOrdersSafe() {
  let filteredOrders = Array.isArray(state.orders) ? [...state.orders] : [];
  if (state.orderFilter.status) {
    filteredOrders = filteredOrders.filter(o => o.status === state.orderFilter.status);
  }

  return `
    <div class="animate-fade">
      <h1 class="text-2xl lg:text-3xl font-black mb-8">سفارشات (${filteredOrders.length})</h1>

      <div class="glass rounded-2xl p-5 mb-6">
        <div class="flex flex-wrap gap-2">
          <button onclick="state.orderFilter.status = ''; render()" class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            !state.orderFilter.status ? 'bg-violet-500 text-white' : 'glass hover:bg-white/10'
          }">همه</button>
          ${
            [
              { value: 'pending', label: '⏳ در انتظار', color: 'bg-amber-500' },
              { value: 'processing', label: '⚙️ پردازش', color: 'bg-blue-500' },
              { value: 'shipped', label: '🚚 ارسال شده', color: 'bg-cyan-500' },
              { value: 'delivered', label: '✅ تحویل', color: 'bg-emerald-500' }
            ]
              .map(
                opt => `
              <button onclick="state.orderFilter.status = '${opt.value}'; render()" class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  state.orderFilter.status === opt.value ? opt.color + ' text-white' : 'glass hover:bg-white/10'
                }">${opt.label}</button>
            `
              )
              .join('')
          }
        </div>
      </div>

      ${
        filteredOrders.length > 0
          ? `
          <div class="space-y-4">
            ${filteredOrders
              .map(order => {
                let items = [];
                if (Array.isArray(order.items)) {
                  items = order.items;
                } else {
                  try {
                    items = JSON.parse(order.items || '[]');
                  } catch {
                    items = [];
                  }
                }

                return `
                <div class="glass rounded-2xl p-6 animate-fade">
                  <div class="flex flex-wrap items-center justify-between gap-4 mb-5">
                    <div>
                      <span class="font-mono font-bold">#${(order.id || '').slice(-8)}</span>
                      <p class="text-xs text-white/60 mt-1">${utils.formatDateTime(order.created_at || order.createdAt || '')}</p>
                    </div>
                    <div>
                      <label for="status-${order.id}" class="sr-only">وضعیت سفارش</label>
                      <select 
                        id="status-${order.id}"
                        onchange="updateOrder('${order.id}', { status: this.value })"
                        class="bg-white/10 border border-white/20 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-violet-500"
                      >
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>⏳ در انتظار</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>⚙️ پردازش</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>🚚 ارسال شده</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>✅ تحویل</option>
                      </select>
                    </div>
                  </div>
                  
                  <div class="grid md:grid-cols-3 gap-4">
                    <div class="glass rounded-xl p-4">
                      <p class="text-xs text-white/60 mb-2">مشتری</p>
                      <p class="font-semibold">${order.user_name || 'بدون نام'}</p>
                      <p class="text-sm font-mono text-white/70">${order.user_phone || order.userPhone || ''}</p>
                    </div>
                    
                    <div class="glass rounded-xl p-4 hidden md:block">
                      <p class="text-xs text-white/60 mb-2">آدرس</p>
                      <p class="text-sm line-clamp-2">${order.address || '-'}</p>
                    </div>
                    
                    <div class="glass rounded-xl p-4">
                      <p class="text-xs text-white/60 mb-2">مبلغ کل</p>
                      <p class="text-xl font-black text-emerald-400">${utils.formatPrice(
                        order.total || (order.subtotal || 0) + (order.shipping || 0)
                      )}</p>
                      <p class="text-xs text-white/60">${items.length} کالا</p>
                    </div>
                  </div>
                </div>
              `;
              })
              .join('')}
          </div>
        `
          : `
          <div class="glass rounded-3xl p-16 text-center">
            <div class="text-7xl mb-6">🛒</div>
            <h3 class="text-2xl font-bold">سفارشی یافت نشد</h3>
          </div>
        `
      }
    </div>
  `;
}

/* ========== Support: messenger-style + quick replies ========== */

function getTicketMessages(t) {
  if (!t) return [];
  if (Array.isArray(t.messages)) return t.messages;
  try {
    const parsed = JSON.parse(t.messages || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setTicketMessages(t, msgs) {
  t.messages = Array.isArray(msgs) ? msgs : [];
}

function addTicketMessage(ticket, payload) {
  if (!ticket) return Promise.resolve(false);
  const text = String(payload.text || '').trim();
  if (!text) return Promise.resolve(false);

  const msgs = getTicketMessages(ticket);
  msgs.push({
    from: payload.from || 'admin',
    text,
    at: new Date().toISOString()
  });
  setTicketMessages(ticket, msgs);

  if (window.AppState) AppState.set({ tickets: state.tickets });

  render();
  return Promise.resolve(true);
}

function updateTicketStatus(ticket, status) {
  if (!ticket) return;
  ticket.status = status;
  if (window.AppState) AppState.set({ tickets: state.tickets });
  render();
}

function closeTicket(ticket) {
  if (!ticket) return;
  ticket.status = 'closed';
  if (window.AppState) AppState.set({ tickets: state.tickets });
  render();
}

/* Quick replies CRUD */

function addQuickReply(label, text) {
  const lbl = String(label || '').trim();
  const txt = String(text || '').trim();
  if (!lbl || !txt) {
    toast('عنوان و متن پاسخ آماده الزامی است', 'warning');
    return;
  }
  const id = (utils && utils.uid ? utils.uid() : 'qr_' + Date.now());
  state.supportQuickReplies.push({ id, label: lbl, text: txt });
  if (window.AppState) AppState.set({ supportQuickReplies: state.supportQuickReplies });
  toast('پاسخ آماده اضافه شد', 'success');
  render();
}

function deleteQuickReply(id) {
  state.supportQuickReplies = state.supportQuickReplies.filter(q => q.id !== id);
  if (window.AppState) AppState.set({ supportQuickReplies: state.supportQuickReplies });
  toast('پاسخ آماده حذف شد', 'success');
  render();
}

function renderAdminSupportQuickReplies() {
  const list = Array.isArray(state.supportQuickReplies) ? state.supportQuickReplies : [];

  return `
    <div class="glass rounded-2xl p-4 lg:p-6 animate-fade">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg lg:text-xl font-bold flex items-center gap-2">
          <span>⚡</span><span>مدیریت پاسخ‌های آماده</span>
        </h2>
      </div>

      <form class="grid gap-3 mb-5" onsubmit="event.preventDefault(); addQuickReply(this.label.value, this.text.value); this.reset();">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div class="lg:col-span-1">
            <label class="block text-xs text-white/60 mb-1">عنوان پاسخ *</label>
            <input name="label" class="input-style w-full" placeholder="مثال: تشکر از تماس" required>
          </div>
          <div class="lg:col-span-2">
            <label class="block text-xs text-white/60 mb-1">متن پاسخ *</label>
            <textarea name="text" class="input-style w-full resize-none" rows="2" placeholder="متن کامل پاسخ آماده..." required></textarea>
          </div>
        </div>
        <div class="flex justify-end">
          <button class="btn-primary px-4 py-2 rounded-xl text-sm font-semibold" type="submit">افزودن پاسخ آماده</button>
        </div>
      </form>

      <div class="space-y-2 max-h-[55vh] overflow-y-auto">
        ${
          list.length === 0
            ? `<div class="text-sm text-white/60">پاسخ آماده‌ای ثبت نشده است.</div>`
            : list
                .map(
                  q => `
              <div class="glass rounded-xl p-3 flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <div class="font-semibold text-sm mb-1">${q.label}</div>
                  <div class="text-xs text-white/70 whitespace-pre-line">${q.text}</div>
                </div>
                <button type="button" class="btn-ghost text-rose-400 text-xs px-3 py-1 rounded-lg" onclick="deleteQuickReply('${q.id}')">حذف</button>
              </div>
            `
                )
                .join('')
        }
      </div>
    </div>
  `;
}

function renderAdminSupportSafe() {
  const allTickets = Array.isArray(state.tickets) ? state.tickets : [];

  let filtered = allTickets;
  if (state.supportFilter.status) {
    filtered = filtered.filter(t => t.status === state.supportFilter.status);
  }
  if (state.supportFilter.priority) {
    filtered = filtered.filter(t => (t.priority || 'normal') === state.supportFilter.priority);
  }
  if (state.supportFilter.view === 'urgent') {
    filtered = filtered.filter(t => (t.priority || 'normal') === 'urgent');
  }

  filtered = [...filtered].sort((a, b) => {
    const pa = a.priority === 'urgent' ? 1 : 0;
    const pb = b.priority === 'urgent' ? 1 : 0;
    if (pa !== pb) return pb - pa;
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  if (!state.adminSupportSelectedTicketId && filtered.length > 0) {
    state.adminSupportSelectedTicketId = filtered[0].id;
  }
  const activeTicket = filtered.find(t => t.id === state.adminSupportSelectedTicketId) || filtered[0] || null;
  const activeMessages = activeTicket ? getTicketMessages(activeTicket) : [];

  const statusButtons = [
    { value: '', label: 'همه' },
    { value: 'open', label: 'باز' },
    { value: 'closed', label: 'بسته' }
  ];

  const priorityButtons = [
    { value: '', label: 'همه' },
    { value: 'urgent', label: 'فوری' },
    { value: 'normal', label: 'عادی' }
  ];

  return `
    <div class="animate-fade">
      <h1 class="text-2xl lg:text-3xl font-black mb-4">پشتیبانی و تیکت‌ها 💬</h1>

      <div class="glass rounded-2xl p-4 mb-4 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div class="flex flex-wrap gap-2">
          <span class="text-xs text-white/60">وضعیت:</span>
          ${statusButtons
            .map(
              b => `
            <button
              type="button"
              class="px-3 py-1.5 rounded-xl text-xs font-medium ${
                state.supportFilter.status === b.value ? 'bg-violet-500 text-white' : 'glass hover:bg-white/10'
              }"
              onclick="state.supportFilter.status='${b.value}'; render()"
            >
              ${b.label}
            </button>
          `
            )
            .join('')}
        </div>

        <div class="flex flex-wrap gap-2">
          <span class="text-xs text-white/60">اولویت:</span>
          ${priorityButtons
            .map(
              b => `
            <button
              type="button"
              class="px-3 py-1.5 rounded-xl text-xs font-medium ${
                state.supportFilter.priority === b.value ? 'bg-amber-500 text-white' : 'glass hover:bg-white/10'
              }"
              onclick="state.supportFilter.priority='${b.value}'; render()"
            >
              ${b.label}
            </button>
          `
            )
            .join('')}
        </div>
      </div>

      <div class="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4">
        <!-- Tickets list -->
        <aside class="glass rounded-2xl p-3 max-h-[70vh] overflow-y-auto">
          ${
            filtered.length === 0
              ? `<div class="text-sm text-white/60 p-4 text-center">تیکتی یافت نشد.</div>`
              : filtered
                  .map(t => {
                    const isActive = activeTicket && activeTicket.id === t.id;
                    const isUrgent = (t.priority || 'normal') === 'urgent';
                    const statusLabel =
                      t.status === 'closed' ? 'بسته' : 'باز';
                    return `
                      <button
                        type="button"
                        class="w-full text-right mb-2 px-3 py-2 rounded-xl text-xs ${
                          isActive ? 'bg-white/10' : 'glass hover:bg-white/10'
                        }"
                        onclick="state.adminSupportSelectedTicketId='${t.id}'; render()"
                      >
                        <div class="flex items-center justify-between mb-1">
                          <span class="font-semibold line-clamp-1">${t.subject || 'بدون عنوان'}</span>
                          ${
                            isUrgent
                              ? `<span class="px-1.5 py-0.5 rounded-full bg-rose-500/30 text-rose-100 text-[10px]">فوری</span>`
                              : ''
                          }
                        </div>
                        <div class="flex items-center justify-between text-[10px] text-white/60">
                          <span>${t.user_name || t.userName || 'کاربر'}</span>
                          <span>${utils.formatDateTime(t.created_at || t.createdAt || '')}</span>
                          <span>${statusLabel}</span>
                        </div>
                      </button>
                    `;
                  })
                  .join('')
          }
        </aside>

        <!-- Active ticket / chat -->
        <section class="glass rounded-2xl p-4 flex flex-col max-h-[70vh]">
          ${
            !activeTicket
              ? `<div class="flex-1 flex items-center justify-center text-sm text-white/60">
                  تیکتی برای نمایش انتخاب نشده است.
                </div>`
              : `
            <div class="border-b border-white/10 pb-3 mb-3 flex items-center justify-between">
              <div>
                <h2 class="text-sm font-bold mb-1 line-clamp-1">${activeTicket.subject || 'بدون عنوان'}</h2>
                <p class="text-[11px] text-white/60">
                  ${activeTicket.user_name || activeTicket.userName || 'کاربر'} •
                  ${utils.formatDateTime(activeTicket.created_at || activeTicket.createdAt || '')}
                </p>
              </div>
              <div class="flex items-center gap-2 text-[11px]">
                <span class="px-2 py-1 rounded-lg bg-white/5 text-white/70">
                  ${
                    activeTicket.status === 'closed'
                      ? 'بسته'
                      : 'باز'
                  }
                </span>
                ${
                  activeTicket.status !== 'closed'
                    ? `<button
                        type="button"
                        class="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30"
                        onclick="closeTicket(state.tickets.find(t => t.id === '${activeTicket.id}'))"
                      >
                        بستن تیکت
                      </button>`
                    : ''
                }
              </div>
            </div>

            <div class="flex-1 overflow-y-auto space-y-2 mb-3">
              ${
                activeMessages.length === 0
                  ? `<div class="text-xs text-white/60 text-center py-4">پیامی ثبت نشده است.</div>`
                  : activeMessages
                      .map(m => {
                        const isAdmin = (m.from || 'user') === 'admin';
                        return `
                          <div class="flex ${isAdmin ? 'justify-start' : 'justify-end'}">
                            <div class="max-w-[80%] rounded-2xl px-3 py-2 text-xs ${
                              isAdmin ? 'bg-white/10 text-white' : 'bg-violet-500 text-white'
                            }">
                              <div class="mb-1 text-[10px] opacity-70">
                                ${isAdmin ? 'پشتیبانی' : (activeTicket.user_name || activeTicket.userName || 'کاربر')}
                                • ${utils.formatDateTime(m.at || '')}
                              </div>
                              <div class="whitespace-pre-line">${m.text}</div>
                            </div>
                          </div>
                        `;
                      })
                      .join('')
              }
            </div>

            <div class="border-t border-white/10 pt-3 mt-auto space-y-2">
              <div class="flex flex-wrap gap-2 mb-1">
                ${
                  (Array.isArray(state.supportQuickReplies) ? state.supportQuickReplies : [])
                    .map(
                      q => `
                    <button
                      type="button"
                      class="px-2 py-1 rounded-xl text-[11px] glass hover:bg-white/10"
                      onclick="addTicketMessage(state.tickets.find(t => t.id === '${activeTicket.id}'), { from: 'admin', text: '${(q.text || '').replace(/'/g, "\\'")}' })"
                    >
                      ${q.label}
                    </button>
                  `
                    )
                    .join('')
                }
              </div>

              <form
                class="flex items-center gap-2"
                onsubmit="
                  event.preventDefault();
                  const input = this.querySelector('textarea');
                  const val = input.value;
                  addTicketMessage(state.tickets.find(t => t.id === '${activeTicket.id}'), { from: 'admin', text: val }).then(ok => { if(ok) input.value=''; });
                "
              >
                <textarea
                  class="flex-1 input-style resize-none text-xs"
                  rows="2"
                  placeholder="پاسخ خود را بنویسید..."
                ></textarea>
                <button
                  type="submit"
                  class="px-3 py-2 rounded-xl bg-violet-500 text-white text-xs font-semibold hover:bg-violet-600"
                >
                  ارسال
                </button>
              </form>
            </div>
          `
          }
        </section>
      </div>

      <div class="mt-4">
        ${renderAdminSupportQuickReplies()}
      </div>
    </div>
  `;
}
