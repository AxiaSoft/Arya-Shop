// ═══════════════════════════════════════════════════════════════
// HOME PAGE
// File: assets/js/home page.js
// ═══════════════════════════════════════════════════════════════

function renderHomePage() {
  const IMAGE_BASE = 'assets/img/photo/';

  const discountedProducts = (state.products || [])
    .filter(p => p.original_price && p.original_price > p.price)
    .slice(0, 8);

  const aboutBlocks = Array.isArray(state.aboutBlocks)
    ? state.aboutBlocks
    : [
        {
          id: 'about1',
          title: 'مجموعه آکسیاسافت',
          text: 'ما در آکسیاسافت روی ساخت فروشگاه‌های مدرن، سریع و امن تمرکز کرده‌ایم تا تجربه خرید لذت‌بخشی بسازیم.',
          image: 'p1.png'
        },
        {
          id: 'about2',
          title: 'تجربه کاربری ممتاز',
          text: 'طراحی رابط کاربری و تجربه کاربری در اولویت ماست تا کاربران بدون سردرگمی به هدف خود برسند.',
          image: 'p2.png'
        },
        {
          id: 'about3',
          title: 'پشتیبانی و توسعه مداوم',
          text: 'سیستم‌ها به صورت مداوم به‌روزرسانی می‌شوند تا همیشه در بالاترین سطح کیفیت و امنیت باقی بمانند.',
          image: 'p3.png'
        }
      ];

  return `
    ${renderHeader()}
    
    <main class="overflow-x-hidden">
      
      <!-- Hero Section (NO WAVE) -->
      <section class="relative overflow-hidden">
        <div class="bg-hero-gradient py-20 lg:py-32 rounded-b-[4rem] lg:rounded-b-[6rem] relative">
          <div class="absolute inset-0 bg-black/20"></div>

          <div class="max-w-7xl mx-auto px-4 lg:px-8 text-center relative z-10">
            <h1 class="text-4xl md:text-5xl lg:text-7xl font-black mb-6 animate-fade-up">
              ${config.hero_title}
            </h1>

            <p class="text-lg lg:text-xl text-white/90 mb-10 max-w-2xl mx-auto animate-fade-up" style="animation-delay:0.1s">
              ${config.hero_subtitle}
            </p>

            <div class="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style="animation-delay:0.2s">
              <button onclick="goTo('shop')" class="btn-primary px-10 py-5 rounded-2xl font-bold text-lg flex items-center gap-3">
                <span>🛍️</span>
                <span>شروع خرید</span>
              </button>

              <button onclick="document.getElementById('features').scrollIntoView({behavior:'smooth'})" class="btn-ghost px-10 py-5 rounded-2xl font-bold text-lg">
                بیشتر بدانید
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="py-8 lg:py-12">
        <div class="max-w-7xl mx-auto px-4 lg:px-8">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">

            <div class="glass rounded-2xl p-5 lg:p-7 text-center card">
              <div class="text-4xl lg:text-5xl mb-3">🚚</div>
              <h3 class="font-bold text-sm lg:text-base mb-1">ارسال رایگان</h3>
              <p class="text-white/50 text-xs lg:text-sm">سفارش بالای ۵۰۰ هزار</p>
            </div>

            <div class="glass rounded-2xl p-5 lg:p-7 text-center card">
              <div class="text-4xl lg:text-5xl mb-3">✅</div>
              <h3 class="font-bold text-sm lg:text-base mb-1">ضمانت اصالت</h3>
              <p class="text-white/50 text-xs lg:text-sm">تضمین کیفیت کالا</p>
            </div>

            <div class="glass rounded-2xl p-5 lg:p-7 text-center card">
              <div class="text-4xl lg:text-5xl mb-3">💳</div>
              <h3 class="font-bold text-sm lg:text-base mb-1">پرداخت امن</h3>
              <p class="text-white/50 text-xs lg:text-sm">درگاه معتبر بانکی</p>
            </div>

            <div class="glass rounded-2xl p-5 lg:p-7 text-center card">
              <div class="text-4xl lg:text-5xl mb-3">💬</div>
              <h3 class="font-bold text-sm lg:text-base mb-1">پشتیبانی ۲۴/۷</h3>
              <p class="text-white/50 text-xs lg:text-sm">همیشه در کنار شما</p>
            </div>

          </div>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="py-12 lg:py-16">
        <div class="max-w-7xl mx-auto px-4 lg:px-8">

          <div class="text-center mb-10">
            <h2 class="text-2xl lg:text-3xl font-black mb-3">دسته‌بندی محصولات</h2>
            <p class="text-white/60">انتخاب بر اساس نیاز شما</p>
          </div>

          <div class="grid grid-cols-3 md:grid-cols-6 gap-4">
            ${(state.categories || [])
              .map(
                (cat, i) => `
              <button 
                onclick="state.productFilter.category='${cat.id}'; goTo('shop')"
                class="glass rounded-2xl p-5 lg:p-6 text-center card animate-fade"
                style="animation-delay:${i * 0.08}s"
              >
                <h3 class="font-semibold text-xs lg:text-sm">${cat.title}</h3>
              </button>
            `
              )
              .join('')}
          </div>

        </div>
      </section>

      <!-- Featured Discount Slider -->
      ${
        discountedProducts.length > 0
          ? `
      <section class="py-12 lg:py-16">
        <div class="max-w-7xl mx-auto px-4 lg:px-8">

          <div class="flex items-center justify-between mb-8 lg:mb-10">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-violet-600 flex items-center justify-center text-xl">%</div>
              <div>
                <h2 class="text-2xl lg:text-3xl font-black">محصولات ویژه</h2>
                <p class="text-white/60 text-sm">تخفیف‌های جذاب امروز</p>
              </div>
            </div>
          </div>

          <div class="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 no-scrollbar">
            ${discountedProducts
              .map(
                p => `
              <div class="snap-center flex-shrink-0 w-64 bg-gradient-to-br from-rose-600 to-violet-700 rounded-3xl p-4 text-white shadow-xl">
                <div class="w-full h-40 rounded-2xl overflow-hidden mb-3">
                  <img src="${p.image}" class="w-full h-full object-cover">
                </div>
                <h3 class="font-bold text-lg mb-1">${p.title}</h3>
                <p class="text-sm opacity-80 mb-2">${utils.formatPrice(p.price)}</p>
                <button onclick="state.selectedProductId='${p.id}'; goTo('product')" class="bg-white/20 px-4 py-2 rounded-xl text-sm">
                  مشاهده
                </button>
              </div>
            `
              )
              .join('')}
          </div>

        </div>
      </section>
      `
          : ''
      }

      <!-- About Section Zigzag with 3D squares -->
      <section class="py-16 lg:py-24">
        <div class="max-w-7xl mx-auto px-4 lg:px-8">

          <h2 class="text-2xl lg:text-3xl font-black text-center mb-12">معرفی مجموعه</h2>

          <div class="space-y-20">
            ${aboutBlocks
              .map(
                (b, i) => `
              <div class="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

                <div class="relative about-image-wrapper flex justify-center ${i % 2 === 1 ? 'md:order-2' : ''}">
                  <div class="about-3d-square square-purple w-24 h-24 -top-6 -left-6"></div>
                  <div class="about-3d-square square-red w-28 h-28 -bottom-6 -right-6"></div>

                  <div class="w-56 h-56 lg:w-72 lg:h-72 rounded-3xl overflow-hidden shadow-2xl relative z-10">
                    <img src="${IMAGE_BASE + b.image}" class="w-full h-full object-cover">
                  </div>
                </div>

                <div class="text-right ${i % 2 === 1 ? 'md:order-1' : ''}">
                  <h3 class="text-xl lg:text-2xl font-black mb-4">${b.title}</h3>
                  <p class="text-white/70 leading-relaxed">${b.text}</p>
                </div>

              </div>
            `
              )
              .join('')}
          </div>

        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-16 lg:py-24">
        <div class="max-w-7xl mx-auto px-4 lg:px-8">

          <div class="bg-hero-gradient rounded-3xl lg:rounded-[2.5rem] p-10 lg:p-20 text-center relative overflow-hidden">
            <div class="absolute inset-0 bg-black/10"></div>

            <div class="relative z-10">
              <h2 class="text-3xl lg:text-5xl font-black mb-5">همین الان خرید کنید!</h2>
              <p class="text-lg lg:text-xl text-white/90 mb-10 max-w-xl mx-auto">
                از تخفیف‌های استثنایی و ارسال رایگان بهره‌مند شوید
              </p>

              <button onclick="goTo('shop')" class="btn-ghost bg-white/10 hover:bg-white/20 px-10 py-5 rounded-2xl font-bold text-lg">
                🛍️ رفتن به فروشگاه
              </button>
            </div>

          </div>

        </div>
      </section>

    </main>

    ${renderFooter()}
  `;
}
