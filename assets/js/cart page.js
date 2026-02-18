//═════════════════════════════════════════════════════════════════════════════
// CART PAGE
// File: assets/js/cart page.js
//═══════════════════════════════════════════════════════════════════════════
function renderCartPage() {
  const total = getCartTotal();
  const originalTotal = getCartOriginalTotal();
  const discount = getCartDiscount();
  const FREE_SHIPPING_THRESHOLD = 500000;
  const SHIPPING_COST = total >= FREE_SHIPPING_THRESHOLD ? 0 : 30000;

  return `
    ${renderHeader()}
    <main class="max-w-4xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
      <h1 class="text-2xl lg:text-4xl font-black mb-8">سبد خرید</h1>
      
      ${state.cart.length === 0 ? `
        <div class="glass rounded-3xl p-16 text-center animate-fade">
          <div class="text-8xl mb-6 animate-float">🛒</div>
          <h2 class="text-2xl font-bold mb-3">سبد خرید شما خالی است</h2>
          <p class="text-white/60 mb-8">محصولات مورد علاقه خود را به سبد اضافه کنید</p>
          <div class="flex items-center justify-center gap-3">
            <button onclick="goTo('shop'); setTimeout(()=>utils.scrollTop(),0)" class="btn-primary px-10 py-4 rounded-2xl font-bold text-lg">
              مشاهده محصولات
            </button>
            <button onclick="goTo('home'); setTimeout(()=>utils.scrollTop(),0)" class="glass px-6 py-4 rounded-2xl font-bold text-sm">
              بازگشت به خانه
            </button>
          </div>
        </div>
      ` : `
        <div class="grid lg:grid-cols-3 gap-6">
          <!-- Cart Items -->
          <div class="lg:col-span-2 space-y-4">
            ${state.cart.map((item, i) => {
              const product = state.products.find(p => p.id === item.id) || {};
              const itemDiscountPercent = utils.calculateDiscount(item.original_price, item.price);
              const disablePlus = product && item.qty >= (product.stock || 99);

              return `
                <div class="glass rounded-2xl p-5 flex gap-4 animate-fade" style="animation-delay: ${i * 0.08}s">
                  <div class="w-20 h-20 lg:w-24 lg:h-24 bg-white/5 rounded-xl flex items-center justify-center text-4xl lg:text-5xl flex-shrink-0 overflow-hidden">
                    ${item.image || '📦'}
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-bold text-sm lg:text-base truncate mb-1">${item.title}</h3>
                    <div class="flex items-center gap-2 mb-3">
                      <span class="text-emerald-400 font-bold">${utils.formatPrice(item.price)}</span>
                      ${item.original_price && item.original_price > item.price ? `
                        <span class="text-white/40 line-through text-xs">${utils.formatPrice(item.original_price)}</span>
                      ` : ''}
                      ${itemDiscountPercent > 0 ? `<span class="badge badge-discount text-xs">${itemDiscountPercent}%</span>` : ''}
                    </div>
                    <div class="flex items-center gap-3">
                      <button onclick="updateCartQuantity('${item.id}', ${Math.max(1, item.qty - 1)})"
                        class="w-9 h-9 glass rounded-xl flex items-center justify-center hover:bg-white/10 transition-all text-lg font-bold"
                        ${item.qty <= 1 ? 'disabled' : ''}>−</button>
                      <span class="w-10 text-center font-bold text-lg">${item.qty}</span>
                      <button onclick="updateCartQuantity('${item.id}', ${item.qty + 1})"
                        class="w-9 h-9 glass rounded-xl flex items-center justify-center transition-all text-lg font-bold ${disablePlus ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}"
                        ${disablePlus ? 'disabled' : ''}>+</button>
                    </div>
                    ${product?.stock ? `<div class="mt-2 text-[11px] text-white/40">موجودی: ${product.stock} عدد</div>` : ''}
                  </div>
                  <div class="flex flex-col items-end justify-between">
                    <button onclick="removeFromCart('${item.id}')" class="p-2 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-all">🗑️</button>
                    <span class="text-white/60 text-sm font-medium">${utils.formatPrice(item.price * item.qty)}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Order Summary -->
          <div class="lg:col-span-1">
            <div class="glass rounded-2xl p-6 sticky top-28">
              <h2 class="font-bold text-lg mb-5">خلاصه سفارش</h2>
              <div class="space-y-4 mb-6">
                <div class="flex justify-between text-sm">
                  <span class="text-white/60">قیمت کالاها (${getCartCount()})</span>
                  <span>${utils.formatPrice(originalTotal)}</span>
                </div>
                ${discount > 0 ? `
                  <div class="flex justify-between text-sm">
                    <span class="text-white/60">تخفیف</span>
                    <span class="text-emerald-400">- ${utils.formatPrice(discount)}</span>
                  </div>
                ` : ''}
                <div class="flex justify-between text-sm">
                  <span class="text-white/60">هزینه ارسال</span>
                  <span class="${SHIPPING_COST === 0 ? 'text-emerald-400' : ''}">
                    ${SHIPPING_COST === 0 ? 'رایگان' : utils.formatPrice(SHIPPING_COST)}
                  </span>
                </div>
              </div>
              <div class="border-t border-white/10 pt-5 mb-6">
                <div class="flex justify-between items-center">
                  <span class="font-bold">مبلغ قابل پرداخت:</span>
                  <span class="text-2xl font-black text-emerald-400">${utils.formatPrice(total + SHIPPING_COST)}</span>
                </div>
              </div>
              ${state.user ? `
                <button onclick="startPayment(${total + SHIPPING_COST})"
                  class="w-full btn-success py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2">
                  <span>✓</span><span>ادامه فرآیند خرید</span>
                </button>
              ` : `
                <div class="text-center">
                  <p class="text-white/60 text-sm mb-4">برای ثبت سفارش وارد حساب خود شوید</p>
                  <button onclick="goTo('login'); setTimeout(()=>utils.scrollTop(),0)" class="w-full btn-primary py-4 rounded-xl font-bold">ورود / ثبت‌نام</button>
                </div>
              `}
              ${total < FREE_SHIPPING_THRESHOLD ? `
                <p class="text-center text-xs text-white/50 mt-4">🚚 ${utils.formatPrice(FREE_SHIPPING_THRESHOLD - total)} تا ارسال رایگان</p>
              ` : ''}
            </div>
          </div>
        </div>
      `}
    </main>
    ${state.page !== 'cart' && state.page !== 'login' && state.page !== 'profile' ? renderFooter() : ''}
  `;
}

// PAYMENT HANDLER (aligned with CRUD Orders)
async function startPayment(amount) {
  if (!state.user) {
    toast('ابتدا وارد حساب شوید', 'warning');
    goTo('login');
    setTimeout(() => utils.scrollTop(), 0);
    return;
  }
  if (state.cart.length === 0) {
    toast('سبد خرید خالی است', 'warning');
    return;
  }

  state.loading = true;
  render();

  try {
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Build normalized order using the unified schema
    const now = new Date().toISOString();
    const items = state.cart.map(c => ({
      id: c.id,
      title: c.title,
      price: c.price,
      qty: c.qty,
      image: c.image || ''
    }));

    const subtotal = getCartTotal();
    const shipping = amount - subtotal;

    createOrder({
      user_name: state.user.name || 'کاربر',
      user_phone: state.user.phone,
      address: (state.user.addresses && state.user.addresses[0]) || '',
      items,
      total: amount,
      status: 'processing',
      created_at: now
    });

    // Clear cart and notify
    state.cart = [];
    toast(`✅ پرداخت ${utils.formatPrice(amount)} با موفقیت انجام شد`);
    utils.pushNotification('سفارش شما ثبت شد و در حال پردازش است.', 'success');

    goTo('orders');
    setTimeout(() => utils.scrollTop(), 0);
  } catch (err) {
    toast('❌ خطا در پرداخت', 'error');
  } finally {
    state.loading = false;
    render();
  }
}