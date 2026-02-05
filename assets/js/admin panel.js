// ═══════════════════════════════════════════════════════════════
// ADMIN PANEL (GPT‑5 FINAL)
// - Per‑product reviews management (safe, no render errors)
// - New support messenger (scrollable on mobile)
// - Categories modal CRUD
// - Products pro editor (from admin product.txt)
// - Orders safe renderer
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
state.tickets = Array.isArray(state.tickets) ? state.tickets : [];

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

/* ========== Minimal dashboard (to avoid render errors) ========== */

function renderAdminDashboard() {
  const productsCount = (state.products || []).length;
  const ordersCount = (state.orders || []).length;
  const reviewsCount = (state.reviews || []).length;

  return `
    <div class="animate-fade">
      <h1 class="text-2xl lg:text-3xl font-black mb-6">داشبورد</h1>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="glass rounded-2xl p-4">
          <p class="text-xs text-white/60 mb-1">محصولات</p>
          <p class="text-2xl font-black">${productsCount}</p>
        </div>
        <div class="glass rounded-2xl p-4">
          <p class="text-xs text-white/60 mb-1">سفارشات</p>
          <p class="text-2xl font-black">${ordersCount}</p>
        </div>
        <div class="glass rounded-2xl p-4">
          <p class="text-xs text-white/60 mb-1">نظرات</p>
          <p class="text-2xl font-black">${reviewsCount}</p>
        </div>
      </div>
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
    const cat = (state.categories || []).find(c => c.id === id);
    if (!cat) return;

    const selectedProducts = (state.products || []).filter(p => p.category === id).map(p => p.id);

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

  if (m.mode === 'add') {
    const id = utils.generateId();
    state.categories.push({ id, title });

    (state.products || []).forEach(p => {
      if (m.selectedProducts.includes(p.id)) {
        p.category = id;
      }
    });

    toast('دسته‌بندی اضافه شد', 'success');
  } else {
    const cat = state.categories.find(c => c.id === m.id);
    if (!cat) return;

    cat.title = title;

    (state.products || []).forEach(p => {
      if (p.category === m.id) p.category = '';
    });

    (state.products || []).forEach(p => {
      if (m.selectedProducts.includes(p.id)) {
        p.category = m.id;
      }
    });

    toast('دسته‌بندی بروزرسانی شد', 'success');
  }

  closeCategoryModal();
}

function deleteCategoryWithConfirm(id) {
  const cat = (state.categories || []).find(c => c.id === id);
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
      state.categories = (state.categories || []).filter(c => c.id !== id);
      (state.products || []).forEach(p => {
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

  const products = Array.isArray(state.products) ? state.products : [];
  const uncategorized = products.filter(p => !p.category || p.category === m.id);

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
  const categories = Array.isArray(state.categories) ? state.categories : [];
  return `
    <div class="animate-fade">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl lg:text-3xl font-black">مدیریت دسته‌بندی‌ها (${categories.length})</h1>
        <button class="btn-primary px-5 py-3 rounded-xl font-semibold text-sm" type="button" onclick="openCategoryModal('add')">
          افزودن دسته
        </button>
      </div>

      <div class="grid gap-3">
        ${categories
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
  const orders = Array.isArray(state.orders) ? state.orders : [];
  let filteredOrders = [...orders];
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

/* ========== Products: list + pro editor (from admin product.txt) ========== */

// فقط این نسخه از رندر لیست محصولات استفاده می‌شود
function renderAdminProductsEditor() {
  initProductDraft();
  if (state.editProduct) syncDraftFromEditing();

  const products = Array.isArray(state.products) ? state.products : [];

  return `
    <div class="animate-fade">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl lg:text-3xl font-black">محصولات (${products.length})</h1>
        <button 
          onclick="state.editProduct = {}; state.productDraft={title:'',category:'',price:0,stock:0,description:'',mainImage:'',gallery:[],original_price:0,_synced:null}; render()"
          class="btn-primary px-5 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold"
        >
          <span>+</span>
          <span>افزودن محصول</span>
        </button>
      </div>
      
      ${
        products.length > 0
          ? `
        <div class="grid gap-4">
          ${products
            .map((product, i) => {
              const imgSrc = product.image || product.main_image || '';
              const hasImage = !!imgSrc;
              const price = Number(product.price || 0);
              const original = Number(product.original_price || 0);
              const hasDiscount = original > price && price > 0;
              const discountPercent = hasDiscount
                ? Math.round(((original - price) / original) * 100)
                : 0;

              return `
              <div class="glass rounded-2xl p-5 flex items-center gap-4 animate-fade" style="animation-delay: ${i *
                0.05}s">
                <div class="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                  ${
                    hasImage
                      ? `<img src="${imgSrc}" alt="${product.title}" class="w-full h-full object-cover">`
                      : `<span class="text-3xl">📦</span>`
                  }
                </div>
                
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold truncate">${product.title}</h3>
                  <p class="text-white/60 text-sm">
                    ${(state.categories || []).find(c => c.id === product.category)?.title || 'بدون دسته'}
                  </p>
                </div>
                
                <div class="text-left hidden sm:block">
                  ${
                    hasDiscount
                      ? `
                        <div class="flex items-center gap-2">
                          <span class="text-emerald-400 font-bold">${utils.formatPrice(price)}</span>
                          <span class="price-original text-xs">${utils.formatPrice(original)}</span>
                        </div>
                        <div class="mt-1">
                          <span class="badge badge-discount text-[10px]">${discountPercent}% تخفیف</span>
                        </div>
                      `
                      : `<p class="text-emerald-400 font-bold">${utils.formatPrice(price)}</p>`
                  }
                  <p class="text-xs text-white/60 mt-1">موجودی: ${product.stock || 0}</p>
                </div>
                
                <div class="flex gap-2">
                  <button 
                    onclick="state.editProduct = (state.products || []).find(p => p.id === '${product.id}'); render()"
                    class="p-3 glass rounded-xl hover:bg-white/10 transition-all"
                    aria-label="ویرایش"
                  >
                    ✏️
                  </button>
                  <button 
                    onclick="
                      state.editProduct = null;
                      state.confirmModal = { 
                        type: 'delete-product', 
                        title: 'حذف محصول', 
                        message: 'آیا از حذف «${product.title}» مطمئن هستید؟', 
                        icon: '🗑️', 
                        confirmText: 'حذف', 
                        confirmClass: 'btn-danger', 
                        onConfirm: () => { 
                          deleteProduct('${product.id}');
                          state.confirmModal = null;
                          render();
                        } 
                      }; 
                      render();
                    "
                    class="p-3 glass rounded-xl hover:bg-rose-500/20 text-rose-400 transition-all"
                    aria-label="حذف"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            `;
            })
            .join('')}
        </div>
      `
          : `
        <div class="glass rounded-3xl p-16 text-center">
          <div class="text-7xl mb-6 animate-float">📦</div>
          <h3 class="text-2xl font-bold mb-4">محصولی ثبت نشده است</h3>
          <p class="text-white/60 mb-6">اولین محصول خود را اضافه کنید</p>
          <button 
            onclick="state.editProduct = {}; state.productDraft={title:'',category:'',price:0,stock:0,description:'',mainImage:'',gallery:[],original_price:0,_synced:null}; render()"
            class="btn-primary px-8 py-4 rounded-xl font-bold"
          >
            افزودن محصول
          </button>
        </div>
      `
      }

      ${state.editProduct ? renderProductModal() : ''}
    </div>
  `;
}

/* ========== Products: pro editor helpers ========== */

function initProductDraft() {
  if (!state.productDraft) {
    state.productDraft = {
      title: '',
      category: '',
      price: 0,
      stock: 0,
      description: '',
      mainImage: '',
      gallery: [],
      original_price: 0,
      _synced: null
    };
  }
}

function syncDraftFromEditing() {
  const p = state.editProduct;
  if (!p) return;
  const d = state.productDraft;
  if (d._synced === p.id) return;
  d.title = p.title || '';
  d.category = p.category || '';
  d.price = Number(p.price || 0);
  d.stock = Number(p.stock || 0);
  d.description = p.description || '';
  d.mainImage = p.main_image || p.image || '';
  d.gallery = Array.isArray(p.images) ? [...p.images] : [];
  d.original_price = Number(p.original_price || 0);
  d._synced = p.id;
}

function readImageFile(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

async function handleMainImageFiles(files) {
  const file = files[0];
  if (!file) return;
  const dataUrl = await readImageFile(file);
  state.productDraft.mainImage = dataUrl;
  toast('تصویر اصلی تنظیم شد', 'success');
  render();
}

async function handleGalleryFiles(files) {
  const allowed = Math.max(0, 10 - state.productDraft.gallery.length);
  const list = [...files].slice(0, allowed);
  for (const f of list) {
    const dataUrl = await readImageFile(f);
    state.productDraft.gallery.push(dataUrl);
  }
  if (list.length) toast(`${list.length} تصویر به گالری اضافه شد`, 'success');
  render();
}

function removeGalleryItem(i) {
  state.productDraft.gallery.splice(i, 1);
  render();
}

function moveGalleryItem(i, dir) {
  const g = state.productDraft.gallery;
  const ni = i + dir;
  if (ni < 0 || ni >= g.length) return;
  const [item] = g.splice(i, 1);
  g.splice(ni, 0, item);
  render();
}

function onMainImageChange(e) {
  const file = e.target.files?.[0];
  if (file) handleMainImageFiles([file]);
}

function clearProductDraft() {
  state.productDraft = {
    title: '',
    category: '',
    price: 0,
    stock: 0,
    description: '',
    mainImage: '',
    gallery: [],
    original_price: 0,
    _synced: null
  };
  state.editProduct = null;
  render();
}

function validateProductForm(formEl) {
  const title = (formEl.title.value || '').trim();
  const price = Number(formEl.price.value || 0);
  const stock = Number(formEl.stock.value || 0);

  const errors = [];
  if (!title) errors.push('نام محصول الزامی است.');
  if (price < 0) errors.push('قیمت نمی‌تواند منفی باشد.');
  if (stock < 0) errors.push('موجودی نمی‌تواند منفی باشد.');

  return { ok: errors.length === 0, errors };
}

function submitProductForm(formEl) {
  event.preventDefault();
  initProductDraft();
  const { ok, errors } = validateProductForm(formEl);
  if (!ok) {
    toast(errors[0], 'warning');
    return;
  }

  const price = Number(formEl.price.value || 0);
  const original_price = Number(formEl.original_price.value || 0);

  const payload = {
    title: formEl.title.value.trim(),
    category: formEl.category.value || '',
    price,
    stock: Number(formEl.stock.value || 0),
    description: formEl.description.value || '',
    main_image: state.productDraft.mainImage,
    image: state.productDraft.mainImage,
    images: state.productDraft.gallery.filter(Boolean),
    original_price: original_price > 0 ? original_price : 0
  };

  if (state.editProduct && state.editProduct.id) {
    const updated = updateProduct(state.editProduct.id, payload);
    if (updated) toast('تغییرات محصول ذخیره شد ✨', 'success');
    clearProductDraft();
  } else {
    const created = createProduct(payload);
    if (created) toast('محصول ذخیره شد ✅', 'success');
    clearProductDraft();
  }
}

/* PRODUCT MODAL */

function renderProductModal() {
  const isEdit = state.editProduct && state.editProduct.id;
  const product = state.editProduct || {};

  initProductDraft();
  if (state.editProduct) syncDraftFromEditing();

  const d = state.productDraft;
  const price = d.price || product.price || 0;
  const original = d.original_price || product.original_price || 0;
  const hasDiscount = original > price && price > 0;
  const discountPercent = hasDiscount ? Math.round(((original - price) / original) * 100) : 0;

  return `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay">
      <div class="glass-strong rounded-3xl p-6 lg:p-8 max-w-lg w-full max-h-[90%] overflow-y-auto animate-scale">
        <h2 class="text-xl font-black mb-6">
          ${isEdit ? '✏️ ویرایش محصول' : '➕ محصول جدید'}
        </h2>
        
        <form onsubmit="
          event.preventDefault();
          submitProductForm(this);
        ">
          
          <div class="space-y-5">
            <div>
              <label for="product-title" class="block text-sm text-white/70 mb-2">عنوان محصول *</label>
              <input 
                type="text" 
                id="product-title" 
                name="title" 
                required 
                value="${product.title || d.title || ''}"
                class="w-full input-style"
                placeholder="نام محصول را وارد کنید"
              >
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="product-price" class="block text-sm text-white/70 mb-2">قیمت (تومان) *</label>
                <input 
                  type="number" 
                  id="product-price" 
                  name="price" 
                  required 
                  value="${price || ''}"
                  class="w-full input-style"
                  dir="ltr"
                  placeholder="0"
                >
              </div>
              <div>
                <label for="product-original-price" class="block text-sm text-white/70 mb-2">قیمت اصلی (برای تخفیف)</label>
                <input 
                  type="number" 
                  id="product-original-price" 
                  name="original_price" 
                  value="${original || ''}"
                  class="w-full input-style"
                  dir="ltr"
                  placeholder="مثال: قیمت قبل از تخفیف"
                >
                ${
                  hasDiscount
                    ? `<p class="text-xs text-emerald-400 mt-1">${discountPercent}% تخفیف روی این محصول اعمال شده است</p>`
                    : `<p class="text-xs text-white/40 mt-1">در صورت وارد کردن قیمت اصلی بالاتر از قیمت فعلی، تخفیف محاسبه می‌شود.</p>`
                }
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="product-stock" class="block text-sm text-white/70 mb-2">موجودی *</label>
                <input 
                  type="number" 
                  id="product-stock" 
                  name="stock" 
                  required 
                  value="${product.stock || d.stock || ''}"
                  class="w-full input-style"
                  dir="ltr"
                  placeholder="0"
                >
              </div>
              <div>
                <label for="product-category" class="block text-sm text-white/70 mb-2">دسته‌بندی</label>
                <select 
                  id="product-category" 
                  name="category" 
                  class="w-full input-style"
                >
                  <option value="">بدون دسته</option>
                  ${(state.categories || [])
                    .map(
                      cat => `
                    <option value="${cat.id}" ${(product.category || d.category) === cat.id ? 'selected' : ''}>
                      ${cat.icon || ''} ${cat.title}
                    </option>
                  `
                    )
                    .join('')}
                </select>
              </div>
            </div>

            <!-- تصویر اصلی -->
            <div>
              <label class="block text-sm text-white/70 mb-2">تصویر اصلی محصول</label>
              <div 
                id="main-dropzone"
                class="glass rounded-2xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer border border-dashed border-white/20 hover:border-violet-400 transition"
                onclick="document.getElementById('main-image-input')?.click()"
              >
                ${
                  d.mainImage
                    ? `
                      <div class="w-full max-h-56 rounded-xl overflow-hidden mb-3">
                        <img src="${d.mainImage}" class="w-full h-full object-cover" alt="تصویر اصلی">
                      </div>
                      <div class="flex gap-2">
                        <button 
                          type="button" 
                          class="btn-ghost px-4 py-2 rounded-xl text-sm"
                          onclick="event.stopPropagation(); state.productDraft.mainImage=''; render();"
                        >
                          حذف تصویر
                        </button>
                        <button 
                          type="button" 
                          class="btn-primary px-4 py-2 rounded-xl text-sm"
                          onclick="event.stopPropagation(); document.getElementById('main-image-input')?.click()"
                        >
                          تغییر تصویر
                        </button>
                      </div>
                    `
                    : `
                      <div class="text-4xl">📷</div>
                      <p class="text-sm text-white/70 text-center">برای انتخاب تصویر اصلی کلیک کنید یا فایل را اینجا رها کنید</p>
                    `
                }
                <input 
                  id="main-image-input"
                  type="file" 
                  accept="image/*" 
                  class="hidden"
                  onchange="onMainImageChange(event)"
                >
              </div>
            </div>

            <!-- گالری تصاویر -->
            <div>
              <label class="block text-sm text-white/70 mb-2">گالری تصاویر</label>
              
              <div class="flex gap-3 overflow-x-auto pb-2">
                ${
                  (d.gallery || []).length === 0
                    ? `<p class="text-white/40 text-sm">هنوز تصویری در گالری ثبت نشده است.</p>`
                    : d.gallery
                        .map(
                          (img, i) => `
                        <div class="glass rounded-xl p-2 flex-shrink-0 w-32">
                          <div class="w-full h-24 rounded-lg overflow-hidden mb-2">
                            <img src="${img}" class="w-full h-full object-cover" alt="گالری">
                          </div>
                          <div class="flex items-center justify-between gap-1">
                            <button 
                              type="button" 
                              class="btn-ghost px-2 py-1 rounded-lg text-[10px]"
                              onclick="removeGalleryItem(${i})"
                            >
                              حذف
                            </button>
                            <div class="flex gap-1">
                              <button 
                                type="button" 
                                class="btn-ghost px-2 py-1 rounded-lg text-[10px]"
                                onclick="moveGalleryItem(${i}, -1)"
                              >
                                ◀
                              </button>
                              <button 
                                type="button" 
                                class="btn-ghost px-2 py-1 rounded-lg text-[10px]"
                                onclick="moveGalleryItem(${i}, 1)"
                              >
                                ▶
                              </button>
                            </div>
                          </div>
                        </div>
                      `
                        )
                        .join('')
                }
              </div>

              <div 
                id="gallery-dropzone"
                class="glass rounded-2xl p-4 mt-3 flex flex-col items-center justify-center gap-3 cursor-pointer border border-dashed border-white/20 hover:border-violet-400 transition"
                onclick="document.getElementById('gallery-image-input')?.click()"
              >
                <div class="text-3xl">🖼️</div>
                <p class="text-sm text-white/70 text-center">برای افزودن تصاویر به گالری کلیک کنید یا فایل‌ها را اینجا رها کنید (حداکثر ۱۰ تصویر)</p>
                <input 
                  id="gallery-image-input"
                  type="file" 
                  accept="image/*" 
                  multiple
                  class="hidden"
                  onchange="handleGalleryFiles(this.files)"
                >
              </div>
            </div>
            
            <div>
              <label for="product-description" class="block text-sm text-white/70 mb-2">توضیحات</label>
              <textarea 
                id="product-description" 
                name="description" 
                rows="3" 
                class="w-full input-style resize-none"
                placeholder="توضیحات محصول..."
              >${product.description || d.description || ''}</textarea>
            </div>
          </div>
          
          <div class="flex gap-4 mt-8">
            ${
              isEdit
                ? `
                  <button 
                    type="button" 
                    class="flex-1 btn-danger py-4 rounded-xl font-semibold"
                    onclick="
                      state.confirmModal = {
                        type: 'delete-product',
                        title: 'حذف محصول',
                        message: 'آیا از حذف «${product.title}» مطمئن هستید؟',
                        icon: '🗑️',
                        confirmText: 'حذف',
                        confirmClass: 'btn-danger',
                        onConfirm: () => {
                          deleteProduct('${product.id}');
                          state.confirmModal = null;
                          state.editProduct = null;
                          render();
                        }
                      };
                      render();
                    "
                  >
                    حذف محصول
                  </button>
                `
                : ''
            }
            <button 
              type="button" 
              onclick="clearProductDraft()"
              class="flex-1 btn-ghost py-4 rounded-xl font-semibold"
            >
              انصراف
            </button>
            <button 
              type="submit" 
              class="flex-1 btn-primary py-4 rounded-xl font-semibold"
              ${state.loading ? 'disabled' : ''}
            >
              ${state.loading ? '⏳' : isEdit ? 'بروزرسانی' : 'ذخیره'}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

/* ========== Reviews: per-product management (safe) ========== */

function setReviewStatus(reviewId, status) {
  const list = Array.isArray(state.reviews) ? state.reviews : [];
  const r = list.find(x => x.id === reviewId);
  if (!r) return;
  r.status = status;
  if (window.AppState) AppState.set({ reviews: list });
  render();
}

function renderAdminReviews() {
  const reviews = Array.isArray(state.reviews) ? state.reviews : [];
  const products = Array.isArray(state.products) ? state.products : [];

  // گروه‌بندی بر اساس محصول
  const byProduct = {};
  reviews.forEach(r => {
    const pid = r.product_id || r.productId || 'unknown';
    if (!byProduct[pid]) byProduct[pid] = [];
    byProduct[pid].push(r);
  });

  // اگر محصول انتخاب نشده، اولین محصول دارای نظر را انتخاب کن
  if (!state.adminReviewsSelectedProductId) {
    const firstPid = Object.keys(byProduct)[0] || null;
    state.adminReviewsSelectedProductId = firstPid;
  }

  const activePid = state.adminReviewsSelectedProductId;
  const activeReviews = activePid ? byProduct[activePid] || [] : [];

  return `
    <div class="animate-fade">
      <h1 class="text-2xl lg:text-3xl font-black mb-6">مدیریت نظرات 📝</h1>

      <div class="grid lg:grid-cols-[260px,1fr] gap-4">
        <!-- لیست محصولات با نظر -->
        <div class="glass rounded-2xl p-3 max-h-[60vh] overflow-y-auto">
          <h2 class="text-sm font-bold mb-3 flex items-center justify-between">
            <span>محصولات</span>
            <span class="text-xs text-white/50">${Object.keys(byProduct).length} مورد</span>
          </h2>
          ${
            Object.keys(byProduct).length === 0
              ? `<p class="text-xs text-white/60">هنوز نظری ثبت نشده است.</p>`
              : Object.keys(byProduct)
                  .map(pid => {
                    const product = products.find(p => p.id === pid);
                    const title = product?.title || `محصول #${pid.slice(-6)}`;
                    const pendingCount = (byProduct[pid] || []).filter(r => r.status === 'pending').length;
                    const isActive = pid === activePid;
                    return `
                    <button
                      type="button"
                      onclick="state.adminReviewsSelectedProductId='${pid}'; render()"
                      class="w-full text-right px-3 py-2 rounded-xl mb-1 flex items-center justify-between text-xs ${
                        isActive ? 'bg-violet-500/20 text-violet-200' : 'glass'
                      }"
                    >
                      <span class="line-clamp-1">${title}</span>
                      ${
                        pendingCount > 0
                          ? `<span class="bg-rose-500 text-[10px] px-1.5 py-0.5 rounded-full">${pendingCount}</span>`
                          : ''
                      }
                    </button>
                  `;
                  })
                  .join('')
          }
        </div>

        <!-- لیست نظرات محصول انتخاب شده -->
        <div class="glass rounded-2xl p-4 flex flex-col max-h-[70vh] overflow-y-auto">
          ${
            !activePid
              ? `<p class="text-sm text-white/60">محصولی برای نمایش انتخاب نشده است.</p>`
              : activeReviews.length === 0
              ? `<p class="text-sm text-white/60">برای این محصول نظری ثبت نشده است.</p>`
              : activeReviews
                  .map(r => {
                    const status = r.status || 'pending';
                    const isPending = status === 'pending';
                    const created = utils.formatDateTime(r.created_at || r.createdAt || '');
                    const name = r.user_name || r.userName || 'کاربر';
                    const rating = Number(r.rating || 0);

                    return `
                    <div class="glass rounded-xl p-3 mb-3 text-xs">
                      <div class="flex items-center justify-between mb-1.5">
                        <div class="font-semibold">${name}</div>
                        <div class="flex items-center gap-1">
                          ${
                            rating > 0
                              ? `<span class="text-amber-400">${'★'.repeat(rating)}</span>`
                              : ''
                          }
                          <span class="text-white/40">${created}</span>
                        </div>
                      </div>
                      <p class="text-white/80 mb-2 whitespace-pre-line">${r.text || r.comment || ''}</p>
                      <div class="flex items-center justify-between">
                        <span class="text-[10px] ${
                          isPending
                            ? 'text-amber-400'
                            : status === 'approved'
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }">
                          ${
                            isPending
                              ? 'در انتظار بررسی'
                              : status === 'approved'
                              ? 'تایید شده'
                              : 'رد شده'
                          }
                        </span>
                        <div class="flex gap-1">
                          <button
                            type="button"
                            class="btn-ghost px-2 py-1 rounded-lg text-[10px]"
                            onclick="setReviewStatus('${r.id}', 'approved')"
                          >
                            تایید
                          </button>
                          <button
                            type="button"
                            class="btn-ghost px-2 py-1 rounded-lg text-[10px]"
                            onclick="setReviewStatus('${r.id}', 'rejected')"
                          >
                            رد
                          </button>
                        </div>
                      </div>
                    </div>
                  `;
                  })
                  .join('')
          }
        </div>
      </div>
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
  state.supportQuickReplies = (state.supportQuickReplies || []).filter(q => q.id !== id);
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

/* Main support renderer (with scrollable ticket list + chat, mobile-friendly) */

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
        <div class="glass rounded-2xl p-3 lg:p-4 flex flex-col lg:flex-row gap-3 min-h-[420px] lg:min-h-[480px] max-h-[80vh]">

          <!-- Ticket list (scrollable, mobile-safe) -->
          <div class="w-full lg:w-80 lg:max-w-xs flex-shrink-0 flex flex-col gap-2 max-h-[220px] lg:max-h-[70vh] overflow-y-auto pr-1">
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
                          class="glass rounded-xl px-3 py-2 text-right text-xs flex items-center gap-2 ${
                            isActive ? 'border border-violet-500/60 bg-violet-500/10' : ''
                          }"
                        >
                          <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm flex-shrink-0">
                            ${initial}
                          </div>
                          <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between gap-1 mb-0.5">
                              <span class="font-semibold line-clamp-1">${name}</span>
                              ${
                                priority === 'urgent'
                                  ? `<span class="text-[10px] text-rose-400">فوری</span>`
                                  : ''
                              }
                            </div>
                            <div class="text-[10px] text-white/60 line-clamp-1">
                              ${lastMsg ? lastMsg.text : phone}
                            </div>
                          </div>
                        </button>
                      `;
                    })
                    .join('')
            }
          </div>

          <!-- Chat area (scrollable bottom section on mobile) -->
          <div class="flex-1 flex flex-col gap-2 max-h-[70vh]">
            ${
              !activeTicket
                ? `<div class="flex-1 flex items-center justify-center text-sm text-white/60">تیکتی انتخاب نشده است.</div>`
                : `
              <div class="glass rounded-xl p-3 flex items-center justify-between text-xs">
                <div>
                  <div class="font-semibold">${activeTicket.user_name || 'کاربر'}</div>
                  <div class="text-white/60">${activeTicket.user_phone || '-'}</div>
                </div>
                <div class="flex gap-1">
                  <button
                    type="button"
                    class="btn-ghost px-2 py-1 rounded-lg text-[10px]"
                    onclick="updateTicketStatus(state.tickets.find(t=>t.id==='${activeTicket.id}'),'open')"
                  >
                    باز
                  </button>
                  <button
                    type="button"
                    class="btn-ghost px-2 py-1 rounded-lg text-[10px]"
                    onclick="closeTicket(state.tickets.find(t=>t.id==='${activeTicket.id}'))"
                  >
                    بستن
                  </button>
                </div>
              </div>

              <!-- messages (scrollable) -->
              <div class="flex-1 glass rounded-xl p-3 overflow-y-auto">
                ${
                  activeMessages.length === 0
                    ? `<p class="text-xs text-white/60">پیامی ثبت نشده است.</p>`
                    : activeMessages
                        .map(m => {
                          const isAdmin = m.from === 'admin';
                          return `
                            <div class="mb-2 flex ${isAdmin ? 'justify-start' : 'justify-end'}">
                              <div class="max-w-[80%] rounded-2xl px-3 py-2 text-xs ${
                                isAdmin ? 'bg-violet-500/30' : 'bg-white/10'
                              }">
                                <div class="mb-0.5 text-[10px] text-white/60">
                                  ${utils.formatDateTime(m.at || '')}
                                </div>
                                <div class="whitespace-pre-line">${m.text}</div>
                              </div>
                            </div>
                          `;
                        })
                        .join('')
                }
              </div>

              <!-- input (bottom, stays visible, mobile scroll-safe) -->
              <form
                class="mt-2 flex items-center gap-2"
                onsubmit="
                  event.preventDefault();
                  const t = (state.tickets || []).find(x => x.id === '${activeTicket.id}');
                  const text = this.message.value;
                  addTicketMessage(t, { from: 'admin', text });
                  this.message.value='';
                "
              >
                <textarea
                  name="message"
                  rows="1"
                  class="flex-1 input-style resize-none text-xs max-h-24"
                  placeholder="نوشتن پاسخ..."
                ></textarea>
                <button
                  type="submit"
                  class="btn-primary px-3 py-2 rounded-xl text-xs flex items-center gap-1"
                >
                  <span>ارسال</span>
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
