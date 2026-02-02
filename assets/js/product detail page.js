// ═══════════════════════════════════════════════════════════  ═══
// PRODUCT DETAIL PAGE
// ═══════════════════════════════════════════════════════════════
function renderProductPage() {
  const product = state.selectedProduct;
  if (!product) return renderShopPage();
  
  const inStock = (product.stock || 0) > 0;
  const discount = utils.calculateDiscount(product.original_price, product.price);
  const category = state.categories.find(c => c.id === product.category);
  
  // Related products
  const relatedProducts = state.products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  
  return `
    ${renderHeader()}
    
    <main class="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
      
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-white/60 mb-8">
        <button onclick="goTo('home')" class="hover:text-white transition-colors">  انه</button>
        <span>←</span>
        <button onclick="goTo('shop')" class="hover:text-white transition-colors">فروشگاه</button>
        ${category ? `
          <span>←</span>
          <button onclick="state.productFilter.category = '${category.id}'; goTo('shop')" class="hover:text-white transition-colors">${category.title}</button>
        ` : ''}
        <span>←</span>
        <span class="text-white truncate max-w-[150px]">${product.title}</span>
      </nav>
      
      <!-- Product Details -->
      <div class="grid lg:grid-cols-2 gap-8 lg:gap-16 mb-16">
        
        <!-- Product Image -->
        <div class="glass rounded-3xl aspect-square flex items-center justify-center text-[12rem] lg:text-[16rem] animate-fade relative overflow-hidden">
          ${product.image || '📦'}
          
          <!-- Badges -->
          <div class="absolute top-5 right-5 flex flex-col gap-2">
            ${discount > 0 ? `<span class="badge badge-discount text-sm px-4 py-2">${discount}% تخفیف</span>` : ''}
          </div>
          
          ${!inStock ? `
            <div class="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
              <span class="bg-rose-500 text-white px-8 py-3 rounded-full text-xl font-bold">ناموجود</span>
            </div>
          ` : ''}
        </div>
        
        <!-- Product Info -->
        <div class="animate-fade" style="animation-delay: 0.15s">
          
          <!-- Category -->
          ${category ? `
            <span class="inline-block bg-violet-500/20 text-violet-400 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              ${category.icon} ${category.title}
            </span>
          ` : ''}
          
          <!-- Title -->
          <h1 class="text-3xl lg:text-4xl font-black mb-4">${product.title}</h1>
          
          <!-- Rating & Sales -->
          <div class="flex items-center gap-4 mb-6">
            <div class="flex items-center gap-2">
              ${utils.renderStars(product.rating, 'text-base')}
              <span class="text-white/60 text-sm">(${(product.rating || 0).toFixed(1)})</span>
            </div>
            <span class="text-white/40">|</span>
            <span class="text-white/60 text-sm">${product.sales || 0} فروش</span>
          </div>
          
          <!-- Description -->
          <p class="text-white/70 leading-relaxed mb-8">${product.description || 'این محصول با کیفیت بالا و قیمت مناسب، بهترین ان  خاب برای شماست.'}</p>
          
          <!-- Price Box -->
          <div class="glass rounded-2xl p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
              <span class="text-white/60">قیمت:</span>
              <div class="text-left">
                <span class="text-3xl font-black text-emerald-400">${utils.formatPrice(product.price)}</span>
                ${product.original_price && product.original_price > product.price ? `
                  <span class="block text-sm price-original">${utils.formatPrice(product.original_price)}</span>
                ` : ''}
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-white/60">موجودی:</span>
              <span class="${inStock ? 'text-emerald-400' : 'text-rose-400'} font-semibold">
                ${inStock ? `${product.stock} عدد در انبار` : 'ناموجود'}
              </span>
            </div>
          </div>
          
          <!-- Add to Cart Button -->
          <button 
            onclick="addToCart(state.selectedProduct)"
            ${!inStock ? 'disabled' : ''}
            class="w-full btn-primary py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 mb-6"
          >
            <span class="text-2xl">🛒</span>
            <span>${inStock ? '  فزودن به سبد خرید' : 'ناموجود'}</span>
          </button>
          
          <!-- Features -->
          <div class="grid grid-cols-2 gap-3">
            <div class="glass rounded-xl p-4 text-center">
              <div class="text-2xl mb-2">✅</div>
              <div class="text-xs text-white/60">ضمانت اصالت کالا</div>
            </div>
            <div class="glass rounded-xl p-4 text-center">
              <div class="text-2xl mb-2">🚚</div>
              <div class="text-xs text-white/60">ارسال سریع</div>
            </div>
            <div class="glass rounded-xl p-4 text-center">
              <div class="text-2xl mb-2">↩️</div>
              <div class="text-xs text-white/60">۷ روز ضمانت بازگشت</div>
            </div>
            <div class="glass rounded-xl p-4 text-center">
              <div class="text-2xl mb-2">💳</div>
              <div class="text-xs text-white/60">پرداخت امن</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Related Products -->
      ${relatedProducts.length > 0 ? `
        <section>
          <h2 class="text-2xl font-bold mb-6">محصولات   رتبط</h2>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            ${relatedProducts.map((p, i) => renderProductCard(p, i)).join('')}
          </div>
        </section>
      ` : ''}
    </main>
    
    ${renderFooter()}
  `;
}