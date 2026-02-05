// ═══════════════════════════════════════════════════════════════
// ADMIN PANEL (GPT‑5 FINAL, WITH PER‑PRODUCT REVIEWS MANAGEMENT
// + NEW SUPPORT MESSENGER, URGENT TICKETS & QUICK REPLIES)
// File: assets/js/admin panel.js
// ═══════════════════════════════════════════════════════════════

/* ========== Global state bootstrapping ========== */

state.reviews = Array.isArray(state.reviews) ? state.reviews : [];
state.adminReviewsSelectedProductId = state.adminReviewsSelectedProductId || null;

// Support filters + selection + quick replies
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
      <!-- Sidebar -->
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
        ${state.adminTab === 'dashboard' ? renderAdminDashboard() : ''}
        ${state.adminTab === 'products' ? renderAdminProductsEditor() : ''}
        ${state.adminTab === 'orders' ? renderAdminOrdersSafe() : ''}
        ${state.adminTab === 'categories' ? renderAdminCategoriesEditor() : ''}
        ${state.adminTab === 'reviews' ? renderAdminReviews() : ''}
        ${state.adminTab === 'support' ? renderAdminSupportSafe() : ''}
      </main>

      <!-- Mobile Navigation -->
      <nav class="lg:hidden fixed bottom-0 left-0 right-0 glass-dark border-t border-white/5 px-4 py-3 z-50 safe-bottom">
        <div class="flex justify-around">
          ${tabs
            .map(
              tab => `
            <button 
              onclick="state.adminTab='${tab.id}'; render()"
              class="flex flex-col items-center py-2 px-5 rounded-xl transition-all ${
                state.adminTab === tab.id ? 'bg-violet-500/20 text-violet-400' : 'text-white/60'
              }" type="button"
            >
              <span class="relative text-xl mb-0.5">
                ${tab.icon}
                ${
                  tab.id === 'reviews' && pendingReviewsCount > 0
                    ? `<span class="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] px-1 py-0.5 rounded-full">
                        ${pendingReviewsCount}
                       </span>`
                    : ''
                }
              </span>
              <span class="text-[10px] font-medium">${tab.label}</span>
            </button>
          `
            )
            .join('')}
        </div>
      </nav>

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

/* ========== Orders: safe render (handles items array or JSON string) ========== */

function renderAdminOrdersSafe() {
  let filteredOrders = [...state.orders];
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

/* ========== Support: messenger-style, responsive, urgent + quick replies ========== */

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

/* Main support renderer (with scrollable ticket list + chat) */

function renderAdminSupportSafe() {
  const allTickets = Array.isArray(state.tickets) ? state.tickets : [];

  // Filters
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

  // Sort: urgent first, then newest
  filtered = [...filtered].sort((a, b) => {
    const pa = a.priority === 'urgent' ? 1 : 0;
    const pb = b.priority === 'urgent' ? 1 : 0;
    if (pa !== pb) return pb - pa;
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  // Selected ticket
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

      <!-- Filters -->
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
        <!-- Messenger layout -->
        <div class="glass rounded-2xl p-3 lg:p-4 flex flex-col lg:flex-row gap-3 min-h-[420px] lg:min-h-[480px]">

          <!-- Ticket list (scrollable) -->
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
                      onclick="state.adminSupportSelectedTicketId='${t.id}'; render()"
                      class="w-full text-right rounded-xl px-3 py-2 flex items-center gap-3 text-xs transition-all ${
                        isActive ? 'bg-violet-500/20 border border-violet-400' : 'glass hover:bg-white/5'
                      }"
                    >
                      <div class="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm flex-shrink-0">
                        ${initial}
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between gap-2 mb-0.5">
                          <span class="font-semibold line-clamp-1">${name}</span>
                          <span class="font-mono text-[10px] text-white/50">#${String(t.id || '').slice(-4)}</span>
                        </div>
                        <div class="text-[10px] text-white/60 line-clamp-1">${phone}</div>
                        <div class="flex items-center gap-1 mt-1">
                          <span class="badge ${t.status === 'open' ? 'badge-processing' : 'badge-delivered'}">
                            ${t.status === 'open' ? 'باز' : 'بسته'}
                          </span>
                          ${
                            priority === 'urgent'
                              ? `<span class="badge badge-canceled text-[10px]">فوری</span>`
                              : ''
                          }
                        </div>
                        ${
                          lastMsg
                            ? `<div class="text-[10px] text-white/40 mt-1 line-clamp-1">
                                 ${(lastMsg.from === 'user' ? 'کاربر: ' : 'پشتیبان: ') + lastMsg.text}
                               </div>`
                            : ''
                        }
                      </div>
                    </button>
                  `;
                    })
                    .join('')
            }
          </div>

          <!-- Chat area (scrollable messages) -->
          <div class="flex-1 glass rounded-2xl p-3 lg:p-4 flex flex-col min-h-[260px] lg:min-h-[360px]">
            ${
              !activeTicket
                ? `<div class="flex-1 flex items-center justify-center text-sm text-white/60">تیکتی انتخاب نشده است.</div>`
                : `
              <!-- Header -->
              <div class="flex items-center justify-between gap-3 border-b border-white/10 pb-3 mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm">
                    ${(activeTicket.user_name || 'کاربر')[0]}
                  </div>
                  <div>
                    <div class="font-semibold text-sm">${activeTicket.user_name || 'کاربر'}</div>
                    <div class="text-xs text-white/60 font-mono">${activeTicket.user_phone || '-'}</div>
                  </div>
                </div>
                <div class="flex flex-col items-end gap-1">
                  <div class="flex gap-1">
                    <span class="badge ${activeTicket.status === 'open' ? 'badge-processing' : 'badge-delivered'}">
                      ${activeTicket.status === 'open' ? 'باز' : 'بسته'}
                    </span>
                    ${
                      (activeTicket.priority || 'normal') === 'urgent'
                        ? `<span class="badge badge-canceled text-[10px]">فوری</span>`
                        : ''
                    }
                  </div>
                  <div class="flex gap-1">
                    <button
                      type="button"
                      class="btn-ghost text-xs px-2 py-1 rounded-lg"
                      onclick="updateTicketStatus(state.tickets.find(x=>x.id==='${activeTicket.id}'),'open')"
                    >
                      باز
                    </button>
                    <button
                      type="button"
                      class="btn-ghost text-xs px-2 py-1 rounded-lg"
                      onclick="closeTicket(state.tickets.find(x=>x.id==='${activeTicket.id}'))"
                    >
                      بستن
                    </button>
                    <button
                      type="button"
                      class="btn-ghost text-xs px-2 py-1 rounded-lg"
                      onclick="
                        const t = state.tickets.find(x=>x.id==='${activeTicket.id}');
                        if(t){ t.priority = (t.priority==='urgent'?'normal':'urgent'); if(window.AppState) AppState.set({tickets: state.tickets}); render(); }
                      "
                    >
                      ${(activeTicket.priority || 'normal') === 'urgent' ? 'عادی کردن' : 'علامت فوری'}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Messages (scrollable, desktop & mobile friendly) -->
              <div class="flex-1 overflow-y-auto max-h-[260px] lg:max-h-[55vh] space-y-2 pr-1">
                ${
                  activeMessages.length === 0
                    ? `<div class="text-xs text-white/60">پیامی ثبت نشده است.</div>`
                    : activeMessages
                        .map(m => {
                          const isUser = m.from === 'user';
                          const isAI = m.from === 'ai';
                          const side = isUser ? 'items-start' : 'items-end';
                          const bubble =
                            isUser
                              ? 'bg-white/10 text-white'
                              : isAI
                              ? 'bg-violet-500/20 text-violet-100'
                              : 'bg-emerald-500/20 text-emerald-100';
                          const label = isUser ? 'کاربر' : isAI ? 'AI' : 'پشتیبان';

                          return `
                          <div class="flex ${side}">
                            <div class="max-w-[85%] rounded-2xl px-3 py-2 text-xs ${bubble}">
                              <div class="font-bold mb-0.5">${label}</div>
                              <div class="whitespace-pre-line leading-relaxed">${m.text}</div>
                              <div class="text-[10px] text-white/40 mt-1">
                                ${utils && utils.formatDateTime ? utils.formatDateTime(m.at) : (m.at || '')}
                              </div>
                            </div>
                          </div>
                        `;
                        })
                        .join('')
                }
              </div>

              <!-- Quick replies + input -->
              <div class="mt-3 space-y-2">
                <div class="flex flex-wrap gap-2 max-h-16 overflow-y-auto">
                  ${
                    (state.supportQuickReplies || [])
                      .map(
                        q => `
                    <button
                      type="button"
                      class="px-3 py-1 rounded-xl text-[11px] glass hover:bg-white/10"
                      onclick="
                        const el = document.getElementById('admin-support-input-${activeTicket.id}');
                        if(el){ el.value = (el.value ? el.value + ' ' : '') + ${JSON.stringify(q.text)}; el.focus(); }
                      "
                    >
                      ${q.label}
                    </button>
                  `
                      )
                      .join('')
                  }
                </div>
                <form
                  class="flex gap-2"
                  onsubmit="
                    event.preventDefault();
                    const input = document.getElementById('admin-support-input-${activeTicket.id}');
                    const val = input ? input.value : '';
                    addTicketMessage(state.tickets.find(x=>x.id==='${activeTicket.id}'), { from:'admin', text: val }).then(ok=>{
                      if(ok && input){ input.value=''; }
                    });
                  "
                >
                  <input
                    id="admin-support-input-${activeTicket.id}"
                    class="flex-1 input-style text-sm"
                    placeholder="پاسخ پشتیبان..."
                    autocomplete="off"
                  >
                  <button class="btn-success px-4 rounded-xl text-sm" type="submit">ارسال</button>
                </form>
              </div>
            `
            }
          </div>
        </div>
      `
      }
    </div>
  `;
}

/* ========== Reviews Management: per-product view + auto sort ========== */

function renderAdminReviews() {
  const reviews = Array.isArray(state.reviews) ? state.reviews : [];

  const pendingAll = reviews.filter(r => r.status === 'pending');
  const approvedAll = reviews.filter(r => r.status === 'approved');

  const byProduct = {};
  reviews.forEach(r => {
    const pid = r.product_id || 'unknown';
    if (!byProduct[pid]) byProduct[pid] = [];
    byProduct[pid].push(r);
  });

  const productsWithReviews = Object.keys(byProduct).map(pid => {
    const list = byProduct[pid];
    const product = (state.products || []).find(p => p.id === pid) || {};
    const latest = list.reduce((max, r) => {
      const t = Number(r.created_at || 0);
      return t > max ? t : max;
    }, 0);
    const pendingCount = list.filter(r => r.status === 'pending').length;
    return {
      id: pid,
      title: product.title || `محصول ${pid}`,
      image: product.image || product.main_image || '',
      total: list.length,
      pending: pendingCount,
      latestAt: latest
    };
  });

  productsWithReviews.sort((a, b) => (b.latestAt || 0) - (a.latestAt || 0));

  if (!state.adminReviewsSelectedProductId && productsWithReviews.length > 0) {
    state.adminReviewsSelectedProductId = productsWithReviews[0].id;
  }

  const activeProductId = state.adminReviewsSelectedProductId;
  const activeReviews = activeProductId ? (byProduct[activeProductId] || []) : [];

  function buildTree(list) {
    const map = {};
    list.forEach(r => (map[r.id] = { ...r, children: [] }));
    const roots = [];

    list.forEach(r => {
      if (r.parent) {
        if (map[r.parent]) map[r.parent].children.push(map[r.id]);
      } else {
        roots.push(map[r.id]);
      }
    });

    return roots;
  }

  const tree = buildTree(activeReviews);

  function renderItem(r, depth = 0) {
    return `
      <div class="glass rounded-2xl p-4 mb-3 ml-${Math.min(depth, 4) * 4}">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
              ${(r.user_name || 'کاربر')[0]}
            </div>
            <div>
              <div class="text-sm font-semibold">${r.user_name || 'کاربر'}</div>
              <div class="text-[11px] text-white/40">
                ${utils && utils.formatDateTime ? utils.formatDateTime(r.created_at) : (r.created_at || '')}
              </div>
            </div>
          </div>

          <span class="badge ${r.status === 'pending' ? 'badge-processing' : 'badge-delivered'}">
            ${r.status === 'pending' ? 'در انتظار' : 'تأیید شده'}
          </span>
        </div>

        ${
          r.rating
            ? `<div class="flex items-center gap-1 mb-2 text-amber-400 text-xs">
                 ${utils && utils.renderStars ? utils.renderStars(r.rating, 'text-xs') : '⭐'.repeat(r.rating)}
                 <span class="text-white/60">(${r.rating})</span>
               </div>`
            : ''
        }

        <p class="text-sm text-white/80 mb-3 leading-relaxed">${r.text}</p>

        <div class="flex items-center gap-3 mb-3 text-xs text-white/50">
          <span>👍 ${r.likes || 0}</span>
          <span>👎 ${r.dislikes || 0}</span>
        </div>

        <div class="flex flex-wrap gap-2 mb-2">
          ${
            r.status === 'pending'
              ? `<button onclick="approveReview('${r.id}')" class="btn-success px-4 py-2 rounded-xl text-xs" type="button">تأیید</button>`
              : ''
          }
          <button onclick="deleteReview('${r.id}')" class="btn-danger px-4 py-2 rounded-xl text-xs" type="button">حذف</button>
          <button onclick="toggleReplyBox('${r.id}')" class="btn-ghost px-4 py-2 rounded-xl text-xs" type="button">پاسخ مدیر</button>
        </div>

        <form id="reply-box-${r.id}" class="hidden mt-3 space-y-2"
              onsubmit="adminReply(event, '${r.id}', '${r.product_id}')">
          <textarea name="text" class="input-style w-full text-sm" rows="2"
            placeholder="پاسخ مدیر..."></textarea>
          <div class="flex justify-end">
            <button class="btn-primary px-4 py-2 rounded-xl text-xs" type="submit">ارسال پاسخ</button>
          </div>
        </form>

        ${r.children.map(c => renderItem(c, depth + 1)).join('')}
      </div>
    `;
  }

  return `
    <div class="animate-fade">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl lg:text-3xl font-black">مدیریت نظرات محصولات</h1>
        <div class="flex flex-wrap gap-3 text-xs lg:text-sm">
          <span class="px-3 py-1 rounded-full bg-white/5 text-white/70">
            کل نظرات: ${reviews.length}
          </span>
          <span class="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300">
            در انتظار: ${pendingAll.length}
          </span>
          <span class="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300">
            تأیید شده: ${approvedAll.length}
          </span>
        </div>
      </div>

      ${
        productsWithReviews.length === 0
          ? `
        <div class="glass rounded-2xl p-10 text-center text-sm text-white/60">
          هنوز نظری ثبت نشده است.
        </div>
        `
          : `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- لیست محصولات -->
          <div class="glass rounded-2xl p-4 lg:col-span-1 max-h-[70vh] overflow-y-auto">
            <h2 class="font-bold mb-3 text-sm flex items-center gap-2">
              <span>📦</span><span>محصولات دارای نظر</span>
            </h2>
            <div class="space-y-2">
              ${productsWithReviews
                .map(p => `
                  <button
                    type="button"
                    onclick="state.adminReviewsSelectedProductId='${p.id}'; render();"
                    class="w-full text-right glass rounded-xl px-3 py-3 flex items-center gap-3 text-xs transition-all ${
                      activeProductId === p.id ? 'bg-violet-500/20 border border-violet-400' : 'hover:bg-white/5'
                    }"
                  >
                    <div class="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 flex items-center justify-center">
                      ${
                        p.image
                          ? `<img src="${p.image}" class="w-full h-full object-cover">`
                          : '📦'
                      }
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="font-semibold line-clamp-1">${p.title}</div>
                      <div class="text-[11px] text-white/50 mt-0.5">
                        ${p.total} نظر
                        ${
                          p.pending > 0
                            ? `<span class="ml-1 text-amber-300">(در انتظار: ${p.pending})</span>`
                            : ''
                        }
                      </div>
                    </div>
                  </button>
                `)
                .join('')}
            </div>
          </div>

          <!-- درخت نظرات محصول فعال -->
          <div class="glass rounded-2xl p-4 lg:col-span-2 max-h-[70vh] overflow-y-auto">
            ${
              !activeProductId
                ? `<div class="text-sm text-white/60">محصولی انتخاب نشده است.</div>`
                : tree.length === 0
                ? `<div class="text-sm text-white/60">برای این محصول نظری ثبت نشده است.</div>`
                : tree.map(r => renderItem(r, 0)).join('')
            }
          </div>
        </div>
        `
      }
    </div>
  `;
}

/* ========== Expose to window if needed ========== */

window.renderAdminPanel = renderAdminPanel;
window.renderAdminOrdersSafe = renderAdminOrdersSafe;
window.renderAdminCategoriesEditor = renderAdminCategoriesEditor;
window.renderAdminSupportSafe = renderAdminSupportSafe;
window.renderAdminReviews = renderAdminReviews;