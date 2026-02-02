// ═════════════════   ═════════════════════════════════════════════
// HOME PAGE
// ═══════════════════════════════════════════════════════════════
function renderHomePage() {
  const featuredProducts = state.products.slice(0, 8);
  const popularProducts = [...state.products].sort((a, b) => (b.sales || 0) - (a.sales || 0)).slice(0, 4);
  const discountedProducts = state.products.filter(p => p.original_price && p.original_price > p.price).slice(0, 4);
  
  return `
    ${renderHeader()}
    
    <main>
      <!-- Hero Section -->
      <section class="relative overflow-hidden">
        <div class="bg-hero-gradient py-20 lg:py-32">
          <div class="absolute inset-0 bg-black/20"></div>
          <div class="max-w-7xl mx-auto px-4 lg:px-8 text-center relative z-10">
            <h1 class="text-4xl md:text-5xl lg:text-7xl font-black mb-6 animate-fade-up">
              ${config.hero_title}
            </h1>
            <p class="text-lg lg:text-xl text-white/90 mb-10 max-w-2xl mx-auto animate-fade-up" style="animation-delay: 0.1s">
              ${config.hero_subtitle}
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style="animation-delay: 0.2s">
              <button onclick="goTo('shop')" class="btn-primary px-10 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3">
                <span>🛍️</span>
                <span>شروع خرید</span>
              </button>
              <button onclick="document.getElementById('features').scrollIntoView({behavior:'smooth'})" class="btn-ghost px-10 py-5 rounded-2xl font-bold text-lg">
                بیشتر بدانید
              </button>
            </div>
          </div>
        </div>
        
        <!-- Wave -->
        <div class="h-16 lg:h-24 -mt-1">
          <svg viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none" class="w-full h-full">
            <path d="M0 50C360 0 1080 100 1440 50V100H0V50Z" fill="currentColor" class="text-slate-900"/>
          </svg>
        </div>
      </section>
      
      <!-- Features Section -->
      <section id="features" class="py-8 lg:py-12 -mt-8">
        <div class="max-w-7xl mx-auto px-4 lg:px-8">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div class="glass rounded-2xl p-5 lg:p-7 text-center card">
              <div class="text-4xl lg:text-5xl mb-3 animate-bounce">🚚</div>
              <h3 class="font-bold text-sm lg:text-base mb-1">ارسال رایگان</h3>
              <p class="text-white/50 text-xs lg:text-sm">س  ارش بالای ۵۰۰ هزار</p>
            </div>
            <div class="glass rounded-2xl p-5 lg:p-7 text-center card">
              <div class="text-4xl lg:text-5xl mb-3 animate-bounce" style="animation-delay: 0.1s">✅</div>
              <h3 class="font-bold text-sm lg:text-base mb-1">ضمانت اصالت</h3>
              <p class="text-white/50 text-xs lg:text-sm">تضمین کیفیت کالا</p>
            </div>
            <div class="glass rounded-2xl p-5 lg:p-7 text-center card">
              <div class="text-4xl lg:text-5xl mb-3 animate-bounce" style="animation-delay: 0.2s">💳</div>
              <h3 class="font-bold text-sm lg:text-base mb-1">پرداخت امن</h3>
              <p class="text-white/50 text-xs lg:text-sm">درگاه معتبر بانکی</p>
            </div>
            <div class="glass rounded-2xl p-5 lg:p-7 text-center card">
              <div class="text-4xl lg:text-5xl mb-3 animate-bounce" style="animation-delay: 0.3s">💬</div>
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
            ${state.categories.map((cat, i) => `
              <button 
                onclick="state.productFilter.category = '${cat.id}'; goTo('shop')"
                class="glass rounded-2xl p-5 lg:p-6 text-center card animate-fade"
                style="animation-delay: ${i * 0.08}s"
              >
                <div class="text-4xl lg:text-5xl mb-3">${cat.icon}</div>
                <h3 class="font-semibold text-xs lg:text-sm">${cat.title}</h3>
              </button>
            `).join('')}
          </div>
        </div>
      </section>
          
          ${featuredProducts.length > 0 ? `
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              ${featuredProducts.map((p, i) => renderProductCard(p, i)).join('')}
            </div>
            
            <div class="sm:hidden mt-8 text-center">
              <button onclick="goTo('shop')" class="btn-primary px-8 py-3 rounded-xl font-semibold">
                مشاهده همه محصولات
              </button>
            </div>
          ` : `
          `}
        </div>
      </section>
      
      <!-- Discount Banner -->
      ${discountedProducts.length > 0 ? `
        <section class="py-12 lg:py-16 bg-gradient-to-r from-rose-500/20 to-orange-500/20">
          <div class="max-w-7xl mx-auto px-4 lg:px-8">
            <div class="flex items-center justify-between mb-8">
              <div class="flex items-center gap-4">
                <span class="text-5xl animate-bounce">🔥</span>
                <div>
                  <h2 class="text-2xl lg:text-3xl font-black">تخفیف‌های ویژه</h2>
                  <p class="text-white/60 text-sm">فرصت را از دست ندهید!</p>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              ${discountedProducts.map((p, i) => renderProductCard(p, i)).join('')}
            </div>
          </div>
        </section>
      ` : ''}
      
      <!-- Popular Products -->
      ${popularProducts.length > 0 ? `
        <section class="py-12 lg:py-16">
          <div class="max-w-7xl mx-auto px-4 lg:px-8">
            <div class="flex items-center justify-between mb-8 lg:mb-10">
              <div class="flex items-center gap-4">
                <span class="text-4xl">⭐</span>
                <div>
                  <h2 class="text-2xl lg:text-3xl font-black">پرفروش‌ ترین‌ها</h2>
                  <p class="text-white/60 text-sm">محبوب‌ ترین محصولات</p>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              ${popularProducts.map((p, i) => renderProductCard(p, i)).join('')}
            </div>
          </div>
        </section>
      ` : ''}
      
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