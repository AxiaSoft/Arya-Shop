// ═══════════════════════════════════════════════════════════════
// PRODUCT CARD COMPONENT
// ═══════════════════════════════════════════════════════════════
function renderProductCard(product, index = 0) {
  const inStock = (product.stock || 0) > 0;
  const discount = utils.calculateDiscount(product.original_price, product.price);
  const isNew = new Date() - new Date(product.created_at) < 7 * 24 * 60 * 60 * 1000;
  
  return `
    <article class="glass rounded-2xl lg:rounded-3xl overflow-hidden card animate-fade" style="animation-delay: ${index * 0.08}s">
      
      <!-- Product Image -->
      <div 
        class="product-image aspect-square flex items-center justify-center text-6xl lg:text-8xl cursor-pointer relative"
        onclick="state.selectedProduct = state.products.find(p => p.id === '${product.id}'); goTo('product')"
      >
        
        <!-- Badges -->
        <div class="absolute top-3 right-3 flex flex-col gap-2">
          ${discount > 0 ? `<span class="badge badge-discount">${discount}% تخفیف</span>` : ''}
          ${isNew ? `<span class="badge badge-new">جدید</span>` : ''}
        </div>
        
        <!-- Out of Stock Overlay -->
        ${!inStock ? `
          <div class="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
            <span class="bg-rose-500/90 text-white px-5 py-2 rounded-full text-sm font-bold">ناموجود</span>
          </div>
        ` : ''}
        
        <!-- Quick View Button -->
        <button 
          onclick="event.stopPropagation(); state.selectedProduct = state.products.find(p => p.id === '${product.id}'); goTo('product')"
          class="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 btn-ghost px-4 py-2 rounded-xl text-xs font-medium transition-all"
        >
          مشاهده سریع
        </button>
      </div>
      
      <!-- Product Info -->
      <div class="p-4 lg:p-5">
        
        <!-- Category -->
        ${product.category ? `
          <span class="text-[10px] lg:text-xs text-violet-400 font-medium mb-2 block">
            ${state.categories.find(c => c.id === product.category)?.title || product.category}
          </span>
        ` : ''}
        
        <!-- Title -->
        <h3 class="font-bold text-sm lg:text-base mb-2 line-clamp-2 min-h-[2.5rem] lg:min-h-[3rem]">
          ${product.title}
        </h3>
        
        <!-- Rating -->
        <div class="flex items-center gap-2 mb-3">
          <div class="flex">${utils.renderStars(product.rating, 'text-xs')}</div>
          <span class="text-white/40 text-xs">(${product.sales || 0})</span>
        </div>
        
        <!-- Price -->
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-base lg:text-lg font-bold text-emerald-400">${utils.formatPrice(product.price)}</span>
            ${product.original_price && product.original_price > product.price ? `
              <span class="block text-xs price-original">${utils.formatPrice(product.original_price)}</span>
            ` : ''}
          </div>
          <span class="text-xs ${inStock ? 'text-emerald-400' : 'text-rose-400'}">
            ${inStock ? `موجود: ${product.stock}` : 'ناموجود'}
          </span>
        </div>
        
        <!-- Add to Cart Button -->
        <button 
          onclick="event.stopPropagation(); addToCart(state.products.find(p => p.id === '${product.id}'))"
          ${!inStock ? 'disabled' : ''}
          class="w-full btn-primary py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
        >
          <span>🛒</span>
          <span>افزودن به سبد</span>
        </button>
      </div>
    </article>
  `;
}
