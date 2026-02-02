// ═══════════════════════════════════════════════════════════════
// GLOBAL STATE MANAGEMENT (GPT‑5 Refactor: persistence + events)
// File: assets/js/global state management.js
// ═══════════════════════════════════════════════════════════════
(function () {
  // ---------- Persistence keys ----------
  const PERSIST_KEYS = [
    'cart',
    'wishlist',
    'user',
    'isAdmin',
    'productFilter',
    'userSettings',
    'notifications'
  ];
  const LS_KEY = 'premium_store_state_v1';

  // ---------- Default state (mirrors current structure) ----------
  const DEFAULT_STATE = {
    // Navigation
    page: 'home',
    prevPage: null,

    // Support & Tickets
    tickets: [],
    supportFilter: { status: '' },
    editCategory: null,

    // Data
    products: [],
    orders: [],
    categories: [],

    // Cart
    cart: [],
    wishlist: [],

    // Auth
    user: null,
    isAdmin: false,
    loginStep: 'phone',
    loginPhone: '',
    generatedOtp: '',
    otpTimer: 0,
    otpInterval: null,

    // Admin
    adminTab: 'dashboard',
    editProduct: null,

    // Filters
    productFilter: {
      category: '',
      search: '',
      sort: 'newest',
      minPrice: '',
      maxPrice: '',
      brand: '',
      color: '',
      size: ''
    },
    orderFilter: { status: '' },

    // UI States
    selectedProduct: null,
    loading: false,
    confirmModal: null,
    mobileMenuOpen: false,
    aiSupportOpen: false,
    notifications: [],

    // Search
    searchOpen: false,
    searchQuery: '',

    // Checkout
    checkoutStep: 'address',
    checkout: {
      address: { fullName: '', phone: '', city: '', addressLine: '', postalCode: '' },
      payment: { method: 'online', gateway: 'demo', paid: false, transactionId: '' },
      summary: { items: [], subtotal: 0, shipping: 0, total: 0 }
    },

    // Reviews
    reviews: [],

    // User settings
    userSettings: { theme: 'dark', language: 'fa', notificationsEnabled: true },

    // Share & SEO
    shareOpen: false,
    metaTags: { title: '', description: '', image: '', url: '' }
  };

  // ---------- Utilities ----------
  const safeJSONParse = (str, fallback) => {
    try { return JSON.parse(str); } catch { return fallback; }
  };
  const clone = (obj) => JSON.parse(JSON.stringify(obj));
  const mergeDeep = (target, source) => {
    if (typeof source !== 'object' || source === null) return target;
    const out = Array.isArray(target) ? [...target] : { ...target };
    for (const k of Object.keys(source)) {
      const v = source[k];
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        out[k] = mergeDeep(out[k] || {}, v);
      } else {
        out[k] = v;
      }
    }
    return out;
  };

  // ---------- Event bus ----------
  const subscribers = new Set();
  const notify = (payload) => {
    subscribers.forEach((fn) => {
      try { fn(payload); } catch {}
    });
    // Non-breaking: existing code هنوز خودش render را صدا می‌زند.
    if (typeof window.render === 'function') {
      // جلوگیری از رندرهای پشت‌سرهم
      clearTimeout(notify._t);
      notify._t = setTimeout(() => window.render(), 0);
    }
  };

  // ---------- Persistence ----------
  const loadPersisted = () => {
    const raw = localStorage.getItem(LS_KEY);
    const saved = safeJSONParse(raw, null);
    if (!saved) return {};

    const restored = {};
    PERSIST_KEYS.forEach((k) => {
      if (k in saved) restored[k] = saved[k];
    });
    return restored;
  };

  const savePersisted = (state) => {
    const data = {};
    PERSIST_KEYS.forEach((k) => { data[k] = state[k]; });
    try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {}
  };

  // Throttled save
  const saveThrottled = (() => {
    let t;
    return (state) => {
      clearTimeout(t);
      t = setTimeout(() => savePersisted(state), 200);
    };
  })();

  // ---------- Create state ----------
  const initial = mergeDeep(clone(DEFAULT_STATE), loadPersisted());
  // توجه: برای سازگاری با کد فعلی، state آبجکت ساده می‌ماند
  window.state = initial;

  // ---------- Public API ----------
  const AppState = {
    // خواندن امن (کپی)
    get() { return clone(window.state); },

    // ادغام بخشی و اعلان
    set(partial) {
      window.state = mergeDeep(window.state, partial);
      saveThrottled(window.state);
      notify({ type: 'state:set', partial });
      return window.state;
    },

    // جایگزینی کامل (با احترام به ساختار پیش‌فرض)
    replace(next) {
      window.state = mergeDeep(clone(DEFAULT_STATE), next || {});
      saveThrottled(window.state);
      notify({ type: 'state:replace' });
      return window.state;
    },

    // ریست به مقدار پیش‌فرض (با پاک‌سازی persisted)
    reset() {
      window.state = clone(DEFAULT_STATE);
      try { localStorage.removeItem(LS_KEY); } catch {}
      notify({ type: 'state:reset' });
      return window.state;
    },

    // مشترک شدن در تغییرات
    subscribe(fn) {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },

    // ذخیره فوری
    persistNow() { savePersisted(window.state); },

    // کمک‌های کاربردی
    setPage(page, data) {
      window.state.prevPage = window.state.page;
      window.state.page = page;
      if (data && page === 'product') window.state.selectedProduct = data;
      saveThrottled(window.state);
      notify({ type: 'nav:page', page, data });
    },

    toggle(key) {
      window.state[key] = !window.state[key];
      saveThrottled(window.state);
      notify({ type: 'state:toggle', key });
    }
  };

  // ---------- Expose ----------
  window.AppState = AppState;

  // ---------- Auto-init notify (first render) ----------
  notify({ type: 'state:init' });
})();