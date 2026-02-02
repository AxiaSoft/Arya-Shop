// ═══════════════════════════════════════════════════════════════
// SHOP PAGE (GPT‑5 FINAL, FILTER SIDEBAR FIXED)
// - سایدبار فیلتر مستقل از منوی همبرگری
// - باز/بسته شدن با کلاس .open (بدون رندر)
// - اسلایدر قیمت + فیلتر دسته، سرچ، مرتب‌سازی
// ═══════════════════════════════════════════════════════════════

function toggleFilterSidebar() {
  const sidebar = document.getElementById('shop-filter-sidebar');
  if (!sidebar) return;
  sidebar.classList.toggle('open');
}

function updatePriceSlider() {
  const minEl = document.getElementById('priceMin');
  const maxEl = document.getElementById('priceMax');
  if (!minEl || !maxEl) return;

  let min = Number(minEl.value);
  let max = Number(maxEl.value);

  if (min > max) {
    [min, max] = [max, min];
    minEl.value = min;
    maxEl.value = max;
  }

  const minLabel = document.getElementById('priceMinLabel');
  const maxLabel = document.getElementById('priceMaxLabel');

  if (minLabel) minLabel.innerText = utils.formatPrice(min);
  if (maxLabel) maxLabel.innerText = utils.formatPrice(max);

  state.productFilter.minPrice = min;
  state.productFilter.maxPrice = max;

  render();
}

function renderShopPage() {
  const products = state.products || [];
  const prices = products.map(p => Number(p.price) || 0);

  let autoMinPrice = 0;
  let autoMaxPrice = 0;

  if (prices.length > 0) {
    autoMinPrice = Math.min(...prices);
    autoMaxPrice = Math.max(...prices);
  }

  let filteredProducts = [...products];

  if (state.productFilter.category) {
    filteredProducts = filteredProducts.filter(
      p => p.category === state.productFilter.category
    );
  }

  if (state.productFilter.search) {
    const s = state.productFilter.search.toLowerCase();
    filteredProducts = filteredProducts.filter(
      p =>
        p.title.toLowerCase().includes(s) ||
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

  const activeCategory = state.categories.find(
    c => c.id === state.productFilter.category
  );

  return `
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
            <p class="text-white/60 mt-2">${filteredProducts.length} محصول</p>
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
                oninput="state.productFilter.search=this.value; render()"
                class="w-full input-style pr-14"
              >
            </div>
          </div>

          <!-- Categories -->
          <div class="mb-6">
            <h4 class="text-sm text-white/70 mb-3">دسته‌بندی</h4>
            <div class="flex flex-wrap gap-2">
              <button 
                onclick="state.productFilter.category=''; render()"
                class="px-4 py-2.5 rounded-xl text-sm font-medium ${
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
                  onclick="state.productFilter.category='${cat.id}'; render()"
                  class="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 ${
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
                  onclick="state.productFilter.sort='${opt.value}'; render()"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium ${
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

          <!-- Price Slider -->
          ${
            prices.length > 0
              ? `
          <div class="glass rounded-2xl p-4 border border-white/10 mb-6">
            <h4 class="text-sm text-white/70 mb-3">بازه قیمت</h4>

            <input
              type="range"
              id="priceMin"
              min="${autoMinPrice}"
              max="${autoMaxPrice}"
              value="${state.productFilter.minPrice || autoMinPrice}"
              oninput="updatePriceSlider()"
              class="w-full mb-3"
            >

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
              <span id="priceMinLabel">${utils.formatPrice(state.productFilter.minPrice || autoMinPrice)}</span>
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
              onclick="state.productFilter={category:'',search:'',sort:'newest',minPrice:'',maxPrice:''}; render()"
              type="button"
            >پاک‌سازی</button>
          </div>
        </div>
      </div>

      <!-- Products Grid -->
      ${
        filteredProducts.length > 0
          ? `
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          ${filteredProducts.map((p, i) => renderProductCard(p, i)).join('')}
        </div>
      `
          : `
        <div class="glass rounded-3xl p-16 text-center">
          <div class="text-7xl mb-6">🔍</div>
          <h3 class="text-2xl font-bold mb-3">محصولی یافت نشد</h3>
          <p class="text-white/60 mb-6">فیلترهای جستجو را تغییر دهید</p>
          <button
            onclick="state.productFilter={category:'',search:'',sort:'newest',minPrice:'',maxPrice:''}; render()"
            class="btn-primary px-8 py-3 rounded-xl font-semibold"
            type="button"
          >پاک کردن فیلترها</button>
        </div>
      `
      }
    </main>
    
    ${renderFooter()}
  `;
}