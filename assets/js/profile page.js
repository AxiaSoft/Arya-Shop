// PROFILE PAGE (Final GPT‑5: full responsive profile + modal address edit + orders status + wishlist + tickets + logout)
// File: assets/js/profile page.js
(function () {
  // ناوبری
  function navigate(page) {
    if (typeof goTo === 'function') goTo(page);
    setTimeout(() => { try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {} }, 0);
  }

  // خروج از حساب کاربری
  function logoutUser() {
    state.user = null;
    toast('✅ از حساب کاربری خارج شدید');
    navigate('login');
  }

  // فقط عددی با سقف طول
  function numericMask(el, maxLen) {
    if (!el) return;
    el.value = String(el.value || '').replace(/\D+/g, '').slice(0, maxLen || 50);
  }

  // عنوان خودکار آدرس
  function autoTitle(i) { return `آدرس ${i + 1}`; }

  // استانداردسازی آدرس‌ها
  function normalizeAddresses() {
    const u = state.user; if (!u) return;
    const arr = Array.isArray(u.addresses) ? u.addresses : [];
    u.addresses = arr.map((it, idx) => {
      if (typeof it === 'string') return { title: autoTitle(idx), full: it.trim(), postal: '', plaque: '', unit: '' };
      return {
        title: (it.title || '').trim() || autoTitle(idx),
        full: (it.full || '').trim(),
        postal: String(it.postal || '').replace(/\D+/g, '').slice(0, 10),
        plaque: String(it.plaque || '').replace(/\D+/g, ''),
        unit: String(it.unit || '').replace(/\D+/g, '')
      };
    });
  }

  // بروزرسانی پروفایل کاربر
  function updateUserProfile() {
    const name = String(document.getElementById('profile-name')?.value || '').trim();
    const nationalId = String(document.getElementById('profile-nid')?.value || '').trim();
    const phone = String(document.getElementById('profile-phone')?.value || '').trim();

    if (name.length < 3) { toast('نام و نام خانوادگی باید حداقل ۳ کاراکتر باشد', 'warning'); return; }
    if (!/^\d{10}$/.test(nationalId)) { toast('کد ملی باید دقیقاً ۱۰ رقم باشد', 'warning'); return; }
    if (!/^09\d{9}$/.test(phone)) { toast('شماره موبایل نامعتبر است', 'warning'); return; }

    state.user.name = name;
    state.user.nationalId = nationalId;
    state.user.phone = phone;

    toast('✅ پروفایل بروزرسانی شد');
    render();
  }

  // آپلود آواتار با preview و progress
  async function handleAvatarUpload(file) {
    if (!file) return;
    const cfg = { maxSizeMB: 5, types: ['image/jpeg', 'image/png', 'image/webp'] };
    const { ok, error } = (utils && utils.validateImageFile) ? utils.validateImageFile(file, cfg) : { ok: true };
    if (!ok) { toast(error || 'فایل نامعتبر است', 'error'); return; }

    const previewEl = document.getElementById('avatar-preview');
    const imgEl = previewEl?.querySelector('img');
    if (imgEl) { imgEl.src = URL.createObjectURL(file); previewEl.classList.remove('hidden'); }
    const progressBar = document.getElementById('avatar-progress');
    const bar = progressBar?.querySelector('div');
    if (progressBar && bar) { progressBar.classList.remove('hidden'); bar.style.width = '0%'; }

    try {
      if (window.dataSdk && typeof window.dataSdk.uploadAvatar === 'function') {
        const res = await window.dataSdk.uploadAvatar(file, (p) => { if (bar) bar.style.width = (p ?? 0) + '%'; });
        if (res && res.isOk && res.url) { state.user.avatar = res.url; toast('✅ عکس پروفایل بروزرسانی شد'); render(); return; }
        toast('❌ خطا در آپلود تصویر', 'error');
      } else {
        const dataUrl = utils && utils.readImageAsDataUrl ? await utils.readImageAsDataUrl(file) : '';
        if (!dataUrl) { toast('خواندن تصویر ناموفق بود', 'error'); return; }
        state.user.avatar = dataUrl;
        if (bar) bar.style.width = '100%';
        toast('✅ عکس پروفایل بروزرسانی شد (نسخه دمو)');
        render();
      }
    } catch { toast('❌ خطا در آپلود تصویر', 'error'); }
  }

  // افزودن آدرس جدید
  function addAddressFromForm() {
    if (!state.user) return;
    normalizeAddresses();
    const arr = state.user.addresses;
    if (arr.length >= 10) { toast('حداکثر ۱۰ آدرس مجاز است', 'warning'); return; }

    const title = String(document.getElementById('addr-title')?.value || '').trim() || autoTitle(arr.length);
    const postal = String(document.getElementById('addr-postal')?.value || '').replace(/\D+/g, '');
    const full = String(document.getElementById('addr-full')?.value || '').trim();
    const plaque = String(document.getElementById('addr-plaque')?.value || '').replace(/\D+/g, '');
    const unit = String(document.getElementById('addr-unit')?.value || '').replace(/\D+/g, '');

    if (!/^\d{10}$/.test(postal)) { toast('کد پستی باید دقیقاً ۱۰ رقم باشد', 'warning'); return; }
    if (!full) { toast('آدرس کامل را وارد کنید', 'warning'); return; }

    arr.push({ title, full, postal, plaque, unit });
    toast('✅ آدرس جدید ذخیره شد');
    render();
  }

  // باز کردن مودال ویرایش آدرس
  function openEditAddressModal(i) {
    if (!state.user) return;
    normalizeAddresses();
    const addr = state.user.addresses[i]; if (!addr) return;

    state.confirmModal = {
      type: 'editAddress',
      title: 'ویرایش آدرس',
      icon: '📍',
      message: `
        <form id="edit-address-form" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="block text-sm text-white/70 mb-1">عنوان</label>
              <input id="edit-title" class="input-style w-full" value="${addr.title || ''}" placeholder="خانه، محل کار...">
            </div>
            <div>
              <label class="block text-sm text-white/70 mb-1">کد پستی (۱۰ رقمی) *</label>
              <input id="edit-postal" class="input-style w-full text-left" dir="ltr" inputmode="numeric" maxlength="10"
                value="${addr.postal || ''}" placeholder="1234567890" oninput="numericMask(this,10)">
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm text-white/70 mb-1">پلاک</label>
                <input id="edit-plaque" class="input-style w-full text-left" dir="ltr" inputmode="numeric" maxlength="6"
                  value="${addr.plaque || ''}" placeholder="12" oninput="numericMask(this,6)">
              </div>
              <div>
                <label class="block text-sm text-white/70 mb-1">واحد</label>
                <input id="edit-unit" class="input-style w-full text-left" dir="ltr" inputmode="numeric" maxlength="6"
                  value="${addr.unit || ''}" placeholder="4" oninput="numericMask(this,6)">
              </div>
            </div>
          </div>
          <div>
            <label class="block text-sm text-white/70 mb-1">آدرس کامل *</label>
            <textarea id="edit-full" class="input-style w-full resize-none" rows="3" placeholder="استان، شهر، خیابان، کوچه...">${addr.full || ''}</textarea>
          </div>
        </form>
      `,
      confirmText: 'ذخیره تغییرات',
      confirmClass: 'btn-primary',
      onConfirm: () => saveEditedAddress(i),
      onCancel: () => { state.confirmModal = null; render(); }
    };
    render();
  }

  // ذخیره تغییرات آدرس از مودال
  function saveEditedAddress(i) {
    const title = String(document.getElementById('edit-title')?.value || '').trim() || autoTitle(i);
    const postal = String(document.getElementById('edit-postal')?.value || '').replace(/\D+/g, '');
    const full = String(document.getElementById('edit-full')?.value || '').trim();
    const plaque = String(document.getElementById('edit-plaque')?.value || '').replace(/\D+/g, '');
    const unit = String(document.getElementById('edit-unit')?.value || '').replace(/\D+/g, '');

    if (!/^\d{10}$/.test(postal)) { toast('کد پستی باید دقیقاً ۱۰ رقم باشد', 'warning'); return; }
    if (!full) { toast('آدرس کامل را وارد کنید', 'warning'); return; }

    state.user.addresses[i] = { title, full, postal, plaque, unit };
    state.confirmModal = null;
    toast('✅ آدرس ویرایش شد');
    render();
  }

  // حذف آدرس
  function deleteAddress(i) {
    if (!state.user) return;
    normalizeAddresses();
    const arr = state.user.addresses;
    if (i < 0 || i >= arr.length) return;
    arr.splice(i, 1);
    toast('آدرس حذف شد');
    render();
  }

  // علاقه‌مندی‌ها
  function removeWishlist(index) {
    const wl = Array.isArray(state.wishlist) ? state.wishlist : (state.wishlist = []);
    if (index < 0 || index >= wl.length) return;
    wl.splice(index, 1);
    toast('محصول از علاقه‌مندی حذف شد');
    render();
  }

  // تیکت: ایجاد توسط کاربر
  async function createTicketUser(payload) {
    if (!state.user) { toast('ابتدا وارد شوید', 'warning'); navigate('login'); return; }
    const ticket = {
      id: utils && utils.uid ? utils.uid() : Date.now(),
      user_phone: state.user.phone,
      subject: String(payload.subject || '').trim(),
      status: 'open',
      messages: [{ from: 'user', text: String(payload.message || '').trim(), at: new Date().toISOString() }],
      created_at: new Date().toISOString()
    };
    state.tickets = Array.isArray(state.tickets) ? state.tickets : [];
    state.tickets.unshift(ticket);
    // نکته: برای ارسال SMS هنگام پاسخ مدیر، باید API سمت سرور فراخوانی شود.
    toast('✅ تیکت ثبت شد');
    render();
  }

  // تیکت: پاسخ کاربر
  async function replyTicket(ticketId, text) {
    const t = (state.tickets || []).find(x => String(x.id) === String(ticketId));
    if (!t || t.status !== 'open') return;
    const msg = String(text || '').trim(); if (!msg) return;
    t.messages = Array.isArray(t.messages) ? t.messages : [];
    t.messages.push({ from: 'user', text: msg, at: new Date().toISOString() });
    toast('✅ پاسخ شما ارسال شد');
    render();
  }

  // وضعیت سفارش‌ها (آیکون و برچسب)
  function getStatusInfo(status) {
    const s = String(status || '').toLowerCase();
    if (s === 'processing') return { badge: 'badge-processing', icon: '⏳', label: 'در حال پردازش' };
    if (s === 'shipped') return { badge: 'badge-shipped', icon: '🚚', label: 'ارسال شد' };
    if (s === 'delivered') return { badge: 'badge-delivered', icon: '✅', label: 'تحویل شده' };
    if (s === 'canceled') return { badge: 'badge-canceled', icon: '✖️', label: 'لغو شده' };
    return { badge: 'badge-new', icon: '📦', label: 'ثبت شده' };
  }

  // رندر صفحه
  function renderProfilePage() {
    if (!state.user) { navigate('login'); return ''; }
    const user = state.user;
    normalizeAddresses();

    const ordersAll = Array.isArray(state.orders) ? state.orders : [];
    const userOrders = ordersAll.filter(o => String(o.user_phone) === String(user.phone));
    const ticketsAll = Array.isArray(state.tickets) ? state.tickets : [];
    const userTickets = ticketsAll.filter(t => String(t.user_phone) === String(user.phone));
    const wishlist = Array.isArray(state.wishlist) ? state.wishlist : (state.wishlist = []);

    return `
      ${typeof renderHeader === 'function' ? renderHeader() : ''}

      <main class="max-w-6xl mx-auto px-4 lg:px-8 py-8 lg:py-12">

        <!-- Header + خروج -->
        <div class="glass rounded-2xl p-6 mb-8">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-5">
              <div class="w-20 h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-4xl lg:text-5xl shadow-lg">
                ${user.avatar ? `<img src="${user.avatar}" alt="avatar" class="w-full h-full object-cover">` : '👤'}
              </div>
              <div class="flex-1 min-w-0">
                <h1 class="text-2xl lg:text-3xl font-black mb-1 line-clamp-1">${user.name || 'کاربر'}</h1>
                <p class="text-white/60 font-mono">${user.phone || ''}</p>
                ${state.isAdmin ? `<span class="inline-block mt-2 badge badge-new">مدیر سیستم</span>` : ''}
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
            <div class="text-2xl font-black">${(user.addresses || []).length}</div>
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

          <!-- Add form -->
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

          <!-- Address cards -->
          <div class="space-y-3">
            ${user.addresses.length === 0 ? `
              <div class="text-sm text-white/60">هنوز آدرسی ثبت نکرده‌اید.</div>
            ` : user.addresses.map((addr, i) => `
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
            `).join('')}
          </div>
        </div>

        <!-- Orders: وضعیت سفارش‌ها -->
        <div class="glass rounded-2xl p-6 mb-8">
          <h2 class="font-bold text-lg mb-4">سفارش‌های شما و وضعیت آن‌ها</h2>
          ${userOrders.length === 0 ? `
            <div class="text-sm text-white/60">سفارشی ثبت نشده است.</div>
          ` : `
            <div class="space-y-3">
              ${userOrders.map((order) => {
                const s = getStatusInfo(order.status);
                return `
                  <div class="glass rounded-xl p-4">
                    <div class="flex items-center justify-between mb-2">
                      <div class="font-mono text-xs">#${String(order.id || '').slice(-8)}</div>
                      <span class="badge ${s.badge}">${s.icon} ${s.label}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-white/60 text-sm">${utils && utils.formatDate ? utils.formatDate(order.created_at) : (order.created_at || '')}</span>
                      <span class="text-emerald-400 font-bold">${utils && utils.formatPrice ? utils.formatPrice(order.total) : (order.total || '')}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <!-- Wishlist -->
        <div class="glass rounded-2xl p-6 mb-8">
          <h2 class="font-bold text-lg mb-4">لیست علاقه‌مندی‌ها ❤️</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${wishlist.length === 0 ? `
              <div class="text-sm text-white/60">هنوز محصولی اضافه نکرده‌اید.</div>
            ` : wishlist.map((item, i) => `
              <div class="glass rounded-xl p-4 flex items-center gap-3">
                ${item.image ? `<img src="${item.image}" class="w-16 h-16 rounded-lg object-cover">` : `<div class="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center">📦</div>`}
                <div class="flex-1 min-w-0">
                  <div class="font-bold line-clamp-1">${item.title || 'محصول'}</div>
                  <div class="text-sm text-emerald-400">${utils && utils.formatPrice ? utils.formatPrice(item.price) : (item.price || '')}</div>
                </div>
                <button class="btn-ghost text-rose-400 px-3 py-1 rounded-lg" onclick="removeWishlist(${i})">حذف</button>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Tickets: ثبت و مدیریت -->
        <div class="glass rounded-2xl p-6">
          <h2 class="font-bold text-lg mb-4">تیکت‌های پشتیبانی 🎫</h2>

          <!-- Create ticket -->
          <form onsubmit="event.preventDefault(); createTicketUser({ subject: this.subject.value, message: this.message.value }); this.reset();">
            <div class="grid gap-3 mb-4">
              <input name="subject" class="input-style" placeholder="موضوع تیکت *" required>
              <textarea name="message" class="input-style resize-none" rows="3" placeholder="شرح مشکل *" required></textarea>
            </div>
            <button class="btn-primary px-5 py-3 rounded-xl font-semibold">ثبت تیکت</button>
          </form>

          <!-- List tickets -->
          <div class="mt-6 space-y-3">
            ${userTickets.length === 0 ? `
              <div class="text-sm text-white/60">تیکتی ثبت نشده است.</div>
            ` : userTickets.map(t => `
              <div class="glass rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                  <div class="font-mono text-xs">#${String(t.id || '').slice(-6)}</div>
                  <span class="badge ${t.status === 'open' ? 'badge-processing' : 'badge-delivered'}">${t.status === 'open' ? 'باز' : 'بسته'}</span>
                </div>
                <div class="text-sm font-semibold mb-2">${t.subject || ''}</div>
                <div class="space-y-2 max-h-44 overflow-auto">
                  ${(Array.isArray(t.messages) ? t.messages : (utils && utils.safeJSONParse ? utils.safeJSONParse(t.messages, []) : [])).map(m => `
                    <div class="text-xs ${m.from === 'user' ? 'text-white/80' : 'text-emerald-300'}">
                      <span class="font-bold">${m.from === 'user' ? 'شما' : 'مدیر'}:</span>
                      <span>${m.text}</span>
                      <span class="text-white/30"> - ${utils && utils.formatDateTime ? utils.formatDateTime(m.at) : (m.at || '')}</span>
                    </div>
                  `).join('')}
                </div>
                ${t.status === 'open' ? `
                  <form class="mt-3" onsubmit="event.preventDefault(); replyTicket('${t.id}', this.reply.value); this.reset();">
                    <div class="flex gap-2">
                      <input name="reply" class="flex-1 input-style" placeholder="پاسخ شما..." required>
                      <button class="btn-ghost px-4 rounded-xl" type="submit">ارسال</button>
                    </div>
                  </form>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>

      </main>

      ${typeof renderFooter === 'function' ? renderFooter() : ''}
    `;
  }

  // اکسپورت‌ها
  window.renderProfilePage = renderProfilePage;
  window.navigate = navigate;
  window.logoutUser = logoutUser;

  // ابزار
  window.numericMask = numericMask;

  // پروفایل
  window.updateUserProfile = updateUserProfile;
  window.handleAvatarUpload = handleAvatarUpload;

  // آدرس‌ها
  window.addAddressFromForm = addAddressFromForm;
  window.openEditAddressModal = openEditAddressModal;
  window.saveEditedAddress = saveEditedAddress;
  window.deleteAddress = deleteAddress;

  // علاقه‌مندی
  window.removeWishlist = removeWishlist;

  // تیکت‌ها
  window.createTicketUser = createTicketUser;
  window.replyTicket = replyTicket;

  // وضعیت سفارش‌ها
  window.getStatusInfo = window.getStatusInfo || getStatusInfo;
})();