// ═══════════════════════════════════════════════════════════════
// SHOP PAGE (GPT‑5 FINAL)
// - فیلتر بدون رندر کامل، فقط آپدیت گرید
// - بازه قیمت: حداقل ثابت بر اساس دسته، فقط حداکثر با اسلایدر
// - مرتب‌سازی و دسته‌بندی با دکمه‌های active بدون تکان خوردن صفحه
// ═══════════════════════════════════════════════════════════════

function toggleFilterSidebar() {
  const sidebar = document.getElementById('shop-filter-sidebar');
  if (!sidebar) return;
  sidebar.classList.toggle('open');
}

// بر اساس state.productFilter، لیست محصولات فیلتر و مرتب می‌شود
function getFilteredProducts() {
  const products = state.products || [];
  let filteredProducts = [...products];

  if (state.productFilter.category) {
    filteredProducts = filteredProducts.filter(
      p => p.category === state.productFilter.category
    );
  }

  if (state.productFilter.search) {
    const s = (state.productFilter.search || '').toLowerCase();
    filteredProducts = filteredProducts.filter(
      p =>
        (p.title || '').toLowerCase().includes(s) ||
        (p.description || '').toLowerCase().includes(s)
    );
  }

  if (state.productFilter.minPrice) {
    filteredProducts = filteredProducts.filter(
      p => Number(p.price) >= Number(state.productFilter.minPrice)
    );
  }
  if (state.productFilter.maxPrice) {
    filteredProducts = filteredProducts.filter(
      p => Number(p.price) <= Number(state.productFilter.maxPrice)
    );
  }

  switch (state.productFilter.sort) {
    case 'price-low':
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case 'popular':
      filteredProducts.sort((a, b) => (b.sales || 0) - (a.sales || 0));
      break;
    case 'newest':
    default:
      filteredProducts.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
  }

  return filteredProducts;
}

// فقط HTML بخش محصولات (گرید یا حالت خالی)
function renderShopProductsOnly() {
  const filteredProducts = getFilteredProducts();

  if (filteredProducts.length > 0) {
    return `
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        ${filteredProducts.map((p, i) => renderProductCard(p, i)).join('')}
      </div>
    `;
  }

  return `
    <div class="glass rounded-3xl p-16 text-center">
      <div class="text-7xl mb-6">🔍</div>
      <h3 class="text-2xl font-bold mb-3">محصولی یافت نشد</h3>
      <p class="text-white/60 mb-6">فیلترهای جستجو را تغییر دهید</p>
      <button
        onclick="state.productFilter={category:'',search:'',sort:'newest',minPrice:'',maxPrice:''}; updateShopProductsOnly(true); updateSortButtonsUI(); updateCategoryButtonsUI()"
        class="btn-primary px-8 py-3 rounded-xl font-semibold"
        type="button"
      >پاک کردن فیلترها</button>
    </div>
  `;
}

// آپدیت فقط گرید محصولات + تعداد + در صورت نیاز اسلایدر
function updateShopProductsOnly(resetSliders = false) {
  const container = document.getElementById('shop-products-container');
  if (!container) return;

  container.innerHTML = renderShopProductsOnly();

  const countEl = document.getElementById('shop-products-count');
  if (countEl) {
    const filteredProducts = getFilteredProducts();
    countEl.textContent = `${filteredProducts.length} محصول`;
  }

  if (resetSliders) {
    const products = state.products || [];
    const baseList = state.productFilter.category
      ? products.filter(p => p.category === state.productFilter.category)
      : products;

    const prices = baseList.map(p => Number(p.price) || 0);
    if (prices.length > 0) {
      const autoMinPrice = Math.min(...prices);
      const autoMaxPrice = Math.max(...prices);

      const maxEl = document.getElementById('priceMax');
      const maxLabel = document.getElementById('priceMaxLabel');

      if (maxEl) maxEl.value = autoMaxPrice;
      if (maxLabel) maxLabel.innerText = utils.formatPrice(autoMaxPrice);

      state.productFilter.minPrice = autoMinPrice;
      state.productFilter.maxPrice = autoMaxPrice;
    } else {
      state.productFilter.minPrice = '';
      state.productFilter.maxPrice = '';
    }
  }
}

// دکمه‌های مرتب‌سازی را بر اساس state.productFilter.sort فعال/غیرفعال می‌کند
function updateSortButtonsUI() {
  document.querySelectorAll(".sort-btn").forEach(btn => {
    const val = btn.getAttribute("data-sort");

    if (val === state.productFilter.sort) {
      btn.classList.add(
        "bg-emerald-500/20",
        "text-emerald-400",
        "border",
        "border-emerald-500/50"
      );
      btn.classList.remove("bg-white/5", "text-white/60");
    } else {
      btn.classList.remove(
        "bg-emerald-500/20",
        "text-emerald-400",
        "border",
        "border-emerald-500/50"
      );
      btn.classList.add("bg-white/5", "text-white/60");
    }
  });
}

// دکمه‌های دسته‌بندی را بر اساس state.productFilter.category فعال/غیرفعال می‌کند
function updateCategoryButtonsUI() {
  document.querySelectorAll(".cat-btn").forEach(btn => {
    const val = btn.getAttribute("data-category");

    const isActive =
      (val && val === state.productFilter.category) ||
      (!val && !state.productFilter.category);

    if (isActive) {
      btn.classList.add("bg-violet-500", "text-white", "shadow-lg");
      btn.classList.remove("glass", "hover:bg-white/10", "text-white/60");
    } else {
      btn.classList.remove("bg-violet-500", "text-white", "shadow-lg");
      btn.classList.add("glass", "hover:bg-white/10");
    }
  });
}

// اسلایدر قیمت: فقط حداکثر قیمت را تغییر می‌دهد
function updatePriceSlider() {
  const maxEl = document.getElementById('priceMax');
  if (!maxEl) return;

  const max = Number(maxEl.value);

  state.productFilter.maxPrice = max;

  const maxLabel = document.getElementById('priceMaxLabel');
  if (maxLabel) maxLabel.innerText = utils.formatPrice(max);

  updateShopProductsOnly();
}

function renderShopPage() {
  const products = state.products || [];

  // بازه قیمت بر اساس دسته فعال
  const baseList = state.productFilter.category
    ? products.filter(p => p.category === state.productFilter.category)
    : products;

  const prices = baseList.map(p => Number(p.price) || 0);

  let autoMinPrice = 0;
  let autoMaxPrice = 0;

  if (prices.length > 0) {
    autoMinPrice = Math.min(...prices);
    autoMaxPrice = Math.max(...prices);
  }

  // حداقل قیمت همیشه ثابت (بر اساس دسته/کل)
  state.productFilter.minPrice = autoMinPrice || 0;

  const filteredProducts = getFilteredProducts();

  const activeCategory = state.categories.find(
    c => c.id === state.productFilter.category
  );

  const html = `
    ${renderHeader()}
    
    <main class="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
      <!-- Page Header -->
      <div class="mb-8">
        <nav class="flex items-center gap-2 text-sm text-white/60 mb-4">
          <button onclick="goTo('home')" class="hover:text-white transition-colors" type="button">خانه</button>
          <span>←</span>
          <span class="text-white">فروشگاه</span>
          ${
            activeCategory
              ? `<span>←</span><span class="text-white">${activeCategory.title}</span>`
              : ''
          }
        </nav>
        <div class="flex items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl lg:text-4xl font-black">
              ${activeCategory ? activeCategory.title : 'همه محصولات'}
            </h1>
            <p class="text-white/60 mt-2" id="shop-products-count">${filteredProducts.length} محصول</p>
          </div>
          <button
            onclick="toggleFilterSidebar()"
            class="btn-primary px-4 py-2 rounded-xl font-semibold"
            type="button"
          >
            فیلترها
          </button>
        </div>
      </div>

      <!-- FILTER SIDEBAR (INDEPENDENT, NO RENDER TOGGLE) -->
      <div id="shop-filter-sidebar" class="shop-filter-sidebar">
        <div class="shop-filter-inner">
          <div class="flex items-center justify-between mb-6">
            <h3 class="font-bold text-lg">فیلتر محصولات</h3>
            <button onclick="toggleFilterSidebar()" class="text-white/60 hover:text-white" type="button">✖️</button>
          </div>

          <!-- Search -->
          <div class="mb-6">
            <div class="relative">
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-xl">🔍</span>
              <input 
                type="text"
                placeholder="جستجوی محصول..."
                value="${state.productFilter.search}"
                oninput="state.productFilter.search=this.value; updateShopProductsOnly()"
                class="w-full input-style pr-14"
              >
            </div>
          </div>

          <!-- Categories -->
          <div class="mb-6">
            <h4 class="text-sm text-white/70 mb-3">دسته‌بندی</h4>
            <div class="flex flex-wrap gap-2">
              <button 
                data-category=""
                onclick="state.productFilter.category=''; updateShopProductsOnly(true); updateCategoryButtonsUI()"
                class="cat-btn px-4 py-2.5 rounded-xl text-sm font-medium ${
                  !state.productFilter.category
                    ? 'bg-violet-500 text-white shadow-lg'
                    : 'glass hover:bg-white/10'
                }"
                type="button"
              >همه</button>

              ${(state.categories || [])
                .map(
                  cat => `
                <button 
                  data-category="${cat.id}"
                  onclick="state.productFilter.category='${cat.id}'; updateShopProductsOnly(true); updateCategoryButtonsUI()"
                  class="cat-btn px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 ${
                    state.productFilter.category === cat.id
                      ? 'bg-violet-500 text-white shadow-lg'
                      : 'glass hover:bg-white/10'
                  }"
                  type="button"
                >
                  <span>${cat.icon || cat.title}</span>
                  <span class="hidden sm:inline">${cat.title}</span>
                </button>
              `
                )
                .join('')}
            </div>
          </div>

          <!-- Sort -->
          <div class="mb-6">
            <h4 class="text-sm text-white/70 mb-3">مرتب‌سازی</h4>
            <div class="flex flex-wrap gap-2">
              ${[
                { value: 'newest', label: 'جدیدترین' },
                { value: 'popular', label: 'پرفروش' },
                { value: 'price-low', label: 'ارزان‌ترین' },
                { value: 'price-high', label: 'گران‌ترین' }
              ]
                .map(
                  opt => `
                <button 
                  data-sort="${opt.value}"
                  onclick="state.productFilter.sort='${opt.value}'; updateShopProductsOnly(); updateSortButtonsUI()"
                  class="sort-btn px-3 py-1.5 rounded-lg text-xs font-medium ${
                    state.productFilter.sort === opt.value
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }"
                  type="button"
                >${opt.label}</button>
              `
                )
                .join('')}
            </div>
          </div>

          <!-- Price (only max slider, min fixed) -->
          ${
            prices.length > 0
              ? `
          <div class="glass rounded-2xl p-4 border border-white/10 mb-6">
            <h4 class="text-sm text-white/70 mb-3">بازه قیمت</h4>

            <input
              type="range"
              id="priceMax"
              min="${autoMinPrice}"
              max="${autoMaxPrice}"
              value="${state.productFilter.maxPrice || autoMaxPrice}"
              oninput="updatePriceSlider()"
              class="w-full"
            >

            <div class="flex justify-between text-white/70 text-sm mt-2">
              <span>${utils.formatPrice(autoMinPrice)}</span>
              <span id="priceMaxLabel">${utils.formatPrice(state.productFilter.maxPrice || autoMaxPrice)}</span>
            </div>
          </div>
          `
              : ''
          }

          <!-- Buttons -->
          <div class="flex gap-2 mt-4">
            <button class="btn-success px-4 py-2 rounded-xl" onclick="toggleFilterSidebar()" type="button">اعمال</button>
            <button
              class="btn-ghost px-4 py-2 rounded-xl"
              onclick="state.productFilter={category:'',search:'',sort:'newest',minPrice:'',maxPrice:''}; updateShopProductsOnly(true); updateSortButtonsUI(); updateCategoryButtonsUI()"
              type="button"
            >پاک‌سازی</button>
          </div>
        </div>
      </div>

      <!-- Products Container (dynamic) -->
      <div id="shop-products-container">
        ${renderShopProductsOnly()}
      </div>
    </main>
    
    ${renderFooter()}
  `;

  // بعد از اولین رندر، مطمئن شو دکمه‌های مرتب‌سازی و دسته‌بندی درست استایل شده‌اند
  setTimeout(() => {
    updateSortButtonsUI();
    updateCategoryButtonsUI();
  }, 0);

  return html;
}