// ═══════════════════════════════════════════════════════════════
// HEADER COMPONENT
// File: assets/js/header component.js
// ═══════════════════════════════════════════════════════════════
(function () {
  function ensureHeaderStyles() {
    if (document.getElementById('gpt5-header-styles')) return;
    const css = `
      .gpt5-drawer {
        background:
          radial-gradient(900px 500px at 95% 5%, rgba(86,125,255,0.22) 0%, rgba(0,0,0,0) 40%),
          radial-gradient(700px 500px at 10% 95%, rgba(0,210,255,0.16) 0%, rgba(0,0,0,0) 45%),
          linear-gradient(180deg, rgba(16,18,24,0.92) 0%, rgba(16,18,24,0.88) 55%, rgba(16,18,24,0.95) 100%);
        backdrop-filter: blur(26px) saturate(160%);
        border-left: 1px solid rgba(255,255,255,0.12);
        box-shadow: -14px 0 36px rgba(0,0,0,0.45);
        color:#fff;
      }
      .gpt5-drawer-link {
        width:100%; text-align:right; color:rgba(255,255,255,0.95);
        padding:10px 12px; border-radius:12px; border:1px solid transparent;
        transition: background 160ms ease, border-color 160ms ease;
      }
      .gpt5-drawer-link:hover { background: rgba(255,255,255,0.10); }
      .gpt5-drawer-link:active { background: rgba(255,255,255,0.18); border-color: rgba(255,255,255,0.14); }

      .gpt5-dd {
        overflow:hidden;
        max-height:0;
        opacity:0;
        margin-top:0;
        transition:max-height 260ms ease, opacity 260ms ease, margin-top 260ms ease;
      }
      .gpt5-dd.open {
        max-height:1000px;
        opacity:1;
        margin-top:6px;
      }
      .gpt5-dd-inner {
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.06);
        border-radius: 14px; padding: 6px;
      }
      .gpt5-dd-item {
        width:100%; text-align:right; color:rgba(255,255,255,0.92);
        padding:9px 10px; border-radius:10px; transition: background 160ms ease;
      }
      .gpt5-dd-item:hover { background: rgba(255,255,255,0.10); }
      .gpt5-dd-item:active { background: rgba(255,255,255,0.18); }

      /* SEARCH FLOATING BAR */
      .gpt5-search-wrap {
        position: relative;
        height: 0;
        overflow: visible;
        z-index: 40;
      }
      .gpt5-search-shell {
        position: absolute;
        top: 0;
        right: 0;
        left: 0;
        display: flex;
        justify-content: center;
        pointer-events: none;
        transform: translateY(-18px);
        opacity: 0;
        transition:
          transform 260ms cubic-bezier(0.4,0,0.2,1),
          opacity 220ms ease;
      }
      .gpt5-search-shell.open {
        transform: translateY(8px);
        opacity: 1;
        pointer-events: auto;
      }
      .gpt5-search {
        background: rgba(20,20,24,0.9);
        border: 1px solid rgba(255,255,255,0.14);
        backdrop-filter: blur(20px) saturate(140%);
        box-shadow: 0 18px 40px rgba(0,0,0,0.45);
        color: #fff;
        border-radius: 18px;
        padding: 10px 12px;
        width: 100%;
        max-width: 720px;
      }
      .gpt5-search-inner {
        position: relative;
      }
      .gpt5-search-input {
        width:100%;
        color:#fff;
        background: rgba(255,255,255,0.08);
        border:1px solid rgba(255,255,255,0.14);
        border-radius:12px;
        padding:12px 46px 12px 104px;
        outline:none;
        transition: all 0.22s ease;
        font-size: 0.92rem;
      }
      .gpt5-search-input::placeholder { color: rgba(255,255,255,0.55); }
      .gpt5-search-input:hover {
        background: rgba(255,255,255,0.12);
        border-color: rgba(255,255,255,0.22);
      }
      .gpt5-search-input:focus {
        border-color:#5cd2f6;
        box-shadow:0 0 0 3px rgba(92,210,246,0.35);
        background: rgba(255,255,255,0.10);
      }
      .gpt5-search-icon {
        position:absolute;
        right:14px;
        top:50%;
        transform:translateY(-50%);
        font-size:1.2rem;
        color:rgba(255,255,255,0.75);
      }
      .gpt5-search-btn {
        position:absolute;
        left:10px;
        top:50%;
        transform:translateY(-50%);
        padding:9px 16px;
        border-radius:11px;
        background: linear-gradient(135deg,#2a8dff,#005aff);
        box-shadow: 0 4px 14px rgba(37,99,235,0.55);
        font-size:0.85rem;
        font-weight:600;
        transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
        white-space: nowrap;
      }
      .gpt5-search-btn:hover {
        background: linear-gradient(135deg,#3b82f6,#2563eb);
        box-shadow: 0 7px 20px rgba(37,99,235,0.65);
        transform: translateY(-50%) translateY(-1px);
      }
      .gpt5-search-btn:active {
        box-shadow: 0 3px 10px rgba(37,99,235,0.5);
        transform: translateY(-50%) translateY(0);
      }

      .gpt5-badge {
        position:absolute; top:-6px; right:-6px; min-width:20px; height:20px; padding:0 4px;
        font-size:12px; line-height:20px; color:#fff; text-align:center; border-radius:999px;
        background: linear-gradient(180deg,#ff4d8d,#ff2f6f); box-shadow: 0 6px 16px rgba(255,70,130,0.45);
      }

      /* MOBILE MENU (بدون رندر، فقط کلاس) */
      .mobile-menu {
        position:fixed;
        inset:0;
        z-index:60;
        display:flex;
        pointer-events:none;
        opacity:0;
        transition:opacity 220ms ease;
      }
      .mobile-menu.open {
        pointer-events:auto;
        opacity:1;
      }

      @media (max-width:640px){
        .gpt5-search-input{
          padding-left: 96px;
          font-size: 0.85rem;
        }
        .gpt5-search-btn{
          padding:8px 14px;
          font-size:0.8rem;
        }
      }

      @media (max-width:480px){ .gpt5-drawer-w{width:86vw;} }
      @media (min-width:481px) and (max-width:768px){ .gpt5-drawer-w{width:72vw;} }
      @media (min-width:769px){ .gpt5-drawer-w{width:58vw;} }
    `;
    const style = document.createElement('style');
    style.id = 'gpt5-header-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function navigate(page) {
    goTo(page);
    setTimeout(() => {
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
    }, 0);
  }

  // فقط کلاس منو را عوض می‌کند، بدون render
  function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    if (!menu) return;
    menu.classList.toggle('open');
  }

  // فقط کلاس دسته‌بندی سایدبار را عوض می‌کند، بدون render
  function toggleSidebarCategories() {
    const cats = document.getElementById('mobileCats');
    if (!cats) return;
    cats.classList.toggle('open');
  }

  // فقط کلاس نوار سرچ را عوض می‌کند، بدون render
  function toggleSearchBar() {
    const shell = document.querySelector('.gpt5-search-shell');
    const btn = document.getElementById('searchToggleBtn');
    if (!shell) return;
    shell.classList.toggle('open');
    if (btn) btn.textContent = shell.classList.contains('open') ? '✕' : '🔍';
  }

  function applySearch() {
    const input = document.getElementById('header-search');
    if (!input) return;
    state.productFilter.search = input.value || '';
    navigate('shop');
  }

  function handleSearchKey(e) {
    if (e.key === 'Enter') applySearch();
  }

  function renderHeader() {
    ensureHeaderStyles();

    const cartCount = typeof getCartCount === 'function'
      ? getCartCount()
      : (state.cart?.length || 0);

    const headerHTML = `
      <header class="glass-dark sticky top-0 z-50 border-b border-white/5">
        <div class="max-w-7xl mx-auto px-4 lg:px-8">
          <div class="flex items-center justify-between h-16 lg:h-20 relative">
            
            <!-- Logo -->
            <button onclick="navigate('home')" class="flex items-center gap-3 group" type="button">
              <img src="assets/img/logo/logo.png" alt="Logo" class="w-10 h-10 object-contain">
              <span class="font-black text-lg lg:text-xl gradient-text hidden sm:block">${config.store_name}</span>
            </button>
            
            <!-- Desktop Navigation -->
            <nav class="hidden lg:flex items-center gap-8">
              <button onclick="navigate('home')" class="text-white/80 hover:text-white text-sm font-medium transition-colors ${state.page==='home'?'text-white':''}" type="button">خانه</button>
              <button onclick="navigate('shop')" class="text-white/80 hover:text-white text-sm font-medium transition-colors ${state.page==='shop'?'text-white':''}" type="button">فروشگاه</button>
              
              <!-- Categories Dropdown -->
              <div class="relative group">
                <button class="text-white/80 text-sm font-medium flex items-center gap-1.5 glass-dark px-3 py-2 rounded-xl" type="button">
                  دسته‌بندی‌ها
                  <svg class="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
                <div class="absolute top-full right-0 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <div class="rounded-2xl p-3 min-w-[260px] shadow-2xl bg-gray-900/95 border border-white/15">
                    ${(state.categories || []).map(cat => `
                      <button onclick="state.productFilter.category='${cat.id}'; navigate('shop')" class="w-full text-right px-4 py-2.5 rounded-xl text-sm hover:bg-white/10 flex items-center gap-3 transition-colors" type="button">
                        <span class="text-lg">${cat.icon||''}</span>
                        <span>${cat.title}</span>
                      </button>
                    `).join('')}
                  </div>
                </div>
              </div>
            </nav>
            
            <!-- Actions -->
            <div class="flex items-center gap-2 lg:gap-4">
              <!-- Search toggle -->
              <button
                id="searchToggleBtn"
                onclick="toggleSearchBar()"
                class="p-2.5 lg:p-3 glass rounded-xl hover:bg-white/10"
                aria-label="جستجو"
                type="button"
              >
                🔍
              </button>

              <!-- Cart -->
              <button onclick="navigate('cart')" class="relative p-2.5 lg:p-3 glass rounded-xl hover:bg-white/10" aria-label="سبد خرید" type="button">
                🛒
                ${cartCount>0?`<span class="absolute -top-1 -right-1 gpt5-badge">${cartCount>99?'99+':cartCount}</span>`:''}
              </button>

              <!-- Profile / Admin -->
              ${state.user?`
                <button onclick="navigate('profile')" class="p-2.5 lg:p-3 glass rounded-xl hover:bg-white/10" aria-label="پروفایل" type="button">👤</button>
                ${state.isAdmin?`<button onclick="navigate('admin')" class="p-2.5 lg:p-3 glass rounded-xl hover:bg-white/10" aria-label="مدیریت" type="button">⚙️</button>`:''}
                <button onclick="logout()" class="hidden lg:flex items-center gap-2 px-5 py-2.5 glass rounded-xl text-rose-400 hover:bg-rose-500/10" type="button">خروج</button>
              `:`
                <button onclick="navigate('login')" class="btn-primary px-4 lg:px-6 py-2 rounded-xl" type="button">ورود</button>
              `}

              <!-- Hamburger (mobile/tablet) -->
              <button onclick="toggleMenu()" class="lg:hidden p-2.5 glass rounded-xl hover:bg-white/10" aria-label="منو" type="button">
                ☰
              </button>
            </div>
          </div>
        </div>

        <!-- Floating Search (بدون رندر مجدد) -->
        <div class="gpt5-search-wrap">
          <div class="gpt5-search-shell">
            <div class="gpt5-search">
              <div class="gpt5-search-inner">
                <span class="gpt5-search-icon">🔍</span>
                <input
                  id="header-search"
                  type="text"
                  placeholder="جستجوی محصولات..."
                  class="gpt5-search-input"
                  onkeydown="handleSearchKey(event)"
                >
                <button
                  class="gpt5-search-btn"
                  onclick="applySearch()"
                  type="button"
                >
                  جستجو
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Mobile/Tablet Sidebar (همیشه در DOM، فقط کلاس open) -->
      <div id="mobileMenu" class="mobile-menu">
        <div class="gpt5-drawer gpt5-drawer-w ml-auto h-full p-5 sm:p-6 flex flex-col gap-2">
          <div class="flex items-center justify-between mb-3 sm:mb-4">
            <span class="font-bold text-white text-base sm:text-lg">${config.store_name}</span>
            <button onclick="toggleMenu()" class="p-2 rounded-lg hover:bg-white/10 text-white/90" aria-label="بستن" type="button">✕</button>
          </div>

          <button onclick="navigate('home'); toggleMenu();" class="gpt5-drawer-link" type="button">خانه</button>
          <button onclick="navigate('shop'); toggleMenu();" class="gpt5-drawer-link" type="button">فروشگاه</button>

          <div class="mt-1">
            <button onclick="toggleSidebarCategories()" class="gpt5-drawer-link flex items-center justify-between" type="button">
              <span>دسته‌بندی‌ها</span>
              <span>▼</span>
            </button>
            <div id="mobileCats" class="gpt5-dd">
              <div class="gpt5-dd-inner">
                ${(state.categories || []).map(cat => `
                  <button onclick="state.productFilter.category='${cat.id}'; navigate('shop'); toggleMenu();" class="gpt5-dd-item" type="button">${cat.title}</button>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="mt-3 border-t border-white/10"></div>

          <div class="flex items-center gap-2 mt-3">
            <button onclick="toggleSearchBar(); toggleMenu();" class="gpt5-drawer-link" style="width:auto;" type="button">🔍 جستجو</button>
            ${state.user?`
              <button onclick="navigate('profile'); toggleMenu();" class="gpt5-drawer-link" style="width:auto;" type="button">👤 پروفایل</button>
              ${state.isAdmin?`<button onclick="navigate('admin'); toggleMenu();" class="gpt5-drawer-link" style="width:auto;" type="button">⚙️ مدیریت</button>`:''}
            `:''}
          </div>
        </div>

        <button onclick="toggleMenu()" class="flex-1 bg-black/40" aria-label="بستن" type="button"></button>
      </div>
    `;

    return headerHTML;
  }

  window.renderHeader = renderHeader;
  window.navigate = navigate;
  window.toggleMenu = toggleMenu;
  window.toggleSidebarCategories = toggleSidebarCategories;
  window.toggleSearchBar = toggleSearchBar;
  window.applySearch = applySearch;
  window.handleSearchKey = handleSearchKey;
})();