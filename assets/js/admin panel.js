// ═══════════════════════════════════════════════════════════════
// ADMIN PANEL (GPT‑5 FINAL + MOBILE BOTTOM SHEET MENU)
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

// Bottom sheet state (mobile)
state.sheet = state.sheet || {
  open: false,
  dragging: false,
  progress: 0 // 0 = بسته، 1 = باز (نیم صفحه)
};

let _sheetDrag = {
  active: false,
  startY: 0,
  startProgress: 0
};

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

  const sheetProgress =
    typeof state.sheet.progress === 'number'
      ? state.sheet.progress
      : state.sheet.open
      ? 1
      : 0;
  const sheetTranslateY = (1 - sheetProgress) * 100;

  const showTrigger = !state.sheet.open;

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
              class="sidebar-item w-full text-right px-5 py-4 flex items-center justify-between text-sm ${
                state.adminTab === tab.id ? 'active' : ''
              }" type="button"
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
        class="admin-sheet-trigger lg:hidden ${showTrigger ? '' : 'hidden-trigger'}"
        onclick="sheetToggle(true)"
      >
        <span class="icon">⬆️</span>
        <span>بخش‌های پنل مدیریت</span>
      </button>

      <!-- Mobile Bottom Sheet Backdrop -->
      <div 
        class="admin-sheet-backdrop ${state.sheet.open ? 'sheet-open' : ''} lg:hidden"
        onclick="sheetToggle(false)"
      ></div>

      <!-- Mobile Bottom Sheet (Tabs) -->
      <div 
        class="admin-sheet lg:hidden ${state.sheet.open ? 'sheet-open' : ''} ${state.sheet.dragging ? 'sheet-dragging' : ''}"
        style="transform: translateY(${sheetTranslateY}%);"
        onmousedown="sheetDragStart(event)"
        ontouchstart="sheetDragStart(event)"
      >
        <div class="admin-sheet-header">
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
                  onclick="state.adminTab='${tab.id}'; sheetToggle(false);"
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

/* ========== Bottom sheet logic (mobile) ========== */

function sheetToggle(forceOpen) {
  const nextOpen =
    typeof forceOpen === 'boolean'
      ? forceOpen
      : !state.sheet.open;

  state.sheet.open = nextOpen;
  state.sheet.dragging = false;
  state.sheet.progress = nextOpen ? 1 : 0;
  render();
}

function sheetDragStart(e) {
  const isTouch = e.type === 'touchstart';
  const clientY = isTouch ? e.touches[0].clientY : e.clientY;

  _sheetDrag.active = true;
  _sheetDrag.startY = clientY;
  _sheetDrag.startProgress =
    typeof state.sheet.progress === 'number'
      ? state.sheet.progress
      : state.sheet.open
      ? 1
      : 0;

  state.sheet.dragging = true;

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
  if (!_sheetDrag.active) return;

  const isTouch = e.type === 'touchmove';
  const clientY = isTouch ? e.touches[0].clientY : e.clientY;

  if (isTouch) e.preventDefault();

  const dy = clientY - _sheetDrag.startY;
  const sheetHeight = Math.min(window.innerHeight * 0.5, 480);
  const delta = dy / sheetHeight;

  let p = _sheetDrag.startProgress - delta;
  if (p < 0) p = 0;
  if (p > 1) p = 1;

  state.sheet.progress = p;
  render();
}

function sheetDragEnd() {
  if (!_sheetDrag.active) return;
  _sheetDrag.active = false;

  const p =
    typeof state.sheet.progress === 'number'
      ? state.sheet.progress
      : state.sheet.open
      ? 1
      : 0;

  const shouldOpen = p > 0.5;
  state.sheet.open = shouldOpen;
  state.sheet.progress = shouldOpen ? 1 : 0;
  state.sheet.dragging = false;

  window.removeEventListener('mousemove', sheetDragMove);
  window.removeEventListener('mouseup', sheetDragEnd);
  window.removeEventListener('touchmove', sheetDragMove);
  window.removeEventListener('touchend', sheetDragEnd);
  window.removeEventListener('touchcancel', sheetDragEnd);

  render();
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
  return `
    <div class="animate-fade">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl lg:text-3xl font-black">مدیریت دسته‌بندی‌ها (${state.categories.length})</h1>
        <button class="btn-primary px-5 py-3 rounded-xl font-semibold text-sm" type="button" onclick="openCategoryModal('add')">
          افزودن دسته
        </button>
      </div>

      <div class="grid gap-3">
        ${(state.categories || [])
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
              onclick="state.supportFilter.status='${b.value}'; render()"
              class="px-3 py-1.5 rounded-xl text-xs ${
                state.supportFilter.status === b.value ? 'bg-violet-500 text-white' : 'glass'
              }"
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
              onclick="state.supportFilter.priority='${b.value}'; render()"
              class="px-3 py-1.5 rounded-xl text-xs ${
                state.supportFilter.priority === b.value ? 'bg-amber-500 text-white' : 'glass'
              }"
            >
              ${b.label}
            </button>
          `
            )
            .join('')}
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            onclick="state.supportFilter.view='all'; render()"
            class="px-3 py-1.5 rounded-xl text-xs ${
              state.supportFilter.view === 'all' ? 'bg-emerald-500 text-white' : 'glass'
            }"
          >
            همه تیکت‌ها
          </button>
          <button
            type="button"
            onclick="state.supportFilter.view='urgent'; render()"
            class="px-3 py-1.5 rounded-xl text-xs ${
              state.supportFilter.view === 'urgent' ? 'bg-rose-500 text-white' : 'glass'
            }"
          >
            تیکت‌های فوری
          </button>
          <button
            type="button"
            onclick="state.supportFilter.view='quick'; render()"
            class="px-3 py-1.5 rounded-xl text-xs ${
              state.supportFilter.view === 'quick' ? 'bg-blue-500 text-white' : 'glass'
            }"
          >
            پاسخ‌های آماده
          </button>
        </div>
      </div>

      ${
        state.supportFilter.view === 'quick'
          ? renderAdminSupportQuickReplies()
          : `
        <div class="glass rounded-2xl p-3 lg:p-4 flex flex-col lg:flex-row gap-3 min-h-[420px] lg:min-h-[480px]">

          <div class="w-full lg:w-80 lg:max-w-xs flex-shrink-0 flex flex-col gap-2 max-h-[260px] lg:max-h-[70vh] overflow-y-auto pr-1">
            ${
              filtered.length === 0
                ? `<div class="text-sm text-white/60 px-2 py-3">تیکتی یافت نشد.</div>`
                : filtered
                    .map(t => {
                      const isActive = activeTicket && activeTicket.id === t.id;
                      const priority = t.priority || 'normal';
                      const msgs = getTicketMessages(t);
                      const lastMsg = msgs[msgs.length - 1];
                      const name = t.user_name || 'کاربر';
                      const phone = t.user_phone || '-';
                      const initial = name.trim()[0] || 'ک';

                      return `
                        <button
                          type="button"
                          class="glass rounded-xl px-3 py-2 text-right text-xs flex flex-col gap-1 ${
                            isActive ? 'border border-violet-400/60 bg-violet-500/10' : ''
                          }"
                          onclick="state.adminSupportSelectedTicketId='${t.id}'; render()"
                        >
                          <div class="flex items-center justify-between gap-2">
                            <div class="flex items-center gap-2">
                              <div class="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[11px]">
                                ${initial}
                              </div>
                              <div class="flex flex-col">
                                <span class="font-semibold text-[11px]">${name}</span>
                                <span class="text-[10px] text-white/50">${phone}</span>
                              </div>
                            </div>
                            <span class="text-[10px] text-white/40">
                              ${utils.formatTime(t.created_at || t.createdAt || '')}
                            </span>
                          </div>
                          <div class="flex items-center justify-between gap-2 mt-1">
                            <span class="line-clamp-1 text-[11px] text-white/70">
                              ${(lastMsg && lastMsg.text) || t.subject || 'بدون متن'}
                            </span>
                            <span class="text-[10px] ${
                              priority === 'urgent' ? 'text-rose-400' : 'text-emerald-400'
                            }">
                              ${priority === 'urgent' ? 'فوری' : 'عادی'}
                            </span>
                          </div>
                        </button>
                      `;
                    })
                    .join('')
            }
          </div>

          <div class="flex-1 glass rounded-xl p-3 lg:p-4 flex flex-col min-h-[260px] max-h-[70vh]">
            ${
              !activeTicket
                ? `<div class="flex-1 flex items-center justify-center text-sm text-white/60">تیکتی انتخاب نشده است.</div>`
                : `
              <div class="flex items-center justify-between mb-3 gap-2">
                <div>
                  <div class="font-semibold text-sm">${activeTicket.user_name || 'کاربر'}</div>
                  <div class="text-[11px] text-white/60">${activeTicket.user_phone || '-'}</div>
                </div>
                <div class="flex items-center gap-2 text-[11px]">
                  <span class="px-2 py-1 rounded-full ${
                    (activeTicket.priority || 'normal') === 'urgent'
                      ? 'bg-rose-500/15 text-rose-300'
                      : 'bg-emerald-500/15 text-emerald-300'
                  }">
                    ${(activeTicket.priority || 'normal') === 'urgent' ? 'فوری' : 'عادی'}
                  </span>
                  <select
                    class="bg-white/10 border border-white/20 rounded-xl px-2 py-1 text-[11px]"
                    onchange="updateTicketStatus(activeTicket, this.value)"
                  >
                    <option value="open" ${activeTicket.status === 'open' ? 'selected' : ''}>باز</option>
                    <option value="closed" ${activeTicket.status === 'closed' ? 'selected' : ''}>بسته</option>
                  </select>
                </div>
              </div>

              <div class="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
                ${
                  activeMessages.length === 0
                    ? `<div class="text-xs text-white/60">پیامی ثبت نشده است.</div>`
                    : activeMessages
                        .map(m => {
                          const isAdmin = m.from === 'admin';
                          return `
                            <div class="flex ${isAdmin ? 'justify-start' : 'justify-end'}">
                              <div class="max-w-[80%] rounded-2xl px-3 py-2 text-xs ${
                                isAdmin
                                  ? 'bg-white/10 text-white'
                                  : 'bg-violet-500/80 text-white'
                              }">
                                <div class="whitespace-pre-wrap">${m.text}</div>
                                <div class="text-[9px] text-white/60 mt-1 text-left">
                                  ${utils.formatTime(m.at || '')}
                                </div>
                              </div>
                            </div>
                          `;
                        })
                        .join('')
                }
              </div>

              <form
                class="flex items-end gap-2 mt-auto"
                onsubmit="
                  event.preventDefault();
                  const text = this.message.value;
                  addTicketMessage(activeTicket, { text, from: 'admin' }).then(() => { this.reset(); });
                "
              >
                <textarea
                  name="message"
                  rows="1"
                  class="flex-1 input-style text-xs resize-none"
                  placeholder="نوشتن پاسخ..."
                ></textarea>
                <button
                  type="submit"
                  class="btn-primary px-3 py-2 rounded-xl text-xs font-semibold"
                >
                  ارسال
                </button>
              </form>
            `
            }
          </div>
        </div>
      `
      }
    </div>
  `;
}

/* ========== Reviews: safe renderer ========== */

function renderAdminReviews() {
  const reviews = Array.isArray(state.reviews) ? state.reviews : [];
  const products = Array.isArray(state.products) ? state.products : [];

  if (!state.adminReviewsSelectedProductId && reviews.length > 0) {
    const first = reviews[0];
    state.adminReviewsSelectedProductId = first.product_id || first.productId || null;
  }

  const selectedProductId = state.adminReviewsSelectedProductId;
  const productOptions = products.map(p => ({
    id: p.id,
    title: p.title || 'بدون نام'
  }));

  const filteredReviews = selectedProductId
    ? reviews.filter(r => (r.product_id || r.productId) === selectedProductId)
    : reviews;

  const selectedProduct = products.find(p => p.id === selectedProductId) || null;

  return `
    <div class="animate-fade">
      <div class="flex items-center justify-between mb-6 gap-3">
        <div>
          <h1 class="text-2xl lg:text-3xl font-black">نظرات کاربران</h1>
          <p class="text-xs text-white/60 mt-1">
            ${reviews.length} نظر ثبت شده
            ${
              selectedProduct
                ? ` | محصول انتخاب شده: <span class="font-semibold">${selectedProduct.title}</span>`
                : ''
            }
          </p>
        </div>
        <div class="min-w-[180px]">
          <select
            class="input-style text-xs"
            onchange="state.adminReviewsSelectedProductId=this.value || null; render();"
          >
            <option value="">همه محصولات</option>
            ${productOptions
              .map(
                p => `
              <option value="${p.id}" ${selectedProductId === p.id ? 'selected' : ''}>
                ${p.title}
              </option>
            `
              )
              .join('')}
          </select>
        </div>
      </div>

      ${
        filteredReviews.length === 0
          ? `
        <div class="glass rounded-3xl p-12 text-center">
          <div class="text-5xl mb-4">📝</div>
          <h3 class="text-lg font-bold mb-2">نظری یافت نشد</h3>
          <p class="text-sm text-white/60">برای این فیلتر، نظری ثبت نشده است.</p>
        </div>
      `
          : `
        <div class="space-y-3">
          ${filteredReviews
            .map(r => {
              const status = r.status || 'pending';
              const name = r.user_name || r.name || 'کاربر';
              const rating = Number(r.rating || 0);
              const created = r.created_at || r.createdAt || '';

              return `
                <div class="glass rounded-2xl p-4 flex flex-col gap-2">
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">
                        ${name.trim()[0] || 'ک'}
                      </div>
                      <div>
                        <div class="text-sm font-semibold">${name}</div>
                        <div class="text-[11px] text-white/50">${utils.formatDateTime(created)}</div>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="text-amber-400 text-xs">
                        ${'★'.repeat(rating)}${'☆'.repeat(Math.max(0, 5 - rating))}
                      </div>
                      <select
                        class="bg-white/10 border border-white/20 rounded-xl px-2 py-1 text-[11px]"
                        onchange="
                          const next = this.value;
                          const id = '${r.id}';
                          const idx = state.reviews.findIndex(x => x.id === id);
                          if(idx !== -1){ state.reviews[idx].status = next; }
                          render();
                        "
                      >
                        <option value="pending" ${status === 'pending' ? 'selected' : ''}>در انتظار</option>
                        <option value="approved" ${status === 'approved' ? 'selected' : ''}>تایید شده</option>
                        <option value="rejected" ${status === 'rejected' ? 'selected' : ''}>رد شده</option>
                      </select>
                    </div>
                  </div>
                  <div class="text-sm text-white/80 whitespace-pre-wrap">
                    ${r.comment || r.text || ''}
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>
      `
      }
    </div>
  `;
}
