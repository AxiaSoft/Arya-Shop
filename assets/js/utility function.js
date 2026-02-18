// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// File: assets/js/utility functions.js
// ═══════════════════════════════════════════════════════════════
const utils = {
  // Numbers
  formatNumberFa: (n = 0) => new Intl.NumberFormat('fa-IR').format(n || 0),

  // Price
  formatPrice: (price) => {
    const p = Number.isFinite(price) ? price : 0;
    return `${new Intl.NumberFormat('fa-IR').format(p)} تومان`;
  },
  formatPriceShort: (price) => {
    const p = Number.isFinite(price) ? price : 0;
    if (p >= 1_000_000) return `${utils.formatNumberFa(Math.floor(p / 1_000_000))} میلیون`;
    if (p >= 1_000) return `${utils.formatNumberFa(Math.floor(p / 1_000))} هزار`;
    return utils.formatNumberFa(p);
  },

  // Date & time
  formatDate: (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })
        .format(new Date(dateStr));
    } catch { return '-'; }
  },
  formatDateTime: (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      }).format(new Date(dateStr));
    } catch { return '-'; }
  },
  formatTime: (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' })
        .format(new Date(dateStr));
    } catch { return ''; }
  },

  // IDs & tokens
  generateId: () => Date.now().toString(36) + Math.random().toString(36).substring(2, 10),
  generateOtp: () => String(Math.floor(1000 + Math.random() * 9000)),

  // Phone (Iran)
  normalizePhone: (phone = '') => phone.replace(/\D/g, '').replace(/^(\+?98|0098)/, '0'),
  isValidPhone: (phone) => /^09[0-9]{9}$/.test(utils.normalizePhone(phone)),

  // Order status info
  getStatusInfo: (status) => {
    const statuses = {
      pending: { label: 'در انتظار تایید', badge: 'badge-pending', icon: '⏳' },
      processing: { label: 'در حال پردازش', badge: 'badge-processing', icon: '⚙️' },
      shipped: { label: 'ارسال شده', badge: 'badge-shipped', icon: '🚚' },
      delivered: { label: 'تحویل داده شده', badge: 'badge-delivered', icon: '✅' }
    };
    return statuses[status] || statuses.pending;
  },

  // Discount
  calculateDiscount: (original, current) => {
    const o = Number(original);
    const c = Number(current);
    if (!Number.isFinite(o) || o <= 0) return 0;
    if (!Number.isFinite(c) || c <= 0) return 0;
    if (c >= o) return 0;
    return Math.round(((o - c) / o) * 100);
  },

  // Totals (cart/order)
  calculateTotals: (items = [], shipping = 0) => {
    const subtotal = items.reduce((sum, it) => sum + (Number(it.price) * Number(it.qty || 1)), 0);
    const total = subtotal + (Number(shipping) || 0);
    return { subtotal, shipping: Number(shipping) || 0, total };
  },

  // Stars
  renderStars: (rating = 0, size = 'text-sm') => {
    const r = Math.max(0, Math.min(5, Number(rating) || 0));
    const full = Math.floor(r);
    const half = r - full >= 0.5;
    let html = '';
    for (let i = 0; i < 5; i++) {
      if (i < full) html += `<span class="star ${size}">★</span>`;
      else if (i === full && half) html += `<span class="star-half ${size}">⯨</span>`;
      else html += `<span class="star-empty ${size}">☆</span>`;
    }
    return html;
  },

  // Async & timing
  debounce: (func, wait) => {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },
  throttle: (func, wait) => {
    let last = 0, timer;
    return function (...args) {
      const now = Date.now();
      const remaining = wait - (now - last);
      if (remaining <= 0) {
        clearTimeout(timer);
        last = now;
        func.apply(this, args);
      } else if (!timer) {
        timer = setTimeout(() => {
          last = Date.now();
          timer = null;
          func.apply(this, args);
        }, remaining);
      }
    };
  },

  // Storage helpers
  safeJSONParse: (str, fallback = null) => {
    try { return JSON.parse(str); } catch { return fallback; }
  },
  saveLocal: (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
  loadLocal: (key, fallback = null) => {
    try { return utils.safeJSONParse(localStorage.getItem(key), fallback); } catch { return fallback; }
  },

  // Strings
  clamp: (val, min, max) => Math.min(max, Math.max(min, val)),
  pluralFa: (n, singular, plural) => (Number(n) === 1 ? singular : plural),
  slugify: (text) => String(text || '')
    .trim()
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-'),

  // Objects
  mergeDeep: (target, source) => {
    if (typeof target !== 'object' || target === null) return source;
    if (typeof source !== 'object' || source === null) return source;
    const out = Array.isArray(target) ? [...target] : { ...target };
    for (const key of Object.keys(source)) {
      const val = source[key];
      out[key] = (typeof val === 'object' && val !== null)
        ? utils.mergeDeep(out[key], val)
        : val;
    }
    return out;
  },

  // Images (avatar/product)
  readImageAsDataUrl: (file) => new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  }),
  validateImageFile: (file, { maxSizeMB = 5, types = ['image/jpeg', 'image/png', 'image/webp'] } = {}) => {
    if (!file) return { ok: false, error: 'No file' };
    const okType = types.includes(file.type);
    const okSize = file.size <= maxSizeMB * 1024 * 1024;
    return { ok: okType && okSize, error: okType ? (okSize ? null : 'حجم فایل بالا است') : 'نوع فایل نامعتبر' };
  },

  // Notifications
  pushNotification: (msg, type = 'info') => {
    const note = { id: utils.generateId(), msg, type, at: new Date().toISOString() };
    state.notifications = [note, ...state.notifications].slice(0, 50);
    render?.();
    return note;
  },

  // Smooth scroll top
  scrollTop: (behavior = 'smooth') => window.scrollTo({ top: 0, behavior })
};