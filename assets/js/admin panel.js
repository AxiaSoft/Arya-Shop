// ═══════════════════════════════════════════════════════════════
// ADMIN PANEL
// ═══════════════════════════════════════════════════════════════

function renderAdminPanel() {
  const tabs = [
    { id: 'dashboard', icon: '📊', label: 'داشبورد' },
    { id: 'products', icon: '📦', label: 'محصولات' },
    { id: 'orders', icon: '🛒', label: 'سفارشات' },
    { id: 'categories', icon: '🗂️', label: 'دسته‌بندی‌ها' },
    { id: 'support', icon: '💬', label: 'پشتیبانی' }
  ];

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
          ${tabs.map(tab => `
            <button 
              onclick="state.adminTab='${tab.id}'; render()"
              class="sidebar-item w-full text-right px-5 py-4 flex items-center gap-4 text-sm ${state.adminTab === tab.id ? 'active' : ''}" type="button"
            >
              <span class="text-xl">${tab.icon}</span>
              <span class="font-medium">${tab.label}</span>
            </button>
          `).join('')}
        </nav>
        <div class="p-4 border-t border-white/5 space-y-2">
          <button onclick="goTo('home')" class="w-full btn-ghost py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium" type="button">🏠 مشاهده سایت</button>
          <button onclick="logout()" class="w-full bg-rose-500/10 text-rose-400 py-3 rounded-xl hover:bg-rose-500/20 flex items-center justify-center gap-2 text-sm font-medium transition-all" type="button">🚪 خروج</button>
        </div>
      </aside>

      <!-- Mobile Header -->
      <header class="lg:hidden glass-dark border-b border-white/5 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3"><span class="text-2xl">⚙️</span><h1 class="font-bold">پنل مدیریت</h1></div>
          <div class="flex gap-2">
            <button onclick="goTo('home')" class="p-2 glass rounded-xl text-sm" type="button">🏠</button>
            <button onclick="logout()" class="p-2 glass rounded-xl text-rose-400 text-sm" type="button">🚪</button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 p-4 lg:p-8 overflow-auto pb-24 lg:pb-8 mr-72">
        ${state.adminTab === 'dashboard' ? renderAdminDashboard() : ''}
        ${state.adminTab === 'products' ? renderAdminProductsEditor() : ''}
        ${state.adminTab === 'orders' ? renderAdminOrdersSafe() : ''}
        ${state.adminTab === 'categories' ? renderAdminCategoriesEditor() : ''}
        ${state.adminTab === 'support' ? renderAdminSupportSafe() : ''}
      </main>

      <!-- Mobile Navigation -->
      <nav class="lg:hidden fixed bottom-0 left-0 right-0 glass-dark border-t border-white/5 px-4 py-3 z-50 safe-bottom">
        <div class="flex justify-around">
          ${tabs.map(tab => `
            <button 
              onclick="state.adminTab='${tab.id}'; render()"
              class="flex flex-col items-center py-2 px-5 rounded-xl transition-all ${state.adminTab === tab.id ? 'bg-violet-500/20 text-violet-400' : 'text-white/60'}" type="button"
            >
              <span class="text-xl mb-0.5">${tab.icon}</span>
              <span class="text-[10px] font-medium">${tab.label}</span>
            </button>
          `).join('')}
        </div>
      </nav>

      ${renderCategoryModal()}
    </div>
  `;
}

// Helper wrapper to align legacy select to new API
function updateOrderStatus(order, nextStatus) {
  if (!order || !order.id) return;
  updateOrder(order.id, { status: nextStatus });
}

/* ========== Categories: modal-based CRUD + product assignment ========== */

// init state
state.categoryModal = state.categoryModal || null;

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

    const selectedProducts = state.products
      .filter(p => p.category === id)
      .map(p => p.id);

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

  // 🔹 اول مودال دسته‌بندی را ببند تا از حالت ویرایش خارج شود
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
      // 🔹 بعد از انجام حذف، خود confirm هم بسته شود
      state.confirmModal = null;
      render();
    }
  };
  render();
}

// 🔹 مودال دسته‌بندی در استایل دقیق مودال محصول
function renderCategoryModal() {
  const m = state.categoryModal;
  if (!m) return '';

  const uncategorized = state.products.filter(
    p => !p.category || p.category === m.id
  );

  return `
    <div class="fixed inset-0 z-[200] flex items-center justify-center p-4 modal-overlay">
      <div class="glass-strong rounded-3xl p-6 lg:p-8 max-w-lg w-full max-h-[90%] overflow-y-auto animate-scale">

        <h2 class="text-xl font-black mb-6">
          ${m.mode === 'add' ? '➕ دسته‌بندی جدید' : '✏️ ویرایش دسته‌بندی'}
        </h2>

        <div class="space-y-5">

          <!-- نام دسته -->
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

          <!-- محصولات بدون دسته -->
          <div>
            <label class="block text-sm text-white/70 mb-2">محصولات بدون دسته</label>
            <div class="flex gap-3 overflow-x-auto pb-2">
              ${
                uncategorized.length === 0
                  ? `<p class="text-white/40 text-sm">محصول بدون دسته وجود ندارد</p>`
                  : uncategorized.map(p => `
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
                  `).join('')
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
        ${(state.categories || []).map((c, i) => `
          <div class="glass rounded-xl p-4 flex items-center justify-between animate-fade" style="animation-delay:${i*0.05}s">
            <div>
              <div class="font-semibold">${c.title}</div>
              <div class="text-xs text-white/40">${c.id}</div>
            </div>
            <div class="flex gap-2">
              <button class="p-2 glass rounded-xl" type="button" onclick="openCategoryModal('edit', '${c.id}')">✏️</button>
              <button class="p-2 glass rounded-xl text-rose-400 hover:bg-rose-500/20" type="button" onclick="deleteCategoryWithConfirm('${c.id}')">🗑️</button>
            </div>
          </div>
        `).join('')}
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
          <button onclick="state.orderFilter.status = ''; render()" class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${!state.orderFilter.status ? 'bg-violet-500 text-white' : 'glass hover:bg-white/10'}">همه</button>
          ${
            [
              { value: 'pending', label: '⏳ در انتظار', color: 'bg-amber-500' },
              { value: 'processing', label: '⚙️ پردازش', color: 'bg-blue-500' },
              { value: 'shipped', label: '🚚 ارسال شده', color: 'bg-cyan-500' },
              { value: 'delivered', label: '✅ تحویل', color: 'bg-emerald-500' }
            ].map(opt => `
              <button onclick="state.orderFilter.status = '${opt.value}'; render()" class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${state.orderFilter.status === opt.value ? opt.color + ' text-white' : 'glass hover:bg-white/10'}">${opt.label}</button>
            `).join('')
          }
        </div>
      </div>

      ${
        filteredOrders.length > 0 ? `
          <div class="space-y-4">
            ${filteredOrders.map((order, i) => {
              let items = [];
              if (Array.isArray(order.items)) {
                items = order.items;
              } else {
                try { items = JSON.parse(order.items || '[]'); } catch { items = []; }
              }

              return `
                <div class="glass rounded-2xl p-6 animate-fade" style="animation-delay:${i*0.05}s">
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
                      <p class="text-xl font-black text-emerald-400">${utils.formatPrice(order.total || (order.subtotal || 0) + (order.shipping || 0))}</p>
                      <p class="text-xs text-white/60">${items.length} کالا</p>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div class="glass rounded-3xl p-16 text-center">
            <div class="text-7xl mb-6">🛒</div>
            <h3 class="text-2xl font-bold">سفارشی یافت نشد</h3>
          </div>
        `
      }
    </div>
  `;
}

/* ========== Support: safe JSON parsing ========== */
function renderAdminSupportSafe() {
  const filtered = state.supportFilter.status ? state.tickets.filter(t => t.status === state.supportFilter.status) : state.tickets;

  return `
    <div class="animate-fade">
      <h1 class="text-2xl lg:text-3xl font-black mb-6">پشتیبانی (${filtered.length})</h1>
      <div class="glass rounded-2xl p-4 mb-6 flex gap-2">
        <button class="px-4 py-2 rounded-xl ${!state.supportFilter.status ? 'bg-violet-500 text-white' : 'glass'}" onclick="state.supportFilter.status=''; render()" type="button">همه</button>
        <button class="px-4 py-2 rounded-xl ${state.supportFilter.status==='open' ? 'bg-emerald-500 text-white' : 'glass'}" onclick="state.supportFilter.status='open'; render()" type="button">باز</button>
        <button class="px-4 py-2 rounded-xl ${state.supportFilter.status==='closed' ? 'bg-rose-500 text-white' : 'glass'}" onclick="state.supportFilter.status='closed'; render()" type="button">بسته</button>
      </div>

      <div class="space-y-4">
        ${filtered.map((t,i)=> {
          let msgs = [];
          try { msgs = JSON.parse(t.messages || '[]'); } catch { msgs = []; }
          return `
            <div class="glass rounded-2xl p-5 animate-fade" style="animation-delay:${i*0.05}s">
              <div class="flex items-center justify-between mb-3">
                <div>
                  <div class="font-mono text-xs">#${(t.id||'').slice(-8)}</div>
                  <div class="text-sm text-white/70">${t.user_name || '-'} - ${t.user_phone || '-'}</div>
                </div>
                <span class="badge ${t.status==='open'?'badge-processing':'badge-delivered'}">${t.status==='open'?'باز':'بسته'}</span>
              </div>
              <div class="text-sm font-semibold mb-2">${t.subject || 'بدون عنوان'}</div>
              <div class="space-y-2 max-h-44 overflow-auto mb-3">
                ${msgs.map(m=>`
                  <div class="text-xs ${m.from==='user' ? 'text-white/80' : m.from==='ai' ? 'text-violet-300' : 'text-emerald-300'}">
                    <span class="font-bold">${m.from==='user'?'کاربر':m.from==='ai'?'AI':'پشتیبان'}:</span>
                    <span>${m.text}</span>
                    <span class="text-white/30"> - ${utils.formatDateTime(m.at)}</span>
                  </div>
                `).join('')}
              </div>
              ${t.status==='open' ? `
                <form onsubmit="event.preventDefault(); addTicketMessage(state.tickets.find(x=>x.id==='${t.id}'), { from:'admin', text:this.reply.value }).then(ok=>{ if(ok){ const aiText=generateAiReply(this.reply.value); addTicketMessage(state.tickets.find(x=>x.id==='${t.id}'), { from:'ai', text: aiText }); this.reset(); } })">
                  <div class="flex gap-2">
                    <input name="reply" class="flex-1 input-style" placeholder="پاسخ پشتیبان..." required>
                    <button class="btn-success px-5 rounded-xl" type="submit">ارسال</button>
                    <button type="button" class="btn-danger px-5 rounded-xl" onclick="closeTicket(state.tickets.find(x=>x.id==='${t.id}'))">بستن</button>
                  </div>
                </form>
              ` : ``}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/* ========== Enhance dropzones on render (drag & drop) ========== */
(function setupAdminPanelDropzones() {
  const setup = () => {
    const mainDz = document.getElementById('main-dropzone');
    const galDz = document.getElementById('gallery-dropzone');
    const prevent = (e) => { e.preventDefault(); e.stopPropagation(); };
    const decorate = (el) => {
      if (!el) return;
      ['dragenter','dragover','dragleave','drop'].forEach(evt => el.addEventListener(evt, prevent));
      el.addEventListener('dragover', () => el.classList.add('ring-2','ring-violet-400'));
      el.addEventListener('dragleave', () => el.classList.remove('ring-2','ring-violet-400'));
    };
    decorate(mainDz);
    decorate(galDz);
    if (mainDz) mainDz.addEventListener('drop', (e) => {
      mainDz.classList.remove('ring-2','ring-violet-400');
      const files = [...(e.dataTransfer?.files || [])];
      if (files.length) handleMainImageFiles(files);
    });
    if (galDz) galDz.addEventListener('drop', (e) => {
      galDz.classList.remove('ring-2','ring-violet-400');
      const files = [...(e.dataTransfer?.files || [])];
      if (files.length) handleGalleryFiles(files);
    });
  };
  const observer = new MutationObserver(setup);
  observer.observe(document.body, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', setup);
})();

/* ========== Expose ========== */
window.renderAdminPanel = renderAdminPanel;
window.renderAdminProductsEditor = renderAdminProductsEditor;
window.renderAdminCategoriesEditor = renderAdminCategoriesEditor;
window.renderAdminOrdersSafe = renderAdminOrdersSafe;
window.renderAdminSupportSafe = renderAdminSupportSafe;