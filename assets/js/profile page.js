// ═══════════════════════════════════════════════════════════════
// PROFILE PAGE
// File: assets/js/profile page.js
// ═══════════════════════════════════════════════════════════════
(function () {
  // ───────── Initial sync with AppState ─────────
  const persisted = window.AppState ? AppState.get() : {};

  window.state.currentUser = state.currentUser || persisted.currentUser || null;
  window.state.user        = state.user        || persisted.user        || null;
  window.state.isAdmin     = typeof state.isAdmin === 'boolean'
    ? state.isAdmin
    : (persisted.isAdmin || false);

  if (!state.user && state.currentUser) {
    state.user = {
      ...state.currentUser,
      addresses: [],
      avatar: '',
      nationalId: state.currentUser.nationalId || ''
    };
  }

  // Tickets global array
  state.tickets = Array.isArray(state.tickets) ? state.tickets : (persisted.tickets || []);
  // User ticket modal state
  state.userTicketModal = state.userTicketModal || {
    open: false,
    subject: '',
    message: '',
    priority: 'normal'
  };

  // ───────── Navigation ─────────
  function navigate(page) {
    if (typeof goTo === 'function') goTo(page);
    setTimeout(() => {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {}
    }, 0);
  }

  // ───────── Logout (AppState synced) ─────────
  function logoutUser() {
    if (window.AppState) {
      AppState.set({
        user: null,
        currentUser: null,
        isAdmin: false
      });
    } else {
      state.user = null;
      state.currentUser = null;
      state.isAdmin = false;
    }
    toast('✅ از حساب کاربری خارج شدید');
    navigate('login');
  }

  // ───────── Helpers ─────────
  function numericMask(el, maxLen) {
    if (!el) return;
    el.value = String(el.value || '').replace(/\D+/g, '').slice(0, maxLen || 50);
  }

  function autoTitle(i) {
    return `آدرس ${i + 1}`;
  }

  function normalizeAddresses() {
    if (!state.user) return;
    const arr = Array.isArray(state.user.addresses) ? state.user.addresses : [];
    state.user.addresses = arr.map((it, idx) => {
      if (typeof it === 'string') {
        return { title: autoTitle(idx), full: it.trim(), postal: '', plaque: '', unit: '' };
      }
      return {
        title: (it.title || '').trim() || autoTitle(idx),
        full: (it.full || '').trim(),
        postal: String(it.postal || '').replace(/\D+/g, '').slice(0, 10),
        plaque: String(it.plaque || '').replace(/\D+/g, ''),
        unit: String(it.unit || '').replace(/\D+/g, '')
      };
    });
  }

  // ───────── Profile update ─────────
  function updateUserProfile() {
    const name = String(document.getElementById('profile-name')?.value || '').trim();
    const nationalId = String(document.getElementById('profile-nid')?.value || '').trim();
    const phone = String(document.getElementById('profile-phone')?.value || '').trim();

    if (name.length < 3) return toast('نام و نام خانوادگی باید حداقل ۳ کاراکتر باشد', 'warning');
    if (!/^\d{10}$/.test(nationalId)) return toast('کد ملی باید دقیقاً ۱۰ رقم باشد', 'warning');
    if (!/^09\d{9}$/.test(phone)) return toast('شماره موبایل نامعتبر است', 'warning');

    state.user.name = name;
    state.user.nationalId = nationalId;
    state.user.phone = phone;

    state.currentUser = {
      ...(state.currentUser || {}),
      id: state.currentUser?.id || state.user.id || 'user_' + Date.now(),
      name,
      phone,
      nationalId
    };

    if (window.AppState) {
      AppState.set({
        user: state.user,
        currentUser: state.currentUser,
        isAdmin: state.isAdmin,
        tickets: state.tickets
      });
    }

    toast('✅ پروفایل بروزرسانی شد');
    render();
  }

  // ───────── Avatar upload ─────────
  async function handleAvatarUpload(file) {
    if (!file) return;

    const cfg = { maxSizeMB: 5, types: ['image/jpeg', 'image/png', 'image/webp'] };
    const { ok, error } = (window.utils && utils.validateImageFile)
      ? utils.validateImageFile(file, cfg)
      : { ok: true };

    if (!ok) return toast(error || 'فایل نامعتبر است', 'error');

    const previewEl = document.getElementById('avatar-preview');
    const imgEl = previewEl?.querySelector('img');
    if (imgEl) {
      imgEl.src = URL.createObjectURL(file);
      previewEl.classList.remove('hidden');
    }

    const progressBar = document.getElementById('avatar-progress');
    const bar = progressBar?.querySelector('div');
    if (progressBar && bar) {
      progressBar.classList.remove('hidden');
      bar.style.width = '0%';
    }

    try {
      const dataUrl = (window.utils && utils.readImageAsDataUrl)
        ? await utils.readImageAsDataUrl(file)
        : '';

      if (!dataUrl) return toast('خواندن تصویر ناموفق بود', 'error');

      state.user.avatar = dataUrl;
      state.currentUser = { ...(state.currentUser || {}), avatar: dataUrl };

      if (bar) bar.style.width = '100%';

      if (window.AppState) {
        AppState.set({
          user: state.user,
          currentUser: state.currentUser,
          tickets: state.tickets
        });
      }

      toast('✅ عکس پروفایل بروزرسانی شد');
      render();
    } catch {
      toast('❌ خطا در آپلود تصویر', 'error');
    }
  }

  // ───────── Addresses ─────────
  function addAddressFromForm() {
    if (!state.user) return;

    normalizeAddresses();
    const arr = state.user.addresses;

    if (arr.length >= 10) return toast('حداکثر ۱۰ آدرس مجاز است', 'warning');

    const title = String(document.getElementById('addr-title')?.value || '').trim() || autoTitle(arr.length);
    const postal = String(document.getElementById('addr-postal')?.value || '').replace(/\D+/g, '');
    const full = String(document.getElementById('addr-full')?.value || '').trim();
    const plaque = String(document.getElementById('addr-plaque')?.value || '').replace(/\D+/g, '');
    const unit = String(document.getElementById('addr-unit')?.value || '').replace(/\D+/g, '');

    if (!/^\d{10}$/.test(postal)) return toast('کد پستی باید دقیقاً ۱۰ رقم باشد', 'warning');
    if (!full) return toast('آدرس کامل را وارد کنید', 'warning');

    arr.push({ title, full, postal, plaque, unit });

    if (window.AppState) AppState.set({ user: state.user, tickets: state.tickets });

    toast('✅ آدرس جدید ذخیره شد');
    render();
  }

  function openEditAddressModal(i) {
    if (!state.user) return;

    normalizeAddresses();
    const addr = state.user.addresses[i];
    if (!addr) return;

    state.confirmModal = {
      type: 'editAddress',
      title: 'ویرایش آدرس',
      icon: '📍',
      message: `
        <form id="edit-address-form" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="block text-sm text-white/70 mb-1">عنوان</label>
              <input id="edit-title" class="input-style w-full" value="${addr.title}" placeholder="خانه، محل کار...">
            </div>
            <div>
              <label class="block text-sm text-white/70 mb-1">کد پستی (۱۰ رقمی) *</label>
              <input id="edit-postal" class="input-style w-full text-left" dir="ltr" maxlength="10"
                value="${addr.postal}" oninput="numericMask(this,10)">
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm text-white/70 mb-1">پلاک</label>
                <input id="edit-plaque" class="input-style w-full text-left" dir="ltr" maxlength="6"
                  value="${addr.plaque}" oninput="numericMask(this,6)">
              </div>
              <div>
                <label class="block text-sm text-white/70 mb-1">واحد</label>
                <input id="edit-unit" class="input-style w-full text-left" dir="ltr" maxlength="6"
                  value="${addr.unit}" oninput="numericMask(this,6)">
              </div>
            </div>
          </div>
          <div>
            <label class="block text-sm text-white/70 mb-1">آدرس کامل *</label>
            <textarea id="edit-full" class="input-style w-full resize-none" rows="3">${addr.full}</textarea>
          </div>
        </form>
      `,
      confirmText: 'ذخیره تغییرات',
      confirmClass: 'btn-primary',
      onConfirm: () => saveEditedAddress(i),
      onCancel: () => {
        state.confirmModal = null;
        render();
      }
    };

    render();
  }

  function saveEditedAddress(i) {
    const title = String(document.getElementById('edit-title')?.value || '').trim() || autoTitle(i);
    const postal = String(document.getElementById('edit-postal')?.value || '').replace(/\D+/g, '');
    const full = String(document.getElementById('edit-full')?.value || '').trim();
    const plaque = String(document.getElementById('edit-plaque')?.value || '').replace(/\D+/g, '');
    const unit = String(document.getElementById('edit-unit')?.value || '').replace(/\D+/g, '');

    if (!/^\d{10}$/.test(postal)) return toast('کد پستی باید دقیقاً ۱۰ رقم باشد', 'warning');
    if (!full) return toast('آدرس کامل را وارد کنید', 'warning');

    state.user.addresses[i] = { title, full, postal, plaque, unit };

    if (window.AppState) AppState.set({ user: state.user, tickets: state.tickets });

    state.confirmModal = null;
    toast('✅ آدرس ویرایش شد');
    render();
  }

  function deleteAddress(i) {
    if (!state.user) return;

    normalizeAddresses();
    const arr = state.user.addresses;
    if (i < 0 || i >= arr.length) return;

    arr.splice(i, 1);

    if (window.AppState) AppState.set({ user: state.user, tickets: state.tickets });

    toast('آدرس حذف شد');
    render();
  }

  // ───────── Wishlist ─────────
  function removeWishlist(index) {
    const wl = Array.isArray(state.wishlist) ? state.wishlist : (state.wishlist = []);
    if (index < 0 || index >= wl.length) return;

    wl.splice(index, 1);

    if (window.AppState) AppState.set({ wishlist: wl, tickets: state.tickets });

    toast('محصول از علاقه‌مندی حذف شد');
    render();
  }

  // ───────── Tickets: helpers ─────────
  function normalizeTicketMessages(t) {
    if (!t) return [];
    if (Array.isArray(t.messages)) return t.messages;
    try {
      const parsed = JSON.parse(t.messages || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function persistTickets() {
    if (window.AppState) {
      AppState.set({
        ...(AppState.get() || {}),
        tickets: state.tickets,
        user: state.user,
        currentUser: state.currentUser,
        isAdmin: state.isAdmin
      });
    }
  }

  // ───────── Tickets: create from user (with priority) ─────────
  function createTicketUser(payload) {
    if (!state.user) {
      toast('ابتدا وارد شوید', 'warning');
      navigate('login');
      return;
    }

    const subject = String(payload.subject || '').trim();
    const message = String(payload.message || '').trim();
    const priority = payload.priority === 'urgent' ? 'urgent' : 'normal';

    if (!subject || !message) {
      toast('موضوع و متن تیکت الزامی است', 'warning');
      return;
    }

    const ticket = {
      id: (window.utils && utils.uid ? utils.uid() : Date.now()).toString(),
      user_phone: state.user.phone,
      user_name: state.user.name || 'کاربر',
      user_avatar: state.user.avatar || '',
      subject,
      status: 'open',
      priority,
      messages: [
        {
          from: 'user',
          text: message,
          at: new Date().toISOString()
        }
      ],
      created_at: new Date().toISOString()
    };

    state.tickets = Array.isArray(state.tickets) ? state.tickets : [];
    state.tickets.unshift(ticket);

    persistTickets();

    toast('✅ تیکت ثبت شد');
    state.userTicketModal = { open: false, subject: '', message: '', priority: 'normal' };
    render();
  }

  function replyTicket(ticketId, text) {
    const t = (state.tickets || []).find(x => String(x.id) === String(ticketId));
    if (!t || t.status !== 'open') return;

    const msg = String(text || '').trim();
    if (!msg) return;

    const msgs = normalizeTicketMessages(t);
    msgs.push({
      from: 'user',
      text: msg,
      at: new Date().toISOString()
    });
    t.messages = msgs;

    persistTickets();

    toast('✅ پاسخ شما ارسال شد');
    render();
  }

  // ───────── Orders status helper ─────────
  function getStatusInfo(status) {
    const s = String(status || '').toLowerCase();
    if (s === 'processing') return { badge: 'badge-processing', icon: '⏳', label: 'در حال پردازش' };
    if (s === 'shipped')    return { badge: 'badge-shipped',    icon: '🚚', label: 'ارسال شد' };
    if (s === 'delivered')  return { badge: 'badge-delivered',  icon: '✅', label: 'تحویل شده' };
    if (s === 'canceled')   return { badge: 'badge-canceled',   icon: '✖️', label: 'لغو شده' };
    return { badge: 'badge-new', icon: '📦', label: 'ثبت شده' };
  }

  // ───────── User ticket modal ─────────
  function openUserTicketModal() {
    state.userTicketModal.open = true;
    render();
  }

  function closeUserTicketModal() {
    state.userTicketModal.open = false;
    render();
  }

  function renderUserTicketModal() {
    const m = state.userTicketModal;
    if (!m || !m.open) return '';

    return `
      <div class="fixed inset-0 z-[200] flex items-center justify-center p-4 modal-overlay">
        <div class="glass-strong rounded-3xl p-6 lg:p-8 max-w-lg w-full max-h-[90%] overflow-y-auto animate-scale">
          <h2 class="text-xl font-black mb-4 flex items-center gap-2">
            <span>🎫</span><span>ارسال تیکت پشتیبانی</span>
          </h2>
          <p class="text-xs text-white/60 mb-4">
            لطفاً موضوع و توضیحات مشکل را وارد کنید. در صورت فوری بودن، گزینه «فوری» را فعال کنید تا تیکت شما در اولویت پاسخ‌گویی قرار بگیرد.
          </p>
          <form 
            onsubmit="event.preventDefault(); 
              createTicketUser({ 
                subject: this.subject.value, 
                message: this.message.value, 
                priority: this.priority.value 
              });"
            class="space-y-4 text-sm"
          >
            <div>
              <label class="block text-xs text-white/70 mb-1">موضوع تیکت *</label>
              <input 
                name="subject" 
                class="input-style w-full" 
                placeholder="مثال: مشکل در ثبت سفارش" 
                required
              >
            </div>
            <div>
              <label class="block text-xs text-white/70 mb-1">شرح مشکل *</label>
              <textarea 
                name="message" 
                class="input-style w-full resize-none" 
                rows="4" 
                placeholder="توضیحات کامل مشکل را بنویسید..." 
                required
              ></textarea>
            </div>
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <label class="text-xs text-white/70">اولویت:</label>
                <select name="priority" class="input-style text-xs w-32">
                  <option value="normal">عادی</option>
                  <option value="urgent">فوری</option>
                </select>
              </div>
              <span class="text-[11px] text-white/50">
                تیکت‌های «فوری» در پنل مدیر در بخش کوییک ریپلای نمایش داده می‌شوند.
              </span>
            </div>
            <div class="flex gap-3 mt-4">
              <button type="button" class="flex-1 btn-ghost py-3 rounded-xl font-semibold" onclick="closeUserTicketModal()">
                انصراف
              </button>
              <button type="submit" class="flex-1 btn-primary py-3 rounded-xl font-semibold">
                ثبت تیکت
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  // ───────── Render profile page ─────────
  function renderProfilePage() {
    if (!state.user) {
      navigate('login');
      return '';
    }

    normalizeAddresses();

    const user = state.user;
    const ordersAll = Array.isArray(state.orders) ? state.orders : [];
    const userOrders = ordersAll.filter(o => String(o.user_phone) === String(user.phone));

    const ticketsAll = Array.isArray(state.tickets) ? state.tickets : [];
    const userTickets = ticketsAll.filter(t => String(t.user_phone) === String(user.phone));

    const wishlist = Array.isArray(state.wishlist) ? state.wishlist : [];

    return `
      ${typeof renderHeader === 'function' ? renderHeader() : ''}

      <main class="max-w-6xl mx-auto px-4 lg:px-8 py-8 lg:py-12">

        <!-- Header + Logout -->
        <div class="glass rounded-2xl p-6 mb-8">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-5">
              <div class="w-20 h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-4xl lg:text-5xl shadow-lg">
                ${
                  user.avatar
                    ? `<img src="${user.avatar}" alt="avatar" class="w-full h-full object-cover">`
                    : '👤'
                }
              </div>
              <div class="flex-1 min-w-0">
                <h1 class="text-2xl lg:text-3xl font-black mb-1 line-clamp-1">${user.name || 'کاربر'}</h1>
                <p class="text-white/60 font-mono">${user.phone || ''}</p>
                ${
                  state.isAdmin
                    ? `<span class="inline-block mt-2 badge badge-new">مدیر سیستم</span>`
                    : ''
                }
              </div>
            </div>
            <button class="btn-ghost text-rose-400 px-4 py-2 rounded-xl" onclick="logoutUser()">خروج</button>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="glass rounded-2xl p-5 text-center">
            <div class="text-3xl mb-2">📦</div>
            <div class="text-2xl font-black">${userOrders.length}</div>
            <div class="text-xs text-white/60">سفارش‌های شما</div>
          </div>
          <div class="glass rounded-2xl p-5 text-center">
            <div class="text-3xl mb-2">📍</div>
            <div class="text-2xl font-black">${user.addresses.length}</div>
            <div class="text-xs text-white/60">آدرس‌ها</div>
          </div>
          <div class="glass rounded-2xl p-5 text-center">
            <div class="text-3xl mb-2">🎫</div>
            <div class="text-2xl font-black">${userTickets.length}</div>
            <div class="text-xs text-white/60">تیکت‌ها</div>
          </div>
          <div class="glass rounded-2xl p-5 text-center">
            <div class="text-3xl mb-2">❤️</div>
            <div class="text-2xl font-black">${wishlist.length}</div>
            <div class="text-xs text-white/60">علاقه‌مندی‌ها</div>
          </div>
        </div>

        <!-- Profile editor -->
        <div class="glass rounded-2xl p-6 mb-8">
          <h2 class="text-xl font-bold mb-6 flex items-center gap-2"><span>👤</span><span>ویرایش پروفایل کاربری</span></h2>
          <form onsubmit="event.preventDefault(); updateUserProfile();" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm text-white/70 mb-1">نام و نام خانوادگی *</label>
              <input id="profile-name" class="input-style w-full" value="${user.name || ''}" placeholder="مثال: آرین علوی">
            </div>
            <div>
              <label class="block text-sm text-white/70 mb-1">کد ملی (۱۰ رقمی) *</label>
              <input id="profile-nid" class="input-style w-full text-left" dir="ltr" inputmode="numeric" maxlength="10"
                value="${user.nationalId || ''}" placeholder="1234567890" oninput="numericMask(this, 10)">
              <p class="text-xs text-white/40 mt-1">فقط عدد، دقیقاً ۱۰ رقم</p>
            </div>
            <div>
              <label class="block text-sm text-white/70 mb-1">شماره موبایل *</label>
              <input id="profile-phone" class="input-style w-full text-left" dir="ltr" inputmode="tel"
                value="${user.phone || ''}" placeholder="09123456789">
            </div>
            <div class="text-center">
              <label class="block text-sm text-white/70 mb-2">عکس پروفایل</label>
              <input type="file" accept="image/*" class="hidden" id="avatar-input" onchange="handleAvatarUpload(this.files[0])">
              <button type="button" onclick="document.getElementById('avatar-input').click()" class="btn-ghost px-4 py-2 rounded-xl w-full md:w-auto">انتخاب تصویر</button>
              <div id="avatar-preview" class="mt-4 ${user.avatar ? '' : 'hidden'}">
                <img src="${user.avatar || ''}" alt="preview" class="w-24 h-24 rounded-full object-cover mx-auto shadow-lg">
                <div id="avatar-progress" class="w-full bg-white/10 rounded-full h-2 mt-3 overflow-hidden hidden">
                  <div class="bg-violet-500 h-2 w-0 transition-all"></div>
                </div>
              </div>
            </div>
            <div class="md:col-span-2">
              <button type="submit" class="btn-primary w-full py-3 rounded-xl font-bold">ذخیره تغییرات</button>
            </div>
          </form>
        </div>

        <!-- Address manager -->
        <div class="glass rounded-2xl p-6 mb-8">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold flex items-center gap-2"><span>📍</span><span>مدیریت آدرس‌ها</span></h3>
            <span class="text-xs text-white/50">حداکثر ۱۰ آدرس قابل ذخیره است</span>
          </div>

          <form class="space-y-4 mb-6" onsubmit="event.preventDefault(); addAddressFromForm();">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label class="block text-sm text-white/70 mb-1">عنوان آدرس</label>
                <input id="addr-title" class="input-style w-full" placeholder="خانه، محل کار... (خالی = خودکار)">
              </div>
              <div>
                <label class="block text-sm text-white/70 mb-1">کد پستی (۱۰ رقمی) *</label>
                <input id="addr-postal" class="input-style w-full text-left" dir="ltr" inputmode="numeric" maxlength="10" placeholder="1234567890" oninput="numericMask(this, 10)">
                <p class="text-xs text-white/40 mt-1">فقط عدد، دقیقاً ۱۰ رقم</p>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm text-white/70 mb-1">پلاک</label>
                  <input id="addr-plaque" class="input-style w-full text-left" dir="ltr" inputmode="numeric" maxlength="6" placeholder="12" oninput="numericMask(this, 6)">
                </div>
                <div>
                  <label class="block text-sm text-white/70 mb-1">واحد</label>
                  <input id="addr-unit" class="input-style w-full text-left" dir="ltr" inputmode="numeric" maxlength="6" placeholder="4" oninput="numericMask(this, 6)">
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm text-white/70 mb-1">آدرس کامل *</label>
              <textarea id="addr-full" class="input-style w-full resize-none" rows="3" placeholder="استان، شهر، خیابان، کوچه..."></textarea>
            </div>
            <div class="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <button type="submit" class="btn-primary px-4 py-3 rounded-xl w-full md:w-auto">افزودن آدرس</button>
              <span class="text-xs text-white/50">اگر عنوان خالی باشد، خودکار مثل «آدرس 1» ثبت می‌شود</span>
            </div>
          </form>

          <div class="space-y-3">
            ${
              user.addresses.length === 0
                ? `<div class="text-sm text-white/60">هنوز آدرسی ثبت نکرده‌اید.</div>`
                : user.addresses
                    .map(
                      (addr, i) => `
                  <div class="glass rounded-2xl p-4">
                    <div class="flex flex-col md:flex-row md:items-center gap-3 justify-between">
                      <div class="flex items-center gap-2">
                        <span class="text-xl">🏷️</span>
                        <span class="font-bold line-clamp-1">${addr.title || autoTitle(i)}</span>
                        <span class="text-white/40 text-xs md:ml-2">کد پستی: ${addr.postal || '—'}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <button class="btn-ghost px-3 py-1 rounded-lg" onclick="openEditAddressModal(${i})">ویرایش</button>
                        <button class="btn-ghost text-rose-400 px-3 py-1 rounded-lg" onclick="deleteAddress(${i})">حذف</button>
                      </div>
                    </div>
                  </div>
                `
                    )
                    .join('')
            }
          </div>
        </div>

        <!-- Orders -->
        <div class="glass rounded-2xl p-6 mb-8">
          <h2 class="font-bold text-lg mb-4">سفارش‌های شما و وضعیت آن‌ها</h2>
          ${
            userOrders.length === 0
              ? `<div class="text-sm text-white/60">سفارشی ثبت نشده است.</div>`
              : `
                <div class="space-y-3">
                  ${userOrders
                    .map(order => {
                      const s = getStatusInfo(order.status);
                      return `
                      <div class="glass rounded-xl p-4">
                        <div class="flex items-center justify-between mb-2">
                          <div class="font-mono text-xs">#${String(order.id || '').slice(-8)}</div>
                          <span class="badge ${s.badge}">${s.icon} ${s.label}</span>
                        </div>
                        <div class="flex items-center justify-between">
                          <span class="text-white/60 text-sm">
                            ${
                              window.utils && utils.formatDate
                                ? utils.formatDate(order.created_at)
                                : order.created_at || ''
                            }
                          </span>
                          <span class="text-emerald-400 font-bold">
                            ${
                              window.utils && utils.formatPrice
                                ? utils.formatPrice(order.total)
                                : order.total || ''
                            }
                          </span>
                        </div>
                      </div>
                    `;
                    })
                    .join('')}
                </div>
              `
          }
        </div>

        <!-- Wishlist -->
        <div class="glass rounded-2xl p-6 mb-8">
          <h2 class="font-bold text-lg mb-4">لیست علاقه‌مندی‌ها ❤️</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${
              wishlist.length === 0
                ? `<div class="text-sm text-white/60">هنوز محصولی اضافه نکرده‌اید.</div>`
                : wishlist
                    .map(
                      (item, i) => `
                  <div class="glass rounded-xl p-4 flex items-center gap-3">
                    ${
                      item.image
                        ? `<img src="${item.image}" class="w-16 h-16 rounded-lg object-cover">`
                        : `<div class="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center">📦</div>`
                    }
                    <div class="flex-1 min-w-0">
                      <div class="font-bold line-clamp-1">${item.title || 'محصول'}</div>
                      <div class="text-sm text-emerald-400">
                        ${
                          window.utils && utils.formatPrice
                            ? utils.formatPrice(item.price)
                            : item.price || ''
                        }
                      </div>
                    </div>
                    <button class="btn-ghost text-rose-400 px-3 py-1 rounded-lg" onclick="removeWishlist(${i})">حذف</button>
                  </div>
                `
                    )
                    .join('')
            }
          </div>
        </div>

        <!-- Tickets -->
        <div class="glass rounded-2xl p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-bold text-lg flex items-center gap-2">
              <span>🎫</span><span>تیکت‌های پشتیبانی</span>
            </h2>
            <button 
              class="btn-primary px-4 py-2 rounded-xl text-sm"
              type="button"
              onclick="openUserTicketModal()"
            >
              ارسال تیکت جدید
            </button>
          </div>

          <div class="mt-2 space-y-3">
            ${
              userTickets.length === 0
                ? `<div class="text-sm text-white/60">تیکتی ثبت نشده است.</div>`
                : userTickets
                    .map(t => {
                      const msgs = normalizeTicketMessages(t);
                      const lastMsg = msgs[msgs.length - 1];
                      const priorityLabel = t.priority === 'urgent' ? 'فوری' : 'عادی';
                      const priorityBadge =
                        t.priority === 'urgent'
                          ? 'badge-danger'
                          : 'badge-new';

                      return `
                  <div class="glass rounded-xl p-4">
                    <div class="flex items-center justify-between mb-2">
                      <div class="font-mono text-xs">#${String(t.id || '').slice(-6)}</div>
                      <div class="flex items-center gap-2">
                        <span class="badge ${
                          t.status === 'open' ? 'badge-processing' : 'badge-delivered'
                        }">
                          ${t.status === 'open' ? 'باز' : 'بسته'}
                        </span>
                        <span class="badge ${priorityBadge}">
                          ${priorityLabel}
                        </span>
                      </div>
                    </div>
                    <div class="text-sm font-semibold mb-1">${t.subject || ''}</div>
                    ${
                      lastMsg
                        ? `<div class="text-xs text-white/60 mb-2 line-clamp-1">
                            ${
                              lastMsg.from === 'user'
                                ? 'شما: '
                                : lastMsg.from === 'admin'
                                ? 'مدیر: '
                                : 'AI: '
                            }${lastMsg.text}
                          </div>`
                        : ''
                    }
                    <div class="space-y-2 max-h-44 overflow-auto">
                      ${
                        msgs
                          .map(
                            m => `
                          <div class="text-xs ${
                            m.from === 'user'
                              ? 'text-white/80'
                              : m.from === 'ai'
                              ? 'text-violet-300'
                              : 'text-emerald-300'
                          }">
                            <span class="font-bold">
                              ${
                                m.from === 'user'
                                  ? 'شما'
                                  : m.from === 'ai'
                                  ? 'AI'
                                  : 'مدیر'
                              }:
                            </span>
                            <span>${m.text}</span>
                            <span class="text-white/30">
                              - ${
                                window.utils && utils.formatDateTime
                                  ? utils.formatDateTime(m.at)
                                  : m.at || ''
                              }
                            </span>
                          </div>
                        `
                          )
                          .join('')
                      }
                    </div>
                    ${
                      t.status === 'open'
                        ? `
                          <form class="mt-3" onsubmit="event.preventDefault(); replyTicket('${t.id}', this.reply.value); this.reset();">
                            <div class="flex gap-2">
                              <input name="reply" class="flex-1 input-style" placeholder="پاسخ شما..." required>
                              <button class="btn-ghost px-4 rounded-xl" type="submit">ارسال</button>
                            </div>
                          </form>
                        `
                        : ''
                    }
                  </div>
                `;
                    })
                    .join('')
            }
          </div>
        </div>

      </main>

    `;
  }

  // ───────── Expose ─────────
  window.renderProfilePage    = renderProfilePage;
  window.navigate             = navigate;
  window.logoutUser           = logoutUser;
  window.numericMask          = numericMask;
  window.updateUserProfile    = updateUserProfile;
  window.handleAvatarUpload   = handleAvatarUpload;
  window.addAddressFromForm   = addAddressFromForm;
  window.openEditAddressModal = openEditAddressModal;
  window.saveEditedAddress    = saveEditedAddress;
  window.deleteAddress        = deleteAddress;
  window.removeWishlist       = removeWishlist;
  window.createTicketUser     = createTicketUser;
  window.replyTicket          = replyTicket;
  window.openUserTicketModal  = openUserTicketModal;
  window.closeUserTicketModal = closeUserTicketModal;
})();