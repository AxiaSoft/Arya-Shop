//═════════════════════════════════════════════════════════════════════════════════
// CHECKOUT PAGE
// File: assets/js/checkout page.js
//═════════════════════════════════════════════════════════════════════════════════
(function () {
  function renderCheckoutPage() {
    if (!state.user || state.cart.length === 0) {
      goTo('cart');
      return '';
    }

    const user = state.user;
    user.addresses = Array.isArray(user.addresses) ? user.addresses : [];

    const total = getCartTotal();
    const shipping = total >= 500000 ? 0 : 30000;
    const finalTotal = total + shipping;

    return `
      ${typeof renderHeader === 'function' ? renderHeader() : ''}

      <main class="max-w-3xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <h1 class="text-2xl lg:text-4xl font-black mb-8">تکمیل سفارش</h1>

        <form id="checkout-form" onsubmit="event.preventDefault(); handleCheckoutSubmit(${finalTotal})">
          <div class="grid gap-6">

            <!-- Customer info -->
            <div class="glass rounded-2xl p-6">
              <h2 class="font-bold text-lg mb-5 flex items-center gap-2">
                <span>👤</span> اطلاعات خریدار
              </h2>
              <div class="grid gap-4 grid-cols-1 lg:grid-cols-2">
                <div>
                  <label class="block text-sm text-white/70 mb-2">نام و نام خانوادگی *</label>
                  <input type="text" id="co-name" name="name" required minlength="3"
                    class="w-full input-style" placeholder="نام کامل"
                    value="${user.name || ''}">
                </div>
                <div>
                  <label class="block text-sm text-white/70 mb-2">شماره موبایل *</label>
                  <input type="tel" id="co-phone" name="phone" required pattern="09[0-9]{9}"
                    class="w-full input-style text-left" dir="ltr" placeholder="09123456789"
                    value="${user.phone || ''}">
                </div>
              </div>
            </div>

            <!-- Address management -->
            <div class="glass rounded-2xl p-6">
              <h2 class="font-bold text-lg mb-5 flex items-center gap-2">
                <span>📍</span> آدرس تحویل
              </h2>

              ${user.addresses.length > 0 ? `
                <div class="mb-5">
                  <div class="text-sm text-white/60 mb-2">انتخاب از آدرس‌های ذخیره‌شده:</div>
                  <div class="space-y-2">
                    ${user.addresses.map((addr, i) => `
                      <label class="flex items-center gap-3 glass rounded-xl p-3 cursor-pointer hover:bg-white/5">
                        <input type="radio" name="savedAddress" value="${i}" ${i === 0 ? 'checked' : ''}>
                        <span class="text-sm">${addr}</span>
                        <button type="button" class="ml-auto btn-ghost text-rose-400 px-2 py-1 rounded-lg"
                          onclick="removeSavedAddress(${i})">حذف</button>
                      </label>
                    `).join('')}
                  </div>
                </div>
              ` : `
                <div class="text-sm text-white/60 mb-4">هیچ آدرس ذخیره‌شده‌ای ندارید. لطفاً آدرس خود را وارد کنید.</div>
              `}

              <div class="grid gap-4">
                <div>
                  <label class="block text-sm text-white/70 mb-2">${user.addresses.length > 0 ? 'یا آدرس جدید' : 'آدرس کامل *'}</label>
                  <textarea id="co-address" name="address" ${user.addresses.length > 0 ? '' : 'required'} rows="3"
                    class="w-full input-style resize-none" placeholder="استان، شهر، خیابان، کوچه، پلاک، واحد..."></textarea>
                </div>

                <div class="flex items-center gap-3">
                  <button type="button" class="btn-ghost px-4 py-2 rounded-xl"
                    onclick="addNewAddressFromCheckout()">افزودن به آدرس‌های ذخیره‌شده</button>
                  <span class="text-xs text-white/50">حداکثر ۱۰ آدرس قابل ذخیره است</span>
                </div>
              </div>
            </div>

            <!-- Order summary -->
            <div class="glass rounded-2xl p-6">
              <h2 class="font-bold text-lg mb-5 flex items-center gap-2">
                <span>🧾</span> خلاصه سفارش
              </h2>

              <div class="space-y-3 mb-5">
                ${state.cart.map(item => `
                  <div class="flex items-center justify-between text-sm py-2 border-b border-white/5">
                    <div class="flex items-center gap-3">
                      <span class="text-xl">${item.image || '📦'}</span>
                      <span class="text-white/80">${item.title}</span>
                      <span class="text-white/40">× ${item.qty}</span>
                    </div>
                    <span>${utils.formatPrice(item.price * item.qty)}</span>
                  </div>
                `).join('')}
              </div>

              <div class="space-y-3 pt-3 border-t border-white/10">
                <div class="flex justify-between text-sm">
                  <span class="text-white/60">جمع کالاها</span>
                  <span>${utils.formatPrice(total)}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-white/60">هزینه ارسال</span>
                  <span class="${shipping === 0 ? 'text-emerald-400' : ''}">${shipping === 0 ? 'رایگان' : utils.formatPrice(shipping)}</span>
                </div>
                <div class="flex justify-between items-center pt-3 border-t border-white/10">
                  <span class="font-bold">مبلغ قابل پرداخت:</span>
                  <span class="text-2xl font-black text-emerald-400">${utils.formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>

            <!-- Submit -->
            <button type="submit" class="w-full btn-success py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3" ${state.loading ? 'disabled' : ''}>
              ${state.loading ? `<span class="animate-pulse-slow">در حال ثبت سفارش...</span>` : `<span>✓</span><span>پرداخت و ثبت سفارش</span>`}
            </button>
          </div>
        </form>
      </main>

      ${typeof renderFooter === 'function' ? renderFooter() : ''}
    `;
  }

  // Helpers for address management inside checkout
  window.removeSavedAddress = function (index) {
    if (!state.user) return;
    const arr = Array.isArray(state.user.addresses) ? state.user.addresses : [];
    if (index >= 0 && index < arr.length) {
      arr.splice(index, 1);
      toast('آدرس حذف شد');
      render();
    }
  };

  window.addNewAddressFromCheckout = function () {
    if (!state.user) return;
    const textarea = document.getElementById('co-address');
    const addr = (textarea?.value || '').trim();
    if (!addr) { toast('آدرس جدید خالی است', 'warning'); return; }
    const arr = Array.isArray(state.user.addresses) ? state.user.addresses : (state.user.addresses = []);
    if (arr.length >= 10) { toast('حداکثر ۱۰ آدرس مجاز است', 'warning'); return; }
    arr.push(addr);
    toast('✅ آدرس جدید ذخیره شد');
    render();
  };

  window.handleCheckoutSubmit = async function (amount) {
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

    const form = document.getElementById('checkout-form');
    const name = (form?.name?.value || '').trim();
    const phone = (form?.phone?.value || '').trim();
    const addressText = (form?.address?.value || '').trim();
    const savedIndexRaw = form?.savedAddress?.value;
    const hasSavedIndex = typeof savedIndexRaw !== 'undefined';

    if (name.length < 3) { toast('نام باید حداقل ۳ کاراکتر باشد', 'warning'); return; }
    if (!/^09[0-9]{9}$/.test(phone)) { toast('شماره موبایل نامعتبر است', 'warning'); return; }

    // Resolve final address: either selected saved or new textarea
    let finalAddress = '';
    if (hasSavedIndex && String(savedIndexRaw).length) {
      const idx = Number(savedIndexRaw);
      const arr = Array.isArray(state.user.addresses) ? state.user.addresses : [];
      finalAddress = arr[idx] || '';
    }
    if (!finalAddress) {
      finalAddress = addressText;
    }
    if (!finalAddress) {
      toast('آدرس تحویل را انتخاب یا وارد کنید', 'warning');
      return;
    }

    state.confirmModal = {
      type: 'payment',
      title: 'تایید پرداخت',
      message: `پرداخت مبلغ ${utils.formatPrice(amount)} انجام شود؟`,
      icon: '💳',
      confirmText: 'پرداخت',
      confirmClass: 'btn-success',
      onConfirm: async () => {
        state.confirmModal = null;
        try {
          await createOrder({
            total: amount,
            user_phone: phone,
            user_name: name,
            address: finalAddress,
            items: state.cart,
            created_at: new Date().toISOString()
          });
          state.cart = [];
          toast('✅ سفارش شما با موفقیت ثبت شد');
          goTo('orders');
          setTimeout(() => utils.scrollTop(), 0);
          render();
        } catch (err) {
          toast('❌ خطا در ثبت سفارش', 'error');
        }
      }
    };
    render();
  };

  // Expose renderer
  window.renderCheckoutPage = renderCheckoutPage;
})();