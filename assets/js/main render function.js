// ═══════════════════════════════════════════════════════════════
// MAIN RENDER FUNCTION (GPT‑5 FINAL)
// - Global login restore from AppState
// - Batched render with rAF
// - Safe compose + error boundary
// - View transitions (optional)
// ═══════════════════════════════════════════════════════════════

(function () {
  // ---------- Global login restore (before any render) ----------
  (function restoreLoginGlobal() {
    const saved = (window.AppState ? AppState.get() : {}) || {};

    if (saved.loggedIn === true && saved.currentUser) {
      state.currentUser = saved.currentUser;
      state.user        = saved.user;
      state.isAdmin     = saved.isAdmin || false;
    } else {
      state.currentUser = null;
      state.user        = null;
      state.isAdmin     = false;
    }
  })();

  // ---------- Mount points ----------
  const MOUNT = {
    app: '#app'
  };

  // ---------- Internal state for renderer ----------
  let isScheduled = false;
  let lastHTML = '';
  let lastPage = null;

  // ---------- Safe runner ----------
  function safe(fn, fallback = '') {
    try { return fn(); } catch (err) {
      console.error('[Render Error]', err);
      return `
        <div class="max-w-lg mx-auto p-6 glass rounded-2xl mt-8">
          <div class="text-4xl mb-3">⚠️</div>
          <h2 class="font-bold mb-2">خطا در رندر صفحه</h2>
          <p class="text-white/70 text-sm">لطفاً دوباره تلاش کنید یا صفحه را رفرش کنید.</p>
        </div>
      `;
    }
  }

  // ---------- Compose whole page ----------
  function composePage() {
    const mainHTML = safe(() => {
      if (state.isAdmin && state.page === 'admin') {
        return renderAdminPanel();
      }
      switch (state.page) {
        case 'home':    return renderHomePage();
        case 'shop':    return renderShopPage();
        case 'product': return renderProductPage();
        case 'cart':    return renderCartPage();
        case 'checkout':return renderCheckoutPage();
        case 'login':   return renderLoginPage();
        case 'profile': return renderProfilePage();
        default:        return renderHomePage();
      }
    });

    const overlays = [
      state.confirmModal != null ? safe(() => renderConfirmModal()) : '',
      state.editProduct  != null ? safe(() => renderProductModal()) : ''
    ].join('');

    return mainHTML + overlays;
  }

  // ---------- DOM writer with optional view transitions ----------
  function writeHTML(root, html) {
    const supportsViewTransition =
      document.startViewTransition &&
      document.documentElement.classList.contains('view-transition');

    if (supportsViewTransition && lastPage !== state.page) {
      document.startViewTransition(() => {
        root.innerHTML = html;
      });
    } else {
      root.innerHTML = html;
    }
  }

  // ---------- Core render (batched with rAF) ----------
  function doRender() {
    isScheduled = false;

    const appEl = document.querySelector(MOUNT.app);
    if (!appEl) {
      console.warn('[Render] mount element not found:', MOUNT.app);
      return;
    }

    const html = composePage();

    if (html === lastHTML) return;

    writeHTML(appEl, html);
    lastHTML = html;
    lastPage = state.page;

    if (state.prevPage !== state.page) {
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
    }
  }

  // ---------- Public render (schedule) ----------
  function render() {
    if (isScheduled) return;
    isScheduled = true;
    requestAnimationFrame(doRender);
  }

  // ---------- Expose ----------
  window.render = render;

  // ---------- Initial render ----------
  render();

  // ---------- Optional: subscribe to AppState ----------
  if (window.AppState && typeof window.AppState.subscribe === 'function') {
    window.AppState.subscribe(() => render());
  }

  // ---------- Enable view transitions from CSS flag ----------
  try {
    if (CSS && CSS.supports && CSS.supports('view-transition-name: x')) {
      document.documentElement.classList.add('view-transition');
    }
  } catch {}
})();